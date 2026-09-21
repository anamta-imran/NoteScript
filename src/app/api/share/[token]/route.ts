import { connectDb } from "@/lib/db";
import { ShareLink } from "@/models/ShareLink";
import { Note } from "@/models/Note";
import { handleRouteError, json } from "@/lib/http";
import { NotFoundError } from "@/lib/errors";
import { NextRequest } from "next/server";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await ctx.params;
    await connectDb();
    const link = await ShareLink.findOne({ token, enabled: true });
    if (!link) throw new NotFoundError("This share link is not available.");
    const note = await Note.findById(link.noteId);
    if (!note) throw new NotFoundError("This share link is not available.");
    return json({
      note: {
        title: note.title,
        pages: note.pages,
        handwritingStyle: note.handwritingStyle,
        paperStyleId: note.paperStyleId || null,
        language: note.language,
        subject: note.subject,
        pageCount: note.pageCount,
        structuredContent: note.structuredContent,
      },
    });
  } catch (e) {
    return handleRouteError(e);
  }
}
