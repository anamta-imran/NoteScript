"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { api } from "@/lib/api";

export default function ResetPage() {
  const token = useSearchParams().get("token") || "";
  const router = useRouter();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);

    try {
      await api("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          token,
          password: form.get("password"),
          confirmPassword: form.get("confirmPassword"),
        }),
      });

      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-[#fcfbfe] px-4 py-10 sm:px-6 sm:py-16">
      {/* Soft background glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-[700px] -translate-x-1/2 rounded-full bg-[#eee7f8] opacity-70 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-180px)] max-w-md items-center justify-center">
        <div className="w-full">
          {/* Brand */}
          <div className="mb-8 flex items-center justify-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#80639d] text-sm font-bold text-white shadow-[0_8px_20px_rgba(128,99,157,0.25)]">
              N
            </div>

            <span className="text-lg font-semibold tracking-tight text-[#302838]">
              NoteScript
            </span>
          </div>

          {/* Card */}
          <div className="rounded-[28px] border border-[#e9e4ee] bg-white p-6 shadow-[0_20px_60px_rgba(48,40,56,0.08)] sm:p-8">
            {/* Icon */}
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0e9f8] text-[#80639d]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path
                  d="M7 10V8a5 5 0 0 1 10 0v2"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <rect
                  x="4"
                  y="10"
                  width="16"
                  height="10"
                  rx="2.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M12 14v2"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="mt-5 text-center">
              <span className="inline-flex rounded-full bg-[#f0e9f8] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#72558f]">
                Almost there
              </span>

              <h1 className="mt-4 text-2xl font-semibold tracking-tight text-[#302838] sm:text-[28px]">
                Choose a new password
              </h1>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#756d7d]">
                Create a new password for your NoteScript account.
              </p>
            </div>

            {!token ? (
              <div className="mt-7 rounded-2xl border border-red-100 bg-red-50 px-4 py-4">
                <p className="text-sm leading-6 text-red-600">
                  This reset link is missing a token. Please request a new
                  password reset link.
                </p>

                <Link
                  href="/forgot-password"
                  className="mt-3 inline-flex text-sm font-semibold text-[#80639d] hover:text-[#72558f]"
                >
                  Request a new link →
                </Link>
              </div>
            ) : (
              <form className="mt-7 space-y-5" onSubmit={onSubmit}>
                <Field
                  label="New password"
                  htmlFor="password"
                  hint="Use at least 8 characters with upper, lower, and a number."
                >
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                  />
                </Field>

                <Field
                  label="Confirm password"
                  htmlFor="confirmPassword"
                >
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                  />
                </Field>

                {error ? (
                  <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                    <p className="text-sm leading-5 text-red-600">{error}</p>
                  </div>
                ) : null}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Updating…" : "Update password"}
                </Button>
              </form>
            )}

            <div className="my-7 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#eeeaf1]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#aaa2b2]">
                Secure access
              </span>
              <div className="h-px flex-1 bg-[#eeeaf1]" />
            </div>

            <p className="text-center text-sm text-[#756d7d]">
              Remembered your password?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#80639d] transition hover:text-[#72558f]"
              >
                Log in
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs leading-5 text-[#aaa2b2]">
            Your account stays protected with your new password.
          </p>
        </div>
      </div>
    </main>
  );
}