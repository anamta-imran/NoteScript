import { nonEmptyLines } from "./textNormalizer";

export type HeadingHit = {
  lineIndex: number;
  text: string;
  level: 1 | 2 | 3;
};

const CHAPTER_RE = /^(chapter|unit|section|lesson|part)\s+([0-9]+|[ivxlcdm]+)([:.\-–]\s*(.+))?$/i;
const MARKDOWN_RE = /^(#{1,3})\s+(.+)$/;
const NUMBERED_RE = /^((?:\d+\.){1,3}|\d+\)|[A-Z]\.)\s+(.{3,80})$/;

export function detectHeadings(text: string): HeadingHit[] {
  const lines = nonEmptyLines(text);
  const hits: HeadingHit[] = [];

  lines.forEach((line, index) => {
    const md = line.match(MARKDOWN_RE);
    if (md) {
      hits.push({
        lineIndex: index,
        text: md[2].trim(),
        level: Math.min(md[1].length, 3) as 1 | 2 | 3,
      });
      return;
    }

    const chapter = line.match(CHAPTER_RE);
    if (chapter) {
      hits.push({
        lineIndex: index,
        text: line.replace(/^#+\s*/, ""),
        level: 1,
      });
      return;
    }

    if (/^[A-Z0-9][A-Z0-9\s,:&()\-]{8,72}$/.test(line) && !/[.!?]$/.test(line)) {
      hits.push({ lineIndex: index, text: titleCase(line), level: 2 });
      return;
    }

    const numbered = line.match(NUMBERED_RE);
    if (numbered && !/[.!?]$/.test(numbered[2]) && numbered[2].split(" ").length <= 12) {
      hits.push({ lineIndex: index, text: numbered[2].trim(), level: 2 });
      return;
    }

    if (
      line.length <= 70 &&
      !/[.!?]$/.test(line) &&
      /^[A-Z]/.test(line) &&
      line.split(" ").length <= 10 &&
      index + 1 < lines.length &&
      lines[index + 1].length > 40
    ) {
      const words = line.split(/\s+/);
      const titleish = words.filter((w) => /^[A-Z]/.test(w)).length >= Math.ceil(words.length / 2);
      if (titleish) hits.push({ lineIndex: index, text: line, level: 3 });
    }
  });

  return hits;
}

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
