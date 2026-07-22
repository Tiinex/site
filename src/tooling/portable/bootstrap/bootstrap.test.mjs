import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const pointer = JSON.parse(await readFile(new URL('./tiinex.llm.bootstrap.pointer.json', import.meta.url), 'utf8'));
const bootstrap = await readFile(new URL('./tiinex.llm.bootstrap.md', import.meta.url), 'utf8');

assert.equal(pointer.schema, 'tiinex.portable.bootstrap.pointer.v1');
assert.equal(pointer.repository, 'Tiinex/site');
assert.equal(pointer.firstOperations.includes('discover-tooling'), true);
assert.equal(pointer.boundary.remoteWrite, false);
assert.equal(pointer.boundary.sourceMutation, false);
assert.equal(bootstrap.includes('## Startup Modes'), true);
assert.equal(bootstrap.includes('Pre-prompt only; no bootstrap source is loaded'), true);
assert.equal(bootstrap.includes(pointer.bootstrapPath), true);
assert.equal(bootstrap.includes('do not execute package code'), true);

console.log('✓ portable bootstrap pointer and startup-mode contract passed');
