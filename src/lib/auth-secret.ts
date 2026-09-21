import { AppError } from "./errors";

export const AUTH_SECRET_MIN_LENGTH = 32;

/**
 * Thrown when AUTH_SECRET is missing or too short.
 * Safe for clients: does not reveal the secret value or its characters.
 */
export class AuthConfigError extends AppError {
  constructor() {
    super("Authentication is temporarily unavailable.", 503, "AUTH_MISCONFIGURED");
    this.name = "AuthConfigError";
  }
}

function readAuthSecret(): string {
  const raw = process.env.AUTH_SECRET;
  return typeof raw === "string" ? raw.trim() : "";
}

/** True when AUTH_SECRET is present and meets the minimum length (after trim). */
export function authSecretConfigured(): boolean {
  return readAuthSecret().length >= AUTH_SECRET_MIN_LENGTH;
}

/**
 * Resolve the signing secret for session JWTs.
 * Never logs or returns diagnostic text that includes the secret value.
 */
export function resolveAuthSecret(): string {
  const secret = readAuthSecret();
  if (secret.length < AUTH_SECRET_MIN_LENGTH) {
    // Length only — never log the secret itself.
    console.error(
      `[auth] AUTH_SECRET is missing or shorter than ${AUTH_SECRET_MIN_LENGTH} characters (configuredLength=${secret.length}). Set a server-only AUTH_SECRET of at least ${AUTH_SECRET_MIN_LENGTH} characters for this environment and redeploy.`,
    );
    throw new AuthConfigError();
  }
  return secret;
}

export function authSecretKey(): Uint8Array {
  return new TextEncoder().encode(resolveAuthSecret());
}
