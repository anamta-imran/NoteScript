import type { Metadata } from "next";
import Link from "next/link";
import { SeoLandingPage } from "@/components/marketing/SeoLandingPage";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata: Metadata = buildMarketingMetadata({
  title: "Image to Handwritten Notes — OCR Study Notes | NoteScript",
  description:
    "Convert images into handwritten-style study notes with OCR. Photograph textbook pages or slides, edit extracted text, and create structured notes for revision.",
  path: "/image-to-handwritten-notes",
});

export default function ImageToHandwrittenNotesPage() {
  return (
    <SeoLandingPage
      eyebrow="IMAGE → NOTES"
      h1={
        <>
          Image to handwritten notes
          <span className="mt-2 block text-[#80639d]">
            from photographed study material
          </span>
        </>
      }
      intro={
        <p>
          Capture notes from images when your material lives on paper, a
          whiteboard, or a slide photo. NoteScript uses OCR to extract text,
          lets you edit what was captured, then formats it into structured
          handwritten-style study notes.
        </p>
      }
      breadcrumbs={[
        { name: "Home", path: "/" },
        {
          name: "Image to handwritten notes",
          path: "/image-to-handwritten-notes",
        },
      ]}
      howItWorks={[
        {
          title: "Upload an image",
          description:
            "Add a photo of textbook pages, handwritten class notes, or lecture slides you want to study from.",
        },
        {
          title: "Extract and edit text",
          description:
            "OCR pulls the readable text into an editable field so you can fix mistakes before notes are formatted.",
        },
        {
          title: "Render study pages",
          description:
            "The same rule-based note engine turns the cleaned text into handwritten-style pages for revision.",
        },
      ]}
      inputLabel="Useful image sources"
      inputs={[
        "Photos of textbook or workbook pages",
        "Whiteboard or chalkboard summaries",
        "Slide or handout screenshots",
        "Printed sheets you want in digital study form",
      ]}
      outputLabel="What you get"
      outputs={[
        "Editable OCR text before note generation",
        "Structured handwritten-style study notes",
        "Organized headings and key points from the extracted content",
        "Notes saved in your NoteScript library on supported plans",
      ]}
      useCasesTitle="Student situations that fit image to notes"
      useCases={[
        {
          title: "No digital copy available",
          description:
            "When a chapter only exists on paper, photograph the pages and turn them into notes you can search and revise later.",
        },
        {
          title: "Board notes after class",
          description:
            "Snap the board before you leave and convert the photo into cleaner handwritten-style study pages.",
        },
        {
          title: "Mixed media revision",
          description:
            "Combine image-based extracts with text or PDF notes in one focused study workspace.",
        },
      ]}
      benefitsTitle="Why image to study notes matters"
      benefits={[
        "Rescue useful material that would otherwise stay trapped in photos.",
        "Edit OCR output before formatting so notes stay accurate.",
        "Keep the same handwritten study aesthetic as your other NoteScript pages.",
        "Image to notes is available on Student and Pro with plan-based allowances.",
      ]}
      faqs={[
        {
          question: "Which plans support image to handwritten notes?",
          answer:
            "Student and Pro. Student includes a monthly image/OCR allowance; Pro offers higher capacity.",
        },
        {
          question: "Does OCR work on every photo?",
          answer:
            "OCR works best on clear, well-lit images with readable text. Blurry or heavily stylized handwriting may need manual edits in the extracted text field.",
        },
        {
          question: "Is this the same as generating notes with AI?",
          answer:
            "No. NoteScript extracts text with OCR and formats it with rules. It does not invent lecture content.",
        },
      ]}
      relatedLinks={[
        {
          href: "/text-to-handwritten-notes",
          label: "Text to handwritten notes",
          description: "Paste typed material for the same structured workflow.",
        },
        {
          href: "/pdf-to-handwritten-notes",
          label: "PDF to handwritten notes",
          description: "Extract selectable PDF text into study pages.",
        },
        {
          href: "/youtube-to-handwritten-notes",
          label: "YouTube to handwritten notes",
          description: "Turn lecture captions into structured notes on Pro.",
        },
        {
          href: "/features",
          label: "Features",
          description: "See OCR and every other NoteScript input source.",
        },
        {
          href: "/how-it-works",
          label: "How it works",
          description: "Follow the full extraction and formatting process.",
        },
        {
          href: "/pricing",
          label: "Pricing",
          description: "Compare Student and Pro image allowances.",
        },
      ]}
      planNote={
        <>
          Image to notes requires Student or Pro.{" "}
          <Link href="/pricing" className="font-semibold text-[#72558f] hover:underline">
            View pricing
          </Link>{" "}
          or start with{" "}
          <Link
            href="/text-to-handwritten-notes"
            className="font-semibold text-[#72558f] hover:underline"
          >
            text to handwritten notes
          </Link>{" "}
          on Free.
        </>
      }
    />
  );
}
