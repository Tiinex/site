import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { zipBufferToImportEntries } from '../../../adapters/archive/archive.adapter.js';
import { packageFileBytes } from '../../../export/package.bytes.js';
import { prepareNodeHandoffManufacturingInput, enumerateNodeWorkspace } from '../adapters/node/handoff.manufacture.js';
import { runPortableCli } from '../adapters/cli/cli.run.js';
import { recipientFacingV2PackageZipBuffer } from '../output/recipientV2.zip.js';
import { manufactureRecipientRelativeHandoffPackage } from './manufacture.js';
import { inspectPortableToolingBootstrap } from './toolingBootstrap.js';
import { qualifiedHandoffFixture } from './qualifiedHandoffFixture.js';
import { qualifySelectedHandoffArtifact } from './routeArtifactConformance.js';
import { sealC14nV2Self } from '../../../integrity/integrity.c14nV2.js';
import { C14N_V2_VALIDATOR_TARGET } from '../../../integrity/integrity.methodReference.js';

const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-handoff-manufacture-'));
try {
  const workspaceRoot = path.join(root, 'docs-workspace');
  const runtimeRoot = path.join(root, 'portable-runtime');
  await makeWorkspace(workspaceRoot);
  await makeRuntime(runtimeRoot);

  const firstEnumeration = await enumerateNodeWorkspace(workspaceRoot, { workspaceId: 'docs-fixture' });
  const secondEnumeration = await enumerateNodeWorkspace(workspaceRoot, { workspaceId: 'docs-fixture' });
  assert.equal(firstEnumeration.status, 'qualified-complete');
  assert.equal(firstEnumeration.evidence.entryCount, 6);
  assert.equal(firstEnumeration.evidence.entriesFingerprint, secondEnumeration.evidence.entriesFingerprint);
  assert.deepEqual(firstEnumeration.materialization.entries.map((entry) => entry.path), [...firstEnumeration.materialization.entries.map((entry) => entry.path)].sort());
  const bounded = await enumerateNodeWorkspace(workspaceRoot, { workspaceId: 'docs-fixture', maxFiles: 2 });
  assert.equal(bounded.status, 'file-limit-exceeded');
  assert.equal(bounded.evidence.state, 'blocked');

  const embeddedInput = await prepareNodeHandoffManufacturingInput({
    workspaceRoot,
    workspaceId: 'docs-fixture',
    workspaceTargetPath: 'workspace.workspace.md',
    workspaceTitle: 'Docs Fixture',
    handoffPath: '.topics/handoff.trace.md',
    toolingBootstrap: 'embedded',
    runtimeRoot
  });
  assert.equal(embeddedInput.manufacturingEvidence.enumeration.proof, 'deterministic-node-enumeration-v1');
  const embedded = manufactureRecipientRelativeHandoffPackage(embeddedInput, { legacyRecipientV2Compatibility: true, packageInput: { builtAt: '2026-08-23T10:50:00.000Z' } });
  assert.equal(embedded.status, 'ready');
  assert.deepEqual(embedded.verification, {
    baselineManufacture: 'ready',
    manufacturePath: 'direct-qualified-workspace-to-archive',
    packageInspection: 'valid',
    closureInspection: 'valid',
    carrierInspection: 'valid',
    selectedHandoffConformance: 'qualified',
    pointerEntrypointInspection: 'valid',
    coldConsumerEntrypointInspection: 'valid',
    companionInspection: 'valid',
    roundtrip: 'passed',
    toolingBootstrap: 'valid'
  });
  assert.equal(embedded.plan.requirements.required[0].selectedMaterial.path, '.topics/context.md');
  assert.equal(embedded.plan.requirements.required[0].selectedMaterial.provider.id, 'node-workspace-enumerator');

  const byPath = new Map(embedded.bundle.files.map((file) => [file.path, file]));
  assert(byPath.has('001-1-READ-BEFORE-PROCEEDING.trace.md'));
  assert.equal(embedded.coldConsumerEntrypointInspection.status, 'valid');
  assert.equal(embedded.coldConsumerProjection.workspaces.length, 1);
  assert.equal(embedded.coldConsumerProjection.routes[0].workspaceId, 'docs-fixture');
  const workspaceArchivePath = embedded.descriptor.workspaceArchiveBindings[0].representation.packagePath;
  assert(byPath.has(workspaceArchivePath));
  assert.equal([...byPath.keys()].some((entryPath) => entryPath.startsWith('handoff.workspaces/')), false, 'recipient-v2 manufacture must avoid exploded workspace carriers');
  const workspaceArchiveEntries = await zipBufferToImportEntries(packageFileBytes(byPath.get(workspaceArchivePath)), { source: 'handoff-manufacture-workspace-archive', excludeRepositoryInternals: true });
  assert.equal(workspaceArchiveEntries.errors.length, 0);
  const workspaceBinary = workspaceArchiveEntries.entries.find((entry) => entry.path === 'content/blob.bin');
  assert(workspaceBinary, 'binary workspace carrier must be present inside the exact Workspace archive');
  assert.deepEqual([...workspaceBinary.bytes], [0, 1, 2, 3, 255, 128, 64]);
  assert(workspaceArchiveEntries.entries.some((entry) => entry.path === 'tiinex.bootstrap/runtime/ordinary-workspace-byte.js'));
  assert.equal(workspaceArchiveEntries.entries.some((entry) => entry.path === '.topics/.topics/context.md'), false, 'workspace-relative Handoff routing must not gain carrier-relative path prefixes');
  assert.equal(embedded.toolingBootstrapInspection.qualification.filenameOrColocationAuthority, false);
  assert.equal(embedded.toolingBootstrapInspection.counts.errors, 0);

  const cliOutputDir = path.join(root, 'cli-output');
  const cliLines = [];
  const cliCode = await runPortableCli([
    'manufacture-handoff-package', workspaceRoot,
    '--handoff', '.topics/handoff.trace.md',
    '--workspace-id', 'docs-fixture',
    '--workspace-target', 'workspace.workspace.md',
    '--legacy-recipient-v2-compatibility',
    '--output-dir', cliOutputDir,
    '--built-at', '2026-08-23T10:50:00.000Z',
    '--compact'
  ], { log: (value) => cliLines.push(value), error: (value) => cliLines.push(value) }, { runtimeRoot });
  assert.equal(cliCode, 0);
  const cliResult = JSON.parse(cliLines.at(-1));
  assert.equal(cliResult.status, 'ready');
  assert.equal(cliResult.writeReceipt.status, 'written');
  assert.equal('bundle' in cliResult, false);
  assert.equal(cliResult.planSummary.requiredClosureReady, true);
  assert.equal(cliResult.planSummary.workspaces[0].entryCount, 6);
  assert(Buffer.byteLength(cliLines.at(-1), 'utf8') < 50_000, 'ZIP-output CLI result must remain a bounded verification/receipt summary rather than reserializing carrier bytes');

  const zip = recipientFacingV2PackageZipBuffer(embedded.bundle, { inspection: embedded.inspection });
  const decoded = await zipBufferToImportEntries(zip, { source: 'handoff-manufacture-test', excludeRepositoryInternals: true });
  assert.equal(decoded.errors.length, 0);
  const serializedWorkspaceArchive = decoded.entries.find((entry) => entry.path === workspaceArchivePath);
  assert(serializedWorkspaceArchive, 'Workspace archive must survive Node ZIP serialization');
  const serializedWorkspaceEntries = await zipBufferToImportEntries(serializedWorkspaceArchive.bytes, { source: 'handoff-manufacture-test-workspace-archive', excludeRepositoryInternals: true });
  assert.equal(serializedWorkspaceEntries.errors.length, 0);
  const binaryEntry = serializedWorkspaceEntries.entries.find((entry) => entry.path === 'content/blob.bin');
  assert(binaryEntry, 'binary workspace carrier must survive nested Workspace ZIP serialization');
  assert.deepEqual([...binaryEntry.bytes], [0, 1, 2, 3, 255, 128, 64]);

  const poisonedInspection = inspectPortableToolingBootstrap({
    files: [...embeddedInput.additionalTransportFiles, { path: 'tiinex.bootstrap/runtime/unlisted.js', data: new TextEncoder().encode('not authority') }]
  });
  assert.equal(poisonedInspection.status, 'invalid');
  assert(poisonedInspection.findings.some((finding) => finding.code === 'portable.tooling-bootstrap.runtime.unlisted'));

  await assert.rejects(
    prepareNodeHandoffManufacturingInput({ workspaceRoot, workspaceId: 'docs-fixture', workspaceTargetPath: 'workspace.workspace.md', handoffPath: '.topics/handoff.trace.md', toolingBootstrap: 'persistent', runtimeRoot }),
    /persistent-verification\.required/
  );
  const persistentInput = await prepareNodeHandoffManufacturingInput({
    workspaceRoot,
    workspaceId: 'docs-fixture',
    workspaceTargetPath: 'workspace.workspace.md',
    handoffPath: '.topics/handoff.trace.md',
    toolingBootstrap: 'persistent',
    runtimeRoot,
    expectedToolingBootstrap: embedded.toolingBootstrapInspection.manifest
  });
  assert.equal(persistentInput.toolingBootstrap.status, 'persistent-identity-verified');
  assert.equal(persistentInput.toolingBootstrap.persistentVerification.state, 'verified');
  const persistent = manufactureRecipientRelativeHandoffPackage(persistentInput, { legacyRecipientV2Compatibility: true, packageInput: { builtAt: '2026-08-23T10:50:00.000Z' } });
  assert.equal(persistent.status, 'ready');
  assert.equal(persistent.toolingBootstrapInspection.delivery, 'persistent');
  assert.equal(persistentInput.additionalTransportFiles.some((file) => file.path.startsWith('tiinex.bootstrap/runtime/')), false);
  assert.equal(persistentInput.additionalTransportFiles.some((file) => file.path === 'tiinex.bootstrap/manifest.json'), true);

  await assert.rejects(
    prepareNodeHandoffManufacturingInput({
      workspaceRoot,
      workspaceId: 'docs-fixture',
      workspaceTargetPath: 'workspace.workspace.md',
      handoffPath: '.topics/handoff.trace.md',
      toolingBootstrap: 'persistent',
      runtimeRoot,
      expectedToolingBootstrap: { runtime: { representationSha256: '0'.repeat(64) } }
    }),
    /persistent-verification\.representation-mismatch/
  );


  const invalidHandoffPath = path.join(workspaceRoot, '.topics', 'invalid-handoff.trace.md');
  await writeFile(invalidHandoffPath, qualifiedHandoffFixture({
    title: 'Schema-invalid selected Handoff fixture',
    to: 'Loom',
    purpose: 'prove manufacture readiness consumes exact selected-Handoff conformance',
    createdAt: '2026-08-23 10:45:00',
    transferKind: 'result'
  }), 'utf8');
  const invalidInput = await prepareNodeHandoffManufacturingInput({
    workspaceRoot,
    workspaceId: 'docs-fixture',
    workspaceTargetPath: 'workspace.workspace.md',
    workspaceTitle: 'Docs Fixture',
    handoffPath: '.topics/invalid-handoff.trace.md',
    toolingBootstrap: 'embedded',
    runtimeRoot
  });
  const invalidQualification = qualifySelectedHandoffArtifact({ markdown: await readFile(invalidHandoffPath, 'utf8') });
  assert.equal(invalidQualification.status, 'blocked');
  assert.equal(invalidQualification.selfIntegrity.state, 'verified');
  assert(invalidQualification.findings.some((finding) => finding.code === 'portable.contract.field-domain.value.invalid'));
  const invalidBuilt = manufactureRecipientRelativeHandoffPackage(invalidInput, { legacyRecipientV2Compatibility: true, packageInput: { builtAt: '2026-08-23T10:51:00.000Z' } });
  assert.equal(invalidBuilt.status, 'blocked');
  assert.equal(invalidBuilt.verification.selectedHandoffConformance, 'blocked');
  assert.equal(invalidBuilt.carrierProjection.status, 'blocked');
  assert.equal(invalidBuilt.carrierProjection.routes.length, 0, 'recipient-v2 must not project an unqualified selected Handoff as a route');
  assert(invalidBuilt.findings.some((finding) => finding.code === 'portable.handoff-v2-surface.routes.unqualified'));


  const originalInvalidReturn = await readFile(new URL('./fixtures/027-invalid-return-handoff.fixture.txt', import.meta.url), 'utf8');
  const originalInvalidResult = await readFile(new URL('./fixtures/027-invalid-audit-result.fixture.txt', import.meta.url), 'utf8');
  const originalInvalidRoute = '.topics/development/handoff/loom/027-1-handoff-package-workspace-archive-and-control-plane-minimality-audit-return.trace.md';
  const originalInvalidParent = '.topics/development/tooling/dogfood/027-1-handoff-package-workspace-archive-and-control-plane-minimality-audit-result.trace.md';
  await mkdir(path.join(workspaceRoot, '.topics', 'development', 'handoff', 'loom'), { recursive: true });
  await mkdir(path.join(workspaceRoot, '.topics', 'development', 'tooling', 'dogfood'), { recursive: true });
  await writeFile(path.join(workspaceRoot, originalInvalidRoute), originalInvalidReturn, 'utf8');
  await writeFile(path.join(workspaceRoot, originalInvalidParent), originalInvalidResult, 'utf8');
  const originalInvalidInput = await prepareNodeHandoffManufacturingInput({
    workspaceRoot,
    workspaceId: 'docs-fixture',
    workspaceTargetPath: 'workspace.workspace.md',
    workspaceTitle: 'Docs Fixture',
    handoffPath: originalInvalidRoute,
    toolingBootstrap: 'embedded',
    runtimeRoot
  });
  const originalInvalidQualification = qualifySelectedHandoffArtifact({ markdown: originalInvalidReturn, parentMarkdown: originalInvalidResult });
  assert.equal(originalInvalidQualification.status, 'blocked');
  assert.equal(originalInvalidQualification.selfIntegrity.state, 'verified');
  assert.equal(originalInvalidQualification.parentContinuity.targetResolution.verification.state, 'verified');
  assert(originalInvalidQualification.findings.some((finding) => finding.code === 'portable.contract.section.required.missing'));
  assert(originalInvalidQualification.findings.filter((finding) => finding.code === 'portable.contract.field-domain.value.invalid').length >= 2);
  const originalInvalidBuilt = manufactureRecipientRelativeHandoffPackage(originalInvalidInput, { legacyRecipientV2Compatibility: true, packageInput: { builtAt: '2026-08-23T10:52:00.000Z' } });
  assert.equal(originalInvalidInput.plan?.requiredClosureReady ?? originalInvalidBuilt.plan.requiredClosureReady, true);
  assert.equal(originalInvalidBuilt.status, 'blocked', 'the exact original checksum-valid/schema-invalid return Handoff must suppress manufacture readiness');
  assert.equal(originalInvalidBuilt.verification.selectedHandoffConformance, 'blocked');
  assert.equal(originalInvalidBuilt.carrierProjection.status, 'blocked');
  assert.equal(originalInvalidBuilt.carrierProjection.routes.length, 0, 'recipient-v2 must suppress invalid selected Handoff routes rather than surface them as qualified transport routes');
} finally {
  await rm(root, { recursive: true, force: true });
}

async function makeWorkspace(rootPath) {
  await mkdir(path.join(rootPath, '.topics'), { recursive: true });
  await mkdir(path.join(rootPath, 'content'), { recursive: true });
  await mkdir(path.join(rootPath, 'tiinex.bootstrap', 'runtime'), { recursive: true });
  await writeFile(path.join(rootPath, '.topics', 'context.md'), '# Context\n\nNon-Site workspace context.\n', 'utf8');
  await writeFile(path.join(rootPath, 'workspace.workspace.md'), workspaceMarkdown(), 'utf8');
  await writeFile(path.join(rootPath, '.topics', 'handoff.trace.md'), qualifiedHandoffFixture({
    title: 'Non-Site handoff fixture',
    to: 'Loom',
    purpose: 'prove exact workspace-relative routing',
    createdAt: '2026-08-23 10:40:00',
    requiredContext: `- context\n  - Material: exact local context\n  - Purpose: prove exact workspace-relative routing\n  - Availability: available\n  - Material Reference: [Context](context.md)`
  }), 'utf8');
  await writeFile(path.join(rootPath, 'content', 'a.txt'), 'alpha\n', 'utf8');
  await writeFile(path.join(rootPath, 'content', 'blob.bin'), Uint8Array.from([0, 1, 2, 3, 255, 128, 64]));
  await writeFile(path.join(rootPath, 'tiinex.bootstrap', 'runtime', 'ordinary-workspace-byte.js'), 'export default "ordinary workspace material";\n', 'utf8');
}


function workspaceMarkdown() {
  const unsigned = `# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.workspace.v1
  - Created At: 2026-08-23 10:39:00
  - Authors: Fixture
  - Why: Qualify the exact Workspace carried by the manufacture regression.
  - Summary: Handoff manufacture fixture Workspace.
  - Status: active/local

---

# Manufacture Fixture Workspace

Bounded fixture Workspace.

# Continuity Integrity

- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})
  - Towards: self
  - Value: `;
  const sealed = sealC14nV2Self(unsigned);
  assert.equal(sealed.state, 'sealed');
  return `${sealed.markdown}\n`;
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
