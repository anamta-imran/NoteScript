import type { Metadata } from "next";
import {
  Architects_Daughter,
  Caveat,
  Covered_By_Your_Grace,
  Gloria_Hallelujah,
  Gochi_Hand,
  Handlee,
  Homemade_Apple,
  Indie_Flower,
  Kalam,
  Marck_Script,
  Noto_Nastaliq_Urdu,
  Patrick_Hand,
  Plus_Jakarta_Sans,
  Rock_Salt,
  Schoolbell,
  Shadows_Into_Light,
} from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

const ui = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-ui", display: "swap" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat", display: "swap" });
const kalam = Kalam({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-kalam", display: "swap" });
const gochi = Gochi_Hand({ subsets: ["latin"], weight: "400", variable: "--font-gochi", display: "swap" });
const patrick = Patrick_Hand({ subsets: ["latin"], weight: "400", variable: "--font-patrick", display: "swap" });
const handlee = Handlee({ subsets: ["latin"], weight: "400", variable: "--font-handlee", display: "swap" });
const indie = Indie_Flower({ subsets: ["latin"], weight: "400", variable: "--font-indie", display: "swap" });
const shadows = Shadows_Into_Light({ subsets: ["latin"], weight: "400", variable: "--font-shadows", display: "swap" });
const architects = Architects_Daughter({ subsets: ["latin"], weight: "400", variable: "--font-architects", display: "swap" });
const schoolbell = Schoolbell({ subsets: ["latin"], weight: "400", variable: "--font-schoolbell", display: "swap" });
const homemade = Homemade_Apple({ subsets: ["latin"], weight: "400", variable: "--font-homemade", display: "swap" });
const marck = Marck_Script({ subsets: ["latin"], weight: "400", variable: "--font-marck", display: "swap" });
const gloria = Gloria_Hallelujah({ subsets: ["latin"], weight: "400", variable: "--font-gloria", display: "swap" });
const rock = Rock_Salt({ subsets: ["latin"], weight: "400", variable: "--font-rock", display: "swap" });
const covered = Covered_By_Your_Grace({ subsets: ["latin"], weight: "400", variable: "--font-covered", display: "swap" });
const urdu = Noto_Nastaliq_Urdu({ subsets: ["arabic"], variable: "--font-urdu", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
  title: {
    default: "NoteScript — Handwritten study notes from your material",
    template: "%s · NoteScript",
  },
  description:
    "Turn text, lectures, PDFs, and images into structured handwritten-style study notes with rule-based formatting. No generative AI.",
  openGraph: {
    title: "NoteScript — Handwritten study notes from your material",
    description:
      "Study material in. Beautiful handwritten notes out. Text, YouTube transcripts, PDFs, and images.",
    type: "website",
  },
  icons: { icon: "/favicon.ico" },
};

const fontVars = [
  ui,
  caveat,
  kalam,
  gochi,
  patrick,
  handlee,
  indie,
  shadows,
  architects,
  schoolbell,
  homemade,
  marck,
  gloria,
  rock,
  covered,
  urdu,
]
  .map((f) => f.variable)
  .join(" ");

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${fontVars} antialiased`}>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
