import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
  robots: { index: true },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-sm leading-relaxed">
      <h1 className="text-3xl font-semibold">Terms of use</h1>
      <p className="mt-4 text-muted">
        NoteScript provides software that extracts and formats text you provide. You are responsible for having
        the right to use source material (including lecture videos and documents). Paid plans are billed by the
        configured payment provider. Usage limits are enforced on the server. These terms are a starting point
        for a real deployment and should be reviewed by counsel before production use.
      </p>
    </div>
  );
}
