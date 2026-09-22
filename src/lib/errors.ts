export class AppError extends Error {
  constructor(
    message: string,
    public status = 400,
    public code = "APP_ERROR",
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Please sign in to continue.") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have access to this resource.") {
    super(message, 403, "FORBIDDEN");
  }
}

/** Structured entitlement denial for upgrade UX (no sensitive billing fields). */
export class FeatureNotAvailableError extends AppError {
  constructor(
    public feature: string,
    public requiredPlan: "free" | "student" | "pro",
    public currentPlan: "free" | "student" | "pro",
    message?: string,
  ) {
    super(
      message ||
        `This feature requires the ${requiredPlan} plan.`,
      403,
      "FEATURE_NOT_AVAILABLE",
    );
    this.name = "FeatureNotAvailableError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "We could not find that.") {
    super(message, 404, "NOT_FOUND");
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests. Please wait a moment.") {
    super(message, 429, "RATE_LIMIT");
  }
}

export function publicErrorMessage(error: unknown): { message: string; status: number; code: string } {
  if (error instanceof AppError) {
    return { message: error.message, status: error.status, code: error.code };
  }
  console.error(error);
  return {
    message: "Something went wrong. Please try again.",
    status: 500,
    code: "INTERNAL",
  };
}
