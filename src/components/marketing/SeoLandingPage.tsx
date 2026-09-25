import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import {
  buildBreadcrumbJsonLd,
  buildFaqPageJsonLd,
  serializeJsonLd,
  type BreadcrumbItem,
  type FaqItem,
} from "@/lib/seo/structured-data";

export type SeoLandingSection = {
  title: string;
  body: ReactNode;
};

export type SeoLandingProps = {
  eyebrow: string;
  h1: ReactNode;
  intro: ReactNode;
  breadcrumbs: BreadcrumbItem[];
  howItWorks: { title: string; description: string }[];
  inputLabel: string;
  inputs: string[];
  outputLabel: string;
  outputs: string[];
  useCasesTitle: string;
  useCases: { title: string; description: string }[];
  benefitsTitle: string;
  benefits: string[];
  faqs?: FaqItem[];
  relatedLinks: { href: string; label: string; description: string }[];
  ctaHref?: string;
  ctaLabel?: string;
  secondaryCtaHref?: string;
  secondaryCtaLabel?: string;
  planNote?: ReactNode;
};

export function SeoLandingPage({
  eyebrow,
  h1,
  intro,
  breadcrumbs,
  howItWorks,
  inputLabel,
  inputs,
  outputLabel,
  outputs,
  useCasesTitle,
  useCases,
  benefitsTitle,
  benefits,
  faqs,
  relatedLinks,
  ctaHref = "/signup",
  ctaLabel = "Start for free",
  secondaryCtaHref = "/how-it-works",
  secondaryCtaLabel = "See how it works",
  planNote,
}: SeoLandingProps) {
  const breadcrumbLd = buildBreadcrumbJsonLd(breadcrumbs);
  const faqLd = faqs && faqs.length > 0 ? buildFaqPageJsonLd(faqs) : null;

  return (
    <div className="bg-[#fcfbfe]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbLd) }}
      />
      {faqLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqLd) }}
        />
      ) : null}

      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8"
      >
        <ol className="flex flex-wrap items-center gap-2 text-xs text-[#756d7d]">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <li key={crumb.path} className="inline-flex items-center gap-2">
                {index > 0 ? <span aria-hidden="true">/</span> : null}
                {isLast ? (
                  <span className="font-medium text-[#292230]">{crumb.name}</span>
                ) : (
                  <Link
                    href={crumb.path}
                    className="hover:text-[#72558f] hover:underline"
                  >
                    {crumb.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute left-1/2 top-[-170px] h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-[#eee7f8] opacity-70 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex rounded-full border border-[#e5dced] bg-white px-4 py-1.5 text-xs font-semibold tracking-wide text-[#72558f] shadow-sm">
              {eyebrow}
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-[#292230] sm:text-5xl">
              {h1}
            </h1>
            <div className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#756d7d] sm:text-lg">
              {intro}
            </div>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button href={ctaHref}>{ctaLabel}</Button>
              <Button href={secondaryCtaHref} variant="secondary">
                {secondaryCtaLabel}
              </Button>
            </div>
            {planNote ? (
              <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-[#756d7d]">
                {planNote}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold text-[#80639d]">HOW IT WORKS</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#292230]">
            A clear path from material to notes
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {howItWorks.map((step, index) => (
            <article
              key={step.title}
              className="rounded-[24px] border border-[#e9e3ef] bg-white p-6 shadow-sm"
            >
              <span className="text-xs font-bold text-[#9a7bb5]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-[#292230]">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#756d7d]">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Input / output */}
      <section className="border-y border-[#eee8f2] bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[#292230]">
              {inputLabel}
            </h2>
            <ul className="mt-5 space-y-3">
              {inputs.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm leading-6 text-[#756d7d]"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f0e9f8] text-[10px] font-bold text-[#72558f]">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[#292230]">
              {outputLabel}
            </h2>
            <ul className="mt-5 space-y-3">
              {outputs.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm leading-6 text-[#756d7d]"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f0e9f8] text-[10px] font-bold text-[#72558f]">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold text-[#80639d]">FOR STUDENTS</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#292230]">
            {useCasesTitle}
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {useCases.map((item) => (
            <article
              key={item.title}
              className="rounded-[22px] border border-[#e9e3ef] bg-white p-6"
            >
              <h3 className="font-semibold text-[#292230]">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#756d7d]">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="border-y border-[#eee8f2] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-[#292230]">
            {benefitsTitle}
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <li
                key={benefit}
                className="rounded-2xl border border-[#e9e3ef] bg-[#fcfbfe] p-5 text-sm leading-6 text-[#756d7d]"
              >
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      {faqs && faqs.length > 0 ? (
        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-[#292230]">
            Common questions
          </h2>
          <div className="mt-10 space-y-4">
            {faqs.map((faq) => (
              <article
                key={faq.question}
                className="rounded-[22px] border border-[#e9e3ef] bg-white p-6"
              >
                <h3 className="text-lg font-semibold text-[#292230]">
                  {faq.question}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#756d7d]">
                  {faq.answer}
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {/* Related */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold tracking-tight text-[#292230]">
          Related NoteScript pages
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {relatedLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-[22px] border border-[#e9e3ef] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#d9cbe5] hover:shadow-sm"
            >
              <p className="font-semibold text-[#72558f]">{link.label}</p>
              <p className="mt-2 text-sm leading-6 text-[#756d7d]">
                {link.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[#eee8f2] bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
          <h2 className="text-3xl font-semibold tracking-tight text-[#292230]">
            Ready to create handwritten-style study notes?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[#756d7d]">
            Start with the material you already have and turn it into notes that
            are easier to revise.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href={ctaHref}>{ctaLabel}</Button>
            <Button href="/pricing" variant="secondary">
              View pricing
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
