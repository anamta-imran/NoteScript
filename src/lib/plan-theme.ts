import type { PlanId } from "./types";
import { cn } from "./utils";

export type PlanTheme = {
  id: PlanId;
  label: string;
  badgeClass: string;
  shellBg: string;
  asideClass: string;
  asideLinkActive: string;
  asideLinkIdle: string;
  brandClass: string;
  headerMobile: string;
  heroClass: string;
  heroMuted: string;
  cardClass: string;
  accentBar: string;
};

export const PLAN_THEMES: Record<PlanId, PlanTheme> = {
  free: {
    id: "free",
    label: "Free",
    badgeClass: "bg-[#efeaf3] text-[#5c5366] ring-1 ring-[#ddd5e3]",
    shellBg: "bg-paper",
    asideClass: "border-line bg-white/80",
    asideLinkActive: "bg-[#f3eef8] text-lavender-deep",
    asideLinkIdle: "text-muted hover:bg-white hover:text-ink",
    brandClass: "text-lavender-deep",
    headerMobile: "border-line bg-white/90",
    heroClass: "border-line bg-white",
    heroMuted: "text-muted",
    cardClass: "border-line bg-white shadow-[0_8px_24px_rgba(45,31,58,0.04)]",
    accentBar: "from-[#e9e1f0] to-transparent",
  },
  student: {
    id: "student",
    label: "Student",
    badgeClass:
      "bg-gradient-to-r from-[#efe6fa] to-[#e4daf4] text-[#4f3a6b] ring-1 ring-[#cbb8e0]/70 shadow-sm",
    shellBg: "bg-[#f7f4fa]",
    asideClass: "border-[#e2d8ec] bg-gradient-to-b from-white to-[#f6f1fb]",
    asideLinkActive: "bg-lavender-soft text-lavender-deep shadow-sm",
    asideLinkIdle: "text-muted hover:bg-white/80 hover:text-ink",
    brandClass: "text-lavender-deep",
    headerMobile: "border-[#e2d8ec] bg-white/95",
    heroClass:
      "border-[#d8cce8] bg-gradient-to-br from-white via-[#faf7fd] to-[#f0e9f8] shadow-[0_12px_40px_rgba(103,76,145,0.08)]",
    heroMuted: "text-[#6d627a]",
    cardClass:
      "border-[#e2d8ec] bg-white shadow-[0_12px_32px_rgba(103,76,145,0.07)]",
    accentBar: "from-lavender to-lavender-deep",
  },
  pro: {
    id: "pro",
    label: "Pro",
    badgeClass: "bg-[#E9E1F0] text-[#302838] ring-1 ring-white/20 shadow-sm",
    shellBg: "bg-[#F5F2F7]",
    asideClass: "border-[#3d3548] bg-[#302838] text-white",
    asideLinkActive: "bg-white/12 text-white",
    asideLinkIdle: "text-[#c9bfd4] hover:bg-white/5 hover:text-white",
    brandClass: "text-[#E9E1F0]",
    headerMobile: "border-[#ddd5e3] bg-[#302838] text-white",
    heroClass:
      "border-[#302838]/25 bg-gradient-to-br from-[#302838] via-[#3a3148] to-[#4a3d5c] text-white shadow-[0_16px_48px_rgba(48,40,56,0.28)]",
    heroMuted: "text-white/70",
    cardClass:
      "border-[#ddd5e3] bg-white shadow-[0_14px_40px_rgba(48,40,56,0.1)]",
    accentBar: "from-[#E9E1F0] to-[#80639d]",
  },
};

export function getPlanTheme(planId: PlanId): PlanTheme {
  return PLAN_THEMES[planId];
}

export function planShellClass(planId: PlanId): string {
  return cn("min-h-screen lg:grid lg:grid-cols-[248px_1fr]", PLAN_THEMES[planId].shellBg);
}
