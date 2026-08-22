# EYROVE Prompt Lite

EYROVE Prompt Lite is the deliberately limited, open-source BYOK edition of EYROVE Prompt.

[Source repository](https://github.com/geslie1/eyrove-prompt-lite) · [Product page](https://eyrove.com/en/eyrove-prompt) · [Pro edition](https://eyrove.com/en/eyrove-prompt#install)

It provides:

- one fixed basic image-to-prompt contract;
- a deterministic color palette calculated locally in the popup;
- translation into the selected interface language for reading only;
- local history stored in Chrome.

It deliberately does not provide advanced analysis dimensions, Standard/High Precision tiers, EYROVE accounts or points, image generation, model comparison, saving, publishing, or private provider fallback.

## Install for development

1. Open `chrome://extensions` and enable Developer mode.
2. Select **Load unpacked**.
3. Choose this directory.
4. Open Options and enter an OpenAI-compatible Chat Completions endpoint, a vision-capable model and your API key.

The extension requests access only to the configured endpoint origin when you save the settings. The key stays in Chrome local storage and is sent only to that endpoint.

## Data flow

- Images, prompts and the API key are sent only to the endpoint explicitly configured by the user.
- The color palette is calculated locally in the popup.
- Settings and up to 30 recent results remain in `chrome.storage.local`.
- Lite does not call EYROVE APIs, include analytics, load remote code or provide provider fallback.

## Security

Read [SECURITY.md](SECURITY.md) before reporting a vulnerability. Never include API keys in issues, screenshots or logs.

## Pro edition

EYROVE Prompt Pro uses a private asynchronous EYROVE reverse API and adds advanced analysis, account billing, generation and creation workflows. The Pro implementation and its private instructions are not part of this repository export.

## License

The source is available under the [Apache License 2.0](LICENSE). The EYROVE names and visual identity remain subject to [TRADEMARK.md](TRADEMARK.md).
