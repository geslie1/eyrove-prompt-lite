# EYROVE Prompt Lite

EYROVE Prompt Lite is an open-source BYOK Chrome extension for turning images into clear, reusable prompt insights. Bring your own OpenAI-compatible vision endpoint, analyze images in a focused workflow, and keep your settings and recent results in Chrome.

[Experience the released version](https://eyrove.com/en/eyrove-prompt#install) · [Download v0.1.0](https://github.com/geslie1/eyrove-prompt-lite/releases/download/v0.1.0/eyrove-prompt-lite-chrome.zip) · [View releases](https://github.com/geslie1/eyrove-prompt-lite/releases) · [Explore EYROVE Prompt Pro](https://eyrove.com/en/eyrove-prompt)

## Features

- **Image-to-prompt analysis** — upload, drag, paste, or select an image from the browser context menu.
- **Structured prompt insights** — receive a concise summary, visual style tags, a suggested aspect ratio, and a reusable image-generation prompt.
- **Local color palette** — extract a deterministic palette directly in the popup for uploaded images.
- **Translation for reading** — view the prompt in English, Simplified Chinese, Japanese, Korean, German, French, or Spanish while keeping the original prompt intact.
- **Local history** — revisit up to 30 recent results stored in Chrome.
- **Flexible BYOK setup** — connect an OpenAI-compatible Chat Completions endpoint and choose your own vision-capable model.
- **Direct data flow** — analysis and translation requests go directly to the endpoint you configure.
- **Installable Krea2 Skill** — turn an uploaded reference image into one detailed, 500+ word Krea2-ready English prompt.

## Try the released version

Open the [EYROVE Prompt experience page](https://eyrove.com/en/eyrove-prompt#install) to view the current product experience and installation entry.

To install the latest published build:

1. [Download EYROVE Prompt Lite v0.1.0](https://github.com/geslie1/eyrove-prompt-lite/releases/download/v0.1.0/eyrove-prompt-lite-chrome.zip).
2. Unzip the downloaded package.
3. Open `chrome://extensions` and enable **Developer mode**.
4. Select **Load unpacked** and choose the extracted `eyrove-prompt-lite` directory.
5. Open **Options** and configure your endpoint, vision model, API key, and interface language.

## How it works

1. Configure your BYOK endpoint and model in **Options**.
2. Add an image by uploading, dragging, pasting, or using the image context menu.
3. Select **Reverse prompt** to create the structured result.
4. Copy the original prompt, view a translation, inspect the local palette, or reopen a result from local history.

The extension requests access to the configured endpoint origin when you save the settings. Your API key is stored in `chrome.storage.local` and is sent directly to that endpoint when you start analysis or translation.

## Development

1. Clone this repository.
2. Open `chrome://extensions` and enable **Developer mode**.
3. Select **Load unpacked** and choose the repository directory.
4. Configure the extension from **Options**.

Run the automated checks with:

```bash
npm test
```

## Install the Krea2 image-to-prompt Skill

This repository includes the [`krea2-image-to-prompt`](skills/krea2-image-to-prompt/SKILL.md) Skill. Install it automatically into the detected compatible agent environment with:

```bash
npx skills add geslie1/eyrove-prompt-lite --skill krea2-image-to-prompt -y
```

To inspect the available Skills before installing:

```bash
npx skills add geslie1/eyrove-prompt-lite --list
```

After installation, upload a reference image and invoke `$krea2-image-to-prompt`. The Skill returns one English Krea2 prompt of at least 500 words, with no analysis or parameter recommendations around it.

## Privacy and security

- Color palette extraction runs locally in the popup.
- Settings and up to 30 recent results remain in `chrome.storage.local`.
- Endpoint access is requested at runtime for the origin selected by the user.
- Images, prompts, and the API key are sent directly to the configured endpoint for the requested operation.

Read [PRIVACY.md](PRIVACY.md) for the complete data-flow description and [SECURITY.md](SECURITY.md) before reporting a vulnerability. Never include API keys, personal images, provider responses, or browsing data in public issues.

## License

The source is available under the [Apache License 2.0](LICENSE). The EYROVE names and visual identity remain subject to [TRADEMARK.md](TRADEMARK.md).
