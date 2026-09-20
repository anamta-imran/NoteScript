import type { ExtractedContent, GenerationOptions, StructuredNote } from "@/lib/types";
import { normalizeText } from "./textNormalizer";
import { processLanguage } from "./languageProcessor";
import { detectHeadings } from "./headingDetector";
import { detectKeywords } from "./keywordDetector";
import { detectDefinitions } from "./definitionDetector";
import { detectFormulas } from "./formulaDetector";
import { detectExamples } from "./exampleDetector";
import { detectDates } from "./dateDetector";
import { detectChapters } from "./chapterDetector";
import { detectSubject } from "./subjectDetector";
import { structureNote } from "./noteStructurer";
import { selectDiagram } from "./diagramSelector";

export { paginateNote } from "./pageLayoutEngine";
export { regeneratePageLayout } from "./pageLayoutEngine";

export function processExtractedContent(
  extracted: ExtractedContent,
  options: GenerationOptions,
): StructuredNote {
  const normalized = normalizeText(extracted.text);
  const languageText = processLanguage(normalized, options.language);

  const headingLines = detectHeadings(languageText);
  const keywords = detectKeywords(languageText);
  const definitions = detectDefinitions(languageText);
  const formulas = detectFormulas(languageText);
  const examples = detectExamples(languageText);
  const dates = detectDates(languageText);
  const subject =
    options.subject === "auto" ? detectSubject(languageText) : options.subject;

  const chapters = options.chapterDetection
    ? detectChapters(languageText, headingLines)
    : [];

  const diagram = options.diagrams
    ? selectDiagram(languageText, subject, options.diagramTemplate)
    : null;

  return structureNote({
    raw: languageText,
    extracted,
    options,
    subject,
    headingLines,
    keywords,
    definitions,
    formulas,
    examples,
    dates,
    chapters,
    diagram,
  });
}
