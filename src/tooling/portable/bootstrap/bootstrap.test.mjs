import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const pointer = JSON.parse(await readFile(new URL('./tiinex.llm.bootstrap.pointer.json', import.meta.url), 'utf8'));
const bootstrap = await readFile(new URL('./tiinex.llm.bootstrap.md', import.meta.url), 'utf8');

assert.equal(pointer.schema, 'tiinex.portable.bootstrap.pointer.v1');
assert.equal(pointer.repository, 'Tiinex/site');
assert.equal(pointer.firstOperations.includes('discover-tooling'), true);
assert.equal(pointer.firstOperations.includes('plan-host-action'), true);
assert.equal(pointer.boundary.remoteWrite, false);
assert.equal(pointer.boundary.sourceMutation, false);
assert.equal(bootstrap.includes('## Startup Modes'), true);
assert.equal(bootstrap.includes('Pre-prompt only; no bootstrap source is loaded'), true);
assert.equal(bootstrap.includes(pointer.bootstrapPath), true);
assert.equal(bootstrap.includes('do not execute package code'), true);
assert.equal(bootstrap.includes('## Bind Capabilities To Concrete Host Tools'), true);
assert.equal(bootstrap.includes('tiinex.portable.host-action-receipt.v1'), true);
assert.equal(bootstrap.includes('## Manufacture Recipient-Relative Handoff Packages'), true);
assert.equal(bootstrap.includes('manufacture-handoff-package'), true);
assert.equal(bootstrap.includes('001-1-READ-BEFORE-PROCEEDING.trace.md'), true);
assert.equal(bootstrap.includes('001-<package-slug>.trace.md'), true);
assert.equal(bootstrap.includes('Generated Markdown children declare package-local `Parent` continuity'), true);
assert.equal(bootstrap.includes('Exact durable source artifacts inside Workspace/cache archives retain their own historical provenance'), true);
assert.equal(bootstrap.includes('001-0-READ-BEFORE-PROCEEDING.trace.md'), false);
assert.equal(bootstrap.includes('tiinex.package/START.md'), false);
assert.equal(bootstrap.includes('orient-handoff-package'), true);
assert.equal(bootstrap.includes('audit-handoff-package-context'), true);
assert.equal(bootstrap.includes('humanOutput.normalInlineRouting.content'), true);
assert.equal(bootstrap.includes('sole primary package'), true);
assert.equal(bootstrap.includes('Filename or co-location under a bootstrap-like path does not grant bootstrap authority.'), true);
assert.equal(bootstrap.includes('canonical Handoff semantic authoring/validation or a locked canonical package schema'), true);

console.log('✓ portable bootstrap pointer and startup-mode contract passed');
