import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { runPortableCli } from './cli.run.js';

const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-cli-lineage-summary-'));
try {
  const source = await readFile('src/artifacts/fixtures/topic.trace.md', 'utf8');
  const materialDir = path.join(root, 'material');
  await mkdir(materialDir, { recursive: true });
  for (let index = 0; index < 12; index += 1) {
    await writeFile(path.join(materialDir, `topic-${String(index + 1).padStart(2, '0')}.trace.md`), source, 'utf8');
  }

  const fullSearch = await runJson(['search-lineage', materialDir, '--query', 'parser', '--compact']);
  assert.equal(Array.isArray(fullSearch.matches), true);
  assert.equal(fullSearch.matches.length, 12);
  assert.equal('projection' in fullSearch, false, 'default search-lineage projection must remain unchanged');

  const summarySearch = await runJson(['search-lineage', materialDir, '--query', 'parser', '--summary', '--phase-timing', '--compact']);
  assert.equal(summarySearch.projection, 'bounded-summary');
  assert.equal(summarySearch.counts.returnedMatches, 12);
  assert.equal(summarySearch.counts.totalMatches, 12);
  assert.equal(summarySearch.counts.eligibleRecords, 12);
  assert.equal('matches' in summarySearch, false);
  assert.equal(summarySearch.cliPhaseTiming.command, 'search-lineage');
  assert.equal(JSON.stringify(summarySearch).length < JSON.stringify(fullSearch).length / 4, true);

  const fullResolve = await runJson(['resolve-lineage', materialDir, '--depth', '2', '--direction', 'both', '--compact']);
  assert.equal(typeof fullResolve.lineage, 'object');
  assert.equal(Array.isArray(fullResolve.traversal.nodes), true);
  assert.equal('projection' in fullResolve, false, 'default resolve-lineage projection must remain unchanged');

  const summaryResolve = await runJson(['resolve-lineage', materialDir, '--depth', '2', '--direction', 'both', '--summary', '--compact']);
  assert.equal(summaryResolve.projection, 'bounded-summary');
  assert.equal(summaryResolve.counts.loadedNodes, 12);
  assert.equal(summaryResolve.counts.visitedNodes, 1);
  assert.equal('nodes' in summaryResolve.traversal, false);
  assert.equal('edges' in summaryResolve.lineage, false);
  assert.equal(JSON.stringify(summaryResolve).length < JSON.stringify(fullResolve).length / 4, true);
} finally {
  await rm(root, { recursive: true, force: true });
}

console.log('✓ CLI bounded lineage summaries preserve default output and omit record-scale lineage bodies');

async function runJson(argv, expectedCode = 0) {
  const lines = [];
  const errors = [];
  const code = await runPortableCli(argv, { log: (value) => lines.push(value), error: (value) => errors.push(value) });
  assert.equal(code, expectedCode, errors.join('\n'));
  return JSON.parse(lines.at(-1));
}
