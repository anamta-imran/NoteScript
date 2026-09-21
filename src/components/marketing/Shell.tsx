import Link from "next/link";
import { Button } from "@/components/ui/Button";

const links = [
  { href: "/features", label: "Features" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/templates", label: "Templates" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" },
];

export function MarketingHeader() {
  return (
    <header className="no-print sticky top-0 z-20 border-b border-line/80 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="font-hand-clean text-2xl text-lavender-deep">
          NoteScript
        </Link>
        <nav className="hidden items-center gap-5 text-sm md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-muted hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button href="/login" variant="ghost" size="sm">
            Log in
          </Button>
          <Button href="/signup" size="sm">
            Start Free
          </Button>
        </div>
      </div>
      <nav className="flex gap-4 overflow-x-auto border-t border-line px-4 py-2 text-sm md:hidden">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="whitespace-nowrap text-muted">
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="no-print border-t border-line bg-white/50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-hand-clean text-2xl text-lavender-deep">NoteScript</p>
          <p className="mt-2 text-sm text-muted">
            Study material in. Handwritten notes out. Rule-based formatting, not generative AI.
          </p>
        </div>
        {[
          {
            title: "Product",
            items: [
              ["/features", "Features"],
              ["/how-it-works", "How it works"],
              ["/pricing", "Pricing"],
              ["/templates", "Templates"],
            ],
          },
          {
            title: "Company",
            items: [
              ["/about", "About"],
              ["/faq", "FAQ"],
              ["/terms", "Terms of Service"],
              ["/privacy", "Privacy Policy"],
              ["/refund", "Refund Policy"],
            ],
          },
          {
            title: "Account",
            items: [
              ["/login", "Log in"],
              ["/signup", "Sign up"],
              ["/dashboard", "Dashboard"],
            ],
          },
        ].map((col) => (
          <div key={col.title}>
            <p className="text-sm font-semibold">{col.title}</p>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              {col.items.map(([href, label]) => (
                <li key={href}>
                  <Link href={href}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
