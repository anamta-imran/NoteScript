import { Polar } from "@polar-sh/sdk";

import { AppError } from "./errors";

export type PolarServer = "sandbox" | "production";

export function getPolarServer(): PolarServer {
  const env = process.env.POLAR_ENV || process.env.NEXT_PUBLIC_POLAR_ENV || "sandbox";
  return env === "production" ? "production" : "sandbox";
}

export function polarConfigured(): boolean {
  return Boolean(process.env.POLAR_ACCESS_TOKEN);
}

function getPolarAccessToken(): string {
  const token = process.env.POLAR_ACCESS_TOKEN;

  if (!token) {
    throw new AppError(
      "Polar is not configured. Set POLAR_ACCESS_TOKEN in your environment.",
      503,
      "PAYMENTS_DISABLED",
    );
  }

  return token;
}

/**
 * Server-side Polar API client. Access token must stay server-only.
 */
export function getPolar(): Polar {
  return new Polar({
    accessToken: getPolarAccessToken(),
    server: getPolarServer(),
  });
}
