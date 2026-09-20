import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { ProcessingJob } from "@/models/ProcessingJob";
import { handleRouteError, json } from "@/lib/http";
import { NotFoundError } from "@/lib/errors";
import { connectDb } from "@/lib/db";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    await connectDb();
    const job = await ProcessingJob.findOne({ _id: id, userId: user._id });
    if (!job) throw new NotFoundError("Job not found.");
    return json({
      id: String(job._id),
      state: job.state,
      stage: job.stage,
      progress: job.progress,
      error: job.error,
      noteId: job.noteId ? String(job.noteId) : null,
    });
  } catch (e) {
    return handleRouteError(e);
  }
}
