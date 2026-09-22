export class ApiError extends Error {
  code?: string;
  feature?: string;
  requiredPlan?: string;
  currentPlan?: string;

  constructor(
    message: string,
    meta?: {
      code?: string;
      feature?: string;
      requiredPlan?: string;
      currentPlan?: string;
    },
  ) {
    super(message);
    this.name = "ApiError";
    this.code = meta?.code;
    this.feature = meta?.feature;
    this.requiredPlan = meta?.requiredPlan;
    this.currentPlan = meta?.currentPlan;
  }
}

export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  const isForm = typeof FormData !== "undefined" && init?.body instanceof FormData;
  if (!isForm && !headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(url, { ...init, headers, credentials: "include" });
  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    code?: string;
    feature?: string;
    requiredPlan?: string;
    currentPlan?: string;
  } & T;
  if (!res.ok) {
    throw new ApiError(data.error || "Request failed.", {
      code: data.code,
      feature: data.feature,
      requiredPlan: data.requiredPlan,
      currentPlan: data.currentPlan,
    });
  }
  return data as T;
}
