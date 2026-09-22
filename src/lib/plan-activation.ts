import type { PlanId } from "./types";

const STORAGE_KEY = "ns_plan_activating";

export type PaidPlanId = Extract<PlanId, "student" | "pro">;

export type PlanActivationState = {
  expectedPlan: PaidPlanId;
  /** Plan the user had when checkout completed (for stale-UI blocking). */
  fromPlan?: PlanId;
  startedAt: number;
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof sessionStorage !== "undefined";
}

export function startPlanActivation(
  expectedPlan: PaidPlanId,
  fromPlan?: PlanId,
): PlanActivationState {
  const state: PlanActivationState = {
    expectedPlan,
    fromPlan,
    startedAt: Date.now(),
  };
  if (canUseStorage()) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  return state;
}

export function readPlanActivation(): PlanActivationState | null {
  if (!canUseStorage()) return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PlanActivationState;
    if (parsed.expectedPlan !== "student" && parsed.expectedPlan !== "pro") return null;
    if (typeof parsed.startedAt !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearPlanActivation(): void {
  if (!canUseStorage()) return;
  sessionStorage.removeItem(STORAGE_KEY);
}

export function planActivationMatched(currentPlan: PlanId, expected: PaidPlanId): boolean {
  if (currentPlan === expected) return true;
  // Student checkout that lands on Pro still counts as success.
  if (expected === "student" && currentPlan === "pro") return true;
  return false;
}

/**
 * True while webhook confirmation is pending and the app must not paint the
 * previous plan (Free or Student) — covers Free→Student, Free→Pro, Student→Pro.
 */
export function shouldBlockStalePlanUi(
  currentPlan: PlanId,
  activation: PlanActivationState | null = readPlanActivation(),
): boolean {
  if (!activation) return false;
  if (planActivationMatched(currentPlan, activation.expectedPlan)) return false;
  // Still on a lower tier than what was just purchased.
  return true;
}

/** @deprecated Use shouldBlockStalePlanUi */
export const shouldBlockFreeUi = shouldBlockStalePlanUi;
