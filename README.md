# DeepWatch

[English](README.md) | [简体中文](README.zh-CN.md)

Turn every video into a resource for deep learning. DeepWatch brings transcripts, bilingual translation, AI overviews, explanations, timestamped notes, and a video-aware chat into one Chrome side panel, so you can study ideas and language without losing your place.

- Turn captions into a readable, searchable learning resource, fetched free and directly from the video's own page (no third-party transcript service, no transcript API key).
- Learn languages with the original transcript, a Simplified Chinese translation, or an aligned bilingual view.
- Build understanding with an AI overview, chapters, key quotes, and selected-text explanations.
- Ask a video-aware chat about anything you select in the transcript, or ask it freely, with word-level click-to-seek and live highlighting as the video plays.
- Navigate long videos by clicking timestamps in the transcript, overview, notes, or chat subtitle view.
- Save polished timestamped notes for later study, and export your chat history per video.
- Keep control of your data with your own API key for whichever AI provider you choose, local Chrome storage, and no analytics or telemetry.

An API key is optional, not required: Transcript and Notes work fully without one. Only the AI features (Overview, translation, Explain, Chat) need a key, and each one just says so and points you at Settings if you try it without one. Settings supports Google Gemini (the default), OpenAI, Anthropic Claude, DeepSeek, OpenRouter, a local Ollama server, or a custom endpoint you configure yourself with a small JSON snippet.

DeepWatch is a bring-your-own-key project installed locally from GitHub. It is not available through the Chrome Web Store, does not include API credits, and does not run a developer-operated server.

DeepWatch is a fork and remix of [zarazhangrui/youtube-digest](https://github.com/zarazhangrui/youtube-digest); most of its functionality comes directly from that project. See [Credits](#credits) below for what changed.

## Install with your coding agent

You do not need to understand the code or use the command line. Send this message to your coding agent:

> Download or clone this project into a permanent folder I choose, tell me its exact full path, and use that same folder for Chrome's Load unpacked step. If I need a suggestion during this first installation, offer `~/Documents/deep-watch` on macOS or Linux, or `%USERPROFILE%\Documents\deep-watch` on Windows, but do not assume either path. Walk me through installation and setup in simple terms.

Your agent should:

1. Ask where you want to keep the project, download or clone it there, and tell you the exact full path. If you want a suggestion, it can offer `~/Documents/deep-watch` on macOS or Linux, or `%USERPROFILE%\Documents\deep-watch` on Windows.
2. Help you create an API key for the AI provider you want to use (Google AI Studio for the default, Gemini, or another provider's own site).
3. Walk you through selecting the exact project folder you chose in Chrome with **Load unpacked**.
4. Show you where to enter your API key in the extension's **Settings** page.
5. Open a video with captions and confirm the transcript and translation work.

Keep this folder in the same place after installation. If you move or delete it, Chrome's unpacked extension stops working until you load the extension again from its new permanent folder.

Never paste an API key into an AI chat, source file, screenshot, or public message. Enter your key yourself, directly in the DeepWatch Settings page. Your coding agent can point to the correct field without seeing the key.

## Install manually

If you prefer to do it yourself:

1. Open this project's GitHub page.
2. Choose **Code**, then **Download ZIP**.
3. Choose a permanent folder and unzip the project there. Optional suggestions are `~/Documents/deep-watch` on macOS or Linux, or `%USERPROFILE%\Documents\deep-watch` on Windows. You may use a different folder.
4. In Chrome, open `chrome://extensions`.
5. Turn on **Developer mode**.
6. Click **Load unpacked**.
7. Select the exact project folder you chose, which must contain `manifest.json`.
8. Pin DeepWatch from Chrome's Extensions menu if you want quick access.

Because this is an unpacked extension, it does not update automatically. After downloading an update or changing local files, click **Reload** on the DeepWatch card at `chrome://extensions`, then refresh open video tabs. Moving or deleting the source folder breaks the unpacked extension until you load it again from the new location.

## Set up an AI provider (optional)

This step is optional. Transcript and Notes work fully without a key. DeepWatch only needs one for the AI features: overviews, explanations, translation, note polishing, and chat.

Open **Settings** from the side panel (you can also open it from the DeepWatch card at `chrome://extensions`, or by right-clicking its toolbar icon), pick a **Provider**, and paste in a key:

- **Google Gemini** (the default): create a key at [Google AI Studio](https://aistudio.google.com/apikey). Change **Model** in Settings for something other than the fast, low-cost default; see the [list of available Gemini models](https://ai.google.dev/gemini-api/docs/models).
- **OpenAI**: create a key at [platform.openai.com](https://platform.openai.com/api-keys).
- **Anthropic Claude**: create a key at [console.anthropic.com](https://console.anthropic.com/settings/keys).
- **DeepSeek**: create a key at [platform.deepseek.com](https://platform.deepseek.com/api_keys).
- **OpenRouter**: create a key at [openrouter.ai/keys](https://openrouter.ai/keys); this one endpoint can reach many other providers' models.
- **Ollama (local)**: run your own [Ollama](https://ollama.com) server; no key needed for a default local setup.
- **Custom**: for anything else (Azure OpenAI, a self-hosted endpoint, a provider not listed above), paste a small JSON object with `url`, `model`, and optionally `apiKey`, `headers`, and `format` (`"openai"`, `"anthropic"`, or `"gemini"`). Saving may prompt Chrome to grant access to that URL, which is expected for a new endpoint.

Paste a key only into the Settings field for it. Never paste a key into an AI chat, repository file, screenshot, or public message.

Keys and settings are stored in Chrome's local extension storage on your device.

## Use DeepWatch

1. Open a standard video page with captions.
2. Click the DeepWatch extension icon, or the **Digest** button next to the video's own Share/Save buttons, to open the side panel.
3. Read the timestamped transcript, or choose **Original**, **中文**, or **双语**.
4. Open **Overview** when you want AI-generated chapters and key quotes.
5. Select transcript text when you want an AI explanation.
6. Move your mouse over the video and click **Note**, or press **n** while the video is focused, to save a timestamped note; revisit it from **Notes**.
7. Open **Chat** to select a word or phrase from the transcript for a quick explanation, or ask it anything about the video freely. Click any word to jump the video there, and watch the current word highlight as it plays. Export your conversation as JSON from the Chat tab when you want to keep it.

## What works today

- Google Chrome 116 or newer, using the Side Panel API.
- Standard YouTube `youtube.com/watch` video pages.
- Native subtitle tracks already listed by the video player. DeepWatch prefers English when available, but may show another native language.
- Original, Simplified Chinese, and aligned bilingual transcript views.
- AI overviews, selected-text explanations, translation, automatic note polishing, and video-aware chat.
- Local notes, local chat history per video, and a local cache for recent transcript and digest results.
- Your choice of AI provider (Gemini, OpenAI, Anthropic, DeepSeek, OpenRouter, Ollama, or a custom endpoint) for all AI features, with the model configurable in Settings.

Shorts, live streams, private or access-restricted videos, and videos without an available native transcript may not work. Firefox, Safari, mobile browsers, and other Chromium browsers are not currently tested or supported.

## How transcript fetching works

DeepWatch reads the transcript straight from the video's own page: the video player already lists every caption track it has available (language, and where to fetch it) as soon as it loads, whether or not captions are turned on. DeepWatch reads that list and fetches the track itself, for free, with no transcript API key and no third-party transcript service. See `transcript/youtube.js` for the implementation, and its comments for how this differs from watching the network for a caption request the player happens to make on its own.

Each supported site gets its own adapter file with the same shape, so support for another video site can be added without changing how the rest of the extension consumes a transcript.

## AI provider pricing

DeepWatch does not collect payments or resell access; your usage is billed directly by whichever provider you choose, under your own account there. Check that provider's own pricing page for current rates for the model you choose in Settings (for example, the [Gemini API pricing page](https://ai.google.dev/gemini-api/docs/pricing) for the default provider), and set a spending limit with that provider if it offers one. A local Ollama server has no usage cost beyond your own hardware.

## Remix it with your coding agent

This is a personal remix project. Upstream issues and pull requests are not accepted. If something breaks or you want a new feature, download or fork your own copy and ask your coding agent to fix, remix, or personalize it for you.

DeepWatch uses plain HTML, CSS, and JavaScript with no build step, so it is a friendly starting point for agent-assisted projects. Ideas to try:

- Add another video site's transcript adapter alongside `transcript/youtube.js`.
- Add more translation languages and let each person choose a learning language.
- Create customized summary templates for lectures, interviews, tutorials, reviews, or research talks.
- Build a vocabulary notebook that saves a word, its sentence, meaning, and video timestamp.
- Export notes and vocabulary to Markdown, CSV, Anki, or another study tool.
- Add personal topic filters that highlight the chapters most relevant to a goal.
- Add optional local-model support for a different privacy and cost tradeoff.
- Improve accessibility with keyboard navigation, font controls, and higher-contrast themes.

Settings already covers several providers directly, plus a **Custom** option for anything else that speaks an OpenAI-, Anthropic-, or Gemini-shaped API; try that first. For something genuinely different (a new request/response shape, a provider-specific quirk to work around), open the exact DeepWatch project folder that Chrome loaded through **Load unpacked** in your coding agent, then open DeepWatch Settings and use **Copy edited prompt** under **Local remix**. Replace the `[PROVIDER]` placeholder before sending it. Do not include any API key in the prompt or chat. After the agent updates your local copy, enter the key yourself in the Settings field it identifies.

## Credits

DeepWatch is a fork and remix of [zarazhangrui/youtube-digest](https://github.com/zarazhangrui/youtube-digest), MIT-licensed by Zara Zhang (see [LICENSE](LICENSE)). Most of DeepWatch's functionality, UI, and overall structure comes directly from that project: the Digest button, the Note button and its "n" keyboard shortcut, the Transcript/Overview/Notes tabs, the Original/Chinese/bilingual display modes, and the release tooling and test suite this fork builds on.

This fork changes several things:

- Transcript fetching no longer uses the Supadata API; it reads the transcript directly from the video's own page instead, at no cost and with no transcript API key (see `transcript/youtube.js`).
- The AI provider is no longer fixed to one service. Settings now offers Gemini (the default), OpenAI, Anthropic Claude, DeepSeek, OpenRouter, a local Ollama server, or a custom endpoint, each with its own request/response handling in `background.js`.
- A Chat tab was added: a word-clickable subtitle view with click-to-seek and live highlighting, a per-video conversation, and JSON export.
- Notes gained an editable, clearly-marked space for your own writing underneath the (unchanged) transcript excerpt, grouping by video, a one-click Markdown export, and a standalone full-page view (`notes.html`).
- An API key of any kind is optional, not a precondition: Transcript and Notes work fully without one.

Upstream (youtube-digest) does not accept issues or pull requests for this fork; if something here breaks, download your own copy and ask your coding agent to fix it, the same way youtube-digest's own README recommends.

## Privacy and data flow

DeepWatch makes provider requests directly from the extension:

1. It reads the caption track list from the video player already open in your tab, and fetches the transcript directly from the video site.
2. It sends the transcript and relevant video metadata to your chosen AI provider when you request AI features.
3. Focused features send only the content they need, such as selected text with context, small transcript batches for translation, or your chat messages.
4. It stores your key, settings, notes, chat history, and recent cache entries locally in Chrome.

There is no DeepWatch account system, advertising, analytics, or telemetry. Your chosen AI provider still receives data under its own terms and privacy policy. See [PRIVACY.md](PRIVACY.md) for details.

## Troubleshooting

### The Digest button is missing on a video

- At `chrome://extensions`, find DeepWatch and click **Reload**, then refresh the video tab.
- Confirm that you are on a standard `https://www.youtube.com/watch?...` page, not a Short, embed, or live page.
- The current version automatically follows YouTube when its responsive action bar changes. Wait a moment after the page finishes loading.
- If it is still missing, ask your coding agent to inspect the content script on that exact video page.

### The side panel does not open

- Confirm that you are on a standard `https://www.youtube.com/watch?...` page.
- At `chrome://extensions`, confirm DeepWatch is enabled and click **Reload**.
- Refresh the video tab after reloading the extension.
- Ask your coding agent to inspect the extension if the problem continues.

### No transcript found

- Confirm the video actually has a transcript by clicking YouTube's own **Show transcript** button (under the video description, or in the "..." menu). DeepWatch reads exactly what that panel shows, so if it spins forever or comes up empty there too, that is YouTube's transcript feature failing for that video in your browser, not something DeepWatch can work around. It usually isn't every video; try a couple of others to compare.
- Reload the video tab, then reopen the side panel, since the transcript is read from the page's current state.
- Shorts, live streams, and access-restricted videos may not expose a transcript this way.
