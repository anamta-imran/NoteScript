"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const next = useSearchParams().get("next") || "/dashboard";

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);

    try {
      await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });

      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden bg-[#fcfbfe] px-4 py-12">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-[-180px] h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-[#eee7f8] opacity-70 blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 flex justify-center">
          <BrandLogo href="/" size="lg" priority className="text-[#292230]" />
        </div>

        {/* Card */}
        <div className="rounded-[28px] border border-[#e9e3ef] bg-white p-7 shadow-[0_20px_70px_rgba(62,39,82,0.09)] sm:p-9">
          <div className="text-center">
            <span className="inline-flex rounded-full bg-[#f0e9f8] px-3 py-1 text-xs font-semibold text-[#72558f]">
              WELCOME BACK
            </span>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#292230]">
              Log in to NoteScript
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#756d7d]">
              Pick up right where you left off.
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

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-[#3f3545]"
                >
                  Password
                </label>

                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-[#80639d] transition hover:text-[#644b79]"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="mt-2">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
                {error}
              </div>
            ) : null}

            <Button
              type="submit"
              className="w-full shadow-[0_8px_25px_rgba(126,95,160,0.22)]"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Log in"}
            </Button>
          </form>

          <div className="my-7 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#eee8f2]" />
            <span className="text-xs text-[#9a929f]">OR</span>
            <div className="h-px flex-1 bg-[#eee8f2]" />
          </div>

          <p className="text-center text-sm text-[#756d7d]">
            New to NoteScript?{" "}
            <Link
              href="/signup"
              className="font-semibold text-[#80639d] transition hover:text-[#644b79]"
            >
              Create an account
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs leading-5 text-[#9a929f]">
          Your notes and account stay connected to your NoteScript library.
        </p>
      </div>
    </main>
  );
}