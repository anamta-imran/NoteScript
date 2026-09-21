import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy",
  robots: { index: true },
};

export default function RefundPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-sm leading-relaxed">
      <h1 className="text-3xl font-semibold">Refund Policy</h1>
      <p className="mt-4 text-muted">
        This Refund Policy explains how refunds and cancellations work for NoteScript, a subscription SaaS
        product that turns study material into handwritten-style notes. Paid billing is handled by our payment
        provider (Paddle when configured). This page is a practical policy for customers and should be reviewed
        by counsel before production use.
      </p>

      <h2 className="mt-10 text-lg font-semibold">Subscriptions</h2>
      <p className="mt-3 text-muted">
        NoteScript offers Free, Student, and Pro plans. Paid Student and Pro plans may be billed monthly or
        annually. A paid subscription unlocks the features and usage limits described on our Pricing page for the
        selected plan and billing cycle. Plan benefits apply only while a subscription is active according to
        our billing records and verified payment-provider events.
      </p>

      <h2 className="mt-10 text-lg font-semibold">Free usage</h2>
      <p className="mt-3 text-muted">
        The Free plan does not require a paid subscription. Free usage is not a paid purchase, so there is
        nothing to refund for Free-plan activity. Limits on Free usage are enforced by the product and may change
        over time as described in Pricing and Terms.
      </p>

      <h2 className="mt-10 text-lg font-semibold">Monthly and annual billing</h2>
      <p className="mt-3 text-muted">
        Monthly subscriptions renew each billing period until cancelled. Annual subscriptions are charged for a
        full year of access at the annual price shown at checkout, then renew annually until cancelled. Prices
        and features shown at checkout apply to that purchase. Taxes and currency conversion, if any, are
        determined by the payment provider at checkout.
      </p>

      <h2 className="mt-10 text-lg font-semibold">When you may request a refund</h2>
      <p className="mt-3 text-muted">You may request a refund review if, for example:</p>
      <ul className="mt-3 list-disc space-y-2 ps-5 text-muted">
        <li>You were charged twice for the same subscription period.</li>
        <li>You were charged after a successful cancellation that should have stopped the next renewal.</li>
        <li>There was a clear billing error (wrong plan, wrong amount, or unintended duplicate charge).</li>
        <li>
          You request a refund promptly after an accidental purchase and have made little or no use of paid
          features in that billing period.
        </li>
      </ul>
      <p className="mt-3 text-muted">
        Refund requests are reviewed case by case. Approval is not guaranteed and may depend on usage, timing,
        and payment-provider rules.
      </p>

      <h2 className="mt-10 text-lg font-semibold">How to request a refund</h2>
      <p className="mt-3 text-muted">
        To request a refund, email us at{" "}
        <span className="font-medium text-foreground">notescript10@gmail.com</span> with:
      </p>
      <ul className="mt-3 list-disc space-y-2 ps-5 text-muted">
        <li>The email address on your NoteScript account</li>
        <li>Approximate charge date and amount</li>
        <li>Plan name (Student or Pro) and billing cycle (monthly or annual)</li>
        <li>A short description of the issue</li>
      </ul>
      <p className="mt-3 text-muted">
        If you manage billing through the Paddle customer portal, you may also open a billing inquiry there. We
        may ask for additional details to verify the charge.
      </p>

      <h2 className="mt-10 text-lg font-semibold">Cancellation vs refund</h2>
      <p className="mt-3 text-muted">
        Cancelling a subscription stops future renewals. Depending on your plan settings, access may continue
        until the end of the current paid period. Cancellation by itself does not automatically refund amounts
        already paid for the current period. A refund is a separate request and, if approved, is processed
        according to this policy and the payment provider&apos;s timelines.
      </p>

      <h2 className="mt-10 text-lg font-semibold">Duplicate or incorrect charges</h2>
      <p className="mt-3 text-muted">
        If you see a duplicate or incorrect charge, contact us promptly with the details above. Verified
        duplicate or erroneous charges are eligible for correction or refund where appropriate.
      </p>

      <h2 className="mt-10 text-lg font-semibold">When refunds may not be available</h2>
      <p className="mt-3 text-muted">Refunds may be declined when, for example:</p>
      <ul className="mt-3 list-disc space-y-2 ps-5 text-muted">
        <li>Substantial paid features or usage limits were consumed in the billing period.</li>
        <li>The request is made long after the charge without a clear billing error.</li>
        <li>The charge is for a completed, correctly described subscription period you used.</li>
        <li>The request conflicts with payment-provider or card-network rules we must follow.</li>
        <li>The account violated our Terms of use.</li>
      </ul>

      <h2 className="mt-10 text-lg font-semibold">Payment provider processing</h2>
      <p className="mt-3 text-muted">
        NoteScript does not store full card details. Payments and refunds are processed by the configured
        payment provider (such as Paddle). After a refund is approved, the provider issues the credit. Timing
        to see funds on your statement depends on your bank or card issuer and is typically several business
        days.
      </p>

      <h2 className="mt-10 text-lg font-semibold">Contact</h2>
      <p className="mt-3 text-muted">
        For refund and billing questions, contact{" "}
        <span className="font-medium text-foreground">notescript10@gmail.com</span>. Include
        your NoteScript account email so we can locate your subscription. You can also manage or cancel a paid
        subscription from Billing in the app when a customer portal is available.
      </p>

      <p className="mt-10 text-xs text-muted">
        Last updated: {new Date().toISOString().slice(0, 10)}. This policy may be updated; the version on this
        page is the current one.
      </p>
    </div>
  );
}
