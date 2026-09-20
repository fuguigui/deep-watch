/**
 * Shared, non-secret configuration helpers.
 *
 * The API key is stored in chrome.storage.local by options.js. This file
 * contains defaults and validation only, so it is safe to publish.
 */
var YTD_SETTINGS = (() => {
  const STORAGE_KEY = "dw_settings";

  // One preset per built-in provider. `format` picks which request/response
  // shape background.js builds (see buildOpenAiRequestBody,
  // buildAnthropicRequestBody, buildGeminiRequestBody); providers that speak
  // the same shape (OpenAI, DeepSeek, OpenRouter, Ollama) just point at
  // "openai" and differ only in baseUrl/path/model. "custom" has no preset —
  // the person supplies their own JSON instead (see resolveProvider).
  const PROVIDER_PRESETS = Object.freeze({
    gemini: {
      label: "Google Gemini",
      format: "gemini",
      baseUrl: "https://generativelanguage.googleapis.com",
      defaultModel: "gemini-3.5-flash-lite",
      requiresKey: true,
    },
    openai: {
      label: "OpenAI",
      format: "openai",
      baseUrl: "https://api.openai.com",
      path: "/v1/chat/completions",
      defaultModel: "gpt-4o-mini",
      requiresKey: true,
    },
    anthropic: {
      label: "Anthropic Claude",
      format: "anthropic",
      baseUrl: "https://api.anthropic.com",
      path: "/v1/messages",
      defaultModel: "claude-3-5-haiku-20241022",
      requiresKey: true,
    },
    deepseek: {
      label: "DeepSeek",
      format: "openai",
      baseUrl: "https://api.deepseek.com",
      path: "/chat/completions",
      defaultModel: "deepseek-chat",
      requiresKey: true,
    },
    openrouter: {
      label: "OpenRouter",
      format: "openai",
      baseUrl: "https://openrouter.ai/api",
      path: "/v1/chat/completions",
      defaultModel: "openai/gpt-4o-mini",
      requiresKey: true,
    },
    ollama: {
      label: "Ollama (local)",
      format: "openai",
      baseUrl: "http://localhost:11434",
      path: "/v1/chat/completions",
      defaultModel: "llama3.1",
      requiresKey: false,
    },
    custom: {
      label: "Custom",
      format: "custom",
      requiresKey: false,
    },
  });

  const DEFAULTS = Object.freeze({
    provider: "gemini",
    aiApiKey: "",
    aiModel: "",
    customProviderConfig: "",
  });

  function isKnownProvider(provider) {
    return Object.prototype.hasOwnProperty.call(PROVIDER_PRESETS, provider);
  }

  function normalize(input = {}) {
    const provider = isKnownProvider(input?.provider)
      ? input.provider
      : DEFAULTS.provider;
    return {
      provider,
      aiApiKey:
        typeof input?.aiApiKey === "string" ? input.aiApiKey.trim() : "",
      // An empty model falls back to the provider's own default below
      // (resolveProvider), not here — this just preserves what was typed.
      aiModel: typeof input?.aiModel === "string" ? input.aiModel.trim() : "",
      customProviderConfig:
        typeof input?.customProviderConfig === "string"
          ? input.customProviderConfig
          : "",
    };
  }

  /**
   * Turns normalized settings into everything requestAiCompletion needs to
   * make one call: which request/response shape to use, the exact URL,
   * the model, the API key (if any), and any extra headers. Throws if a
   * custom provider's JSON config doesn't parse — the caller decides how
   * to surface that.
   */
  function resolveProvider(settings) {
    if (settings.provider === "custom") {
      let custom;
      try {
        custom = settings.customProviderConfig
          ? JSON.parse(settings.customProviderConfig)
          : {};
      } catch (error) {
        throw new Error(
          "Custom provider config is not valid JSON. Check Settings.",
        );
      }
      if (!custom || typeof custom !== "object") {
        throw new Error("Custom provider config must be a JSON object.");
      }
      const format = ["openai", "anthropic", "gemini"].includes(
        custom.format,
      )
        ? custom.format
        : "openai";
      const url =
        typeof custom.url === "string" && custom.url
          ? custom.url
          : `${custom.baseUrl || ""}${custom.path || ""}`;
      if (!url) {
        throw new Error(
          'Custom provider config needs a "url" (or "baseUrl" + "path").',
        );
      }
      return {
        providerLabel: "Custom provider",
        format,
        url,
        model: custom.model || "",
        apiKey: typeof custom.apiKey === "string" ? custom.apiKey : "",
        headers:
          custom.headers && typeof custom.headers === "object"
            ? custom.headers
            : {},
        requiresKey: false, // the person's own JSON is the source of truth
      };
    }

    const preset = isKnownProvider(settings.provider)
      ? PROVIDER_PRESETS[settings.provider]
      : PROVIDER_PRESETS.gemini;
    const model = settings.aiModel || preset.defaultModel;
    const url =
      preset.format === "gemini"
        ? `${preset.baseUrl}/v1beta/models/${encodeURIComponent(model)}:generateContent`
        : `${preset.baseUrl}${preset.path}`;

    return {
      providerLabel: preset.label,
      format: preset.format,
      url,
      model,
      apiKey: settings.aiApiKey,
      headers: {},
      requiresKey: preset.requiresKey,
    };
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
    PROVIDER_PRESETS,
    isKnownProvider,
    normalize,
    resolveProvider,
    canonicalYouTubeUrl,
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = YTD_SETTINGS;
}
