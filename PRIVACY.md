# Privacy

EYROVE Prompt Lite has no EYROVE account, analytics, telemetry, advertising, payment or image-generation integration.

## Data stored locally

- the endpoint, model, interface language and API key configured by the user;
- up to 30 recent basic analysis results and their local image previews.

These values are stored in `chrome.storage.local`. Removing the extension clears this extension-owned storage according to Chrome behavior.

## Data sent over the network

When the user starts analysis or translation, Lite sends the relevant image or prompt and the configured API key only to the exact OpenAI-compatible endpoint configured by that user. Endpoint access is requested at runtime and is not granted by default.

Lite does not send images, prompts, API keys or browsing history to EYROVE. Color palette extraction runs locally. The extension does not load executable code from remote servers.

Users are responsible for reviewing the privacy policy and terms of their chosen endpoint provider before sending data.

