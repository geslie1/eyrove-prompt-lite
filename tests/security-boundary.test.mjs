import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('keeps permissions optional and contains no Pro integration', async () => {
  const manifest = JSON.parse(await read('manifest.json'));
  const source = `${await read('background.js')}\n${await read('popup.js')}`;

  assert.equal(Object.hasOwn(manifest, 'key'), false);
  assert.equal(Object.hasOwn(manifest, 'host_permissions'), false);
  assert.ok(manifest.optional_host_permissions.includes('https://*/*'));
  assert.doesNotMatch(source, /\/api\/eyrove\/reverse|\/api\/openfaeo|generateFromTask|generationId|standardPrecision|highPrecision/);
  assert.doesNotMatch(source, /APIMarket|Evolink|Infai|DeepSeek/i);
  assert.match(source, /Authorization: `Bearer \$\{config\.apiKey\}`/);
});

test('contains no remote executable code declarations', async () => {
  const manifest = await read('manifest.json');
  const source = `${await read('background.js')}\n${await read('popup.js')}\n${await read('options.js')}`;
  assert.doesNotMatch(manifest, /content_security_policy|externally_connectable/);
  assert.doesNotMatch(source, /eval\(|new Function\(|importScripts\(|chrome\.scripting/);
});

