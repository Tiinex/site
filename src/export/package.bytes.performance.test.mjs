import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import { sha256Hex, utf8Bytes } from './package.bytes.js';

const vectors = [
  new Uint8Array(),
  utf8Bytes('abc'),
  Uint8Array.from({ length: 1024 }, (_, index) => index & 0xff)
];

for (const bytes of vectors) {
  const expected = createHash('sha256').update(bytes).digest('hex');
  assert.equal(sha256Hex(bytes), expected);
}

const large = new Uint8Array(8 * 1024 * 1024);
for (let index = 0; index < large.length; index += 4096) large[index] = (index >>> 12) & 0xff;
const expectedLarge = createHash('sha256').update(large).digest('hex');
const started = performance.now();
const actualLarge = sha256Hex(large);
const elapsedMs = performance.now() - started;
assert.equal(actualLarge, expectedLarge);

const source = await readFile(new URL('./package.bytes.js', import.meta.url), 'utf8');
assert.doesNotMatch(source, /function\s+add32\s*\(\s*\.\.\.values\s*\)/, 'SHA-256 compression must not regress to the rest-parameter allocation hotspot');
assert.match(source, /const\s+temp1\s*=\s*\(h\s*\+\s*s1\s*\+\s*ch\s*\+\s*K\[i\]\s*\+\s*w\[i\]\)\s*>>>\s*0/, 'SHA-256 compression should keep the five-term round addition inline');

console.log(`export.package.bytes.performance: ok (${elapsedMs.toFixed(1)} ms for 8 MiB)`);
