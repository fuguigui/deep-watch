# DeepWatch

[English](README.md) | [简体中文](README.zh-CN.md)

Turn every video into a resource for deep learning. DeepWatch brings transcripts, bilingual translation, AI overviews, explanations, timestamped notes, and a video-aware chat into one Chrome side panel, so you can study ideas and language without losing your place.

- Turn captions into a readable, searchable learning resource, fetched free and directly from the video's own page (no third-party transcript service, no transcript API key).
- Learn languages with the original transcript, a Simplified Chinese translation, or an aligned bilingual view.
- Build understanding with an AI overview, chapters, key quotes, and selected-text explanations.
- Ask a video-aware chat about anything you select in the transcript, or ask it freely, with word-level click-to-seek and live highlighting as the video plays.
- Navigate long videos by clicking timestamps in the transcript, overview, notes, or chat subtitle view.
- Save polished timestamped notes for later study, and export your chat history per video.
- Keep control of your data with your own Gemini API key, local Chrome storage, and no analytics or telemetry.

DeepWatch is a bring-your-own-key project installed locally from GitHub. It is not available through the Chrome Web Store, does not include API credits, and does not run a developer-operated server.

## Install with your coding agent

You do not need to understand the code or use the command line. Send this message to your coding agent:

> Download or clone this project into a permanent folder I choose, tell me its exact full path, and use that same folder for Chrome's Load unpacked step. If I need a suggestion during this first installation, offer `~/Documents/deep-watch` on macOS or Linux, or `%USERPROFILE%\Documents\deep-watch` on Windows, but do not assume either path. Walk me through installation and setup in simple terms.

Your agent should:

1. Ask where you want to keep the project, download or clone it there, and tell you the exact full path. If you want a suggestion, it can offer `~/Documents/deep-watch` on macOS or Linux, or `%USERPROFILE%\Documents\deep-watch` on Windows.
2. Open the official Google AI Studio page below and help you create your own Gemini API key.
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

## Set up your Gemini API key

DeepWatch needs one key, under your own Google account, for overviews, explanations, translation, note polishing, and chat.

1. Open the official [Google AI Studio API keys page](https://aistudio.google.com/apikey).
2. Sign in with your Google account and create an API key.
3. Copy the key and paste it into **Gemini API key** in DeepWatch Settings.
4. Optionally change **Gemini model** in Settings if you want a different model than the fast, low-cost default; see the [list of available Gemini models](https://ai.google.dev/gemini-api/docs/models).
5. If Google reports a quota or billing issue, check your usage and limits in Google AI Studio and try again.

Open **Settings** from the side panel. You can also open the DeepWatch **Options** page from its card at `chrome://extensions` or by right-clicking its toolbar icon. Paste your key only into this Settings field. Never paste a key into an AI chat, repository file, screenshot, or public message.

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
- Google Gemini for all AI features, with the model configurable in Settings.

Shorts, live streams, private or access-restricted videos, and videos without an available native transcript may not work. Firefox, Safari, mobile browsers, and other Chromium browsers are not currently tested or supported.

## How transcript fetching works

DeepWatch reads the transcript straight from the video's own page: the video player already lists every caption track it has available (language, and where to fetch it) as soon as it loads, whether or not captions are turned on. DeepWatch reads that list and fetches the track itself, for free, with no transcript API key and no third-party transcript service. See `transcript/youtube.js` for the implementation, and its comments for how this differs from watching the network for a caption request the player happens to make on its own.

Each supported site gets its own adapter file with the same shape, so support for another video site can be added without changing how the rest of the extension consumes a transcript.

## Gemini pricing

DeepWatch does not collect payments or resell access; your Gemini usage is billed directly by Google under your own account. Check the official [Gemini API pricing page](https://ai.google.dev/gemini-api/docs/pricing) for current rates for the model you choose in Settings, and set a spending limit in Google AI Studio if you want one.

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

If you want another AI provider or model, first open the exact DeepWatch project folder that Chrome loaded through **Load unpacked** in your coding agent. Then open DeepWatch Settings and use **Copy edited prompt** under **Local remix**. Replace the `[PROVIDER]` placeholder before sending it. Do not include any API key in the prompt or chat. After the agent updates your local copy, enter the key yourself in the Settings field it identifies.

## Privacy and data flow

DeepWatch makes provider requests directly from the extension:

1. It reads the caption track list from the video player already open in your tab, and fetches the transcript directly from the video site.
2. It sends the transcript and relevant video metadata to Gemini when you request AI features.
3. Focused features send only the content they need, such as selected text with context, small transcript batches for translation, or your chat messages.
4. It stores your key, settings, notes, chat history, and recent cache entries locally in Chrome.

There is no DeepWatch account system, advertising, analytics, or telemetry. Google still receives data under its own terms and privacy policy. See [PRIVACY.md](PRIVACY.md) for details.

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

- Confirm the video actually has captions (native or auto-generated) turned on as an option in YouTube's own player; DeepWatch reads whatever caption tracks the player itself lists.
- Reload the video tab, then reopen the side panel, since the transcript is read from the page's current state.
- Shorts, live streams, and access-restricted videos may not expose a caption track this way.
