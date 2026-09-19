/**
 * Shared, non-secret configuration helpers.
 *
 * The API key is stored in chrome.storage.local by options.js. This file
 * contains defaults and validation only, so it is safe to publish.
 */
var YTD_SETTINGS = (() => {
  const STORAGE_KEY = "dw_settings";
  const DEFAULTS = Object.freeze({
    provider: "gemini",
    aiApiKey: "",
    aiModel: "gemini-2.5-flash",
  });

  function normalize(input = {}) {
    return {
      provider: DEFAULTS.provider,
      aiApiKey: typeof input.aiApiKey === "string" ? input.aiApiKey.trim() : "",
      aiModel:
        typeof input.aiModel === "string" && input.aiModel.trim()
          ? input.aiModel.trim()
          : DEFAULTS.aiModel,
    };
  }

  /**
   * Builds the Gemini generateContent endpoint for the configured model.
   * The API key is passed as a query parameter (Gemini's convention),
   * not an Authorization header.
   */
  function generateContentUrl(model) {
    const safeModel = encodeURIComponent(model || DEFAULTS.aiModel);
    return `https://generativelanguage.googleapis.com/v1beta/models/${safeModel}:generateContent`;
  }

  function canonicalYouTubeUrl(videoId) {
    const normalized = String(videoId || "").trim();
    if (!/^[A-Za-z0-9_-]{6,20}$/.test(normalized)) {
      throw new Error("Invalid YouTube video ID.");
    }
    return `https://www.youtube.com/watch?v=${normalized}`;
  }

  return {
    STORAGE_KEY,
    DEFAULTS,
    normalize,
    generateContentUrl,
    canonicalYouTubeUrl,
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = YTD_SETTINGS;
}
