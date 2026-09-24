import { getPlanTheme } from "@/lib/plan-theme";
import type { PlanId } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Thin chrome around preview dashboards — no auth, no billing side effects. */
export function PreviewShell({
  planId,
  children,
}: {
  planId: Extract<PlanId, "student" | "pro">;
  children: React.ReactNode;
}) {
  const theme = getPlanTheme(planId);
  const isPro = planId === "pro";

  return (
    <div className={cn("min-h-screen", theme.shellBg)}>
      <header
        className={cn(
          "no-print flex items-center justify-between border-b px-4 py-3 sm:px-6",
          isPro ? "border-[#3d3548] bg-[#302838] text-white" : "border-[#e2d8ec] bg-white/90",
        )}
      >
        <span className={cn("font-hand-clean text-xl", theme.brandClass)}>NoteScript</span>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
            isPro
              ? "bg-white/12 text-white/75 ring-1 ring-white/15"
              : "bg-[#f3eef8] text-lavender-deep ring-1 ring-[#e2d8ec]",
          )}
        >
          UI preview
        </span>
      </header>
      <main id="main" className="px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
