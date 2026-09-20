import { AppError } from "@/lib/errors";
import type { ExtractedContent } from "@/lib/types";

export async function extractPdf(buffer: Buffer, fileName: string): Promise<ExtractedContent> {
  try {
    const { extractText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { totalPages, text } = await extractText(pdf, { mergePages: false });
    const pages = Array.isArray(text) ? text : [text];
    const joined = pages
      .map((p, i) => `\n\n--- Page ${i + 1} ---\n${p}`)
      .join("\n")
      .trim();
    if (!joined.replace(/--- Page \d+ ---/g, "").trim()) {
      return {
        text: "",
        fileName,
        pageMarkers: pages.map((_, i) => i + 1),
        warnings: [
          "This PDF has no selectable text. It may be scanned. OCR can be used from the Image flow, or enable OCR on the server.",
        ],
      };
    }
    return {
      text: joined,
      titleHint: fileName.replace(/\.pdf$/i, ""),
      fileName,
      pageMarkers: pages.map((_, i) => i + 1),
      warnings: totalPages ? [] : [],
    };
  } catch {
    throw new AppError("This PDF could not be read. It may be corrupted.", 400, "PDF_CORRUPT");
  }
}
