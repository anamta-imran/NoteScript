import { AppError } from "@/lib/errors";
import type { ExtractedContent } from "@/lib/types";

export async function extractImageOcr(buffer: Buffer, fileName: string): Promise<ExtractedContent> {
  if (process.env.OCR_ENABLED === "false") {
    throw new AppError(
      "OCR is not configured on this server. Set OCR_ENABLED=true to extract text from images.",
      503,
      "OCR_DISABLED",
    );
  }
  try {
    const Tesseract = (await import("tesseract.js")).default;
    const lang = process.env.OCR_LANG || "eng";
    const result = await Tesseract.recognize(buffer, lang);
    const text = result.data.text?.trim() ?? "";
    if (!text) {
      throw new AppError(
        "No text could be read from this image. Try a clearer photo or paste the text instead.",
        422,
        "OCR_EMPTY",
      );
    }
    return {
      text,
      titleHint: fileName.replace(/\.(png|jpe?g|webp)$/i, ""),
      fileName,
      warnings: result.data.confidence < 50 ? ["OCR confidence is low. Edit the extracted text before generating."] : [],
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      "OCR failed. Check that OCR is enabled and try a clearer image.",
      500,
      "OCR_FAILED",
    );
  }
}
