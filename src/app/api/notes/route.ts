import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { Note } from "@/models/Note";
import { handleRouteError, json } from "@/lib/http";

function serialize(note: InstanceType<typeof Note>) {
  return {
    id: String(note._id),
    title: note.title,
    sourceType: note.sourceType,
    originalSource: note.originalSource,
    structuredContent: note.structuredContent,
    pages: note.pages,
    handwritingStyle: note.handwritingStyle,
    paperStyleId: note.paperStyleId || null,
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

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    await connectDb();
    const sp = req.nextUrl.searchParams;
    const q = (sp.get("q") || "").trim();
    const subject = sp.get("subject");
    const folderId = sp.get("folderId");
    const sort = sp.get("sort") || "newest";
    const archived = sp.get("archived") === "true";
    const favorite = sp.get("favorite") === "true";
    const page = Math.max(1, Number(sp.get("page") || 1));
    const limit = 20;

    const filter: Record<string, unknown> = { userId: user._id, archived };
    if (favorite) filter.favorite = true;
    if (subject && subject !== "all") filter.subject = subject;
    if (folderId) filter.folderId = folderId;
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { subject: { $regex: q, $options: "i" } },
        { searchText: { $regex: q, $options: "i" } },
      ];
    }
    const sortMap: Record<string, Record<string, 1 | -1>> = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      updated: { updatedAt: -1 },
      alpha: { title: 1 },
    };
    const [items, total] = await Promise.all([
      Note.find(filter)
        .sort(sortMap[sort] || sortMap.newest)
        .skip((page - 1) * limit)
        .limit(limit),
      Note.countDocuments(filter),
    ]);
    return json({ items: items.map(serialize), total, page, pageSize: limit });
  } catch (e) {
    return handleRouteError(e);
  }
}
