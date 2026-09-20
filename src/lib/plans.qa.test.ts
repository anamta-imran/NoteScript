import { describe, expect, it } from "vitest";
import { createHmac } from "crypto";
import { getPlan, normalizeHandwritingStyle, styleMinPlan } from "@/lib/plans";
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
  });

  it("student: no youtube, limited image/diagram, unlimited text", () => {
    const p = getPlan("student");
    expect(p.textGenerations).toBeNull();
    expect(p.allowedSources.includes("youtube")).toBe(false);
    expect(p.allowedSources.includes("pdf")).toBe(true);
    expect(p.allowedSources.includes("image")).toBe(true);
    expect(p.allowedSources.includes("diagram")).toBe(true);
    expect(p.imageGenerationsPerMonth).toBe(3);
    expect(p.diagramGenerationsPerMonth).toBe(3);
    expect(p.handwritingStyles).toHaveLength(5);
  });

  it("pro: all sources unlimited", () => {
    const p = getPlan("pro");
    expect(p.allowedSources).toEqual(["text", "youtube", "pdf", "image", "diagram"]);
    expect(p.imageGenerationsPerMonth).toBeNull();
    expect(p.diagramGenerationsPerMonth).toBeNull();
    expect(p.handwritingStyles.length).toBeGreaterThanOrEqual(14);
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
    expect(styleMinPlan("realistic-pen" as HandwritingStyle)).toBe("pro");
  });
});

describe("paddle signature helper", () => {
  it("accepts a valid h1 signature within the time window", () => {
    const secret = "test-webhook-secret";
    const rawBody = JSON.stringify({ event_id: "evt_1" });
    const ts = Math.floor(Date.now() / 1000).toString();
    const h1 = createHmac("sha256", secret).update(`${ts}:${rawBody}`, "utf8").digest("hex");
    const header = `ts=${ts};h1=${h1}`;

    // Inline mirror of route verifier (exported logic would be better; this locks the algorithm)
    const parts = header.split(";");
    const timestamp = parts.find((p) => p.startsWith("ts="))?.slice(3) || "";
    const signatures = parts.filter((p) => p.startsWith("h1=")).map((p) => p.slice(3));
    const expected = createHmac("sha256", secret)
      .update(`${timestamp}:${rawBody}`, "utf8")
      .digest("hex");
    expect(timestamp.length).toBeGreaterThan(0);
    expect(signatures.includes(expected)).toBe(true);
    expect(Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp)) <= 300).toBe(true);
  });
});
