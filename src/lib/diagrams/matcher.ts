import type { DiagramTemplateId } from "@/lib/types";
import { SCIENTIFIC_TEMPLATES } from "./registry";
import { normalizeTopic } from "./types";

export type MatchResult =
  | { ok: true; id: DiagramTemplateId; title: string }
  | { ok: false; suggestions: string[] };

const STOPWORDS = new Set([
  "human",
  "the",
  "a",
  "an",
  "of",
  "and",
  "system",
  "anatomy",
  "structure",
  "diagram",
  "body",
  "labelled",
  "unlabelled",
  "color",
  "bw",
  "study",
]);

function suggestions(): string[] {
  return SCIENTIFIC_TEMPLATES.slice(0, 6).map((t) => t.title);
}

export function matchScientificTopic(topic: string): MatchResult {
  const n = normalizeTopic(topic);
  if (!n) {
    return { ok: false, suggestions: suggestions() };
  }

  // Exact / substring against full aliases (strongest)
  for (const t of SCIENTIFIC_TEMPLATES) {
    const aliases = [t.title, ...t.aliases].map((a) => normalizeTopic(a));
    if (aliases.some((a) => a === n || n === a)) {
      return { ok: true, id: t.id, title: t.title };
    }
  }

  for (const t of SCIENTIFIC_TEMPLATES) {
    const aliases = [t.title, ...t.aliases].map((a) => normalizeTopic(a));
    // Topic contains a full alias phrase (e.g. "draw the human kidney please")
    if (aliases.some((a) => a.length >= 3 && n.includes(a))) {
      return { ok: true, id: t.id, title: t.title };
    }
  }

  // Distinctive token overlap (ignore stopwords like "anatomy")
  const tokens = new Set(n.split(" ").filter((tok) => tok && !STOPWORDS.has(tok)));
  if (tokens.size === 0) {
    return { ok: false, suggestions: suggestions() };
  }

  let best: { id: DiagramTemplateId; title: string; score: number } | null = null;
  for (const t of SCIENTIFIC_TEMPLATES) {
    const aliasTokens = [t.title, ...t.aliases]
      .map(normalizeTopic)
      .flatMap((a) => a.split(" "))
      .filter((tok) => tok && !STOPWORDS.has(tok));
    const unique = new Set(aliasTokens);
    const score = [...unique].reduce((s, tok) => s + (tokens.has(tok) ? 1 : 0), 0);
    if (!best || score > best.score) best = { id: t.id, title: t.title, score };
  }

  if (best && best.score >= 1) {
    return { ok: true, id: best.id, title: best.title };
  }

  return { ok: false, suggestions: suggestions() };
}
