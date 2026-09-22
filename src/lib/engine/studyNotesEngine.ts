import type { GenerationOptions, NoteBlock } from "@/lib/types";
import { detectDefinitions } from "./definitionDetector";
import { detectExamples } from "./exampleDetector";
import { detectKeywords } from "./keywordDetector";
import { highlightText, sentenceIsCallout } from "./highlighter";

const FILLER_RE =
  /\b(um+|uh+|ahh+|erm+|you know|i mean|kind of|sort of|basically|literally|actually|right\?|okay so|alright so|let me just|we're gonna|we're going to|thanks for watching|don't forget to (like|subscribe)|smash that like)\b/gi;

/**
 * Clean raw extracted source text (transcripts, OCR, PDF dump, pasted prose)
 * into continuous study-ready prose without inventing content.
 */
export function cleanSourceContent(
  input: string,
  options?: { isTranscript?: boolean },
): string {
  let text = input.replace(/\r\n/g, "\n").replace(/\u00a0/g, " ");

  // Strip cue timestamps like [0:12] or [00:12:03]
  text = text.replace(/\[\d{1,2}:\d{2}(?::\d{2})?(?:\.\d+)?\]\s*/g, "");

  if (options?.isTranscript) {
    // Transcript lines → spaces so sentences can reform
    text = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .join(" ");
  }

  text = text
    .replace(FILLER_RE, " ")
    .replace(/\b(okay|ok|alright|yeah|yep|nah)\b[,.]?\s*/gi, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([.!?])\s*\1+/g, "$1")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Collapse duplicate consecutive sentences
  const sentences = splitSentences(text);
  const deduped: string[] = [];
  let prev = "";
  for (const s of sentences) {
    const norm = s.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
    if (!norm) continue;
    if (norm === prev) continue;
    if (prev && (norm.includes(prev) || prev.includes(norm)) && Math.abs(norm.length - prev.length) < 12) {
      continue;
    }
    deduped.push(s);
    prev = norm;
  }
  return deduped.join(" ").replace(/\s+/g, " ").trim();
}

/**
 * Build study-note blocks from cleaned prose using deterministic rules.
 * Does not invent facts — only rearranges and filters source sentences.
 */
export function buildStudyNoteBlocks(
  cleaned: string,
  options: GenerationOptions,
  titleHint?: string,
): NoteBlock[] {
  const sentences = splitSentences(cleaned);
  if (!sentences.length) {
    return [{ type: "paragraph", text: "No readable study content was found in this source." }];
  }

  const title = (titleHint?.trim() || deriveTitle(sentences)).slice(0, 160);
  const definitions = detectDefinitions(cleaned);
  const examples = options.examples ? detectExamples(cleaned) : [];
  const keywords = detectKeywords(cleaned);
  const steps = detectSteps(sentences);
  const important = pickImportant(sentences, keywords, options);
  const sections = segmentSections(sentences, title);
  const overview = pickOverview(sentences, title);

  const blocks: NoteBlock[] = [];
  blocks.push({ type: "heading", level: 1, text: title });

  if (overview) {
    blocks.push({
      type: "paragraph",
      text: overview,
      highlights: highlightText(overview, options.smartHighlighting),
    });
  }

  for (const section of sections) {
    blocks.push({ type: "heading", level: 2, text: section.heading });
    const points = section.sentences
      .map(toBullet)
      .filter((p) => p.length > 12)
      .slice(0, sectionBudget(options.noteLength));
    if (points.length) {
      blocks.push({ type: "bullets", items: uniqueStrings(points) });
    } else if (section.sentences[0]) {
      blocks.push({
        type: "paragraph",
        text: section.sentences[0],
        highlights: highlightText(section.sentences[0], options.smartHighlighting),
      });
    }
  }

  if (definitions.length) {
    blocks.push({ type: "heading", level: 3, text: "Key Definitions" });
    const seen = new Set<string>();
    for (const d of definitions.slice(0, 10)) {
      const key = d.term.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      blocks.push({ type: "definition", term: d.term, meaning: d.meaning });
    }
  }

  if (steps.length >= 2) {
    blocks.push({ type: "heading", level: 3, text: "How It Works" });
    blocks.push({ type: "numbered", items: steps.slice(0, 10) });
  }

  if (examples.length) {
    blocks.push({ type: "heading", level: 3, text: "Examples" });
    for (const ex of examples.slice(0, 5)) {
      blocks.push({ type: "example", text: ex.text });
    }
  }

  if (options.importantPoints && important.length) {
    blocks.push({ type: "heading", level: 3, text: "Important" });
    for (const line of important.slice(0, 8)) {
      const kind = sentenceIsCallout(line) || "important";
      blocks.push({ type: "callout", kind, text: line });
    }
  }

  const takeaways = pickTakeaways(sentences, keywords, important);
  if (takeaways.length) {
    blocks.push({ type: "heading", level: 2, text: "Key Takeaways" });
    blocks.push({ type: "bullets", items: takeaways });
  }

  return applyLengthCap(blocks, options.noteLength);
}

export function splitSentences(text: string): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];
  const parts = normalized
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"'(])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);
  if (parts.length) return parts;
  // Fallback for sources without punctuation (OCR/transcript fragments)
  return normalized
    .split(/(?<=[,;])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8);
}

function deriveTitle(sentences: string[]): string {
  const first = sentences[0] || "Study notes";
  const clipped = first.replace(/[.!?].*$/, "").trim();
  if (clipped.length >= 8 && clipped.length <= 90) return clipped;
  return clipped.slice(0, 72) || "Study notes";
}

function pickOverview(sentences: string[], title: string): string {
  const pool = sentences.filter((s) => !/^thanks for watching/i.test(s));
  const related = pool.filter((s) =>
    title
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3)
      .some((w) => s.toLowerCase().includes(w)),
  );
  const pick = (related[0] || pool[0] || "").trim();
  if (!pick) return "";
  if (pick.length > 280) return `${pick.slice(0, 277).trim()}…`;
  return pick;
}

function segmentSections(
  sentences: string[],
  title: string,
): Array<{ heading: string; sentences: string[] }> {
  if (sentences.length <= 4) {
    return [{ heading: "Main Ideas", sentences }];
  }

  const chunkSize =
    sentences.length <= 12 ? 3 : sentences.length <= 30 ? 5 : 7;
  const sections: Array<{ heading: string; sentences: string[] }> = [];
  for (let i = 0; i < sentences.length; i += chunkSize) {
    const chunk = sentences.slice(i, i + chunkSize);
    const heading = sectionHeading(chunk, title, sections.length);
    sections.push({ heading, sentences: chunk });
  }
  return sections.slice(0, 8);
}

function sectionHeading(chunk: string[], title: string, index: number): string {
  const defaults = [
    "Main Concept",
    "Core Ideas",
    "Details",
    "Further Points",
    "Additional Notes",
    "Related Ideas",
    "Context",
    "Summary Points",
  ];
  const lead = chunk[0] || "";
  const words = lead
    .replace(/[^A-Za-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .slice(0, 6);
  if (words.length >= 3) {
    const candidate = words.map(titleCaseWord).join(" ");
    if (!candidate.toLowerCase().startsWith(title.toLowerCase().slice(0, 12))) {
      return candidate.slice(0, 60);
    }
  }
  return defaults[Math.min(index, defaults.length - 1)];
}

function titleCaseWord(w: string): string {
  if (/^(and|or|the|of|in|on|to|a|an|for|with)$/i.test(w)) return w.toLowerCase();
  return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
}

function toBullet(sentence: string): string {
  return sentence
    .replace(/^(and|also|so|then|now|well)\s+/i, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.!?]+$/, "");
}

function detectSteps(sentences: string[]): string[] {
  const steps: string[] = [];
  for (const s of sentences) {
    const m = s.match(
      /^(?:step\s+\d+[:.)]\s*)?(first|second|third|fourth|fifth|finally|next|then|after that|lastly)[,:]?\s+(.+)$/i,
    );
    if (m?.[2] && m[2].length > 10) {
      steps.push(toBullet(m[2]));
      continue;
    }
    if (/\b(first|then|next|finally)\b/i.test(s) && s.length < 220) {
      steps.push(toBullet(s));
    }
  }
  return uniqueStrings(steps);
}

function pickImportant(
  sentences: string[],
  keywords: string[],
  options: GenerationOptions,
): string[] {
  if (!options.importantPoints) return [];
  const scored = sentences.map((s) => {
    let score = 0;
    if (sentenceIsCallout(s)) score += 5;
    if (/\b(important|remember|key|critical|must|note that|definition|means that)\b/i.test(s)) {
      score += 3;
    }
    const lower = s.toLowerCase();
    for (const k of keywords.slice(0, 12)) {
      if (lower.includes(k.toLowerCase())) score += 1;
    }
    if (s.length > 200) score -= 1;
    return { s, score };
  });
  return scored
    .filter((x) => x.score >= 3)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.s)
    .slice(0, 8);
}

function pickTakeaways(
  sentences: string[],
  keywords: string[],
  important: string[],
): string[] {
  const fromImportant = important.slice(0, 3).map(toBullet);
  if (fromImportant.length >= 3) return uniqueStrings(fromImportant);

  const keywordHits = sentences.filter((s) =>
    keywords.slice(0, 8).some((k) => s.toLowerCase().includes(k.toLowerCase())),
  );
  const pool = [...fromImportant, ...keywordHits.slice(-5).map(toBullet), ...sentences.slice(-3).map(toBullet)];
  return uniqueStrings(pool).slice(0, 5);
}

function uniqueStrings(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const key = item.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function sectionBudget(len: GenerationOptions["noteLength"]): number {
  if (len === "quick") return 3;
  if (len === "standard") return 5;
  return 8;
}

function applyLengthCap(
  blocks: NoteBlock[],
  len: GenerationOptions["noteLength"],
): NoteBlock[] {
  const cap = len === "quick" ? 36 : len === "standard" ? 80 : 140;
  return blocks.length <= cap ? blocks : blocks.slice(0, cap);
}
