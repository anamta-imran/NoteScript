import type { HighlightKind, HighlightSpan } from "@/lib/types";

const RULES: Array<{ kind: HighlightKind; re: RegExp }> = [
  { kind: "definition", re: /\b(defined as|definition|refers to|means that)\b/gi },
  { kind: "important", re: /\b(important|key point|remember|note that|must)\b/gi },
  { kind: "formula", re: /\b(formula|equation|equals)\b/gi },
  { kind: "example", re: /\b(for example|e\.g\.|example)\b/gi },
  { kind: "exam", re: /\b(exam|mcq|short question|likely to be asked)\b/gi },
  { kind: "conclusion", re: /\b(in conclusion|therefore|thus|hence|summary)\b/gi },
];

export function highlightText(text: string, enabled: boolean): HighlightSpan[] {
  if (!enabled) return [];
  const spans: HighlightSpan[] = [];
  for (const rule of RULES) {
    rule.re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = rule.re.exec(text))) {
      spans.push({ start: m.index, end: m.index + m[0].length, kind: rule.kind });
      if (spans.length >= 8) return spans;
    }
  }
  return spans;
}

export function sentenceIsCallout(text: string): HighlightKind | null {
  const t = text.toLowerCase();
  if (/\b(in conclusion|to summarize|summary:)\b/.test(t)) return "conclusion";
  if (/\b(important|remember|must know)\b/.test(t)) return "important";
  if (/\b(exam tip|for the exam)\b/.test(t)) return "exam";
  return null;
}
