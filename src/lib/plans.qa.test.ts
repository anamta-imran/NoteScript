import { describe, expect, it } from "vitest";
import {
  annualMonthlyEquivalent,
  annualSavingsPercent,
  getPlan,
  normalizeHandwritingStyle,
  styleMinPlan,
} from "@/lib/plans";
import { SELECTABLE_STYLES, getHandwritingTheme, HANDWRITING_THEMES } from "@/lib/engine/handwritingThemes";
import type { HandwritingStyle } from "@/lib/types";

describe("plan matrix (CODE logic)", () => {
  it("free: text only, 3 lifetime, no paid sources", () => {
    const p = getPlan("free");
    expect(p.allowedSources).toEqual(["text"]);
    expect(p.textGenerations).toBe(3);
    expect(p.textLimitIsLifetime).toBe(true);
    expect(p.imageGenerationsPerMonth).toBe(0);
    expect(p.diagramGenerationsPerMonth).toBe(0);
    expect(p.handwritingStyles).toEqual(["clean-study", "simple-student"]);
    expect(p.duplicateNotes).toBe(false);
    expect(p.monthlyPriceUsd).toBe(0);
    expect(p.annualPriceUsd).toBe(0);
  });

  it("student: no youtube, limited image/diagram, unlimited text", () => {
    const p = getPlan("student");
    expect(p.textGenerations).toBeNull();
    expect(p.allowedSources.includes("youtube")).toBe(false);
    expect(p.allowedSources.includes("pdf")).toBe(true);
    expect(p.allowedSources.includes("image")).toBe(true);
    expect(p.allowedSources.includes("diagram")).toBe(true);
    expect(p.imageGenerationsPerMonth).toBe(10);
    expect(p.diagramGenerationsPerMonth).toBe(10);
    expect(p.handwritingStyles).toHaveLength(10);
    expect(p.monthlyPriceUsd).toBe(14.99);
    expect(p.annualPriceUsd).toBe(99.99);
  });

  it("pro: all sources unlimited", () => {
    const p = getPlan("pro");
    expect(p.allowedSources).toEqual(["text", "youtube", "pdf", "image", "diagram"]);
    expect(p.imageGenerationsPerMonth).toBeNull();
    expect(p.diagramGenerationsPerMonth).toBeNull();
    expect(p.handwritingStyles.length).toBeGreaterThanOrEqual(14);
    expect(p.monthlyPriceUsd).toBe(18.99);
    expect(p.annualPriceUsd).toBe(139.99);
  });

  it("annual savings helpers use the new prices", () => {
    expect(annualMonthlyEquivalent("student")).toBe(8.33);
    expect(annualMonthlyEquivalent("pro")).toBe(11.67);
    expect(annualSavingsPercent("student")).toBe(44);
    expect(annualSavingsPercent("pro")).toBe(39);
  });
});

describe("handwriting styles", () => {
  it("exposes 14 selectable styles with distinct theme fonts", () => {
    expect(SELECTABLE_STYLES).toHaveLength(14);
    const fonts = new Set(SELECTABLE_STYLES.map((s) => getHandwritingTheme(s).fontClass));
    expect(fonts.size).toBeGreaterThanOrEqual(10);
  });

  it("maps legacy styles", () => {
    expect(normalizeHandwritingStyle("clean")).toBe("clean-study");
    expect(normalizeHandwritingStyle("class-notes")).toBe("neat-notes");
    expect(HANDWRITING_THEMES["clean"]).toBeTruthy();
  });

  it("assigns min plans correctly", () => {
    expect(styleMinPlan("clean-study")).toBe("free");
    expect(styleMinPlan("exam-notes")).toBe("student");
    expect(styleMinPlan("realistic-pen" as HandwritingStyle)).toBe("student");
    expect(styleMinPlan("creative-handwriting" as HandwritingStyle)).toBe("pro");
  });
});

describe("paddle webhook signing", () => {
  it("is covered by paddle-webhook.test.ts", () => {
    expect(true).toBe(true);
  });
});
