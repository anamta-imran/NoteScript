import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { User } from "@/models/User";
import { handleRouteError, json } from "@/lib/http";
import { hashPassword, toPublicUser, verifyPassword } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { passwordSchema } from "@/lib/validation";
import { LANGUAGES, HANDWRITING_STYLES, NOTE_LENGTHS, INTERFACE_LANGUAGES } from "@/lib/types";

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    if (typeof body.name === "string") user.name = body.name.trim().slice(0, 80);
    if (typeof body.timezone === "string") user.timezone = body.timezone.slice(0, 80);
    if (typeof body.avatarUrl === "string") user.avatarUrl = body.avatarUrl;
    if (LANGUAGES.includes(body.preferredLanguage)) user.preferredLanguage = body.preferredLanguage;
    if (HANDWRITING_STYLES.includes(body.preferredHandwritingStyle)) {
      user.preferredHandwritingStyle = body.preferredHandwritingStyle;
    }
    if (NOTE_LENGTHS.includes(body.preferredNoteLength)) {
      user.preferredNoteLength = body.preferredNoteLength;
    }
    if (INTERFACE_LANGUAGES.includes(body.interfaceLanguage)) {
      user.interfaceLanguage = body.interfaceLanguage;
    }
    await user.save();
    return json({ user: toPublicUser(user) });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function DELETE() {
  try {
    const user = await requireUser();
    await connectDb();
    const { Note } = await import("@/models/Note");
    const { Folder } = await import("@/models/Folder");
    const { Usage } = await import("@/models/Usage");
    const { ShareLink } = await import("@/models/ShareLink");
    const { ProcessingJob } = await import("@/models/ProcessingJob");
    await Promise.all([
      Note.deleteMany({ userId: user._id }),
      Folder.deleteMany({ userId: user._id }),
      Usage.deleteMany({ userId: user._id }),
      ShareLink.deleteMany({ userId: user._id }),
      ProcessingJob.deleteMany({ userId: user._id }),
    ]);
    await User.deleteOne({ _id: user._id });
    const { clearSession } = await import("@/lib/auth");
    await clearSession();
    return json({ ok: true });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireUser();
    const { currentPassword, password, confirmPassword } = await req.json();
    if (password !== confirmPassword) throw new AppError("Passwords do not match.");
    passwordSchema.parse(password);
    if (!(await verifyPassword(currentPassword || "", user.passwordHash))) {
      throw new AppError("Current password is incorrect.", 400);
    }
    await connectDb();
    await User.updateOne({ _id: user._id }, { passwordHash: await hashPassword(password) });
    return json({ message: "Password updated." });
  } catch (e) {
    return handleRouteError(e);
  }
}
