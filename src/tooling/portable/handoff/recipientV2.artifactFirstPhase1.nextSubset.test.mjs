import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { packageFileBytes, sha256Hex } from '../../../export/package.bytes.js';
import { sealC14nV2Self } from '../../../integrity/integrity.c14nV2.js';
import { C14N_V2_VALIDATOR_TARGET } from '../../../integrity/integrity.methodReference.js';
import { prepareNodeHandoffManufacturingInput } from '../adapters/node/handoff.manufacture.js';
import { manufactureRecipientRelativeHandoffPackage } from './manufacture.js';
import { groundPortableColdConsumer } from './coldStartQualification.js';
import { qualifiedHandoffFixture } from './qualifiedHandoffFixture.js';
import { inspectRecipientV2ArtifactFirstPhase1Specimen, qualifyRecipientV2ArtifactFirstPhase1RequiredContextClosure } from './recipientV2.artifactFirstPhase1.js';
import { RECIPIENT_V2_TRANSPORT_MANIFEST_PATH } from './recipientV2.transportManifest.js';

const ROOT_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md';
const WORKSPACE_SCHEMA_TARGET = 'site-local:.topics/.schemas/tiinex.workspace.v1.schema.md';
const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-recipient-v2-phase1-next-subset-'));
try {
  const siteRoot = path.join(root, 'site');
  const docsRoot = path.join(root, 'docs');
  const runtimeRoot = path.join(root, 'runtime');
  await makeWorkspace(siteRoot, 'Site', 'Anchor');
  await makeWorkspace(docsRoot, 'Docs', 'Anchor');
  await makeRuntime(runtimeRoot);

  const input = await prepareNodeHandoffManufacturingInput({
    workspaceRoot: siteRoot,
    workspaceId: 'site',
    workspaceTitle: 'Site',
    workspaceTargetPath: 'workspace.workspace.md',
    handoffPath: '.topics/015-handoff.trace.md',
    additionalWorkspaces: [{ id: 'docs', root: docsRoot, title: 'Docs', workspaceTargetPath: 'workspace.workspace.md' }],
    handoffRoutes: [
      { workspaceId: 'site', path: '.topics/015-handoff.trace.md' },
      { workspaceId: 'docs', path: '.topics/015-handoff.trace.md' }
    ],
    toolingBootstrap: 'embedded',
    runtimeRoot,
    verifyRoundtrip: false
  });

  const noSelector = manufactureRecipientRelativeHandoffPackage(input, { verifyRoundtrip: false, artifactFirstDualProjectionPhase1: true, packageInput: { builtAt: '2026-08-28T14:00:00.000Z' } });
  assert.equal(noSelector.status, 'blocked');
  assert(noSelector.findings.some((item) => item.code === 'portable.handoff-v2-phase1.route-selection.required'), JSON.stringify(noSelector.findings, null, 2));

  const ambiguous = manufactureRecipientRelativeHandoffPackage({ ...input, recipientRouteSelector: '.topics/015-handoff.trace.md' }, { verifyRoundtrip: false, artifactFirstDualProjectionPhase1: true, packageInput: { builtAt: '2026-08-28T14:00:00.000Z' } });
  assert.equal(ambiguous.status, 'blocked');
  assert(ambiguous.findings.some((item) => item.code === 'portable.handoff-v2-phase1.route-selection.ambiguous'), JSON.stringify(ambiguous.findings, null, 2));

  const selected = manufactureRecipientRelativeHandoffPackage({ ...input, verifyRoundtrip: true, recipientRouteSelector: 'site:.topics/015-handoff.trace.md' }, { verifyRoundtrip: true, artifactFirstDualProjectionPhase1: true, packageInput: { builtAt: '2026-08-28T14:00:00.000Z' } });
  assert.equal(selected.status, 'ready', JSON.stringify(selected.findings, null, 2));
  assert.equal(selected.verification.roundtrip, 'passed');
  assert.equal(selected.inspection.phase1.routeSelection.mode, 'explicit-qualified-route-selector');
  assert.equal(selected.inspection.phase1.routeSelection.candidateCount, 2);
  assert.equal(selected.inspection.carrierProjection.selection.policy, 'explicit-qualified-route-bound');
  assert.equal(selected.inspection.carrierProjection.selection.sourceCandidateRouteCount, 2);
  assert.equal(selected.inspection.carrierProjection.routes.length, 1);
  assert.equal(selected.inspection.carrierProjection.routes[0].workspaceId, 'site');
  assert.equal(selected.inspection.carrierProjection.routes[0].requiredClosure.state, 'qualified');
  assert.equal(selected.inspection.carrierProjection.routes[0].requiredClosure.requiredCount, 1);
  assert.equal(selected.inspection.bootstrapInspection.status, 'valid');

  const semantic = selected.bundle.files.filter((file) => String(file.path || '') !== RECIPIENT_V2_TRANSPORT_MANIFEST_PATH);
  const bootstrapArtifact = semantic.find((file) => /bootstrap\.trace\.md$/i.test(String(file.path || '')));
  const bootstrapArchive = semantic.find((file) => /bootstrap\.zip$/i.test(String(file.path || '')));
  assert(bootstrapArtifact && bootstrapArchive, 'selected Phase 1 specimen carries one bootstrap owner artifact and one exact bootstrap payload');
  const bootstrapMarkdown = new TextDecoder().decode(packageFileBytes(bootstrapArtifact));
  assert.match(bootstrapMarkdown, /Current Schema:\s*\[tiinex\.external\.payload\.v1\]/i);
  assert.match(bootstrapMarkdown, /Payload Role:\s*portable Tooling bootstrap runtime for recipient orientation and verification/i);
  assert.match(bootstrapMarkdown, new RegExp(`Byte Size:\\s*${bootstrapArchive.bytes}`));
  assert.match(bootstrapMarkdown, new RegExp(`Integrity Value:\\s*${bootstrapArchive.sha256}`));
  assert.doesNotMatch(bootstrapMarkdown, /^- Parent\b/m, 'bootstrap ownership is visible payload identity, not Parent/package authority');

  const missingBootstrap = inspectRecipientV2ArtifactFirstPhase1Specimen({ files: selected.bundle.files.filter((file) => String(file.path || '') !== String(bootstrapArchive.path || '')) });
  assert.equal(missingBootstrap.semanticStatus, 'blocked');
  assert(missingBootstrap.findings.some((item) => item.code === 'portable.handoff-v2-phase1.bootstrap.location-unresolved'));

  const withoutCompatibility = inspectRecipientV2ArtifactFirstPhase1Specimen({ files: semantic });
  assert.equal(withoutCompatibility.semanticStatus, 'qualified');
  assert.equal(withoutCompatibility.compatibilityStatus, 'absent');

  const requiredMarkdown = qualifiedHandoffFixture({
    title: 'Required Context exact-byte fixture',
    to: 'Anchor',
    requiredContext: `- exact-context\n  - Material: exact local context\n  - Material Reference: [Context](context.md)\n  - Purpose: prove exact selected Workspace payload closure\n  - Availability: available`
  });
  const exact = new TextEncoder().encode('# exact context\n');
  const exactEntry = Object.freeze({ path: '.topics/context.md', data: exact, bytes: exact.byteLength, sha256: sha256Hex(exact) });
  const missingClosure = qualifyRecipientV2ArtifactFirstPhase1RequiredContextClosure({ markdown: requiredMarkdown, routePath: '.topics/015-handoff.trace.md', workspaceId: 'site', archivePath: '001-2-workspace.zip', entries: [] });
  assert.equal(missingClosure.state, 'blocked');
  assert(missingClosure.requirements[0].reasons.includes('required-workspace-entry-missing'));
  assert(missingClosure.findings.some((item) => item.code === 'portable.handoff-v2-phase1.required-context.required-workspace-entry-missing'));
  const ambiguousClosure = qualifyRecipientV2ArtifactFirstPhase1RequiredContextClosure({ markdown: requiredMarkdown, routePath: '.topics/015-handoff.trace.md', workspaceId: 'site', archivePath: '001-2-workspace.zip', entries: [exactEntry, exactEntry] });
  assert.equal(ambiguousClosure.state, 'blocked');
  assert(ambiguousClosure.requirements[0].reasons.includes('required-workspace-entry-ambiguous'));
  const exactClosure = qualifyRecipientV2ArtifactFirstPhase1RequiredContextClosure({ markdown: requiredMarkdown, routePath: '.topics/015-handoff.trace.md', workspaceId: 'site', archivePath: '001-2-workspace.zip', entries: [exactEntry] });
  assert.equal(exactClosure.state, 'qualified');
  assert.equal(exactClosure.requirements[0].resolution.innerPath, '.topics/context.md');
  assert.equal(exactClosure.requirements[0].resolution.sha256, sha256Hex(exact));

  const cacheRoleRoot = path.join(root, 'cache-role');
  await makeWorkspace(cacheRoleRoot, 'Cache Role', 'Loom', { requiredTarget: 'external://phase1/context' });
  const detachedRolePath = path.join(root, 'sigma-role.trace.md');
  await writeFile(detachedRolePath, participantRoleMarkdown('Sigma'), 'utf8');
  const cacheRoleInput = await prepareNodeHandoffManufacturingInput({
    workspaceRoot: cacheRoleRoot,
    workspaceId: 'cache-role',
    workspaceTitle: 'Cache Role',
    workspaceTargetPath: 'workspace.workspace.md',
    handoffPath: '.topics/015-handoff.trace.md',
    handoffRoutes: [{ workspaceId: 'cache-role', path: '.topics/015-handoff.trace.md', participantRoles: [{ reference: 'external://roles/sigma', label: 'Sigma' }] }],
    materialBindings: {
      'external://phase1/context': { content: 'phase1-detached-context-bytes', providerId: 'fixture-phase1-context', providerKind: 'supplied-material', referenceTarget: 'external://phase1/context' },
      Sigma: { sourcePath: detachedRolePath, referenceTarget: 'external://roles/sigma' }
    },
    toolingBootstrap: 'embedded',
    runtimeRoot,
    verifyRoundtrip: true
  });
  const cacheRole = manufactureRecipientRelativeHandoffPackage(cacheRoleInput, { verifyRoundtrip: true, artifactFirstDualProjectionPhase1: true, packageInput: { builtAt: '2026-08-28T14:00:00.000Z' } });
  assert.equal(cacheRole.status, 'ready', JSON.stringify(cacheRole.findings, null, 2));
  assert.equal(cacheRole.inspection.phase1.requiredClosure.state, 'qualified', JSON.stringify(cacheRole.inspection.phase1.requiredClosure, null, 2));
  assert.equal(cacheRole.inspection.caches.length, 1, 'selected-route detached material must be owned by one visible cache External Payload');
  assert.equal(cacheRole.inspection.participantRoles.length, 1, 'selected-route participant Role must have one explicit package-local Pointer');
  assert.equal(cacheRole.inspection.participantRoles[0].targetCarrierKind, 'workspace-cache-entry');
  assert.equal(cacheRole.inspection.routes[0].participantRolePointers.length, 1);
  const cacheArtifact = cacheRole.bundle.files.find((file) => String(file.path || '') === cacheRole.inspection.caches[0].artifactPath);
  const cacheArchive = cacheRole.bundle.files.find((file) => String(file.path || '') === cacheRole.inspection.caches[0].archivePath);
  assert(cacheArtifact && cacheArchive);
  const cacheMarkdown = new TextDecoder().decode(packageFileBytes(cacheArtifact));
  assert.match(cacheMarkdown, /Current Schema:\s*\[tiinex\.external\.payload\.v1\]/i);
  assert.match(cacheMarkdown, /Payload Role:\s*workspace-scoped Handoff dependency cache/i);
  assert.match(cacheMarkdown, /Material Reference:\s*external:\/\/phase1\/context/i);
  assert.match(cacheMarkdown, /Material Reference:\s*external:\/\/roles\/sigma/i);
  assert.match(cacheMarkdown, new RegExp(`Integrity Value:\\s*${cacheArchive.sha256}`));

  const cacheRoleGrounding = groundPortableColdConsumer({ bundle: cacheRole.bundle, route: cacheRole.carrierProjection.routes[0].id, toolingAvailable: true, interaction: { mode: 'orientation' } });
  assert.notEqual(cacheRoleGrounding.status, 'blocked', JSON.stringify(cacheRoleGrounding.findings, null, 2));
  assert.equal(cacheRoleGrounding.participation.packageRoleParticipants.length, 1);
  assert.deepEqual(cacheRoleGrounding.participation.packageRoleParticipants[0].roles, ['Sigma']);
  assert.equal(cacheRoleGrounding.participation.packageRoleParticipants[0].identities.length, 0, 'Role carriage must not invent holder identity');

  const cacheRoleSemantic = cacheRole.bundle.files.filter((file) => String(file.path || '') !== RECIPIENT_V2_TRANSPORT_MANIFEST_PATH);
  const cacheRoleWithoutCompatibility = inspectRecipientV2ArtifactFirstPhase1Specimen({ files: cacheRoleSemantic });
  assert.equal(cacheRoleWithoutCompatibility.semanticStatus, 'qualified', JSON.stringify(cacheRoleWithoutCompatibility.findings, null, 2));
  assert.equal(cacheRoleWithoutCompatibility.compatibilityStatus, 'absent');
  assert.equal(cacheRoleWithoutCompatibility.caches.length, 1);
  assert.equal(cacheRoleWithoutCompatibility.participantRoles.length, 1);

  const missingCachePayload = inspectRecipientV2ArtifactFirstPhase1Specimen({ files: cacheRole.bundle.files.filter((file) => String(file.path || '') !== String(cacheArchive.path || '')) });
  assert.equal(missingCachePayload.semanticStatus, 'blocked');
  assert(missingCachePayload.findings.some((item) => item.code === 'portable.handoff-v2-phase1.cache.location-unresolved'));

  const participantPointerPath = cacheRole.inspection.routes[0].participantRolePointers[0];
  const missingParticipantPointer = inspectRecipientV2ArtifactFirstPhase1Specimen({ files: cacheRole.bundle.files.filter((file) => String(file.path || '') !== participantPointerPath) });
  assert.equal(missingParticipantPointer.semanticStatus, 'blocked');
  assert(missingParticipantPointer.findings.some((item) => item.code === 'portable.handoff-v2-phase1.participant-role.pointer-missing'));

  console.log('✓ recipient-v2 Phase 1 next subset: bootstrap ownership, exact Required Context closure, detached-cache ownership, participant-role grounding, explicit multi-route selection, and compatibility non-authority passed');
} finally {
  await rm(root, { recursive: true, force: true });
}

async function makeWorkspace(rootPath, title, to, options = {}) {
  await mkdir(path.join(rootPath, '.topics'), { recursive: true });
  await writeFile(path.join(rootPath, 'workspace.workspace.md'), workspaceMarkdown(title), 'utf8');
  await writeFile(path.join(rootPath, '.topics', 'context.md'), `# ${title} exact context\n`, 'utf8');
  await writeFile(path.join(rootPath, '.topics', '015-handoff.trace.md'), qualifiedHandoffFixture({
    title: `${title} Phase 1 next-subset handoff`,
    to,
    purpose: 'Artifact-first Phase 1 bootstrap/context/multi-route fixture',
    createdAt: '2026-08-28 14:00:00',
    requiredContext: `- exact-${title.toLowerCase()}-context\n  - Material: exact local context\n  - Material Reference: [Context](${options.requiredTarget || 'context.md'})\n  - Purpose: prove exact selected Workspace/cache payload closure\n  - Availability: available`
  }), 'utf8');
}
function workspaceMarkdown(title) {
  const unsigned = `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${ROOT_SCHEMA_TARGET})\n- Current\n  - Current Schema: [tiinex.workspace.v1](${WORKSPACE_SCHEMA_TARGET})\n  - Created At: 2026-08-28 14:00:00\n  - Authors: Fixture\n  - Why: Exercise artifact-first Phase 1 next subset.\n  - Summary: ${title}\n  - Status: active/local\n\n---\n\n# ${title}\n\nWorkspace fixture body.\n\n---\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: pending\n`;
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

function participantRoleMarkdown(label) {
  return `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.party.role.v1\n  - Created At: 2026-08-28 14:00:00\n\n---\n\n# ${label}\n\n## Role Identity\n\n- Role Label: ${label}\n- Role Kind: bounded participant role\n\n## Role Boundary\n\n- In Scope: bounded interaction grounding\n- Out Of Scope: inferred holder identity\n\n## Authority And Responsibility Boundary\n\n- May Do: participate within declared Role boundary\n- Does Not Authorize: transport identity inference\n\n## Holder Relationship\n\n- Holder State: unproven\n\n## Interpretation Limits\n\n- Does Not Prove: holder identity\n- Must Not Be Treated As: Handoff endpoint promotion\n\n# Continuity Integrity\n`;
}
