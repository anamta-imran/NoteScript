import { AppError } from "@/lib/errors";
import { parseYoutubeId, secondsToTimestamp } from "@/lib/utils";
import type { ExtractedContent } from "@/lib/types";

type CaptionTrack = {
  baseUrl: string;
  languageCode?: string;
  kind?: string;
  name?: { simpleText?: string };
};

type TranscriptCue = { text: string; offset: number; duration: number };

/**
 * Fetch YouTube captions via the watch-page captionTracks + timedtext XML.
 * Falls back across languages and auto-generated tracks.
 * Maps failures to distinct AppError codes (not a single generic message).
 */
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

  let watchHtml: string;
  try {
    watchHtml = await fetchWatchPage(id);
  } catch {
    throw new AppError(
      "Could not reach YouTube to load this video. Check your connection and try again.",
      502,
      "TRANSCRIPT_FETCH_FAILED",
    );
  }

  if (isVideoUnavailable(watchHtml)) {
    throw new AppError(
      "This video is unavailable, private, or restricted. Try another public video with captions.",
      422,
      "VIDEO_UNAVAILABLE",
    );
  }

  const tracks = extractCaptionTracks(watchHtml);
  if (!tracks.length) {
    throw new AppError(
      "No captions were found for this video (manual or auto-generated). Paste a transcript manually, or try a video with CC enabled.",
      422,
      "NO_TRANSCRIPT",
    );
  }

  const ordered = prioritizeTracks(tracks);
  const errors: string[] = [];

  for (const track of ordered) {
    try {
      const cues = await fetchTimedText(track.baseUrl);
      if (!cues.length) {
        errors.push(`${track.languageCode || "track"}: empty`);
        continue;
      }
      const text = cues
        .map((c) => `[${secondsToTimestamp(c.offset)}] ${c.text}`)
        .join("\n");
      const lang = track.languageCode || "unknown";
      const auto = track.kind === "asr" ? "auto-generated" : "manual";
      return {
        text,
        titleHint: extractTitle(watchHtml) || `YouTube lecture ${id}`,
        transcript: cues,
        youtubeVideoId: id,
        youtubeUrl: url,
        warnings: [
          `Captions loaded (${auto}, ${lang}). Notes are structured from the transcript — not raw captions.`,
        ],
      };
    } catch (e) {
      errors.push(
        `${track.languageCode || "track"}: ${e instanceof Error ? e.message : "failed"}`,
      );
    }
  }

  throw new AppError(
    `Captions exist but could not be downloaded (${errors.slice(0, 2).join("; ") || "unknown error"}). Paste the transcript manually or try again.`,
    502,
    "TRANSCRIPT_FETCH_FAILED",
  );
}

async function fetchWatchPage(videoId: string): Promise<string> {
  const res = await fetch(`https://www.youtube.com/watch?v=${videoId}&hl=en&gl=US`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; NoteScriptBot/1.0; +https://notescript.app)",
      "Accept-Language": "en-US,en;q=0.9",
      Accept: "text/html,application/xhtml+xml",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`watch_http_${res.status}`);
  }
  return res.text();
}

function isVideoUnavailable(html: string): boolean {
  return (
    /"playabilityStatus"\s*:\s*\{[^}]*"status"\s*:\s*"(LOGIN_REQUIRED|ERROR|UNPLAYABLE)"/i.test(
      html,
    ) ||
    /This video isn't available anymore/i.test(html) ||
    /Video unavailable/i.test(html) ||
    /private video/i.test(html)
  );
}

function extractJsonObject(html: string, varName: string): Record<string, unknown> | null {
  const marker = `${varName}`;
  const idx = html.indexOf(marker);
  if (idx === -1) return null;
  const eq = html.indexOf("=", idx);
  if (eq === -1) return null;
  let i = eq + 1;
  while (i < html.length && /\s/.test(html[i])) i++;
  if (html[i] !== "{") return null;
  let depth = 0;
  const start = i;
  for (; i < html.length; i++) {
    const ch = html[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(html.slice(start, i + 1)) as Record<string, unknown>;
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

function extractCaptionTracks(html: string): CaptionTrack[] {
  const player = extractJsonObject(html, "ytInitialPlayerResponse");
  const captions = player?.captions as
    | { playerCaptionsTracklistRenderer?: { captionTracks?: CaptionTrack[] } }
    | undefined;
  const tracks = captions?.playerCaptionsTracklistRenderer?.captionTracks;
  if (Array.isArray(tracks) && tracks.length) {
    return tracks;
  }

  // Fallback: captionTracks embedded elsewhere in the page payload
  const m = html.match(/"captionTracks"\s*:\s*(\[[\s\S]*?\])/);
  if (!m) return [];
  try {
    const repaired = m[1]
      .replace(/\\u0026/g, "&")
      .replace(/\\"/g, '"');
    const parsed = JSON.parse(repaired) as CaptionTrack[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function prioritizeTracks(tracks: CaptionTrack[]): CaptionTrack[] {
  const score = (t: CaptionTrack) => {
    const lang = (t.languageCode || "").toLowerCase();
    let s = 0;
    if (lang === "en" || lang.startsWith("en-")) s += 100;
    if (lang === "en-US" || lang === "en-GB") s += 10;
    if (t.kind !== "asr") s += 40; // prefer human captions
    if (lang) s += 1;
    return s;
  };
  return [...tracks].sort((a, b) => score(b) - score(a));
}

async function fetchTimedText(baseUrl: string): Promise<TranscriptCue[]> {
  const url = baseUrl.includes("fmt=")
    ? baseUrl
    : `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}fmt=srv3`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; NoteScriptBot/1.0; +https://notescript.app)",
      Accept: "*/*",
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`timedtext_http_${res.status}`);
  const body = await res.text();
  if (!body.trim()) throw new Error("empty_timedtext");

  if (body.trimStart().startsWith("{") || body.includes('"events"')) {
    return parseJson3(body);
  }
  return parseTimedTextXml(body);
}

function parseTimedTextXml(xml: string): TranscriptCue[] {
  const cues: TranscriptCue[] = [];
  const re = /<text\b([^>]*)>([\s\S]*?)<\/text>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) {
    const attrs = m[1];
    const start = Number(/start="([\d.]+)"/i.exec(attrs)?.[1] || 0);
    const dur = Number(/dur="([\d.]+)"/i.exec(attrs)?.[1] || 0);
    const text = decodeXml(m[2])
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!text) continue;
    cues.push({
      text,
      offset: Math.round(start * 1000),
      duration: Math.round(dur * 1000),
    });
  }
  return cues;
}

function parseJson3(raw: string): TranscriptCue[] {
  try {
    const data = JSON.parse(raw) as {
      events?: Array<{ tStartMs?: number; dDurationMs?: number; segs?: Array<{ utf8?: string }> }>;
    };
    const cues: TranscriptCue[] = [];
    for (const ev of data.events || []) {
      const text = (ev.segs || [])
        .map((s) => s.utf8 || "")
        .join("")
        .replace(/\n/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (!text || text === "\n") continue;
      cues.push({
        text,
        offset: ev.tStartMs || 0,
        duration: ev.dDurationMs || 0,
      });
    }
    return cues;
  } catch {
    return [];
  }
}

function decodeXml(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function extractTitle(html: string): string | undefined {
  const player = extractJsonObject(html, "ytInitialPlayerResponse");
  const details = player?.videoDetails as { title?: string } | undefined;
  const title = details?.title;
  if (typeof title === "string" && title.trim()) return title.trim().slice(0, 160);
  const og = /<meta\s+property="og:title"\s+content="([^"]+)"/i.exec(html);
  if (og?.[1]) return decodeXml(og[1]).slice(0, 160);
  return undefined;
}
