import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { Note } from "@/models/Note";
import { handleRouteError, json } from "@/lib/http";
import { NotFoundError } from "@/lib/errors";

function serialize(note: InstanceType<typeof Note>) {
  return {
    id: String(note._id),
    title: note.title,
    sourceType: note.sourceType,
    originalSource: note.originalSource,
    structuredContent: note.structuredContent,
    pages: note.pages,
    handwritingStyle: note.handwritingStyle,
    language: note.language,
    noteLength: note.noteLength,
    subject: note.subject,
    pageCount: note.pageCount,
    options: note.options,
    favorite: note.favorite,
    archived: note.archived,
    folderId: note.folderId ? String(note.folderId) : null,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    await connectDb();
    const note = await Note.findOne({ _id: id, userId: user._id });
    if (!note) throw new NotFoundError("Note not found.");
    return json({ note: serialize(note) });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    await connectDb();
    const note = await Note.findOne({ _id: id, userId: user._id });
    if (!note) throw new NotFoundError("Note not found.");
    const body = await req.json();
    if (typeof body.title === "string") note.title = body.title.slice(0, 160);
    if (typeof body.favorite === "boolean") note.favorite = body.favorite;
    if (typeof body.archived === "boolean") note.archived = body.archived;
    if (body.folderId === null) note.folderId = undefined;
    else if (typeof body.folderId === "string") note.folderId = body.folderId;
    if (Array.isArray(body.pages)) note.pages = body.pages;
    if (body.structuredContent) note.structuredContent = body.structuredContent;
    await note.save();
    return json({ note: serialize(note) });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    await connectDb();
    const res = await Note.deleteOne({ _id: id, userId: user._id });
    if (!res.deletedCount) throw new NotFoundError("Note not found.");
    return json({ ok: true });
  } catch (e) {
    return handleRouteError(e);
  }
}
