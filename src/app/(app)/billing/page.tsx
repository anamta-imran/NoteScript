"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { UsageMeter } from "@/components/ui/UsageMeter";
import { Skeleton } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { formatDate, formatUsd } from "@/lib/utils";
import { PLANS } from "@/lib/plans";
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

async function openCheckout(planId: PlanId, billingCycle: BillingCycle) {
  const checkoutData = await api<{
    priceId: string;
    customData: Record<string, string>;
    customer: { email: string };
  }>("/api/billing/checkout", {
    method: "POST",
    body: JSON.stringify({ planId, billingCycle }),
  });
  const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  if (!token) throw new Error("Paddle checkout is not configured.");
  const paddle: Paddle | undefined = await initializePaddle({
    environment: process.env.NEXT_PUBLIC_PADDLE_ENV === "production" ? "production" : "sandbox",
    token,
  });
  if (!paddle) throw new Error("Could not initialize Paddle.");
  paddle.Checkout.open({
    items: [{ priceId: checkoutData.priceId, quantity: 1 }],
    customer: { email: checkoutData.customer.email },
    customData: checkoutData.customData,
    settings: { displayMode: "overlay", theme: "light" },
  });
}

function BillingPageInner() {
  const { push } = useToast();
  const searchParams = useSearchParams();
  const [data, setData] = useState<BillingData | null>(null);
  const [error, setError] = useState("");
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [busy, setBusy] = useState(false);
  const autoCheckoutStarted = useRef(false);

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

  useEffect(() => {
    if (!data || autoCheckoutStarted.current || busy) return;
    const qPlan = searchParams.get("plan");
    const qCycle = searchParams.get("cycle");
    if (qPlan !== "student" && qPlan !== "pro") return;
    if (qCycle !== "monthly" && qCycle !== "annual") return;
    if (data.user.planId === "pro") return;
    if (data.user.planId === "student" && qPlan === "student") return;

    autoCheckoutStarted.current = true;
    setCycle(qCycle);
    setBusy(true);
    openCheckout(qPlan, qCycle)
      .catch((e) => push(e instanceof Error ? e.message : "Checkout failed.", "err"))
      .finally(() => setBusy(false));
  }, [data, searchParams, busy, push]);

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
      await openCheckout(planId, cycle);
    } catch (e) {
      push(e instanceof Error ? e.message : "Checkout failed.", "err");
    } finally {
      setBusy(false);
    }
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
  const textLabel =
    data.usage.textLimit === null
      ? "Unlimited text"
      : `${data.usage.textUsed} / ${data.usage.textLimit} text generations`;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Billing</h1>
        <p className="mt-1 text-sm text-muted">Current plan, usage, and payment history.</p>
      </div>

      <section className="rounded-2xl border border-line bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted">Current plan</p>
            <h2 className="text-2xl font-semibold uppercase tracking-wide">{planId}</h2>
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
        <section className="rounded-2xl border border-line bg-lavender-soft/50 p-6">
          <h2 className="text-xl font-semibold">Upgrade</h2>
          <p className="mt-2 text-sm text-muted">
            Checkout opens Paddle. Your plan updates only after a verified webhook.
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
                <div key={p} className="rounded-xl bg-white p-4">
                  <p className="font-semibold capitalize">{p}</p>
                  <p className="text-sm text-muted">
                    {formatUsd(cycle === "monthly" ? PLANS[p].monthlyPriceUsd : PLANS[p].annualPriceUsd)}
                    /{cycle === "monthly" ? "mo" : "yr"}
                  </p>
                  <Button className="mt-3" disabled={busy} onClick={() => upgrade(p)}>
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
          <p className="mt-2 text-sm text-white/70">You are on Pro — text, YouTube, images, PDFs, and diagrams.</p>
        </section>
      )}

      <section className="rounded-2xl border border-line bg-white p-6">
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
                    <a className="ms-3 underline" href={inv.hostedInvoiceUrl} target="_blank" rel="noreferrer">
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
