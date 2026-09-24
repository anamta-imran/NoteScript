import { NextRequest, NextResponse } from "next/server";
import {
  validateEvent,
  WebhookVerificationError,
} from "@polar-sh/sdk/webhooks";
import { SDKValidationError } from "@polar-sh/sdk/models/errors/sdkvalidationerror";
import { Subscription$inboundSchema } from "@polar-sh/sdk/models/components/subscription";
import type { Checkout } from "@polar-sh/sdk/models/components/checkout";
import type { Order } from "@polar-sh/sdk/models/components/order";
import type { Subscription } from "@polar-sh/sdk/models/components/subscription";

import { connectDb } from "@/lib/db";
import {
  isRecord,
  planAfterPolarSubscription,
  resolveNoteScriptUserId,
  resolvePlanFromOrder,
  subscriptionConfiguredIds,
} from "@/lib/polar-webhook";
import { ProcessedWebhook } from "@/models/ProcessedWebhook";
import { Invoice, Subscription as SubscriptionModel } from "@/models/Subscription";
import { User } from "@/models/User";

export const runtime = "nodejs";

type PolarWebhookEvent =
  | ReturnType<typeof validateEvent>
  | {
      type: "subscription.cycled";
      timestamp: Date;
      data: Subscription;
    };

class WebhookRetryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WebhookRetryError";
  }
}

function webhookHeaders(req: NextRequest) {
  return {
    "webhook-id": req.headers.get("webhook-id") ?? "",
    "webhook-timestamp": req.headers.get("webhook-timestamp") ?? "",
    "webhook-signature": req.headers.get("webhook-signature") ?? "",
  };
}

/**
 * Official SDK validateEvent does not yet parse subscription.cycled (as of @polar-sh/sdk 0.49).
 * After signature verification fails parse, recover cycled events using Subscription inbound schema.
 */
function parsePolarEvent(rawBody: string, headers: Record<string, string>, secret: string): PolarWebhookEvent {
  try {
    return validateEvent(rawBody, headers, secret);
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      throw error;
    }

    if (error instanceof SDKValidationError && isRecord(error.rawValue)) {
      const raw = error.rawValue;
      if (raw.type === "subscription.cycled" && "data" in raw) {
        const data = Subscription$inboundSchema.parse(raw.data);
        const timestamp =
          typeof raw.timestamp === "string" || raw.timestamp instanceof Date
            ? new Date(raw.timestamp as string | Date)
            : new Date();
        return {
          type: "subscription.cycled",
          timestamp: Number.isNaN(timestamp.getTime()) ? new Date() : timestamp,
          data,
        };
      }
    }

    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.POLAR_WEBHOOK_SECRET;

    if (!secret) {
      return NextResponse.json(
        { error: "Polar webhook secret is not configured." },
        { status: 503 },
      );
    }

    const headers = webhookHeaders(req);
    if (!headers["webhook-id"] || !headers["webhook-signature"]) {
      return NextResponse.json(
        { error: "Missing Polar webhook signature headers." },
        { status: 400 },
      );
    }

    const rawBody = await req.text();
    const event = parsePolarEvent(rawBody, headers, secret);

    await connectDb();

    const already = await ProcessedWebhook.findOne({
      eventId: headers["webhook-id"],
      provider: "polar",
    });
    if (already) {
      return NextResponse.json({ ok: true, duplicate: true });
    }

    console.log(`[Polar webhook] ${event.type} ${headers["webhook-id"]}`);

    switch (event.type) {
      case "checkout.created":
      case "checkout.updated":
      case "checkout.expired":
        // Never grant paid access from checkout lifecycle alone.
        await handleCheckoutEvent(event.data);
        break;

      case "subscription.created":
      case "subscription.active":
      case "subscription.updated":
      case "subscription.cycled":
      case "subscription.canceled":
      case "subscription.uncanceled":
      case "subscription.past_due":
      case "subscription.revoked":
        await syncSubscription(event.data, event.type);
        break;

      case "order.created":
        await handleOrderCreated(event.data);
        break;

      case "order.paid":
      case "order.updated":
        await syncOrder(event.data, event.type);
        break;

      case "order.refunded":
        await handleOrderRefunded(event.data);
        break;

      default:
        // Verified but not entitlement-related for NoteScript.
        break;
    }

    try {
      await ProcessedWebhook.create({
        provider: "polar",
        eventId: headers["webhook-id"],
        eventType: event.type,
        processedAt: new Date(),
      });
    } catch (error) {
      // Concurrent duplicate delivery — treat as success.
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === 11000
      ) {
        return NextResponse.json({ ok: true, duplicate: true });
      }
      throw error;
    }

    return NextResponse.json({ ok: true, received: true });
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      return NextResponse.json(
        { error: "Invalid Polar webhook signature." },
        { status: 403 },
      );
    }

    console.error("[Polar webhook] Error:", error);

    if (error instanceof WebhookRetryError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 500 },
    );
  }
}

async function findUserForPolar(input: {
  metadata?: Record<string, string | number | boolean> | null;
  customerMetadata?: Record<string, string | number | boolean> | null;
  customer?: {
    id?: string;
    externalId?: string | null;
    metadata?: Record<string, string | number | boolean> | null;
  } | null;
  externalCustomerId?: string | null;
  customerId?: string | null;
}) {
  const userId = resolveNoteScriptUserId(input);

  let user = userId ? await User.findById(userId) : null;

  if (!user && input.customerId) {
    user = await User.findOne({ polarCustomerId: input.customerId });
  }

  if (!user && input.customer?.id) {
    user = await User.findOne({ polarCustomerId: input.customer.id });
  }

  return user;
}

async function handleCheckoutEvent(checkout: Checkout) {
  const user = await findUserForPolar({
    metadata: checkout.metadata,
    customerMetadata: checkout.customerMetadata,
    externalCustomerId: checkout.externalCustomerId,
    customerId: checkout.customerId,
  });

  if (user && checkout.customerId) {
    await User.updateOne(
      { _id: user._id },
      {
        polarCustomerId: checkout.customerId,
        billingProvider: "polar",
      },
    );
  }
}

async function syncSubscription(
  subscription: Subscription,
  eventType: string,
) {
  const user = await findUserForPolar({
    metadata: subscription.metadata,
    customer: subscription.customer,
    customerId: subscription.customerId,
  });

  if (!user) {
    console.error(
      "[Polar webhook] User not found for subscription:",
      subscription.id,
      "externalId=",
      subscription.customer?.externalId || "(missing)",
      "metadata.userId=",
      subscription.metadata?.userId ?? "(missing)",
    );
    throw new WebhookRetryError(
      "User not found for subscription webhook; will retry.",
    );
  }

  const priceId = subscriptionConfiguredIds(subscription)[0];
  const status = subscription.status;

  // subscription.created may arrive before the first payment succeeds.
  // Attach Polar IDs only; do not grant or revoke paid access until a paid status event.
  if (
    eventType === "subscription.created" &&
    status !== "active" &&
    status !== "trialing" &&
    status !== "past_due"
  ) {
    await User.updateOne(
      { _id: user._id },
      {
        billingProvider: "polar",
        polarCustomerId: subscription.customerId,
        polarSubscriptionId: subscription.id,
      },
    );

    await SubscriptionModel.updateOne(
      { polarSubscriptionId: subscription.id },
      {
        userId: user._id,
        billingProvider: "polar",
        polarCustomerId: subscription.customerId,
        polarSubscriptionId: subscription.id,
        planId: user.planId || "free",
        billingCycle: user.billingCycle || "monthly",
        status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        priceId,
      },
      { upsert: true },
    );

    console.log(
      `[Polar webhook] User ${user._id} linked incomplete subscription ${subscription.id} (${status})`,
    );
    return;
  }

  const { planId, billingCycle } = planAfterPolarSubscription(subscription);

  if (
    (status === "active" || status === "trialing" || status === "past_due") &&
    planId === "free"
  ) {
    console.error(
      "[Polar webhook] Active subscription could not resolve a paid plan.",
      "subscription=",
      subscription.id,
      "productId=",
      subscription.productId,
      "event=",
      eventType,
    );
  }

  await User.updateOne(
    { _id: user._id },
    {
      billingProvider: "polar",
      polarCustomerId: subscription.customerId,
      polarSubscriptionId: subscription.id,
      planId,
      billingCycle,
      subscriptionStatus: status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    },
  );

  await SubscriptionModel.updateOne(
    { polarSubscriptionId: subscription.id },
    {
      userId: user._id,
      billingProvider: "polar",
      polarCustomerId: subscription.customerId,
      polarSubscriptionId: subscription.id,
      planId,
      billingCycle,
      status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      priceId,
    },
    { upsert: true },
  );

  console.log(
    `[Polar webhook] User ${user._id} synced: ${planId}/${billingCycle} (${status}) via ${eventType}`,
  );
}

async function handleOrderCreated(order: Order) {
  // Persist invoice draft if we can resolve the user; never activate from order.created alone.
  const user = await findUserForPolar({
    metadata: order.metadata,
    customer: order.customer,
    customerId: order.customerId,
  });

  if (!user) {
    return;
  }

  await Invoice.updateOne(
    { polarOrderId: order.id },
    {
      userId: user._id,
      polarOrderId: order.id,
      amountPaid: order.paid ? order.totalAmount / 100 : 0,
      currency: order.currency || "USD",
      status: order.status,
      description: order.description || "NoteScript order",
    },
    { upsert: true },
  );
}

async function syncOrder(order: Order, eventType: "order.paid" | "order.updated") {
  const user = await findUserForPolar({
    metadata: order.metadata,
    customer: order.customer,
    customerId: order.customerId,
  });

  if (!user) {
    // Only hard-retry when payment succeeded and we must grant access.
    if (eventType === "order.paid" || order.paid) {
      console.error(
        "[Polar webhook] User not found for paid order:",
        order.id,
        "externalId=",
        order.customer?.externalId || "(missing)",
      );
      throw new WebhookRetryError(
        "User not found for order webhook; will retry.",
      );
    }
    return;
  }

  await Invoice.updateOne(
    { polarOrderId: order.id },
    {
      userId: user._id,
      polarOrderId: order.id,
      amountPaid: order.totalAmount / 100,
      currency: order.currency || "USD",
      status: order.status,
      description: order.description || "NoteScript order",
    },
    { upsert: true },
  );

  // Paid entitlement only from a trusted paid order (or updated event that is paid).
  if (!(eventType === "order.paid" || order.paid)) {
    return;
  }

  const { planId, billingCycle } = resolvePlanFromOrder(order);

  if (planId !== "student" && planId !== "pro") {
    console.error(
      "[Polar webhook] Paid order could not resolve planId.",
      "order=",
      order.id,
      "productId=",
      order.productId || "(missing)",
    );
    return;
  }

  const subscriptionId = order.subscriptionId || order.subscription?.id;

  await User.updateOne(
    { _id: user._id },
    {
      billingProvider: "polar",
      polarCustomerId: order.customerId,
      ...(subscriptionId ? { polarSubscriptionId: subscriptionId } : {}),
      planId,
      billingCycle,
      subscriptionStatus: order.subscription?.status || "active",
      cancelAtPeriodEnd: order.subscription?.cancelAtPeriodEnd ?? false,
      ...(order.subscription?.currentPeriodEnd
        ? { currentPeriodEnd: order.subscription.currentPeriodEnd }
        : {}),
    },
  );

  if (subscriptionId) {
    await SubscriptionModel.updateOne(
      { polarSubscriptionId: subscriptionId },
      {
        userId: user._id,
        billingProvider: "polar",
        polarCustomerId: order.customerId,
        polarSubscriptionId: subscriptionId,
        planId,
        billingCycle,
        status: order.subscription?.status || "active",
        cancelAtPeriodEnd: order.subscription?.cancelAtPeriodEnd ?? false,
        currentPeriodEnd: order.subscription?.currentPeriodEnd,
        priceId: order.productId || undefined,
      },
      { upsert: true },
    );
  }

  console.log(
    `[Polar webhook] User ${user._id} upgraded from ${eventType}: ${planId}/${billingCycle}`,
  );
}

async function handleOrderRefunded(order: Order) {
  const user = await findUserForPolar({
    metadata: order.metadata,
    customer: order.customer,
    customerId: order.customerId,
  });

  if (!user) {
    return;
  }

  await Invoice.updateOne(
    { polarOrderId: order.id },
    {
      userId: user._id,
      polarOrderId: order.id,
      amountPaid: Math.max(0, (order.totalAmount - order.refundedAmount) / 100),
      currency: order.currency || "USD",
      status: order.status,
      description: order.description || "NoteScript refunded order",
    },
    { upsert: true },
  );

  // Full refund without an active subscription → revoke paid access.
  const fullyRefunded =
    order.refundedAmount >= order.totalAmount && order.totalAmount > 0;
  const subscriptionActive =
    order.subscription &&
    (order.subscription.status === "active" ||
      order.subscription.status === "trialing" ||
      order.subscription.status === "past_due");

  if (fullyRefunded && !subscriptionActive) {
    await User.updateOne(
      { _id: user._id },
      {
        planId: "free",
        subscriptionStatus: "canceled",
        cancelAtPeriodEnd: false,
      },
    );
  }
}
