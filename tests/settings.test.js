const test = require("node:test");
const assert = require("node:assert/strict");

const settings = require("../settings.js");

test("normalize defaults to Gemini with no model set", () => {
  const normalized = settings.normalize({
    provider: "unexpected-provider",
    aiApiKey: "  example-key  ",
  });

  assert.equal(normalized.provider, "gemini");
  assert.equal(normalized.aiApiKey, "example-key");
  assert.equal(normalized.aiModel, "");
  assert.equal(normalized.customProviderConfig, "");
});

test("normalize accepts every built-in provider and trims a custom model", () => {
  for (const provider of Object.keys(settings.PROVIDER_PRESETS)) {
    const normalized = settings.normalize({ provider, aiModel: "  my-model  " });
    assert.equal(normalized.provider, provider);
    assert.equal(normalized.aiModel, "my-model");
  }
});

test("normalize keeps the custom provider's raw JSON config untouched", () => {
  const json = '{"url":"https://example.com","model":"m"}';
  const normalized = settings.normalize({
    provider: "custom",
    customProviderConfig: json,
  });
  assert.equal(normalized.provider, "custom");
  assert.equal(normalized.customProviderConfig, json);
});

test("resolveProvider fills in Gemini's default model and builds its URL", () => {
  const resolved = settings.resolveProvider(
    settings.normalize({ provider: "gemini", aiApiKey: "key" }),
  );
  assert.equal(resolved.format, "gemini");
  assert.equal(resolved.model, "gemini-3.5-flash-lite");
  assert.equal(resolved.requiresKey, true);
  assert.equal(
    resolved.url,
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
  );
});

test("resolveProvider respects an explicit model over the preset default", () => {
  const resolved = settings.resolveProvider(
    settings.normalize({ provider: "gemini", aiModel: "gemini-2.5-pro" }),
  );
  assert.equal(resolved.model, "gemini-2.5-pro");
  assert.match(resolved.url, /models\/gemini-2\.5-pro:generateContent$/);
});

test("resolveProvider builds an OpenAI-compatible URL for OpenAI, DeepSeek, OpenRouter, and Ollama", () => {
  const cases = [
    ["openai", "https://api.openai.com/v1/chat/completions", "gpt-4o-mini", true],
    ["deepseek", "https://api.deepseek.com/chat/completions", "deepseek-chat", true],
    [
      "openrouter",
      "https://openrouter.ai/api/v1/chat/completions",
      "openai/gpt-4o-mini",
      true,
    ],
    ["ollama", "http://localhost:11434/v1/chat/completions", "llama3.1", false],
  ];
  for (const [provider, url, model, requiresKey] of cases) {
    const resolved = settings.resolveProvider(settings.normalize({ provider }));
    assert.equal(resolved.format, "openai", provider);
    assert.equal(resolved.url, url, provider);
    assert.equal(resolved.model, model, provider);
    assert.equal(resolved.requiresKey, requiresKey, provider);
  }
});

test("resolveProvider builds Anthropic's Messages API URL and requires a key", () => {
  const resolved = settings.resolveProvider(settings.normalize({ provider: "anthropic" }));
  assert.equal(resolved.format, "anthropic");
  assert.equal(resolved.url, "https://api.anthropic.com/v1/messages");
  assert.equal(resolved.model, "claude-3-5-haiku-20241022");
  assert.equal(resolved.requiresKey, true);
});

test("resolveProvider reads a custom provider's JSON config", () => {
  const resolved = settings.resolveProvider(
    settings.normalize({
      provider: "custom",
      customProviderConfig: JSON.stringify({
        baseUrl: "https://my-proxy.example.com",
        path: "/v1/chat/completions",
        model: "my-model",
        apiKey: "secret",
        format: "anthropic",
        headers: { "X-Extra": "1" },
      }),
    }),
  );
  assert.equal(resolved.format, "anthropic");
  assert.equal(resolved.url, "https://my-proxy.example.com/v1/chat/completions");
  assert.equal(resolved.model, "my-model");
  assert.equal(resolved.apiKey, "secret");
  assert.deepEqual(resolved.headers, { "X-Extra": "1" });
  assert.equal(resolved.requiresKey, false);
});

test("resolveProvider defaults a custom config's format to openai and accepts a plain url", () => {
  const resolved = settings.resolveProvider(
    settings.normalize({
      provider: "custom",
      customProviderConfig: JSON.stringify({
        url: "https://my-proxy.example.com/chat",
        model: "m",
      }),
    }),
  );
  assert.equal(resolved.format, "openai");
  assert.equal(resolved.url, "https://my-proxy.example.com/chat");
});

test("resolveProvider rejects invalid or incomplete custom config", () => {
  assert.throws(() =>
    settings.resolveProvider(
      settings.normalize({ provider: "custom", customProviderConfig: "{not json" }),
    ),
  );
  assert.throws(() =>
    settings.resolveProvider(
      settings.normalize({
        provider: "custom",
        customProviderConfig: JSON.stringify({ model: "m" }), // no url/baseUrl
      }),
    ),
  );
});

test("canonicalYouTubeUrl accepts a valid video ID and rejects the rest", () => {
  assert.equal(
    settings.canonicalYouTubeUrl("ydTeb_I0b94"),
    "https://www.youtube.com/watch?v=ydTeb_I0b94",
  );
  assert.throws(
    () => settings.canonicalYouTubeUrl('"><script>'),
    /Invalid YouTube video ID/,
  );
});
