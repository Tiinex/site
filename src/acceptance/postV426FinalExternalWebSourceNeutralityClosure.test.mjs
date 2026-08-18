import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { runExplicitUrlMaterialImportCommand } from '../app/urlMaterialCommand.js';
import { runPublicTargetRestoreCommand } from '../app/publicTargetRestoreCommand.js';
import { publicTargetFromExternalUrl } from '../app/publicTarget.js';
import { executeCanonicalTransitionLocalCreate } from '../app/canonicalTransitionLocalCreateCommand.js';
import { createPersistenceOwnershipPolicy, PersistenceRouteOwner } from '../app/persistenceOwnership.js';
import { buildLineageSourceRecoveryPlan } from '../app/lineageSourceRecovery.js';
import { CANONICAL_TRANSITION_SCHEMA_CACHE_MANIFEST } from '../transitions/canonicalTransition.schemaCache.js';
import { CANONICAL_TOPIC_TO_TASK_BUNDLED_SOURCE_ID } from '../transitions/canonicalTransition.semanticPackage.js';
import { transitionProductActionsForRecord } from '../transitions/transition.productPresentation.js';
import { allocateContinuationPath } from '../transitions/record.transitions.js';
import { resolveLineage } from '../lineage/lineage.resolve.js';
import { buildWorkspaceLineageView } from '../workspaces/workspace.lineageView.js';
import { validateArtifact } from '../validation/validateArtifact.js';
import { canonicalC14nV2SelfState } from '../integrity/integrity.c14nV2.js';
import '../workspaces/workspace.lifecycle.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;
const cacheCommit = 'd69b8ff55a56b8cb9282b8684db6a938a4435b94';
const cachePaths = {
  'tiinex.root.v1': `src/transitions/canonical-schema-cache/${cacheCommit}/tiinex.root.v1.schema.md`,
  'tiinex.transition.definition.v1': `src/transitions/canonical-schema-cache/${cacheCommit}/tiinex.transition.definition.v1.schema.md`,
  'tiinex.task.v1': 'src/schemas/core/task/tiinex.task.v1.schema.md'
};
const schemaCache = CANONICAL_TRANSITION_SCHEMA_CACHE_MANIFEST.map((item) => ({ ...item, markdown: fs.readFileSync(cachePaths[item.schemaId], 'utf8'), sourceQualification: 'source-qualified-cache' }));
const definitionPath = 'src/schemas/core/task/.transitions/topic-to-task-transition-definition.trace.md';
const bundledDefinitions = Object.freeze([{ path: definitionPath, title: 'Topic to Task', markdown: fs.readFileSync(definitionPath, 'utf8'), sourceQualification: 'compiled-semantic-package-qualified', sourceMode: 'bundled-canonical-transition-definition', source: { id: CANONICAL_TOPIC_TO_TASK_BUNDLED_SOURCE_ID, adapterId: 'static', kind: 'bundled-canonical' } }]);
const values = Object.freeze({ Summary: 'Web Follow Up', Objective: 'Preserve exact external web provenance.', 'Done Criteria': 'One canonical local Task exists with truthful Parent.', Scope: 'External web source-neutrality only.', Dependencies: 'One exact external Topic representation.' });
const webUrl = 'https://example.test/folder/001.trace.md';
const webMarkdown = topicMarkdown('External Web Topic');

// Actual explicit URL intake: local durability classification may remain, exact artifact provenance must survive separately.
const explicitWorkspace = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { name: 'Explicit web Topic' }, { clock: () => '2026-08-18T10:00:00.000Z' });
const explicit = await runExplicitUrlMaterialImportCommand({
  lifecycle, state: explicitWorkspace.state, workspaceId: explicitWorkspace.workspace.id, urls: [webUrl],
  fetchImpl: async (url) => response(url === webUrl ? webMarkdown : '', url === webUrl)
});
assert.equal(explicit.ok, true, explicit.error);
const explicitRecord = explicit.records[0];
assert.equal(explicitRecord.sourceMode, 'explicit-url');
assert.equal(explicitRecord.source?.adapterId, 'local', 'local durability ownership remains local/session');
assert.equal(explicitRecord.sourceTarget?.targetKind, 'web.markdown');
assert.equal(explicitRecord.sourceTarget?.inputTarget, webUrl);
assert.equal(explicitRecord.sourceTarget?.rawUrl, webUrl);
assert.equal(explicitRecord.path, '001.trace.md', 'external URL is not canonicalized into a fake local URL hierarchy');
assert.equal(explicitRecord.path.includes('https:'), false);
const explicitAction = canonicalAction(explicitRecord, explicit.state);
assert.equal(explicitAction?.productCapable, true, 'explicit web Topic reaches canonical five-field product capability');
assert.equal(explicitAction?.parentRecovery?.representationKind, 'web-markdown');
assert.equal(explicitAction?.parentRecovery?.traceTarget, webUrl);
assert.equal(explicitAction?.parentRecovery?.originTarget, webUrl);
assert.equal(explicitAction?.parentRecovery?.repository, '');
assert.equal(explicitAction?.parentRecovery?.ref, '');
assert.equal(presented(explicitRecord, explicit.state).some((action) => action.definitionId === 'topic.continue.task'), false, 'legacy continuation cannot mask active canonical web authority');
assert.deepEqual(explicitAction.authoring.requiredInputs, ['Summary', 'Objective', 'Done Criteria', 'Scope', 'Dependencies']);
const explicitBefore = explicitRecord.markdown;
const explicitCreated = createFrom(explicit.state, explicitRecord, values);
assert.equal(explicitCreated.ok, true, explicitCreated.notice || explicitCreated.error);
assert.equal(explicitCreated.record.path, '.topics/web-follow-up--task.trace.md', 'external-only parent uses established local fallback namespace');
assert.equal(explicitCreated.record.path.includes('https:'), false);
assert.equal(explicitCreated.record.trace, webUrl);
assert.equal(explicitCreated.record.origin, webUrl);
assert.equal(explicitCreated.record.markdown.includes('[browse + git]'), false);
assert.equal(explicitCreated.workspace.records.find((record) => record.id === explicitRecord.id)?.markdown, explicitBefore, 'source Topic remains byte-unchanged');
assert.equal(canonicalC14nV2SelfState(explicitCreated.record.markdown).state, 'verified');
const explicitValidation = validateArtifact({ markdown: explicitCreated.record.markdown });
assert.equal(explicitValidation.validation.state, 'exact-schema-validated');
assert.equal(explicitValidation.findings.some((finding) => finding.code === 'integrity.c14n-v2.verified'), true);
assert.ok(parentEdge(explicitCreated.workspace.records, explicitRecord.id, explicitCreated.record.id), 'loaded lineage resolves exact external URL Parent via generic provenance index');

// Fetch normalization stays separate from source identity: a GitHub blob URL may fetch raw bytes without replacing the user's exact representation target.
const blobUrl = 'https://github.com/acme/repo/blob/main/.topics/001.trace.md';
const rawBlobUrl = 'https://raw.githubusercontent.com/acme/repo/main/.topics/001.trace.md';
const blobWorkspace = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { name: 'Blob URL web Topic' });
const blobImport = await runExplicitUrlMaterialImportCommand({ lifecycle, state: blobWorkspace.state, workspaceId: blobWorkspace.workspace.id, urls: [blobUrl], fetchImpl: async (url) => response(url === rawBlobUrl ? webMarkdown : '', url === rawBlobUrl) });
assert.equal(blobImport.ok, true);
assert.equal(blobImport.records[0]?.sourceTarget?.inputTarget, blobUrl);
assert.equal(blobImport.records[0]?.sourceTarget?.rawUrl, rawBlobUrl);
assert.equal(blobImport.records[0]?.path, '001.trace.md');

// Public web.markdown restore must produce the same semantic truth, not a second local-only interpretation.
const publicTarget = publicTargetFromExternalUrl(webUrl, 'web.markdown');
assert.equal(publicTarget?.targetKind, 'web.markdown');
const restored = await runPublicTargetRestoreCommand({
  target: publicTarget,
  runtimeApi: { lifecycle },
  fetchImpl: async (url) => response(url === webUrl ? webMarkdown : '', url === webUrl)
});
assert.equal(restored.ok, true, restored.error);
assert.equal(restored.record.sourceTarget?.inputTarget, webUrl);
assert.equal(restored.record.sourceTarget?.targetKind, 'web.markdown');
const restoredAction = canonicalAction(restored.record, restored.state);
assert.equal(restoredAction?.productCapable, true);
assert.equal(restoredAction?.parentRecovery?.representationKind, 'web-markdown');
const restoredCreated = createFrom(restored.state, restored.record, { ...values, Summary: 'Public Web Follow Up' });
assert.equal(restoredCreated.ok, true);
assert.equal(restoredCreated.record.path, '.topics/public-web-follow-up--task.trace.md');
assert.equal(restoredCreated.record.trace, webUrl);
assert.equal(restoredCreated.record.origin, webUrl);
assert.ok(parentEdge(restoredCreated.workspace.records, restored.record.id, restoredCreated.record.id));

// A truthfully source-qualified web record must converge on the same Parent representation semantics.
const qualifiedRecord = Object.assign(createRecordFromMarkdown(webMarkdown, { path: '001.trace.md', name: 'External Web Topic', sourceMode: 'source-backed' }), {
  id: 'source-qualified-web-topic', title: 'External Web Topic', path: '001.trace.md', sourceMode: 'source-backed',
  source: { id: 'web:example', adapterId: 'web', sourceKind: 'web.markdown', url: webUrl },
  sourceTarget: { targetKind: 'web.markdown', inputTarget: webUrl, rawUrl: webUrl }
});
const qualifiedState = stateWith('qualified-web', [qualifiedRecord]);
const qualifiedAction = canonicalAction(qualifiedRecord, qualifiedState);
assert.equal(qualifiedAction?.productCapable, true);
assert.equal(qualifiedAction?.parentRecovery?.representationKind, 'web-markdown');
assert.equal(qualifiedAction?.parentRecovery?.traceTarget, webUrl);
assert.equal(qualifiedAction?.parentRecovery?.originTarget, webUrl);
const qualifiedCreated = createFrom(qualifiedState, qualifiedRecord, { ...values, Summary: 'Qualified Web Follow Up' });
assert.equal(qualifiedCreated.ok, true);
assert.equal(qualifiedCreated.record.path, '.topics/qualified-web-follow-up--task.trace.md');
assert.equal(qualifiedCreated.record.trace, webUrl);
assert.equal(qualifiedCreated.record.origin, webUrl);

// Local/archive behavior remains local and keeps established same-parent placement.
assert.equal(allocateContinuationPath({ parentRecord: { path: '.topics/local/001.trace.md', sourceMode: 'archive-local', source: { adapterId: 'local', kind: 'local-session' } }, targetId: 'tiinex.task.v1', targetLabel: 'Task', title: 'Local Follow Up' }, { workspaceRecords: [] }).path, '.topics/local/001-1-local-follow-up.trace.md');

// An unusable external target is not reinterpreted as local or Git provenance and remains fail-closed without legacy masking.
const unusable = Object.assign(createRecordFromMarkdown(webMarkdown, { path: '001.trace.md', sourceMode: 'source-backed' }), {
  id: 'unusable-web', path: '001.trace.md', sourceMode: 'source-backed',
  source: { id: 'web:bad', adapterId: 'web', sourceKind: 'web.markdown', url: 'file:///tmp/001.trace.md' },
  sourceTarget: { targetKind: 'web.markdown', inputTarget: 'file:///tmp/001.trace.md' }
});
const unusableState = stateWith('unusable-web', [unusable]);
const unusableActions = presented(unusable, unusableState);
assert.equal(unusableActions.some((action) => action.kind === 'canonical-transition-product'), false);
assert.equal(unusableActions.some((action) => action.definitionId === 'topic.continue.task'), false);

// Missing web parent: exact Trace/Origin remains recoverable truth, but current automatic missing-parent recovery owner is GitHub-specific.
const childOnlyWorkspace = { id: explicitCreated.workspace.id, records: [explicitCreated.record], sources: [], sourceOrder: [] };
const childOnlyView = buildWorkspaceLineageView(childOnlyWorkspace, { records: childOnlyWorkspace.records, query: '', selectedRecordId: explicitCreated.record.id });
const missingWebPlan = buildLineageSourceRecoveryPlan(childOnlyWorkspace, childOnlyView);
assert.equal(childOnlyView.selectedTraversal?.hasMissing, true);
assert.equal(missingWebPlan.length, 0, 'automatic missing-parent web recovery remains an explicit next-milestone precondition; no false recovery claim');
assert.equal(explicitCreated.record.origin, webUrl, 'exact web Origin remains available for future/explicit recovery');

console.log('post-v426 final external-web / explicit-URL source-neutrality closure: PASS');

function presented(record, state) {
  const workspace = state.workspaces.find((item) => (item.records || []).some((candidate) => candidate.id === record.id));
  return transitionProductActionsForRecord(record, { workspaceRecords: workspace?.records || [], workspaceId: workspace?.id || '', maxPrimary: 20, schemaCache, bundledDefinitions });
}
function canonicalAction(record, state) { return presented(record, state).find((action) => action.kind === 'canonical-transition-product' && action.canonicalIdentifier === 'tiinex.site.topic-to-task.v1'); }
function createFrom(inputState, record, inputValues) {
  const workspace = inputState.workspaces.find((item) => (item.records || []).some((candidate) => candidate.id === record.id));
  const action = canonicalAction(record, inputState);
  assert.ok(action?.productCapable, `${record.id}: canonical action must be product-capable`);
  return executeCanonicalTransitionLocalCreate({ lifecycle, state: inputState, workspaceId: workspace.id, currentRecordId: record.id, definitionKey: action.definitionKey, values: inputValues, schemaCache, bundledDefinitions, persistenceOwnership: createPersistenceOwnershipPolicy(PersistenceRouteOwner.semanticState), now: new Date('2026-08-18T10:01:00.000Z'), clock: () => '2026-08-18T10:01:00.000Z' });
}
function stateWith(id, records) {
  return { version: 1, activeWorkspaceId: id, view: { universe: 'column', workspaceVerse: 'feed', reader: 'scan', query: '' }, workspaces: [{ id, name: id, title: id, createdAt: '2026-08-18T10:00:00.000Z', kind: 'workspace', source: { id: 'local', adapterId: 'local', kind: 'local-session' }, sources: [], sourceOrder: [], records, assets: [], importLog: [], mode: 'feed' }], audit: null };
}
function parentEdge(records, parentId, childId) { return resolveLineage(records).edges.find((edge) => edge.kind === 'parent' && edge.from === parentId && edge.to === childId); }
function topicMarkdown(title) {
  return `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.topic.v1\n  - Created At: 2026-08-18 10:00:00\n  - Summary: ${title}\n\n---\n\n# ${title}\n\nExternal web Topic material.\n\n# Continuity Integrity\n\n- external-web-fixture-v1\n  - Towards: self\n  - Value: external-web-topic\n`;
}
function response(text, ok = true) { return { ok: Boolean(ok), status: ok ? 200 : 404, statusText: ok ? 'OK' : 'Not Found', url: webUrl, text: async () => text, json: async () => ({}) }; }
