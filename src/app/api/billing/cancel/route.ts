import { requireUser } from "@/lib/auth";
import { handleRouteError, json } from "@/lib/http";
import { AppError } from "@/lib/errors";
import { connectDb } from "@/lib/db";
import { Subscription } from "@/models/Subscription";
import { paddleConfigured, paddleRequest } from "@/lib/paddle";

type PaddleCancelResponse = {
  data: {
    id: string;
    status: string;
    scheduled_change?: {
      action: string;
      effective_at: string;
    } | null;
  };
};

export async function POST() {
  try {
    const user = await requireUser();

    if (!paddleConfigured() || !user.paddleSubscriptionId) {
      throw new AppError(
        "No active subscription is available for this account.",
        400,
      );
    }

    const response = await paddleRequest<PaddleCancelResponse>(
      `/subscriptions/${user.paddleSubscriptionId}/cancel`,
      {
        method: "POST",
        body: JSON.stringify({
          effective_at: "next_billing_period",
        }),
      },
    );

    await connectDb();

    const effectiveAt = response.data.scheduled_change?.effective_at
      ? new Date(response.data.scheduled_change.effective_at)
      : undefined;

    await Subscription.updateOne(
      { paddleSubscriptionId: user.paddleSubscriptionId },
      {
        status: response.data.status,
        cancelAtPeriodEnd: true,
        currentPeriodEnd: effectiveAt,
      },
    );

    return json({
      ok: true,
      cancelAtPeriodEnd: true,
      currentPeriodEnd: effectiveAt,
    });
  } catch (e) {
    return handleRouteError(e);
  }
}
