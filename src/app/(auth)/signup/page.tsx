"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useRef, useState } from "react";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";

import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { PlanActivationScreen } from "@/components/billing/PlanActivationScreen";
import { api } from "@/lib/api";
import { clearPlanActivation, startPlanActivation } from "@/lib/plan-activation";
import { waitForPaidPlan } from "@/lib/wait-for-paid-plan";
import type { PlanId } from "@/lib/types";

export default function SignupPage() {
  const searchParams = useSearchParams();

  const selectedPlan = searchParams.get("plan");
  const selectedCycle = searchParams.get("cycle");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(false);
  const [activatingPlan, setActivatingPlan] = useState<Extract<PlanId, "student" | "pro"> | null>(
    null,
  );
  const [takingLonger, setTakingLonger] = useState(false);
  const confirmingPaymentRef = useRef(false);
  const [checkoutEmail, setCheckoutEmail] = useState("");

  async function openPaddleCheckout(email: string, planId: string, billingCycle: string) {
    const checkoutData = await api<{
      priceId: string;
      planId: string;
      billingCycle: string;
      customer: { email: string };
      customData: { userId: string; planId: string; billingCycle: string };
    }>("/api/billing/checkout", {
      method: "POST",
      body: JSON.stringify({ planId, billingCycle }),
    });

    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    if (!token) throw new Error("Paddle checkout is not configured.");

    const expected = (planId === "pro" ? "pro" : "student") as Extract<PlanId, "student" | "pro">;

    const paddle: Paddle | undefined = await initializePaddle({
      environment: process.env.NEXT_PUBLIC_PADDLE_ENV === "production" ? "production" : "sandbox",
      token,
      eventCallback: (event) => {
        if (event.name === "checkout.closed") {
          if (!confirmingPaymentRef.current) setPendingCheckout(true);
          return;
        }
        if (event.name === "checkout.completed") {
          confirmingPaymentRef.current = true;
          setPendingCheckout(false);
          setError("");
          startPlanActivation(expected, "free");
          setActivatingPlan(expected);
          setTakingLonger(false);
          void waitForPaidPlan({
            expectedPlan: expected,
            softTimeoutMs: 6000,
            onSoftTimeout: () => setTakingLonger(true),
          })
            .then(() => {
              clearPlanActivation();
              window.location.replace("/dashboard");
            })
            .catch(() => {
              confirmingPaymentRef.current = false;
              setTakingLonger(true);
              setError("Still activating — keep this page open and tap Refresh status.");
            });
          return;
        }
        if (event.name === "checkout.error" || event.name === "checkout.failed") {
          confirmingPaymentRef.current = false;
          setActivatingPlan(null);
          clearPlanActivation();
          setPendingCheckout(true);
          setError("Checkout could not be completed. You can try again, or continue on Free.");
        }
      },
    });

    if (!paddle) throw new Error("Could not initialize Paddle checkout.");

    paddle.Checkout.open({
      items: [{ priceId: checkoutData.priceId, quantity: 1 }],
      customer: { email },
      customData: checkoutData.customData,
      settings: { displayMode: "overlay", theme: "light" },
    });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") || "");
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");

    try {
      await api("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });

      if (
        selectedPlan &&
        selectedPlan !== "free" &&
        (selectedCycle === "monthly" || selectedCycle === "annual")
      ) {
        setCheckoutEmail(email);
        try {
          setPendingCheckout(false);
          await openPaddleCheckout(email, selectedPlan, selectedCycle);
        } catch (checkoutErr) {
          setPendingCheckout(true);
          setError(
            checkoutErr instanceof Error ? checkoutErr.message : "Checkout could not start.",
          );
        }
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account.");
    } finally {
      setLoading(false);
    }
  }

  const isPaidSignup = selectedPlan === "student" || selectedPlan === "pro";

  if (activatingPlan) {
    return (
      <PlanActivationScreen
        expectedPlan={activatingPlan}
        takingLonger={takingLonger}
        onRefresh={async () => {
          try {
            const me = await api<{ user: { planId: PlanId } }>("/api/auth/me");
            if (
              me.user.planId === activatingPlan ||
              (activatingPlan === "student" && me.user.planId === "pro")
            ) {
              clearPlanActivation();
              window.location.replace("/dashboard");
            }
          } catch {
            /* keep waiting */
          }
        }}
      />
    );
  }

  return (
    <main className="relative flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden bg-[#fcfbfe] px-4 py-12">
      <div className="pointer-events-none absolute left-1/2 top-[-180px] h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-[#eee7f8] opacity-70 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <BrandLogo href="/" size="lg" priority className="text-[#292230]" />
        </div>

        <div className="rounded-[28px] border border-[#e9e3ef] bg-white p-7 shadow-[0_20px_70px_rgba(62,39,82,0.09)] sm:p-9">
          <div className="text-center">
            <span className="inline-flex rounded-full bg-[#f0e9f8] px-3 py-1 text-xs font-semibold text-[#72558f]">
              {isPaidSignup ? "SECURE CHECKOUT" : "FREE TO START"}
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#292230]">
              Create your notebook
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#756d7d]">
              {isPaidSignup
                ? "Create your account and continue to secure checkout."
                : "Start organizing your study material with NoteScript."}
            </p>
          </div>

          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[#e9e0f0] bg-[#faf8fc] px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f0e9f8] text-sm text-[#72558f]">
              ✓
            </div>
            <div>
              <p className="text-sm font-semibold text-[#3f3545]">
                {isPaidSignup
                  ? `${selectedPlan === "student" ? "Student" : "Pro"} plan selected`
                  : "Free plan included"}
              </p>
              <p className="text-xs text-[#756d7d]">
                {isPaidSignup
                  ? `${selectedCycle === "annual" ? "Annual" : "Monthly"} billing`
                  : "No card required."}
              </p>
            </div>
          </div>

          {pendingCheckout ? (
            <div className="mt-7 space-y-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm">
              <p className="font-medium text-[#3f3545]">
                Your account has been created, but your{" "}
                {selectedPlan === "pro" ? "Pro" : "Student"} subscription is not active yet.
              </p>
              <p className="text-[#756d7d]">
                Complete Paddle checkout to unlock paid features. Until then you remain on Free.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={async () => {
                    setError("");
                    setPendingCheckout(false);
                    const email =
                      checkoutEmail ||
                      String((document.getElementById("email") as HTMLInputElement)?.value || "");
                    try {
                      await openPaddleCheckout(
                        email,
                        selectedPlan || "student",
                        selectedCycle || "monthly",
                      );
                    } catch (err) {
                      setPendingCheckout(true);
                      setError(err instanceof Error ? err.message : "Checkout failed.");
                    }
                  }}
                >
                  Continue checkout
                </Button>
                <Button href="/dashboard" variant="secondary">
                  Go to Free dashboard
                </Button>
              </div>
            </div>
          ) : null}

          <form className="mt-7 space-y-5" onSubmit={onSubmit}>
            <Field label="Name" htmlFor="name">
              <Input id="name" name="name" required minLength={2} autoComplete="name" />
            </Field>
            <Field label="Email" htmlFor="email">
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </Field>
            <Field
              label="Password"
              htmlFor="password"
              hint="8+ characters, upper, lower, and a number."
            >
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
              />
            </Field>
            <Field label="Confirm password" htmlFor="confirmPassword">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
              />
            </Field>
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
              {loading
                ? isPaidSignup
                  ? "Creating account…"
                  : "Creating…"
                : isPaidSignup
                  ? "Continue to checkout"
                  : "Start Free"}
            </Button>
          </form>

          <div className="my-7 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#eee8f2]" />
            <span className="text-xs text-[#9a929f]">ALREADY A MEMBER?</span>
            <div className="h-px flex-1 bg-[#eee8f2]" />
          </div>

          <p className="text-center text-sm text-[#756d7d]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#80639d] transition hover:text-[#644b79]"
            >
              Log in
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs leading-5 text-[#9a929f]">
          Create your account and start building your personal note library.
        </p>
      </div>
    </main>
  );
}
