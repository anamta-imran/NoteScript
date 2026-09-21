import { api } from "@/lib/api";
import type { PlanId } from "@/lib/types";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Poll session until the webhook has applied a paid plan.
 * Never invents entitlement — only returns after /api/auth/me reports student|pro.
 */
export async function waitForPaidPlan(options?: {
  intervalMs?: number;
  signal?: AbortSignal;
}): Promise<Extract<PlanId, "student" | "pro">> {
  const intervalMs = options?.intervalMs ?? 1500;

  for (;;) {
    if (options?.signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }

    try {
      const me = await api<{ user: { planId: PlanId } }>("/api/auth/me");
      if (me.user.planId === "student" || me.user.planId === "pro") {
        return me.user.planId;
      }
    } catch {
      // Transient API errors — keep waiting for webhook confirmation.
    }

    await sleep(intervalMs);
  }
}
