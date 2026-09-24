import { describe, expect, it } from "vitest";
import type { BillingCycle, PlanId } from "@/lib/types";
import {
  planAfterPolarSubscription,
  resolveNoteScriptUserId,
  resolvePlanFromPolarIds,
  resolvePlanFromSubscription,
} from "@/lib/polar-webhook";
import type { Subscription } from "@polar-sh/sdk/models/components/subscription";

const PRICE = {
  student_monthly: "polar_price_student_monthly",
  student_annual: "polar_price_student_annual",
  pro_monthly: "polar_price_pro_monthly",
  pro_annual: "polar_price_pro_annual",
} as const;

function lookup(plan: PlanId, cycle: BillingCycle) {
  return PRICE[`${plan}_${cycle}` as keyof typeof PRICE] || "";
}

function baseSubscription(
  partial: Partial<Subscription> &
    Pick<Subscription, "status" | "productId" | "prices">,
): Subscription {
  return {
    createdAt: new Date(),
    modifiedAt: null,
    id: "sub_test",
    amount: 1499,
    currency: "usd",
    recurringInterval: "month",
    recurringIntervalCount: 1,
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    currentMeterPeriodStart: null,
    currentMeterPeriodEnd: null,
    trialStart: null,
    trialEnd: null,
    cancelAtPeriodEnd: false,
    canceledAt: null,
    startedAt: new Date(),
    endsAt: null,
    endedAt: null,
    pauseAtPeriodEnd: false,
    pausedAt: null,
    resumesAt: null,
    customerId: "cus_test",
    discountId: null,
    checkoutId: null,
    customerCancellationReason: null,
    customerCancellationComment: null,
    metadata: {},
    customer: {
      id: "cus_test",
      createdAt: new Date(),
      modifiedAt: null,
      metadata: {},
      emailVerified: true,
      type: "individual",
      name: "Test",
      billingName: null,
      billingAddress: null,
      taxId: null,
      organizationId: "org_test",
      deletedAt: null,
      avatarUrl: null,
    },
    product: { id: partial.productId } as Subscription["product"],
    discount: null,
    meters: [],
    pendingUpdate: null,
    ...partial,
  } as Subscription;
}

describe("resolvePlanFromPolarIds", () => {
  it("maps all four configured Polar price IDs", () => {
    expect(resolvePlanFromPolarIds([PRICE.student_monthly], lookup)).toEqual({
      planId: "student",
      billingCycle: "monthly",
    });
    expect(resolvePlanFromPolarIds([PRICE.student_annual], lookup)).toEqual({
      planId: "student",
      billingCycle: "annual",
    });
    expect(resolvePlanFromPolarIds([PRICE.pro_monthly], lookup)).toEqual({
      planId: "pro",
      billingCycle: "monthly",
    });
    expect(resolvePlanFromPolarIds([PRICE.pro_annual], lookup)).toEqual({
      planId: "pro",
      billingCycle: "annual",
    });
  });

  it("returns null for unknown IDs", () => {
    expect(resolvePlanFromPolarIds(["unknown"], lookup)).toBeNull();
    expect(resolvePlanFromPolarIds([], lookup)).toBeNull();
  });
});

describe("resolvePlanFromSubscription / planAfterPolarSubscription", () => {
  it("prefers metadata planId/billingCycle", () => {
    const sub = baseSubscription({
      status: "active",
      productId: "prod_x",
      prices: [{ id: PRICE.student_monthly } as Subscription["prices"][number]],
      metadata: { userId: "u1", planId: "pro", billingCycle: "annual" },
    });

    expect(resolvePlanFromSubscription(sub, lookup)).toEqual({
      planId: "pro",
      billingCycle: "annual",
    });
  });

  it("falls back to configured price IDs for all four combos", () => {
    const cases = [
      ["student", "monthly", PRICE.student_monthly],
      ["student", "annual", PRICE.student_annual],
      ["pro", "monthly", PRICE.pro_monthly],
      ["pro", "annual", PRICE.pro_annual],
    ] as const;

    for (const [planId, billingCycle, priceId] of cases) {
      const sub = baseSubscription({
        status: "active",
        productId: "prod_x",
        prices: [{ id: priceId } as Subscription["prices"][number]],
        metadata: {},
        recurringInterval: billingCycle === "annual" ? "year" : "month",
      });
      expect(planAfterPolarSubscription(sub, lookup)).toEqual({
        planId,
        billingCycle,
      });
    }
  });

  it("keeps paid access for past_due", () => {
    const sub = baseSubscription({
      status: "past_due",
      productId: PRICE.student_monthly,
      prices: [],
      metadata: { planId: "student", billingCycle: "monthly" },
    });
    expect(planAfterPolarSubscription(sub, lookup)).toEqual({
      planId: "student",
      billingCycle: "monthly",
    });
  });

  it("revokes paid access after canceled/revoked status", () => {
    const sub = baseSubscription({
      status: "canceled",
      productId: PRICE.pro_monthly,
      prices: [{ id: PRICE.pro_monthly } as Subscription["prices"][number]],
      metadata: { planId: "pro", billingCycle: "monthly" },
    });
    expect(planAfterPolarSubscription(sub, lookup)).toEqual({
      planId: "free",
      billingCycle: "monthly",
    });
  });

  it("keeps paid access when cancel_at_period_end but still active", () => {
    const sub = baseSubscription({
      status: "active",
      cancelAtPeriodEnd: true,
      productId: PRICE.student_monthly,
      prices: [{ id: PRICE.student_monthly } as Subscription["prices"][number]],
      metadata: {},
    });
    expect(planAfterPolarSubscription(sub, lookup)).toEqual({
      planId: "student",
      billingCycle: "monthly",
    });
  });
});

describe("resolveNoteScriptUserId", () => {
  it("prefers customer.externalId", () => {
    expect(
      resolveNoteScriptUserId({
        metadata: { userId: "meta_user" },
        customer: { externalId: "ext_user", metadata: {} },
      }),
    ).toBe("ext_user");
  });

  it("falls back to metadata.userId", () => {
    expect(
      resolveNoteScriptUserId({
        metadata: { userId: "meta_user" },
        customer: { externalId: null, metadata: {} },
      }),
    ).toBe("meta_user");
  });

  it("uses checkout externalCustomerId", () => {
    expect(
      resolveNoteScriptUserId({
        externalCustomerId: "checkout_user",
      }),
    ).toBe("checkout_user");
  });
});
