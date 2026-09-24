import { NextRequest } from "next/server";

import { appUrl, requireUser } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { handleRouteError, json } from "@/lib/http";
import { getPolar, polarConfigured } from "@/lib/polar";
import { polarPriceIdEnv } from "@/lib/plans";
import type { BillingCycle, PlanId } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();

    if (!polarConfigured()) {
      throw new AppError(
        "Polar is not configured. Set POLAR_ACCESS_TOKEN in your environment.",
        503,
        "PAYMENTS_DISABLED",
      );
    }

    const { planId, billingCycle } = (await req.json()) as {
      planId: PlanId;
      billingCycle: BillingCycle;
    };

    if (planId !== "student" && planId !== "pro") {
      throw new AppError("Choose Student or Pro to continue to checkout.", 400);
    }

    if (billingCycle !== "monthly" && billingCycle !== "annual") {
      throw new AppError("Choose monthly or annual billing.", 400);
    }

    // Server resolves the Polar product/price ID — never trust a client-supplied ID.
    const productId = polarPriceIdEnv(planId, billingCycle);

    if (!productId) {
      throw new AppError(
        "This Polar price is not configured. Check the POLAR_PRICE_* environment variables.",
        503,
        "PAYMENTS_DISABLED",
      );
    }

    const userId = String(user._id);
    const base = appUrl().replace(/\/$/, "");
    const successUrl =
      `${base}/billing?checkout=success` +
      `&plan=${encodeURIComponent(planId)}` +
      `&cycle=${encodeURIComponent(billingCycle)}` +
      `&checkout_id={CHECKOUT_ID}`;
    const returnUrl = `${base}/billing`;

    const metadata = {
      userId,
      planId,
      billingCycle,
    };

    try {
      const polar = getPolar();
      const checkout = await polar.checkouts.create({
        products: [productId],
        externalCustomerId: userId,
        customerEmail: user.email,
        customerName: user.name || undefined,
        ...(user.polarCustomerId ? { customerId: user.polarCustomerId } : {}),
        metadata,
        customerMetadata: metadata,
        successUrl,
        returnUrl,
      });

      if (!checkout.url) {
        throw new AppError("Polar did not return a checkout URL.", 502, "POLAR_API_ERROR");
      }

      return json({
        url: checkout.url,
        checkoutId: checkout.id,
        planId,
        billingCycle,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;

      const message =
        error instanceof Error && error.message
          ? error.message
          : "Could not create Polar checkout.";

      console.error("[Polar checkout] create failed:", message);
      throw new AppError(
        "Could not start checkout. Please try again.",
        502,
        "POLAR_API_ERROR",
      );
    }
  } catch (e) {
    return handleRouteError(e);
  }
}
