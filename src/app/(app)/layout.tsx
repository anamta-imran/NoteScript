import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/AppShell";
import { requireUser, toPublicUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ApplicationLayout({ children }: { children: React.ReactNode }) {
  let user;
  try {
    user = await requireUser();
  } catch {
    redirect("/login");
  }

  return <AppShell user={toPublicUser(user)}>{children}</AppShell>;
}
