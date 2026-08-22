export const SETTINGS_KEY = 'eyrovePromptLiteSettings';
export const HISTORY_KEY = 'eyrovePromptLiteHistory';
export const PENDING_IMAGE_KEY = 'eyrovePromptLitePendingImage';

export const DEFAULT_SETTINGS = Object.freeze({
  endpoint: '',
  model: '',
  apiKey: '',
  locale: 'en'
});

export const SUPPORTED_LOCALES = Object.freeze(['en', 'zh-CN', 'ja', 'ko', 'de', 'fr', 'es']);

export const BASIC_REVERSE_INSTRUCTION = `You are a basic image-to-prompt assistant.
Describe only visible evidence in the supplied image. Do not identify real people, infer private facts, or invent hidden context.
Return one JSON object with exactly these fields:
{
  "summary": "one concise sentence describing subject, setting and visual character",
  "styleTags": ["3 to 8 short visual style tags"],
  "suggestedAspectRatio": "one common ratio such as 1:1, 3:4, 4:3 or 16:9",
  "generationPrompt": "one self-contained, practical image-generation prompt"
}
Do not return markdown. This Lite contract intentionally provides no advanced dimensions, precision tiers, private audit or generation workflow.`;

export function normalizeLocale(value) {
  const raw = String(value || '').trim();
  if (SUPPORTED_LOCALES.includes(raw)) return raw;
  const lower = raw.toLowerCase();
  if (lower.startsWith('zh')) return 'zh-CN';
  return SUPPORTED_LOCALES.find((locale) => lower.startsWith(locale.toLowerCase())) || 'en';
}

export function normalizeSettings(input = {}) {
  return {
    endpoint: String(input.endpoint || '').trim(),
    model: String(input.model || '').trim(),
    apiKey: String(input.apiKey || '').trim(),
    locale: normalizeLocale(input.locale)
  };
}

export function endpointOriginPattern(endpoint) {
  const url = new URL(String(endpoint || '').trim());
  const localHttp = url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname);
  if (url.protocol !== 'https:' && !localHttp) throw new Error('The endpoint must use HTTPS (localhost may use HTTP).');
  return `${url.origin}/*`;
}

export function parseProviderJson(content) {
  const raw = typeof content === 'string' ? content.trim() : JSON.stringify(content || {});
  const unfenced = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  try {
    return JSON.parse(unfenced);
  } catch {
    const start = unfenced.indexOf('{');
    const end = unfenced.lastIndexOf('}');
    if (start < 0 || end <= start) throw new Error('The model did not return valid JSON.');
    return JSON.parse(unfenced.slice(start, end + 1));
  }
}

export function normalizeReverseResult(input = {}) {
  const generationPrompt = String(input.generationPrompt || input.prompt || '').trim();
  if (generationPrompt.length < 20) throw new Error('The model did not return a usable generation prompt.');
  return {
    summary: String(input.summary || '').trim(),
    styleTags: [...new Set((Array.isArray(input.styleTags) ? input.styleTags : [])
      .map((item) => String(item || '').trim())
      .filter(Boolean))].slice(0, 8),
    suggestedAspectRatio: String(input.suggestedAspectRatio || '').trim(),
    generationPrompt
  };
}

export function detectTextLocale(text) {
  const value = String(text || '').trim();
  if (!value) return '';
  if (/[\u3040-\u30ff]/.test(value)) return 'ja';
  if (/[\uac00-\ud7af]/.test(value)) return 'ko';
  if (/[\u3400-\u9fff]/.test(value)) return 'zh-CN';
  const lower = ` ${value.toLowerCase()} `;
  const scores = {
    de: [' der ', ' die ', ' das ', ' und ', ' mit ', ' eine ', ' einem '],
    fr: [' le ', ' la ', ' les ', ' une ', ' avec ', ' dans ', ' des '],
    es: [' el ', ' la ', ' los ', ' una ', ' con ', ' para ', ' del ']
  };
  let best = 'en';
  let bestScore = 0;
  for (const [locale, tokens] of Object.entries(scores)) {
    const score = tokens.reduce((total, token) => total + (lower.includes(token) ? 1 : 0), 0);
    if (score > bestScore) {
      best = locale;
      bestScore = score;
    }
  }
  return best;
}

function rgbToHex(red, green, blue) {
  return `#${[red, green, blue].map((value) => Math.max(0, Math.min(255, value)).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

export function paletteFromPixels(pixels, { maxColors = 6 } = {}) {
  const buckets = new Map();
  for (let index = 0; index < pixels.length; index += 4) {
    if (pixels[index + 3] < 160) continue;
    const red = Math.round(pixels[index] / 32) * 32;
    const green = Math.round(pixels[index + 1] / 32) * 32;
    const blue = Math.round(pixels[index + 2] / 32) * 32;
    const key = `${red},${green},${blue}`;
    const bucket = buckets.get(key) || { red: 0, green: 0, blue: 0, count: 0 };
    bucket.red += pixels[index];
    bucket.green += pixels[index + 1];
    bucket.blue += pixels[index + 2];
    bucket.count += 1;
    buckets.set(key, bucket);
  }
  const ranked = [...buckets.values()].sort((left, right) => right.count - left.count);
  const selected = [];
  for (const bucket of ranked) {
    const color = {
      red: Math.round(bucket.red / bucket.count),
      green: Math.round(bucket.green / bucket.count),
      blue: Math.round(bucket.blue / bucket.count),
      count: bucket.count
    };
    const distinct = selected.every((existing) => Math.hypot(
      color.red - existing.red,
      color.green - existing.green,
      color.blue - existing.blue
    ) >= 48);
    if (distinct) selected.push(color);
    if (selected.length >= maxColors) break;
  }
  const total = selected.reduce((sum, color) => sum + color.count, 0) || 1;
  return selected.map((color) => ({
    hex: rgbToHex(color.red, color.green, color.blue),
    ratio: Math.max(1, Math.round((color.count / total) * 100))
  }));
}
