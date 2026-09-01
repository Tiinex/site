import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { searchToolingContext } from './search-tooling-context.mjs';

const root = mkdtempSync(path.join(os.tmpdir(), 'tiinex-tooling-context-search-'));
try {
  mkdirSync(path.join(root, 'src', 'tooling', 'portable', 'fixtures', 'legacy-artifacts'), { recursive: true });
  mkdirSync(path.join(root, 'src', 'tooling'), { recursive: true });
  writeFileSync(path.join(root, 'src', 'tooling', 'current.js'), 'const alpha = "needle";\nconst beta = "needle";\n', 'utf8');
  writeFileSync(path.join(root, 'src', 'tooling', 'portable', 'fixtures', 'legacy-artifacts', 'old.trace.fixture.txt'), 'needle\nneedle\nneedle\n', 'utf8');

  const current = searchToolingContext({ root, query: 'needle', limit: 1, snippetChars: 18 });
  assert.equal(current.profile, 'current-default');
  assert.equal(current.counts.totalMatches, 2);
  assert.equal(current.counts.returnedMatches, 1);
  assert.equal(current.truncated, true);
  assert.equal(current.matches[0].path, 'src/tooling/current.js');
  assert.equal(current.exclusions.pathPrefixes.includes('src/tooling/portable/fixtures/legacy-artifacts/'), true);

  const full = searchToolingContext({ root, query: 'needle', includeLegacyFixtures: true, limit: 20 });
  assert.equal(full.profile, 'explicit-legacy-inclusive');
  assert.equal(full.counts.totalMatches, 5);
  assert.equal(full.counts.filesMatched, 2);
  assert.equal(full.matches.some((match) => match.path.includes('legacy-artifacts/old.trace.fixture.txt')), true);
} finally {
  rmSync(root, { recursive: true, force: true });
}

console.log('✓ bounded current Tooling context search excludes legacy fixture bytes by default and retains explicit inclusion');
