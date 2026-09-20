const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("manifest uses minimized install-time permissions", () => {
  const manifest = JSON.parse(read("manifest.json"));
  const packageJson = JSON.parse(read("package.json"));

  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.minimum_chrome_version, "116");
  assert.equal(packageJson.version, manifest.version);
  assert.equal(manifest.options_ui.page, "options.html");
  assert.ok(!manifest.permissions.includes("activeTab"));
  assert.ok(manifest.host_permissions.includes("https://www.youtube.com/*"));
  // No transcript-service host: transcripts are read straight from the
  // video's own page (see transcript/youtube.js), not a third-party API.
  assert.ok(
    !manifest.host_permissions.some((origin) => origin.includes("supadata")),
  );
  // One fixed host per built-in AI provider (DeepSeek is a legitimate
  // provider choice again, alongside the others — see settings.js).
  for (const host of [
    "https://generativelanguage.googleapis.com/*",
    "https://api.openai.com/*",
    "https://api.anthropic.com/*",
    "https://api.deepseek.com/*",
    "https://openrouter.ai/*",
    "http://localhost/*",
  ]) {
    assert.ok(
      manifest.host_permissions.includes(host),
      `Expected host_permissions to include ${host}`,
    );
  }
  // A Custom provider's URL is arbitrary, so its origin is requested at
  // runtime (see options.js) rather than declared at install time.
  assert.deepEqual(manifest.optional_host_permissions, ["*://*/*"]);
});

test("release copy documents current scope without em dashes", () => {
  const readme = read("README.md");
  const chineseReadme = read("README.zh-CN.md");
  const manifest = JSON.parse(read("manifest.json"));
  const packageJson = JSON.parse(read("package.json"));

  assert.doesNotMatch(readme, /—/);
  assert.doesNotMatch(chineseReadme, /—/);
  assert.doesNotMatch(manifest.description, /—/);
  assert.doesNotMatch(packageJson.description, /—/);

  assert.equal(manifest.name, "DeepWatch");
  assert.equal(packageJson.name, "deep-watch");
  assert.match(read("scripts/package-extension.sh"), /deep-watch-v\$version\.zip/);
  assert.doesNotMatch(
    [readme, chineseReadme, read("PRIVACY.md"), read("SECURITY.md")].join("\n"),
    /\bYT Digest\b/,
  );
  assert.match(readme, /^# DeepWatch$/m);
  assert.match(
    readme,
    /Turn every video into a resource for deep learning\./,
  );
  assert.match(readme, /^## Install with your coding agent$/m);
  assert.match(
    readme,
    /permanent folder I choose[\s\S]*tell me its exact full path[\s\S]*If I need a suggestion during this first installation[\s\S]*`~\/Documents\/deep-watch`[\s\S]*`%USERPROFILE%\\Documents\\deep-watch`[\s\S]*do not assume either path/,
  );
  assert.match(
    readme,
    /Moving or deleting the source folder breaks the unpacked extension until you load it again from the new location\./,
  );
  assert.match(
    readme,
    /selecting the exact project folder you chose in Chrome with \*\*Load unpacked\*\*/,
  );
  assert.match(
    readme,
    /Select the exact project folder you chose, which must contain `manifest\.json`/,
  );
  assert.match(readme, /upstream issues and pull requests are not accepted/i);
  assert.doesNotMatch(readme, /^## Contributing$/m);
  assert.match(chineseReadme, /^# DeepWatch$/m);
  assert.match(chineseReadme, /把每个视频变成一份可以深入学习的资料/);
  assert.match(chineseReadme, /^## 用编程 Agent 安装$/m);
  assert.match(
    chineseReadme,
    /我选择的一个长期保留的文件夹[\s\S]*告诉我准确的完整路径[\s\S]*第一次安装时需要位置建议[\s\S]*`~\/Documents\/deep-watch`[\s\S]*`%USERPROFILE%\\Documents\\deep-watch`[\s\S]*不要假设我一定使用这些路径/,
  );
  assert.match(
    chineseReadme,
    /如果移动或删除源代码文件夹，Chrome 中加载的扩展会失效，需要从新的位置重新加载。/,
  );
  assert.match(
    chineseReadme,
    /「加载已解压的扩展程序」选择你刚才确定的那个准确项目文件夹/,
  );
  assert.match(
    chineseReadme,
    /选择你刚才确定的那个准确项目文件夹，其中必须包含 `manifest\.json`/,
  );
  assert.match(chineseReadme, /不接受上游 Issue 或 Pull Request/);
  assert.match(chineseReadme, /增加更多翻译语言/);

  // No third-party transcript service copy should remain anywhere
  // published: transcripts are free and direct from the video's own page,
  // regardless of which AI provider is configured. A one-time, historical
  // mention of Supadata in the README's Credits section (explaining what
  // this fork changed from youtube-digest) is fine — only the old
  // sign-up/setup instructions must be gone.
  const publishedDocs = [
    readme,
    chineseReadme,
    read("PRIVACY.md"),
    read("SECURITY.md"),
    read("options.html"),
  ].join("\n");
  assert.doesNotMatch(publishedDocs, /supadata\.ai/i);
  assert.doesNotMatch(publishedDocs, /Supadata API key/i);
  assert.match(readme, /fork and remix of \[zarazhangrui\/youtube-digest\]/);
  assert.match(
    readme,
    /https:\/\/github\.com\/zarazhangrui\/youtube-digest/,
  );
  assert.match(chineseReadme, /zarazhangrui\/youtube-digest/);
  assert.match(readme, /^## Credits$/m);
  assert.match(chineseReadme, /^## 致谢$/m);

  assert.match(readme, /aistudio\.google\.com\/apikey/i);
  assert.match(readme, /ai\.google\.dev\/gemini-api\/docs\/models/i);
  assert.match(readme, /ai\.google\.dev\/gemini-api\/docs\/pricing/i);
  assert.match(chineseReadme, /aistudio\.google\.com\/apikey/i);
  assert.match(readme, /^### The DeepWatch button is missing on a video$/m);
  assert.match(
    chineseReadme,
    /^### 视频页面没有显示 DeepWatch 按钮$/m,
  );
  assert.match(readme, /^## How transcript fetching works$/m);
  assert.match(readme, /transcript\/youtube\.js/);
  assert.match(readme, /no third-party transcript service/i);
  assert.match(readme, /Ask a video-aware chat/i);
  assert.match(chineseReadme, /transcript\/youtube\.js/);

  const optionsPage = read("options.html");
  const optionsStyles = read("options.css");
  const optionsScript = read("options.js");
  // The Gemini key-creation link is set at runtime (options.js swaps it per
  // provider), not hardcoded in the HTML, so check the live URL is known
  // to the script instead of grepping the page source for it.
  assert.match(optionsScript, /https:\/\/aistudio\.google\.com\/apikey/i);
  assert.match(optionsPage, /id="aiProviderSelect"/);
  assert.doesNotMatch(optionsPage, /id="(?:provider|aiBaseUrl|supadataApiKey)"/);
  assert.match(optionsPage, /id="aiModel"/);
  const detailsTag = optionsPage.match(
    /<details\b[^>]*class="card customization-card"[^>]*>/,
  );
  assert.ok(detailsTag, "Expected a native Local remix details disclosure");
  assert.doesNotMatch(detailsTag[0], /\sopen(?:\s|=|>)/i);
  assert.match(
    optionsPage,
    /<summary class="customization-summary">[\s\S]*Want to use another AI provider\?[\s\S]*Edit and copy a safe prompt for your coding agent[\s\S]*<\/summary>/,
  );
  assert.match(
    optionsPage,
    /class="customization-steps"[\s\S]*Open the extracted DeepWatch project folder in your coding[\s\S]*Never include API keys[\s\S]*<\/ol>/,
  );
  assert.match(
    optionsPage,
    /class="prompt-reminder"[\s\S]*Before copying, replace \[PROVIDER\]/,
  );
  assert.doesNotMatch(optionsPage, /~\/Documents\/youtube-digest/);
  assert.doesNotMatch(optionsPage, /%USERPROFILE%\\Documents\\youtube-digest/);
  assert.match(optionsPage, /id="copyCustomizationPromptBtn"/);
  assert.match(optionsStyles, /\.customization-summary:hover\s*\{/);
  assert.match(optionsStyles, /\.customization-summary:focus-visible\s*\{/);
  assert.match(optionsStyles, /\.data-card\s*\{[^}]*margin-top:\s*36px;/);
  assert.match(optionsScript, /clipboard\.writeText/);
  assert.match(optionsScript, /Edited prompt copied\./);

  const customizationPrompt = "Customize this local DeepWatch workspace to use [PROVIDER] instead of Gemini. The model name is already a separate setting in the Settings page (aiModel in settings.js); keep that working, just point it at [PROVIDER]'s model naming instead. Work only in the current workspace. Before editing, verify that it contains manifest.json and that the manifest name is DeepWatch. If verification fails, stop and ask me to open the extracted DeepWatch project folder in my coding agent. Do not search other folders, edit a guessed copy, assume an installation path, or claim Chrome can reveal the absolute OS source path. Update the provider's API endpoint, request format, and minimum Chrome host permissions. Preserve bring-your-own-key and local Chrome storage. Never put API keys in source code, commits, logs, screenshots, this prompt, or chat; after the code is ready, tell me where to enter the key myself. Keep Gemini-only request fields and retry behavior isolated to Gemini. Handle provider-specific rules separately so one provider does not affect another. Update README.md, README.zh-CN.md, PRIVACY.md, SECURITY.md, and tests. Run npm test, npm run check, and npm run package. Then explain how to reload the unpacked extension and test it on a real video.";
  assert.ok(optionsPage.includes(`>${customizationPrompt}</textarea>`));
  assert.doesNotMatch(customizationPrompt, /Documents|USERPROFILE/);

  assert.match(readme, /^## Remix it with your coding agent$/m);
  assert.match(readme, /more translation languages/i);
  assert.match(readme, /customized summary templates/i);
  assert.match(readme, /vocabulary notebook/i);
  assert.match(
    readme,
    /open the exact DeepWatch project folder that Chrome loaded through \*\*Load unpacked\*\* in your coding agent/,
  );
  assert.match(
    chineseReadme,
    /先在编程 Agent 中打开 Chrome 通过「加载已解压的扩展程序」使用的那个准确的 DeepWatch 项目文件夹/,
  );

  assert.match(readme, /^## Set up an AI provider \(optional\)$/m);
  assert.match(readme, /Google Gemini.*\(the default\)/i);
  assert.match(readme, /OpenAI/);
  assert.match(readme, /Anthropic Claude/);
  assert.match(readme, /DeepSeek/);
  assert.match(readme, /OpenRouter/);
  assert.match(readme, /Ollama/);
  assert.match(readme, /Custom/);
});

test("product UI contains no emoji or emoji-like pictographs", () => {
  const productUi = [
    read("sidepanel.html"),
    read("sidepanel.js"),
    read("content.js"),
    read("options.html"),
    read("options.js"),
  ].join("\n");

  assert.doesNotMatch(
    productUi,
    /\p{Extended_Pictographic}|[✓✕⧉▶]/u,
  );
  assert.doesNotMatch(productUi, /&#(?:9655|9888);/);
});

test("selection actions use two equal edge-to-edge hover areas", () => {
  const css = read("sidepanel.css");

  assert.match(
    css,
    /\.explain-tooltip\s*\{[^}]*padding:\s*0;[^}]*overflow:\s*hidden;/,
  );
  assert.match(
    css,
    /\.explain-btn,\s*\.selection-note-btn\s*\{[^}]*flex:\s*1 1 50%;[^}]*border-radius:\s*0;/,
  );
  assert.match(
    css,
    /\.explain-tooltip\s*\{[^}]*animation:\s*selectionToolbarIn/,
  );
  assert.match(
    css,
    /@keyframes selectionToolbarIn\s*\{[\s\S]*transform:\s*translate\(-50%, 4px\);[\s\S]*transform:\s*translate\(-50%, 0\);/,
  );
});

test("note delete is an accessible SVG action at the end of the action row", () => {
  const js = read("sidepanel.js");
  const css = read("sidepanel.css");

  assert.match(
    js,
    /<div class="note-actions">[\s\S]*class="[^"]*note-play[^"]*"[\s\S]*class="note-delete"[\s\S]*aria-label="Delete note"[\s\S]*<svg viewBox="0 0 24 24" aria-hidden="true">/,
  );
  assert.doesNotMatch(js, /class="note-delete"[^>]*>Delete<\/button>/);
  assert.match(
    css,
    /\.note-delete\s*\{[^}]*place-items:\s*center;[^}]*margin-left:\s*auto;/,
  );
  assert.match(css, /\.note-delete:focus-visible\s*\{[^}]*outline:/);
});

test("notes filters preserve selected contrast and expose pressed state", () => {
  const html = read("sidepanel.html");
  const css = read("sidepanel.css");
  const js = read("sidepanel.js");

  assert.match(
    html,
    /id="notesFilterThis"[\s\S]*?aria-pressed="true"[\s\S]*?>[\s\S]*?This Video/,
  );
  assert.match(
    html,
    /id="notesFilterAll"[\s\S]*?aria-pressed="false"[\s\S]*?>[\s\S]*?All Notes/,
  );
  assert.match(
    css,
    /\.notes-filter \.enhance-btn\.active:hover:not\(:disabled\)\s*\{[^}]*background:\s*var\(--accent-hover\);[^}]*color:\s*white;/,
  );
  assert.match(
    css,
    /\.notes-filter \.enhance-btn:hover:not\(:disabled\)\s*\{[^}]*background:\s*transparent;[^}]*color:\s*var\(--text-secondary\);/,
  );
  assert.match(css, /\.notes-filter \.enhance-btn:focus-visible\s*\{[^}]*outline:/);
  assert.match(js, /setNotesFilter\(false\)/);
  assert.match(js, /setNotesFilter\(true\)/);
  assert.match(js, /setAttribute\("aria-pressed", String\(!showAll\)\)/);
  assert.match(js, /setAttribute\("aria-pressed", String\(showAll\)\)/);
});

test("runtime has no source-file credential dependency or retired model", () => {
  const runtime = [
    "background.js",
    "content.js",
    "sidepanel.js",
    "options.js",
    "settings.js",
  ]
    .map(read)
    .join("\n");

  assert.doesNotMatch(runtime, /\bCONFIG\./);
  assert.doesNotMatch(runtime, /importScripts\(["']config\.js/);
  // DeepSeek is a legitimate provider choice again (see settings.js's
  // PROVIDER_PRESETS) — only Supadata (the removed transcript service) and
  // the retired deepseek-only chat/completions URL builder stay banned.
  assert.doesNotMatch(runtime, /supadata/i);
  assert.doesNotMatch(runtime, /chatCompletionsUrl/);
  assert.match(runtime, /gemini-3\.5-flash-lite/);
  assert.match(runtime, /deepseek-chat/);
});

test("a missing Gemini key is optional, never a precondition for Transcript or Notes", () => {
  const sidepanelSource = read("sidepanel.js");
  const optionsSource = read("options.js");
  const backgroundSource = read("background.js");

  // Startup must never gate the whole panel on whether a key is configured
  // — it used to call checkConfig and bail out to a full-screen error
  // before Transcript or Notes ever got a chance to load. (hasAiKey itself
  // is fine elsewhere — e.g. the Chat tab's non-blocking "add a key" hint —
  // just not gating DOMContentLoaded.)
  const startupHandlerMatch = sidepanelSource.match(
    /document\.addEventListener\("DOMContentLoaded",[\s\S]{0,600}?\n\}\);/,
  );
  assert.ok(startupHandlerMatch, "Expected to find the DOMContentLoaded handler");
  assert.doesNotMatch(startupHandlerMatch[0], /hasAiKey/);
  assert.doesNotMatch(startupHandlerMatch[0], /showConfigError/);
  assert.match(startupHandlerMatch[0], /await checkCurrentTab\(\);/);
  assert.doesNotMatch(sidepanelSource, /function showConfigError/);

  // Saving Settings must accept an empty key (opting out of AI features)
  // rather than refusing to save until one is entered.
  assert.doesNotMatch(optionsSource, /addGeminiKey/);
  assert.match(
    optionsSource,
    /async function saveSettings\(event\) \{[\s\S]{0,1400}await storage\.set/,
  );

  // Reading, deleting, or fetching a transcript must never depend on an AI
  // key — only note *cleanup* (an optional polish step, see the
  // cleanupNoteText test in translation.test.js) may check for one, and it
  // degrades instead of failing.
  for (const fn of ["handleGetNotes", "handleDeleteNote", "handleFetchTranscript"]) {
    const match = backgroundSource.match(
      new RegExp(`\\nasync function ${fn}\\([\\s\\S]*?\\n\\}\\n`),
    );
    assert.ok(match, `Expected to find ${fn}`);
    assert.doesNotMatch(match[0], /aiApiKey/);
  }
});

test("background reconciles side-panel state after navigation commits", () => {
  const background = read("background.js");

  assert.match(
    background,
    /function getNavigationUrl\(changeInfo, tab\)[\s\S]*changeInfo\.status !== "loading"[\s\S]*changeInfo\.status !== "complete"[\s\S]*tab\.pendingUrl \|\| tab\.url/,
  );
  assert.match(
    background,
    /chrome\.tabs\.onUpdated\.addListener\(\(tabId, changeInfo, tab\)[\s\S]*getNavigationUrl\(changeInfo, tab\)[\s\S]*updatePanelForTab\(tabId, url, tab\.windowId\)/,
  );
  assert.match(
    background,
    /function closePanelForTab\(tabId, windowId\)[\s\S]*chrome\.sidePanel\.close\(\{ tabId \}\)[\s\S]*chrome\.sidePanel\.close\(\{ windowId \}\)/,
  );
  assert.match(
    background,
    /await closePanelForTab\(tabId, windowId\);[\s\S]*setOptions\(\{ tabId, enabled: false \}\)/,
  );
});

test("retired Remix and reader files are absent", () => {
  for (const file of [
    "reader.html",
    "reader.js",
    "remix-prompts.js",
    "config.example.js",
  ]) {
    assert.equal(fs.existsSync(path.join(root, file)), false, file);
  }
});

test("published prompt files contain runtime sections", () => {
  const expectedSections = {
    "prompts/analysis.md": ["System prompt", "User prompt"],
    "prompts/explain.md": ["System prompt", "User prompt"],
    "prompts/note-cleanup.md": ["System prompt", "User prompt"],
    "prompts/translation.md": [
      "Shared base rules",
      "Chinese rules",
      "Transcript batch translation",
    ],
  };

  for (const [file, sections] of Object.entries(expectedSections)) {
    const markdown = read(file);
    for (const section of sections) {
      assert.match(markdown, new RegExp(`^## ${section}$`, "m"));
    }
  }
});
