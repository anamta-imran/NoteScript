import type { NoteLanguage } from "@/lib/types";

const SIMPLE_SWAPS: Array<[RegExp, string]> = [
  [/\butilize\b/gi, "use"],
  [/\bapproximately\b/gi, "about"],
  [/\btherefore\b/gi, "so"],
  [/\bhowever\b/gi, "but"],
  [/\bsubsequently\b/gi, "then"],
  [/\bfundamental\b/gi, "basic"],
  [/\bdemonstrate\b/gi, "show"],
  [/\bconstitute\b/gi, "make up"],
  [/\bsignificant\b/gi, "important"],
];

const ROMAN_URDU_HINTS: Array<[RegExp, string]> = [
  [/\bdefinition\b/gi, "tareef"],
  [/\bexample\b/gi, "example"],
  [/\bimportant\b/gi, "zaroori"],
  [/\bformula\b/gi, "formula"],
  [/\bchapter\b/gi, "chapter"],
  [/\bsummary\b/gi, "khulasa"],
];

export function processLanguage(text: string, language: NoteLanguage): string {
  if (language === "easy-english") {
    return SIMPLE_SWAPS.reduce((acc, [re, to]) => acc.replace(re, to), text);
  }
  if (language === "roman-urdu") {
    return ROMAN_URDU_HINTS.reduce((acc, [re, to]) => acc.replace(re, to), text);
  }
  return text;
}

export function looksLikeUrdu(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}
