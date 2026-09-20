const test = require("node:test");
const assert = require("node:assert/strict");
const adapter = require("../transcript/youtube.js");

// A tiny stand-in for YouTube's watch page, just enough for the in-page
// script: a transcript panel whose lines outlive navigation, and a
// "Show transcript" button that (after a delay) loads the current video's
// lines into that same panel.
function makeWatchPage({ videoId, transcripts, staleLines = [], loadDelayMs }) {
  const page = { videoId, lines: staleLines, open: false, clicks: 0 };

  const segmentNode = ({ start, text }) => ({
    querySelector(selector) {
      if (selector === '[aria-hidden="true"]') {
        return { textContent: `${Math.floor(start / 60)}:${String(start % 60).padStart(2, "0")}` };
      }
      if (selector === '[role="text"]') return { textContent: text };
      return null;
    },
  });

  const panel = {
    getAttribute: (name) =>
      name === "visibility" && page.open
        ? "ENGAGEMENT_PANEL_VISIBILITY_EXPANDED"
        : null,
    querySelector(selector) {
      if (selector === 'button[aria-label="Close"]') {
        return { click: () => (page.open = false) };
      }
      return page.lines.length ? {} : null;
    },
  };

  const button = {
    click() {
      page.clicks += 1;
      page.open = true;
      const target = page.videoId;
      setTimeout(() => {
        if (transcripts[target]) page.lines = transcripts[target];
      }, loadDelayMs);
    },
  };

  const window = {};
  const document = {
    querySelectorAll(selector) {
      if (selector.includes("transcript-segment-view-model")) {
        return page.lines.map(segmentNode);
      }
      if (selector === "ytd-engagement-panel-section-list-renderer") {
        return [panel];
      }
      return [];
    },
    querySelector(selector) {
      if (selector.startsWith("ytd-video-description-transcript-section")) {
        return transcripts[page.videoId] ? button : null;
      }
      if (selector === "ytd-watch-flexy") {
        return { getAttribute: () => page.videoId };
      }
      return null;
    },
  };

  const location = {
    get search() {
      return `?v=${page.videoId}`;
    },
  };

  return { page, window, document, location };
}

// Runs the adapter's in-page function against the fake page.
async function fetchWith(env, videoId) {
  global.chrome = {
    scripting: {
      executeScript: async ({ func, args }) => {
        const previous = {
          window: global.window,
          document: global.document,
          location: global.location,
        };
        global.window = env.window;
        global.document = env.document;
        global.location = env.location;
        try {
          return [{ result: await func(...args) }];
        } finally {
          Object.assign(global, previous);
        }
      },
    },
  };
  return adapter.fetchTranscript(1, videoId);
}

const lines = (...texts) => texts.map((text, i) => ({ text, start: i * 10 }));

test("reads the new video's transcript, not the previous video's leftovers", async () => {
  const env = makeWatchPage({
    videoId: "videoB",
    staleLines: lines("Guten Morgen", "Heute im Studio"),
    transcripts: { videoB: lines("Grauer Star", "Eingriffe weltweit") },
    loadDelayMs: 300,
  });
  // The previous read of video A stamped the page.
  env.window.__deepWatchTranscript = {
    videoId: "videoA",
    signature: "2|Guten Morgen|10|Heute im Studio",
  };

  const result = await fetchWith(env, "videoB");

  assert.equal(result.success, true);
  assert.deepEqual(
    result.transcript.map((line) => line.text),
    ["Grauer Star", "Eingriffe weltweit"],
  );
  assert.equal(env.window.__deepWatchTranscript.videoId, "videoB");
});

test("never returns another video's lines when the panel does not refresh", async () => {
  const env = makeWatchPage({
    videoId: "videoB",
    staleLines: lines("Guten Morgen", "Heute im Studio"),
    transcripts: { videoB: [] }, // button exists, but nothing ever loads
    loadDelayMs: 0,
  });
  env.window.__deepWatchTranscript = {
    videoId: "videoA",
    signature: "2|Guten Morgen|10|Heute im Studio",
  };

  const result = await fetchWith(env, "videoB");

  assert.equal(result.success, false);
  assert.equal(result.error, "EMPTY_TRANSCRIPT");
});

test("reuses lines that were read for the same video without reopening the panel", async () => {
  const env = makeWatchPage({
    videoId: "videoA",
    staleLines: lines("Guten Morgen", "Heute im Studio"),
    transcripts: { videoA: lines("Guten Morgen", "Heute im Studio") },
    loadDelayMs: 0,
  });
  env.window.__deepWatchTranscript = {
    videoId: "videoA",
    signature: "2|Guten Morgen|10|Heute im Studio",
  };

  const result = await fetchWith(env, "videoA");

  assert.equal(result.success, true);
  assert.equal(env.page.clicks, 0);
});

test("reports a mismatch when the tab is showing a different video", async () => {
  const env = makeWatchPage({
    videoId: "videoC",
    transcripts: { videoC: lines("x") },
    loadDelayMs: 0,
  });

  const result = await fetchWith(env, "videoB");

  assert.equal(result.success, false);
  assert.equal(result.error, "VIDEO_MISMATCH");
});
