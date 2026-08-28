import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { loadNodePortableInput } from '../../input/node.input.js';
import { runPortableCli } from './cli.run.js';

const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-legacy-topics-grounding-'));
const topics = path.join(root, '.topics');
const currentDir = path.join(topics, 'tooling', 'iteration-efficiency');
const legacyDir = path.join(topics, 'development');

try {
  await mkdir(currentDir, { recursive: true });
  await mkdir(legacyDir, { recursive: true });
  await writeFile(path.join(currentDir, 'current.trace.md'), '# Current\n', 'utf8');
  await writeFile(path.join(legacyDir, 'legacy.trace.md'), '# Legacy\n', 'utf8');

  const fullFidelity = await loadNodePortableInput([root]);
  assert.deepEqual(fullFidelity.files.map((file) => file.path).sort(), [
    '.topics/development/legacy.trace.md',
    '.topics/tooling/iteration-efficiency/current.trace.md'
  ]);

  const defaultInspect = await runJson(['inspect', root, '--compact']);
  assert.deepEqual(defaultInspect.files.map((file) => file.path), ['.topics/tooling/iteration-efficiency/current.trace.md']);
  assert.equal(defaultInspect.findings.some((finding) => finding.code === 'portable.node.directory.path-prefix-excluded' && finding.ref === '.topics/development'), true);

  const topicsInspect = await runJson(['inspect', topics, '--compact']);
  assert.deepEqual(topicsInspect.files.map((file) => file.path), ['tooling/iteration-efficiency/current.trace.md']);
  assert.equal(topicsInspect.findings.some((finding) => finding.code === 'portable.node.directory.path-prefix-excluded' && finding.ref === 'development'), true);

  const explicitLegacy = await runJson(['inspect', legacyDir, '--compact']);
  assert.deepEqual(explicitLegacy.files.map((file) => file.path), ['legacy.trace.md']);

  const optedIn = await runJson(['inspect', root, '--include-legacy-topics', '--compact']);
  assert.deepEqual(optedIn.files.map((file) => file.path).sort(), [
    '.topics/development/legacy.trace.md',
    '.topics/tooling/iteration-efficiency/current.trace.md'
  ]);
} finally {
  await rm(root, { recursive: true, force: true });
}

console.log('✓ broad directory grounding quarantines legacy topics without changing full-fidelity material access');

async function runJson(argv) {
  const lines = [];
  const errors = [];
  const code = await runPortableCli(argv, { log: (value) => lines.push(value), error: (value) => errors.push(value) });
  assert.equal(code, 0, errors.join('\n'));
  return JSON.parse(lines.at(-1));
}
