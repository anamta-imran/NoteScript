import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { authSecretConfigured, resolveAuthSecret } from "@/lib/auth-secret";

const PROTECTED = [
  "/dashboard",
  "/create",
  "/notes",
  "/folders",
  "/settings",
  "/billing",
];

async function sessionIsValid(token: string): Promise<boolean> {
  if (!authSecretConfigured()) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(resolveAuthSecret()));
    return true;
  } catch {
    return false;
  }
}

function loginRedirect(req: NextRequest, pathname: string) {
  const cookie = process.env.AUTH_COOKIE_NAME || "notescript_session";
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  // Preserve query (e.g. /billing?plan=student&cycle=monthly) for post-login checkout.
  const nextPath = `${pathname}${req.nextUrl.search || ""}`;
  url.search = "";
  url.searchParams.set("next", nextPath);
  const res = NextResponse.redirect(url);
  res.cookies.delete(cookie);
  return res;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!isProtected) return NextResponse.next();

  const cookie = process.env.AUTH_COOKIE_NAME || "notescript_session";
  const token = req.cookies.get(cookie)?.value;
  if (!token) {
    return loginRedirect(req, pathname);
  }

  if (!(await sessionIsValid(token))) {
    // Invalid/expired cookie — clear and send to login (avoids dashboard↔login white flash).
    return loginRedirect(req, pathname);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/create/:path*",
    "/notes/:path*",
    "/folders/:path*",
    "/settings/:path*",
    "/billing/:path*",
    "/dashboard",
    "/create",
    "/notes",
    "/folders",
    "/settings",
    "/billing",
  ],
};
