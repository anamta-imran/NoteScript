import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { priceIdEnv } from "@/lib/plans";
import { handleRouteError, json } from "@/lib/http";
import { AppError } from "@/lib/errors";
import type { BillingCycle, PlanId } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();

    const { planId, billingCycle } = (await req.json()) as {
      planId: PlanId;
      billingCycle: BillingCycle;
    };

    if (planId === "free") {
      throw new AppError("The Free plan does not require checkout.");
    }

    const priceId = priceIdEnv(planId, billingCycle);

    if (!priceId) {
      throw new AppError(
        "This Paddle price is not configured. Check the Paddle price environment variables.",
        503,
        "PAYMENTS_DISABLED",
      );
    }

    return json({
      priceId,
      planId,
      billingCycle,
      customer: {
        email: user.email,
      },
      customData: {
        userId: String(user._id),
        planId,
        billingCycle,
      },
    });
  } catch (e) {
    return handleRouteError(e);
  }
}
