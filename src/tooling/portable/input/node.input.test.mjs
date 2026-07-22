import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { loadNodePortableInput } from './node.input.js';
import { runPortableCli } from '../adapters/cli/cli.run.js';
import { openPortableSession } from '../session/portable.session.js';

const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-portable-'));
try {
  const nested = path.join(root, 'received');
  await mkdir(nested, { recursive: true });
  await writeFile(path.join(nested, 'artifact.md'), topicMarkdown(), 'utf8');
  await writeFile(path.join(nested, 'asset.bin'), Buffer.from([1, 2, 3, 4]));
  await writeFile(path.join(nested, 'preview.png'), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  try { await symlink(path.join(nested, 'artifact.md'), path.join(nested, 'linked.md')); } catch {}

  const directoryInput = await loadNodePortableInput(nested);
  assert.equal(directoryInput.files.some((file) => file.path === 'artifact.md'), true);
  assert.equal(directoryInput.files.some((file) => file.path === 'asset.bin' && file.kind === 'asset'), true);
  assert.equal(directoryInput.files.some((file) => file.path === 'preview.png' && file.locator?.kind === 'node-file'), true);
  assert.equal(directoryInput.files.some((file) => file.path === 'linked.md'), false);

  const zipPath = path.join(root, 'received.zip');
  await writeFile(zipPath, storedZip([
    { name: 'zip-artifact.md', data: Buffer.from(topicMarkdown(), 'utf8') },
    { name: 'assets/pixel.bin', data: Buffer.from([9, 8, 7]) }
  ]));
  const zipInput = await loadNodePortableInput(zipPath);
  assert.equal(zipInput.files.some((file) => file.path === 'zip-artifact.md' && typeof file.content === 'string'), true);
  assert.equal(zipInput.files.some((file) => file.path === 'assets/pixel.bin' && file.kind === 'asset'), true);
  assert.equal(zipInput.findings.some((finding) => finding.severity === 'error'), false);

  const output = [];
  const errors = [];
  const exitCode = await runPortableCli(['inspect', nested], {
    log(value) { output.push(value); },
    error(value) { errors.push(value); }
  });
  assert.equal(exitCode, 0);
  assert.equal(errors.length, 0);
  const cliResult = JSON.parse(output.at(-1));
  assert.equal(cliResult.operation, 'inspect');
  assert.equal(cliResult.records.length, 1);

  const operationOutput = [];
  assert.equal(await runPortableCli(['operations', '--compact'], { log(value) { operationOutput.push(value); }, error() {} }), 0);
  const operations = JSON.parse(operationOutput[0]).operations;
  assert.equal(operations.some((operation) => operation.name === 'make-writer-brief'), true);
  assert.equal(operations.some((operation) => operation.name === 'schema-guide'), true);
  assert.equal(operations.some((operation) => operation.name === 'search-lineage'), true);
  assert.equal(operations.some((operation) => operation.name === 'create-checkpoint'), true);
  assert.equal(operations.some((operation) => operation.name === 'build-runtime-package'), true);

  const searchOutput = [];
  assert.equal(await runPortableCli(['search-lineage', nested, '--query', 'portable local'], { log(value) { searchOutput.push(value); }, error() {} }), 0);
  assert.equal(JSON.parse(searchOutput[0]).matches.some((match) => match.path === 'artifact.md'), true);

  const schemaDir = path.join(root, 'schemas');
  await mkdir(schemaDir, { recursive: true });
  await writeFile(path.join(schemaDir, 'tiinex.topic.v1.schema.md'), await readFile(new URL('../../../schemas/core/topic/tiinex.topic.v1.schema.md', import.meta.url), 'utf8'), 'utf8');
  const guideOutput = [];
  assert.equal(await runPortableCli(['schema-guide', schemaDir, '--schema', 'tiinex.topic.v1', '--task', 'create'], { log(value) { guideOutput.push(value); }, error() {} }), 0);
  assert.equal(JSON.parse(guideOutput[0]).guide.schema, 'tiinex.llm.schema-guide.v1');

  await writeFile(path.join(schemaDir, 'tiinex.evidence.v1.schema.md'), await readFile(new URL('../../../schemas/core/evidence/tiinex.evidence.v1.schema.md', import.meta.url), 'utf8'), 'utf8');
  await writeFile(path.join(schemaDir, 'tiinex.preservation.v1.schema.md'), await readFile(new URL('../../../schemas/core/preservation/tiinex.preservation.v1.schema.md', import.meta.url), 'utf8'), 'utf8');
  await writeFile(path.join(schemaDir, 'tiinex.root.v1.schema.md'), await readFile(new URL('../../../schemas/tiinex.root.v1.schema.md', import.meta.url), 'utf8'), 'utf8');
  const hostPath = path.join(root, 'host.json');
  await writeFile(hostPath, JSON.stringify({ tools: [
    { name: 'GitHub.search', description: 'Search repository files.' },
    { name: 'GitHub.fetch_file', description: 'Read repository files.' },
    { name: 'vision.open_image', description: 'Open image for multimodal analysis.' },
    { name: 'archive.extract', description: 'Extract zip archive entries.' }
  ] }), 'utf8');
  const actionRequestPath = path.join(root, 'action-request.json');
  await writeFile(actionRequestPath, JSON.stringify({ schemaId: 'tiinex.remote.v1', repository: 'Tiinex/docs', ref: 'master', searchQueries: ['tiinex.remote.v1.schema.md'], nextOperation: 'resolve-schema-material' }), 'utf8');
  const actionOutput = [];
  assert.equal(await runPortableCli(['plan-host-action', 'repository-schema-resolution', '--host', hostPath, '--request', actionRequestPath], { log(value) { actionOutput.push(value); }, error() {} }), 0);
  const actionPlan = JSON.parse(actionOutput[0]);
  assert.equal(actionPlan.status, 'ready');
  assert.equal(actionPlan.steps[0].tool.name, 'GitHub.search');
  assert.equal(actionPlan.steps[1].tool.name, 'GitHub.fetch_file');

  const resolveOutput = [];
  assert.equal(await runPortableCli(['resolve-schema-material', schemaDir, '--schema', 'tiinex.evidence.v1', '--host', hostPath], { log(value) { resolveOutput.push(value); }, error() {} }), 0);
  assert.equal(JSON.parse(resolveOutput[0]).status, 'resolved');

  const valuesPath = path.join(root, 'values.json');
  await writeFile(valuesPath, JSON.stringify({
    'Supported Claim Or Question': 'whether overflow was observed',
    'Evidence Role': 'supports observation',
    'Known Source': 'explicit local fixture',
    'Preservation Basis': 'test fixture',
    'Provenance Limits': 'no surrounding context',
    'Material': 'Overflow was observed.',
    'Material Kind': 'excerpt',
    'Preservation State': 'readable markdown',
    'Fidelity Notes': 'test representation',
    'Known Losses': 'device details',
    'Does Not Prove': 'cause or fix',
    'Must Not Be Treated As': 'completion or consent'
  }), 'utf8');
  const parentPath = path.join(root, 'parent.json');
  await writeFile(parentPath, JSON.stringify({ id: 'parent-record', path: 'parent.md', schemaId: 'tiinex.preservation.v1', boundary: 'portable local material; no GitHub provenance inferred' }), 'utf8');
  const createOutput = [];
  assert.equal(await runPortableCli(['create-local-draft', schemaDir, '--schema', 'tiinex.evidence.v1', '--values', valuesPath, '--parent', parentPath, '--title', 'CLI Evidence'], { log(value) { createOutput.push(value); }, error() {} }), 0);
  const createdDraft = JSON.parse(createOutput[0]);
  assert.equal(createdDraft.status, 'created-clean');
  assert.equal(createdDraft.draft.markdown.includes('## Evidence Material'), true);

  const sessionPath = path.join(root, 'session.json');
  const staged = { ...createdDraft.draft, qualification: createdDraft.qualification, lifecycleStatus: 'draft', sourceMode: 'local-portable-staged' };
  await writeFile(sessionPath, JSON.stringify(openPortableSession({ files: directoryInput.files, stagedArtifacts: [staged], currentFocus: staged.path }).snapshot()), 'utf8');
  const checkpointOutput = [];
  assert.equal(await runPortableCli(['create-checkpoint', sessionPath, '--created-at', '2026-07-23T04:00:00.000Z'], { log(value) { checkpointOutput.push(value); }, error() {} }), 0);
  const checkpoint = JSON.parse(checkpointOutput[0]);
  assert.equal(checkpoint.operation, 'create-checkpoint');
  assert.equal(checkpoint.boundary.canonicalHandoffArtifact, false);
  const checkpointPath = path.join(root, 'checkpoint.json');
  await writeFile(checkpointPath, JSON.stringify({ schema: checkpoint.resultSchema, version: checkpoint.version, checkpointId: checkpoint.checkpointId, createdAt: checkpoint.createdAt, status: checkpoint.status, summary: checkpoint.summary, session: checkpoint.session, integrity: checkpoint.integrity, boundary: checkpoint.boundary, findings: checkpoint.findings, findingSummary: checkpoint.findingSummary }), 'utf8');
  const restoreCheckpointOutput = [];
  assert.equal(await runPortableCli(['restore-checkpoint', checkpointPath], { log(value) { restoreCheckpointOutput.push(value); }, error() {} }), 0);
  assert.equal(JSON.parse(restoreCheckpointOutput[0]).status, 'restored');

  const stagedPath = path.join(root, 'staged.json');
  await writeFile(stagedPath, JSON.stringify([staged]), 'utf8');
  const packageOutput = [];
  assert.equal(await runPortableCli(['build-runtime-package', '--staged', stagedPath, '--title', 'CLI package'], { log(value) { packageOutput.push(value); }, error() {} }), 0);
  const runtimePackage = JSON.parse(packageOutput[0]);
  assert.equal(runtimePackage.operation, 'build-runtime-package');
  assert.equal(runtimePackage.qualification.canonicalPackageSchemaLocked, false);
  const bundlePath = path.join(root, 'bundle.json');
  await writeFile(bundlePath, JSON.stringify(runtimePackage.bundle), 'utf8');
  const packageInspectionOutput = [];
  assert.equal(await runPortableCli(['inspect-runtime-package', bundlePath], { log(value) { packageInspectionOutput.push(value); }, error() {} }), 0);
  assert.equal(JSON.parse(packageInspectionOutput[0]).status, 'valid');
  const packageZipPath = path.join(root, 'runtime-package.zip');
  const packageWriteOutput = [];
  assert.equal(await runPortableCli(['build-runtime-package', '--staged', stagedPath, '--output', packageZipPath], { log(value) { packageWriteOutput.push(value); }, error() {} }), 0);
  assert.equal(JSON.parse(packageWriteOutput[0]).writeReceipt.status, 'written');
  const packageZipInput = await loadNodePortableInput(packageZipPath);
  assert.equal(packageZipInput.files.some((file) => file.path === 'tiinex.package/manifest.json'), true);
  const rehydrateOutput = [];
  assert.equal(await runPortableCli(['rehydrate-runtime-package', packageZipPath], { log(value) { rehydrateOutput.push(value); }, error() {} }), 0);
  assert.equal(JSON.parse(rehydrateOutput[0]).status, 'rehydrated');
  const serializedRoundTripOutput = [];
  assert.equal(await runPortableCli(['roundtrip-runtime-package', packageZipPath], { log(value) { serializedRoundTripOutput.push(value); }, error() {} }), 0);
  assert.equal(JSON.parse(serializedRoundTripOutput[0]).comparison.status, 'match');

  const assetOutput = [];
  assert.equal(await runPortableCli(['inspect-assets', nested], { log(value) { assetOutput.push(value); }, error() {} }), 0);
  assert.equal(JSON.parse(assetOutput[0]).counts.images, 1);
  const assetPrepareOutput = [];
  assert.equal(await runPortableCli(['prepare-asset-analysis', nested, '--asset', 'preview.png', '--host', hostPath], { log(value) { assetPrepareOutput.push(value); }, error() {} }), 0);
  assert.equal(JSON.parse(assetPrepareOutput[0]).status, 'host-action-ready');
} finally {
  await rm(root, { recursive: true, force: true });
}

console.log('✓ portable Node file/directory/zip input and CLI adapter passed');

function topicMarkdown() {
  return `# Continuity Context

- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)
  - Created At: 2026-07-22 00:00:00
  - Summary: Node input test

---

# Node Input Test

## Content

Portable local material.
`;
}

function storedZip(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  for (const entry of entries) {
    const name = Buffer.from(entry.name, 'utf8');
    const data = Buffer.from(entry.data);
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    localParts.push(local, name, data);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, name);
    offset += local.length + name.length + data.length;
  }
  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);
  return Buffer.concat([...localParts, centralDirectory, end]);
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}
