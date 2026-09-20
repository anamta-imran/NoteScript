import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { Folder } from "@/models/Folder";
import { Note } from "@/models/Note";
import { handleRouteError, json } from "@/lib/http";
import { NotFoundError } from "@/lib/errors";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    await connectDb();
    const folder = await Folder.findOne({ _id: id, userId: user._id });
    if (!folder) throw new NotFoundError("Folder not found.");
    const notes = await Note.find({ userId: user._id, folderId: folder._id, archived: false }).sort({
      updatedAt: -1,
    });
    return json({
      folder: { id: String(folder._id), name: folder.name },
      notes: notes.map((n) => ({
        id: String(n._id),
        title: n.title,
        subject: n.subject,
        pageCount: n.pageCount,
        updatedAt: n.updatedAt,
        handwritingStyle: n.handwritingStyle,
      })),
    });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const { name } = await req.json();
    await connectDb();
    const folder = await Folder.findOne({ _id: id, userId: user._id });
    if (!folder) throw new NotFoundError("Folder not found.");
    folder.name = String(name || "").trim().slice(0, 80);
    await folder.save();
    return json({ folder: { id: String(folder._id), name: folder.name } });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    await connectDb();
    const folder = await Folder.findOne({ _id: id, userId: user._id });
    if (!folder) throw new NotFoundError("Folder not found.");
    await Note.updateMany({ userId: user._id, folderId: folder._id }, { $unset: { folderId: 1 } });
    await folder.deleteOne();
    return json({ ok: true });
  } catch (e) {
    return handleRouteError(e);
  }
}
