import { NextRequest } from "next/server";
import { after } from "next/server";
import { requireUser } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { createJobSchema } from "@/lib/validation";
import { ProcessingJob } from "@/models/ProcessingJob";
import { assertCanGenerate } from "@/lib/usage";
import { runJob } from "@/lib/jobs";
import { handleRouteError, json, limit } from "@/lib/http";
import { AppError } from "@/lib/errors";
import type { SourceType } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    limit(req, "jobs", 20, 60_000);
    const user = await requireUser();
    const body = createJobSchema.parse(await req.json());
    const chars = Math.max(
      (body.text || "").length,
      (body.options.diagramPrompt || "").length,
    );
    await assertCanGenerate(user, body.sourceType as SourceType, body.options, chars);
    if (body.sourceType === "text" && !(body.text || "").trim()) {
      throw new AppError("Paste some study text first.", 400);
    }
    if (body.sourceType === "youtube" && !body.youtubeUrl && !(body.text || "").trim()) {
      throw new AppError("Enter a YouTube URL, or paste a transcript.", 400);
    }
    if (body.sourceType === "pdf" && !body.fileId) {
      throw new AppError("Upload a PDF first.", 400);
    }
    if (body.sourceType === "image" && !body.fileId && !body.text) {
      throw new AppError("Upload a file first.", 400);
    }
    if (
      body.sourceType === "diagram" &&
      !(body.options.diagramPrompt || body.text || "").trim() &&
      !body.fileId
    ) {
      throw new AppError("Describe the diagram or upload a reference image.", 400);
    }
    await connectDb();
    const job = await ProcessingJob.create({
      userId: user._id,
      state: "queued",
      stage: "Queued",
      progress: 0,
      sourceType: body.sourceType,
      payload: body,
    });
    after(() => runJob(String(job._id)));
    return json({ jobId: String(job._id) }, 202);
  } catch (e) {
    return handleRouteError(e);
  }
}
