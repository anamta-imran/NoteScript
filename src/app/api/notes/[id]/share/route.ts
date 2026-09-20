import { NextRequest } from "next/server";
import { nanoid } from "nanoid";
import { requireUser } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { Note } from "@/models/Note";
import { ShareLink } from "@/models/ShareLink";
import { handleRouteError, json } from "@/lib/http";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { getPlan } from "@/lib/plans";
import type { PlanId } from "@/lib/types";
import { appUrl } from "@/lib/auth";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const { enabled } = await req.json();
    const plan = getPlan(user.planId as PlanId);
    if (enabled && !plan.shareableLinks) {
      throw new ForbiddenError("Shareable links require Student or Pro.");
    }
    await connectDb();
    const note = await Note.findOne({ _id: id, userId: user._id });
    if (!note) throw new NotFoundError("Note not found.");
    let link = await ShareLink.findOne({ noteId: note._id, userId: user._id });
    if (!link) {
      link = await ShareLink.create({
        userId: user._id,
        noteId: note._id,
        token: nanoid(24),
        enabled: Boolean(enabled),
      });
    } else {
      link.enabled = Boolean(enabled);
      await link.save();
    }
    return json({
      enabled: link.enabled,
      url: link.enabled ? `${appUrl()}/share/${link.token}` : null,
    });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    await connectDb();
    const link = await ShareLink.findOne({ noteId: id, userId: user._id });
    return json({
      enabled: Boolean(link?.enabled),
      url: link?.enabled ? `${appUrl()}/share/${link.token}` : null,
    });
  } catch (e) {
    return handleRouteError(e);
  }
}
