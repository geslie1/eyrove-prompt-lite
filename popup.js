import {
  DEFAULT_SETTINGS,
  HISTORY_KEY,
  PENDING_IMAGE_KEY,
  SETTINGS_KEY,
  detectTextLocale,
  normalizeSettings,
  paletteFromPixels
} from './core.js';
import { translator } from './i18n.js';

const nodes = Object.fromEntries([...document.querySelectorAll('[id]')].map((node) => [node.id, node]));
let settings = { ...DEFAULT_SETTINGS };
let t = translator('en');
let imageSource = null;
let result = null;
let palette = [];

function applyCopy() {
  document.documentElement.lang = settings.locale;
  for (const [id, key] of Object.entries({
    subtitle:'subtitle', upload:'upload', drop:'drop', analyze:'analyze', resultTitle:'result',
    promptTitle:'prompt', copyPrompt:'copy', translate:'translate', translatedTitle:'translated',
    paletteTitle:'palette', historyTitle:'history', boundary:'noGeneration'
  })) nodes[id].textContent = t(key);
  nodes.settings.title = t('settings');
  renderHistory();
  updateTranslateState();
}

function setStatus(message = '') {
  nodes.status.textContent = message;
}

async function thumbnail(dataUrl) {
  if (!dataUrl?.startsWith('data:image/')) return '';
  const image = await loadImage(dataUrl);
  const scale = Math.min(1, 160 / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  canvas.getContext('2d', { alpha: false }).drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', .72);
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Unable to read image.'));
    image.src = source;
  });
}

async function calculatePalette(dataUrl) {
  if (!dataUrl?.startsWith('data:image/')) return [];
  const image = await loadImage(dataUrl);
  const scale = Math.min(1, 96 / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return paletteFromPixels(context.getImageData(0, 0, canvas.width, canvas.height).data);
}

function renderPalette() {
  nodes.palette.replaceChildren(...palette.map((color) => {
    const item = document.createElement('span');
    item.className = 'swatch';
    const chip = document.createElement('i');
    chip.style.background = color.hex;
    const copy = document.createElement('span');
    copy.textContent = `${color.hex} · ${color.ratio}%`;
    item.append(chip, copy);
    return item;
  }));
  nodes.paletteHint.textContent = palette.length ? '' : t('remotePalette');
}

function showImage(source) {
  imageSource = source;
  nodes.preview.src = source.dataUrl || source.imageUrl;
  nodes.dropZone.classList.add('hasImage');
  palette = [];
  renderPalette();
  if (source.dataUrl) calculatePalette(source.dataUrl).then((colors) => {
    palette = colors;
    renderPalette();
  }).catch(() => undefined);
}

function showResult(next) {
  result = next;
  nodes.resultSection.hidden = false;
  nodes.summary.textContent = next.summary || '';
  nodes.ratio.textContent = next.suggestedAspectRatio ? `${t('ratio')}: ${next.suggestedAspectRatio}` : '';
  nodes.tags.replaceChildren(...(next.styleTags || []).map((tag) => {
    const chip = document.createElement('span');
    chip.textContent = tag;
    return chip;
  }));
  nodes.prompt.value = next.generationPrompt || '';
  nodes.translatedBlock.hidden = true;
  nodes.translated.value = '';
  updateTranslateState();
}

function updateTranslateState() {
  if (!nodes.translate) return;
  const same = Boolean(result?.generationPrompt) && detectTextLocale(result.generationPrompt) === settings.locale;
  nodes.translate.disabled = !result?.generationPrompt || same;
  nodes.translate.title = same ? t('sameLanguage') : '';
  nodes.translateHint.textContent = same ? t('sameLanguage') : t('translationNote');
}

async function saveHistory() {
  const state = await chrome.storage.local.get(HISTORY_KEY);
  const history = Array.isArray(state[HISTORY_KEY]) ? state[HISTORY_KEY] : [];
  const item = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    thumbnail: await thumbnail(imageSource?.dataUrl).catch(() => ''),
    imageUrl: imageSource?.imageUrl || '',
    result,
    palette
  };
  await chrome.storage.local.set({ [HISTORY_KEY]: [item, ...history].slice(0, 30) });
  renderHistory();
}

async function renderHistory() {
  if (!nodes.history) return;
  const state = await chrome.storage.local.get(HISTORY_KEY);
  const history = Array.isArray(state[HISTORY_KEY]) ? state[HISTORY_KEY].slice(0, 6) : [];
  if (!history.length) {
    const empty = document.createElement('small');
    empty.className = 'hint';
    empty.textContent = t('empty');
    nodes.history.replaceChildren(empty);
    return;
  }
  nodes.history.replaceChildren(...history.map((item) => {
    const button = document.createElement('button');
    const image = document.createElement('img');
    image.src = item.thumbnail || item.imageUrl || '';
    image.alt = '';
    const label = document.createElement('span');
    label.textContent = item.result?.generationPrompt || item.result?.summary || '';
    button.append(image, label);
    button.addEventListener('click', () => {
      imageSource = item.imageUrl ? { imageUrl: item.imageUrl } : null;
      if (item.thumbnail || item.imageUrl) {
        nodes.preview.src = item.thumbnail || item.imageUrl;
        nodes.dropZone.classList.add('hasImage');
      }
      palette = item.palette || [];
      renderPalette();
      showResult(item.result || {});
    });
    return button;
  }));
}

async function acceptFile(file) {
  if (!file?.type?.startsWith('image/')) return;
  if (file.size > 12 * 1024 * 1024) {
    setStatus('Image exceeds 12 MB.');
    return;
  }
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  showImage({ dataUrl });
  setStatus('');
}

nodes.imageInput.addEventListener('change', () => acceptFile(nodes.imageInput.files?.[0]));
for (const type of ['dragenter', 'dragover']) nodes.dropZone.addEventListener(type, (event) => {
  event.preventDefault();
  nodes.dropZone.classList.add('dragging');
});
for (const type of ['dragleave', 'drop']) nodes.dropZone.addEventListener(type, (event) => {
  event.preventDefault();
  nodes.dropZone.classList.remove('dragging');
});
nodes.dropZone.addEventListener('drop', (event) => acceptFile(event.dataTransfer?.files?.[0]));
document.addEventListener('paste', (event) => acceptFile([...(event.clipboardData?.items || [])].find((item) => item.type.startsWith('image/'))?.getAsFile()));

nodes.settings.addEventListener('click', () => chrome.runtime.openOptionsPage());
nodes.copyPrompt.addEventListener('click', async () => {
  await navigator.clipboard.writeText(nodes.prompt.value);
  nodes.copyPrompt.textContent = t('copied');
  setTimeout(() => { nodes.copyPrompt.textContent = t('copy'); }, 1200);
});

nodes.analyze.addEventListener('click', async () => {
  if (!settings.endpoint || !settings.model || !settings.apiKey) {
    setStatus(t('configure'));
    return;
  }
  if (!imageSource) return;
  nodes.analyze.disabled = true;
  nodes.analyze.textContent = t('working');
  setStatus('');
  const response = await chrome.runtime.sendMessage({ type: 'LITE_REVERSE', ...imageSource }).catch((error) => ({ ok: false, error: error.message }));
  nodes.analyze.disabled = false;
  nodes.analyze.textContent = t('analyze');
  if (!response?.ok) {
    setStatus(`${t('failed')} ${response?.error || ''}`);
    return;
  }
  showResult(response.result);
  await saveHistory();
});

nodes.translate.addEventListener('click', async () => {
  nodes.translate.disabled = true;
  nodes.translate.textContent = t('working');
  const response = await chrome.runtime.sendMessage({
    type: 'LITE_TRANSLATE',
    text: result?.generationPrompt || '',
    targetLocale: settings.locale
  }).catch((error) => ({ ok: false, error: error.message }));
  nodes.translate.textContent = t('translate');
  updateTranslateState();
  if (!response?.ok) {
    setStatus(response?.error || t('failed'));
    return;
  }
  nodes.translated.value = response.result;
  nodes.translatedBlock.hidden = false;
});

async function initialize() {
  const state = await chrome.storage.local.get([SETTINGS_KEY, PENDING_IMAGE_KEY]);
  settings = normalizeSettings({ ...DEFAULT_SETTINGS, ...(state[SETTINGS_KEY] || {}) });
  t = translator(settings.locale);
  applyCopy();
  if (state[PENDING_IMAGE_KEY]?.imageUrl) {
    showImage({ imageUrl: state[PENDING_IMAGE_KEY].imageUrl });
    await chrome.storage.local.remove(PENDING_IMAGE_KEY);
  }
}

initialize();
