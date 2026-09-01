import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { prepareNodeHandoffManufacturingInput } from '../adapters/node/handoff.manufacture.js';
import { manufactureRecipientRelativeHandoffPackage } from './manufacture.js';
import { qualifiedHandoffFixture } from './qualifiedHandoffFixture.js';
import { sealC14nV2Self, validatedC14nV2PrimarySelfDigest } from '../../../integrity/integrity.c14nV2.js';
import { C14N_V2_VALIDATOR_TARGET } from '../../../integrity/integrity.methodReference.js';
import { inspectRecipientFacingV2Topology } from './recipientV2.inspect.js';
import { inspectStoredWorkspaceArchive } from './workspaceByteProvider.js';
import { packageFileBytes } from '../../../export/package.bytes.js';
import { parseRecipientV2Relation } from './recipientV2.artifacts.js';

const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-bounded-workspace-'));
try {
  const workspaceRoot = path.join(root, 'site');
  const runtimeRoot = path.join(root, 'runtime');
  await mkdir(path.join(workspaceRoot, '.topics'), { recursive: true });
  await writeFile(path.join(workspaceRoot, 'workspace.workspace.md'), workspaceMarkdown(), 'utf8');
  const parentMarkdown = await readFile(new URL('../fixtures/legacy-artifacts/tooling/dogfood/001-site-tooling-v471-portable-lineage-authoring-closure.trace.fixture.txt', import.meta.url), 'utf8');
  const parentDigest = validatedC14nV2PrimarySelfDigest(parentMarkdown);
  assert.equal(parentDigest.state, 'verified');
  await writeFile(path.join(workspaceRoot, '.topics', 'parent.trace.md'), parentMarkdown, 'utf8');
  await writeFile(path.join(workspaceRoot, '.topics', 'handoff.trace.md'), qualifiedHandoffFixture({
    title: 'Bounded Workspace Representation fixture',
    to: 'Loom',
    purpose: 'prove bounded entry-set carriage plus detached Parent recovery',
    createdAt: '2026-08-31 03:00:00',
    parent: { trace: 'parent.trace.md', relative: 'parent.trace.md', towards: 'parent.trace.md', targetValue: parentDigest.value, includeBrowseGit: false }
  }), 'utf8');
  await writeFile(path.join(workspaceRoot, 'omitted.txt'), 'outside bounded representation\n', 'utf8');
  await makeRuntime(runtimeRoot);

  const input = await prepareNodeHandoffManufacturingInput({
    workspaceRoot,
    workspaceId: 'site-bounded',
    workspaceTitle: 'Site bounded fixture',
    workspaceTargetPath: 'workspace.workspace.md',
    handoffPath: '.topics/handoff.trace.md',
    workspaceScopes: [{ workspaceId: 'site-bounded', coverage: 'bounded', include: ['.topics/handoff.trace.md'] }],
    toolingBootstrap: 'embedded',
    runtimeRoot,
    verifyRoundtrip: true,
    carrierLineage: { mode: 'continue', dimension: '001-1', parentDimension: '001', checkpointKind: 'progression' }
  });
  assert.equal(input.workspaceMaterializations[0].state, 'bounded');
  assert.equal(input.workspaceMaterializations[0].scopeEvidence.state, 'qualified');
  assert.deepEqual(input.workspaceMaterializations[0].includedEntries.map((entry) => entry.path), ['.topics/handoff.trace.md', 'workspace.workspace.md']);
  assert(input.requirements.dependencies.some((item) => item.classification === 'parent-boundary' && item.targetPath === '.topics/parent.trace.md'));

  const built = manufactureRecipientRelativeHandoffPackage(input, { verifyRoundtrip: true, packageInput: { builtAt: '2026-08-31T01:00:00.000Z' } });
  assert.equal(built.status, 'ready', JSON.stringify(built.findings, null, 2));
  const binding = built.descriptor.workspaceArchiveBindings[0];
  assert.equal(binding.coverage, 'bounded');
  assert.equal(binding.representation.kind, 'bounded-workspace-snapshot');
  assert.equal(binding.scope.state, 'qualified');
  assert.equal(binding.selection.rule, 'explicit-binding-per-bounded-scope');
  assert.equal(binding.entryMap.count, 2);
  assert.equal(binding.entryMap.entries.some((entry) => entry.path === '.topics/parent.trace.md'), false, 'detached Parent must not enter bounded representation scope');
  assert.equal(binding.entryMap.entries.some((entry) => entry.path === 'omitted.txt'), false, 'ordinary omitted source bytes must remain outside bounded representation');

  const archiveFile = built.bundle.files.find((file) => String(file.path || '') === '001-2-workspace.zip');
  const archive = inspectStoredWorkspaceArchive(packageFileBytes(archiveFile));
  assert.equal(archive.state, 'qualified');
  assert.deepEqual(archive.entries.map((entry) => entry.path), ['.topics/handoff.trace.md', 'workspace.workspace.md']);

  const payloadFile = built.bundle.files.find((file) => String(file.path || '') === '001-2-workspace-payload.trace.md');
  assert.match(new TextDecoder().decode(packageFileBytes(payloadFile)), /Payload Role: bounded Workspace archive representation payload/);
  const relationFile = built.bundle.files.find((file) => String(file.path || '') === '001-3-workspace-representation-relation.trace.md');
  const parsedRelation = parseRecipientV2Relation(new TextDecoder().decode(packageFileBytes(relationFile)));
  assert.equal(parsedRelation.scope, 'bounded recipient-relative workspace materialization');

  const inspection = inspectRecipientFacingV2Topology(built.bundle);
  assert.equal(inspection.status, 'valid', JSON.stringify(inspection.findings, null, 2));
  assert.equal(inspection.phase1?.coverage, 'bounded');
  assert.equal(inspection.phase1?.workspaceTargetQualification?.state, 'qualified');
  assert.equal(inspection.phase1?.carrierProjection?.routes?.[0]?.state, 'qualified');
  assert.equal(inspection.phase1?.caches?.length, 1, 'detached Parent recovery should reuse the Workspace-scoped cache channel');

  console.log('✓ bounded Workspace Representation keeps exact scope distinct from detached Parent recovery and preserves recipient qualification');
} finally {
  await rm(root, { recursive: true, force: true });
}

function workspaceMarkdown() {
  const unsigned = `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.workspace.v1\n  - Created At: 2026-08-31 02:59:00\n  - Authors: Fixture\n  - Why: Qualify the bounded Workspace Representation fixture.\n  - Summary: Bounded Workspace Representation fixture Workspace.\n  - Status: active/local\n\n---\n\n# Bounded Workspace\n\nExact bounded representation fixture.\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: `;
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
