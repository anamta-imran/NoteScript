/**
 * Canonical public site origin for SEO structured data.
 * Keep in sync with production marketing URLs used in metadata canonicals.
 */
export const SITE_ORIGIN = "https://notescript-xi.vercel.app";

export type FaqItem = {
  question: string;
  answer: string;
};

export function buildWebSiteJsonLd(input: {
  name: string;
  url: string;
  description: string;
  alternateName?: string;
}) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: input.name,
    url: input.url,
    description: input.description,
  };

  if (input.alternateName) {
    data.alternateName = input.alternateName;
  }

  return data;
}

export function buildSoftwareApplicationJsonLd(input: {
  name: string;
  url: string;
  description: string;
  offers?: Array<{
    name: string;
    price: number;
    priceCurrency?: string;
  }>;
}) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: input.name,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    url: input.url,
    description: input.description,
  };

  if (input.offers && input.offers.length > 0) {
    data.offers = input.offers.map((offer) => ({
      "@type": "Offer",
      name: offer.name,
      price: String(offer.price),
      priceCurrency: offer.priceCurrency || "USD",
    }));
  }

  return data;
}

export function buildFaqPageJsonLd(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
