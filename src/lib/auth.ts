import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import { connectDb } from "./db";
import { User, type UserDoc } from "@/models/User";
import { UnauthorizedError } from "./errors";
import { AuthConfigError, authSecretKey } from "./auth-secret";
import type { PublicUser } from "./types";

const COOKIE = process.env.AUTH_COOKIE_NAME || "notescript_session";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function randomToken() {
  return randomBytes(32).toString("hex");
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(authSecretKey());
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSessionUserId(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, authSecretKey());
    return (payload.sub as string) ?? null;
  } catch (error) {
    // Misconfigured AUTH_SECRET must surface as 503 via requireUser, not as "logged out".
    if (error instanceof AuthConfigError) throw error;
    return null;
  }
}

export function toPublicUser(user: UserDoc): PublicUser {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    avatarUrl: user.avatarUrl ?? undefined,
    preferredLanguage: user.preferredLanguage,
    preferredHandwritingStyle: user.preferredHandwritingStyle as PublicUser["preferredHandwritingStyle"],
    preferredNoteLength: user.preferredNoteLength,
    timezone: user.timezone,
    interfaceLanguage: (user.interfaceLanguage as PublicUser["interfaceLanguage"]) || "en",
    planId: user.planId,
    billingCycle: user.billingCycle ?? undefined,
    subscriptionStatus: user.subscriptionStatus,
    currentPeriodEnd: user.currentPeriodEnd?.toISOString(),
    cancelAtPeriodEnd: user.cancelAtPeriodEnd,
  };
}

export async function requireUser(): Promise<UserDoc> {
  await connectDb();
  const id = await getSessionUserId();
  if (!id) throw new UnauthorizedError();
  const user = await User.findById(id);
  if (!user) throw new UnauthorizedError();
  return user as UserDoc;
}

export function appUrl() {
  return process.env.APP_URL || "http://localhost:3000";
}
