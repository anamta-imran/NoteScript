"use client";

import Link from "next/link";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { PlanBadge } from "@/components/billing/PlanBadge";
import { canUseSource, pricingHighlightHref, requiredPlanForSource } from "@/lib/entitlements";
import type {
  DashboardFolderItem,
  DashboardMe,
  DashboardNoteItem,
} from "@/lib/dashboard-preview-data";
import type { BillingCycle, PlanId, SourceType } from "@/lib/types";
import { formatDate, cn } from "@/lib/utils";

const SOURCES: {
  href: string;
  label: string;
  source: SourceType;
  blurb: string;
  mark: string;
}[] = [
  { href: "/create/text", label: "Text", source: "text", blurb: "Chapters, outlines & lecture paste", mark: "Aa" },
  { href: "/create/pdf", label: "PDF", source: "pdf", blurb: "Extract selectable study text", mark: "PDF" },
  { href: "/create/image", label: "Image", source: "image", blurb: "OCR photos and slide captures", mark: "IMG" },
  { href: "/create/youtube", label: "YouTube", source: "youtube", blurb: "Lectures into structured notes", mark: "YT" },
  { href: "/create/diagram", label: "Diagram", source: "diagram", blurb: "Labeled study sketches", mark: "◇" },
];

function cycleLabel(cycle?: BillingCycle): string | null {
  if (cycle === "monthly") return "Monthly";
  if (cycle === "annual") return "Annual";
  return null;
}

function planCycleLine(planId: Extract<PlanId, "student" | "pro">, cycle?: BillingCycle): string {
  const c = cycleLabel(cycle);
  const name = planId === "pro" ? "Pro" : "Student";
  return c ? `${name} · ${c}` : name;
}

function usageLine(used: number, limit: number | null): string {
  if (limit === null) return "Unlimited";
  return `${used} / ${limit}`;
}

export function PaidDashboard({
  me,
  notes,
  folders,
}: {
  me: DashboardMe;
  notes: DashboardNoteItem[];
  folders: DashboardFolderItem[];
}) {
  const planId = me.user.planId as Extract<PlanId, "student" | "pro">;
  const isPro = planId === "pro";
  const cycle = me.user.billingCycle;
  const planLine = planCycleLine(planId, cycle);

  return (
    <div className={cn("mx-auto max-w-6xl space-y-8", isPro && "pb-4")}>
      {/* Hero */}
      <section
        className={cn(
          "relative overflow-hidden rounded-[1.75rem] border p-6 sm:p-8 lg:p-10",
          isPro
            ? "border-white/10 bg-gradient-to-br from-[#241e2c] via-[#302838] to-[#3d3550] text-white shadow-[0_24px_60px_rgba(36,30,44,0.45)]"
            : "border-[#d9cce8] bg-gradient-to-br from-white via-[#faf7fd] to-[#efe6fa] shadow-[0_20px_50px_rgba(103,76,145,0.1)]",
        )}
      >
        {isPro ? (
          <>
            <div
              className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#6b5b8c]/35 blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-28 left-1/4 h-56 w-56 rounded-full bg-[#4a6fa5]/20 blur-3xl"
              aria-hidden
            />
          </>
        ) : (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-lavender via-[#9b7ec2] to-lavender-deep"
            aria-hidden
          />
        )}

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <PlanBadge
                planId={planId}
                size="md"
                className={isPro ? "!bg-white/15 !text-white !ring-white/25" : undefined}
              />
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide",
                  isPro
                    ? "bg-white/10 text-white/85 ring-1 ring-white/15"
                    : "bg-white/80 text-lavender-deep ring-1 ring-[#d8cce8]",
                )}
              >
                {planLine}
              </span>
              {me.user.subscriptionStatus === "active" || me.user.subscriptionStatus === "trialing" ? (
                <span
                  className={cn(
                    "text-[11px] font-medium uppercase tracking-[0.14em]",
                    isPro ? "text-[#c9bfd4]" : "text-lavender-deep/70",
                  )}
                >
                  Active
                </span>
              ) : null}
            </div>

            <h1
              className={cn(
                "mt-5 text-3xl font-semibold tracking-tight sm:text-4xl",
                isPro ? "text-white" : "text-ink",
              )}
            >
              {isPro
                ? `Welcome back to your Pro workspace`
                : `Welcome back to your Student workspace`}
            </h1>
            <p className={cn("mt-2 text-base", isPro ? "text-white/70" : "text-[#6d627a]")}>
              {isPro
                ? "Your Pro plan is active — text, PDF, image, YouTube, and diagrams are ready."
                : "Your Student plan is active. Create polished handwritten notes from your study material."}
            </p>
            <p className={cn("mt-1 text-sm", isPro ? "text-white/50" : "text-muted")}>
              Hi {me.user.name.split(" ")[0] || me.user.name}
            </p>

            {!me.user.emailVerified ? (
              <p
                className={cn(
                  "mt-4 rounded-xl px-4 py-3 text-sm",
                  isPro ? "bg-white/10 text-white/90" : "bg-lavender-soft/90 text-lavender-deep",
                )}
              >
                Verify your email before generating notes.{" "}
                <button
                  type="button"
                  className="underline"
                  onClick={() => api("/api/auth/resend-verification", { method: "POST" })}
                >
                  Resend verification
                </button>
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2 lg:justify-end">
            <Button
              href="/create"
              className={
                isPro
                  ? "bg-white text-[#302838] hover:bg-[#E9E1F0] shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
                  : "shadow-[0_8px_24px_rgba(103,76,145,0.2)]"
              }
            >
              Create notes
            </Button>
            {!isPro ? (
              <Button
                href={pricingHighlightHref("pro")}
                variant="secondary"
                className="border-[#d4c4e8] bg-white/90"
              >
                Upgrade to Pro
              </Button>
            ) : (
              <Button
                href="/billing"
                variant="secondary"
                className="border-white/25 bg-white/10 text-white hover:bg-white/15"
              >
                Manage plan
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Usage + library */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div
          className={cn(
            "relative overflow-hidden rounded-[1.35rem] border p-6 lg:col-span-2",
            isPro
              ? "border-white/10 bg-[#2a2433]/90 text-white shadow-[0_16px_40px_rgba(36,30,44,0.35)] backdrop-blur"
              : "border-[#e2d8ec] bg-white shadow-[0_14px_36px_rgba(103,76,145,0.08)]",
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p
                className={cn(
                  "text-xs font-semibold uppercase tracking-[0.14em]",
                  isPro ? "text-[#c9bfd4]" : "text-lavender-deep",
                )}
              >
                Credits & usage
              </p>
              <h2 className={cn("mt-1 text-lg font-semibold", isPro ? "text-white" : "text-ink")}>
                {isPro ? "Unlimited text · full Pro capacity" : "Student allowances this period"}
              </h2>
            </div>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                isPro ? "bg-white/10 text-white/80" : "bg-lavender-soft text-lavender-deep",
              )}
            >
              {planLine}
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <UsageStat
              isPro={isPro}
              label="Text"
              value={
                me.usage.textLimit === null
                  ? "Unlimited"
                  : `${me.usage.textUsed} / ${me.usage.textLimit}`
              }
              hint={me.usage.textLimit === null ? "No monthly cap" : "Generations used"}
            />
            <UsageStat
              isPro={isPro}
              label="Images"
              value={usageLine(me.usage.imageUsed, me.usage.imageLimit)}
              hint={me.usage.imageLimit === null ? "OCR included" : "Per month"}
            />
            <UsageStat
              isPro={isPro}
              label="Diagrams"
              value={usageLine(me.usage.diagramUsed, me.usage.diagramLimit)}
              hint={me.usage.diagramLimit === null ? "Unlimited" : "Per month"}
            />
          </div>

          {me.usage.textLimit !== null ? (
            <div className={cn("mt-5", isPro && "[&_.text-muted]:text-white/55 [&_span]:text-white/90")}>
              <UsageMeterPaid
                used={me.usage.textUsed}
                limit={me.usage.textLimit}
                isPro={isPro}
              />
            </div>
          ) : null}
        </div>

        <div
          className={cn(
            "rounded-[1.35rem] border p-6",
            isPro
              ? "border-white/10 bg-gradient-to-b from-[#352f42] to-[#2a2433] text-white shadow-[0_16px_40px_rgba(36,30,44,0.35)]"
              : "border-[#e2d8ec] bg-gradient-to-b from-white to-[#f8f4fc] shadow-[0_14px_36px_rgba(103,76,145,0.08)]",
          )}
        >
          <p
            className={cn(
              "text-xs font-semibold uppercase tracking-[0.14em]",
              isPro ? "text-[#c9bfd4]" : "text-lavender-deep",
            )}
          >
            Your library
          </p>
          <div className="mt-5 space-y-4">
            <StatRow isPro={isPro} label="Notes" value={String(me.stats.notes)} />
            <StatRow isPro={isPro} label="Folders" value={String(me.stats.folders)} />
          </div>
          <p className={cn("mt-6 text-sm leading-5", isPro ? "text-white/60" : "text-muted")}>
            {isPro
              ? "Premium handwriting styles and YouTube lecture notes are unlocked."
              : "YouTube lecture-to-notes stays on Pro — everything else Student needs is ready."}
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className={cn("text-lg font-semibold tracking-tight", isPro ? "text-ink" : "text-ink")}>
              Create from a source
            </h2>
            <p className="text-sm text-muted">
              {isPro
                ? "Every NoteScript source is available on Pro."
                : "Student sources, presented with care — YouTube unlocks on Pro."}
            </p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {SOURCES.map((s) => {
            const unlocked = canUseSource(planId, s.source);
            const required = requiredPlanForSource(s.source);
            if (unlocked) {
              return (
                <Link
                  key={s.href}
                  href={s.href}
                  className={cn(
                    "group relative flex flex-col rounded-[1.25rem] border p-4 transition duration-200 hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lavender",
                    isPro
                      ? "border-[#ddd5e3] bg-white shadow-[0_12px_32px_rgba(48,40,56,0.1)] hover:shadow-[0_18px_40px_rgba(48,40,56,0.16)] hover:border-[#c9bfd4]"
                      : "border-[#e2d8ec] bg-white shadow-[0_10px_28px_rgba(103,76,145,0.07)] hover:border-lavender/40 hover:shadow-[0_16px_36px_rgba(103,76,145,0.14)]",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl text-[11px] font-bold tracking-wide",
                      isPro
                        ? "bg-[#302838] text-[#E9E1F0]"
                        : "bg-lavender-soft text-lavender-deep",
                    )}
                  >
                    {s.mark}
                  </span>
                  <p className="mt-3 font-semibold text-ink">{s.label}</p>
                  <p className="mt-1 flex-1 text-xs leading-5 text-muted">{s.blurb}</p>
                  <span className="mt-3 text-xs font-medium text-lavender-deep opacity-0 transition group-hover:opacity-100">
                    Open →
                  </span>
                </Link>
              );
            }
            return (
              <Link
                key={s.href}
                href="/create/youtube"
                className={cn(
                  "group relative flex flex-col rounded-[1.25rem] border border-dashed p-4 transition duration-200 hover:-translate-y-0.5",
                  isPro
                    ? "border-[#c9bfd4] bg-white/80"
                    : "border-[#d8cce8] bg-[#faf7fd]/80 hover:border-[#c4b0db] hover:bg-white",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#302838]/90 text-[11px] font-bold text-[#E9E1F0]">
                    {s.mark}
                  </span>
                  <span className="rounded-full bg-[#302838] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#E9E1F0]">
                    {required} 🔒
                  </span>
                </div>
                <p className="mt-3 font-semibold text-ink/85">{s.label}</p>
                <p className="mt-1 text-xs leading-5 text-muted">{s.blurb}</p>
                <span className="mt-3 text-xs font-medium text-lavender-deep">View Pro upgrade</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent notes */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Recent notes</h2>
          <Link href="/notes" className="text-sm font-medium text-lavender-deep hover:underline">
            View all
          </Link>
        </div>
        {notes.length === 0 ? (
          <div
            className={cn(
              "rounded-[1.35rem] border border-dashed px-6 py-14 text-center",
              isPro ? "border-[#c9bfd4] bg-white" : "border-[#d8cce8] bg-white/70",
            )}
          >
            <h3 className="text-lg font-semibold">No handwritten notes yet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              Start from text, PDF, image
              {isPro ? ", YouTube," : ""} or a diagram — your {isPro ? "Pro" : "Student"} workspace
              is ready.
            </p>
            <div className="mt-5">
              <Button href="/create">Create notes</Button>
            </div>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {notes.slice(0, 6).map((n) => (
              <li key={n.id}>
                <Link
                  href={`/notes/${n.id}`}
                  className={cn(
                    "block rounded-[1.25rem] border p-4 transition duration-200 hover:-translate-y-0.5",
                    isPro
                      ? "border-[#ddd5e3] bg-white shadow-[0_10px_28px_rgba(48,40,56,0.08)] hover:shadow-[0_16px_36px_rgba(48,40,56,0.14)]"
                      : "border-[#e2d8ec] bg-white shadow-[0_8px_24px_rgba(103,76,145,0.06)] hover:shadow-[0_14px_32px_rgba(103,76,145,0.12)]",
                  )}
                >
                  <p className="font-medium text-ink">{n.title}</p>
                  <p className="mt-1 text-xs text-muted">
                    {n.subject} · {n.pageCount} pages · {formatDate(n.updatedAt)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Folders */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Folders</h2>
          <Link href="/folders" className="text-sm font-medium text-lavender-deep hover:underline">
            Manage
          </Link>
        </div>
        {folders.length === 0 ? (
          <p className="text-sm text-muted">No folders yet — organize notes as your library grows.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {folders.map((f) => (
              <li key={f.id}>
                <Link
                  href={`/folders/${f.id}`}
                  className={cn(
                    "inline-flex items-center rounded-full border px-3.5 py-1.5 text-sm transition",
                    isPro
                      ? "border-[#ddd5e3] bg-white shadow-sm hover:border-[#302838]/30"
                      : "border-[#e2d8ec] bg-white shadow-sm hover:border-lavender/45",
                  )}
                >
                  {f.name}
                  <span className="ms-1.5 text-muted">({f.noteCount})</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function UsageStat({
  isPro,
  label,
  value,
  hint,
}: {
  isPro: boolean;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-3",
        isPro ? "border-white/10 bg-white/5" : "border-[#eee8f4] bg-[#faf7fd]",
      )}
    >
      <p className={cn("text-xs font-medium", isPro ? "text-[#c9bfd4]" : "text-muted")}>{label}</p>
      <p className={cn("mt-1 text-lg font-semibold tracking-tight", isPro ? "text-white" : "text-ink")}>
        {value}
      </p>
      <p className={cn("mt-0.5 text-[11px]", isPro ? "text-white/45" : "text-muted")}>{hint}</p>
    </div>
  );
}

function StatRow({ isPro, label, value }: { isPro: boolean; label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className={cn("text-sm", isPro ? "text-white/65" : "text-muted")}>{label}</span>
      <span className={cn("text-2xl font-semibold tracking-tight", isPro ? "text-white" : "text-ink")}>
        {value}
      </span>
    </div>
  );
}

function UsageMeterPaid({
  used,
  limit,
  isPro,
}: {
  used: number;
  limit: number;
  isPro: boolean;
}) {
  const pct = Math.min(100, Math.round((used / limit) * 100));
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className={cn("font-medium", isPro ? "text-white/90" : undefined)}>Text generations</span>
        <span className={cn(isPro ? "text-white/55" : "text-muted")}>
          {used} / {limit}
        </span>
      </div>
      <div className={cn("h-2 overflow-hidden rounded-full", isPro ? "bg-white/15" : "bg-lavender-soft")}>
        <div
          className={cn("h-full rounded-full transition-all", isPro ? "bg-[#E9E1F0]" : "bg-lavender")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
