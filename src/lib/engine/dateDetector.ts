export type DateHit = { raw: string; context: string };

const DATE_RE =
  /\b(?:\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}|\b(?:1[0-9]{3}|20[0-2][0-9])\b)/gi;

export function detectDates(text: string): DateHit[] {
  const lines = text.split("\n");
  const hits: DateHit[] = [];
  for (const line of lines) {
    const matches = line.match(DATE_RE) ?? [];
    for (const raw of matches) {
      hits.push({ raw, context: line.trim().slice(0, 180) });
    }
  }
  return hits.slice(0, 40);
}
