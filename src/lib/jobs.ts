import { connectDb } from "./db";
import { ProcessingJob } from "@/models/ProcessingJob";
import { Note } from "@/models/Note";
import { User } from "@/models/User";
import { Upload } from "@/models/Upload";
import { processExtractedContent, paginateNote } from "./engine";
import { extractYoutube } from "./extractors/youtube";
import { extractPdf } from "./extractors/pdf";
import { extractImageOcr } from "./extractors/ocr";
import { readUpload } from "./storage";
import { incrementUsage } from "./usage";
import { getPlan } from "./plans";
import { parseYoutubeId } from "./utils";
import { buildDiagramBlocks } from "./engine/diagramService";
import type {
  ExtractedContent,
  GenerationOptions,
  NoteBlock,
  PlanId,
  SourceType,
  StructuredNote,
} from "./types";
import mongoose from "mongoose";

async function setStage(id: string, stage: string, progress: number) {
  await ProcessingJob.updateOne({ _id: id }, { state: "processing", stage, progress });
}

export async function runJob(jobId: string) {
  await connectDb();
  const job = await ProcessingJob.findById(jobId);
  if (!job || job.state === "cancelled") return;
  try {
    await setStage(jobId, "Extracting content...", 10);
    const payload = job.payload as {
      options: GenerationOptions;
      text?: string;
      youtubeUrl?: string;
      fileId?: string;
      title?: string;
      folderId?: string;
      ocrText?: string;
    };
    const user = await User.findById(job.userId);
    if (!user) throw new Error("User missing");
    const plan = getPlan(user.planId as PlanId);

    let extracted: ExtractedContent;
    let forcedBlocks: NoteBlock[] | null = null;
    const sourceType = job.sourceType as SourceType;

    if (sourceType === "diagram") {
      await setStage(jobId, "Building study diagram...", 35);
      const prompt = (payload.options.diagramPrompt || payload.text || "").trim();
      if (!prompt && !payload.fileId) {
        throw new Error("Describe the diagram or upload a reference image.");
      }
      let fromImage = false;
      let workingPrompt = prompt;
      if (payload.fileId && !prompt) {
        const upload = await Upload.findOne({ _id: payload.fileId, userId: job.userId });
        if (!upload) throw new Error("Upload not found.");
        const buf = await readUpload(upload.path);
        const ocr = await extractImageOcr(buf, upload.originalName);
        workingPrompt = ocr.text;
        fromImage = true;
      } else if (payload.fileId) {
        fromImage = true;
      }
      forcedBlocks = buildDiagramBlocks({
        prompt: workingPrompt,
        style: payload.options.diagramStyle || "handwritten",
        templateId: payload.options.diagramTemplate,
        fromImage,
        kind: payload.options.diagramKind,
        colorMode: payload.options.diagramColorMode,
        labelled: payload.options.diagramLabelled,
        flowchartSteps: payload.options.flowchartSteps,
      });
      extracted = {
        text: workingPrompt,
        titleHint: payload.title || "Study diagram",
        warnings: fromImage
          ? ["Reference image was converted into a clean handwritten study sketch."]
          : [],
      };
    } else if (sourceType === "text") {
      extracted = { text: payload.text || "", titleHint: payload.title, warnings: [] };
    } else if (sourceType === "youtube") {
      if (payload.text?.trim()) {
        extracted = {
          text: payload.text,
          titleHint: payload.title,
          youtubeUrl: payload.youtubeUrl,
          youtubeVideoId: payload.youtubeUrl
            ? parseYoutubeId(payload.youtubeUrl) || undefined
            : undefined,
          warnings: [
            "Notes were generated from a pasted transcript, not from automatic captions.",
          ],
        };
      } else {
        extracted = await extractYoutube(payload.youtubeUrl || "");
        const last = extracted.transcript?.at(-1);
        if (last && last.offset / 1000 > plan.maxYoutubeSeconds) {
          throw new Error(
            `This lecture is longer than your plan allows (${Math.floor(plan.maxYoutubeSeconds / 60)} minutes).`,
          );
        }
      }
    } else if (sourceType === "pdf") {
      const upload = await Upload.findOne({ _id: payload.fileId, userId: job.userId });
      if (!upload) throw new Error("Upload not found.");
      const buf = await readUpload(upload.path);
      extracted = await extractPdf(buf, upload.originalName);
      if (!extracted.text.trim()) {
        throw new Error(
          extracted.warnings[0] ||
            "This PDF has no selectable text. Try the Image flow with OCR, or a text-based PDF.",
        );
      }
    } else {
      const edited = payload.ocrText || payload.text;
      if (edited?.trim()) {
        extracted = { text: edited, titleHint: payload.title, fileName: payload.title, warnings: [] };
      } else {
        const upload = await Upload.findOne({ _id: payload.fileId, userId: job.userId });
        if (!upload) throw new Error("Upload not found.");
        const buf = await readUpload(upload.path);
        extracted = await extractImageOcr(buf, upload.originalName);
      }
    }

    await setStage(jobId, "Structuring notes...", 45);
    let structured: StructuredNote;
    if (forcedBlocks) {
      structured = {
        title: (payload.title || extracted.titleHint || "Study diagram").slice(0, 160),
        subject: "general",
        language: payload.options.language,
        chapters: [],
        blocks: forcedBlocks,
        keywords: [],
        source: { type: "diagram", fileName: extracted.fileName },
      };
    } else {
      structured = processExtractedContent(extracted, payload.options);
    }

    await setStage(jobId, "Formatting pages...", 70);
    const pages = paginateNote(structured.blocks, plan.maxPagesPerNote);

    await setStage(jobId, "Rendering handwritten pages...", 88);
    const searchText = structured.blocks
      .map((b) => JSON.stringify(b))
      .join(" ")
      .slice(0, 20000);

    const note = await Note.create({
      userId: job.userId,
      folderId: payload.folderId || undefined,
      title: (payload.title || structured.title).slice(0, 160),
      sourceType,
      originalSource: structured.source,
      structuredContent: structured,
      pages,
      handwritingStyle: payload.options.handwritingStyle,
      paperStyleId: payload.options.paperStyleId || undefined,
      language: payload.options.language,
      noteLength: payload.options.noteLength,
      subject: structured.subject,
      pageCount: pages.length,
      options: payload.options,
      searchText: `${payload.title || structured.title} ${structured.subject} ${searchText}`,
    });

    await incrementUsage(job.userId as mongoose.Types.ObjectId, user, sourceType);
    await setStage(jobId, "Preparing export...", 96);
    await ProcessingJob.updateOne(
      { _id: jobId },
      { state: "completed", stage: "Completed", progress: 100, noteId: note._id },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Processing failed. Please try again.";
    await ProcessingJob.updateOne(
      { _id: jobId },
      { state: "failed", stage: "Failed", progress: 100, error: message },
    );
  }
}
