import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AppShell } from "@/components/app/AppShell";
import { requireUser, toPublicUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ApplicationLayout({ children }: { children: React.ReactNode }) {
  let user;
  try {
    user = await requireUser();
  } catch {
    const h = await headers();
    const raw = h.get("x-pathname") || "/dashboard";
    const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/dashboard";
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  return <AppShell user={toPublicUser(user)}>{children}</AppShell>;
}
