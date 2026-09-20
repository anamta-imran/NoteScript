import { describe, expect, it } from "vitest";
import { detectHeadings } from "@/lib/engine/headingDetector";
import { detectFormulas } from "@/lib/engine/formulaDetector";
import { detectDefinitions } from "@/lib/engine/definitionDetector";
import { detectSubject } from "@/lib/engine/subjectDetector";
import { processExtractedContent, paginateNote } from "@/lib/engine";
import { getPlan } from "@/lib/plans";
import { pickDiagramFromPrompt } from "@/lib/engine/diagramService";

describe("heading detection", () => {
  it("finds markdown and chapter headings", () => {
    const text = "# Intro\n\nHello\n\nChapter 2: Methods\n\nBody";
    const hits = detectHeadings(text);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.some((h) => /intro/i.test(h.text))).toBe(true);
  });
});

describe("formula detection", () => {
  it("detects simple equations", () => {
    const hits = detectFormulas("The force is F = ma and energy E = mc^2");
    expect(hits.length).toBeGreaterThan(0);
  });
});

describe("definition detection", () => {
  it("detects is-defined patterns", () => {
    const hits = detectDefinitions(
      "Photosynthesis is defined as the process plants use to make food from light.",
    );
    expect(hits.length).toBeGreaterThan(0);
  });
});

describe("subject detection", () => {
  it("detects biology from keywords", () => {
    expect(
      detectSubject("The cell membrane surrounds the nucleus during mitosis and DNA replication."),
    ).toBe("biology");
  });
});

describe("note structuring + pagination", () => {
  it("builds pages from text", () => {
    const note = processExtractedContent(
      {
        text: "# Force\n\nF = ma\n\nForce is defined as mass times acceleration.\n\n- Important: newton laws\n- Example: pushing a box",
        warnings: [],
      },
      {
        handwritingStyle: "clean-study",
        noteLength: "standard",
        language: "english",
        subject: "auto",
        smartHighlighting: true,
        importantPoints: true,
        formulas: true,
        examples: true,
        diagrams: false,
        chapterDetection: true,
      },
    );
    expect(note.blocks.length).toBeGreaterThan(1);
    const pages = paginateNote(note.blocks, 10);
    expect(pages.length).toBeGreaterThan(0);
  });
});

describe("plans", () => {
  it("keeps youtube pro-only and free text-only", () => {
    expect(getPlan("free").allowedSources).toEqual(["text"]);
    expect(getPlan("student").allowedSources.includes("youtube")).toBe(false);
    expect(getPlan("pro").allowedSources.includes("youtube")).toBe(true);
    expect(getPlan("student").imageGenerationsPerMonth).toBe(3);
    expect(getPlan("student").diagramGenerationsPerMonth).toBe(3);
    expect(getPlan("pro").textGenerations).toBeNull();
  });
});

describe("diagram service", () => {
  it("picks water cycle template from prompt", () => {
    expect(
      pickDiagramFromPrompt(
        "Draw the water cycle with evaporation condensation precipitation collection",
      ),
    ).toBe("water-cycle");
  });
});
