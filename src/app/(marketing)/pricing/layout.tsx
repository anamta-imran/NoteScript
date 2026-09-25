import type { Metadata } from "next";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata: Metadata = buildMarketingMetadata({
  title: "Pricing — Student Note-Taking Plans | NoteScript",
  description:
    "Explore NoteScript pricing for handwritten-style study notes from text, PDFs, images, and lectures. Choose the plan that fits your study needs.",
  path: "/pricing",
});

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
