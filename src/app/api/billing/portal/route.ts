import { requireUser } from "@/lib/auth";
import { handleRouteError, json } from "@/lib/http";
import { AppError } from "@/lib/errors";
import { appUrl } from "@/lib/auth";
import { paddleConfigured, paddleRequest } from "@/lib/paddle";

type PaddlePortalResponse = {
  data: {
    urls: {
      general: {
        overview: string;
        transaction_history: string;
      };
    };
  };
};

export async function POST() {
  try {
    const user = await requireUser();

    if (!paddleConfigured() || !user.paddleCustomerId) {
      throw new AppError(
        "No billing portal is available for this account yet.",
        400,
      );
    }

    const response = await paddleRequest<PaddlePortalResponse>(
      `/customers/${user.paddleCustomerId}/portal-sessions`,
      {
        method: "POST",
        body: JSON.stringify({
          subscription_ids: user.paddleSubscriptionId
            ? [user.paddleSubscriptionId]
            : [],
          return_url: `${appUrl()}/billing`,
        }),
      },
    );

    const url = response.data.urls.general.overview;

    if (!url) {
      throw new AppError("Could not create the billing portal session.");
    }

    return json({ url });
  } catch (e) {
    return handleRouteError(e);
  }
}
