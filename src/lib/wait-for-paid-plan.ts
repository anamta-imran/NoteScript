import { api } from "@/lib/api";
import type { PlanId } from "@/lib/types";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type WaitForPaidPlanOptions = {
  /** Prefer confirming this plan when provided (e.g. student checkout). */
  expectedPlan?: Extract<PlanId, "student" | "pro">;
  intervalMs?: number;
  /** Soft UX deadline — keep polling past this, but callers may show “still activating”. */
  softTimeoutMs?: number;
  signal?: AbortSignal;
  onSoftTimeout?: () => void;
};

/**
 * Poll session until the webhook has applied a paid plan.
 * Never invents entitlement — only returns after /api/auth/me reports the expected paid plan
 * (or any paid plan when expectedPlan is omitted).
 */
export async function waitForPaidPlan(
  options?: WaitForPaidPlanOptions,
): Promise<Extract<PlanId, "student" | "pro">> {
  const intervalMs = options?.intervalMs ?? 1200;
  const softTimeoutMs = options?.softTimeoutMs ?? 8000;
  const started = Date.now();
  let softFired = false;

  for (;;) {
    if (options?.signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }

    try {
      const me = await api<{ user: { planId: PlanId } }>("/api/auth/me");
      const plan = me.user.planId;
      if (options?.expectedPlan) {
        if (plan === options.expectedPlan) return plan;
        // Pro satisfies a Student purchase expectation if webhook upgraded further.
        if (options.expectedPlan === "student" && plan === "pro") return "pro";
      } else if (plan === "student" || plan === "pro") {
        return plan;
      }
    } catch {
      // Transient API errors — keep waiting for webhook confirmation.
    }

    if (!softFired && Date.now() - started >= softTimeoutMs) {
      softFired = true;
      options?.onSoftTimeout?.();
    }

    await sleep(intervalMs);
  }
}
