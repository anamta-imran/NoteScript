import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { publicErrorMessage } from "./errors";
import { clientIp, rateLimit } from "./rate-limit";

export function json<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function handleRouteError(error: unknown) {
  if (error instanceof ZodError) {
    return json(
      { error: error.issues[0]?.message || "Invalid input.", code: "VALIDATION" },
      400,
    );
  }
  const pub = publicErrorMessage(error);
  return json({ error: pub.message, code: pub.code }, pub.status);
}

export function limit(req: NextRequest, name: string, max: number, windowMs: number) {
  rateLimit(`${name}:${clientIp(req.headers)}`, max, windowMs);
}

export function assertSameOrigin(req: NextRequest) {
  if (req.method === "GET" || req.method === "HEAD") return;
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return;
  try {
    const o = new URL(origin);
    if (o.host !== host) {
      throw new Error("Bad origin");
    }
  } catch {
    throw new Error("Bad origin");
  }
}
