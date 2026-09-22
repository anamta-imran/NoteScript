import { describe, expect, it } from "vitest";
import { detectHeadings } from "@/lib/engine/headingDetector";
import { detectFormulas } from "@/lib/engine/formulaDetector";
import { detectDefinitions } from "@/lib/engine/definitionDetector";
import { detectSubject } from "@/lib/engine/subjectDetector";
import { processExtractedContent, paginateNote, cleanSourceContent } from "@/lib/engine";
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

describe("unified study notes engine", () => {
  it("turns transcript-like prose into structured study notes", () => {
    const transcript = Array.from({ length: 18 }, (_, i) => {
      const min = String(Math.floor(i / 2)).padStart(2, "0");
      const sec = String((i * 7) % 60).padStart(2, "0");
      return `[${min}:${sec}] Photosynthesis is defined as the process plants use to make food from light. The chloroplast is important. First light reactions happen. Then the Calvin cycle fixes carbon. For example green leaves absorb sunlight. Remember oxygen is released as a byproduct.`;
    }).join("\n");

    const note = processExtractedContent(
      {
        text: transcript,
        titleHint: "Photosynthesis lecture",
        transcript: [{ text: "Photosynthesis overview", offset: 0, duration: 1000 }],
        warnings: [],
      },
      {
        handwritingStyle: "clean-study",
        noteLength: "standard",
        language: "english",
        subject: "auto",
        smartHighlighting: true,
        importantPoints: true,
        formulas: false,
        examples: true,
        diagrams: false,
        chapterDetection: false,
      },
    );

    expect(note.title.toLowerCase()).toContain("photosynthesis");
    expect(note.blocks.some((b) => b.type === "heading")).toBe(true);
    expect(note.blocks.some((b) => b.type === "definition" || b.type === "bullets")).toBe(true);
    expect(note.blocks.some((b) => b.type === "heading" && b.text === "Key Takeaways")).toBe(true);
    // Must not keep raw [mm:ss] cues as the note body
    const blob = JSON.stringify(note.blocks);
    expect(blob.includes("[00:")).toBe(false);
  });

  it("cleans filler and timestamp noise from source text", () => {
    const cleaned = cleanSourceContent(
      "[0:01] Um, okay so photosynthesis is, you know, important. [0:08] Yeah.",
      { isTranscript: true },
    );
    expect(cleaned.toLowerCase()).toContain("photosynthesis");
    expect(cleaned.toLowerCase()).not.toContain("um");
    expect(cleaned).not.toMatch(/\[\d+:\d+/);
  });
});

describe("note structuring + pagination", () => {
  it("builds pages from outlined text", () => {
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
    expect(getPlan("student").imageGenerationsPerMonth).toBe(10);
    expect(getPlan("student").diagramGenerationsPerMonth).toBe(10);
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
