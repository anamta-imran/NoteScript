export type ExampleHit = { text: string };

export function detectExamples(text: string): ExampleHit[] {
  const hits: ExampleHit[] = [];
  const blocks = text.split(/\n{2,}/);
  for (const block of blocks) {
    const t = block.trim();
    if (/^(example|e\.g\.|for example|for instance|such as)\b/i.test(t)) {
      hits.push({ text: t.replace(/^(example|e\.g\.|for example|for instance)\s*[:.-]\s*/i, "") });
    }
  }
  const inline = text.match(/(?:for example|e\.g\.,?)\s+([^.!?\n]{12,160})/gi) ?? [];
  for (const m of inline) hits.push({ text: m.trim() });
  return hits.slice(0, 20);
}
