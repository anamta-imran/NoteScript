"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

export default function VerifyPage() {
  const token = useSearchParams().get("token") || "";

  const [message, setMessage] = useState("Verifying your email…");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setMessage("Missing verification token.");
      return;
    }

    api("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    })
      .then(() => {
        setOk(true);
        setMessage("Email verified successfully. You can now generate notes.");
      })
      .catch((e) => {
        setMessage(
          e instanceof Error ? e.message : "Verification failed.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

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
          <div className="rounded-[28px] border border-[#e9e4ee] bg-white p-6 text-center shadow-[0_20px_60px_rgba(48,40,56,0.08)] sm:p-8">
            {/* Status icon */}
            <div
              className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
                ok
                  ? "bg-[#eaf7ef] text-[#2f8f57]"
                  : loading
                    ? "bg-[#f0e9f8] text-[#80639d]"
                    : "bg-red-50 text-red-500"
              }`}
            >
              {ok ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-7 w-7"
                  aria-hidden="true"
                >
                  <path
                    d="M5 12.5 9.5 17 19 7.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : loading ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-7 w-7 animate-spin"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="8"
                    stroke="currentColor"
                    strokeWidth="2"
                    opacity="0.25"
                  />
                  <path
                    d="M20 12a8 8 0 0 0-8-8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-7 w-7"
                  aria-hidden="true"
                >
                  <path
                    d="M12 8v4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="12" cy="16.5" r="1" fill="currentColor" />
                  <path
                    d="M10.3 4.8 3.8 16a2 2 0 0 0 1.7 3h13a2 2 0 0 0 1.7-3L13.7 4.8a2 2 0 0 0-3.4 0Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                </svg>
              )}
            </div>

            <div className="mt-6">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                  ok
                    ? "bg-[#eaf7ef] text-[#2f8f57]"
                    : loading
                      ? "bg-[#f0e9f8] text-[#72558f]"
                      : "bg-red-50 text-red-600"
                }`}
              >
                {ok ? "Verified" : loading ? "Checking" : "Could not verify"}
              </span>

              <h1 className="mt-4 text-2xl font-semibold tracking-tight text-[#302838] sm:text-[28px]">
                {ok ? "Email verified!" : "Email verification"}
              </h1>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#756d7d]">
                {message}
              </p>
            </div>

            {ok ? (
              <div className="mt-7">
                <Button
                  href="/dashboard"
                  className="w-full"
                >
                  Go to dashboard
                </Button>

                <p className="mt-4 text-xs leading-5 text-[#aaa2b2]">
                  Your NoteScript account is ready to use.
                </p>
              </div>
            ) : !loading ? (
              <div className="mt-7 space-y-3">
                <Link
                  href="/login"
                  className="flex h-11 w-full items-center justify-center rounded-xl border border-[#e4dfea] bg-white text-sm font-semibold text-[#302838] transition hover:bg-[#faf8fc]"
                >
                  Back to login
                </Link>

                <Link
                  href="/signup"
                  className="block text-sm font-semibold text-[#80639d] transition hover:text-[#72558f]"
                >
                  Create a new account
                </Link>
              </div>
            ) : (
              <div className="mt-7 rounded-2xl bg-[#faf8fc] px-4 py-3">
                <p className="text-xs text-[#8b8392]">
                  Please wait while we confirm your email address.
                </p>
              </div>
            )}

            <div className="my-7 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#eeeaf1]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#aaa2b2]">
                NoteScript
              </span>
              <div className="h-px flex-1 bg-[#eeeaf1]" />
            </div>

            <p className="text-xs leading-5 text-[#aaa2b2]">
              Simple, structured notes for focused studying.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}