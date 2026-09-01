import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { runPortableCli } from './cli.run.js';

const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-cli-summary-'));
try {
  const source = await readFile('src/artifacts/fixtures/topic.trace.md', 'utf8');
  const materialDir = path.join(root, 'material');
  await mkdir(materialDir, { recursive: true });
  for (let index = 0; index < 20; index += 1) {
    await writeFile(path.join(materialDir, `topic-${String(index + 1).padStart(2, '0')}.trace.md`), source, 'utf8');
  }

  const fullInspect = await runJson(['inspect', materialDir, '--compact']);
  assert.equal(Array.isArray(fullInspect.records), true);
  assert.equal(fullInspect.records.length, 20);
  assert.equal('projection' in fullInspect, false, 'default inspect projection must remain unchanged');

  const summaryInspect = await runJson(['inspect', materialDir, '--summary', '--phase-timing', '--compact']);
  assert.equal(summaryInspect.projection, 'bounded-summary');
  assert.deepEqual(summaryInspect.counts, { files: 20, records: 20, assets: 0, workspaceEntries: 0, findings: 0 });
  assert.equal('records' in summaryInspect, false);
  assert.equal(summaryInspect.actionableFindings.length, 0);
  assert.equal(summaryInspect.cliPhaseTiming.command, 'inspect');
  assert.equal(JSON.stringify(summaryInspect).length < JSON.stringify(fullInspect).length / 5, true);

  const summaryAudit = await runJson(['audit', materialDir, '--summary', '--compact'], 0);
  assert.equal(summaryAudit.projection, 'bounded-summary');
  assert.equal(summaryAudit.counts.audits, 20);
  assert.equal('audits' in summaryAudit, false);
  assert.equal(summaryAudit.actionableFindings.every((finding) => finding.severity === 'error' || finding.severity === 'warning'), true);
} finally {
  await rm(root, { recursive: true, force: true });
}

console.log('✓ CLI bounded inspect/audit summary projection preserves full default output and omits body-scale payloads');

async function runJson(argv, expectedCode = 0) {
  const lines = [];
  const errors = [];
  const code = await runPortableCli(argv, { log: (value) => lines.push(value), error: (value) => errors.push(value) });
  assert.equal(code, expectedCode, errors.join('\n'));
  return JSON.parse(lines.at(-1));
}
