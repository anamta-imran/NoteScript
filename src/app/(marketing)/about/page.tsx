import type { Metadata } from "next";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata: Metadata = buildMarketingMetadata({
  title: "About NoteScript — Study Notes for Students",
  description:
    "Learn about NoteScript, a student-focused platform for turning study material into structured handwritten-style notes.",
  path: "/about",
});

const values = [
  {
    number: "01",
    title: "Simple by design",
    description:
      "NoteScript focuses on turning existing study material into clean, structured pages without adding unnecessary complexity.",
  },
  {
    number: "02",
    title: "Built for studying",
    description:
      "The experience is designed around students who want organized notes that are easier to review, revisit, and print.",
  },
  {
    number: "03",
    title: "Predictable formatting",
    description:
      "NoteScript uses structured rules and templates rather than generative AI to organize and render your notes.",
  },
];

export default function AboutPage() {
  return (
    <main className="bg-[#fcfbfe]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute left-1/2 top-[-180px] h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-[#eee7f8] opacity-70 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex rounded-full border border-[#e5dced] bg-white px-4 py-1.5 text-xs font-semibold tracking-wide text-[#72558f] shadow-sm">
              ABOUT NOTESCRIPT
            </span>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-[#292230] sm:text-5xl lg:text-6xl">
              Your study material,
              <span className="block text-[#80639d]">
                beautifully organized.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#756d7d] sm:text-lg">
              NoteScript is a student notebook product that turns your study
              material into structured, handwritten-style pages.
            </p>
          </div>
        </div>
      </section>

      {/* Main story */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[28px] border border-[#e9e3ef] bg-white p-8 shadow-sm sm:p-10">
            <p className="text-sm font-semibold text-[#80639d]">
              THE IDEA
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#292230]">
              Built around the way students already study.
            </h2>

            <div className="mt-6 space-y-4 text-sm leading-7 text-[#756d7d] sm:text-base">
              <p>
                Students already have plenty of study material — typed notes,
                videos, PDFs, screenshots, and photographed pages. The hard
                part is turning all of that material into something organized
                and easy to review.
              </p>

              <p>
                NoteScript gives that material a consistent notebook format:
                structured content, page layouts, handwriting styles, and
                visual templates.
              </p>

              <p>
                It is designed for high school, college, university, and
                self-study workflows.
              </p>
            </div>
          </article>

          {/* Product card */}
          <div className="relative overflow-hidden rounded-[28px] bg-[#302838] p-8 text-white sm:p-10">
            <div className="absolute right-[-60px] top-[-60px] h-40 w-40 rounded-full bg-[#8c6ba8] opacity-30 blur-3xl" />

            <div className="relative">
              <p className="text-sm font-semibold text-[#d8c8e8]">
                NOTESCRIPT
              </p>

              <h2 className="mt-3 text-3xl font-semibold">
                One place for your study notes.
              </h2>

              <div className="mt-8 space-y-4">
                {[
                  "Add your study material",
                  "Extract useful content",
                  "Structure the information",
                  "Render handwritten-style pages",
                  "Save, export, or share",
                ].map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm text-[#eee9f2]"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold">
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

      {/* Values */}
      <section className="border-y border-[#eee8f2] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-semibold text-[#80639d]">
              WHAT MATTERS
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#292230] sm:text-4xl">
              A focused approach to note-making.
            </h2>

            <p className="mt-4 text-[#756d7d]">
              The product is built around a few simple principles that keep
              the experience clear and predictable.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {values.map((value) => (
              <article
                key={value.number}
                className="rounded-[24px] border border-[#e9e3ef] bg-[#fcfbfe] p-7 transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(62,39,82,0.07)]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f0e9f8] text-xs font-bold text-[#72558f]">
                  {value.number}
                </span>

                <h3 className="mt-6 text-lg font-semibold text-[#292230]">
                  {value.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-[#756d7d]">
                  {value.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Transparency */}
      <section className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6">
        <span className="inline-flex rounded-full bg-[#f0e9f8] px-4 py-1.5 text-xs font-semibold text-[#72558f]">
          TRANSPARENT BY DESIGN
        </span>

        <h2 className="mt-5 text-3xl font-semibold tracking-tight text-[#292230] sm:text-4xl">
          No pretending your notes understand more than they do.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#756d7d] sm:text-base">
          NoteScript does not claim AI comprehension. Its note formatting is
          based on extraction, rules, templates, and structured layouts so the
          process stays clear and predictable.
        </p>
      </section>
    </main>
  );
}