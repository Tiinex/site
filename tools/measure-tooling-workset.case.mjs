#!/usr/bin/env node
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { classifyWorksetPath, measureRepositoryWorkset } from './measure-tooling-workset.mjs';

assert.equal(classifyWorksetPath('.topics/tooling/iteration-efficiency/001.trace.md'), 'current-iteration-efficiency');
assert.equal(classifyWorksetPath('.topics/development/handoff/old.trace.md'), 'legacy-topics-development');
assert.equal(classifyWorksetPath('.topics/continuity/old.trace.md'), 'legacy-topics-continuity');
assert.equal(classifyWorksetPath('docs/architecture/example.md'), 'docs');
assert.equal(classifyWorksetPath('src/tooling/portable/example.js'), 'tooling-source');
assert.equal(classifyWorksetPath('tools/example.mjs'), 'tooling-tools');

const root = mkdtempSync(join(tmpdir(), 'tiinex-workset-'));
try {
  const fixture = {
    '.topics/tooling/iteration-efficiency/current.trace.md': 'a',
    '.topics/development/legacy.trace.md': 'bb',
    'docs/legacy.md': 'ccc',
    'src/tooling/tool.js': 'dddd',
    'src/app/app.js': 'eeeee',
    'other.txt': 'ffffff',
    'node_modules/ignored.js': 'ignored'
  };
  for (const [path, value] of Object.entries(fixture)) {
    mkdirSync(join(root, path, '..'), { recursive: true });
    writeFileSync(join(root, path), value);
  }

  const report = measureRepositoryWorkset(root);
  assert.equal(report.totalFiles, 6);
  assert.equal(report.totalBytes, 21);
  const byCategory = Object.fromEntries(report.categories.map((item) => [item.category, item]));
  assert.deepEqual(
    Object.fromEntries(Object.entries(byCategory).map(([key, value]) => [key, { files: value.files, bytes: value.bytes }])),
    {
      other: { files: 1, bytes: 6 },
      'other-source': { files: 1, bytes: 5 },
      'tooling-source': { files: 1, bytes: 4 },
      docs: { files: 1, bytes: 3 },
      'legacy-topics-development': { files: 1, bytes: 2 },
      'current-iteration-efficiency': { files: 1, bytes: 1 }
    }
  );
} finally {
  rmSync(root, { recursive: true, force: true });
}

console.log('✓ repository workset measurement is deterministic and excludes dependency/build trees');
