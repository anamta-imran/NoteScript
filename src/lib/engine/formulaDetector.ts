export type FormulaHit = { expression: string };

const LATEX = /\${1,2}([^$]+)\${1,2}/g;
const CHEM = /(?:^|\s)([A-Z][a-z]?\d*(?:\s*[+\u2192>\-]+\s*[A-Z][a-z]?\d*){1,8})/g;
const EQ = /(?:^|\s)([A-Za-z][A-Za-z0-9_^*/() ]{0,40}\s*=\s*[^.]{1,80})/g;

export function detectFormulas(text: string): FormulaHit[] {
  const found: string[] = [];

  for (const m of text.matchAll(LATEX)) found.push(m[1].trim());
  for (const m of text.matchAll(EQ)) {
    const expr = m[1].trim();
    if (/[0-9A-Za-z]/.test(expr) && expr.length < 120) found.push(expr);
  }
  for (const m of text.matchAll(CHEM)) found.push(m[1].trim());

  const unique = [...new Set(found)].filter((e) => e.length >= 3);
  return unique.slice(0, 30).map((expression) => ({ expression }));
}

export function looksLikeChemical(expr: string): boolean {
  return /[A-Z][a-z]?\d/.test(expr) && /(->|→|\+)/.test(expr);
}
