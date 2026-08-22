import {
  BASIC_REVERSE_INSTRUCTION,
  DEFAULT_SETTINGS,
  PENDING_IMAGE_KEY,
  SETTINGS_KEY,
  normalizeReverseResult,
  normalizeSettings,
  parseProviderJson
} from './core.js';

const menuId = 'eyrove-prompt-lite-reverse';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({ id: menuId, title: 'EYROVE Prompt Lite · Reverse prompt', contexts: ['image'] });
  });
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== menuId || !info.srcUrl) return;
  await chrome.storage.local.set({
    [PENDING_IMAGE_KEY]: {
      imageUrl: String(info.srcUrl),
      pageUrl: String(info.pageUrl || ''),
      createdAt: Date.now()
    }
  });
  await chrome.action.openPopup().catch(() => undefined);
});

async function settings() {
  const state = await chrome.storage.local.get(SETTINGS_KEY);
  return normalizeSettings({ ...DEFAULT_SETTINGS, ...(state[SETTINGS_KEY] || {}) });
}

function providerError(payload, status) {
  const message = String(payload?.error?.message || payload?.message || `Provider request failed (${status}).`).slice(0, 500);
  const error = new Error(message);
  error.status = status;
  return error;
}

async function callProvider(messages, { json = false } = {}) {
  const config = await settings();
  if (!config.endpoint || !config.model || !config.apiKey) throw new Error('Configure endpoint, model and API key first.');
  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: 0.2,
      max_tokens: json ? 1400 : 2200,
      ...(json ? { response_format: { type: 'json_object' } } : {})
    })
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw providerError(payload, response.status);
  const content = payload?.choices?.[0]?.message?.content;
  if (Array.isArray(content)) return content.map((item) => item?.text || '').join('').trim();
  if (!String(content || '').trim()) throw new Error('The provider returned an empty response.');
  return String(content).trim();
}

async function reverseImage(payload) {
  const image = String(payload.dataUrl || payload.imageUrl || '').trim();
  if (!image) throw new Error('Choose an image first.');
  const content = await callProvider([
    { role: 'system', content: BASIC_REVERSE_INSTRUCTION },
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Create the basic reverse prompt JSON for this image.' },
        { type: 'image_url', image_url: { url: image } }
      ]
    }
  ], { json: true });
  return normalizeReverseResult(parseProviderJson(content));
}

async function translatePrompt(payload) {
  const text = String(payload.text || '').trim();
  const targetLocale = String(payload.targetLocale || 'en').trim();
  if (!text) throw new Error('No prompt to translate.');
  return callProvider([
    {
      role: 'system',
      content: `Translate the supplied image-generation prompt into ${targetLocale}. Preserve visual meaning, proper nouns, parameters and formatting. Return only the translation. This is a reading preview and must not modify the original prompt.`
    },
    { role: 'user', content: text }
  ]);
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const run = message?.type === 'LITE_REVERSE'
    ? reverseImage(message)
    : message?.type === 'LITE_TRANSLATE'
      ? translatePrompt(message)
      : null;
  if (!run) return undefined;
  Promise.resolve(run)
    .then((result) => sendResponse({ ok: true, result }))
    .catch((error) => sendResponse({ ok: false, error: String(error?.message || error).slice(0, 500) }));
  return true;
});
