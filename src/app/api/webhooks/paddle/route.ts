import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

import { connectDb } from "@/lib/db";
import { User } from "@/models/User";
import { Subscription, Invoice } from "@/models/Subscription";
import { ProcessedWebhook } from "@/models/ProcessedWebhook";

export const runtime = "nodejs";

type PaddleWebhook = {
  event_id: string;
  event_type: string;
  occurred_at: string;
  notification_id: string;
  data: {
    id: string;
    status?: string;
    customer_id?: string;
    subscription_id?: string;
    custom_data?: {
      userId?: string;
      planId?: string;
      billingCycle?: string;
    } | null;
    billing_cycle?: {
      interval?: string;
      frequency?: number;
    } | null;
    current_billing_period?: {
      starts_at?: string;
      ends_at?: string;
    } | null;
    scheduled_change?: {
      action?: string;
      effective_at?: string;
    } | null;
    items?: Array<{
      price?: {
        id?: string;
      };
    }>;
    details?: {
      totals?: {
        total?: string;
        currency_code?: string;
      };
    } | null;
    checkout?: {
      url?: string;
    } | null;
    invoice_id?: string;
  };
};

function verifyPaddleSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string,
): boolean {
  const parts = signatureHeader.split(";");

  const timestamp = parts
    .find((part) => part.startsWith("ts="))
    ?.slice(3);

  const signatures = parts
    .filter((part) => part.startsWith("h1="))
    .map((part) => part.slice(3));

  if (!timestamp || signatures.length === 0) {
    return false;
  }

  const timestampNumber = Number(timestamp);

  if (!Number.isFinite(timestampNumber)) {
    return false;
  }

  const currentTimestamp = Math.floor(Date.now() / 1000);

  if (Math.abs(currentTimestamp - timestampNumber) > 300) {
    return false;
  }

  const signedPayload = `${timestamp}:${rawBody}`;

  const expectedSignature = createHmac("sha256", secret)
    .update(signedPayload, "utf8")
    .digest("hex");

  return signatures.some((signature) => {
    const expected = Buffer.from(expectedSignature, "utf8");
    const received = Buffer.from(signature, "utf8");

    if (expected.length !== received.length) {
      return false;
    }

    return timingSafeEqual(expected, received);
  });
}

function getPlanId(
  data: PaddleWebhook["data"],
): "free" | "student" | "pro" {
  const planId = data.custom_data?.planId;

  if (planId === "student" || planId === "pro") {
    return planId;
  }

  return "free";
}

function getBillingCycle(
  data: PaddleWebhook["data"],
): "monthly" | "annual" {
  if (
    data.billing_cycle?.interval === "year" ||
    data.custom_data?.billingCycle === "annual"
  ) {
    return "annual";
  }

  return "monthly";
}

function getPeriodEnd(data: PaddleWebhook["data"]): Date | undefined {
  const value = data.current_billing_period?.ends_at;

  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date;
}

function getCancelAtPeriodEnd(data: PaddleWebhook["data"]): boolean {
  return (
    data.scheduled_change?.action === "cancel" &&
    Boolean(data.scheduled_change.effective_at)
  );
}

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.PADDLE_WEBHOOK_SECRET;

    if (!secret) {
      return NextResponse.json(
        { error: "Paddle webhook secret is not configured." },
        { status: 503 },
      );
    }

    const signature = req.headers.get("Paddle-Signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing Paddle-Signature header." },
        { status: 400 },
      );
    }

    const rawBody = await req.text();

    if (
      !verifyPaddleSignature(
        rawBody,
        signature,
        secret,
      )
    ) {
      return NextResponse.json(
        { error: "Invalid Paddle webhook signature." },
        { status: 401 },
      );
    }

    const event = JSON.parse(rawBody) as PaddleWebhook;

    await connectDb();

    const already = await ProcessedWebhook.findOne({ eventId: event.event_id });
    if (already) {
      return NextResponse.json({ ok: true, duplicate: true });
    }

    console.log(
      `[Paddle webhook] ${event.event_type} ${event.event_id}`,
    );

    if (
      event.event_type === "subscription.created" ||
      event.event_type === "subscription.updated" ||
      event.event_type === "subscription.canceled" ||
      event.event_type === "subscription.activated"
    ) {
      await syncSubscription(event);
    }

    if (
      event.event_type === "transaction.completed" ||
      event.event_type === "transaction.paid"
    ) {
      await syncTransaction(event);
    }

    await ProcessedWebhook.create({
      eventId: event.event_id,
      eventType: event.event_type,
      processedAt: new Date(),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Paddle webhook] Error:", error);

    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 500 },
    );
  }
}

async function syncSubscription(event: PaddleWebhook) {
  const data = event.data;

  const userId = data.custom_data?.userId;

  let user = userId
    ? await User.findById(userId)
    : null;

  if (!user && data.customer_id) {
    user = await User.findOne({
      paddleCustomerId: data.customer_id,
    });
  }

  if (!user) {
    console.error(
      "[Paddle webhook] User not found for subscription:",
      data.id,
    );

    return;
  }

  const planId = getPlanId(data);
  const billingCycle = getBillingCycle(data);
  const status = data.status || "active";

  const activeStatuses = [
    "active",
    "trialing",
    "past_due",
  ];

  const hasAccess =
    planId !== "free" &&
    activeStatuses.includes(status);

  const effectivePlan = hasAccess ? planId : "free";

  const periodEnd = getPeriodEnd(data);
  const cancelAtPeriodEnd = getCancelAtPeriodEnd(data);

  await User.updateOne(
    { _id: user._id },
    {
      paddleCustomerId: data.customer_id,
      paddleSubscriptionId: data.id,
      planId: effectivePlan,
      billingCycle,
      subscriptionStatus: status,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd,
    },
  );

  await Subscription.updateOne(
    {
      paddleSubscriptionId: data.id,
    },
    {
      userId: user._id,
      paddleCustomerId: data.customer_id,
      paddleSubscriptionId: data.id,
      planId: effectivePlan,
      billingCycle,
      status,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd,
      priceId: data.items?.[0]?.price?.id,
    },
    {
      upsert: true,
    },
  );

  console.log(
    `[Paddle webhook] User ${user._id} synced: ${effectivePlan} (${status})`,
  );
}

async function syncTransaction(event: PaddleWebhook) {
  const data = event.data;
  const userId = data.custom_data?.userId;

  let user = userId ? await User.findById(userId) : null;
  if (!user && data.customer_id) {
    user = await User.findOne({ paddleCustomerId: data.customer_id });
  }
  if (!user) {
    console.error("[Paddle webhook] User not found for transaction:", data.id);
    return;
  }

  const totalCents = Number(data.details?.totals?.total || 0);
  const amountPaid = Number.isFinite(totalCents) ? totalCents / 100 : 0;
  const planId = getPlanId(data);

  await Invoice.updateOne(
    { paddleTransactionId: data.id },
    {
      userId: user._id,
      paddleTransactionId: data.id,
      amountPaid,
      currency: data.details?.totals?.currency_code || "USD",
      status: data.status || "completed",
      hostedInvoiceUrl: data.checkout?.url,
      description: `${planId === "free" ? "NoteScript" : planId} payment`,
    },
    { upsert: true },
  );
}