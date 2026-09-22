"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { PlanActivationScreen } from "@/components/billing/PlanActivationScreen";
import {
  clearPlanActivation,
  planActivationMatched,
  readPlanActivation,
  shouldBlockStalePlanUi,
  type PlanActivationState,
} from "@/lib/plan-activation";
import { waitForPaidPlan } from "@/lib/wait-for-paid-plan";
import type { PlanId, PublicUser } from "@/lib/types";

/**
 * Prevents old-plan dashboard flash after checkout for:
 * Free→Student, Free→Pro, Student→Pro.
 * While sessionStorage marks activation pending and /api/auth/me is not yet on the
 * expected plan, covers the entire app shell and polls until backend confirms.
 */
export function PlanActivationGuard({
  user,
  children,
}: {
  user: PublicUser;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [activation, setActivation] = useState<PlanActivationState | null>(null);
  const [takingLonger, setTakingLonger] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<PlanId>(user.planId);
  const pollingRef = useRef(false);

  const resolveActivation = useCallback((plan: PlanId) => {
    const stored = readPlanActivation();
    if (!stored) {
      setActivation(null);
      return;
    }
    if (planActivationMatched(plan, stored.expectedPlan)) {
      clearPlanActivation();
      setActivation(null);
      return;
    }
    if (shouldBlockStalePlanUi(plan, stored)) {
      setActivation(stored);
    }
  }, []);

  useEffect(() => {
    setCurrentPlan(user.planId);
    resolveActivation(user.planId);
  }, [user.planId, resolveActivation]);

  useEffect(() => {
    if (!activation) return;
    if (pollingRef.current) return;
    pollingRef.current = true;
    const ac = new AbortController();

    void waitForPaidPlan({
      expectedPlan: activation.expectedPlan,
      signal: ac.signal,
      softTimeoutMs: 6000,
      onSoftTimeout: () => setTakingLonger(true),
    })
      .then((plan) => {
        clearPlanActivation();
        setCurrentPlan(plan);
        setActivation(null);
        router.refresh();
        window.location.replace("/dashboard");
      })
      .catch(() => {
        pollingRef.current = false;
      });

    return () => {
      ac.abort();
      pollingRef.current = false;
    };
  }, [activation, router]);

  async function refreshStatus() {
    try {
      const me = await api<{ user: { planId: PlanId } }>("/api/auth/me");
      setCurrentPlan(me.user.planId);
      const stored = readPlanActivation();
      if (stored && planActivationMatched(me.user.planId, stored.expectedPlan)) {
        clearPlanActivation();
        setActivation(null);
        window.location.replace("/dashboard");
        return;
      }
      resolveActivation(me.user.planId);
    } catch {
      // keep waiting
    }
  }

  const blocking = Boolean(activation && shouldBlockStalePlanUi(currentPlan, activation));

  return (
    <>
      {blocking && activation ? (
        <PlanActivationScreen
          expectedPlan={activation.expectedPlan}
          takingLonger={takingLonger}
          onRefresh={refreshStatus}
        />
      ) : null}
      {/* Hide shell so Free/Student never paints under the activation overlay */}
      <div className={blocking ? "invisible pointer-events-none h-0 overflow-hidden" : undefined}>
        {children}
      </div>
    </>
  );
}
