const STOP = new Set(
  "a an the and or of to in on for with from by is are was were be this that it as at if then than into over after before about such using use used".split(
    " ",
  ),
);

export function detectKeywords(text: string, limit = 12): string[] {
  const freq = new Map<string, number>();
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP.has(w) && !/^\d+$/.test(w));

  for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1);

  return [...freq.entries()]
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([w]) => w);
}
