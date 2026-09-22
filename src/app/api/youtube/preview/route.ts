import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { extractYoutube } from "@/lib/extractors/youtube";
import { handleRouteError, json, limit } from "@/lib/http";
import { parseYoutubeId } from "@/lib/utils";
import { AppError, FeatureNotAvailableError } from "@/lib/errors";
import { canUseSource, requiredPlanForSource } from "@/lib/entitlements";
import type { PlanId } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    limit(req, "yt-preview", 10, 60_000);
    const user = await requireUser();
    const planId = user.planId as PlanId;
    if (!canUseSource(planId, "youtube")) {
      throw new FeatureNotAvailableError(
        "youtube",
        requiredPlanForSource("youtube"),
        planId,
        "YouTube-to-notes is a Pro feature.",
      );
    }
    const { url } = await req.json();
    if (!parseYoutubeId(String(url || ""))) {
      throw new AppError("Enter a valid YouTube URL.", 400, "INVALID_YOUTUBE");
    }
    const extracted = await extractYoutube(String(url));
    return json({
      text: extracted.text,
      videoId: extracted.youtubeVideoId,
      warnings: extracted.warnings,
      cueCount: extracted.transcript?.length || 0,
    });
  } catch (e) {
    return handleRouteError(e);
  }
}
