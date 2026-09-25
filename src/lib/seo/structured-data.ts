/**
 * Canonical public site origin for SEO structured data.
 * Keep in sync with production marketing URLs used in metadata canonicals.
 */
export const SITE_ORIGIN = "https://notescript-xi.vercel.app";

export type FaqItem = {
  question: string;
  answer: string;
};

export type BreadcrumbItem = {
  name: string;
  path: string;
};

/** Absolute public URL for a site path (`/` → trailing slash). */
export function absoluteUrl(path: string): string {
  if (path === "/" || path === "") return `${SITE_ORIGIN}/`;
  return `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

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

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/**
 * Serialize schema objects for `<script type="application/ld+json">`.
 * Escapes `<` so the payload cannot break out of the script element.
 * Pages render the script tag themselves — there is no separate JsonLd component.
 */
export function serializeJsonLd(
  data: Record<string, unknown> | Record<string, unknown>[],
): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
