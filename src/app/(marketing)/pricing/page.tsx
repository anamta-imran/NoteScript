"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { PlanBadge } from "@/components/billing/PlanBadge";
import {
  PLANS,
  annualMonthlyEquivalent,
  annualSavingsPercent,
} from "@/lib/plans";
import { formatUsd, cn } from "@/lib/utils";
import type { BillingCycle, PlanId } from "@/lib/types";

const planOrder = ["free", "student", "pro"] as const;

const PLAN_FEATURES: Record<
  PlanId,
  { label: string; included: boolean; highlight?: boolean; lockLabel?: string }[]
> = {
  free: [
    { label: "Text → handwritten notes", included: true },
    { label: "3 note generations total", included: true },
    { label: "2 basic handwriting styles", included: true },
    { label: "Basic dashboard & saving", included: true },
    { label: "PDF → notes", included: false, lockLabel: "Student" },
    { label: "Image / OCR → notes", included: false, lockLabel: "Student" },
    { label: "Diagram generation", included: false, lockLabel: "Student" },
    { label: "YouTube → notes", included: false, lockLabel: "Pro" },
  ],
  student: [
    { label: "Unlimited text → handwritten notes", included: true },
    { label: "PDF → handwritten notes", included: true },
    { label: "10 image/OCR generations / month", included: true },
    { label: "Educational diagrams & flowcharts", included: true },
    { label: "10 handwriting styles", included: true },
    { label: "Download, print & folders", included: true },
    { label: "YouTube → notes", included: false, lockLabel: "Pro" },
    { label: "Priority processing", included: false, lockLabel: "Pro" },
  ],
  pro: [
    { label: "Everything in Student", included: true },
    { label: "YouTube → handwritten notes", included: true, highlight: true },
    { label: "Unlimited diagrams & higher OCR", included: true },
    { label: "All handwriting styles", included: true },
    { label: "All templates & advanced customization", included: true },
    { label: "Unlimited folders", included: true },
    { label: "Priority processing", included: true },
    { label: "Timestamps on lecture notes", included: true },
  ],
};

async function resolveLoggedIn(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    return res.ok;
  } catch {
    return false;
  }
}

function PlanCta({
  id,
  cycle,
  emphasized,
}: {
  id: PlanId;
  cycle: BillingCycle;
  emphasized: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const isFree = id === "free";

  async function onClick() {
    if (busy) return;
    setBusy(true);
    try {
      const loggedIn = await resolveLoggedIn();
      if (isFree) {
        window.location.href = loggedIn ? "/dashboard" : "/signup";
        return;
      }
      const qs = `plan=${id}&cycle=${cycle}`;
      window.location.href = loggedIn ? `/billing?${qs}` : `/signup?${qs}`;
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={cn(
        "w-full",
        emphasized && id === "student" && "shadow-[0_8px_24px_rgba(103,76,145,0.22)]",
        emphasized && id === "pro" && "bg-white text-[#302838] hover:bg-[#E9E1F0] shadow-[0_8px_28px_rgba(0,0,0,0.18)]",
      )}
      variant={emphasized && id !== "pro" ? "primary" : id === "pro" && emphasized ? "secondary" : "secondary"}
    >
      {isFree ? "Start for free" : id === "student" ? "Choose Student" : "Choose Pro"}
    </Button>
  );
}

function PricingInner() {
  const searchParams = useSearchParams();
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const highlightParam = searchParams.get("highlight");
  const highlight: PlanId | null =
    highlightParam === "pro" || highlightParam === "student" || highlightParam === "free"
      ? highlightParam
      : null;

  useEffect(() => {
    const qCycle = searchParams.get("cycle");
    if (qCycle === "monthly" || qCycle === "annual") setCycle(qCycle);
  }, [searchParams]);

  useEffect(() => {
    if (!highlight) return;
    const el = document.getElementById(`plan-${highlight}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlight]);

  return (
    <main className="min-h-screen bg-[#fcfbfe]">
      <section className="relative overflow-hidden border-b border-line">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 0%, rgba(198,181,255,0.22), transparent 38%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-5 pb-14 pt-14 sm:px-8 sm:pt-20 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#e7dff0] bg-white px-3.5 py-1.5 text-xs font-medium text-lavender-deep shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-lavender-deep" />
              Simple, transparent pricing
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Choose the plan that fits
              <span className="block font-hand-clean text-lavender-deep">the way you study.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-muted sm:text-base">
              Start with the basics and upgrade whenever you need more generations, sources,
              folders, exports, and YouTube lectures.
            </p>
            {highlight === "pro" ? (
              <p className="mx-auto mt-4 max-w-md rounded-xl border border-[#302838]/15 bg-[#302838] px-4 py-2.5 text-sm text-white">
                YouTube → Notes is included on <strong>Pro</strong>.
              </p>
            ) : null}
            <div className="mt-8 inline-flex items-center rounded-full border border-[#e5deeb] bg-white p-1.5 shadow-sm">
              <button
                type="button"
                onClick={() => setCycle("monthly")}
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${
                  cycle === "monthly"
                    ? "bg-[#292230] text-white shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setCycle("annual")}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition ${
                  cycle === "annual"
                    ? "bg-[#292230] text-white shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                Annual
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    cycle === "annual"
                      ? "bg-white/15 text-white"
                      : "bg-lavender-soft text-lavender-deep"
                  }`}
                >
                  SAVE
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <div className="grid items-stretch gap-5 lg:grid-cols-3">
          {planOrder.map((id) => {
            const p = PLANS[id];
            const isStudent = id === "student";
            const isFree = id === "free";
            const isPro = id === "pro";
            const isHighlighted =
              highlight === id || (!highlight && isStudent) || (highlight === "pro" && isPro);

            const price = isFree
              ? formatUsd(0)
              : cycle === "monthly"
                ? formatUsd(p.monthlyPriceUsd)
                : formatUsd(p.annualPriceUsd);

            return (
              <article
                id={`plan-${id}`}
                key={id}
                className={cn(
                  "relative flex flex-col rounded-[1.5rem] transition duration-300",
                  isPro && isHighlighted
                    ? "border-2 border-[#302838] bg-gradient-to-b from-[#302838] to-[#3a3148] text-white shadow-[0_24px_60px_rgba(48,40,56,0.35)] lg:-translate-y-2 ring-4 ring-[#80639d]/25"
                    : isStudent && isHighlighted
                      ? "border-2 border-lavender-deep bg-[#faf7ff] shadow-[0_20px_60px_rgba(103,76,145,0.16)] lg:-translate-y-2"
                      : isFree
                        ? "border border-line bg-white shadow-[0_10px_35px_rgba(45,31,58,0.05)]"
                        : "border border-line bg-white shadow-[0_10px_35px_rgba(45,31,58,0.05)] hover:-translate-y-1 hover:shadow-[0_16px_45px_rgba(45,31,58,0.09)]",
                )}
              >
                {isStudent && isHighlighted ? (
                  <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                    <div className="rounded-full bg-[#292230] px-5 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-lg">
                      ✦ Most Popular
                    </div>
                  </div>
                ) : null}
                {isPro && isHighlighted ? (
                  <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                    <div className="rounded-full bg-white px-5 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#302838] shadow-lg">
                      ✦ Includes YouTube
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-1 flex-col p-7 sm:p-8">
                  <div className="flex min-h-[28px] items-center justify-between gap-2">
                    {isStudent ? (
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em]",
                          isHighlighted
                            ? "bg-lavender-soft text-lavender-deep"
                            : "bg-[#f4f2f6] text-muted",
                        )}
                      >
                        Best for students
                      </span>
                    ) : isFree ? (
                      <span className="rounded-full bg-[#f4f2f6] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                        Get started
                      </span>
                    ) : (
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
                          isHighlighted ? "bg-white/15 text-white" : "bg-[#f4f2f6] text-muted",
                        )}
                      >
                        Highest tier
                      </span>
                    )}
                    <PlanBadge
                      planId={id}
                      className={isPro && isHighlighted ? "!bg-white/15 !text-white !ring-white/20" : ""}
                    />
                  </div>

                  <h2
                    className={cn(
                      "mt-6 text-2xl font-semibold tracking-[-0.02em]",
                      isPro && isHighlighted && "text-white",
                    )}
                  >
                    {p.name}
                  </h2>
                  <p
                    className={cn(
                      "mt-2 min-h-[40px] text-sm leading-5",
                      isPro && isHighlighted ? "text-white/70" : "text-muted",
                    )}
                  >
                    {isFree
                      ? "Polished entry-level workspace to start creating better notes."
                      : isStudent
                        ? "Premium student experience for regular studying and revision."
                        : "Highest-tier capacity — including YouTube lecture-to-notes."}
                  </p>

                  <div
                    className={cn(
                      "mt-7 border-b pb-7",
                      isPro && isHighlighted ? "border-white/15" : "border-line",
                    )}
                  >
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-semibold tracking-[-0.04em]">{price}</span>
                      <span
                        className={cn(
                          "pb-1.5 text-xs",
                          isPro && isHighlighted ? "text-white/60" : "text-muted",
                        )}
                      >
                        {isFree ? "forever" : cycle === "monthly" ? "/ month" : "/ year"}
                      </span>
                    </div>
                    {!isFree && cycle === "annual" ? (
                      <div
                        className={cn(
                          "mt-3 inline-flex rounded-full px-3 py-1 text-xs font-medium",
                          isPro && isHighlighted
                            ? "bg-white/15 text-white"
                            : "bg-success-soft text-success",
                        )}
                      >
                        {formatUsd(annualMonthlyEquivalent(id))}/month equivalent · Save{" "}
                        {annualSavingsPercent(id)}%
                      </div>
                    ) : (
                      <p
                        className={cn(
                          "mt-3 text-xs",
                          isPro && isHighlighted ? "text-white/55" : "text-muted",
                        )}
                      >
                        {isFree ? "No credit card required" : "Cancel whenever you need"}
                      </p>
                    )}
                  </div>

                  <div className="mt-7 flex-1">
                    <p
                      className={cn(
                        "text-xs font-semibold uppercase tracking-[0.12em]",
                        isPro && isHighlighted ? "text-white/80" : "text-foreground",
                      )}
                    >
                      What&apos;s included
                    </p>
                    <ul className="mt-5 space-y-3 text-sm">
                      {PLAN_FEATURES[id].map((feature) => (
                        <li key={feature.label} className="flex gap-3">
                          {feature.included ? (
                            <span
                              className={cn(
                                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                                isPro && isHighlighted
                                  ? "bg-white/15 text-white"
                                  : feature.highlight
                                    ? "bg-[#302838] text-[#E9E1F0]"
                                    : "bg-lavender-soft text-lavender-deep",
                              )}
                            >
                              ✓
                            </span>
                          ) : (
                            <span
                              className={cn(
                                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px]",
                                isPro && isHighlighted
                                  ? "bg-white/10 text-white/50"
                                  : "bg-[#f4f2f6] text-muted",
                              )}
                            >
                              🔒
                            </span>
                          )}
                          <span
                            className={cn(
                              feature.included
                                ? isPro && isHighlighted
                                  ? feature.highlight
                                    ? "font-medium text-white"
                                    : "text-white/80"
                                  : feature.highlight
                                    ? "font-medium text-ink"
                                    : "text-muted"
                                : isPro && isHighlighted
                                  ? "text-white/45"
                                  : "text-muted/80",
                            )}
                          >
                            {feature.label}
                            {!feature.included && feature.lockLabel ? (
                              <span className="ms-1 text-[10px] uppercase tracking-wide opacity-70">
                                · {feature.lockLabel}
                              </span>
                            ) : null}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8">
                    <PlanCta id={id} cycle={cycle} emphasized={isHighlighted} />
                    {!isFree && (
                      <p
                        className={cn(
                          "mt-3 text-center text-[11px]",
                          isPro && isHighlighted ? "text-white/50" : "text-muted",
                        )}
                      >
                        Secure checkout · Easy to manage
                      </p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted">
          <span>✓ Start free</span>
          <span>✓ No complicated setup</span>
          <span>✓ Cancel anytime</span>
          <span>✓ Your notes stay yours</span>
        </div>
      </section>

      <section className="border-t border-line bg-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:px-10">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-lavender-deep">
                Still deciding?
              </p>
              <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                Start small.
                <span className="block font-hand-clean text-lavender-deep">Upgrade later.</span>
              </h3>
            </div>
            <div className="md:col-span-2 grid gap-5 sm:grid-cols-2">
              <div className="rounded-2xl border border-line bg-[#fcfbfe] p-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lavender-soft text-sm text-lavender-deep">
                  ✓
                </div>
                <h4 className="mt-4 text-sm font-semibold">Not sure which plan?</h4>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Start with Free and move up when your study workflow needs more.
                </p>
              </div>
              <div className="rounded-2xl border border-line bg-[#fcfbfe] p-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#302838] text-sm text-[#E9E1F0]">
                  ▶
                </div>
                <h4 className="mt-4 text-sm font-semibold">Need YouTube lectures?</h4>
                <p className="mt-2 text-sm leading-6 text-muted">
                  YouTube → Notes is a Pro feature. Upgrade when you&apos;re ready for lecture
                  conversion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#fcfbfe]" />}>
      <PricingInner />
    </Suspense>
  );
}
