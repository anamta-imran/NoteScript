import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  buildFaqPageJsonLd,
  serializeJsonLd,
  type FaqItem,
} from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  title: {
    absolute: "FAQ — NoteScript Study Notes",
  },
  description:
    "Answers about handwritten study notes, PDF to notes, lecture and YouTube notes, image OCR, templates, plans, and how NoteScript works.",
  alternates: {
    canonical: "https://notescript-xi.vercel.app/faq",
  },
};

type FaqEntry = FaqItem & {
  /** Optional richer answer UI; must match the plain-text `answer` used for JSON-LD. */
  body?: ReactNode;
};

const faqs: FaqEntry[] = [
  {
    question: "Is this ChatGPT with a notebook skin?",
    answer:
      "No. There is no generative model. Formatting is rule-based.",
  },
  {
    question: "Does NoteScript use generative AI?",
    answer:
      "No. NoteScript does not use a generative model to invent your study notes. It extracts content from your sources and applies rule-based formatting to organize headings, lists, definitions, and page layouts.",
    body: (
      <>
        <p>
          No. NoteScript does not use a generative model to invent your study
          notes. It extracts content from your sources and applies rule-based
          formatting to organize headings, lists, definitions, and page layouts.
        </p>
        <p className="mt-3">
          See{" "}
          <Link
            href="/how-it-works"
            className="font-semibold text-[#72558f] hover:underline"
          >
            how it works
          </Link>{" "}
          for the full flow.
        </p>
      </>
    ),
  },
  {
    question: "What can I turn into handwritten study notes?",
    answer:
      "Depending on your plan, you can turn text, PDFs, images, and YouTube lecture material into handwritten-style study notes. Free starts with text; Student adds PDF and image to notes; Pro also includes YouTube lecture notes.",
    body: (
      <>
        <p>
          Depending on your plan, you can turn text, PDFs, images, and YouTube
          lecture material into handwritten-style study notes. Free starts with
          text; Student adds PDF and image to notes; Pro also includes YouTube
          lecture notes.
        </p>
        <p className="mt-3">
          Browse supported inputs on the{" "}
          <Link
            href="/features"
            className="font-semibold text-[#72558f] hover:underline"
          >
            features
          </Link>{" "}
          page.
        </p>
      </>
    ),
  },
  {
    question: "Can NoteScript turn PDFs into handwritten notes?",
    answer:
      "Yes on Student and Pro. NoteScript supports PDF to notes by extracting selectable text from PDFs and running it through the same note-formatting workflow. Scanned PDFs without selectable text may not extract well.",
    body: (
      <p>
        Yes on Student and Pro. NoteScript supports PDF to notes by extracting
        selectable text from PDFs and running it through the same
        note-formatting workflow. Scanned PDFs without selectable text may not
        extract well. Details are on{" "}
        <Link
          href="/features"
          className="font-semibold text-[#72558f] hover:underline"
        >
          features
        </Link>
        .
      </p>
    ),
  },
  {
    question: "Can I use lecture or YouTube material?",
    answer:
      "Yes on Pro. You can create YouTube lecture notes from public captions, with a manual transcript fallback when captions are unavailable. Timestamps on lecture notes are included on Pro.",
    body: (
      <p>
        Yes on Pro. You can create YouTube lecture notes from public captions,
        with a manual transcript fallback when captions are unavailable.
        Timestamps on lecture notes are included on Pro. Compare plans on{" "}
        <Link
          href="/pricing"
          className="font-semibold text-[#72558f] hover:underline"
        >
          pricing
        </Link>
        .
      </p>
    ),
  },
  {
    question: "Can images be converted into study notes?",
    answer:
      "Yes on Student and Pro. NoteScript supports image to notes with OCR: it extracts text from images, lets you edit the extracted text, then formats it into study notes. Student includes a monthly image allowance; Pro offers higher capacity.",
    body: (
      <p>
        Yes on Student and Pro. NoteScript supports image to notes with OCR: it
        extracts text from images, lets you edit the extracted text, then
        formats it into study notes. Student includes a monthly image
        allowance; Pro offers higher capacity.
      </p>
    ),
  },
  {
    question: "How are the notes structured?",
    answer:
      "NoteScript organizes extracted content into consistent blocks such as headings, lists, definitions, formulas, and examples, then lays them out as study pages. The goal is clearer revision without changing what your source material says.",
    body: (
      <p>
        NoteScript organizes extracted content into consistent blocks such as
        headings, lists, definitions, formulas, and examples, then lays them
        out as study pages. The goal is clearer revision without changing what
        your source material says.{" "}
        <Link
          href="/how-it-works"
          className="font-semibold text-[#72558f] hover:underline"
        >
          How it works
        </Link>{" "}
        walks through each step.
      </p>
    ),
  },
  {
    question: "Can I choose different handwriting styles?",
    answer:
      "Yes. NoteScript includes built-in handwritten note styles used by the renderer, so pages stay consistent. Free includes two styles; Student and Pro unlock more.",
    body: (
      <p>
        Yes. NoteScript includes built-in handwritten note styles used by the
        renderer, so pages stay consistent. Free includes two styles; Student
        and Pro unlock more. Explore them on{" "}
        <Link
          href="/templates"
          className="font-semibold text-[#72558f] hover:underline"
        >
          templates
        </Link>
        .
      </p>
    ),
  },
  {
    question: "Can NoteScript create diagrams?",
    answer:
      "Yes on Student and Pro. NoteScript uses built-in SVG diagram templates — such as flowcharts, process layouts, and subject diagrams — rather than generating images. Student includes a monthly diagram allowance; Pro offers higher capacity.",
    body: (
      <p>
        Yes on Student and Pro. NoteScript uses built-in SVG diagram templates —
        such as flowcharts, process layouts, and subject diagrams — rather than
        generating images. Student includes a monthly diagram allowance; Pro
        offers higher capacity. See examples on{" "}
        <Link
          href="/templates"
          className="font-semibold text-[#72558f] hover:underline"
        >
          templates
        </Link>
        .
      </p>
    ),
  },
  {
    question: "Who is NoteScript designed for?",
    answer:
      "NoteScript is built for student note-taking — high school, college, university, and self-study. It helps turn existing study material into handwritten-style pages that are easier to review and revise.",
  },
  {
    question: "Is there a free plan?",
    answer:
      "Yes. Free lets you try text-to-notes with a small generation allowance, basic handwriting styles, and a simple workspace. No credit card is required to start.",
    body: (
      <p>
        Yes. Free lets you try text-to-notes with a small generation allowance,
        basic handwriting styles, and a simple workspace. No credit card is
        required to start. See{" "}
        <Link
          href="/pricing"
          className="font-semibold text-[#72558f] hover:underline"
        >
          pricing
        </Link>{" "}
        for the full comparison.
      </p>
    ),
  },
  {
    question: "Do I need a card for Free?",
    answer:
      "No. Checkout only starts when you choose Student or Pro.",
  },
  {
    question: "How do the paid plans work?",
    answer:
      "Student unlocks PDF and image sources, diagrams, more handwriting styles, folders, and export options, with monthly allowances for images and diagrams. Pro adds YouTube lecture notes, higher capacity, timestamps, priority processing, and all styles. Both offer monthly and annual billing.",
    body: (
      <p>
        Student unlocks PDF and image sources, diagrams, more handwriting
        styles, folders, and export options, with monthly allowances for images
        and diagrams. Pro adds YouTube lecture notes, higher capacity,
        timestamps, priority processing, and all styles. Both offer monthly and
        annual billing.{" "}
        <Link
          href="/pricing"
          className="font-semibold text-[#72558f] hover:underline"
        >
          Compare plans
        </Link>
        .
      </p>
    ),
  },
  {
    question: "What happens at the free limit?",
    answer:
      "Free includes a small lifetime allowance of text note generations. When you reach that limit, new generations are blocked until you upgrade. Existing notes stay available.",
  },
  {
    question: "What happens to my study material?",
    answer:
      "Material you submit is used to create your notes and is stored with your account so you can reopen, organize, and export what you have already made. NoteScript does not claim AI comprehension of your content.",
  },
];

export default function FaqPage() {
  const faqLd = buildFaqPageJsonLd(
    faqs.map(({ question, answer }) => ({ question, answer })),
  );

  return (
    <main className="bg-[#fcfbfe]">
      <script
        type="application/ld+json"
        // Static FAQ schema only — answers are developer-authored, not user input.
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqLd) }}
      />
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute left-1/2 top-[-170px] h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-[#eee7f8] opacity-70 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-20 text-center sm:px-6 lg:px-8">
          <span className="inline-flex rounded-full border border-[#e5dced] bg-white px-4 py-1.5 text-xs font-semibold tracking-wide text-[#72558f] shadow-sm">
            FAQ
          </span>

          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-[#292230] sm:text-5xl">
            Questions?
            <span className="block text-[#80639d]">
              We have answers.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#756d7d] sm:text-lg">
            Clear answers about handwritten study notes, supported sources,
            plans, and how NoteScript turns study material into notes.
          </p>
        </div>
      </section>

      {/* FAQ cards */}
      <section className="mx-auto max-w-4xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <article
              key={faq.question}
              className="group rounded-[24px] border border-[#e9e3ef] bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(62,39,82,0.08)] sm:p-8"
            >
              <div className="flex gap-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f0e9f8] text-sm font-bold text-[#72558f]">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-[#292230] sm:text-xl">
                    {faq.question}
                  </h2>

                  <div className="mt-3 text-sm leading-7 text-[#756d7d] sm:text-base">
                    {faq.body ?? <p>{faq.answer}</p>}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* More help */}
      <section className="border-t border-[#eee8f2] bg-white">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f0e9f8] text-xl text-[#72558f]">
            ?
          </div>

          <h2 className="mt-6 text-3xl font-semibold tracking-tight text-[#292230]">
            Still curious?
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-[#756d7d]">
            Explore how NoteScript works, what it can do, and which plan fits
            your workflow.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center rounded-xl bg-[#80639d] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_25px_rgba(126,95,160,0.25)] transition hover:opacity-90"
            >
              How it works
            </Link>

            <Link
              href="/features"
              className="inline-flex items-center justify-center rounded-xl border border-[#ddd4e5] bg-white px-5 py-2.5 text-sm font-semibold text-[#4b4052] transition hover:bg-[#faf8fc]"
            >
              View features
            </Link>

            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-xl border border-[#ddd4e5] bg-white px-5 py-2.5 text-sm font-semibold text-[#4b4052] transition hover:bg-[#faf8fc]"
            >
              View pricing
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
