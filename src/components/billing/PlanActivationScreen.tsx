"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { PlanBadge } from "@/components/billing/PlanBadge";
import type { PlanId } from "@/lib/types";
import { cn } from "@/lib/utils";

const COPY: Record<
  Extract<PlanId, "student" | "pro">,
  { title: string; ready: string; waiting: string }
> = {
  student: {
    title: "Activating your Student Plan",
    ready: "Your payment was successful. We're getting your Student workspace ready.",
    waiting:
      "Your payment was successful. We're still activating your Student Plan — this usually takes a few moments.",
  },
  pro: {
    title: "Activating your Pro Plan",
    ready: "Your payment was successful. We're unlocking your Pro workspace.",
    waiting:
      "Your payment was successful. We're still activating your Pro Plan — this usually takes a few moments.",
  },
};

export function PlanActivationScreen({
  expectedPlan,
  takingLonger = false,
  onRefresh,
  className,
}: {
  expectedPlan: Extract<PlanId, "student" | "pro">;
  takingLonger?: boolean;
  onRefresh?: () => void;
  className?: string;
}) {
  const isPro = expectedPlan === "pro";
  const copy = COPY[expectedPlan];
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const id = window.setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : `${d}.`));
    }, 450);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[80] flex items-center justify-center px-4",
        isPro
          ? "bg-gradient-to-br from-[#241e2c] via-[#302838] to-[#3d3348]"
          : "bg-gradient-to-br from-[#f7f4fa] via-[#efe6fa] to-[#e4daf4]",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className={cn(
          "relative w-full max-w-md overflow-hidden rounded-[1.75rem] border p-8 text-center shadow-[0_28px_80px_rgba(48,40,56,0.22)] sm:p-10",
          isPro
            ? "border-white/10 bg-white/8 text-white backdrop-blur-xl"
            : "border-[#d8cce8] bg-white/95 text-ink",
        )}
      >
        <div
          className={cn(
            "mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl",
            isPro ? "bg-white/10" : "bg-lavender-soft",
          )}
        >
          <span
            className={cn(
              "h-8 w-8 animate-spin rounded-full border-2 border-t-transparent",
              isPro ? "border-white/80 border-t-transparent" : "border-lavender-deep border-t-transparent",
            )}
            aria-hidden
          />
        </div>
        <div className="flex justify-center">
          <PlanBadge planId={expectedPlan} size="md" />
        </div>
        <h1
          className={cn(
            "mt-5 text-2xl font-semibold tracking-tight",
            isPro ? "text-white" : "text-ink",
          )}
        >
          {copy.title}
          {dots}
        </h1>
        <p className={cn("mt-3 text-sm leading-6", isPro ? "text-white/70" : "text-muted")}>
          {takingLonger ? copy.waiting : copy.ready}
        </p>
        <div
          className={cn(
            "mx-auto mt-6 h-1.5 w-40 overflow-hidden rounded-full",
            isPro ? "bg-white/15" : "bg-lavender-soft",
          )}
        >
          <div
            className={cn(
              "h-full w-1/2 animate-pulse rounded-full",
              isPro ? "bg-[#E9E1F0]" : "bg-lavender",
            )}
          />
        </div>
        {takingLonger && onRefresh ? (
          <div className="mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={onRefresh}
              className={isPro ? "border-white/20 bg-white/10 text-white hover:bg-white/15" : ""}
            >
              Refresh status
            </Button>
          </div>
        ) : null}
        <p className={cn("mt-6 text-xs", isPro ? "text-white/45" : "text-muted")}>
          Please keep this tab open. We never unlock paid features until your subscription is
          confirmed.
        </p>
      </div>
    </div>
  );
}
