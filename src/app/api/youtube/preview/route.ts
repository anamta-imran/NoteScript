import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { extractYoutube } from "@/lib/extractors/youtube";
import { handleRouteError, json, limit } from "@/lib/http";
import { parseYoutubeId } from "@/lib/utils";
import { AppError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    limit(req, "yt-preview", 10, 60_000);
    await requireUser();
    const { url } = await req.json();
    if (!parseYoutubeId(String(url || ""))) {
      throw new AppError("Enter a valid YouTube URL.", 400, "INVALID_YOUTUBE");
    }
    const extracted = await extractYoutube(String(url));
    return json({
      text: extracted.text,
      videoId: extracted.youtubeVideoId,
      warnings: extracted.warnings,
    });
  } catch (e) {
    return handleRouteError(e);
  }
}
