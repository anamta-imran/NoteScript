import { afterEach, describe, expect, it, vi } from "vitest";
import {
  AUTH_SECRET_MIN_LENGTH,
  AuthConfigError,
  authSecretConfigured,
  authSecretKey,
  resolveAuthSecret,
} from "@/lib/auth-secret";

const ORIGINAL = process.env.AUTH_SECRET;

afterEach(() => {
  if (ORIGINAL === undefined) delete process.env.AUTH_SECRET;
  else process.env.AUTH_SECRET = ORIGINAL;
  vi.restoreAllMocks();
});

describe("resolveAuthSecret / authSecretConfigured", () => {
  it("accepts a secret of at least 32 characters", () => {
    process.env.AUTH_SECRET = "a".repeat(AUTH_SECRET_MIN_LENGTH);
    expect(authSecretConfigured()).toBe(true);
    expect(resolveAuthSecret()).toHaveLength(AUTH_SECRET_MIN_LENGTH);
    expect(authSecretKey()).toBeInstanceOf(Uint8Array);
  });

  it("trims surrounding whitespace before validating length", () => {
    process.env.AUTH_SECRET = `  ${"b".repeat(AUTH_SECRET_MIN_LENGTH)}  `;
    expect(authSecretConfigured()).toBe(true);
    expect(resolveAuthSecret()).toBe("b".repeat(AUTH_SECRET_MIN_LENGTH));
  });

  it("rejects missing AUTH_SECRET with AuthConfigError (no secret in message)", () => {
    delete process.env.AUTH_SECRET;
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(authSecretConfigured()).toBe(false);
    expect(() => resolveAuthSecret()).toThrow(AuthConfigError);
    try {
      resolveAuthSecret();
    } catch (e) {
      expect(e).toBeInstanceOf(AuthConfigError);
      const err = e as AuthConfigError;
      expect(err.code).toBe("AUTH_MISCONFIGURED");
      expect(err.status).toBe(503);
      expect(err.message).not.toMatch(/AUTH_SECRET=/);
      expect(err.message.toLowerCase()).not.toContain("character");
    }
    expect(errSpy).toHaveBeenCalled();
    const logged = String(errSpy.mock.calls[0]?.[0] ?? "");
    expect(logged).toContain("AUTH_SECRET");
    expect(logged).toContain("configuredLength=0");
    // Must never echo a secret value into logs from this helper.
    expect(logged).not.toMatch(/AUTH_SECRET=.+/);
  });

  it("rejects secrets shorter than 32 characters", () => {
    process.env.AUTH_SECRET = "c".repeat(AUTH_SECRET_MIN_LENGTH - 1);
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(authSecretConfigured()).toBe(false);
    expect(() => resolveAuthSecret()).toThrow(AuthConfigError);
    expect(errSpy).toHaveBeenCalled();
    const logged = String(errSpy.mock.calls[0]?.[0] ?? "");
    expect(logged).toContain(`configuredLength=${AUTH_SECRET_MIN_LENGTH - 1}`);
    expect(logged).not.toContain("c".repeat(10));
  });
});
