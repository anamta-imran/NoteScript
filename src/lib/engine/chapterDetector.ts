import type { Chapter } from "@/lib/types";
import type { HeadingHit } from "./headingDetector";
import { nonEmptyLines } from "./textNormalizer";

export function detectChapters(text: string, headings: HeadingHit[]): Chapter[] {
  const lines = nonEmptyLines(text);
  const starts = headings.filter((h) => h.level === 1 || /^(chapter|unit|section)\b/i.test(h.text));
  const source = starts.length ? starts : headings.filter((h) => h.level <= 2);

  if (source.length < 2) {
    return source.length === 1
      ? [{ id: "c1", title: source[0].text, startBlock: 0, endBlock: 0 }]
      : [];
  }

  return source.map((h, i) => ({
    id: `c${i + 1}`,
    title: h.text,
    startBlock: h.lineIndex,
    endBlock: i + 1 < source.length ? source[i + 1].lineIndex - 1 : lines.length - 1,
  }));
}
