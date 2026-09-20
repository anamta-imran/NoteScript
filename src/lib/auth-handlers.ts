import { NextRequest } from "next/server";
import { connectDb } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { signupSchema, loginSchema } from "@/lib/validation";
import { User } from "@/models/User";
import { EmailVerificationToken, PasswordResetToken } from "@/models/Tokens";
import {
  hashPassword,
  verifyPassword,
  createSession,
  clearSession,
  toPublicUser,
  randomToken,
  hashToken,
} from "@/lib/auth";
import { sendResetEmail, sendVerificationEmail } from "@/lib/email";
import { AppError } from "@/lib/errors";
import { handleRouteError, json, limit } from "@/lib/http";
import { getUsage } from "@/lib/usage";
import { Folder } from "@/models/Folder";
import { Note } from "@/models/Note";

export async function POST_SIGNUP(req: NextRequest) {
  try {
    limit(req, "signup", 8, 60_000);
    const body = signupSchema.parse(await req.json());
    await connectDb();
    const exists = await User.findOne({ email: body.email.toLowerCase() });
    if (exists) throw new AppError("An account with this email already exists.", 409, "EMAIL_TAKEN");
    const skipVerify = process.env.AUTH_SKIP_EMAIL_VERIFICATION === "true";
    const user = await User.create({
      name: body.name,
      email: body.email.toLowerCase(),
      passwordHash: await hashPassword(body.password),
      emailVerified: skipVerify,
    });
    await Folder.create({ userId: user._id, name: "My Notes" });
    if (!skipVerify) {
      const token = randomToken();
      await EmailVerificationToken.create({
        userId: user._id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      });
      await sendVerificationEmail(user.email, token);
    }
    await createSession(String(user._id));
    return json({ user: toPublicUser(user) }, 201);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function POST_LOGIN(req: NextRequest) {
  try {
    limit(req, "login", 12, 60_000);
    const body = loginSchema.parse(await req.json());
    await connectDb();
    const user = await User.findOne({ email: body.email.toLowerCase() });
    if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
      throw new AppError("Incorrect email or password.", 401, "BAD_CREDENTIALS");
    }
    await createSession(String(user._id));
    return json({ user: toPublicUser(user) });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function POST_LOGOUT() {
  await clearSession();
  return json({ ok: true });
}

export async function GET_ME() {
  try {
    const user = await requireUser();
    const usage = await getUsage(user);
    const notes = await Note.countDocuments({ userId: user._id, archived: false });
    const folders = await Folder.countDocuments({ userId: user._id });
    return json({ user: toPublicUser(user), usage, stats: { notes, folders } });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function POST_FORGOT(req: NextRequest) {
  try {
    limit(req, "forgot", 5, 60_000);
    const { email } = await req.json();
    await connectDb();
    const user = await User.findOne({ email: String(email || "").toLowerCase() });
    if (user) {
      const token = randomToken();
      await PasswordResetToken.create({
        userId: user._id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      });
      await sendResetEmail(user.email, token);
    }
    return json({
      message: "If that email is registered, we sent a reset link.",
    });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function POST_RESET(req: NextRequest) {
  try {
    limit(req, "reset", 8, 60_000);
    const { token, password, confirmPassword } = await req.json();
    if (!token || password !== confirmPassword) {
      throw new AppError("Passwords do not match.", 400);
    }
    const { passwordSchema } = await import("@/lib/validation");
    passwordSchema.parse(password);
    await connectDb();
    const doc = await PasswordResetToken.findOne({
      tokenHash: hashToken(String(token)),
      usedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    });
    if (!doc) throw new AppError("This reset link is invalid or expired.", 400);
    const user = await User.findById(doc.userId);
    if (!user) throw new AppError("This reset link is invalid or expired.", 400);
    user.passwordHash = await hashPassword(password);
    await user.save();
    doc.usedAt = new Date();
    await doc.save();
    return json({ message: "Password updated. You can sign in now." });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function POST_VERIFY(req: NextRequest) {
  try {
    const { token } = await req.json();
    await connectDb();
    const doc = await EmailVerificationToken.findOne({
      tokenHash: hashToken(String(token || "")),
      usedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    });
    if (!doc) throw new AppError("This verification link is invalid or expired.", 400);
    await User.updateOne({ _id: doc.userId }, { emailVerified: true });
    doc.usedAt = new Date();
    await doc.save();
    return json({ message: "Email verified." });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function POST_RESEND() {
  try {
    const user = await requireUser();
    if (user.emailVerified) return json({ message: "Email already verified." });
    const token = randomToken();
    await EmailVerificationToken.create({
      userId: user._id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    });
    await sendVerificationEmail(user.email, token);
    return json({ message: "Verification email sent." });
  } catch (e) {
    return handleRouteError(e);
  }
}
