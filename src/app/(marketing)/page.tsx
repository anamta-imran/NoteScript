import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { PLANS } from "@/lib/plans";
import {
  SITE_ORIGIN,
  buildSoftwareApplicationJsonLd,
  buildWebSiteJsonLd,
} from "@/lib/seo/structured-data";
import { formatUsd } from "@/lib/utils";

const SITE_URL = `${SITE_ORIGIN}/`;

const HOME_DESCRIPTION =
  "Turn text, PDFs, images, and lecture material into structured handwritten-style study notes. Built for students — organized pages, diagrams, and clearer revision without generative AI.";

const SOFTWARE_DESCRIPTION =
  "NoteScript is a student-focused web application that turns study material — text, PDFs, images, and lectures — into structured handwritten-style study notes with rule-based formatting (not generative AI).";

const steps = [
  {
    number: "01",
    title: "Add your material",
    description:
      "Paste text, upload a PDF, add an image, or bring in lecture and YouTube material you already study from.",
  },
  {
    number: "02",
    title: "Let NoteScript organize it",
    description:
      "Your study material is turned into structured handwritten-style notes that are easier to scan and revise.",
  },
  {
    number: "03",
    title: "Study with less effort",
    description:
      "Review key points, diagrams, and summaries in one focused workspace built for handwritten study notes.",
  },
];

const features = [
  {
    title: "Handwritten feel",
    description:
      "Turn study material into notes with a natural handwritten aesthetic students actually want to revise from.",
  },
  {
    title: "Smart structure",
    description:
      "Keep headings, key points, sections, and important information visually organized — including PDF to notes workflows.",
  },
  {
    title: "Visual learning",
    description:
      "Make complicated topics and lecture notes easier to understand with clean layouts and diagrams.",
  },
  {
    title: "One focused workspace",
    description:
      "Keep your notes organized in one place instead of jumping between different study tools.",
  },
];

const faqs = [
  {
    question: "What can I use NoteScript for?",
    answer:
      "NoteScript is designed for turning study material into cleaner, more organized notes that are easier to review.",
  },
  {
    question: "Do I need to write everything manually?",
    answer:
      "No. NoteScript helps transform your existing material into a structured note format so you can spend more time actually learning.",
  },
  {
    question: "Can I use different handwriting styles?",
    answer:
      "Yes. NoteScript is designed around different visual note styles so your notes can feel more personal and natural.",
  },
  {
    question: "Is NoteScript only for students?",
    answer:
      "It is primarily designed for studying, but the same workflow can also be useful for research, revision, and organizing information.",
  },
];

export default function HomePage() {
  const webSiteLd = buildWebSiteJsonLd({
    name: "NoteScript",
    alternateName: "NoteScript",
    url: SITE_URL,
    description: HOME_DESCRIPTION,
  });

  const softwareLd = buildSoftwareApplicationJsonLd({
    name: "NoteScript",
    url: SITE_URL,
    description: SOFTWARE_DESCRIPTION,
    offers: [
      {
        name: PLANS.free.name,
        price: PLANS.free.monthlyPriceUsd,
      },
      {
        name: PLANS.student.name,
        price: PLANS.student.monthlyPriceUsd,
      },
      {
        name: PLANS.pro.name,
        price: PLANS.pro.monthlyPriceUsd,
      },
    ],
  });

  return (
    <>
      <JsonLd data={webSiteLd} />
      <JsonLd data={softwareLd} />
      <main className="overflow-hidden bg-[#fcfbfe] text-foreground">
      {/* HERO */}
      <section
        className="relative border-b border-line"
        style={{
          backgroundImage:
            "radial-gradient(circle at 78% 18%, rgba(198,181,255,0.18), transparent 28%), radial-gradient(circle at 18% 20%, rgba(239,221,255,0.22), transparent 24%)",
        }}
      >
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 pb-20 pt-12 sm:px-8 lg:grid-cols-[0.9fr_1fr] lg:gap-2 lg:px-10 lg:pb-24 lg:pt-20">
          {/* LEFT */}
          <div className="max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-white/80 px-3 py-1.5 text-xs font-medium text-muted shadow-sm backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-lavender-deep" />
              Built for students
            </div>

            <h1 className="max-w-xl text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl lg:text-[3.7rem] lg:leading-[1.04]">
              Handwritten-style study notes
              <span className="block font-hand-clean text-lavender-deep">
                from your material.
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-muted sm:text-lg">
              Turn text, PDFs, images, and lectures or YouTube material into
              structured handwritten-style study notes. Formatting is rule-based,
              not generative AI — so your pages stay clear and predictable.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup">
                <Button className="w-full sm:w-auto">
                  Start for free
                </Button>
              </Link>

              <Link href="/how-it-works">
                <Button
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  See how it works
                </Button>
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
              <span>✓ No complicated setup</span>
              <span>✓ Built for focused studying</span>
              <span>✓ Organized by design</span>
            </div>
          </div>

          {/* RIGHT — PRODUCT PREVIEW */}
          <div className="relative w-full max-w-[520px] lg:ml-[-8px]">
            <div className="absolute -inset-5 rounded-[2rem] bg-lavender-soft/30 blur-3xl" />

            <div className="relative rounded-[1.6rem] border border-line bg-white p-3 shadow-[0_24px_70px_rgba(79,57,112,0.14)]">
              {/* Browser header */}
              <div className="flex items-center justify-between rounded-xl bg-[#faf9fc] px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#e7dff2]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#e7dff2]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#e7dff2]" />
                </div>

                <span className="text-[11px] font-medium text-muted">
                  notescript.app
                </span>

                <div className="w-10" />
              </div>

              {/* Notebook */}
              <div className="mt-3 rounded-xl border border-[#ebe7f0] bg-[#fffdf9] p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-hand-clean text-3xl text-lavender-deep">
                      NoteScript
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      Your ideas, beautifully organized.
                    </p>
                  </div>

                  <span className="rounded-full bg-lavender-soft px-3 py-1 text-[10px] font-semibold text-lavender-deep">
                    STUDY NOTES
                  </span>
                </div>

                <div className="mt-7 border-t border-dashed border-[#ddd6e7] pt-6">
                  <p className="font-hand-class text-2xl text-[#40384b]">
                    Make learning feel lighter.
                  </p>

                  <p className="mt-3 text-sm leading-6 text-[#756d7d]">
                    Clear structure helps you find the important parts faster,
                    review with less friction, and keep your study material
                    beautifully organized.
                  </p>
                </div>

                <div className="mt-7 grid grid-cols-3 gap-3">
                  {[
                    ["01", "Capture"],
                    ["02", "Organize"],
                    ["03", "Remember"],
                  ].map(([number, label]) => (
                    <div
                      key={number}
                      className="rounded-xl border border-[#e8e1ed] bg-white p-3"
                    >
                      <span className="text-[10px] font-semibold text-lavender-deep">
                        {number}
                      </span>
                      <p className="mt-1 text-xs font-semibold text-[#4a4252]">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-xl bg-[#f7f3fb] px-4 py-3">
                  <p className="font-hand-clean text-lg text-lavender-deep">
                    Write less. Study better.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-line px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8 lg:px-10">
          <div className="px-4 py-6 text-center sm:text-left">
            <p className="text-sm font-semibold">Less formatting</p>
            <p className="mt-1 text-xs leading-5 text-muted">
              Spend less time making notes look good.
            </p>
          </div>

          <div className="px-4 py-6 text-center sm:text-left sm:pl-8">
            <p className="text-sm font-semibold">More structure</p>
            <p className="mt-1 text-xs leading-5 text-muted">
              Find important information faster.
            </p>
          </div>

          <div className="px-4 py-6 text-center sm:text-left sm:pl-8">
            <p className="text-sm font-semibold">Better focus</p>
            <p className="mt-1 text-xs leading-5 text-muted">
              Keep your study workflow in one place.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lavender-deep">
              How it works
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
              From study material to
              <span className="font-hand-clean text-lavender-deep">
                {" "}
                handwritten notes.
              </span>
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-6 text-muted sm:text-base">
              A simple workflow for turning the material you already have into
              notes you can actually study from — without rebuilding everything
              by hand.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-2xl border border-line bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <span className="text-xs font-semibold text-lavender-deep">
                  {step.number}
                </span>

                <h3 className="mt-5 text-lg font-semibold">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-muted">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="border-y border-line bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lavender-deep">
                Built around your study flow
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                Everything you need.
                <span className="block font-hand-clean text-lavender-deep">
                  Nothing distracting.
                </span>
              </h2>
            </div>

            <div className="max-w-sm">
              <p className="text-sm leading-6 text-muted">
                NoteScript keeps the interface calm and focused so your notes
                remain the main character.
              </p>
              <Link
                href="/features"
                className="mt-4 inline-flex text-sm font-semibold text-lavender-deep hover:underline"
              >
                Explore features
              </Link>
            </div>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white p-7 sm:p-8"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-lavender-soft text-sm font-semibold text-lavender-deep">
                  ✦
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

      {/* STYLES */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
          <div className="grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lavender-deep">
                Your notes, your style
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                Make your study space feel
                <span className="font-hand-clean text-lavender-deep">
                  {" "}
                  personal.
                </span>
              </h2>

              <p className="mt-4 text-sm leading-6 text-muted sm:text-base">
                Choose a visual direction that feels right for you while
                keeping your information clear and easy to review.
              </p>

              <Link href="/templates" className="mt-7 inline-block">
                <Button variant="secondary">
                  Explore templates
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-line bg-[#fffdf9] p-6 shadow-sm">
                <div className="h-28 rounded-xl border border-[#eee7dc] bg-[#fffaf0] p-4">
                  <p className="font-hand-class text-lg text-[#574d42]">
                    Class Notes
                  </p>
                  <div className="mt-3 h-1.5 w-3/4 rounded-full bg-[#ded6c8]" />
                  <div className="mt-2 h-1.5 w-1/2 rounded-full bg-[#ebe3d6]" />
                  <div className="mt-2 h-1.5 w-2/3 rounded-full bg-[#ebe3d6]" />
                </div>
                <p className="mt-4 text-sm font-semibold">
                  Class notes
                </p>
                <p className="mt-1 text-xs leading-5 text-muted">
                  Warm, natural, handwritten.
                </p>
              </div>

              <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
                <div className="h-28 rounded-xl border border-[#e7e0ee] bg-[#faf7ff] p-4">
                  <p className="font-hand-clean text-lg text-lavender-deep">
                    Clean Study
                  </p>
                  <div className="mt-3 h-1.5 w-3/4 rounded-full bg-[#ddd2eb]" />
                  <div className="mt-2 h-1.5 w-1/2 rounded-full bg-[#ebe5f0]" />
                  <div className="mt-2 h-1.5 w-2/3 rounded-full bg-[#ebe5f0]" />
                </div>
                <p className="mt-4 text-sm font-semibold">
                  Clean study
                </p>
                <p className="mt-1 text-xs leading-5 text-muted">
                  Minimal, soft, and focused.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="border-y border-line bg-white py-20 sm:py-24">
  <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lavender-deep">
        Simple pricing
      </p>

      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
        Start free.
        <span className="font-hand-clean text-lavender-deep">
          {" "}
          Upgrade when you need more.
        </span>
      </h2>

      <p className="mt-4 text-sm leading-6 text-muted">
        Choose the plan that fits your study workflow.{" "}
        <Link
          href="/pricing"
          className="font-semibold text-lavender-deep hover:underline"
        >
          Compare plans
        </Link>
      </p>
    </div>

    <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
      {/* FREE */}
      <div className="rounded-2xl border border-line bg-[#fcfbfe] p-7">
        <p className="text-sm font-semibold">Free</p>

        <div className="mt-5 flex items-end gap-2">
          <span className="text-4xl font-semibold">{formatUsd(PLANS.free.monthlyPriceUsd)}</span>
          <span className="pb-1 text-sm text-muted">forever</span>
        </div>

        <p className="mt-3 text-sm leading-6 text-muted">
          A simple way to start organizing your notes.
        </p>

        <Link href="/signup" className="mt-7 block">
          <Button variant="secondary" className="w-full">
            Start free
          </Button>
        </Link>
      </div>

      {/* STUDENT */}
      <div className="rounded-2xl border border-line bg-white p-7 shadow-[0_12px_40px_rgba(62,39,82,0.07)]">
        <p className="text-sm font-semibold">Student</p>

        <div className="mt-5 flex items-end gap-2">
          <span className="text-4xl font-semibold">{formatUsd(PLANS.student.monthlyPriceUsd)}</span>
          <span className="pb-1 text-sm text-muted">/ month</span>
        </div>

        <p className="mt-3 text-sm leading-6 text-muted">
          More room for your study workflow and growing note library.
        </p>

        <Link
          href="/signup?plan=student&cycle=monthly"
          className="mt-7 block"
        >
          <Button variant="secondary" className="w-full">
            Choose Student
          </Button>
        </Link>

        <p className="mt-3 text-center text-xs text-muted">
          Or {formatUsd(PLANS.student.annualPriceUsd)}/year
        </p>
      </div>

      {/* PRO */}
      <div className="relative rounded-2xl border-2 border-lavender-deep/20 bg-[#faf7ff] p-7">
        <div className="absolute right-5 top-5 rounded-full bg-lavender-soft px-3 py-1 text-[10px] font-semibold text-lavender-deep">
          PRO
        </div>

        <p className="text-sm font-semibold">Pro</p>

        <div className="mt-5 flex items-end gap-2">
          <span className="text-4xl font-semibold">{formatUsd(PLANS.pro.monthlyPriceUsd)}</span>
          <span className="pb-1 text-sm text-muted">/ month</span>
        </div>

        <p className="mt-3 text-sm leading-6 text-muted">
          More flexibility for advanced note-taking and productivity.
        </p>

        <Link
          href="/signup?plan=pro&cycle=monthly"
          className="mt-7 block"
        >
          <Button className="w-full">
            Choose Pro
          </Button>
        </Link>

        <p className="mt-3 text-center text-xs text-muted">
          Or {formatUsd(PLANS.pro.annualPriceUsd)}/year
        </p>
      </div>
    </div>
  </div>
</section>

      {/* FAQ */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-5 sm:px-8 lg:px-10">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lavender-deep">
              FAQ
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
              Questions, answered.
            </h2>
          </div>

          <div className="mt-10 divide-y divide-line rounded-2xl border border-line bg-white">
            {faqs.map((faq) => (
              <details key={faq.question} className="group p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-sm font-semibold">
                  {faq.question}

                  <span className="text-lg text-muted transition group-open:rotate-45">
                    +
                  </span>
                </summary>

                <p className="mt-4 max-w-3xl text-sm leading-6 text-muted">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>

          <p className="mt-6 text-center text-sm text-muted">
            Looking for more detail?{" "}
            <Link
              href="/faq"
              className="font-semibold text-lavender-deep hover:underline"
            >
              Read the full FAQ
            </Link>
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-5 pb-20 sm:px-8 sm:pb-24 lg:px-10">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-[#292230] px-6 py-14 text-center text-white sm:px-10 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d9c9ec]">
            Ready when you are
          </p>

          <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
            Your next study session deserves better notes.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/65 sm:text-base">
            Create your first set of beautifully organized notes and see how
            much easier studying can feel.
          </p>

          <div className="mt-8">
            <Link href="/signup">
              <Button className="bg-white text-[#292230] hover:bg-white/90">
                Start for free
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
    </>
  );
}