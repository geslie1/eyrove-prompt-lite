import { DEFAULT_SETTINGS, SETTINGS_KEY, endpointOriginPattern, normalizeSettings } from './core.js';

const form = document.getElementById('form');
const endpoint = document.getElementById('endpoint');
const model = document.getElementById('model');
const apiKey = document.getElementById('apiKey');
const locale = document.getElementById('locale');
const status = document.getElementById('status');

async function initialize() {
  const state = await chrome.storage.local.get(SETTINGS_KEY);
  const settings = normalizeSettings({ ...DEFAULT_SETTINGS, ...(state[SETTINGS_KEY] || {}) });
  endpoint.value = settings.endpoint;
  model.value = settings.model;
  apiKey.value = settings.apiKey;
  locale.value = settings.locale;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  status.textContent = '';
  try {
    const settings = normalizeSettings({ endpoint: endpoint.value, model: model.value, apiKey: apiKey.value, locale: locale.value });
    const origin = endpointOriginPattern(settings.endpoint);
    const granted = await chrome.permissions.request({ origins: [origin] });
    if (!granted) throw new Error('Endpoint permission was not granted.');
    await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
    status.textContent = 'Saved. The API key remains in Chrome local storage.';
  } catch (error) {
    status.textContent = String(error?.message || error);
  }
});

initialize();
