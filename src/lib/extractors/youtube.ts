import { AppError } from "@/lib/errors";
import { parseYoutubeId, secondsToTimestamp } from "@/lib/utils";
import type { ExtractedContent } from "@/lib/types";
import { YoutubeTranscript } from "youtube-transcript";

export async function extractYoutube(url: string): Promise<ExtractedContent> {
  const id = parseYoutubeId(url);
  if (!id) {
    throw new AppError("Enter a valid YouTube URL.", 400, "INVALID_YOUTUBE");
  }
  if (process.env.YOUTUBE_ENABLED === "false") {
    throw new AppError(
      "YouTube transcript processing is disabled on this server.",
      503,
      "YOUTUBE_DISABLED",
    );
  }
  try {
    const items = await YoutubeTranscript.fetchTranscript(id);
    if (!items.length) {
      throw new AppError(
        "This video doesn't have an accessible transcript. Try another video or paste the transcript manually.",
        422,
        "NO_TRANSCRIPT",
      );
    }
    const text = items
      .map((i) => `[${secondsToTimestamp(i.offset)}] ${i.text}`)
      .join("\n");
    return {
      text,
      titleHint: `YouTube lecture ${id}`,
      transcript: items.map((i) => ({
        text: i.text,
        offset: i.offset,
        duration: i.duration,
      })),
      youtubeVideoId: id,
      youtubeUrl: url,
      warnings: [],
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      "This video doesn't have an accessible transcript. Try another video or paste the transcript manually.",
      422,
      "NO_TRANSCRIPT",
    );
  }
}
