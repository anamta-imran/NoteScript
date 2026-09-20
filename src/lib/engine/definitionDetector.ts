export type DefinitionHit = { term: string; meaning: string };

const PATTERNS: RegExp[] = [
  /^(.{2,80}?)\s+(?:is defined as|are defined as)\s+(.+)$/i,
  /^(.{2,80}?)\s+(?:refers to|is referred to as)\s+(.+)$/i,
  /^(.{2,80}?)\s+(?:means|is|are)\s+(.+)$/i,
  /^(?:definition)\s*[:\-]\s*(.{2,80}?)\s*[:\-]\s*(.+)$/i,
  /^(.{2,60}?)\s*[:\-]\s+(.{12,})$/,
];

export function detectDefinitions(text: string): DefinitionHit[] {
  const hits: DefinitionHit[] = [];
  const seen = new Set<string>();

  for (const raw of text.split(/\n+/)) {
    const line = raw.trim();
    if (line.length < 16 || line.length > 280) continue;
    for (const re of PATTERNS) {
      const m = line.match(re);
      if (!m) continue;
      const term = cleanTerm(m[1]);
      const meaning = m[2].trim().replace(/\.$/, "");
      if (!term || term.split(" ").length > 8) continue;
      if (meaning.split(" ").length < 3) continue;
      const key = term.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      hits.push({ term, meaning });
      break;
    }
  }
  return hits.slice(0, 40);
}

function cleanTerm(term: string): string {
  return term.replace(/^[-*•\d.)\s]+/, "").replace(/[#*_]/g, "").trim();
}
