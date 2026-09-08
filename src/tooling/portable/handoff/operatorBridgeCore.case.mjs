import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { validatedC14nV2PrimarySelfDigest } from '../../../integrity/integrity.c14nV2.js';
import { C14N_V2_VALIDATOR_TARGET } from '../../../integrity/integrity.methodReference.js';
import { projectPortableEditorAssistance, locateFindingLine } from '../editor/editor.assistance.js';
import { portableRuntimeValidationAuthorityForRecord } from '../schema/qualifiedLocalRoot.runtime.js';
import { projectQualifiedHandoffLeaves } from './handoffLeafProjection.js';
import { qualifiedHandoffFixture } from './qualifiedHandoffFixture.js';
import { runPortableOperation } from '../operation.catalog.js';
import { renderHandoffPackageV1, parseHandoffPackageV1, validatePackageFields, WORKSPACE_PACKAGE_ROLE } from './recipientV2.packageV1.contract.js';
import { manufactureRecipientRelativeHandoffPackage } from './manufacture.js';
import { projectQualifiedWorkspacePackageSources } from './workspacePackageSources.js';
import { projectPortableHandoffAuthoringPlan } from './handoffAuthoringPlan.js';
import { projectQualifiedHandoffEndpoints } from './handoffEndpointProjection.js';

function record(path, markdown) {
  const parsed = parseArtifactMarkdown(markdown);
  return { id: path, path, title: parsed.title, schemaId: parsed.envelope.current.schema.id, currentSchemaId: parsed.envelope.current.schema.id, markdown, parent: parsed.envelope.parent };
}

const baseMarkdown = qualifiedHandoffFixture({ title: 'Base Handoff', from: 'Anchor', to: 'Loom' });
const baseDigest = validatedC14nV2PrimarySelfDigest(baseMarkdown);
assert.equal(baseDigest.state, 'verified');
const childMarkdown = qualifiedHandoffFixture({
  title: 'Child Handoff', from: 'Loom', to: 'Anchor',
  parent: { schemaId: 'tiinex.handoff.v1', trace: 'base.trace.md', relative: 'base.trace.md', includeBrowseGit: false, towards: 'base.trace.md', targetValue: baseDigest.value }
});
const leaves = projectQualifiedHandoffLeaves({ records: [record('base.trace.md', baseMarkdown), record('child.trace.md', childMarkdown)] });
assert.equal(leaves.status, 'ready');
assert.deepEqual(leaves.leaves.map((item) => item.path), ['child.trace.md']);
assert.equal(leaves.leaves[0].from, 'Loom');
assert.equal(leaves.leaves[0].to, 'Anchor');
assert.equal(leaves.pointerless.manufactureState, 'ready');
assert.equal(leaves.pointerless.packageRole, 'recipient-facing-workspace-carrier');

const altered = baseMarkdown.replace('- Purpose: qualified Handoff regression fixture', '- Purpose: changed after sealing');
const assistance = projectPortableEditorAssistance({ records: [record('broken.trace.md', altered)] });
assert.equal(assistance.documents.length, 1);
assert.equal(assistance.documents[0].validator.state, 'qualified-exact');
assert.equal(assistance.documents[0].actions[0].id, 'refresh-primary-self-integrity');
assert.equal(assistance.documents[0].actions[0].kind, 'replace-document');
assert.notEqual(assistance.documents[0].actions[0].replacementMarkdown, altered);
assert.deepEqual(assistance.documents[0].actions[0].diagnosticCodes, ['integrity.c14n-v2.mismatch', 'integrity.c14n-v2.ambiguous']);

const legacyIntegrityTarget = 'https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.validators/sha256-base64url-c14n-v2.validator.md';
const staleMethodMarkdown = baseMarkdown.replaceAll(C14N_V2_VALIDATOR_TARGET, legacyIntegrityTarget);
const staleMethodAssistance = projectPortableEditorAssistance({ records: [record('stale-method.trace.md', staleMethodMarkdown)] });
const staleMethodAction = staleMethodAssistance.documents[0].actions.find((item) => item.id === 'refresh-primary-self-integrity');
assert.ok(staleMethodAction, 'unqualified maintained c14n-v2 footer references must project one deterministic shared-core hygiene action');
assert.equal(staleMethodAction.diagnosticCodes.includes('integrity.method-reference.unqualified'), true);
assert.equal(staleMethodAction.replacementMarkdown.includes(legacyIntegrityTarget), false);
assert.equal(staleMethodAction.replacementMarkdown.includes(C14N_V2_VALIDATOR_TARGET), true);
const repairedMethodAssistance = projectPortableEditorAssistance({ records: [record('stale-method.trace.md', staleMethodAction.replacementMarkdown)] });
assert.equal(repairedMethodAssistance.documents[0].diagnostics.some((item) => item.code === 'integrity.method-reference.unqualified' || item.code === 'integrity.c14n-v2.mismatch'), false);

const mixedSchemaReferenceMarkdown = baseMarkdown.replace(/- Envelope Schema: \[tiinex\.root\.v1\]\([^)]+\)/, '- Envelope Schema: tiinex.root.v1');
const mixedSchemaAssistance = projectPortableEditorAssistance({ records: [record('mixed-schema.trace.md', mixedSchemaReferenceMarkdown)], focusPath: 'mixed-schema.trace.md' });
const mixedSchemaDiagnostic = mixedSchemaAssistance.documents[0].diagnostics.find((item) => item.code === 'portable.editor.schema-reference.canonical-target-available');
assert.ok(mixedSchemaDiagnostic, 'mixed exact/plain schema-reference conventions must be visible to shared editor assistance');
assert.equal(mixedSchemaDiagnostic.locationState, 'deterministic');
assert.match(mixedSchemaReferenceMarkdown.split(/\r?\n/)[mixedSchemaDiagnostic.line - 1], /^- Envelope Schema:/);
assert.equal(mixedSchemaAssistance.documents[0].actions.length, 0, 'self reseal must be withheld while another known shared guardrail remains open');

const parentSchemaMismatchMarkdown = qualifiedHandoffFixture({
  title: 'Parent Schema Mismatch', from: 'Loom', to: 'Anchor',
  parent: { schemaId: 'tiinex.task.v1', trace: 'base.trace.md', relative: 'base.trace.md', includeBrowseGit: false, towards: 'base.trace.md', targetValue: baseDigest.value }
});
const parentSchemaAssistance = projectPortableEditorAssistance({ records: [record('base.trace.md', baseMarkdown), record('parent-schema-mismatch.trace.md', parentSchemaMismatchMarkdown)], focusPath: 'parent-schema-mismatch.trace.md' });
const parentSchemaDiagnostic = parentSchemaAssistance.documents[0].diagnostics.find((item) => item.code === 'portable.lineage-integrity.parent-schema-mismatch');
assert.ok(parentSchemaDiagnostic, 'declared Parent Schema must be compared with the resolved Parent Current Schema');
assert.equal(parentSchemaDiagnostic.locationState, 'deterministic');
assert.match(parentSchemaMismatchMarkdown.split(/\r?\n/)[parentSchemaDiagnostic.line - 1], /Parent Schema:/);

const descendantBoundAssistance = projectPortableEditorAssistance({ records: [record('base.trace.md', altered), record('child.trace.md', childMarkdown)], focusPath: 'base.trace.md' });
assert.equal(descendantBoundAssistance.documents[0].diagnostics.some((item) => item.code === 'integrity.c14n-v2.mismatch'), true);
assert.equal(descendantBoundAssistance.documents[0].actions.length, 0, 'repair must be withheld when resealing the focused Parent would leave a loaded digest-bound descendant invalid');

const editorCliRoot = await mkdtemp(path.join(os.tmpdir(), 'tiinex-editor-cli-'));
const editorOverlayPath = path.join(editorCliRoot, 'overlay.md');
try {
  await mkdir(path.join(editorCliRoot, '.topics'), { recursive: true });
  await writeFile(path.join(editorCliRoot, '.topics/base.trace.md'), baseMarkdown, 'utf8');
  await writeFile(editorOverlayPath, altered, 'utf8');
  const editorCli = spawnSync(process.execPath, ['tools/tiinex-portable.mjs', 'project-editor-assistance', editorCliRoot, '--focus', '.topics/base.trace.md', '--overlay', editorOverlayPath, '--compact'], { encoding: 'utf8' });
  assert.equal(editorCli.status, 0, editorCli.stderr);
  const editorCliReceipt = JSON.parse(editorCli.stdout);
  assert.equal(editorCliReceipt.documents.length, 1, 'CLI overlay must preserve file-backed material instead of shadowing it with an empty records array');
  assert.equal(editorCliReceipt.documents[0].path, '.topics/base.trace.md');
  assert.equal(editorCliReceipt.documents[0].diagnostics.some((item) => item.code === 'integrity.c14n-v2.mismatch'), true);
} finally { await rm(editorCliRoot, { recursive: true, force: true }); }

const sectionLine = locateFindingLine({ params: { section: 'Required Context' } }, baseMarkdown);
assert.equal(sectionLine.state, 'deterministic');
assert.equal(baseMarkdown.split(/\r?\n/)[sectionLine.line - 1], '## Required Context');
const fieldLine = locateFindingLine({ params: { field: 'From' } }, baseMarkdown);
assert.equal(fieldLine.state, 'deterministic');
assert.match(baseMarkdown.split(/\r?\n/)[fieldLine.line - 1], /^- From:/);
const unresolved = locateFindingLine({ code: 'task.title.missing', message: 'Title missing.' }, baseMarkdown);
assert.equal(unresolved.state, 'unresolved');
assert.equal(unresolved.line, null);
const missingSectionAnchor = locateFindingLine({ code: 'portable.contract.section.required.missing', message: 'Required section is missing: Missing Section.', params: { section: 'Missing Section' } }, baseMarkdown);
assert.equal(missingSectionAnchor.state, 'deterministic-anchor');
assert.equal(baseMarkdown.split(/\r?\n/)[missingSectionAnchor.line - 1], '# Base Handoff');

const organizationAuthority = portableRuntimeValidationAuthorityForRecord({ markdown: `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/911d4cf990e35ce25a56e8f376d296e327c48260/.topics/.schemas/tiinex.root.v1.schema.md)\n- Current\n  - Current Schema: [tiinex.party.organization.v1](https://github.com/Tiinex/docs/blob/911d4cf990e35ce25a56e8f376d296e327c48260/.topics/.schemas/party/organization/tiinex.party.organization.v1.schema.md)\n\n---\n\n# Organization\n` });
assert.equal(organizationAuthority.state, 'unavailable');
assert.equal(organizationAuthority.currentReference.state, 'qualified');
assert.equal(organizationAuthority.findings.some((item) => item.includes('Compiled lineage substitutes source authority')), true);
const roleAuthority = portableRuntimeValidationAuthorityForRecord({ markdown: `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)\n- Current\n  - Current Schema: [tiinex.party.role.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/party/role/tiinex.party.role.v1.schema.md)\n\n---\n\n# Role\n` });
assert.equal(roleAuthority.state, 'qualified');
assert.equal(roleAuthority.currentReference.basis, 'qualified-workspace-local-authority');

const op = await runPortableOperation('project-handoff-leaves', { records: [record('base.trace.md', baseMarkdown), record('child.trace.md', childMarkdown)] });
assert.equal(op.operation, 'project-handoff-leaves');
assert.equal(op.resultSchema, 'tiinex.portable.handoff-leaf-projection.v1');
assert.deepEqual(op.leaves.map((item) => item.path), ['child.trace.md']);

const sourceWorkspaceMarkdown = await readFile('.topics/.workspaces/tiinex-site.workspace.md', 'utf8');
const sourceProjection = projectQualifiedWorkspacePackageSources({ files: [{ path: '.topics/.workspaces/tiinex-site.workspace.md', content: sourceWorkspaceMarkdown }] });
assert.equal(sourceProjection.status, 'ready');
assert.equal(sourceProjection.candidates.length, 1);
assert.equal(sourceProjection.candidates[0].workspaceId, 'site');
assert.equal(sourceProjection.candidates[0].repositoryIdentity, 'tiinex/site');
assert.equal(sourceProjection.candidates[0].ref, 'refactor');
const collidedSourceProjection = projectQualifiedWorkspacePackageSources({ files: [
  { path: '.topics/.workspaces/tiinex-site.workspace.md', content: sourceWorkspaceMarkdown },
  { path: 'alternate/tiinex-site.workspace.md', content: sourceWorkspaceMarkdown }
] });
assert.equal(collidedSourceProjection.candidates.length, 2);
assert.equal(new Set(collidedSourceProjection.candidates.map((item) => item.repositoryIdentity)).size, 1, 'physical repository snapshot identity remains shared');
assert.equal(new Set(collidedSourceProjection.candidates.map((item) => item.workspaceId)).size, 2, 'semantic Workspace artifact choices must remain distinct despite the same repository basename');
assert.equal(collidedSourceProjection.candidates.every((item) => item.workspaceId.startsWith('site--')), true);

const loomRoleMarkdown = await readFile('src/tooling/portable/fixtures/legacy-artifacts/loom/role/001-loom-role.trace.fixture.txt', 'utf8');
const endpointProjection = projectQualifiedHandoffEndpoints({ workspaceId: 'business', files: [{ path: '.topics/roles/001-3-loom-role.trace.md', content: loomRoleMarkdown }] });
assert.equal(endpointProjection.status, 'ready');
assert.equal(endpointProjection.candidates.length, 1);
assert.equal(endpointProjection.candidates[0].kind, 'role');
assert.equal(endpointProjection.candidates[0].target, 'business::.topics/roles/001-3-loom-role.trace.md');
assert.equal(endpointProjection.candidates[0].reference, endpointProjection.candidates[0].target);
const matchedSourceProjection = projectQualifiedWorkspacePackageSources({ files: [{ path: '.topics/.workspaces/tiinex-site.workspace.md', content: sourceWorkspaceMarkdown }], repositories: [{ id: '/repo/site', root: '/repo/site', repository: 'git@github.com:Tiinex/site.git', branch: 'refactor', clean: true }] });
assert.equal(matchedSourceProjection.candidates.length, 1);
assert.equal(matchedSourceProjection.candidates[0].localRepository.id, '/repo/site');
const unmatchedSourceProjection = projectQualifiedWorkspacePackageSources({ files: [{ path: '.topics/.workspaces/tiinex-site.workspace.md', content: sourceWorkspaceMarkdown }], repositories: [{ id: '/repo/docs', root: '/repo/docs', repository: 'https://github.com/Tiinex/docs.git', branch: 'master', clean: true }] });
assert.equal(unmatchedSourceProjection.candidates.length, 0);
assert.equal(unmatchedSourceProjection.findings.some((item) => item.code === 'portable.workspace-package-source.local-repository-unmatched'), true);

const rootAuthoring = projectPortableHandoffAuthoringPlan({ records: [record('.topics/base.trace.md', baseMarkdown)], title: 'Operator Native Handoff' });
assert.equal(rootAuthoring.status, 'ready');
assert.equal(rootAuthoring.mode, 'root');
assert.equal(rootAuthoring.path.endsWith('--handoff.trace.md'), true);
const continuationAuthoring = projectPortableHandoffAuthoringPlan({ records: [record('.topics/base.trace.md', baseMarkdown)], title: 'Child Return', parentPath: '.topics/base.trace.md' });
assert.equal(continuationAuthoring.status, 'ready');
assert.equal(continuationAuthoring.mode, 'continuation');
assert.equal(continuationAuthoring.parentPath, '.topics/base.trace.md');
assert.equal(continuationAuthoring.path, '.topics/child-return--handoff.trace.md');

const workspaceCarrierMarkdown = renderHandoffPackageV1({
  createdAt: '2026-09-06T12:00:00.000Z',
  packageRole: WORKSPACE_PACKAGE_ROLE,
  workspaces: [{ workspaceId: 'site', workspacePath: '001-3-site.workspace.md', archivePath: '001-3-site.workspace.zip', sourceWorkspaceTargetInnerPath: '.topics/.workspaces/tiinex-site.workspace.md', archiveSha256: 'a'.repeat(64), archiveBytes: 123 }],
  carrierLineage: { dimension: '009', checkpointKind: 'progression' }
});
const workspaceCarrier = parseHandoffPackageV1(workspaceCarrierMarkdown);
assert.equal(workspaceCarrier.packageRole, WORKSPACE_PACKAGE_ROLE);
assert.equal(workspaceCarrier.routePlacementRule, 'none');
assert.equal(workspaceCarrier.continueFromRule, 'none');
assert.equal(workspaceCarrier.preHandoffClosureRule, 'none');
const workspaceFindings = [];
validatePackageFields(workspaceCarrier, workspaceFindings);
assert.equal(workspaceFindings.some((item) => item.severity === 'error'), false);
const mixed = { ...workspaceCarrier, routePlacementRule: 'authoritative-workspace-descended' };
const mixedFindings = [];
validatePackageFields(mixed, mixedFindings);
assert.equal(mixedFindings.some((item) => item.code === 'portable.handoff-package-v1.field.routePlacementRule.invalid'), true);
const pointerlessMissingInputs = manufactureRecipientRelativeHandoffPackage({ carrierMode: 'workspace' });
assert.equal(pointerlessMissingInputs.status, 'blocked');
assert.equal(pointerlessMissingInputs.transportExecutable, false);

const cliOut = await mkdtemp(path.join(os.tmpdir(), 'tiinex-pointerless-'));
const cliWorkspace = await mkdtemp(path.join(os.tmpdir(), 'tiinex-pointerless-workspace-'));
try {
  const targetPath = '.topics/.workspaces/tiinex-site.workspace.md';
  await mkdir(path.join(cliWorkspace, '.topics/.workspaces'), { recursive: true });
  await writeFile(path.join(cliWorkspace, targetPath), sourceWorkspaceMarkdown, 'utf8');
  const cli = spawnSync(process.execPath, ['tools/tiinex-portable.mjs', 'manufacture-handoff-package', cliWorkspace, '--carrier-mode', 'workspace', '--workspace-id', 'site', '--workspace-target', targetPath, '--output-dir', cliOut, '--compact'], { encoding: 'utf8' });
  assert.equal(cli.status, 0, cli.stderr);
  const receipt = JSON.parse(cli.stdout);
  assert.equal(receipt.status, 'ready');
  assert.equal(receipt.transportExecutable, true);
  assert.equal(receipt.carrierProjection.mode, 'workspace');
  assert.equal(receipt.carrierProjection.routes.length, 0);
  assert.equal(receipt.carrierProjection.selection.policy, 'none');
  assert.equal(receipt.humanOutput.normalInlineRouting, null);
  assert.deepEqual(await readdir(cliOut), ['tiinex-workspace-001.handoff-package.zip']);
  const forbiddenRoute = spawnSync(process.execPath, ['tools/tiinex-portable.mjs', 'manufacture-handoff-package', cliWorkspace, '--carrier-mode', 'workspace', '--workspace-id', 'site', '--workspace-target', targetPath, '--route', 'incidental.trace.md', '--compact'], { encoding: 'utf8' });
  assert.equal(forbiddenRoute.status, 1);
  assert.match(forbiddenRoute.stderr, /workspace-carrier\.handoff-route\.forbidden/);
} finally { await rm(cliOut, { recursive: true, force: true }); await rm(cliWorkspace, { recursive: true, force: true }); }

console.log('✓ Major 012 shared editor-assistance, Handoff-leaf, and qualified fail-closed two-mode carrier mechanics passed');
