import { describe, expect, it } from "vitest";
import { createHmac } from "crypto";
import type { BillingCycle, PlanId } from "@/lib/types";
import {
  planAfterSubscriptionEvent,
  resolveBillingCycle,
  resolvePlanFromPriceId,
  resolvePlanId,
  verifyPaddleSignature,
  type PaddleWebhookData,
} from "@/lib/paddle-webhook";

const PRICE = {
  student_monthly: "pri_test_student_monthly",
  student_annual: "pri_test_student_annual",
  pro_monthly: "pri_test_pro_monthly",
  pro_annual: "pri_test_pro_annual",
} as const;

function lookup(plan: PlanId, cycle: BillingCycle) {
  return PRICE[`${plan}_${cycle}` as keyof typeof PRICE] || "";
}

function data(partial: Partial<PaddleWebhookData>): PaddleWebhookData {
  return {
    id: "sub_or_txn_1",
    status: "active",
    ...partial,
  };
}

describe("resolvePlanFromPriceId", () => {
  it("maps all four paid price IDs", () => {
    expect(resolvePlanFromPriceId(PRICE.student_monthly, lookup)).toEqual({
      planId: "student",
      billingCycle: "monthly",
    });
    expect(resolvePlanFromPriceId(PRICE.student_annual, lookup)).toEqual({
      planId: "student",
      billingCycle: "annual",
    });
    expect(resolvePlanFromPriceId(PRICE.pro_monthly, lookup)).toEqual({
      planId: "pro",
      billingCycle: "monthly",
    });
    expect(resolvePlanFromPriceId(PRICE.pro_annual, lookup)).toEqual({
      planId: "pro",
      billingCycle: "annual",
    });
  });

  it("returns null for unknown price IDs", () => {
    expect(resolvePlanFromPriceId("pri_unknown", lookup)).toBeNull();
    expect(resolvePlanFromPriceId(undefined, lookup)).toBeNull();
  });
});

describe("resolvePlanId / resolveBillingCycle", () => {
  it("prefers custom_data when present", () => {
    const d = data({
      custom_data: {
        userId: "u1",
        planId: "pro",
        billingCycle: "annual",
      },
      items: [{ price: { id: PRICE.student_monthly } }],
    });
    expect(resolvePlanId(d, lookup)).toBe("pro");
    expect(resolveBillingCycle(d, lookup)).toBe("annual");
  });

  it("falls back to price ID when custom_data is missing for all four combos", () => {
    const cases = [
      ["student", "monthly", PRICE.student_monthly],
      ["student", "annual", PRICE.student_annual],
      ["pro", "monthly", PRICE.pro_monthly],
      ["pro", "annual", PRICE.pro_annual],
    ] as const;

    for (const [planId, billingCycle, priceId] of cases) {
      const d = data({
        status: "active",
        custom_data: null,
        items: [{ price: { id: priceId } }],
      });
      expect(resolvePlanId(d, lookup)).toBe(planId);
      expect(resolveBillingCycle(d, lookup)).toBe(billingCycle);
      expect(planAfterSubscriptionEvent(d, "active", lookup)).toEqual({
        planId,
        billingCycle,
      });
    }
  });

  it("uses billing_cycle.interval year as annual", () => {
    expect(
      resolveBillingCycle(
        data({
          billing_cycle: { interval: "year", frequency: 1 },
          custom_data: { userId: "u1", planId: "student" },
        }),
        lookup,
      ),
    ).toBe("annual");
  });
});

describe("planAfterSubscriptionEvent", () => {
  it("grants student/monthly for active subscription with custom_data", () => {
    expect(
      planAfterSubscriptionEvent(
        data({
          status: "active",
          custom_data: {
            userId: "u1",
            planId: "student",
            billingCycle: "monthly",
          },
        }),
        "active",
        lookup,
      ),
    ).toEqual({ planId: "student", billingCycle: "monthly" });
  });

  it("grants all four paid combinations from custom_data", () => {
    const cases: Array<{ planId: "student" | "pro"; billingCycle: BillingCycle }> = [
      { planId: "student", billingCycle: "monthly" },
      { planId: "student", billingCycle: "annual" },
      { planId: "pro", billingCycle: "monthly" },
      { planId: "pro", billingCycle: "annual" },
    ];
    for (const c of cases) {
      expect(
        planAfterSubscriptionEvent(
          data({
            status: "active",
            custom_data: { userId: "u1", planId: c.planId, billingCycle: c.billingCycle },
          }),
          "active",
          lookup,
        ),
      ).toEqual(c);
    }
  });

  it("does not keep paid access after cancel", () => {
    expect(
      planAfterSubscriptionEvent(
        data({
          status: "canceled",
          custom_data: {
            userId: "u1",
            planId: "student",
            billingCycle: "monthly",
          },
        }),
        "canceled",
        lookup,
      ),
    ).toEqual({ planId: "free", billingCycle: "monthly" });
  });

  it("defaults to free only when plan cannot be resolved", () => {
    expect(
      planAfterSubscriptionEvent(
        data({
          status: "active",
          custom_data: null,
          items: [],
        }),
        "active",
        lookup,
      ),
    ).toEqual({ planId: "free", billingCycle: "monthly" });
  });
});

describe("resolvePlanFromPriceId integration with planAfter via custom price map", () => {
  it("maps each configured price into the correct plan/cycle pair", () => {
    const cases = [
      ["student", "monthly", PRICE.student_monthly],
      ["student", "annual", PRICE.student_annual],
      ["pro", "monthly", PRICE.pro_monthly],
      ["pro", "annual", PRICE.pro_annual],
    ] as const;

    for (const [planId, billingCycle, priceId] of cases) {
      expect(resolvePlanFromPriceId(priceId, lookup)).toEqual({ planId, billingCycle });
    }
  });
});

describe("verifyPaddleSignature", () => {
  it("accepts a valid h1 signature within the time window", () => {
    const secret = "test-webhook-secret";
    const rawBody = JSON.stringify({ event_id: "evt_1" });
    const ts = Math.floor(Date.now() / 1000).toString();
    const h1 = createHmac("sha256", secret).update(`${ts}:${rawBody}`, "utf8").digest("hex");
    expect(verifyPaddleSignature(rawBody, `ts=${ts};h1=${h1}`, secret)).toBe(true);
  });

  it("rejects an invalid signature", () => {
    const secret = "test-webhook-secret";
    const rawBody = JSON.stringify({ event_id: "evt_1" });
    const ts = Math.floor(Date.now() / 1000).toString();
    expect(
      verifyPaddleSignature(
        rawBody,
        `ts=${ts};h1=${"0".repeat(64)}`,
        secret,
      ),
    ).toBe(false);
  });
});
