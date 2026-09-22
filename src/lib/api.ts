export class ApiError extends Error {
  code?: string;
  status?: number;
  feature?: string;
  requiredPlan?: string;
  currentPlan?: string;

  constructor(
    message: string,
    meta?: {
      code?: string;
      status?: number;
      feature?: string;
      requiredPlan?: string;
      currentPlan?: string;
    },
  ) {
    super(message);
    this.name = "ApiError";
    this.code = meta?.code;
    this.status = meta?.status;
    this.feature = meta?.feature;
    this.requiredPlan = meta?.requiredPlan;
    this.currentPlan = meta?.currentPlan;
  }
}

function isAuthPagePath(pathname: string): boolean {
  return (
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/verify-email")
  );
}

/** If a protected client call gets 401, leave the app shell for Login (with return path). */
function redirectToLoginIfUnauthorized(status: number, code?: string) {
  if (typeof window === "undefined") return;
  if (status !== 401) return;
  if (code && code !== "UNAUTHORIZED") return;
  const { pathname, search } = window.location;
  if (isAuthPagePath(pathname)) return;
  const next = `${pathname}${search || ""}`;
  const qs = new URLSearchParams();
  qs.set("next", next);
  window.location.replace(`/login?${qs.toString()}`);
}

export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  const isForm = typeof FormData !== "undefined" && init?.body instanceof FormData;
  if (!isForm && !headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(url, { ...init, headers, credentials: "include", cache: "no-store" });
  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    code?: string;
    feature?: string;
    requiredPlan?: string;
    currentPlan?: string;
  } & T;
  if (!res.ok) {
    // Never auto-redirect the logout or login endpoints themselves.
    const isAuthEndpoint =
      url.includes("/api/auth/login") ||
      url.includes("/api/auth/signup") ||
      url.includes("/api/auth/logout");
    if (!isAuthEndpoint) {
      redirectToLoginIfUnauthorized(res.status, data.code);
    }
    throw new ApiError(data.error || "Request failed.", {
      code: data.code,
      status: res.status,
      feature: data.feature,
      requiredPlan: data.requiredPlan,
      currentPlan: data.currentPlan,
    });
  }
  return data as T;
}
