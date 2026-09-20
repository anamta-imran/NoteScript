"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { t, dirForInterface } from "@/lib/i18n";
import type { InterfaceLanguage, PlanId, PublicUser } from "@/lib/types";

const NAV = [
  { href: "/dashboard", key: "dashboard" as const },
  { href: "/create", key: "create" as const },
  { href: "/notes", key: "notes" as const },
  { href: "/folders", key: "folders" as const },
  { href: "/settings", key: "settings" as const },
  { href: "/billing", key: "billing" as const },
];

function planBadge(planId: PlanId) {
  if (planId === "pro") return { label: "PRO", className: "bg-[#302838] text-[#E9E1F0]" };
  if (planId === "student") return { label: "STUDENT", className: "bg-lavender-soft text-lavender-deep" };
  return { label: "FREE", className: "bg-line text-muted" };
}

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: PublicUser;
}) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const lang = (user.interfaceLanguage || "en") as InterfaceLanguage;
  const dir = dirForInterface(lang);
  const badge = planBadge(user.planId);
  const isPro = user.planId === "pro";

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const links = (
    <nav className="flex flex-col gap-1">
      {NAV.map((n) => (
        <Link
          key={n.href}
          href={n.href}
          prefetch
          onClick={() => setOpen(false)}
          className={cn(
            "rounded-xl px-3 py-2 text-sm transition-colors",
            path === n.href || path.startsWith(`${n.href}/`)
              ? isPro
                ? "bg-white/10 text-white"
                : "bg-lavender-soft text-lavender-deep"
              : isPro
                ? "text-[#c9bfd4] hover:bg-white/5 hover:text-white"
                : "text-muted hover:bg-white",
          )}
        >
          {t(lang, n.key)}
        </Link>
      ))}
    </nav>
  );

  return (
    <div
      className={cn(
        "min-h-screen lg:grid lg:grid-cols-[240px_1fr]",
        isPro ? "bg-[#F5F2F7]" : "bg-paper",
      )}
      dir={dir}
    >
      <aside
        className={cn(
          "no-print hidden border-e p-4 lg:block",
          isPro ? "border-[#3d3548] bg-[#302838] text-white" : "border-line bg-white/70",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/dashboard"
            className={cn(
              "font-hand-clean text-2xl",
              isPro ? "text-[#E9E1F0]" : "text-lavender-deep",
            )}
          >
            NoteScript
          </Link>
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide", badge.className)}>
            {badge.label}
          </span>
        </div>
        <div className="mt-8">{links}</div>
        <Button
          variant="ghost"
          className={cn("mt-8 w-full", isPro && "text-[#c9bfd4] hover:bg-white/5 hover:text-white")}
          onClick={logout}
        >
          {t(lang, "logout")}
        </Button>
      </aside>
      <div>
        <header
          className={cn(
            "no-print flex items-center justify-between border-b px-4 py-3 lg:hidden",
            isPro ? "border-[#ddd5e3] bg-[#302838] text-white" : "border-line bg-white/80",
          )}
        >
          <Link href="/dashboard" className={cn("font-hand-clean text-xl", isPro ? "text-white" : "text-lavender-deep")}>
            NoteScript
          </Link>
          <div className="flex items-center gap-2">
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", badge.className)}>
              {badge.label}
            </span>
            <Button variant="secondary" size="sm" onClick={() => setOpen(true)} aria-expanded={open}>
              Menu
            </Button>
          </div>
        </header>
        {open ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button className="absolute inset-0 bg-ink/30" aria-label="Close menu" onClick={() => setOpen(false)} />
            <div
              className={cn(
                "absolute inset-y-0 start-0 w-72 p-4 shadow-xl",
                isPro ? "bg-[#302838] text-white" : "bg-white",
              )}
            >
              {links}
              <Button variant="ghost" className="mt-6 w-full" onClick={logout}>
                {t(lang, "logout")}
              </Button>
            </div>
          </div>
        ) : null}
        <main id="main" className="px-4 py-6 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
