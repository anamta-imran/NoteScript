import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata: Metadata = buildMarketingMetadata({
  title: "Features — Handwritten Study Notes Tools | NoteScript",
  description:
    "Create handwritten-style study notes from text, PDFs, images, and lectures with structured formatting, diagrams, highlights, and student-focused tools.",
  path: "/features",
});

const features = [
  {
    number: "01",
    title: "Text → Notes",
    href: "/text-to-handwritten-notes",
    linkLabel: "Text to handwritten notes",
    description:
      "Turn raw study material into structured notes with clear sections and useful formatting.",
    points: [
      "Heading detection",
      "Lists and key points",
      "Definitions",
      "Formulas",
      "Examples",
    ],
    visual: (
      <div className="rounded-2xl border border-[#e8e0ef] bg-[#fffdf9] p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-lavender-deep" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
            Structured notes
          </span>
        </div>

        <div className="mt-6">
          <div className="h-2.5 w-2/3 rounded-full bg-[#dcd3e7]" />
          <div className="mt-3 h-2 w-full rounded-full bg-[#eee9f2]" />
          <div className="mt-2 h-2 w-5/6 rounded-full bg-[#eee9f2]" />

          <div className="mt-6 rounded-xl bg-[#f8f4fb] p-4">
            <div className="h-2 w-1/3 rounded-full bg-[#c9b8dc]" />
            <div className="mt-3 space-y-2">
              <div className="h-2 w-full rounded-full bg-[#e7deed]" />
              <div className="h-2 w-4/5 rounded-full bg-[#e7deed]" />
              <div className="h-2 w-3/5 rounded-full bg-[#e7deed]" />
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    number: "02",
    title: "YouTube → Notes",
    href: "/youtube-to-handwritten-notes",
    linkLabel: "YouTube to handwritten notes",
    description:
      "Use public YouTube captions as a source and turn them into notes through the same formatting workflow.",
    points: [
      "Public caption retrieval",
      "Caption-based note generation",
      "Manual transcript fallback",
      "Structured output",
    ],
    visual: (
      <div className="rounded-2xl border border-[#e8e0ef] bg-white p-5 shadow-sm">
        <div className="rounded-xl bg-[#f7f4f9] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#292230] text-xs text-white">
              ▶
            </div>

            <div className="flex-1">
              <div className="h-2 w-3/4 rounded-full bg-[#dcd5e3]" />
              <div className="mt-2 h-1.5 w-1/2 rounded-full bg-[#ebe7ef]" />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center">
            <div className="h-px flex-1 bg-[#e5dfea]" />
            <span className="mx-3 rounded-full bg-lavender-soft px-3 py-1 text-[9px] font-semibold text-lavender-deep">
              TRANSCRIPT
            </span>
            <div className="h-px flex-1 bg-[#e5dfea]" />
          </div>

          <div className="mt-5 space-y-2">
            <div className="h-2 w-full rounded-full bg-[#e9e4ed]" />
            <div className="h-2 w-5/6 rounded-full bg-[#e9e4ed]" />
            <div className="h-2 w-2/3 rounded-full bg-[#e9e4ed]" />
          </div>
        </div>
      </div>
    ),
  },
  {
    number: "03",
    title: "PDF → Notes",
    href: "/pdf-to-handwritten-notes",
    linkLabel: "PDF to handwritten notes",
    description:
      "Extract selectable text from PDFs and move it into the same organized note workflow.",
    points: [
      "Selectable-text extraction",
      "Clean text processing",
      "Structured note formatting",
      "Clear scanned-PDF messaging",
    ],
    visual: (
      <div className="rounded-2xl border border-[#e8e0ef] bg-white p-5 shadow-sm">
        <div className="mx-auto max-w-[220px] rounded-lg border border-[#e5dfe9] bg-[#fffdfb] p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f3edf8] text-[10px] font-bold text-lavender-deep">
              PDF
            </div>
            <div>
              <div className="h-2 w-20 rounded-full bg-[#dcd5e3]" />
              <div className="mt-2 h-1.5 w-12 rounded-full bg-[#eee9f1]" />
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <div className="h-1.5 w-full rounded-full bg-[#e9e4ed]" />
            <div className="h-1.5 w-full rounded-full bg-[#e9e4ed]" />
            <div className="h-1.5 w-4/5 rounded-full bg-[#e9e4ed]" />
            <div className="h-1.5 w-3/5 rounded-full bg-[#e9e4ed]" />
          </div>

          <div className="mt-5 rounded-lg bg-[#f7f2fb] px-3 py-2">
            <div className="h-1.5 w-2/3 rounded-full bg-[#cdbddc]" />
          </div>
        </div>
      </div>
    ),
  },
  {
    number: "04",
    title: "Images → Notes",
    href: "/image-to-handwritten-notes",
    linkLabel: "Image to handwritten notes",
    description:
      "Extract text from images with OCR, edit the extracted content, and send it through the same note engine.",
    points: [
      "Tesseract OCR",
      "Editable extracted text",
      "Same formatting engine",
      "Useful for photographed material",
    ],
    visual: (
      <div className="rounded-2xl border border-[#e8e0ef] bg-[#fffdf9] p-5 shadow-sm">
        <div className="relative overflow-hidden rounded-xl border border-[#e5dfe8] bg-white p-4">
          <div className="absolute right-3 top-3 rounded-full bg-lavender-soft px-2.5 py-1 text-[9px] font-semibold text-lavender-deep">
            OCR
          </div>

          <div className="h-3 w-2/5 rounded-full bg-[#d8cfdf]" />
          <div className="mt-5 space-y-2">
            <div className="h-2 w-full rounded-full bg-[#ece7ef]" />
            <div className="h-2 w-5/6 rounded-full bg-[#ece7ef]" />
            <div className="h-2 w-3/4 rounded-full bg-[#ece7ef]" />
          </div>

          <div className="mt-6 rounded-xl border border-dashed border-[#d8cce2] bg-[#faf7fd] p-3">
            <p className="text-[9px] font-medium text-lavender-deep">
              Extracted text
            </p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-[#e1d7e8]" />
            <div className="mt-2 h-1.5 w-4/5 rounded-full bg-[#e1d7e8]" />
          </div>
        </div>
      </div>
    ),
  },
];

const workflowFeatures = [
  {
    icon: "✦",
    title: "Handwriting styles",
    description:
      "Create notes with different visual handwriting styles, ruled pages, highlights, and a more personal note-taking feel.",
  },
  {
    icon: "◇",
    title: "SVG diagrams",
    description:
      "Use clean SVG diagram templates to make visual information easier to scan and understand.",
  },
  {
    icon: "⌁",
    title: "Library & folders",
    description:
      "Keep your notes organized with a searchable library and folders instead of letting everything become one long list.",
  },
  {
    icon: "↗",
    title: "Export & sharing",
    description:
      "Export notes as PDF or PNG, print directly from the browser, and use shareable links when your plan supports them.",
  },
];

export default function FeaturesPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fcfbfe]">
      {/* HERO */}
      <section className="relative border-b border-line">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 0%, rgba(198,181,255,0.22), transparent 38%), radial-gradient(circle at 90% 40%, rgba(239,221,255,0.18), transparent 28%)",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-14 sm:px-8 sm:pb-24 sm:pt-20 lg:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e7dff0] bg-white px-3.5 py-1.5 text-xs font-medium text-lavender-deep shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-lavender-deep" />
              Everything your notes need
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl lg:text-6xl lg:leading-[1.02]">
              Turn your material into
              <span className="block font-hand-clean text-lavender-deep">
                notes worth revisiting.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-muted sm:text-base">
              Bring your text, YouTube captions, PDFs, or images into
              NoteScript and turn them into clean, structured notes with a
              beautiful handwritten feel.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button href="/signup">Start for free</Button>

              <Button href="/how-it-works" variant="secondary">
                See how it works
              </Button>
            </div>
          </div>

          {/* MINI PRODUCT PREVIEW */}
          <div className="mx-auto mt-14 max-w-4xl">
            <div className="rounded-[1.5rem] border border-[#e5deeb] bg-white p-3 shadow-[0_25px_80px_rgba(75,55,95,0.12)]">
              <div className="rounded-[1.15rem] bg-[#faf8fc] p-5 sm:p-7">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#e4dbea]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#e4dbea]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#e4dbea]" />
                  </div>

                  <span className="text-[10px] font-medium text-muted">
                    NoteScript workspace
                  </span>

                  <div className="w-10" />
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-[0.3fr_0.7fr]">
                  <div className="rounded-xl border border-[#e7e0ec] bg-white p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                      Library
                    </p>

                    <div className="mt-4 space-y-2">
                      <div className="rounded-lg bg-lavender-soft px-3 py-2">
                        <div className="h-1.5 w-16 rounded-full bg-[#bca7d0]" />
                      </div>

                      <div className="rounded-lg px-3 py-2">
                        <div className="h-1.5 w-20 rounded-full bg-[#e5dfe9]" />
                      </div>

                      <div className="rounded-lg px-3 py-2">
                        <div className="h-1.5 w-14 rounded-full bg-[#e5dfe9]" />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#e7e0ec] bg-[#fffdf9] p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-hand-clean text-2xl text-lavender-deep">
                          Study Notes
                        </p>
                        <div className="mt-2 h-1.5 w-32 rounded-full bg-[#e5dce9]" />
                      </div>

                      <span className="rounded-full bg-[#f3edf8] px-2.5 py-1 text-[9px] font-semibold text-lavender-deep">
                        ORGANIZED
                      </span>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-lg bg-[#faf6fc] p-3">
                        <div className="h-1.5 w-10 rounded-full bg-[#cdbbda]" />
                        <div className="mt-3 h-1.5 w-full rounded-full bg-[#e8e1eb]" />
                        <div className="mt-2 h-1.5 w-4/5 rounded-full bg-[#e8e1eb]" />
                      </div>

                      <div className="rounded-lg bg-[#faf6fc] p-3">
                        <div className="h-1.5 w-12 rounded-full bg-[#cdbbda]" />
                        <div className="mt-3 h-1.5 w-full rounded-full bg-[#e8e1eb]" />
                        <div className="mt-2 h-1.5 w-3/5 rounded-full bg-[#e8e1eb]" />
                      </div>

                      <div className="rounded-lg bg-[#faf6fc] p-3">
                        <div className="h-1.5 w-9 rounded-full bg-[#cdbbda]" />
                        <div className="mt-3 h-1.5 w-full rounded-full bg-[#e8e1eb]" />
                        <div className="mt-2 h-1.5 w-4/5 rounded-full bg-[#e8e1eb]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE INTRO */}
      <section className="px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lavender-deep">
              Core features
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              Start with what you already have.
              <span className="block font-hand-clean text-lavender-deep">
                NoteScript does the organizing.
              </span>
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-6 text-muted sm:text-base">
              Different sources, one consistent workflow. Bring your material
              in and turn it into notes without manually rebuilding everything
              from scratch.
            </p>
          </div>

          {/* FEATURE SHOWCASE */}
          <div className="mt-14 space-y-8">
            {features.map((feature, index) => (
              <article
                key={feature.number}
                className={`grid overflow-hidden rounded-[1.5rem] border border-line bg-white shadow-sm lg:grid-cols-2 ${
                  index % 2 === 1 ? "lg:[&>div:first-child]:order-2" : ""
                }`}
              >
                <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
                  <span className="text-xs font-semibold tracking-[0.14em] text-lavender-deep">
                    {feature.number}
                  </span>

                  <h3 className="mt-4 text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">
                    {feature.title}
                  </h3>

                  <p className="mt-4 max-w-lg text-sm leading-6 text-muted sm:text-base">
                    {feature.description}
                  </p>

                  <Link
                    href={feature.href}
                    className="mt-4 inline-flex text-sm font-semibold text-lavender-deep hover:underline"
                  >
                    {feature.linkLabel}
                  </Link>

                  <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                    {feature.points.map((point) => (
                      <li
                        key={point}
                        className="flex items-center gap-2 text-xs font-medium text-foreground"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lavender-soft text-[10px] font-bold text-lavender-deep">
                          ✓
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex min-h-[300px] items-center justify-center bg-[#faf8fc] p-6 sm:p-10">
                  <div className="w-full max-w-md">{feature.visual}</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* WORKFLOW FEATURES */}
      <section className="border-y border-line bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lavender-deep">
              More than generation
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              Keep everything
              <span className="font-hand-clean text-lavender-deep">
                {" "}
                organized.
              </span>
            </h2>

            <p className="mt-4 text-sm leading-6 text-muted sm:text-base">
              NoteScript is designed around the full note-taking workflow, not
              just the moment your notes are created.
            </p>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden rounded-[1.5rem] border border-line bg-line sm:grid-cols-2">
            {workflowFeatures.map((feature) => (
              <div
                key={feature.title}
                className="bg-white p-7 sm:p-9"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lavender-soft text-lavender-deep">
                  {feature.icon}
                </div>

                <h3 className="mt-5 text-lg font-semibold">
                  {feature.title}
                </h3>

                <p className="mt-3 max-w-md text-sm leading-6 text-muted">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLAN NOTE */}
      <section className="px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[1.75rem] bg-[#292230] px-7 py-12 text-white sm:px-12 sm:py-14">
          <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d8c8e8]">
                Built around your plan
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">
                More features when your workflow grows.
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/65">
                Available sources, generations, folders, exports, and sharing
                depend on the plan you choose.
              </p>
            </div>

            <Link href="/pricing">
            <Button className="bg-lavender-deep text-white shadow-[0_8px_25px_rgba(126,95,160,0.35)] hover:opacity-90">
  View pricing
</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-5 pb-20 sm:px-8 sm:pb-24 lg:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <p className="font-hand-clean text-2xl text-lavender-deep">
            Your notes, just better.
          </p>

          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
            Ready to make studying feel simpler?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted">
            Start with your existing study material and create your first
            beautifully organized note.
          </p>

          <div className="mt-7">
            <Button href="/signup">Start for free</Button>
          </div>
        </div>
      </section>
    </main>
  );
}