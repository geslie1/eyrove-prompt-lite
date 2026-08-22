import assert from 'node:assert/strict';
import test from 'node:test';

import {
  detectTextLocale,
  endpointOriginPattern,
  normalizeReverseResult,
  paletteFromPixels
} from '../core.js';

test('accepts HTTPS endpoints and local HTTP only', () => {
  assert.equal(endpointOriginPattern('https://api.example.com/v1/chat/completions'), 'https://api.example.com/*');
  assert.equal(endpointOriginPattern('http://127.0.0.1:11434/v1/chat/completions'), 'http://127.0.0.1:11434/*');
  assert.throws(() => endpointOriginPattern('http://api.example.com/v1/chat/completions'), /must use HTTPS/);
});

test('normalizes the intentionally small public result contract', () => {
  assert.deepEqual(normalizeReverseResult({
    summary: 'Editorial portrait',
    styleTags: ['editorial', 'soft light', 'editorial'],
    suggestedAspectRatio: '3:4',
    generationPrompt: 'An editorial portrait with a neutral backdrop and soft directional light.'
  }), {
    summary: 'Editorial portrait',
    styleTags: ['editorial', 'soft light'],
    suggestedAspectRatio: '3:4',
    generationPrompt: 'An editorial portrait with a neutral backdrop and soft directional light.'
  });
});

test('detects supported prompt languages without a network call', () => {
  assert.equal(detectTextLocale('一张棚拍人像，柔和侧光'), 'zh-CN');
  assert.equal(detectTextLocale('A studio portrait with soft side lighting'), 'en');
});

test('extracts a deterministic local palette', () => {
  const palette = paletteFromPixels(new Uint8ClampedArray([
    245, 120, 150, 255,
    245, 120, 150, 255,
    20, 30, 40, 255,
    20, 30, 40, 255
  ]));
  assert.equal(palette.length, 2);
  assert.equal(palette.reduce((sum, color) => sum + color.ratio, 0), 100);
});

