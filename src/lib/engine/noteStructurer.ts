import type {
  Chapter,
  DiagramTemplateId,
  ExtractedContent,
  GenerationOptions,
  NoteBlock,
  StructuredNote,
  Subject,
} from "@/lib/types";
import type { HeadingHit } from "./headingDetector";
import type { DefinitionHit } from "./definitionDetector";
import type { FormulaHit } from "./formulaDetector";
import type { ExampleHit } from "./exampleDetector";
import type { DateHit } from "./dateDetector";
import { highlightText, sentenceIsCallout } from "./highlighter";
import { looksLikeChemical } from "./formulaDetector";
import { nonEmptyLines } from "./textNormalizer";

type Input = {
  raw: string;
  extracted: ExtractedContent;
  options: GenerationOptions;
  subject: Exclude<Subject, "auto">;
  headingLines: HeadingHit[];
  keywords: string[];
  definitions: DefinitionHit[];
  formulas: FormulaHit[];
  examples: ExampleHit[];
  dates: DateHit[];
  chapters: Chapter[];
  diagram: DiagramTemplateId | null;
};

export function structureNote(input: Input): StructuredNote {
  const lines = nonEmptyLines(input.raw);
  const blocks: NoteBlock[] = [];

  const title =
    input.extracted.titleHint?.trim() ||
    input.headingLines[0]?.text ||
    firstSentence(input.raw) ||
    "Untitled notes";

  blocks.push({ type: "heading", level: 1, text: title });

  if (input.extracted.transcript?.length && input.options.chapterDetection === false) {
    // timestamps still attached when transcript exists
  }

  const usedDef = new Set<string>();
  const maxBlocks = lengthCap(input.options.noteLength);

  let buffer: string[] = [];
  const flushParagraph = () => {
    if (!buffer.length) return;
    const text = buffer.join(" ");
    buffer = [];
    const callout = sentenceIsCallout(text);
    if (callout && input.options.importantPoints) {
      blocks.push({ type: "callout", kind: callout, text });
      return;
    }
    const bullets = text.match(/^[-*•]\s+/);
    if (bullets) return;
    blocks.push({
      type: "paragraph",
      text,
      highlights: highlightText(text, input.options.smartHighlighting),
    });
  };

  lines.forEach((line, idx) => {
    if (blocks.length >= maxBlocks) return;
    const heading = input.headingLines.find((h) => h.lineIndex === idx);
    if (heading) {
      flushParagraph();
      if (heading.text !== title) {
        const chapter = input.chapters.find((c) => c.title === heading.text);
        blocks.push({
          type: "heading",
          level: heading.level,
          text: heading.text,
          chapterId: chapter?.id,
        });
      }
      return;
    }

    if (/^[-*•]\s+/.test(line) || /^\d+[.)]\s+/.test(line)) {
      flushParagraph();
      const items = [line.replace(/^([-*•]|\d+[.)])\s+/, "")];
      const last = blocks[blocks.length - 1];
      if (last && last.type === "bullets" && /^[-*•]/.test(line)) {
        last.items.push(items[0]);
      } else if (last && last.type === "numbered" && /^\d+/.test(line)) {
        last.items.push(items[0]);
      } else if (/^\d+[.)]\s+/.test(line)) {
        blocks.push({ type: "numbered", items });
      } else {
        blocks.push({ type: "bullets", items });
      }
      return;
    }

    if (/^```/.test(line) || looksLikeCode(line)) {
      flushParagraph();
      blocks.push({ type: "code", code: line.replace(/^```/, "").trim() });
      return;
    }

    buffer.push(line);
    if (line.endsWith(".") || line.endsWith(":") || buffer.join(" ").length > 280) {
      flushParagraph();
    }
  });
  flushParagraph();

  if (input.options.formulas) {
    for (const f of input.formulas) {
      if (looksLikeChemical(f.expression)) {
        blocks.push({ type: "chemistry-equation", expression: f.expression });
      } else {
        blocks.push({ type: "formula", expression: f.expression });
      }
    }
  }

  if (input.definitions.length) {
    for (const d of input.definitions.slice(0, 12)) {
      if (usedDef.has(d.term.toLowerCase())) continue;
      usedDef.add(d.term.toLowerCase());
      blocks.push({ type: "definition", term: d.term, meaning: d.meaning });
    }
  }

  if (input.options.examples) {
    for (const ex of input.examples.slice(0, 6)) {
      blocks.push({ type: "example", text: ex.text });
    }
  }

  applySubjectFormatting(blocks, input);

  if (input.diagram) {
    blocks.push({
      type: "diagram",
      templateId: input.diagram,
      caption: "Study diagram template (not generated from visuals)",
    });
  }

  if (input.extracted.transcript?.length) {
    attachTimestamps(blocks, input.extracted);
  }

  const mappedChapters = mapChaptersToBlocks(blocks, input.chapters);

  return {
    title: title.slice(0, 160),
    subject: input.subject,
    language: input.options.language,
    chapters: mappedChapters,
    blocks: applyLength(blocks, input.options.noteLength),
    keywords: input.keywords,
    source: {
      type: input.extracted.youtubeVideoId ? "youtube" : inferSource(input.extracted),
      youtubeVideoId: input.extracted.youtubeVideoId,
      youtubeUrl: input.extracted.youtubeUrl,
      fileName: input.extracted.fileName,
    },
  };
}

function inferSource(extracted: ExtractedContent): StructuredNote["source"]["type"] {
  if (extracted.youtubeVideoId) return "youtube";
  if (extracted.fileName?.toLowerCase().endsWith(".pdf")) return "pdf";
  if (extracted.fileName) return "image";
  return "text";
}

function firstSentence(text: string): string {
  return text.split(/[.\n]/)[0]?.trim().slice(0, 80) ?? "";
}

function looksLikeCode(line: string): boolean {
  return /^(function|const|let|var|class|def|if\s*\(|for\s*\(|while\s*\()/.test(line);
}

function lengthCap(len: GenerationOptions["noteLength"]): number {
  if (len === "quick") return 40;
  if (len === "standard") return 90;
  return 180;
}

function applyLength(blocks: NoteBlock[], len: GenerationOptions["noteLength"]): NoteBlock[] {
  const cap = lengthCap(len);
  if (blocks.length <= cap) return blocks;
  return blocks.slice(0, cap);
}

function applySubjectFormatting(blocks: NoteBlock[], input: Input) {
  if (!input.options.formulas && input.subject !== "mathematics" && input.subject !== "physics") {
    return;
  }
  if (input.subject === "mathematics" || input.subject === "physics") {
    const formula = input.formulas[0]?.expression;
    const given = input.definitions.slice(0, 3).map((d) => `${d.term}: ${d.meaning}`);
    if (formula || given.length) {
      blocks.push({
        type: "math-problem",
        given: given.length ? given : ["See statements above"],
        required: ["Find the result using the detected formula"],
        formula,
        steps: input.examples.slice(0, 4).map((e) => e.text),
        answer: undefined,
      });
    }
  }
  if (input.subject === "computer-science") {
    const def = input.definitions[0];
    blocks.push({
      type: "cs-concept",
      definition: def ? `${def.term}: ${def.meaning}` : undefined,
      syntax: input.formulas[0]?.expression,
      example: input.examples[0]?.text,
      important: input.keywords.slice(0, 6),
    });
  }
  if (input.subject === "history" && input.dates.length) {
    blocks.push({
      type: "timeline",
      events: uniqueDates(input.dates).slice(0, 12),
    });
  }
}

function uniqueDates(dates: DateHit[]) {
  const seen = new Set<string>();
  const events: { date: string; event: string }[] = [];
  for (const d of dates) {
    if (seen.has(d.raw)) continue;
    seen.add(d.raw);
    events.push({ date: d.raw, event: d.context });
  }
  return events;
}

function attachTimestamps(blocks: NoteBlock[], extracted: ExtractedContent) {
  const cues = extracted.transcript ?? [];
  if (!cues.length) return;
  const headings = blocks.filter((b) => b.type === "heading") as Extract<
    NoteBlock,
    { type: "heading" }
  >[];
  for (const h of headings.slice(1, 8)) {
    const words = h.text.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    const cue = cues.find((c) => words.some((w) => c.text.toLowerCase().includes(w)));
    if (cue) {
      const idx = blocks.indexOf(h);
      blocks.splice(idx + 1, 0, {
        type: "timestamp",
        seconds: Math.floor(cue.offset / 1000),
        label: h.text,
        videoId: extracted.youtubeVideoId,
      });
    }
  }
}

function mapChaptersToBlocks(blocks: NoteBlock[], chapters: Chapter[]): Chapter[] {
  if (!chapters.length) return [];
  return chapters.map((ch, i) => {
    const start = blocks.findIndex(
      (b) => b.type === "heading" && b.text === ch.title,
    );
    const next = chapters[i + 1];
    const end = next
      ? blocks.findIndex((b) => b.type === "heading" && b.text === next.title)
      : blocks.length;
    return {
      id: ch.id,
      title: ch.title,
      startBlock: start === -1 ? 0 : start,
      endBlock: end === -1 ? blocks.length : end,
    };
  });
}
