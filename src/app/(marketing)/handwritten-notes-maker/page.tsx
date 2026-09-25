import type { Metadata } from "next";
import Link from "next/link";
import { SeoLandingPage } from "@/components/marketing/SeoLandingPage";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata: Metadata = buildMarketingMetadata({
  title: "Handwritten Notes Maker — Study Notes Generator | NoteScript",
  description:
    "Use NoteScript as a handwritten notes maker for students. Create structured handwritten-style study notes from text, PDFs, images, and YouTube lectures.",
  path: "/handwritten-notes-maker",
});

export default function HandwrittenNotesMakerPage() {
  return (
    <SeoLandingPage
      eyebrow="STUDY NOTES MAKER"
      h1={
        <>
          Handwritten notes maker
          <span className="mt-2 block text-[#80639d]">
            built for student revision
          </span>
        </>
      }
      intro={
        <p>
          NoteScript is a student-focused handwritten notes maker and study
          notes generator. Bring in text, PDFs, images, or YouTube lecture
          material and create structured handwritten-style pages that are easier
          to revise — with rule-based formatting, not generative AI.
        </p>
      }
      breadcrumbs={[
        { name: "Home", path: "/" },
        { name: "Handwritten notes maker", path: "/handwritten-notes-maker" },
      ]}
      howItWorks={[
        {
          title: "Choose your source",
          description:
            "Start with typed text on Free, or use PDF and image sources on Student, and YouTube lectures on Pro.",
        },
        {
          title: "Extract and organize",
          description:
            "NoteScript pulls useful content and applies consistent structure — headings, lists, definitions, and page layouts.",
        },
        {
          title: "Study from digital handwritten notes",
          description:
            "Pick a handwriting style, keep notes in your library, and export or print depending on your plan.",
        },
      ]}
      inputLabel="Sources the maker supports"
      inputs={[
        "Text to handwritten notes (available on Free)",
        "PDF to handwritten notes (Student and Pro)",
        "Image to handwritten notes with OCR (Student and Pro)",
        "YouTube lectures to notes (Pro)",
      ]}
      outputLabel="What this study notes maker creates"
      outputs={[
        "Digital handwritten-style study notes",
        "Structured pages for clearer revision",
        "Optional diagrams and styles on supported plans",
        "A focused workspace instead of scattered files",
      ]}
      useCasesTitle="Built for real student workflows"
      useCases={[
        {
          title: "Create handwritten study notes fast",
          description:
            "Convert study material into notes without rebuilding formatting for every subject.",
        },
        {
          title: "Mix sources in one library",
          description:
            "Keep PDF readings, image captures, and lecture notes together as you move through a term.",
        },
        {
          title: "Revise with less friction",
          description:
            "Open structured pages instead of hunting through chats, screenshots, and unmarked PDFs.",
        },
      ]}
      benefitsTitle="What makes NoteScript a practical notes maker"
      benefits={[
        "Student-first design for high school, college, university, and self-study.",
        "Handwritten note styles that stay consistent across pages.",
        "Clear plan limits so you know which sources unlock on Free, Student, and Pro.",
        "No generative-AI claims — formatting stays predictable and source-based.",
      ]}
      faqs={[
        {
          question: "Is NoteScript just a handwriting font generator?",
          answer:
            "No. It is a study notes maker that extracts content from your sources and organizes it into structured handwritten-style pages.",
        },
        {
          question: "Can I use it as a study notes generator for exams?",
          answer:
            "Yes. Students use NoteScript to turn existing material into revision-friendly notes before quizzes and finals.",
        },
        {
          question: "Where do I start?",
          answer:
            "Start free with text to handwritten notes, then upgrade when you need PDF, image, or YouTube sources.",
        },
      ]}
      relatedLinks={[
        {
          href: "/text-to-handwritten-notes",
          label: "Text to handwritten notes",
          description: "The Free-friendly starting point for typed material.",
        },
        {
          href: "/pdf-to-handwritten-notes",
          label: "PDF to handwritten notes",
          description: "Convert selectable PDF readings into study pages.",
        },
        {
          href: "/image-to-handwritten-notes",
          label: "Image to handwritten notes",
          description: "OCR photographed pages into structured notes.",
        },
        {
          href: "/youtube-to-handwritten-notes",
          label: "YouTube to handwritten notes",
          description: "Create lecture notes from public captions on Pro.",
        },
        {
          href: "/templates",
          label: "Templates",
          description: "Explore handwriting styles and diagram templates.",
        },
        {
          href: "/about",
          label: "About NoteScript",
          description: "Learn why the product is built for students.",
        },
      ]}
      planNote={
        <>
          Explore sources on{" "}
          <Link href="/features" className="font-semibold text-[#72558f] hover:underline">
            features
          </Link>{" "}
          or compare{" "}
          <Link href="/pricing" className="font-semibold text-[#72558f] hover:underline">
            pricing
          </Link>
          .
        </>
      }
    />
  );
}
