import { EducationalDiagramStudio } from "@/components/diagrams/EducationalDiagramStudio";
import { UpgradePrompt } from "@/components/billing/UpgradePrompt";
import { requireUser } from "@/lib/auth";
import { canUseSource, requiredPlanForSource } from "@/lib/entitlements";
import type { PlanId } from "@/lib/types";

export default async function DiagramCreatePage() {
  const user = await requireUser();
  const planId = user.planId as PlanId;

  if (!canUseSource(planId, "diagram")) {
    return (
      <div className="mx-auto max-w-3xl">
        <UpgradePrompt
          feature="diagram"
          currentPlan={planId}
          requiredPlan={requiredPlanForSource("diagram")}
        />
      </div>
    );
  }

  return <EducationalDiagramStudio />;
}
