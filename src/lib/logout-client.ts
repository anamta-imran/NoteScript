import { clearPlanActivation } from "@/lib/plan-activation";

/**
 * Client-side logout: clear session cookie via API, drop local activation flags,
 * then hard-navigate to Login so the protected AppShell cannot linger.
 */
export async function performLogout(options?: { signedOutBanner?: boolean }): Promise<void> {
  clearPlanActivation();

  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
  } catch {
    // Cookie may already be gone — still leave the protected shell.
  }

  const qs = options?.signedOutBanner === false ? "" : "?signedOut=1";
  window.location.replace(`/login${qs}`);
}
