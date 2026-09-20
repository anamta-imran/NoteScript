"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { api } from "@/lib/api";

export default function ForgotPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setMessage("");

    const form = new FormData(e.currentTarget);

    try {
      const res = await api<{ message: string }>(
        "/api/auth/forgot-password",
        {
          method: "POST",
          body: JSON.stringify({
            email: form.get("email"),
          }),
        },
      );

      setMessage(res.message);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not send reset email.",
      );
    }
  }

  return (
    <main className="relative flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden bg-[#fcfbfe] px-4 py-12">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-[-180px] h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-[#eee7f8] opacity-70 blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xl font-semibold tracking-tight text-[#292230]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#80639d] text-sm font-bold text-white shadow-[0_6px_20px_rgba(126,95,160,0.25)]">
              N
            </span>
            NoteScript
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-[28px] border border-[#e9e3ef] bg-white p-7 shadow-[0_20px_70px_rgba(62,39,82,0.09)] sm:p-9">
          <div className="text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0e9f8] text-xl text-[#72558f]">
              ?
            </span>

            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[#292230]">
              Forgot your password?
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#756d7d]">
              Enter your email and we&apos;ll send you a link to reset your
              password.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={onSubmit}>
            <Field label="Email" htmlFor="email">
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </Field>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
                {error}
              </div>
            ) : null}

            {message ? (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-5 text-green-700">
                {message}
              </div>
            ) : null}

            <Button
              type="submit"
              className="w-full shadow-[0_8px_25px_rgba(126,95,160,0.22)]"
            >
              Send reset link
            </Button>
          </form>

          <div className="my-7 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#eee8f2]" />
            <span className="text-xs text-[#9a929f]">REMEMBERED IT?</span>
            <div className="h-px flex-1 bg-[#eee8f2]" />
          </div>

          <p className="text-center text-sm text-[#756d7d]">
            Go back to{" "}
            <Link
              href="/login"
              className="font-semibold text-[#80639d] transition hover:text-[#644b79]"
            >
              Log in
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs leading-5 text-[#9a929f]">
          We&apos;ll only use your email to help you regain access to your
          account.
        </p>
      </div>
    </main>
  );
}