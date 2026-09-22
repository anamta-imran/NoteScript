"use client";

import { useState } from "react";
import { performLogout } from "@/lib/logout-client";
import type { PlanId } from "@/lib/types";
import { cn } from "@/lib/utils";

export function LogoutButton({
  planId,
  label = "Log out",
  className,
}: {
  planId: PlanId;
  label?: string;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const isPro = planId === "pro";
  const isStudent = planId === "student";

  async function onClick() {
    if (busy) return;
    setBusy(true);
    try {
      await performLogout();
    } catch {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition duration-150",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        "disabled:pointer-events-none disabled:opacity-60",
        isPro &&
          "border border-white/30 bg-white/12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] hover:border-white/45 hover:bg-white/20 active:bg-white/25 focus-visible:outline-white/70",
        isStudent &&
          "border border-[#d4c4e8] bg-white text-lavender-deep shadow-sm hover:border-lavender/50 hover:bg-lavender-soft/70 active:bg-lavender-soft focus-visible:outline-lavender",
        !isPro &&
          !isStudent &&
          "border border-line bg-white text-ink shadow-sm hover:border-lavender/35 hover:bg-[#f7f4fa] active:bg-lavender-soft/50 focus-visible:outline-lavender",
        className,
      )}
    >
      {busy ? "Signing out…" : label}
    </button>
  );
}
