# Privacy

Effective: September 19, 2026

DeepWatch is a GitHub-only, bring-your-own-key Chrome extension. It has no DeepWatch account, developer-operated backend, analytics, advertising, or telemetry.

## Data the extension handles

Depending on the feature you use, DeepWatch handles:

- the canonical URL and video ID of the active video;
- transcript text and timestamps, read directly from the video's own page;
- video metadata such as title, channel, description, and duration;
- text you select in the transcript and nearby transcript context;
- transcript context around a timestamped note;
- content you ask to translate;
- notes you save;
- chat conversations you have about a video, kept per video;
- your Gemini configuration, including your API key and chosen model; and
- cached transcript, digest, translation, and chat results.

## Where data goes

### The video's own page

DeepWatch reads the transcript directly from the video player already open in your tab (see the transcript adapter for the current site, e.g. `transcript/youtube.js`). No transcript request goes to a third-party transcript service; the only network request this step makes is to the video site itself, for the caption track it already lists as available.

### Google Gemini

DeepWatch sends AI feature content to Google's Gemini API at `https://generativelanguage.googleapis.com`:

- transcript plus relevant title, channel, description, or duration for an overview;
- selected text plus nearby transcript context for an explanation;
- small semantic transcript batches currently needed for progressive Chinese
  translation, or requested overview or explanation content;
- nearby transcript context and video metadata when polishing a saved note; and
- your chat messages and the video title, for the Chat tab's conversation.

The endpoint is fixed; you provide your own Gemini API key and choose the model in the Settings page (it defaults to a fast, low-cost model). To use another provider, you must adapt your own local source copy and its permissions. The Settings page provides a coding-agent prompt for that purpose and warns you never to include an API key in the prompt or chat.

Requests go directly from the extension to Gemini. They are authenticated with the key you supply. DeepWatch's developer does not proxy or receive these requests.

Google processes this data under its own terms, privacy policy, retention practices, and account settings. Do not send confidential, personal, or regulated content unless its terms and your obligations permit it.

## Local storage and retention

DeepWatch uses Chrome's local extension storage, not a DeepWatch cloud service.

- Your Gemini settings and API key remain on the device in Chrome's extension storage.
- Saved notes remain until you delete them or remove/clear the extension's data. The extension keeps up to 100 notes.
- Recent transcript, digest, and per-segment translation cache entries are stored
  locally. The cache is limited to 20 videos, and entries older than 30 days are
  removed when the side panel opens.
- Chat conversations are kept per video until you export them from the Chat tab, which clears them from local storage as part of the export.

Chrome extension storage is not a password vault. Anyone with sufficient access to your browser profile or device may be able to recover locally stored keys or content. Use a scoped key where Google supports one, set spending limits, and rotate or revoke a key if the device or browser profile is compromised.

To remove data:

- delete individual saved notes, or export and clear chat history, in DeepWatch;
- use the Options page to clear cached digests, delete all notes, or reset all extension data;
- remove the extension or clear its stored data from Chrome to delete all local settings, keys, notes, chat history, and cache entries; and
- revoke your key in Google AI Studio to stop its future use.

Clearing local data does not delete information already processed or retained by Google. Use Google's own controls for service-side requests.

## Permissions

DeepWatch uses Chrome permissions for these purposes:

- `sidePanel`: display the DeepWatch interface beside the video.
- `storage`: store settings, your key, notes, chat history, and cached results locally.
- `tabs`: identify and interact with the active video tab.
- `scripting`: read caption track information directly from the video player, and coordinate the extension's on-page controls.
- Video-site host access (currently `www.youtube.com`): read the active video's URL, metadata, and caption tracks, and provide timestamp controls.
- Gemini host access: provide AI overviews, explanations, translation, note polishing, and chat through Google's Gemini API.

DeepWatch does not use these permissions to monitor general browsing activity.

## No sale or advertising use

DeepWatch does not sell personal information, build advertising profiles, or share data with data brokers. It does not include analytics SDKs.

## Changes

Privacy-relevant changes will be documented in this file and in the repository history. Review updates before installing a new version.

## Questions

This repository does not provide a public support or issue channel. Review this policy, the source code, and Google's documentation before using the extension. For a vulnerability or accidental secret exposure, follow the private process in [SECURITY.md](SECURITY.md).
