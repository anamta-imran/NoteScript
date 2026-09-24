import { PaidDashboard } from "@/components/dashboard/PaidDashboard";
import { PreviewShell } from "@/components/dashboard/PreviewShell";
import { getPaidDashboardPreview } from "@/lib/dashboard-preview-data";

export const metadata = {
  title: "Pro dashboard preview",
  robots: { index: false, follow: false },
};

export default function ProDashboardPreviewPage() {
  const { me, notes, folders } = getPaidDashboardPreview("pro", "annual");

  return (
    <PreviewShell planId="pro">
      <PaidDashboard me={me} notes={notes} folders={folders} />
    </PreviewShell>
  );
}
