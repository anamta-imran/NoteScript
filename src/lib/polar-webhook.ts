import type { Checkout } from "@polar-sh/sdk/models/components/checkout";
import type { Order } from "@polar-sh/sdk/models/components/order";
import type { Subscription } from "@polar-sh/sdk/models/components/subscription";
import type { MetadataOutputType } from "@polar-sh/sdk/models/components/metadataoutputtype";

import {
  polarPriceIdEnv,
  resolvePlanFromConfiguredPriceId,
} from "@/lib/plans";
import type { BillingCycle, PlanId } from "@/lib/types";

/** Polar subscription statuses that should keep paid NoteScript access. */
export const POLAR_PAID_ACCESS_STATUSES = new Set([
  "active",
  "trialing",
  "past_due",
]);

type MetadataBag = Record<string, MetadataOutputType> | null | undefined;

function metadataString(
  metadata: MetadataBag,
  key: string,
): string | undefined {
  if (!metadata) return undefined;
  const value = metadata[key];
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return undefined;
}

function metadataPlanId(metadata: MetadataBag): Exclude<PlanId, "free"> | null {
  const value = metadataString(metadata, "planId");
  if (value === "student" || value === "pro") return value;
  return null;
}

function metadataBillingCycle(metadata: MetadataBag): BillingCycle | null {
  const value = metadataString(metadata, "billingCycle");
  if (value === "monthly" || value === "annual") return value;
  return null;
}

/**
 * Candidate Polar price/product IDs from a subscription, matched against POLAR_PRICE_* env.
 * Prefer price IDs; also try productId (Polar checkout often uses product IDs).
 */
export function subscriptionConfiguredIds(
  subscription: Pick<Subscription, "productId" | "prices">,
): string[] {
  const ids: string[] = [];

  for (const price of subscription.prices || []) {
    if (price?.id) ids.push(price.id);
  }

  if (subscription.productId) ids.push(subscription.productId);

  return ids;
}

export function orderConfiguredIds(
  order: Pick<Order, "productId" | "product">,
): string[] {
  const ids: string[] = [];
  if (order.productId) ids.push(order.productId);
  if (order.product?.id) ids.push(order.product.id);
  return ids;
}

export function checkoutConfiguredIds(
  checkout: Pick<Checkout, "productId" | "productPriceId" | "product">,
): string[] {
  const ids: string[] = [];
  if (checkout.productPriceId) ids.push(checkout.productPriceId);
  if (checkout.productId) ids.push(checkout.productId);
  if (checkout.product?.id) ids.push(checkout.product.id);
  return ids;
}

export function resolvePlanFromPolarIds(
  ids: string[],
  lookup: (plan: PlanId, cycle: BillingCycle) => string = polarPriceIdEnv,
): { planId: Exclude<PlanId, "free">; billingCycle: BillingCycle } | null {
  for (const id of ids) {
    const resolved = resolvePlanFromConfiguredPriceId(id, lookup);
    if (resolved) return resolved;
  }
  return null;
}

export function resolvePlanFromSubscription(
  subscription: Subscription,
  lookup: (plan: PlanId, cycle: BillingCycle) => string = polarPriceIdEnv,
): { planId: PlanId; billingCycle: BillingCycle } {
  const fromMeta =
    metadataPlanId(subscription.metadata) ||
    metadataPlanId(subscription.customer?.metadata);

  const fromIds = resolvePlanFromPolarIds(
    subscriptionConfiguredIds(subscription),
    lookup,
  );

  let billingCycle: BillingCycle =
    metadataBillingCycle(subscription.metadata) ||
    metadataBillingCycle(subscription.customer?.metadata) ||
    fromIds?.billingCycle ||
    "monthly";

  if (!metadataBillingCycle(subscription.metadata) && !fromIds) {
    if (subscription.recurringInterval === "year") billingCycle = "annual";
    else if (subscription.recurringInterval === "month") billingCycle = "monthly";
  }

  const planId: PlanId = fromMeta || fromIds?.planId || "free";
  return { planId, billingCycle };
}

export function planAfterPolarSubscription(
  subscription: Subscription,
  lookup: (plan: PlanId, cycle: BillingCycle) => string = polarPriceIdEnv,
): { planId: PlanId; billingCycle: BillingCycle } {
  const { planId, billingCycle } = resolvePlanFromSubscription(
    subscription,
    lookup,
  );
  const status = subscription.status;

  if (planId !== "free" && POLAR_PAID_ACCESS_STATUSES.has(status)) {
    return { planId, billingCycle };
  }

  if (!POLAR_PAID_ACCESS_STATUSES.has(status)) {
    return { planId: "free", billingCycle };
  }

  return { planId: "free", billingCycle };
}

export function resolvePlanFromOrder(
  order: Order,
  lookup: (plan: PlanId, cycle: BillingCycle) => string = polarPriceIdEnv,
): { planId: PlanId; billingCycle: BillingCycle } {
  const fromMeta =
    metadataPlanId(order.metadata) ||
    metadataPlanId(order.customer?.metadata) ||
    (order.subscription
      ? metadataPlanId(order.subscription.metadata)
      : null);

  const fromIds = resolvePlanFromPolarIds(orderConfiguredIds(order), lookup);

  const billingCycle =
    metadataBillingCycle(order.metadata) ||
    metadataBillingCycle(order.customer?.metadata) ||
    (order.subscription
      ? metadataBillingCycle(order.subscription.metadata)
      : null) ||
    fromIds?.billingCycle ||
    (order.subscription?.recurringInterval === "year"
      ? "annual"
      : order.subscription?.recurringInterval === "month"
        ? "monthly"
        : "monthly");

  const planId: PlanId = fromMeta || fromIds?.planId || "free";
  return { planId, billingCycle };
}

/**
 * Trusted NoteScript user id from Polar customer.externalId or metadata.userId.
 * Checkout sessions may also carry metadata.userId / externalCustomerId.
 */
export function resolveNoteScriptUserId(input: {
  metadata?: MetadataBag;
  customerMetadata?: Record<string, string | number | boolean> | null;
  customer?: {
    externalId?: string | null;
    metadata?: MetadataBag;
  } | null;
  externalCustomerId?: string | null;
}): string | undefined {
  const fromExternal =
    (typeof input.externalCustomerId === "string" &&
      input.externalCustomerId.trim()) ||
    (typeof input.customer?.externalId === "string" &&
      input.customer.externalId.trim()) ||
    undefined;

  if (fromExternal) return fromExternal;

  const fromMeta =
    metadataString(input.metadata, "userId") ||
    metadataString(input.customer?.metadata, "userId");

  if (fromMeta) return fromMeta;

  const customerMeta = input.customerMetadata;
  if (customerMeta && typeof customerMeta.userId === "string") {
    const value = customerMeta.userId.trim();
    if (value) return value;
  }

  return undefined;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
