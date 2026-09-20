export function normalizeText(input: string): string {
  return input
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function splitLines(text: string): string[] {
  return text.split("\n").map((l) => l.trimEnd());
}

export function nonEmptyLines(text: string): string[] {
  return splitLines(text).map((l) => l.trim()).filter(Boolean);
}
