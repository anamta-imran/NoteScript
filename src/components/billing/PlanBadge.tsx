import { getPlanTheme } from "@/lib/plan-theme";
import type { PlanId } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PlanBadge({
  planId,
  className,
  size = "sm",
}: {
  planId: PlanId;
  className?: string;
  size?: "sm" | "md";
}) {
  const theme = getPlanTheme(planId);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-semibold uppercase tracking-[0.12em]",
        size === "sm" ? "px-2.5 py-0.5 text-[10px]" : "px-3 py-1 text-[11px]",
        theme.badgeClass,
        className,
      )}
    >
      {theme.label}
    </span>
  );
}
