"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { PlanBadge } from "@/components/billing/PlanBadge";
import { PlanActivationGuard } from "@/components/billing/PlanActivationGuard";
import { getPlanTheme } from "@/lib/plan-theme";
import { cn } from "@/lib/utils";
import { t, dirForInterface } from "@/lib/i18n";
import type { InterfaceLanguage, PublicUser } from "@/lib/types";

const NAV = [
  { href: "/dashboard", key: "dashboard" as const },
  { href: "/create", key: "create" as const },
  { href: "/notes", key: "notes" as const },
  { href: "/folders", key: "folders" as const },
  { href: "/settings", key: "settings" as const },
  { href: "/billing", key: "billing" as const },
];

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
  const theme = getPlanTheme(user.planId);
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
              ? theme.asideLinkActive
              : theme.asideLinkIdle,
          )}
        >
          {t(lang, n.key)}
        </Link>
      ))}
    </nav>
  );

  return (
    <PlanActivationGuard user={user}>
      <div className={cn("min-h-screen lg:grid lg:grid-cols-[248px_1fr]", theme.shellBg)} dir={dir}>
        <aside className={cn("no-print hidden border-e p-5 lg:block", theme.asideClass)}>
          <div className="flex items-center justify-between gap-2">
            <Link href="/dashboard" className={cn("font-hand-clean text-2xl", theme.brandClass)}>
              NoteScript
            </Link>
            <PlanBadge planId={user.planId} />
          </div>
          {user.planId === "student" ? (
            <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.14em] text-lavender-deep/80">
              Student workspace
            </p>
          ) : null}
          {isPro ? (
            <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.14em] text-[#c9bfd4]">
              Pro workspace
            </p>
          ) : null}
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
              theme.headerMobile,
            )}
          >
            <Link
              href="/dashboard"
              className={cn("font-hand-clean text-xl", isPro ? "text-white" : theme.brandClass)}
            >
              NoteScript
            </Link>
            <div className="flex items-center gap-2">
              <PlanBadge planId={user.planId} />
              <Button variant="secondary" size="sm" onClick={() => setOpen(true)} aria-expanded={open}>
                Menu
              </Button>
            </div>
          </header>
          {open ? (
            <div className="fixed inset-0 z-40 lg:hidden">
              <button
                className="absolute inset-0 bg-ink/30"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              />
              <div className={cn("absolute inset-y-0 start-0 w-72 p-4 shadow-xl", theme.asideClass)}>
                <div className="mb-4 flex items-center justify-between">
                  <span className={cn("font-hand-clean text-xl", theme.brandClass)}>NoteScript</span>
                  <PlanBadge planId={user.planId} />
                </div>
                {links}
                <Button variant="ghost" className="mt-6 w-full" onClick={logout}>
                  {t(lang, "logout")}
                </Button>
              </div>
            </div>
          ) : null}
          <main id="main" className="px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </PlanActivationGuard>
  );
}
