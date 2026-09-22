"use client";

import { canUseFeature, type FeatureKey } from "@/lib/entitlements";
import type { PlanId } from "@/lib/types";
import { UpgradePrompt } from "./UpgradePrompt";

export function FeatureGate({
  planId,
  feature,
  requiredPlan,
  children,
  fallback,
  compact = false,
}: {
  planId: PlanId;
  feature: FeatureKey;
  requiredPlan?: PlanId;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  compact?: boolean;
}) {
  if (canUseFeature(planId, feature)) {
    return <>{children}</>;
  }
  if (fallback) return <>{fallback}</>;
  return (
    <UpgradePrompt
      feature={feature}
      currentPlan={planId}
      requiredPlan={requiredPlan || (feature === "youtube" ? "pro" : "student")}
      compact={compact}
    />
  );
}
