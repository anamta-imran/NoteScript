import Link from "next/link";

const LINKS = [
  { href: "/settings/profile", title: "Profile", body: "Name, avatar, timezone" },
  { href: "/settings/security", title: "Security", body: "Password and account deletion" },
  { href: "/settings/preferences", title: "Preferences", body: "Interface language and note defaults" },
  { href: "/billing", title: "Billing", body: "Plan, usage, and payments" },
];

export default function SettingsIndexPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-muted">Manage your account without leaving the notebook.</p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {LINKS.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="block rounded-2xl border border-line bg-white p-5">
              <p className="font-medium">{l.title}</p>
              <p className="mt-1 text-sm text-muted">{l.body}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
