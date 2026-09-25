import type { Metadata } from "next";
import Link from "next/link";
import { SeoLandingPage } from "@/components/marketing/SeoLandingPage";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata: Metadata = buildMarketingMetadata({
  title: "PDF to Handwritten Notes — Study Notes from PDFs | NoteScript",
  description:
    "Turn selectable PDF text into handwritten-style study notes. Extract course packs and readings, then organize them into structured pages for revision.",
  path: "/pdf-to-handwritten-notes",
});

export default function PdfToHandwrittenNotesPage() {
  return (
    <SeoLandingPage
      eyebrow="PDF → NOTES"
      h1={
        <>
          PDF to handwritten notes
          <span className="mt-2 block text-[#80639d]">
            for course packs and readings
          </span>
        </>
      }
      intro={
        <p>
          Upload a PDF with selectable text and convert it into structured
          handwritten-style study notes. NoteScript extracts the text, organizes
          it with rule-based formatting, and lays out pages that are easier to
          revise than a long scrolling document.
        </p>
      }
      breadcrumbs={[
        { name: "Home", path: "/" },
        { name: "PDF to handwritten notes", path: "/pdf-to-handwritten-notes" },
      ]}
      howItWorks={[
        {
          title: "Upload your PDF",
          description:
            "Add a digital reading, chapter export, or course pack that contains selectable text.",
        },
        {
          title: "Extract the text",
          description:
            "NoteScript pulls readable text from the PDF so it can move through the same note-formatting workflow.",
        },
        {
          title: "Organize into study pages",
          description:
            "Headings, lists, and key structures are arranged into handwritten-style notes ready for revision.",
        },
      ]}
      inputLabel="PDF material that works well"
      inputs={[
        "Digital textbooks or chapter PDFs with selectable text",
        "Course packs and reading lists exported as PDF",
        "Lecture handouts shared as text-based PDFs",
        "Study guides you want in a notebook-style layout",
      ]}
      outputLabel="What NoteScript produces"
      outputs={[
        "PDF to notes conversion into structured study pages",
        "Handwritten-style formatting for clearer revision",
        "Organized sections instead of one long PDF scroll",
        "Notes you can keep, export, or print depending on your plan",
      ]}
      useCasesTitle="When PDF to study notes helps"
      useCases={[
        {
          title: "Weekly reading loads",
          description:
            "Turn dense PDF chapters into note pages you can skim before seminars or tutorials.",
        },
        {
          title: "Shared course packs",
          description:
            "Convert instructor PDFs into a personal handwritten-style notebook without rewriting every section.",
        },
        {
          title: "Printable revision sheets",
          description:
            "Create structured notes you can print or export when exam season starts.",
        },
      ]}
      benefitsTitle="Benefits of notes from PDF"
      benefits={[
        "Move from document overload to study pages with clearer hierarchy.",
        "Keep the same handwritten aesthetic as text and image notes.",
        "Student and Pro unlock PDF sources with export options on paid plans.",
        "Scanned PDFs without selectable text may not extract well — digital text PDFs work best.",
      ]}
      faqs={[
        {
          question: "Which plans include PDF to handwritten notes?",
          answer:
            "Student and Pro. Free is limited to text sources; upgrade when you need PDF to notes.",
        },
        {
          question: "Do scanned PDFs work?",
          answer:
            "NoteScript extracts selectable text. Scanned image-only PDFs may not extract well. For photos of pages, use image to handwritten notes with OCR instead.",
        },
        {
          question: "Will NoteScript invent content missing from my PDF?",
          answer:
            "No. Formatting is rule-based. The notes reflect the extracted source text rather than generative AI summaries.",
        },
      ]}
      relatedLinks={[
        {
          href: "/text-to-handwritten-notes",
          label: "Text to handwritten notes",
          description: "Paste typed material when you do not have a PDF.",
        },
        {
          href: "/image-to-handwritten-notes",
          label: "Image to handwritten notes",
          description: "Use OCR for photographed or scanned pages.",
        },
        {
          href: "/youtube-to-handwritten-notes",
          label: "YouTube lecture notes",
          description: "Create notes from public lecture captions on Pro.",
        },
        {
          href: "/features",
          label: "Features",
          description: "See PDF extraction and the full NoteScript toolkit.",
        },
        {
          href: "/templates",
          label: "Templates",
          description: "Choose handwriting styles for your PDF-based notes.",
        },
        {
          href: "/pricing",
          label: "Pricing",
          description: "Compare Student and Pro for PDF workflows.",
        },
      ]}
      planNote={
        <>
          PDF to notes is available on Student and Pro.{" "}
          <Link href="/pricing" className="font-semibold text-[#72558f] hover:underline">
            Compare plans
          </Link>
          .
        </>
      }
    />
  );
}
