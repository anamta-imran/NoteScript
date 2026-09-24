"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { UsageMeter } from "@/components/ui/UsageMeter";
import { Skeleton } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { PlanBadge } from "@/components/billing/PlanBadge";
import { PlanActivationScreen } from "@/components/billing/PlanActivationScreen";
import { formatDate, formatUsd, cn } from "@/lib/utils";
import { PLANS } from "@/lib/plans";
import { clearPlanActivation, startPlanActivation } from "@/lib/plan-activation";
import { getPlanTheme } from "@/lib/plan-theme";
import { waitForPaidPlan } from "@/lib/wait-for-paid-plan";
import type { BillingCycle, PlanId, PublicUser, UsageSnapshot } from "@/lib/types";

type BillingData = {
  user: PublicUser;
  usage: UsageSnapshot & { used: number; limit: number; remaining: number };
  plan: { id: string; name: string };
  paymentsConfigured: boolean;
  invoices: {
    id: string;
    amountPaid: number;
    currency: string;
    status: string;
    hostedInvoiceUrl?: string;
    description?: string;
    createdAt: string;
  }[];
};

/**
 * Create a Polar Checkout session and redirect the browser.
 * Plan activation is never granted here — only after webhook confirmation.
 */
async function startPolarCheckout(planId: PlanId, billingCycle: BillingCycle) {
  const checkout = await api<{
    url: string;
    checkoutId: string;
    planId: PlanId;
    billingCycle: BillingCycle;
  }>("/api/billing/checkout", {
    method: "POST",
    body: JSON.stringify({ planId, billingCycle }),
  });

  if (!checkout.url) {
    throw new Error("Checkout URL was not returned.");
  }

  window.location.assign(checkout.url);
}

function BillingPageInner() {
  const { push } = useToast();
  const searchParams = useSearchParams();
  const [data, setData] = useState<BillingData | null>(null);
  const [error, setError] = useState("");
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [busy, setBusy] = useState(false);
  const [activatingPlan, setActivatingPlan] = useState<Extract<PlanId, "student" | "pro"> | null>(
    null,
  );
  const [takingLonger, setTakingLonger] = useState(false);
  const confirmingPaymentRef = useRef(false);
  const autoCheckoutStarted = useRef(false);
  const successHandled = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  const beginConfirmingPayment = useCallback(
    (paidPlan: Extract<PlanId, "student" | "pro">) => {
      if (confirmingPaymentRef.current) return;
      confirmingPaymentRef.current = true;
      const fromPlan = data?.user.planId ?? "free";
      startPlanActivation(paidPlan, fromPlan);
      setActivatingPlan(paidPlan);
      setTakingLonger(false);
      setBusy(true);
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      void waitForPaidPlan({
        expectedPlan: paidPlan,
        signal: ac.signal,
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
          setBusy(false);
          push("Still activating — tap Refresh status in a moment.", "err");
        });
    },
    [push, data?.user.planId],
  );

  useEffect(() => {
    const qCycle = searchParams.get("cycle");
    if (qCycle === "monthly" || qCycle === "annual") {
      setCycle(qCycle);
    }
  }, [searchParams]);

  useEffect(() => {
    api<BillingData>("/api/billing")
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load billing."));
  }, []);

  // Return from Polar Checkout — poll webhook confirmation; never activate from the browser alone.
  useEffect(() => {
    if (!data || successHandled.current || activatingPlan) return;
    if (searchParams.get("checkout") !== "success") return;

    const qPlan = searchParams.get("plan");
    if (qPlan !== "student" && qPlan !== "pro") return;

    successHandled.current = true;
    autoCheckoutStarted.current = true;

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("checkout");
      url.searchParams.delete("checkout_id");
      window.history.replaceState({}, "", url.pathname + url.search);
    }

    beginConfirmingPayment(qPlan);
  }, [data, searchParams, activatingPlan, beginConfirmingPayment]);

  useEffect(() => {
    if (!data || autoCheckoutStarted.current || busy || activatingPlan) return;
    if (searchParams.get("checkout") === "success") return;

    const qPlan = searchParams.get("plan");
    const qCycle = searchParams.get("cycle");
    if (qPlan !== "student" && qPlan !== "pro") return;
    if (qCycle !== "monthly" && qCycle !== "annual") return;
    if (data.user.planId === "pro") return;
    if (data.user.planId === "student" && qPlan === "student") return;

    autoCheckoutStarted.current = true;
    setCycle(qCycle);
    setBusy(true);
    startPolarCheckout(qPlan, qCycle).catch((e) => {
      push(e instanceof Error ? e.message : "Checkout failed.", "err");
      setBusy(false);
    });
  }, [data, searchParams, busy, activatingPlan, push]);

  async function portal() {
    setBusy(true);
    try {
      const res = await api<{ url: string }>("/api/billing/portal", { method: "POST" });
      window.location.href = res.url;
    } catch (e) {
      push(e instanceof Error ? e.message : "Portal unavailable.", "err");
    } finally {
      setBusy(false);
    }
  }

  async function cancel() {
    if (!confirm("Cancel at the end of the current billing period?")) return;
    setBusy(true);
    try {
      const res = await api<{ message: string }>("/api/billing/cancel", { method: "POST" });
      push(res.message);
      const fresh = await api<BillingData>("/api/billing");
      setData(fresh);
    } catch (e) {
      push(e instanceof Error ? e.message : "Cancel failed.", "err");
    } finally {
      setBusy(false);
    }
  }

  async function upgrade(planId: PlanId) {
    setBusy(true);
    try {
      await startPolarCheckout(planId, cycle);
    } catch (e) {
      push(e instanceof Error ? e.message : "Checkout failed.", "err");
      setBusy(false);
    }
  }

  async function refreshActivationStatus() {
    try {
      const me = await api<{ user: { planId: PlanId } }>("/api/auth/me");
      if (
        activatingPlan &&
        (me.user.planId === activatingPlan ||
          (activatingPlan === "student" && me.user.planId === "pro"))
      ) {
        clearPlanActivation();
        window.location.replace("/dashboard");
      } else {
        push("Still activating — usually a few more seconds.", "ok");
      }
    } catch {
      push("Could not refresh yet. Try again shortly.", "err");
    }
  }

  // Full-screen activation for Student and Pro (Free→paid and Student→Pro).
  // Must render before any billing/dashboard content so the old plan never flashes.
  if (activatingPlan) {
    return (
      <PlanActivationScreen
        expectedPlan={activatingPlan}
        takingLonger={takingLonger}
        onRefresh={refreshActivationStatus}
      />
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-semibold">Billing</h1>
        <p className="mt-3 rounded-2xl bg-red-50 p-4 text-sm text-danger">{error}</p>
      </div>
    );
  }

  if (!data) return <Skeleton className="h-64" />;

  const planId = data.user.planId;
  const theme = getPlanTheme(planId);
  const textLabel =
    data.usage.textLimit === null
      ? "Unlimited text"
      : `${data.usage.textUsed} / ${data.usage.textLimit} text generations`;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <PlanBadge planId={planId} />
      </div>
      <p className="text-sm text-muted">Current plan, usage, and payment history.</p>

      <section className={cn("rounded-2xl border p-6", theme.cardClass)}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted">Current plan</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">{PLANS[planId].name}</h2>
            {data.user.billingCycle ? (
              <p className="mt-1 text-sm text-muted">
                {data.user.billingCycle} · {data.user.subscriptionStatus || "free"}
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted">No paid subscription</p>
            )}
            {data.user.currentPeriodEnd ? (
              <p className="mt-1 text-sm text-muted">
                Period ends {formatDate(data.user.currentPeriodEnd)}
              </p>
            ) : null}
            {data.user.cancelAtPeriodEnd ? (
              <p className="mt-2 text-sm text-amber-700">Cancels at period end</p>
            ) : null}
          </div>
          <div className="min-w-[200px] space-y-2 text-sm">
            <p>{textLabel}</p>
            <p>
              Images:{" "}
              {data.usage.imageLimit === null
                ? "Unlimited"
                : `${data.usage.imageUsed} / ${data.usage.imageLimit ?? 0}`}
            </p>
            <p>
              Diagrams:{" "}
              {data.usage.diagramLimit === null
                ? "Unlimited"
                : `${data.usage.diagramUsed} / ${data.usage.diagramLimit ?? 0}`}
            </p>
          </div>
        </div>

        {data.usage.textLimit !== null ? (
          <div className="mt-6">
            <UsageMeter used={data.usage.textUsed} limit={data.usage.textLimit} label="Text generations" />
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-2">
          {planId !== "free" ? (
            <>
              <Button variant="secondary" onClick={portal} disabled={busy || !data.paymentsConfigured}>
                Manage subscription
              </Button>
              {!data.user.cancelAtPeriodEnd ? (
                <Button variant="danger" onClick={cancel} disabled={busy}>
                  Cancel subscription
                </Button>
              ) : null}
            </>
          ) : null}
        </div>
      </section>

      {planId !== "pro" ? (
        <section className="rounded-2xl border border-[#e2d8ec] bg-gradient-to-br from-[#faf7fd] to-white p-6">
          <h2 className="text-xl font-semibold tracking-tight">Upgrade</h2>
          <p className="mt-2 text-sm text-muted">
            Checkout continues to secure payment. Your plan updates only after a verified webhook.
          </p>
          <div className="mt-4 inline-flex rounded-xl border border-line bg-white p-1">
            <button
              className={`rounded-lg px-3 py-1.5 text-sm ${cycle === "monthly" ? "bg-lavender-soft" : ""}`}
              onClick={() => setCycle("monthly")}
            >
              Monthly
            </button>
            <button
              className={`rounded-lg px-3 py-1.5 text-sm ${cycle === "annual" ? "bg-lavender-soft" : ""}`}
              onClick={() => setCycle("annual")}
            >
              Annual
            </button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(["student", "pro"] as const)
              .filter((p) => (planId === "free" ? true : p === "pro"))
              .map((p) => (
                <div
                  key={p}
                  className={cn(
                    "rounded-xl border p-4",
                    p === "pro"
                      ? "border-[#302838]/20 bg-[#302838] text-white"
                      : "border-[#e2d8ec] bg-white",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <p className="font-semibold capitalize">{p}</p>
                    <PlanBadge planId={p} className={p === "pro" ? "!bg-white/15 !text-white" : ""} />
                  </div>
                  <p className={cn("mt-1 text-sm", p === "pro" ? "text-white/70" : "text-muted")}>
                    {formatUsd(cycle === "monthly" ? PLANS[p].monthlyPriceUsd : PLANS[p].annualPriceUsd)}
                    /{cycle === "monthly" ? "mo" : "yr"}
                  </p>
                  {p === "pro" ? (
                    <p className="mt-2 text-xs text-white/65">Includes YouTube → Notes</p>
                  ) : null}
                  <Button
                    className={cn("mt-3", p === "pro" && "bg-white text-[#302838] hover:bg-[#E9E1F0]")}
                    disabled={busy}
                    onClick={() => upgrade(p)}
                  >
                    {planId === "student" && p === "pro" ? "Upgrade to Pro" : `Get ${p}`}
                  </Button>
                </div>
              ))}
          </div>
          <p className="mt-3 text-sm">
            <Link href="/pricing" className="text-lavender-deep underline">
              Full plan comparison
            </Link>
          </p>
        </section>
      ) : (
        <section className="rounded-2xl border border-[#302838]/20 bg-[#302838] p-6 text-white">
          <h2 className="text-xl font-semibold">All features unlocked</h2>
          <p className="mt-2 text-sm text-white/70">
            You are on Pro — text, YouTube, images, PDFs, and diagrams.
          </p>
        </section>
      )}

      <section className={cn("rounded-2xl border p-6", theme.cardClass)}>
        <h2 className="text-xl font-semibold">Payment history</h2>
        {data.invoices.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No payments yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {data.invoices.map((inv) => (
              <li
                key={inv.id}
                className="flex flex-col gap-2 rounded-xl bg-paper p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{inv.description || "NoteScript payment"}</p>
                  <p className="text-sm text-muted">{formatDate(inv.createdAt)}</p>
                </div>
                <div className="text-sm">
                  {inv.currency?.toUpperCase()} {inv.amountPaid}
                  {inv.hostedInvoiceUrl ? (
                    <a
                      className="ms-3 underline"
                      href={inv.hostedInvoiceUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Receipt
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64" />}>
      <BillingPageInner />
    </Suspense>
  );
}
