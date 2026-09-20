import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { Folder } from "@/models/Folder";
import { Note } from "@/models/Note";
import { handleRouteError, json } from "@/lib/http";
import { assertCanCreateFolder } from "@/lib/usage";

export async function GET() {
  try {
    const user = await requireUser();
    await connectDb();
    const folders = await Folder.find({ userId: user._id }).sort({ name: 1 });
    const withCounts = await Promise.all(
      folders.map(async (f) => ({
        id: String(f._id),
        name: f.name,
        createdAt: f.createdAt,
        noteCount: await Note.countDocuments({ userId: user._id, folderId: f._id }),
      })),
    );
    return json({ folders: withCounts });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    await assertCanCreateFolder(user);
    const { name } = await req.json();
    const trimmed = String(name || "").trim();
    if (trimmed.length < 1) {
      return json({ error: "Folder name is required." }, 400);
    }
    await connectDb();
    const folder = await Folder.create({ userId: user._id, name: trimmed.slice(0, 80) });
    return json({ folder: { id: String(folder._id), name: folder.name, noteCount: 0 } }, 201);
  } catch (e) {
    return handleRouteError(e);
  }
}
