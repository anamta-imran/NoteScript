import { Button } from "@/components/ui/Button";
import type { Metadata } from "next";

import { HANDWRITING_THEMES } from "@/lib/engine/handwritingThemes";

export const metadata: Metadata = {
  title: "Templates",
  description:
    "Handwriting styles and diagram templates used by NoteScript.",
};

const diagramTemplates = [
  {
    title: "Flowchart",
    description: "Organize ideas and decisions into a clear visual flow.",
    icon: "↳",
  },
  {
    title: "Process",
    description: "Break a topic into simple step-by-step stages.",
    icon: "→",
  },
  {
    title: "Cell",
    description: "Structure biology concepts with labeled visual sections.",
    icon: "◉",
  },
  {
    title: "Atom",
    description: "Present atomic structure in a clean study-note layout.",
    icon: "✦",
  },
  {
    title: "Circuit",
    description: "Visualize basic circuit concepts and connections.",
    icon: "⌁",
  },
  {
    title: "Force Diagram",
    description: "Represent forces and directions for physics problems.",
    icon: "↑",
  },
  {
    title: "Timeline",
    description: "Arrange events and concepts in chronological order.",
    icon: "—",
  },
  {
    title: "Algorithm Box",
    description: "Present algorithms and logic in an easy-to-follow format.",
    icon: "{}",
  },
];

export default function TemplatesPage() {
  return (
    <main className="bg-[#fcfbfe]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute left-1/2 top-[-170px] h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-[#eee7f8] opacity-70 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-20 text-center sm:px-6 lg:px-8">
          <span className="inline-flex rounded-full border border-[#e5dced] bg-white px-4 py-1.5 text-xs font-semibold tracking-wide text-[#72558f] shadow-sm">
            NOTE TEMPLATES
          </span>

          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-[#292230] sm:text-5xl lg:text-6xl">
            Make every note feel
            <span className="block text-[#80639d]">beautifully yours.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#756d7d] sm:text-lg">
            Choose from real handwriting styles and built-in diagram layouts
            used by the NoteScript renderer. These are structured templates,
            not generated images.
          </p>
        </div>
      </section>

      {/* Handwriting styles */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-sm font-semibold text-[#80639d]">
            HANDWRITING
          </p>

          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#292230]">
            Pick your writing style
          </h2>

          <p className="mt-3 max-w-2xl text-[#756d7d]">
            Each style is part of the actual renderer, so your notes keep a
            consistent look from page to page.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Object.values(HANDWRITING_THEMES).map((theme) => (
            <article
              key={theme.id}
              className="group overflow-hidden rounded-[24px] border border-[#e9e3ef] bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(62,39,82,0.09)]"
            >
              <div className="relative min-h-[190px] overflow-hidden bg-[#faf8fc] p-6">
                <div className="absolute right-5 top-5 h-20 w-20 rounded-full bg-[#eee6f7] blur-2xl" />

                <div className="relative rounded-2xl border border-[#ebe4f0] bg-white p-5 shadow-sm">
                  <p className={`${theme.fontClass} text-3xl text-[#302838]`}>
                    {theme.label}
                  </p>

                  <div className="mt-5 space-y-2">
                    <div className="h-2 w-4/5 rounded-full bg-[#eeeaf1]" />
                    <div className="h-2 w-3/5 rounded-full bg-[#f1edf4]" />
                    <div className="h-2 w-2/5 rounded-full bg-[#f1edf4]" />
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-semibold text-[#292230]">
                  {theme.label}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#756d7d]">
                  Decoration: {theme.decoration}
                </p>

                <div className="mt-4 inline-flex rounded-full bg-[#f2ecf8] px-3 py-1 text-xs font-medium text-[#72558f]">
                  Built-in style
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Diagram templates */}
      <section className="border-y border-[#eee8f2] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-sm font-semibold text-[#80639d]">
              DIAGRAMS
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#292230]">
              Visual templates for complex topics
            </h2>

            <p className="mt-3 max-w-2xl text-[#756d7d]">
              Built-in SVG diagram templates help turn technical or visual
              concepts into clean study material.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {diagramTemplates.map((diagram) => (
              <article
                key={diagram.title}
                className="rounded-[22px] border border-[#e9e3ef] bg-[#fcfbfe] p-6 transition duration-200 hover:-translate-y-0.5 hover:border-[#d9cbe5] hover:shadow-[0_14px_35px_rgba(62,39,82,0.07)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0e9f8] text-lg font-semibold text-[#72558f]">
                  {diagram.icon}
                </div>

                <h3 className="mt-5 font-semibold text-[#292230]">
                  {diagram.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#756d7d]">
                  {diagram.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Renderer note */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[28px] bg-[#302838] p-8 text-white sm:p-10 lg:p-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold text-[#d8c8e8]">
                REAL TEMPLATES
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Designed into the renderer.
              </h2>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-[#d8d1df] sm:text-base">
                NoteScript uses structured layout and diagram templates
                instead of generated images. That keeps the visual system
                consistent, editable, and predictable across your notes.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="space-y-4">
                {[
                  "Handwriting styles",
                  "Ruled note pages",
                  "SVG diagrams",
                  "Subject layouts",
                  "Consistent rendering",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm text-[#eee9f2]"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs">
                      ✓
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[#eee8f2] bg-white">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
          <h2 className="text-3xl font-semibold tracking-tight text-[#292230] sm:text-4xl">
            Ready to create your notes?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-[#756d7d]">
            Choose your source, pick a style, and let NoteScript turn it into
            a clean study page.
          </p>

          <div className="mt-7 flex justify-center gap-3">
            <Button href="/create">Create a note</Button>

            <Button href="/pricing" variant="secondary">
              View pricing
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}