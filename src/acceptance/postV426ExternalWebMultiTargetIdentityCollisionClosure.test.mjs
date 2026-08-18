import assert from 'node:assert/strict';
import fs from 'node:fs';
import { runExplicitUrlMaterialImportCommand } from '../app/urlMaterialCommand.js';
import { executeCanonicalTransitionLocalCreate } from '../app/canonicalTransitionLocalCreateCommand.js';
import { createPersistenceOwnershipPolicy, PersistenceRouteOwner } from '../app/persistenceOwnership.js';
import { CANONICAL_TRANSITION_SCHEMA_CACHE_MANIFEST } from '../transitions/canonicalTransition.schemaCache.js';
import { CANONICAL_TOPIC_TO_TASK_BUNDLED_SOURCE_ID } from '../transitions/canonicalTransition.semanticPackage.js';
import { transitionProductActionsForRecord } from '../transitions/transition.productPresentation.js';
import { resolveLineage } from '../lineage/lineage.resolve.js';
import { buildWorkspacePathTree } from '../workspaces/workspace.pathTree.js';
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
const urlA = 'https://a.example.test/folder/001.trace.md';
const urlB = 'https://b.example.test/other/001.trace.md';
const bodies = new Map([[urlA, topic('Web Parent A')], [urlB, topic('Web Parent B')]]);

const created = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { name: 'Web multi-target' }, { clock: () => '2026-08-18T11:00:00.000Z' });
const imported = await runExplicitUrlMaterialImportCommand({ lifecycle, state: created.state, workspaceId: created.workspace.id, urls: [urlA, urlB], fetchImpl: fetchFrom(bodies) });
assert.equal(imported.ok, true, imported.error);
assert.equal(imported.adapterResult.records.length, 2, 'adapter emits two distinct exact targets despite same basename');
assert.equal(imported.records.length, 2, 'command reports the two records that survive lifecycle materialization');
const workspace = imported.state.workspaces.find((item) => item.id === created.workspace.id);
assert.equal(workspace.records.length, 2, 'distinct same-basename web targets both survive product state');
const [recordA, recordB] = [urlA, urlB].map((url) => workspace.records.find((record) => record.sourceTarget?.inputTarget === url));
assert.ok(recordA && recordB);
assert.notEqual(recordA.id, recordB.id, 'exact target identity, not basename path, owns external record identity');
assert.equal(recordA.path, '001.trace.md');
assert.equal(recordB.path, '001.trace.md');
assert.equal(recordA.path.includes('https:'), false);
assert.equal(recordB.path.includes('https:'), false);
const tree = buildWorkspacePathTree({ records: workspace.records });
assert.equal(tree.counts.records, 2, 'Tree keeps two target-qualified records even when presentation basenames match');
assert.equal(collectIds(tree).has(recordA.id), true);
assert.equal(collectIds(tree).has(recordB.id), true);

for (const record of [recordA, recordB]) assert.equal(canonical(record, imported.state)?.productCapable, true, `${record.id}: canonical Topic→Task remains available`);
const values = { Summary: 'Same Child', Objective: 'Prove external target identity is collision safe.', 'Done Criteria': 'Both Tasks survive.', Scope: 'Multi-target external web.', Dependencies: 'One exact web parent.' };
const childA = createTask(imported.state, recordA, values);
assert.equal(childA.ok, true, childA.error);
const childB = createTask(childA.state, recordB, values);
assert.equal(childB.ok, true, childB.error);
assert.notEqual(childA.record.id, childB.record.id, 'same-title children from distinct web parents remain distinct local records');
assert.notEqual(childA.record.path, childB.record.path, 'established fallback allocator resolves same-title child collision deterministically');
assert.equal(childA.record.trace, urlA);
assert.equal(childA.record.origin, urlA);
assert.equal(childB.record.trace, urlB);
assert.equal(childB.record.origin, urlB);
assert.equal(canonicalC14nV2SelfState(childA.record.markdown).state, 'verified');
assert.equal(canonicalC14nV2SelfState(childB.record.markdown).state, 'verified');
const finalWorkspace = childB.state.workspaces.find((item) => item.id === created.workspace.id);
const lineage = resolveLineage(finalWorkspace.records);
assert.ok(lineage.edges.some((edge) => edge.kind === 'parent' && edge.from === recordA.id && edge.to === childA.record.id), 'child A resolves only to exact URL A parent');
assert.ok(lineage.edges.some((edge) => edge.kind === 'parent' && edge.from === recordB.id && edge.to === childB.record.id), 'child B resolves only to exact URL B parent');

// Equivalent normalized URLs represent one semantic external artifact and counts must agree with state.
const duplicateWorkspace = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { name: 'Web duplicate target' });
const equivalentA = 'https://dup.example.test/folder/001.trace.md';
const equivalentB = 'https://dup.example.test/folder/./001.trace.md';
let duplicateFetches = 0;
const duplicate = await runExplicitUrlMaterialImportCommand({
  lifecycle, state: duplicateWorkspace.state, workspaceId: duplicateWorkspace.workspace.id, urls: [equivalentA, equivalentB],
  fetchImpl: async () => { duplicateFetches += 1; return response(topic('Duplicate target')); }
});
assert.equal(duplicate.ok, true);
assert.equal(duplicateFetches, 1, 'equivalent normalized target is fetched once');
assert.equal(duplicate.adapterResult.records.length, 1);
assert.equal(duplicate.records.length, 1);
assert.equal(duplicate.state.workspaces[0].records.length, 1);
assert.equal(duplicate.adapterResult.diagnostics.requestedCount, 2);
assert.equal(duplicate.adapterResult.diagnostics.distinctTargetCount, 1);
assert.equal(duplicate.adapterResult.diagnostics.duplicateCount, 1);
assert.match(duplicate.notice, /Added 1 URL artifact/);

// Same basename + distinct query identity must not collapse.
const queryWorkspace = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { name: 'Web query targets' });
const queryA = 'https://query.example.test/folder/001.trace.md?rev=1';
const queryB = 'https://query.example.test/folder/001.trace.md?rev=2';
const queryImported = await runExplicitUrlMaterialImportCommand({ lifecycle, state: queryWorkspace.state, workspaceId: queryWorkspace.workspace.id, urls: [queryA, queryB], fetchImpl: async (url) => response(topic(url.includes('rev=1') ? 'Query A' : 'Query B')) });
assert.equal(queryImported.records.length, 2);
assert.equal(queryImported.state.workspaces[0].records.length, 2);
assert.notEqual(queryImported.records[0].id, queryImported.records[1].id);

// rawUrl is the normalized URL Tiinex requested from fetchImpl; redirects do not rewrite artifact/source identity.
const redirectWorkspace = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { name: 'Redirect truth' });
const requested = 'https://redirect.example.test/001.trace.md';
const redirected = await runExplicitUrlMaterialImportCommand({ lifecycle, state: redirectWorkspace.state, workspaceId: redirectWorkspace.workspace.id, urls: [requested], fetchImpl: async () => ({ ...response(topic('Redirect source')), url: 'https://cdn.example.test/material/001.trace.md' }) });
assert.equal(redirected.records[0].sourceTarget.inputTarget, requested);
assert.equal(redirected.records[0].sourceTarget.rawUrl, requested, 'rawUrl means normalized requested fetch target, not post-redirect response.url');

console.log('post-v426 external-web multi-target identity/collision closure: PASS');

function canonical(record, state) {
  const ws = state.workspaces.find((item) => (item.records || []).some((candidate) => candidate.id === record.id));
  return transitionProductActionsForRecord(record, { workspaceRecords: ws?.records || [], workspaceId: ws?.id || '', maxPrimary: 20, schemaCache, bundledDefinitions }).find((action) => action.kind === 'canonical-transition-product' && action.canonicalIdentifier === 'tiinex.site.topic-to-task.v1');
}
function createTask(state, record, values) {
  const ws = state.workspaces.find((item) => (item.records || []).some((candidate) => candidate.id === record.id));
  const action = canonical(record, state); assert.ok(action?.productCapable);
  return executeCanonicalTransitionLocalCreate({ lifecycle, state, workspaceId: ws.id, currentRecordId: record.id, definitionKey: action.definitionKey, values, schemaCache, bundledDefinitions, persistenceOwnership: createPersistenceOwnershipPolicy(PersistenceRouteOwner.semanticState), now: new Date('2026-08-18T11:01:00.000Z'), clock: () => '2026-08-18T11:01:00.000Z' });
}
function fetchFrom(map) { return async (url) => response(map.get(url) || ''); }
function response(text) { return { ok: true, status: 200, statusText: 'OK', text: async () => text, json: async () => ({}) }; }
function topic(title) { return `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.topic.v1\n  - Created At: 2026-08-18 11:00:00\n  - Summary: ${title}\n\n---\n\n# ${title}\n\nExternal web Topic.\n\n# Continuity Integrity\n\n- external-web-multi-fixture-v1\n  - Towards: self\n  - Value: ${title}\n`; }
function collectIds(tree) { const ids = new Set(); const walk = (folder) => { for (const item of folder.items || []) ids.add(item.id); for (const child of folder.folders || []) walk(child); }; walk(tree); return ids; }
