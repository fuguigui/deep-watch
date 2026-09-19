const test = require("node:test");
const assert = require("node:assert/strict");

const settings = require("../settings.js");

test("Gemini defaults", () => {
  const normalized = settings.normalize({
    provider: "unexpected",
    aiApiKey: "  example-key  ",
  });

  assert.equal(normalized.provider, "gemini");
  assert.equal(normalized.aiApiKey, "example-key");
  assert.equal(normalized.aiModel, "gemini-2.5-flash");
});

test("a custom model name is kept, trimmed", () => {
  const normalized = settings.normalize({
    aiApiKey: "example-key",
    aiModel: "  gemini-2.5-pro  ",
  });

  assert.equal(normalized.aiModel, "gemini-2.5-pro");
});

test("an empty or non-string model name falls back to the default", () => {
  assert.equal(
    settings.normalize({ aiModel: "" }).aiModel,
    settings.DEFAULTS.aiModel,
  );
  assert.equal(
    settings.normalize({ aiModel: "   " }).aiModel,
    settings.DEFAULTS.aiModel,
  );
  assert.equal(
    settings.normalize({ aiModel: 42 }).aiModel,
    settings.DEFAULTS.aiModel,
  );
});

test("generateContentUrl builds the Gemini endpoint for the given model", () => {
  assert.equal(
    settings.generateContentUrl("gemini-2.5-flash"),
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
  );
  // URL-encodes anything unexpected in a user-supplied model name.
  assert.equal(
    settings.generateContentUrl("weird/model name"),
    "https://generativelanguage.googleapis.com/v1beta/models/weird%2Fmodel%20name:generateContent",
  );
});

test("generateContentUrl falls back to the default model when none is given", () => {
  assert.equal(
    settings.generateContentUrl(),
    `https://generativelanguage.googleapis.com/v1beta/models/${settings.DEFAULTS.aiModel}:generateContent`,
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
