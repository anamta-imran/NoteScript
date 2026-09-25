import type { Metadata } from "next";
import Link from "next/link";
import { SeoLandingPage } from "@/components/marketing/SeoLandingPage";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata: Metadata = buildMarketingMetadata({
  title: "Text to Handwritten Notes — NoteScript Study Notes Maker",
  description:
    "Turn typed text into structured handwritten-style study notes. Paste lecture notes, readings, or drafts and let NoteScript organize them for clearer revision.",
  path: "/text-to-handwritten-notes",
});

export default function TextToHandwrittenNotesPage() {
  return (
    <SeoLandingPage
      eyebrow="TEXT → NOTES"
      h1={
        <>
          Text to handwritten notes
          <span className="mt-2 block text-[#80639d]">
            for clearer studying
          </span>
        </>
      }
      intro={
        <p>
          Paste the text you already have — lecture notes, textbook excerpts, or
          study drafts — and turn it into structured handwritten-style study
          notes. NoteScript uses rule-based formatting so headings, lists, and
          key points stay organized without rewriting everything by hand.
        </p>
      }
      breadcrumbs={[
        { name: "Home", path: "/" },
        { name: "Text to handwritten notes", path: "/text-to-handwritten-notes" },
      ]}
      howItWorks={[
        {
          title: "Paste your text",
          description:
            "Add typed study material into NoteScript. Free includes text-to-notes so you can try the workflow right away.",
        },
        {
          title: "Structure the content",
          description:
            "Rules detect headings, lists, definitions, formulas, and examples so your page layout stays consistent.",
        },
        {
          title: "Study from handwritten-style pages",
          description:
            "Review notes with a natural handwritten look, then save them in your library for later revision.",
        },
      ]}
      inputLabel="What you can turn into notes"
      inputs={[
        "Typed lecture notes and class summaries",
        "Copied passages from readings or slides",
        "Draft study material you want cleaned up",
        "Short or longer text within your plan limits",
      ]}
      outputLabel="What NoteScript produces"
      outputs={[
        "Structured handwritten-style study notes",
        "Clear sections with headings and key points",
        "Pages that are easier to scan during revision",
        "Notes you can keep in your NoteScript workspace",
      ]}
      useCasesTitle="When text-to-notes helps most"
      useCases={[
        {
          title: "After class cleanup",
          description:
            "Paste messy typed notes from class and turn them into pages you can actually revise from.",
        },
        {
          title: "Reading summaries",
          description:
            "Convert drafted summaries into handwritten-style study notes without spending hours on formatting.",
        },
        {
          title: "Exam revision packs",
          description:
            "Organize topic lists and definitions into consistent note pages before a test week.",
        },
      ]}
      benefitsTitle="Why students use text to handwritten notes"
      benefits={[
        "Spend less time formatting and more time understanding the material.",
        "Keep a consistent handwritten study look across subjects.",
        "Start on Free with text-to-notes before upgrading for PDFs, images, or YouTube.",
        "Rule-based formatting keeps results predictable — not generative AI inventing content.",
      ]}
      faqs={[
        {
          question: "Is text to handwritten notes available on Free?",
          answer:
            "Yes. Free includes a text-to-notes allowance with basic handwriting styles so you can try NoteScript before upgrading.",
        },
        {
          question: "Does NoteScript rewrite my text with generative AI?",
          answer:
            "No. NoteScript extracts and organizes the text you provide with rule-based formatting. It does not invent new study content.",
        },
        {
          question: "Can I choose a handwriting style?",
          answer:
            "Yes. Free includes starter styles; Student and Pro unlock more handwritten note styles used by the renderer.",
        },
      ]}
      relatedLinks={[
        {
          href: "/pdf-to-handwritten-notes",
          label: "PDF to handwritten notes",
          description: "Turn selectable PDF text into structured study pages.",
        },
        {
          href: "/image-to-handwritten-notes",
          label: "Image to handwritten notes",
          description: "Use OCR to convert photographed study material into notes.",
        },
        {
          href: "/handwritten-notes-maker",
          label: "Handwritten notes maker",
          description: "See the full NoteScript maker workflow for students.",
        },
        {
          href: "/features",
          label: "Features",
          description: "Explore every input source and study workflow tool.",
        },
        {
          href: "/templates",
          label: "Templates",
          description: "Browse handwriting styles and diagram layouts.",
        },
        {
          href: "/faq",
          label: "FAQ",
          description: "Answers about plans, sources, and how notes are made.",
        },
      ]}
      planNote={
        <>
          Text to notes is available on Free. Need PDFs, images, or YouTube?{" "}
          <Link href="/pricing" className="font-semibold text-[#72558f] hover:underline">
            Compare plans
          </Link>
          .
        </>
      }
    />
  );
}
