import type { Metadata } from "next";
import Link from "next/link";
import { SeoLandingPage } from "@/components/marketing/SeoLandingPage";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata: Metadata = buildMarketingMetadata({
  title: "YouTube to Handwritten Notes — Lecture Notes Maker | NoteScript",
  description:
    "Turn YouTube lectures into handwritten-style study notes. Use public captions on Pro to create structured lecture notes you can revise later.",
  path: "/youtube-to-handwritten-notes",
});

export default function YoutubeToHandwrittenNotesPage() {
  return (
    <SeoLandingPage
      eyebrow="YOUTUBE → NOTES"
      h1={
        <>
          YouTube lectures to notes
          <span className="mt-2 block text-[#80639d]">
            structured for revision
          </span>
        </>
      }
      intro={
        <p>
          Turn public YouTube lecture material into handwritten-style study
          notes. On Pro, NoteScript retrieves public captions (with a manual
          transcript fallback), organizes the content, and can include
          timestamps so lecture notes stay easier to revisit.
        </p>
      }
      breadcrumbs={[
        { name: "Home", path: "/" },
        {
          name: "YouTube to handwritten notes",
          path: "/youtube-to-handwritten-notes",
        },
      ]}
      howItWorks={[
        {
          title: "Add a YouTube lecture URL",
          description:
            "Start with a public lecture or educational video you already study from.",
        },
        {
          title: "Bring in captions or a transcript",
          description:
            "NoteScript uses public captions when available, or you can paste a transcript manually as a fallback.",
        },
        {
          title: "Format lecture notes",
          description:
            "Rule-based formatting turns the transcript into structured handwritten-style pages, with timestamps on Pro.",
        },
      ]}
      inputLabel="What you can convert"
      inputs={[
        "Public YouTube lecture URLs",
        "Educational videos with captions",
        "Manual transcripts when captions are missing",
        "Longer lectures within Pro duration limits",
      ]}
      outputLabel="What NoteScript produces"
      outputs={[
        "YouTube lecture notes in a handwritten-style layout",
        "Structured sections for clearer revision",
        "Timestamps on lecture notes (Pro)",
        "Saved notes in your library for later study sessions",
      ]}
      useCasesTitle="When lecture-to-notes helps"
      useCases={[
        {
          title: "Missed or long lectures",
          description:
            "Convert a recorded lecture into notes you can skim instead of scrubbing through the whole video again.",
        },
        {
          title: "Online course revision",
          description:
            "Turn playlist lectures into consistent handwritten-style pages before exams.",
        },
        {
          title: "Timestamped review",
          description:
            "Use Pro timestamps to jump back to the moment in the lecture that matches a note section.",
        },
      ]}
      benefitsTitle="Why students want YouTube to study notes"
      benefits={[
        "Capture lecture content without pausing every few seconds to type.",
        "Keep notes from video in the same handwritten aesthetic as text and PDF notes.",
        "Pro unlocks YouTube sources, timestamps, and higher processing priority.",
        "Formatting stays rule-based — NoteScript does not invent lecture explanations.",
      ]}
      faqs={[
        {
          question: "Is YouTube to handwritten notes on every plan?",
          answer:
            "No. YouTube lecture notes are a Pro feature. Free and Student do not include YouTube sources.",
        },
        {
          question: "What if a video has no captions?",
          answer:
            "You can paste a transcript manually as a fallback, then run the same note-formatting workflow.",
        },
        {
          question: "Does this summarize lectures with generative AI?",
          answer:
            "No. NoteScript organizes caption or transcript text with rules. It does not claim AI comprehension of the lecture.",
        },
      ]}
      relatedLinks={[
        {
          href: "/text-to-handwritten-notes",
          label: "Text to handwritten notes",
          description: "Paste typed notes when you already have a transcript.",
        },
        {
          href: "/pdf-to-handwritten-notes",
          label: "PDF to handwritten notes",
          description: "Convert course PDFs into structured study pages.",
        },
        {
          href: "/handwritten-notes-maker",
          label: "Handwritten notes maker",
          description: "Overview of NoteScript as a student notes maker.",
        },
        {
          href: "/features",
          label: "Features",
          description: "See YouTube → Notes and the rest of the toolkit.",
        },
        {
          href: "/how-it-works",
          label: "How it works",
          description: "Understand extraction, jobs, and formatting.",
        },
        {
          href: "/pricing",
          label: "Pricing",
          description: "Upgrade to Pro for YouTube lecture notes.",
        },
      ]}
      planNote={
        <>
          YouTube → Notes is included on Pro.{" "}
          <Link
            href="/pricing?highlight=pro"
            className="font-semibold text-[#72558f] hover:underline"
          >
            See Pro pricing
          </Link>
          .
        </>
      }
      ctaHref="/signup?plan=pro&cycle=monthly"
      ctaLabel="Choose Pro"
      secondaryCtaHref="/pricing?highlight=pro"
      secondaryCtaLabel="Compare plans"
    />
  );
}
