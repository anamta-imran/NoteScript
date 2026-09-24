import { PaidDashboard } from "@/components/dashboard/PaidDashboard";
import { PreviewShell } from "@/components/dashboard/PreviewShell";
import { getPaidDashboardPreview } from "@/lib/dashboard-preview-data";

export const metadata = {
  title: "Student dashboard preview",
  robots: { index: false, follow: false },
};

export default function StudentDashboardPreviewPage() {
  const { me, notes, folders } = getPaidDashboardPreview("student", "monthly");

  return (
    <PreviewShell planId="student">
      <PaidDashboard me={me} notes={notes} folders={folders} />
    </PreviewShell>
  );
}
