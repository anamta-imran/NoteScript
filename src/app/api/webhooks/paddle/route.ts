import { NextRequest, NextResponse } from "next/server";

import { connectDb } from "@/lib/db";
import { User } from "@/models/User";
import { Subscription, Invoice } from "@/models/Subscription";
import { ProcessedWebhook } from "@/models/ProcessedWebhook";
import {
  firstPriceId,
  getCancelAtPeriodEnd,
  getPeriodEnd,
  planAfterSubscriptionEvent,
  resolveBillingCycle,
  resolvePlanId,
  verifyPaddleSignature,
  type PaddleWebhookData,
} from "@/lib/paddle-webhook";

export const runtime = "nodejs";

type PaddleWebhook = {
  event_id: string;
  event_type: string;
  occurred_at: string;
  notification_id: string;
  data: PaddleWebhookData;
};

class WebhookRetryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WebhookRetryError";
  }
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

    if (!verifyPaddleSignature(rawBody, signature, secret)) {
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

    console.log(`[Paddle webhook] ${event.event_type} ${event.event_id}`);

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

    // Tell Paddle to retry when we could not apply the paid plan yet
    // (e.g. user not found). Do not mark the event processed in that case.
    if (error instanceof WebhookRetryError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 500 },
    );
  }
}

async function findUserForPaddleData(data: PaddleWebhookData) {
  const userId = data.custom_data?.userId;

  let user = userId ? await User.findById(userId) : null;

  if (!user && data.customer_id) {
    user = await User.findOne({
      paddleCustomerId: data.customer_id,
    });
  }

  return user;
}

async function syncSubscription(event: PaddleWebhook) {
  const data = event.data;
  const user = await findUserForPaddleData(data);

  if (!user) {
    console.error(
      "[Paddle webhook] User not found for subscription:",
      data.id,
      "custom_data.userId=",
      data.custom_data?.userId || "(missing)",
      "customer_id=",
      data.customer_id || "(missing)",
    );
    throw new WebhookRetryError(
      "User not found for subscription webhook; will retry.",
    );
  }

  const status = data.status || "active";
  const { planId, billingCycle } = planAfterSubscriptionEvent(data, status);
  const priceId = firstPriceId(data);

  if (
    (status === "active" || status === "trialing" || status === "past_due") &&
    planId === "free"
  ) {
    console.error(
      "[Paddle webhook] Active subscription could not resolve a paid plan.",
      "subscription=",
      data.id,
      "priceId=",
      priceId || "(missing)",
      "custom_data=",
      data.custom_data || null,
    );
  }

  const periodEnd = getPeriodEnd(data);
  const cancelAtPeriodEnd = getCancelAtPeriodEnd(data);

  await User.updateOne(
    { _id: user._id },
    {
      paddleCustomerId: data.customer_id,
      paddleSubscriptionId: data.id,
      planId,
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
      planId,
      billingCycle,
      status,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd,
      priceId,
    },
    {
      upsert: true,
    },
  );

  console.log(
    `[Paddle webhook] User ${user._id} synced: ${planId}/${billingCycle} (${status})`,
  );
}

async function syncTransaction(event: PaddleWebhook) {
  const data = event.data;
  const user = await findUserForPaddleData(data);

  if (!user) {
    console.error(
      "[Paddle webhook] User not found for transaction:",
      data.id,
      "custom_data.userId=",
      data.custom_data?.userId || "(missing)",
      "customer_id=",
      data.customer_id || "(missing)",
    );
    throw new WebhookRetryError(
      "User not found for transaction webhook; will retry.",
    );
  }

  const totalCents = Number(data.details?.totals?.total || 0);
  const amountPaid = Number.isFinite(totalCents) ? totalCents / 100 : 0;
  const planId = resolvePlanId(data);
  const billingCycle = resolveBillingCycle(data);
  const priceId = firstPriceId(data);
  const subscriptionId = data.subscription_id;

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

  // Successful paid transactions must also upgrade the user when we can resolve
  // the plan (custom_data and/or configured price ID). Previously only invoices
  // were written here, so a missing/late subscription.custom_data left users Free.
  if (planId === "student" || planId === "pro") {
    await User.updateOne(
      { _id: user._id },
      {
        ...(data.customer_id ? { paddleCustomerId: data.customer_id } : {}),
        ...(subscriptionId ? { paddleSubscriptionId: subscriptionId } : {}),
        planId,
        billingCycle,
        subscriptionStatus: "active",
        cancelAtPeriodEnd: false,
      },
    );

    if (subscriptionId && data.customer_id) {
      await Subscription.updateOne(
        { paddleSubscriptionId: subscriptionId },
        {
          userId: user._id,
          paddleCustomerId: data.customer_id,
          paddleSubscriptionId: subscriptionId,
          planId,
          billingCycle,
          status: "active",
          cancelAtPeriodEnd: false,
          priceId,
        },
        { upsert: true },
      );
    }

    console.log(
      `[Paddle webhook] User ${user._id} upgraded from transaction: ${planId}/${billingCycle}`,
    );
  } else {
    console.error(
      "[Paddle webhook] Paid transaction could not resolve planId.",
      "transaction=",
      data.id,
      "priceId=",
      priceId || "(missing)",
      "custom_data=",
      data.custom_data || null,
    );
  }
}
