import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { Note } from "@/models/Note";
import { handleRouteError, json } from "@/lib/http";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { getPlan } from "@/lib/plans";
import type { PlanId } from "@/lib/types";

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const plan = getPlan(user.planId as PlanId);
    if (!plan.duplicateNotes) {
      throw new ForbiddenError("Duplicating notes requires Student or Pro.");
    }
    const { id } = await ctx.params;
    await connectDb();
    const note = await Note.findOne({ _id: id, userId: user._id });
    if (!note) throw new NotFoundError("Note not found.");
    const copy = await Note.create({
      userId: user._id,
      folderId: note.folderId,
      title: `${note.title} (copy)`,
      sourceType: note.sourceType,
      originalSource: note.originalSource,
      structuredContent: note.structuredContent,
      pages: note.pages,
      handwritingStyle: note.handwritingStyle,
      paperStyleId: note.paperStyleId,
      language: note.language,
      noteLength: note.noteLength,
      subject: note.subject,
      pageCount: note.pageCount,
      options: note.options,
      searchText: note.searchText,
    });
    return json({ id: String(copy._id) }, 201);
  } catch (e) {
    return handleRouteError(e);
  }
}
