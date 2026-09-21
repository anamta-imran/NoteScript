import { createHmac, timingSafeEqual } from "crypto";
import type { BillingCycle, PlanId } from "@/lib/types";
import { priceIdEnv } from "@/lib/plans";

export type PaddleWebhookData = {
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

/** Active subscription statuses that should unlock paid access. */
export const PAID_ACCESS_STATUSES = new Set(["active", "trialing", "past_due"]);

export function verifyPaddleSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): boolean {
  const parts = signatureHeader.split(";");

  const timestamp = parts.find((part) => part.startsWith("ts="))?.slice(3);

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

  if (Math.abs(nowSeconds - timestampNumber) > 300) {
    return false;
  }

  const signedPayload = `${timestamp}:${rawBody}`;
  const expectedSignature = createHmac("sha256", secret)
    .update(signedPayload, "utf8")
    .digest("hex");

  return signatures.some((signature) => {
    const expected = Buffer.from(expectedSignature, "utf8");
    const received = Buffer.from(signature, "utf8");
    if (expected.length !== received.length) return false;
    return timingSafeEqual(expected, received);
  });
}

export function firstPriceId(data: PaddleWebhookData): string | undefined {
  return data.items?.map((item) => item.price?.id).find((id): id is string => Boolean(id));
}

/**
 * Map a Paddle price ID to NoteScript plan + cycle using server env configuration.
 * Reliable fallback when subscription webhooks omit custom_data.
 */
export function resolvePlanFromPriceId(
  priceId: string | undefined,
  lookup: (plan: PlanId, cycle: BillingCycle) => string = priceIdEnv,
): { planId: Exclude<PlanId, "free">; billingCycle: BillingCycle } | null {
  if (!priceId) return null;

  const combinations: Array<{ planId: Exclude<PlanId, "free">; billingCycle: BillingCycle }> = [
    { planId: "student", billingCycle: "monthly" },
    { planId: "student", billingCycle: "annual" },
    { planId: "pro", billingCycle: "monthly" },
    { planId: "pro", billingCycle: "annual" },
  ];

  for (const combo of combinations) {
    if (lookup(combo.planId, combo.billingCycle) === priceId) {
      return combo;
    }
  }
  return null;
}

export function resolvePlanId(
  data: PaddleWebhookData,
  lookup: (plan: PlanId, cycle: BillingCycle) => string = priceIdEnv,
): PlanId {
  const fromCustom = data.custom_data?.planId;
  if (fromCustom === "student" || fromCustom === "pro") {
    return fromCustom;
  }

  const fromPrice = resolvePlanFromPriceId(firstPriceId(data), lookup);
  if (fromPrice) return fromPrice.planId;

  return "free";
}

export function resolveBillingCycle(
  data: PaddleWebhookData,
  lookup: (plan: PlanId, cycle: BillingCycle) => string = priceIdEnv,
): BillingCycle {
  if (data.custom_data?.billingCycle === "annual" || data.custom_data?.billingCycle === "monthly") {
    return data.custom_data.billingCycle;
  }

  if (data.billing_cycle?.interval === "year") return "annual";
  if (data.billing_cycle?.interval === "month") return "monthly";

  const fromPrice = resolvePlanFromPriceId(firstPriceId(data), lookup);
  if (fromPrice) return fromPrice.billingCycle;

  return "monthly";
}

/**
 * Decide the NoteScript plan stored after a subscription event.
 * Paid plan comes from custom_data.planId or the configured Paddle price ID —
 * never from guessing, and never Free while an active paid price is present.
 */
export function planAfterSubscriptionEvent(
  data: PaddleWebhookData,
  status = data.status || "active",
  lookup: (plan: PlanId, cycle: BillingCycle) => string = priceIdEnv,
): { planId: PlanId; billingCycle: BillingCycle } {
  const planId = resolvePlanId(data, lookup);
  const billingCycle = resolveBillingCycle(data, lookup);

  if (planId !== "free" && PAID_ACCESS_STATUSES.has(status)) {
    return { planId, billingCycle };
  }

  // Canceled / inactive subscriptions lose access.
  if (!PAID_ACCESS_STATUSES.has(status)) {
    return { planId: "free", billingCycle };
  }

  return { planId: "free", billingCycle };
}

export function getPeriodEnd(data: PaddleWebhookData): Date | undefined {
  const value = data.current_billing_period?.ends_at;
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function getCancelAtPeriodEnd(data: PaddleWebhookData): boolean {
  return (
    data.scheduled_change?.action === "cancel" &&
    Boolean(data.scheduled_change.effective_at)
  );
}
