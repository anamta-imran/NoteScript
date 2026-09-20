import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { Upload } from "@/models/Upload";
import { readUpload, isPathInsideUploads } from "@/lib/storage";
import { handleRouteError } from "@/lib/http";
import { NotFoundError } from "@/lib/errors";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    await connectDb();
    const upload = await Upload.findOne({ _id: id, userId: user._id });
    if (!upload || !isPathInsideUploads(upload.path)) throw new NotFoundError();
    const buf = await readUpload(upload.path);
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": upload.mimeType,
        "Content-Disposition": `inline; filename="${upload.originalName}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (e) {
    return handleRouteError(e);
  }
}
