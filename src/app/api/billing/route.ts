import { requireUser, toPublicUser } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { Invoice } from "@/models/Subscription";
import { getUsage } from "@/lib/usage";
import { handleRouteError, json } from "@/lib/http";
import { getPlan } from "@/lib/plans";
import { paddleConfigured } from "@/lib/paddle";
import { polarConfigured } from "@/lib/polar";
import type { PlanId } from "@/lib/types";

export async function GET() {
  try {
    const user = await requireUser();

    await connectDb();

    const usage = await getUsage(user);

    const invoices = await Invoice.find({
      userId: user._id,
    })
      .sort({ createdAt: -1 })
      .limit(24);

    return json({
      user: toPublicUser(user),
      usage,
      plan: getPlan(user.planId as PlanId),
      paymentsConfigured: polarConfigured() || paddleConfigured(),
      invoices: invoices.map((invoice) => ({
        id: String(invoice._id),
        amountPaid: invoice.amountPaid,
        currency: invoice.currency,
        status: invoice.status,
        hostedInvoiceUrl: invoice.hostedInvoiceUrl,
        description: invoice.description,
        createdAt: invoice.createdAt,
      })),
    });
  } catch (e) {
    return handleRouteError(e);
  }
}
