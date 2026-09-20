import type { Metadata } from "next";

import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "Extract, structure, paginate, and render handwritten-style study notes without generative AI.",
};

const steps = [
  {
    number: "01",
    title: "Add your source",
    description:
      "Start with the material you already have. Paste typed text, add a YouTube URL, upload a PDF, or upload an image.",
    tags: ["Text", "YouTube", "PDF", "Image"],
  },
  {
    number: "02",
    title: "Your content is extracted",
    description:
      "NoteScript extracts the useful content using the appropriate source-specific tools, including PDF text extraction, Tesseract OCR, or YouTube captions.",
    tags: ["PDF text", "OCR", "Captions"],
  },
  {
    number: "03",
    title: "A job processes your notes",
    description:
      "Your note is processed as a background job, keeping the browser responsive while the server tracks its current status.",
    tags: ["Queued", "Processing", "Ready"],
  },
  {
    number: "04",
    title: "Rules turn content into notes",
    description:
      "The extracted text is organized into headings, lists, definitions, formulas, examples, and subject-specific structures before the pages are laid out.",
    tags: ["Structure", "Formatting", "Pages"],
  },
  {
    number: "05",
    title: "Preview and use your notes",
    description:
      "Review the finished notes, then save them to your library, export them, print them, or share them depending on your plan.",
    tags: ["Preview", "Save", "Export", "Share"],
  },
];

export default function HowPage() {
  return (
    <main className="bg-[#fcfbfe]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute left-1/2 top-[-180px] h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-[#eee7f8] opacity-70 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-20 sm:px-6 lg:px-8 lg:pb-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex rounded-full border border-[#e5dced] bg-white px-4 py-1.5 text-xs font-semibold tracking-wide text-[#72558f] shadow-sm">
              HOW IT WORKS
            </span>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-[#292230] sm:text-5xl lg:text-6xl">
              From source material
              <span className="block text-[#80639d]">to beautiful notes.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#756d7d] sm:text-lg">
              NoteScript takes your existing study material, extracts the
              useful content, organizes it, and turns it into structured
              handwritten-style notes.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button href="/create">Create your first note</Button>
              <Button href="/features" variant="secondary">
                Explore features
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Process preview */}
      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-[#e9e3ef] bg-white p-5 shadow-[0_20px_70px_rgba(62,39,82,0.08)] sm:p-8">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              ["01", "Input", "Your source material"],
              ["02", "Extract", "Useful content"],
              ["03", "Structure", "Organized blocks"],
              ["04", "Render", "Ready-to-study pages"],
            ].map(([number, title, text]) => (
              <div
                key={number}
                className="rounded-2xl bg-[#faf8fc] p-5"
              >
                <span className="text-xs font-bold text-[#9a7bb5]">
                  {number}
                </span>
                <h2 className="mt-3 font-semibold text-[#292230]">
                  {title}
                </h2>
                <p className="mt-1 text-sm text-[#7c7483]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold text-[#80639d]">
            THE PROCESS
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#292230] sm:text-4xl">
            Five simple steps
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[#756d7d]">
            Everything happens in a clear flow, from the material you provide
            to the notes you can actually study from.
          </p>
        </div>

        <div className="space-y-5">
          {steps.map((step) => (
            <article
              key={step.number}
              className="group grid gap-6 rounded-[24px] border border-[#e9e3ef] bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_45px_rgba(62,39,82,0.08)] sm:grid-cols-[90px_1fr] sm:p-8"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f0e9f8] text-sm font-bold text-[#72558f]">
                {step.number}
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#292230]">
                  {step.title}
                </h3>

                <p className="mt-2 max-w-3xl text-sm leading-7 text-[#756d7d] sm:text-base">
                  {step.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {step.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[#e9e3ef] bg-[#faf8fc] px-3 py-1 text-xs font-medium text-[#756d7d]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* No generative AI section */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[28px] bg-[#302838] p-8 text-white sm:p-10 lg:p-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold text-[#d8c8e8]">
                BUILT AROUND RULES
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Structured, predictable, and easy to understand.
              </h2>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-[#d8d1df] sm:text-base">
                NoteScript uses extraction and formatting rules to organize
                your material into consistent note blocks and page layouts.
                The goal is to make your source material easier to review
                without changing what the source says.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="space-y-4">
                {[
                  "Extract source content",
                  "Detect useful structures",
                  "Create organized blocks",
                  "Lay out note pages",
                  "Preview and export",
                ].map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm text-[#eee9f2]"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold">
                      {index + 1}
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-[#eee8f2] bg-white">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
          <h2 className="text-3xl font-semibold tracking-tight text-[#292230] sm:text-4xl">
            Ready to turn your material into notes?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-[#756d7d]">
            Start with your first source and see how NoteScript turns it into
            a clean, structured study page.
          </p>

          <div className="mt-7">
            <Button href="/create">Create a note</Button>
          </div>
        </div>
      </section>
    </main>
  );
}