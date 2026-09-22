import { describe, expect, it } from "vitest";
import {
  canUseFeature,
  canUseSource,
  planMeetsMinimum,
  pricingHighlightHref,
  requiredPlanForFeature,
  requiredPlanForSource,
} from "./entitlements";

describe("entitlements", () => {
  it("gates YouTube to Pro only", () => {
    expect(canUseSource("free", "youtube")).toBe(false);
    expect(canUseSource("student", "youtube")).toBe(false);
    expect(canUseSource("pro", "youtube")).toBe(true);
    expect(requiredPlanForSource("youtube")).toBe("pro");
  });

  it("allows Student sources without YouTube", () => {
    expect(canUseSource("student", "pdf")).toBe(true);
    expect(canUseSource("student", "image")).toBe(true);
    expect(canUseSource("student", "diagram")).toBe(true);
    expect(canUseSource("free", "pdf")).toBe(false);
  });

  it("ranks plans and feature requirements", () => {
    expect(planMeetsMinimum("student", "student")).toBe(true);
    expect(planMeetsMinimum("student", "pro")).toBe(false);
    expect(requiredPlanForFeature("youtube")).toBe("pro");
    expect(canUseFeature("pro", "timestamps")).toBe(true);
    expect(canUseFeature("student", "timestamps")).toBe(false);
  });

  it("builds pricing highlight links", () => {
    expect(pricingHighlightHref("pro")).toBe("/pricing?highlight=pro&cycle=monthly");
  });
});
