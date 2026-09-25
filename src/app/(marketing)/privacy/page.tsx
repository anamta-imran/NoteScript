import type { Metadata } from "next";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata: Metadata = buildMarketingMetadata({
  title: "Privacy Policy — NoteScript",
  description:
    "Read the NoteScript Privacy Policy to understand how account information, uploaded material, and website data are handled.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-sm leading-relaxed">
      <h1 className="text-3xl font-semibold">Privacy</h1>
      <p className="mt-4 text-muted">
        We store your account, notes, uploads, and usage in your configured MongoDB database. Passwords are
        hashed. Session cookies are httpOnly. Payment details are handled by Paddle when configured. Email is
        sent only for verification and password reset. Dashboard routes are not intended for search engines.
      </p>
    </div>
  );
}
