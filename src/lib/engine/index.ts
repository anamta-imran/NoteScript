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
import { buildStudyNoteBlocks, cleanSourceContent } from "./studyNotesEngine";

export { paginateNote } from "./pageLayoutEngine";
export { regeneratePageLayout } from "./pageLayoutEngine";
export { cleanSourceContent, buildStudyNoteBlocks } from "./studyNotesEngine";

/**
 * Unified Notes Generation Engine entry point for every Teacher source.
 * Source-specific extractors produce ExtractedContent; this function always
 * cleans → understands → structures → returns a StructuredNote for the renderer.
 */
export function processExtractedContent(
  extracted: ExtractedContent,
  options: GenerationOptions,
): StructuredNote {
  const isTranscript = Boolean(
    extracted.transcript?.length || /\[\d{1,2}:\d{2}/.test(extracted.text),
  );

  const cleaned = cleanSourceContent(normalizeText(extracted.text), { isTranscript });
  const languageText = processLanguage(cleaned, options.language);

  const subject =
    options.subject === "auto" ? detectSubject(languageText) : options.subject;

  const headingLines = detectHeadings(languageText);
  const keywords = detectKeywords(languageText);
  const definitions = detectDefinitions(languageText);
  const formulas = detectFormulas(languageText);
  const examples = detectExamples(languageText);
  const dates = detectDates(languageText);
  const chapters = options.chapterDetection
    ? detectChapters(languageText, headingLines)
    : [];
  const diagram = options.diagrams
    ? selectDiagram(languageText, subject, options.diagramTemplate)
    : null;

  // Prefer study-note synthesis for prose / transcripts / OCR dumps that lack
  // clear markdown structure. Keep classic structurer for already-outlined notes.
  const outlineRich =
    headingLines.length >= 2 ||
    /^(#{1,3}\s|chapter\s+\d+)/im.test(languageText) ||
    (languageText.match(/^[-*•]\s+/gm) || []).length >= 4;

  if (!outlineRich && languageText.split(/\s+/).length >= 40) {
    const studyBlocks = buildStudyNoteBlocks(
      languageText,
      options,
      extracted.titleHint,
    );

    // Attach formulas/diagrams similarly to structureNote
    if (options.formulas) {
      for (const f of formulas.slice(0, 8)) {
        studyBlocks.push({ type: "formula", expression: f.expression });
      }
    }
    if (diagram) {
      studyBlocks.push({
        type: "diagram",
        templateId: diagram,
        caption: "Study diagram template (not generated from visuals)",
      });
    }

    const title =
      extracted.titleHint?.trim() ||
      (studyBlocks.find((b) => b.type === "heading") as { text?: string } | undefined)
        ?.text ||
      "Study notes";

    return {
      title: title.slice(0, 160),
      subject,
      language: options.language,
      chapters: [],
      blocks: studyBlocks,
      keywords,
      source: {
        type: extracted.youtubeVideoId
          ? "youtube"
          : extracted.fileName?.toLowerCase().endsWith(".pdf")
            ? "pdf"
            : extracted.fileName
              ? "image"
              : "text",
        youtubeVideoId: extracted.youtubeVideoId,
        youtubeUrl: extracted.youtubeUrl,
        fileName: extracted.fileName,
      },
    };
  }

  return structureNote({
    raw: languageText,
    extracted: { ...extracted, text: languageText },
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
