import { describe, expect, it } from "vitest";
import {
  planActivationMatched,
  shouldBlockStalePlanUi,
  type PlanActivationState,
} from "./plan-activation";

function act(
  expected: "student" | "pro",
  fromPlan: "free" | "student" | "pro" = "free",
): PlanActivationState {
  return { expectedPlan: expected, fromPlan, startedAt: Date.now() };
}

describe("plan activation stale-UI blocking", () => {
  it("blocks Free while activating Student (Free → Student)", () => {
    expect(shouldBlockStalePlanUi("free", act("student", "free"))).toBe(true);
  });

  it("blocks Free while activating Pro (Free → Pro)", () => {
    expect(shouldBlockStalePlanUi("free", act("pro", "free"))).toBe(true);
  });

  it("blocks Student while activating Pro (Student → Pro)", () => {
    expect(shouldBlockStalePlanUi("student", act("pro", "student"))).toBe(true);
  });

  it("stops blocking once the expected plan is active", () => {
    expect(shouldBlockStalePlanUi("student", act("student", "free"))).toBe(false);
    expect(shouldBlockStalePlanUi("pro", act("pro", "student"))).toBe(false);
    expect(shouldBlockStalePlanUi("pro", act("pro", "free"))).toBe(false);
  });

  it("treats Pro as matching a Student purchase expectation", () => {
    expect(planActivationMatched("pro", "student")).toBe(true);
    expect(planActivationMatched("student", "pro")).toBe(false);
    expect(shouldBlockStalePlanUi("pro", act("student", "free"))).toBe(false);
  });

  it("does nothing without an activation flag", () => {
    expect(shouldBlockStalePlanUi("free", null)).toBe(false);
    expect(shouldBlockStalePlanUi("student", null)).toBe(false);
  });
});
