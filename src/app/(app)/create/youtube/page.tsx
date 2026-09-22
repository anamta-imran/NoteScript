import { CreateNoteForm } from "@/components/notes/CreateNoteForm";
import { UpgradePrompt } from "@/components/billing/UpgradePrompt";
import { requireUser } from "@/lib/auth";
import { canUseSource, requiredPlanForSource } from "@/lib/entitlements";
import type { PlanId } from "@/lib/types";

export default async function YouTubeCreatePage() {
  const user = await requireUser();
  const planId = user.planId as PlanId;

  if (!canUseSource(planId, "youtube")) {
    return (
      <div className="mx-auto max-w-3xl">
        <UpgradePrompt
          feature="youtube"
          currentPlan={planId}
          requiredPlan={requiredPlanForSource("youtube")}
        />
      </div>
    );
  }

  return <CreateNoteForm sourceType="youtube" />;
}
