import { AppError } from "./errors";

function paddleBaseUrl() {
  const env = process.env.PADDLE_ENV || process.env.NEXT_PUBLIC_PADDLE_ENV || "sandbox";
  return env === "production" ? "https://api.paddle.com" : "https://sandbox-api.paddle.com";
}

function getPaddleApiKey(): string {
  const key = process.env.PADDLE_API_KEY;

  if (!key) {
    throw new AppError(
      "Paddle is not configured. Set PADDLE_API_KEY in your environment.",
      503,
      "PAYMENTS_DISABLED",
    );
  }

  return key;
}

export function paddleConfigured(): boolean {
  return Boolean(process.env.PADDLE_API_KEY);
}

export async function paddleRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${paddleBaseUrl()}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${getPaddleApiKey()}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data &&
      typeof data === "object" &&
      "error" in data &&
      data.error &&
      typeof data.error === "object" &&
      "detail" in data.error
        ? String(data.error.detail)
        : "Paddle API request failed.";

    throw new AppError(message, response.status, "PADDLE_API_ERROR");
  }

  return data as T;
}
