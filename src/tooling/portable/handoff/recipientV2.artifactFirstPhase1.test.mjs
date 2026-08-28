import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { packageFileBytes } from '../../../export/package.bytes.js';
import { sealC14nV2Self, validatedC14nV2PrimarySelfDigest } from '../../../integrity/integrity.c14nV2.js';
import { C14N_V2_VALIDATOR_TARGET } from '../../../integrity/integrity.methodReference.js';
import { prepareNodeHandoffManufacturingInput } from '../adapters/node/handoff.manufacture.js';
import { qualifiedHandoffFixture } from './qualifiedHandoffFixture.js';
import { manufactureRecipientRelativeHandoffPackage } from './manufacture.js';
import { inspectRecipientFacingV2Topology } from './recipientV2.inspect.js';
import { orientColdConsumerFromHandoffPackage } from './coldConsumerEntrypoint.js';
import {
  inspectRecipientV2ArtifactFirstPhase1Specimen,
  RECIPIENT_V2_ARTIFACT_FIRST_PHASE1_FORMAT_ID
} from './recipientV2.artifactFirstPhase1.js';
import { RECIPIENT_V2_TRANSPORT_MANIFEST_PATH } from './recipientV2.transportManifest.js';

const ROOT_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md';
const HANDOFF_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md';
const WORKSPACE_SCHEMA_TARGET = 'site-local:.topics/.schemas/tiinex.workspace.v1.schema.md';

const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-recipient-v2-artifact-first-phase1-'));
try {
  const runtimeRoot = path.join(root, 'runtime');
  const workspaceRoot = path.join(root, 'site');
  await makeRuntime(runtimeRoot);
  await makeWorkspace(workspaceRoot);

  const input = await prepareNodeHandoffManufacturingInput({
    workspaceRoot,
    workspaceId: 'site',
    workspaceTitle: 'Site',
    workspaceTargetPath: 'workspace.workspace.md',
    handoffPath: '.topics/015-handoff.trace.md',
    toolingBootstrap: 'embedded',
    runtimeRoot,
    verifyRoundtrip: true
  });
  const manufactured = manufactureRecipientRelativeHandoffPackage(input, { verifyRoundtrip: true, artifactFirstDualProjectionPhase1: true, packageInput: { builtAt: '2026-08-28T13:00:00.000Z' } });
  assert.equal(manufactured.status, 'ready', JSON.stringify(manufactured.findings || [], null, 2));
  assert.equal(manufactured.verification.roundtrip, 'passed');
  const specimen = { files: manufactured.bundle.files };
  const genericInspection = inspectRecipientFacingV2Topology(manufactured.bundle);
  assert.equal(genericInspection.status, 'valid', JSON.stringify(genericInspection.findings, null, 2));
  assert.equal(genericInspection.phase1.semanticStatus, 'qualified');
  assert.equal(genericInspection.phase1.compatibilityStatus, 'valid');
  assert.equal(genericInspection.format, RECIPIENT_V2_ARTIFACT_FIRST_PHASE1_FORMAT_ID);
  const orientation = orientColdConsumerFromHandoffPackage({ bundle: manufactured.bundle });
  assert.equal(orientation.status, 'ready', JSON.stringify(orientation.entrypoint?.findings || [], null, 2));
  assert.equal(orientation.routes.length, 1);
  assert.equal(orientation.routes[0].workspaceId, 'site');
  assert.equal(orientation.routes[0].workspaceRelativeHandoffPath, '.topics/015-handoff.trace.md');

  const markdown = specimen.files.filter((file) => /\.md$/i.test(String(file.path || '')));
  assert.equal(markdown.length, 5, 'Phase 1 specimen exposes ingress Pointer, bootstrap External Payload, Workspace External Payload, Relation, and route Pointer');
  const bootstrapArtifact = markdown.find((file) => new TextDecoder().decode(packageFileBytes(file)).includes('portable Tooling bootstrap runtime for recipient orientation and verification'));
  assert(bootstrapArtifact, 'carried portable Tooling bootstrap has one visible owning External Payload artifact');
  assert.equal(genericInspection.bootstrapInspection?.status, 'valid');
  assert.equal(genericInspection.phase1.bootstrapQualification?.state, 'qualified');
  assert.equal(genericInspection.phase1.requiredClosure?.state, 'qualified');
  assert.equal(genericInspection.phase1.requiredClosure?.requiredCount, 1);
  assert.equal(genericInspection.phase1.requiredClosure?.qualifiedCount, 1);
  assert.equal(markdown.some((file) => /Current Schema:\s*\[tiinex\.workspace\.v1\]/i.test(new TextDecoder().decode(packageFileBytes(file)))), false, 'no fake outer Workspace wrapper is generated');
  assert.equal(markdown.some((file) => file.transportFacts), false, 'semantic artifacts carry no hidden transportFacts authority');
  assert.equal(specimen.files.filter((file) => String(file.path || '') === RECIPIENT_V2_TRANSPORT_MANIFEST_PATH).length, 1, 'Phase 1 keeps exactly one compatibility JSON companion');

  const manifestFile = specimen.files.find((file) => String(file.path || '') === RECIPIENT_V2_TRANSPORT_MANIFEST_PATH);
  const manifest = JSON.parse(new TextDecoder().decode(packageFileBytes(manifestFile)));
  assert.equal(manifest.format, RECIPIENT_V2_ARTIFACT_FIRST_PHASE1_FORMAT_ID);
  const manifestMarkdownEntries = manifest.entries.filter((entry) => /\.md$/i.test(String(entry.path || '')));
  assert.equal(manifestMarkdownEntries.length, 5);
  assert.equal(manifestMarkdownEntries.filter((entry) => entry.facts?.role === 'tooling-bootstrap').length, 1, 'compatibility JSON derives one bootstrap ownership fact from the visible External Payload artifact');
  assert(manifestMarkdownEntries.every((entry) => entry.facts?.factsFormat === 'portable-recipient-v2'), 'compatibility facts are present as a derived projection');
  assert.equal(manifestMarkdownEntries.some((entry) => entry.facts?.role === 'package-root'), false, 'compatibility JSON does not recreate a fake package-root semantic role');

  const withoutJson = { files: specimen.files.filter((file) => String(file.path || '') !== RECIPIENT_V2_TRANSPORT_MANIFEST_PATH) };
  const semanticOnlyInspection = inspectRecipientV2ArtifactFirstPhase1Specimen(withoutJson);
  assert.equal(semanticOnlyInspection.semanticStatus, 'qualified', JSON.stringify(semanticOnlyInspection.findings, null, 2));
  assert.equal(semanticOnlyInspection.compatibilityStatus, 'absent');
  assert.equal(semanticOnlyInspection.status, 'blocked', 'Phase 1 still requires compatibility JSON even though it is not semantic authority');

  const tamperedFiles = specimen.files.map((file) => {
    if (String(file.path || '') !== RECIPIENT_V2_TRANSPORT_MANIFEST_PATH) return file;
    const parsed = JSON.parse(new TextDecoder().decode(packageFileBytes(file)));
    const relationEntry = parsed.entries.find((entry) => entry.facts?.role === 'workspace-representation');
    relationEntry.facts.workspaceId = 'not-site';
    return { ...file, content: `${JSON.stringify(parsed)}\n`, data: undefined };
  });
  const tamperedInspection = inspectRecipientV2ArtifactFirstPhase1Specimen({ files: tamperedFiles });
  assert.equal(tamperedInspection.semanticStatus, 'qualified', 'semantic artifact qualification is independent of tampered compatibility facts');
  assert.equal(tamperedInspection.compatibilityStatus, 'invalid');
  assert(tamperedInspection.findings.some((item) => item.code === 'portable.handoff-v2-phase1.compatibility.not-derived'));

  console.log('✓ recipient-v2 Phase 1 artifact-first dual projection: semantic artifacts first, compatibility JSON derived, no fake Workspace/package-root authority');
} finally {
  await rm(root, { recursive: true, force: true });
}

async function makeWorkspace(rootPath) {
  await mkdir(path.join(rootPath, '.topics'), { recursive: true });
  await writeFile(path.join(rootPath, 'workspace.workspace.md'), workspaceMarkdown('Site'), 'utf8');
  const parentHandoff = qualifiedHandoffFixture({ title: 'Site parent handoff', to: 'Loom', purpose: 'Phase 1 source fixture', createdAt: '2026-08-28 12:59:00' });
  const parentDigest = validatedC14nV2PrimarySelfDigest(parentHandoff);
  assert.equal(parentDigest.state, 'verified');
  await writeFile(path.join(rootPath, '.topics', '014-parent-handoff.trace.md'), parentHandoff, 'utf8');
  await writeFile(path.join(rootPath, '.topics', 'phase1-context.md'), '# Exact Phase 1 context\n', 'utf8');
  const handoff = qualifiedHandoffFixture({
    title: 'Site Phase 1 handoff', to: 'Anchor', purpose: 'Artifact-first Phase 1 specimen fixture', createdAt: '2026-08-28 13:00:00',
    requiredContext: `- exact-phase1-context
  - Material: exact carried context artifact
  - Material Reference: [Context](phase1-context.md)
  - Purpose: prove Required Context from exact selected Workspace payload bytes
  - Availability: available`,
    parent: {
      schemaId: 'tiinex.handoff.v1', schemaTarget: HANDOFF_SCHEMA_TARGET, createdAt: '2026-08-28 12:59:00',
      trace: '014-parent-handoff.trace.md', relative: '014-parent-handoff.trace.md', includeBrowseGit: false,
      towards: '014-parent-handoff.trace.md', targetValue: parentDigest.value
    }
  });
  await writeFile(path.join(rootPath, '.topics', '015-handoff.trace.md'), handoff, 'utf8');
}
function workspaceMarkdown(title) {
  const unsigned = `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${ROOT_SCHEMA_TARGET})\n- Current\n  - Current Schema: [tiinex.workspace.v1](${WORKSPACE_SCHEMA_TARGET})\n  - Created At: 2026-08-28 13:00:00\n  - Authors: Fixture\n  - Why: Exercise artifact-first Phase 1 dual projection.\n  - Summary: ${title}\n  - Status: active/local\n\n---\n\n# ${title}\n\nWorkspace fixture body.\n\n---\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: pending\n`;
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
  await writeFile(path.join(rootPath, 'src', 'tooling', 'portable', 'bootstrap', 'tiinex.llm.bootstrap.md'), '# Bootstrap\n', 'utf8');
  await writeFile(path.join(rootPath, 'src', 'tooling', 'portable', 'bootstrap', 'tiinex.llm.bootstrap.pointer.json'), '{"schema":"fixture"}\n', 'utf8');
  await writeFile(path.join(rootPath, 'src', 'tooling', 'portable', 'schema', 'bootstrap', 'tiinex.root.v1', 'schema.md'), '# Root\n', 'utf8');
}
