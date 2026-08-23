import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { zipBufferToImportEntries } from '../../../adapters/archive/archive.adapter.js';
import { packageFileBytes } from '../../../export/package.bytes.js';
import { prepareNodeHandoffManufacturingInput, enumerateNodeWorkspace } from '../adapters/node/handoff.manufacture.js';
import { runPortableCli } from '../adapters/cli/cli.run.js';
import { portableRuntimePackageZipBuffer } from '../output/node.zip.js';
import { manufactureRecipientRelativeHandoffPackage } from './manufacture.js';
import { inspectPortableToolingBootstrap } from './toolingBootstrap.js';

const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-handoff-manufacture-'));
try {
  const workspaceRoot = path.join(root, 'docs-workspace');
  const runtimeRoot = path.join(root, 'portable-runtime');
  await makeWorkspace(workspaceRoot);
  await makeRuntime(runtimeRoot);

  const firstEnumeration = await enumerateNodeWorkspace(workspaceRoot, { workspaceId: 'docs-fixture' });
  const secondEnumeration = await enumerateNodeWorkspace(workspaceRoot, { workspaceId: 'docs-fixture' });
  assert.equal(firstEnumeration.status, 'qualified-complete');
  assert.equal(firstEnumeration.evidence.entryCount, 5);
  assert.equal(firstEnumeration.evidence.entriesFingerprint, secondEnumeration.evidence.entriesFingerprint);
  assert.deepEqual(firstEnumeration.materialization.entries.map((entry) => entry.path), [...firstEnumeration.materialization.entries.map((entry) => entry.path)].sort());
  const bounded = await enumerateNodeWorkspace(workspaceRoot, { workspaceId: 'docs-fixture', maxFiles: 2 });
  assert.equal(bounded.status, 'file-limit-exceeded');
  assert.equal(bounded.evidence.state, 'blocked');

  const embeddedInput = await prepareNodeHandoffManufacturingInput({
    workspaceRoot,
    workspaceId: 'docs-fixture',
    workspaceTitle: 'Docs Fixture',
    handoffPath: '.topics/handoff.trace.md',
    toolingBootstrap: 'embedded',
    runtimeRoot
  });
  assert.equal(embeddedInput.manufacturingEvidence.enumeration.proof, 'deterministic-node-enumeration-v1');
  const embedded = manufactureRecipientRelativeHandoffPackage(embeddedInput, { packageInput: { builtAt: '2026-08-23T10:50:00.000Z' } });
  assert.equal(embedded.status, 'ready');
  assert.deepEqual(embedded.verification, {
    packageInspection: 'valid',
    closureInspection: 'valid',
    carrierInspection: 'valid',
    coldConsumerEntrypointInspection: 'valid',
    companionInspection: 'valid',
    roundtrip: 'passed',
    toolingBootstrap: 'valid'
  });
  assert.equal(embedded.plan.requirements.required[0].selectedMaterial.path, '.topics/context.md');
  assert.equal(embedded.plan.requirements.required[0].selectedMaterial.provider.id, 'node-workspace-enumerator');

  const byPath = new Map(embedded.bundle.files.map((file) => [file.path, file]));
  assert(byPath.has('tiinex.package/START.md'));
  assert.equal(embedded.coldConsumerEntrypointInspection.status, 'valid');
  assert.equal(embedded.coldConsumerProjection.workspaces.length, 1);
  assert.equal(embedded.coldConsumerProjection.routes[0].workspaceId, 'docs-fixture');
  assert(byPath.has('handoff.workspaces/docs-fixture/.topics/context.md'));
  assert(byPath.has('handoff.workspaces/docs-fixture/content/blob.bin'));
  assert(byPath.has('handoff.workspaces/docs-fixture/tiinex.bootstrap/runtime/ordinary-workspace-byte.js'));
  assert.equal(byPath.has('handoff.workspaces/docs-fixture/.topics/.topics/context.md'), false, 'workspace-relative Handoff routing must not gain carrier-relative path prefixes');
  assert.deepEqual([...packageFileBytes(byPath.get('handoff.workspaces/docs-fixture/content/blob.bin'))], [0, 1, 2, 3, 255, 128, 64]);
  assert.equal(embedded.toolingBootstrapInspection.qualification.filenameOrColocationAuthority, false);
  assert.equal(embedded.toolingBootstrapInspection.counts.errors, 0);

  const cliOutput = path.join(root, 'cli-handoff.zip');
  const cliLines = [];
  const cliCode = await runPortableCli([
    'manufacture-handoff-package', workspaceRoot,
    '--handoff', '.topics/handoff.trace.md',
    '--workspace-id', 'docs-fixture',
    '--output', cliOutput,
    '--built-at', '2026-08-23T10:50:00.000Z',
    '--compact'
  ], { log: (value) => cliLines.push(value), error: (value) => cliLines.push(value) }, { runtimeRoot });
  assert.equal(cliCode, 0);
  const cliResult = JSON.parse(cliLines.at(-1));
  assert.equal(cliResult.status, 'ready');
  assert.equal(cliResult.writeReceipt.status, 'written');
  assert.equal('bundle' in cliResult, false);
  assert.equal(cliResult.planSummary.requiredClosureReady, true);
  assert.equal(cliResult.planSummary.workspaces[0].entryCount, 5);
  assert(Buffer.byteLength(cliLines.at(-1), 'utf8') < 50_000, 'ZIP-output CLI result must remain a bounded verification/receipt summary rather than reserializing carrier bytes');

  const zip = portableRuntimePackageZipBuffer(embedded.bundle);
  const decoded = await zipBufferToImportEntries(zip, { source: 'handoff-manufacture-test', excludeRepositoryInternals: true });
  assert.equal(decoded.errors.length, 0);
  const binaryEntry = decoded.entries.find((entry) => entry.path === 'handoff.workspaces/docs-fixture/content/blob.bin');
  assert(binaryEntry, 'binary workspace carrier must survive Node ZIP serialization');
  assert.deepEqual([...binaryEntry.bytes], [0, 1, 2, 3, 255, 128, 64]);

  const poisonedInspection = inspectPortableToolingBootstrap({
    files: [...embedded.bundle.files, { path: 'tiinex.bootstrap/runtime/unlisted.js', data: new TextEncoder().encode('not authority') }]
  });
  assert.equal(poisonedInspection.status, 'invalid');
  assert(poisonedInspection.findings.some((finding) => finding.code === 'portable.tooling-bootstrap.runtime.unlisted'));

  await assert.rejects(
    prepareNodeHandoffManufacturingInput({ workspaceRoot, workspaceId: 'docs-fixture', handoffPath: '.topics/handoff.trace.md', toolingBootstrap: 'persistent', runtimeRoot }),
    /persistent-verification\.required/
  );
  const persistentInput = await prepareNodeHandoffManufacturingInput({
    workspaceRoot,
    workspaceId: 'docs-fixture',
    handoffPath: '.topics/handoff.trace.md',
    toolingBootstrap: 'persistent',
    runtimeRoot,
    expectedToolingBootstrap: embedded.toolingBootstrapInspection.manifest
  });
  assert.equal(persistentInput.toolingBootstrap.status, 'persistent-identity-verified');
  assert.equal(persistentInput.toolingBootstrap.persistentVerification.state, 'verified');
  const persistent = manufactureRecipientRelativeHandoffPackage(persistentInput, { packageInput: { builtAt: '2026-08-23T10:50:00.000Z' } });
  assert.equal(persistent.status, 'ready');
  assert.equal(persistent.toolingBootstrapInspection.delivery, 'persistent');
  assert.equal(persistent.bundle.files.some((file) => file.path.startsWith('tiinex.bootstrap/runtime/')), false);
  assert.equal(persistent.bundle.files.some((file) => file.path === 'tiinex.bootstrap/manifest.json'), true);

  await assert.rejects(
    prepareNodeHandoffManufacturingInput({
      workspaceRoot,
      workspaceId: 'docs-fixture',
      handoffPath: '.topics/handoff.trace.md',
      toolingBootstrap: 'persistent',
      runtimeRoot,
      expectedToolingBootstrap: { runtime: { representationSha256: '0'.repeat(64) } }
    }),
    /persistent-verification\.representation-mismatch/
  );
} finally {
  await rm(root, { recursive: true, force: true });
}

async function makeWorkspace(rootPath) {
  await mkdir(path.join(rootPath, '.topics'), { recursive: true });
  await mkdir(path.join(rootPath, 'content'), { recursive: true });
  await mkdir(path.join(rootPath, 'tiinex.bootstrap', 'runtime'), { recursive: true });
  await writeFile(path.join(rootPath, '.topics', 'context.md'), '# Context\n\nNon-Site workspace context.\n', 'utf8');
  await writeFile(path.join(rootPath, '.topics', 'handoff.trace.md'), `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.handoff.v1\n  - Created At: 2026-08-23 10:40:00\n\n---\n\n# Non-Site handoff fixture\n\n## Required Context\n\n- context\n  - Material: exact local context\n  - Purpose: prove exact workspace-relative routing\n  - Availability: available\n  - Material Reference: [Context](context.md)\n\n# Continuity Integrity\n\n- sha256-base64url-c14n-v2\n  - Towards: self\n  - Value: fixture\n`, 'utf8');
  await writeFile(path.join(rootPath, 'content', 'a.txt'), 'alpha\n', 'utf8');
  await writeFile(path.join(rootPath, 'content', 'blob.bin'), Uint8Array.from([0, 1, 2, 3, 255, 128, 64]));
  await writeFile(path.join(rootPath, 'tiinex.bootstrap', 'runtime', 'ordinary-workspace-byte.js'), 'export default "ordinary workspace material";\n', 'utf8');
}

async function makeRuntime(rootPath) {
  await mkdir(path.join(rootPath, 'tools'), { recursive: true });
  await mkdir(path.join(rootPath, 'src', 'tooling', 'portable', 'bootstrap'), { recursive: true });
  await mkdir(path.join(rootPath, 'src', 'tooling', 'portable', 'schema', 'bootstrap', 'tiinex.root.v1'), { recursive: true });
  await writeFile(path.join(rootPath, 'tools', 'tiinex-portable.mjs'), "import '../src/runtime.js';\n", 'utf8');
  await writeFile(path.join(rootPath, 'src', 'runtime.js'), "export const runtime = 'fixture';\n", 'utf8');
  await writeFile(path.join(rootPath, 'package.json'), '{"type":"module"}\n', 'utf8');
  await writeFile(path.join(rootPath, 'src', 'tooling', 'portable', 'bootstrap', 'tiinex.llm.bootstrap.md'), '# Portable bootstrap fixture\n', 'utf8');
  await writeFile(path.join(rootPath, 'src', 'tooling', 'portable', 'bootstrap', 'tiinex.llm.bootstrap.pointer.json'), '{"schema":"fixture"}\n', 'utf8');
  await writeFile(path.join(rootPath, 'src', 'tooling', 'portable', 'schema', 'bootstrap', 'tiinex.root.v1', 'schema.md'), '# Canonical schema material fixture\n', 'utf8');
}

console.log('✓ recipient-relative Handoff manufacturing, non-Site routing, bootstrap authority, persistence verification, and binary ZIP fidelity passed');
