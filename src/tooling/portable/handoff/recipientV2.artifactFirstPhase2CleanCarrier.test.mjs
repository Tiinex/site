import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { packageFileBytes } from '../../../export/package.bytes.js';
import { sealC14nV2Self } from '../../../integrity/integrity.c14nV2.js';
import { C14N_V2_VALIDATOR_TARGET } from '../../../integrity/integrity.methodReference.js';
import { prepareNodeHandoffManufacturingInput } from '../adapters/node/handoff.manufacture.js';
import { runPortableCli } from '../adapters/cli/cli.run.js';
import { loadNodePortableInput } from '../input/node.input.js';
import { manufactureRecipientRelativeHandoffPackage } from './manufacture.js';
import { groundPortableColdConsumer, qualifyPortableColdStart } from './coldStartQualification.js';
import { orientColdConsumerFromHandoffPackage } from './coldConsumerEntrypoint.js';
import { qualifiedHandoffFixture } from './qualifiedHandoffFixture.js';
import { inspectRecipientFacingV2Topology } from './recipientV2.inspect.js';
import {
  inspectRecipientV2ArtifactFirstPhase1Specimen,
  RECIPIENT_V2_ARTIFACT_FIRST_PHASE2_CLEAN_FORMAT_ID
} from './recipientV2.artifactFirstPhase1.js';
import { RECIPIENT_V2_TRANSPORT_MANIFEST_PATH } from './recipientV2.transportManifest.js';

const ROOT_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md';
const WORKSPACE_SCHEMA_TARGET = 'site-local:.topics/.schemas/tiinex.workspace.v1.schema.md';
const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-recipient-v2-phase2-clean-carrier-'));
try {
  const siteRoot = path.join(root, 'site');
  const docsRoot = path.join(root, 'docs');
  const runtimeRoot = path.join(root, 'runtime');
  await makeWorkspace(siteRoot, 'Site', 'Anchor');
  await makeWorkspace(docsRoot, 'Docs', 'Anchor');
  await makeRuntime(runtimeRoot);

  const multiInput = await prepareNodeHandoffManufacturingInput({
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

  const noSelector = manufactureRecipientRelativeHandoffPackage(multiInput, {
    verifyRoundtrip: false,
    packageInput: { builtAt: '2026-08-28T19:15:00.000Z' }
  });
  assert.equal(noSelector.status, 'blocked');
  assert(noSelector.findings.some((item) => item.code === 'portable.handoff-v2-phase1.route-selection.required'), JSON.stringify(noSelector.findings, null, 2));

  const ambiguous = manufactureRecipientRelativeHandoffPackage({ ...multiInput, recipientRouteSelector: '.topics/015-handoff.trace.md' }, {
    verifyRoundtrip: false,
    packageInput: { builtAt: '2026-08-28T19:15:00.000Z' }
  });
  assert.equal(ambiguous.status, 'blocked');
  assert(ambiguous.findings.some((item) => item.code === 'portable.handoff-v2-phase1.route-selection.ambiguous'), JSON.stringify(ambiguous.findings, null, 2));

  const selected = manufactureRecipientRelativeHandoffPackage({ ...multiInput, verifyRoundtrip: true, recipientRouteSelector: 'site:.topics/015-handoff.trace.md' }, {
    verifyRoundtrip: true,
    packageInput: { builtAt: '2026-08-28T19:15:00.000Z' }
  });
  assert.equal(selected.status, 'ready', JSON.stringify(selected.findings, null, 2));
  assert.equal(selected.inspection.phase1.cleanCarrierPhase2, true, 'ordinary manufacture selects clean Phase 2 without an opt-in flag');
  assert.equal(selected.verification.roundtrip, 'passed');
  assert.equal(selected.bundle.files.some((file) => String(file.path || '') === RECIPIENT_V2_TRANSPORT_MANIFEST_PATH), false, 'clean carrier stores no compatibility JSON');
  assert.equal(selected.inspection.format, RECIPIENT_V2_ARTIFACT_FIRST_PHASE2_CLEAN_FORMAT_ID);
  assert.equal(selected.inspection.phase1.cleanCarrierPhase2, true);
  assert.equal(selected.inspection.phase1.semanticStatus, 'qualified');
  assert.equal(selected.inspection.phase1.compatibilityStatus, 'omitted-qualified');
  assert.equal(selected.inspection.phase1.requiredClosure.state, 'qualified');
  assert.equal(selected.inspection.phase1.bootstrapQualification.state, 'qualified');
  assert.equal(selected.inspection.phase1.routeSelection.mode, 'explicit-qualified-route-selector');
  assert.equal(selected.inspection.phase1.routeSelection.candidateCount, 2);
  assert.equal(selected.inspection.carrierProjection.selection.policy, 'explicit-qualified-route-bound');
  assert.equal(selected.inspection.carrierProjection.routes[0].workspaceId, 'site');
  assert.equal(selected.inspection.carrierProjection.routes[0].requiredClosure.state, 'qualified');

  const generic = inspectRecipientFacingV2Topology(selected.bundle);
  assert.equal(generic.status, 'valid', JSON.stringify(generic.findings, null, 2));
  assert.equal(generic.format, RECIPIENT_V2_ARTIFACT_FIRST_PHASE2_CLEAN_FORMAT_ID);
  const orientation = orientColdConsumerFromHandoffPackage({ bundle: selected.bundle });
  assert.equal(orientation.status, 'ready', JSON.stringify(orientation.entrypoint?.findings || [], null, 2));
  assert.equal(orientation.routes.length, 1);
  assert.equal(orientation.routes[0].workspaceId, 'site');
  assert.equal(orientation.routes[0].workspaceRelativeHandoffPath, '.topics/015-handoff.trace.md');


  const defaultCliOutputDir = path.join(root, 'default-cli-output');
  const defaultCliLines = [];
  const defaultCliCode = await runPortableCli([
    'manufacture-handoff-package', siteRoot,
    '--handoff', '.topics/015-handoff.trace.md',
    '--route', '.topics/015-handoff.trace.md',
    '--workspace-id', 'site',
    '--workspace-target', 'workspace.workspace.md',
    '--output-dir', defaultCliOutputDir,
    '--built-at', '2026-08-28T19:15:00.000Z',
    '--compact'
  ], { log: (value) => defaultCliLines.push(value), error: (value) => defaultCliLines.push(value) }, { runtimeRoot });
  assert.equal(defaultCliCode, 0, JSON.stringify(defaultCliLines, null, 2));
  const defaultCliResult = JSON.parse(defaultCliLines.at(-1));
  assert.equal(defaultCliResult.status, 'ready');
  assert(defaultCliResult.primaryOutput?.path, 'ordinary default CLI manufacture must write one package');
  const defaultPackage = await loadNodePortableInput([defaultCliResult.primaryOutput.path]);
  assert.equal(defaultPackage.files.some((file) => String(file.path || '') === RECIPIENT_V2_TRANSPORT_MANIFEST_PATH), false, 'actual default-manufactured ZIP stores no compatibility JSON');
  const defaultPackageInspection = inspectRecipientFacingV2Topology(defaultPackage);
  assert.equal(defaultPackageInspection.status, 'valid', JSON.stringify(defaultPackageInspection.findings, null, 2));
  assert.equal(defaultPackageInspection.format, RECIPIENT_V2_ARTIFACT_FIRST_PHASE2_CLEAN_FORMAT_ID);
  assert.equal(defaultPackageInspection.phase1.cleanCarrierPhase2, true);
  const defaultPackageOrientation = orientColdConsumerFromHandoffPackage({ bundle: defaultPackage });
  assert.equal(defaultPackageOrientation.status, 'ready', JSON.stringify(defaultPackageOrientation.findings || [], null, 2));
  assert.equal(defaultPackageOrientation.routes.length, 1);
  const defaultRoutePointer = defaultPackageOrientation.routes[0].pointerPath;
  const defaultQualification = qualifyPortableColdStart({
    bundle: defaultPackage,
    route: defaultRoutePointer,
    preTakeover: 'minimal-bootstrap-only',
    packageSourcePath: defaultCliResult.primaryOutput.path
  });
  assert.equal(defaultQualification.status, 'preferred-pass', JSON.stringify(defaultQualification.findings || [], null, 2));
  assert.notEqual(defaultQualification.grounding.status, 'blocked', JSON.stringify(defaultQualification.grounding.findings || [], null, 2));

  const projectedLines = [];
  const projectedCode = await runPortableCli([
    'project-handoff-carrier-output', defaultCliResult.primaryOutput.path,
    '--route', '.topics/015-handoff.trace.md',
    '--compact'
  ], { log: (value) => projectedLines.push(value), error: (value) => projectedLines.push(value) });
  assert.equal(projectedCode, 0, JSON.stringify(projectedLines, null, 2));
  const projected = JSON.parse(projectedLines.at(-1));
  const expectedProjectedFilename = 'site-001-anchor-to-anchor.handoff-package.zip';
  const expectedProjectedRouting = `Handoff package attached.\n\nCold start: read Start directly; do not list or extract this package.\n\nStart:\n001-1-READ-BEFORE-PROCEEDING.trace.md\nContinue from (do not read native; pass to Tiinex after bootstrap):\n${defaultRoutePointer}\n`;
  assert.equal(defaultCliResult.primaryOutput.projectedFilename, expectedProjectedFilename, 'ordinary default manufacture must preserve the readable qualified human filename family');
  assert.equal(projected.status, 'ready', JSON.stringify(projected.findings || [], null, 2));
  assert.equal(projected.humanOutput.primary.filename, expectedProjectedFilename, 'serialized clean package must independently regenerate the same readable filename');
  assert.equal(projected.humanOutput.normalInlineRouting.content, expectedProjectedRouting, 'serialized clean package must independently regenerate exact Start plus one Continue-from address');
  assert.equal(defaultPackage.files.some((file) => String(file.path || '') === RECIPIENT_V2_TRANSPORT_MANIFEST_PATH), false, 'human projection parity must not depend on restored compatibility JSON');

  const bootstrapArchive = selected.bundle.files.find((file) => /bootstrap\.zip$/i.test(String(file.path || '')));
  assert(bootstrapArchive);
  const missingBootstrap = inspectRecipientV2ArtifactFirstPhase1Specimen({ files: selected.bundle.files.filter((file) => String(file.path || '') !== String(bootstrapArchive.path || '')) });
  assert.equal(missingBootstrap.status, 'blocked');
  assert.equal(missingBootstrap.semanticStatus, 'blocked');
  assert(missingBootstrap.findings.some((item) => item.code === 'portable.handoff-v2-phase1.bootstrap.location-unresolved'));

  const phase1Compatibility = manufactureRecipientRelativeHandoffPackage({ ...multiInput, verifyRoundtrip: true, recipientRouteSelector: 'site:.topics/015-handoff.trace.md' }, {
    verifyRoundtrip: true,
    artifactFirstDualProjectionPhase1: true,
    packageInput: { builtAt: '2026-08-28T19:15:00.000Z' }
  });
  assert.equal(phase1Compatibility.status, 'ready', JSON.stringify(phase1Compatibility.findings, null, 2));
  assert.equal(phase1Compatibility.bundle.files.filter((file) => String(file.path || '') === RECIPIENT_V2_TRANSPORT_MANIFEST_PATH).length, 1, 'explicit Phase 1 compatibility mode still emits one derived JSON companion');
  const phase1SemanticOnly = inspectRecipientV2ArtifactFirstPhase1Specimen({ files: phase1Compatibility.bundle.files.filter((file) => String(file.path || '') !== RECIPIENT_V2_TRANSPORT_MANIFEST_PATH) });
  assert.equal(phase1SemanticOnly.semanticStatus, 'qualified');
  assert.equal(phase1SemanticOnly.compatibilityStatus, 'absent');
  assert.equal(phase1SemanticOnly.status, 'blocked', 'JSON absence alone does not silently promote an old Phase 1 carrier into clean mode');

  const phase1Manifest = phase1Compatibility.bundle.files.find((file) => String(file.path || '') === RECIPIENT_V2_TRANSPORT_MANIFEST_PATH);
  const dirtyClean = inspectRecipientV2ArtifactFirstPhase1Specimen({ files: [...selected.bundle.files, phase1Manifest] });
  assert.equal(dirtyClean.status, 'blocked');
  assert(dirtyClean.findings.some((item) => item.code === 'portable.handoff-v2-phase2.compatibility.present'), JSON.stringify(dirtyClean.findings, null, 2));

  const cacheRoleRoot = path.join(root, 'cache-role');
  await makeWorkspace(cacheRoleRoot, 'Cache Role', 'Loom', { requiredTarget: 'external://phase2/context' });
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
      'external://phase2/context': { content: 'phase2-detached-context-bytes', providerId: 'fixture-phase2-context', providerKind: 'supplied-material', referenceTarget: 'external://phase2/context' },
      Sigma: { sourcePath: detachedRolePath, referenceTarget: 'external://roles/sigma' }
    },
    toolingBootstrap: 'embedded',
    runtimeRoot,
    verifyRoundtrip: true
  });
  const cacheRole = manufactureRecipientRelativeHandoffPackage(cacheRoleInput, {
    verifyRoundtrip: true,
    packageInput: { builtAt: '2026-08-28T19:16:00.000Z' }
  });
  assert.equal(cacheRole.status, 'ready', JSON.stringify(cacheRole.findings, null, 2));
  assert.equal(cacheRole.verification.roundtrip, 'passed');
  assert.equal(cacheRole.bundle.files.some((file) => String(file.path || '') === RECIPIENT_V2_TRANSPORT_MANIFEST_PATH), false);
  assert.equal(cacheRole.inspection.phase1.requiredClosure.state, 'qualified');
  assert.equal(cacheRole.inspection.caches.length, 1);
  assert.equal(cacheRole.inspection.participantRoles.length, 1);
  assert.equal(cacheRole.inspection.participantRoles[0].targetCarrierKind, 'workspace-cache-entry');
  assert.equal(cacheRole.inspection.routes[0].participantRolePointers.length, 1);

  const grounding = groundPortableColdConsumer({ bundle: cacheRole.bundle, route: cacheRole.carrierProjection.routes[0].id, toolingAvailable: true, interaction: { mode: 'orientation' } });
  assert.notEqual(grounding.status, 'blocked', JSON.stringify(grounding.findings, null, 2));
  assert.equal(grounding.participation.packageRoleParticipants.length, 1);
  assert.deepEqual(grounding.participation.packageRoleParticipants[0].roles, ['Sigma']);
  assert.equal(grounding.participation.packageRoleParticipants[0].identities.length, 0, 'clean carrier Role grounding must not invent holder identity');

  const cacheArchive = cacheRole.bundle.files.find((file) => String(file.path || '') === cacheRole.inspection.caches[0].archivePath);
  assert(cacheArchive);
  const missingCache = inspectRecipientV2ArtifactFirstPhase1Specimen({ files: cacheRole.bundle.files.filter((file) => String(file.path || '') !== String(cacheArchive.path || '')) });
  assert.equal(missingCache.status, 'blocked');
  assert.equal(missingCache.semanticStatus, 'blocked');
  assert(missingCache.findings.some((item) => item.code === 'portable.handoff-v2-phase1.cache.location-unresolved'));

  const participantPointerPath = cacheRole.inspection.routes[0].participantRolePointers[0];
  const missingParticipant = inspectRecipientV2ArtifactFirstPhase1Specimen({ files: cacheRole.bundle.files.filter((file) => String(file.path || '') !== participantPointerPath) });
  assert.equal(missingParticipant.status, 'blocked');
  assert.equal(missingParticipant.semanticStatus, 'blocked');
  assert(missingParticipant.findings.some((item) => item.code === 'portable.handoff-v2-phase1.participant-role.pointer-missing'));

  const routePointerPath = cacheRole.inspection.routes[0].pointerPath;
  const missingRoute = inspectRecipientV2ArtifactFirstPhase1Specimen({ files: cacheRole.bundle.files.filter((file) => String(file.path || '') !== routePointerPath) });
  assert.equal(missingRoute.status, 'blocked');
  assert.equal(missingRoute.semanticStatus, 'blocked');
  assert(missingRoute.findings.some((item) => item.code === 'portable.handoff-v2-phase1.route.count'));

  console.log('✓ recipient-v2 Phase 2 default clean carrier: ordinary CLI ZIP has no compatibility JSON, cold-start qualifies, explicit compatibility paths remain readable, and adversarial fail-closed behavior passed');
} finally {
  await rm(root, { recursive: true, force: true });
}

async function makeWorkspace(rootPath, title, to, options = {}) {
  await mkdir(path.join(rootPath, '.topics'), { recursive: true });
  await writeFile(path.join(rootPath, 'workspace.workspace.md'), workspaceMarkdown(title), 'utf8');
  await writeFile(path.join(rootPath, '.topics', 'context.md'), `# ${title} exact context\n`, 'utf8');
  await writeFile(path.join(rootPath, '.topics', '015-handoff.trace.md'), qualifiedHandoffFixture({
    title: `${title} Phase 2 clean-carrier handoff`,
    to,
    purpose: 'Artifact-first Phase 2 clean-carrier fixture',
    createdAt: '2026-08-28 19:15:00',
    requiredContext: `- exact-${title.toLowerCase()}-context\n  - Material: exact local context\n  - Material Reference: [Context](${options.requiredTarget || 'context.md'})\n  - Purpose: prove exact selected Workspace/cache payload closure without compatibility JSON\n  - Availability: available`
  }), 'utf8');
}

function workspaceMarkdown(title) {
  const unsigned = `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${ROOT_SCHEMA_TARGET})\n- Current\n  - Current Schema: [tiinex.workspace.v1](${WORKSPACE_SCHEMA_TARGET})\n  - Created At: 2026-08-28 19:15:00\n  - Authors: Fixture\n  - Why: Exercise artifact-first Phase 2 clean-carrier qualification.\n  - Summary: ${title}\n  - Status: active/local\n\n---\n\n# ${title}\n\nWorkspace fixture body.\n\n---\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: pending\n`;
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
  return `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.party.role.v1\n  - Created At: 2026-08-28 19:15:00\n\n---\n\n# ${label}\n\n## Role Identity\n\n- Role Label: ${label}\n- Role Kind: bounded participant role\n\n## Role Boundary\n\n- In Scope: bounded interaction grounding\n- Out Of Scope: inferred holder identity\n\n## Authority And Responsibility Boundary\n\n- May Do: participate within declared Role boundary\n- Does Not Authorize: transport identity inference\n\n## Holder Relationship\n\n- Holder State: unproven\n\n## Interpretation Limits\n\n- Does Not Prove: holder identity\n- Must Not Be Treated As: Handoff endpoint promotion\n\n# Continuity Integrity\n`;
}
