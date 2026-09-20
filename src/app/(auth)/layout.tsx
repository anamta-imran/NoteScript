import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getSessionUserId } from "@/lib/auth";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  // Only redirect when the session JWT is valid. A stale/invalid cookie must not
  // bounce users through /dashboard → /login (white-page loop).
  const userId = await getSessionUserId();
  if (userId) {
    redirect("/dashboard");
  }
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <main id="main" className="w-full max-w-md">
        <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>{children}</Suspense>
      </main>
    </div>
  );
}
