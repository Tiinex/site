#!/usr/bin/env node
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { measurePortableInputWorkset, summarizePortableInput } from './measure-portable-input-workset.mjs';

const summary = summarizePortableInput({
  files: [
    { path: 'a.md', content: 'abc', size: 3, sourceMode: 'portable-node-local' },
    { path: 'b.bin', data: new Uint8Array([1, 2]), size: 2, kind: 'asset', sourceMode: 'portable-node-zip' },
    { path: 'c.png', size: 7, kind: 'asset', locator: { kind: 'node-file' }, sourceMode: 'portable-node-local' }
  ],
  findings: [{ severity: 'warning' }, { severity: 'info' }]
});
assert.equal(summary.totalEntries, 3);
assert.equal(summary.declaredBytes, 12);
assert.equal(summary.textEntries, 1);
assert.equal(summary.textResidentBytes, 3);
assert.equal(summary.binaryResidentEntries, 1);
assert.equal(summary.binaryResidentBytes, 2);
assert.equal(summary.locatorOnlyEntries, 1);
assert.equal(summary.locatorOnlyDeclaredBytes, 7);
assert.deepEqual(summary.findingCounts, { info: 1, warning: 1, error: 0, other: 0 });

const root = mkdtempSync(join(tmpdir(), 'tiinex-portable-workset-'));
try {
  mkdirSync(join(root, 'nested'), { recursive: true });
  mkdirSync(join(root, 'node_modules'), { recursive: true });
  writeFileSync(join(root, 'a.md'), 'alpha');
  writeFileSync(join(root, 'nested', 'b.json'), '{"b":1}');
  writeFileSync(join(root, 'nested', 'image.bin'), Buffer.from([1, 2, 3, 4]));
  writeFileSync(join(root, 'node_modules', 'ignored.md'), 'ignored');
  const report = await measurePortableInputWorkset(root);
  assert.equal(report.totalEntries, 3);
  assert.equal(report.textEntries, 2);
  assert.equal(report.locatorOnlyEntries, 1);
  assert.equal(report.findingCounts.error, 0);
  assert(report.elapsedMs >= 0);
} finally {
  rmSync(root, { recursive: true, force: true });
}

console.log('✓ portable input workset measurement reports resident material without changing loader semantics');
