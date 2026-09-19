/**
 * YOUTUBE TRANSCRIPT ADAPTER
 *
 * Fetches a YouTube video's transcript for free, with no third-party
 * transcript service. Each supported site gets its own adapter file like
 * this one, and every adapter returns the same shape — so the rest of the
 * extension (analysis, translation, notes, chat) never needs to know which
 * site a video came from. Adding a new site later (e.g. Bilibili) means
 * adding a new file here, not touching this one.
 *
 * HOW IT WORKS
 *
 * YouTube's own player exposes a getPlayerResponse() method that lists
 * every caption track available for the current video — language, whether
 * it's auto-generated, and a `baseUrl` you can fetch to get that track's
 * timed text — as soon as the player has loaded. This is true whether or
 * not the viewer ever turned captions on.
 *
 * The player object lives in the PAGE's own JavaScript world, not the
 * "isolated world" a content script normally runs in, so a plain content
 * script can't see it. With the "scripting" permission we can run a tiny
 * function directly in the page's world (world: "MAIN") to read it — on
 * demand, the moment we need the transcript, rather than waiting for the
 * browser to happen to request it on its own (which is how the old passive
 * "watch the network" approach worked, and why it could miss videos
 * entirely).
 *
 * The actual caption-track download also has to happen from THAT same
 * MAIN-world script, not from the extension's background service worker.
 * A fetch from the background runs as the extension's own origin
 * (chrome-extension://…), and YouTube's timedtext endpoint quietly
 * returns a 200 with an empty body for that — no error, just nothing to
 * parse. A fetch issued from the page itself carries the page's own
 * origin, referrer, and cookies, which the endpoint expects.
 *
 * Returned shape (kept identical to the old Supadata-based fetch so every
 * caller — analysis, notes, translation, side panel rendering — needed no
 * changes):
 *   {
 *     success: true,
 *     transcript: [{ text, start (seconds), duration (seconds), language }],
 *     transcriptText: "plain text ...",
 *     transcriptTextTimestamped: "[MM:SS] line\n[MM:SS] line...",
 *     language: "en" | null,
 *   }
 *   { success: false, error: "NO_TRANSCRIPT" | ..., message: "..." }
 */
var YTD_TRANSCRIPT_YOUTUBE = (() => {
  /**
   * Picks the best available track: the requested language first, then any
   * track whose language starts with it (e.g. "en" matches "en-US"), then
   * any manually authored (non auto-generated) track, then whatever is
   * left. Mirrors the old Supadata request's "lang=en" preference.
   *
   * Kept as a real function for the module's own use (tests, other
   * adapters), but note that fetchInPage below carries its own inlined
   * copy — a function passed to chrome.scripting.executeScript runs in
   * an isolated copy of the page's world and can't close over anything
   * from this file, so the logic has to be duplicated there.
   */
  function pickTrack(tracks, preferredLang = "en") {
    if (!tracks || tracks.length === 0) return null;
    const exact = tracks.find((t) => t.languageCode === preferredLang);
    if (exact) return exact;
    const prefixMatch = tracks.find((t) =>
      (t.languageCode || "").startsWith(preferredLang),
    );
    if (prefixMatch) return prefixMatch;
    const manual = tracks.find((t) => t.kind !== "asr");
    return manual || tracks[0];
  }

  /**
   * Reads the caption track list AND downloads the chosen track's timed
   * text, all in one call, running entirely in the page's own JS world.
   *
   * Both steps have to happen there: getPlayerResponse() only exists on
   * the page's player object, and the caption download itself only
   * returns real data when it comes from the page's own origin (see the
   * file header). Running them as two separate calls would still fetch
   * from the wrong context for the second step.
   *
   * @returns {{ok: true, data, languageCode} | {ok: false, error}}
   */
  async function fetchInPage(tabId, preferredLang) {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      world: "MAIN",
      args: [preferredLang],
      func: async (preferredLang) => {
        function pickTrack(tracks, lang) {
          const exact = tracks.find((t) => t.languageCode === lang);
          if (exact) return exact;
          const prefixMatch = tracks.find((t) =>
            (t.languageCode || "").startsWith(lang),
          );
          if (prefixMatch) return prefixMatch;
          const manual = tracks.find((t) => t.kind !== "asr");
          return manual || tracks[0];
        }

        try {
          const player = document.getElementById("movie_player");
          const tracks =
            player?.getPlayerResponse?.()?.captions
              ?.playerCaptionsTracklistRenderer?.captionTracks;
          if (!Array.isArray(tracks) || tracks.length === 0) {
            return { ok: false, error: "NO_TRANSCRIPT" };
          }

          const track = pickTrack(tracks, preferredLang);
          const url = new URL(track.baseUrl);
          url.searchParams.set("fmt", "json3");

          const response = await fetch(url.toString());
          if (!response.ok) {
            return { ok: false, error: `HTTP_${response.status}` };
          }
          const text = await response.text();
          if (!text) {
            return { ok: false, error: "EMPTY_RESPONSE" };
          }
          const data = JSON.parse(text);
          return { ok: true, data, languageCode: track.languageCode || null };
        } catch (e) {
          return { ok: false, error: e.message || "UNKNOWN_ERROR" };
        }
      },
    });
    return (
      results?.[0]?.result || { ok: false, error: "SCRIPT_INJECTION_FAILED" }
    );
  }

  /**
   * Converts YouTube's raw json3 caption format into our internal
   * transcript shape (same shape the old Supadata response was parsed
   * into).
   */
  function buildTranscript(data, languageCode) {
    const transcript = [];
    let transcriptTextPlain = "";
    let transcriptTextTimestamped = "";

    const events = Array.isArray(data?.events) ? data.events : [];
    for (const event of events) {
      if (!Array.isArray(event.segs)) continue;

      // ">>" is YouTube's speaker-change marker in auto-generated captions.
      const cleanText = event.segs
        .map((seg) => seg.utf8 || "")
        .join("")
        .replace(/>> ?/g, "")
        .replace(/\s+/g, " ")
        .trim();
      if (!cleanText) continue;

      const startSeconds = Math.floor((event.tStartMs || 0) / 1000);
      const durationSeconds = Math.floor((event.dDurationMs || 0) / 1000);
      const minutes = Math.floor(startSeconds / 60);
      const seconds = startSeconds % 60;
      const timestamp = `${minutes}:${String(seconds).padStart(2, "0")}`;

      // Word-level offsets (relative to this line's start, in ms). Every
      // other field above is what the rest of the extension has always
      // read; `segs` is additional detail only the Chat tab's word-by-word
      // subtitle view uses — everything else safely ignores it.
      const segs = event.segs
        .map((seg) => ({
          text: seg.utf8 || "",
          offsetMs: seg.tOffsetMs || 0,
        }))
        .filter((seg) => seg.text);

      transcript.push({
        text: cleanText,
        start: startSeconds,
        duration: durationSeconds,
        language: languageCode || null,
        segs,
      });

      transcriptTextPlain += cleanText + " ";
      transcriptTextTimestamped += `[${timestamp}] ${cleanText}\n`;
    }

    return {
      transcript,
      transcriptTextPlain: transcriptTextPlain.trim(),
      transcriptTextTimestamped: transcriptTextTimestamped.trim(),
    };
  }

  /**
   * Fetches the transcript for the YouTube video open in `tabId`.
   *
   * @param {number} tabId - The YouTube tab to read the player from.
   * @returns {Object} success/failure result, see file header for shape.
   */
  async function fetchTranscript(tabId) {
    if (!tabId) {
      return {
        success: false,
        error: "NO_TAB",
        message: "Could not find the YouTube tab to read captions from.",
      };
    }

    let result;
    try {
      result = await fetchInPage(tabId, "en");
    } catch (error) {
      return {
        success: false,
        error: "PLAYER_UNAVAILABLE",
        message:
          "Could not read the video player. Reload the YouTube tab and try again.",
      };
    }

    if (!result.ok) {
      if (result.error === "NO_TRANSCRIPT") {
        return {
          success: false,
          error: "NO_TRANSCRIPT",
          message: "No native subtitle track is available for this video.",
        };
      }
      if (result.error === "EMPTY_RESPONSE") {
        return {
          success: false,
          error: "EMPTY_TRANSCRIPT",
          message: "YouTube returned an empty caption track for this video.",
        };
      }
      return {
        success: false,
        error: "FETCH_FAILED",
        message: `Failed to download the caption track (${result.error}).`,
      };
    }

    const { transcript, transcriptTextPlain, transcriptTextTimestamped } =
      buildTranscript(result.data, result.languageCode);

    if (transcript.length === 0) {
      return {
        success: false,
        error: "EMPTY_TRANSCRIPT",
        message: "YouTube returned an empty caption track for this video.",
      };
    }

    return {
      success: true,
      transcript,
      transcriptText: transcriptTextPlain,
      transcriptTextTimestamped: transcriptTextTimestamped,
      language: result.languageCode || null,
    };
  }

  return { fetchTranscript, fetchInPage, pickTrack, buildTranscript };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = YTD_TRANSCRIPT_YOUTUBE;
}
