"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import {
  PLANS,
  annualMonthlyEquivalent,
  annualSavingsPercent,
} from "@/lib/plans";
import { formatUsd } from "@/lib/utils";
import type { BillingCycle, PlanId } from "@/lib/types";

const planOrder = ["free", "student", "pro"] as const;

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
  isStudent,
  isFree,
}: {
  id: PlanId;
  cycle: BillingCycle;
  isStudent: boolean;
  isFree: boolean;
}) {
  const [busy, setBusy] = useState(false);

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
      className={`w-full ${
        isStudent ? "shadow-[0_8px_24px_rgba(103,76,145,0.22)]" : ""
      }`}
      variant={isStudent ? "primary" : "secondary"}
    >
      {isFree ? "Start for free" : isStudent ? "Choose Student" : "Choose Pro"}
    </Button>
  );
}

export default function PricingPage() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");

  return (
    <main className="min-h-screen bg-[#fcfbfe]">
      {/* HEADER */}
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
              <span className="block font-hand-clean text-lavender-deep">
                the way you study.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-muted sm:text-base">
              Start with the basics and upgrade whenever you need more
              generations, sources, folders, exports, and sharing.
            </p>

            {/* BILLING TOGGLE */}
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

      {/* PRICING CARDS */}
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <div className="grid items-stretch gap-5 lg:grid-cols-3">
          {planOrder.map((id) => {
            const p = PLANS[id];
            const isStudent = id === "student";
            const isFree = id === "free";

            const price = isFree
              ? formatUsd(0)
              : cycle === "monthly"
                ? formatUsd(p.monthlyPriceUsd)
                : formatUsd(p.annualPriceUsd);

            return (
              <article
                key={id}
                className={`relative flex flex-col rounded-[1.5rem] transition duration-300 ${
                  isStudent
                    ? "border-2 border-lavender-deep bg-[#faf7ff] shadow-[0_20px_60px_rgba(103,76,145,0.16)] lg:-translate-y-2"
                    : "border border-line bg-white shadow-[0_10px_35px_rgba(45,31,58,0.05)] hover:-translate-y-1 hover:shadow-[0_16px_45px_rgba(45,31,58,0.09)]"
                }`}
              >
                {/* POPULAR BADGE */}
                {isStudent ? (
                  <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                    <div className="rounded-full bg-[#292230] px-5 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-lg">
                      ✦ Most Popular
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-1 flex-col p-7 sm:p-8">
                  {/* PLAN LABEL */}
                  <div className="flex min-h-[28px] items-center justify-between">
                    {isStudent ? (
                      <span className="rounded-full bg-lavender-soft px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-lavender-deep">
                        Best for students
                      </span>
                    ) : isFree ? (
                      <span className="rounded-full bg-[#f4f2f6] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                        Get started
                      </span>
                    ) : (
                      <span className="rounded-full bg-[#f4f2f6] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                        For power users
                      </span>
                    )}

                    {id === "pro" ? (
                      <span className="text-xs text-muted">Pro</span>
                    ) : null}
                  </div>

                  {/* PLAN NAME */}
                  <h2 className="mt-6 text-2xl font-semibold tracking-[-0.02em]">
                    {p.name}
                  </h2>

                  <p className="mt-2 min-h-[40px] text-sm leading-5 text-muted">
                    {isFree
                      ? "Everything you need to start creating better notes."
                      : isStudent
                        ? "More power for regular studying and revision."
                        : "More capacity for heavy study and larger workflows."}
                  </p>

                  {/* PRICE */}
                  <div className="mt-7 border-b border-line pb-7">
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-semibold tracking-[-0.04em]">
                        {price}
                      </span>

                      <span className="pb-1.5 text-xs text-muted">
                        {isFree
                          ? "forever"
                          : cycle === "monthly"
                            ? "/ month"
                            : "/ year"}
                      </span>
                    </div>

                    {!isFree && cycle === "annual" ? (
                      <div className="mt-3 inline-flex rounded-full bg-success-soft px-3 py-1 text-xs font-medium text-success">
                        {formatUsd(annualMonthlyEquivalent(id))}/month
                        equivalent · Save {annualSavingsPercent(id)}%
                      </div>
                    ) : (
                      <p className="mt-3 text-xs text-muted">
                        {isFree
                          ? "No credit card required"
                          : "Cancel whenever you need"}
                      </p>
                    )}
                  </div>

                  {/* FEATURES */}
                  <div className="mt-7 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
                      What&apos;s included
                    </p>

                    <ul className="mt-5 space-y-4 text-sm">
                      <li className="flex gap-3">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lavender-soft text-[10px] font-bold text-lavender-deep">
                          ✓
                        </span>
                        <span className="text-muted">
                          <strong className="font-semibold text-foreground">
                            {p.textGenerations === null
                              ? "Unlimited"
                              : p.textLimitIsLifetime
                                ? `${p.textGenerations} total`
                                : `${p.textGenerations}/mo`}
                          </strong>{" "}
                          text generations
                        </span>
                      </li>

                      <li className="flex gap-3">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lavender-soft text-[10px] font-bold text-lavender-deep">
                          ✓
                        </span>
                        <span className="text-muted">
                          Sources:{" "}
                          <strong className="font-medium text-foreground">
                            {p.allowedSources.join(", ")}
                          </strong>
                        </span>
                      </li>

                      <li className="flex gap-3">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lavender-soft text-[10px] font-bold text-lavender-deep">
                          ✓
                        </span>
                        <span className="text-muted">
                          <strong className="font-semibold text-foreground">
                            {p.maxFolders === Infinity
                              ? "Unlimited"
                              : p.maxFolders}
                          </strong>{" "}
                          {p.maxFolders === Infinity ? "folders" : "folder"}
                        </span>
                      </li>

                      <li className="flex gap-3">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lavender-soft text-[10px] font-bold text-lavender-deep">
                          ✓
                        </span>
                        <span className="text-muted">
                          {p.pdfExport ? (
                            <>
                              <strong className="font-medium text-foreground">
                                PDF & PNG
                              </strong>{" "}
                              export
                            </>
                          ) : (
                            "Print from the browser"
                          )}
                        </span>
                      </li>

                      <li className="flex gap-3">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lavender-soft text-[10px] font-bold text-lavender-deep">
                          ✓
                        </span>
                        <span className="text-muted">
                          {p.shareableLinks ? (
                            <>
                              <strong className="font-medium text-foreground">
                                Shareable
                              </strong>{" "}
                              links
                            </>
                          ) : (
                            "Private notes only"
                          )}
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* CTA */}
                  <div className="mt-8">
                    <PlanCta id={id} cycle={cycle} isStudent={isStudent} isFree={isFree} />

                    {!isFree && (
                      <p className="mt-3 text-center text-[11px] text-muted">
                        Secure checkout · Easy to manage
                      </p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* BOTTOM TRUST ROW */}
        <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted">
          <span>✓ Start free</span>
          <span>✓ No complicated setup</span>
          <span>✓ Cancel anytime</span>
          <span>✓ Your notes stay yours</span>
        </div>
      </section>

      {/* FAQ / REASSURANCE */}
      <section className="border-t border-line bg-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:px-10">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-lavender-deep">
                Still deciding?
              </p>

              <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                Start small.
                <span className="block font-hand-clean text-lavender-deep">
                  Upgrade later.
                </span>
              </h3>
            </div>

            <div className="md:col-span-2 grid gap-5 sm:grid-cols-2">
              <div className="rounded-2xl border border-line bg-[#fcfbfe] p-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lavender-soft text-sm text-lavender-deep">
                  ✓
                </div>
                <h4 className="mt-4 text-sm font-semibold">
                  Not sure which plan?
                </h4>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Start with Free and move up when your study workflow needs
                  more.
                </p>
              </div>

              <div className="rounded-2xl border border-line bg-[#fcfbfe] p-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lavender-soft text-sm text-lavender-deep">
                  ✦
                </div>
                <h4 className="mt-4 text-sm font-semibold">
                  Studying regularly?
                </h4>
                <p className="mt-2 text-sm leading-6 text-muted">
                  The Student plan is designed around a more frequent study
                  workflow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
