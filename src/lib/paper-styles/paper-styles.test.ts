import { describe, expect, it } from "vitest";
import {
  PAPER_STYLES,
  PAPER_STYLE_IDS,
  getPaperStyle,
  resolvePaperStyle,
  listPaperCategories,
  paperStyleToCssVars,
} from "@/lib/paper-styles";
import { PAPER_STYLE_ID_VALUES } from "@/lib/types";
import { getPlan } from "@/lib/plans";

describe("paper styles registry", () => {
  it("registers exactly 53 styles", () => {
    expect(PAPER_STYLES).toHaveLength(53);
    expect(PAPER_STYLE_IDS).toHaveLength(53);
    expect(PAPER_STYLE_ID_VALUES).toHaveLength(53);
  });

  it("has unique ids and names", () => {
    const ids = PAPER_STYLES.map((p) => p.id);
    const names = PAPER_STYLES.map((p) => p.name);
    expect(new Set(ids).size).toBe(53);
    expect(new Set(names).size).toBe(53);
  });

  it("matches typed id union", () => {
    expect([...PAPER_STYLE_IDS].sort()).toEqual([...PAPER_STYLE_ID_VALUES].sort());
  });

  it("every style has valid category and pattern", () => {
    const cats = new Set(listPaperCategories().map((c) => c.id));
    for (const style of PAPER_STYLES) {
      expect(cats.has(style.category)).toBe(true);
      expect(style.bg).toMatch(/^#|^rgb/);
      expect(style.pattern.kind).toBeTruthy();
      expect(style.printable).toBe(true);
      const vars = paperStyleToCssVars(style);
      expect(vars.backgroundColor).toBe(style.bg);
    }
  });

  it("resolves known ids and falls back for unknown", () => {
    expect(getPaperStyle("college-ruled")?.name).toBe("College Ruled");
    expect(resolvePaperStyle("college-ruled")?.id).toBe("college-ruled");
    expect(resolvePaperStyle("not-a-real-paper")).toBeNull();
    expect(resolvePaperStyle(undefined)).toBeNull();
    expect(resolvePaperStyle(null)).toBeNull();
  });

  it("styles are deterministic across calls", () => {
    const a = paperStyleToCssVars(getPaperStyle("engineering-grid")!);
    const b = paperStyleToCssVars(getPaperStyle("engineering-grid")!);
    expect(a).toEqual(b);
  });

  it("plan paper limits follow Free/Student/Pro philosophy", () => {
    expect(getPlan("free").paperStyles).toHaveLength(8);
    expect(getPlan("student").paperStyles).toHaveLength(53);
    expect(getPlan("pro").paperStyles).toHaveLength(53);
    expect(getPlan("free").paperStyles.includes("classic-blue-ruled")).toBe(true);
    expect(getPlan("free").paperStyles.includes("blackboard-study-paper")).toBe(false);
  });
});
