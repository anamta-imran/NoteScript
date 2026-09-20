import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { Note } from "@/models/Note";
import { handleRouteError, json } from "@/lib/http";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { getPlan } from "@/lib/plans";
import type { NotePage, PlanId, StructuredNote } from "@/lib/types";
import { regeneratePageLayout } from "@/lib/engine";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const plan = getPlan(user.planId as PlanId);
    if (!plan.regeneratePage) {
      throw new ForbiddenError("Page regeneration is included with Student and Pro.");
    }
    const { id } = await ctx.params;
    const { pageIndex } = await req.json();
    await connectDb();
    const note = await Note.findOne({ _id: id, userId: user._id });
    if (!note) throw new NotFoundError("Note not found.");
    const pages = note.pages as NotePage[];
    const structured = note.structuredContent as StructuredNote;
    const page = pages[pageIndex];
    if (!page) throw new NotFoundError("Page not found.");
    pages[pageIndex] = regeneratePageLayout(page, structured.blocks);
    note.pages = pages;
    await note.save();
    return json({ pages });
  } catch (e) {
    return handleRouteError(e);
  }
}
