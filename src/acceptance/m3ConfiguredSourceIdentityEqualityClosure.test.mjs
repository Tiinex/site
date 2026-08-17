import assert from 'node:assert/strict';
import '../sources/source.identity.js';
import '../workspaces/workspace.lifecycle.js';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { mergeWorkspaceEntrypointSet } from '../workspaces/workspace.entrypointLifecycle.js';
import { sourceSignature } from '../workspaces/workspace.entrypoints.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;

function plan(overrides = {}) {
  return Object.assign({
    repository: 'Owner/Repo',
    ref: 'Main',
    rootPath: '.topics/Foo',
    label: 'Workspace',
    sourceKind: 'github-tree',
    repoDiscovery: true,
    issueDiscovery: false,
    issueUrls: '',
    explicitFileRefs: []
  }, overrides);
}

const planA = plan();
const planB = plan({ ref: 'main', rootPath: '.topics/foo' });
assert.notEqual(sourceSignature(planA), sourceSignature(planB), 'fixture requires materially distinct canonical source plans');

let state = lifecycle.makeEmptyAppState();
const created = lifecycle.createWorkspace(state, { name: 'Workspace' });
assert.equal(created.ok, true);
state = created.state;
const workspaceId = created.workspace.id;

// Simulate a persisted pre-v392 configured source whose legacy generated ID lowercased ref/root.
const legacyId = 'github:owner-repo:main:topics-foo';
const registeredA = lifecycle.addWorkspaceSource(state, workspaceId, Object.assign({}, planA, {
  id: legacyId,
  discoveryState: 'loaded',
  count: 1,
  surfaces: { repoFiles: { attempted: true, loaded: 1 } }
}));
assert.equal(registeredA.ok, true);
assert.equal(registeredA.source.id, legacyId, 'persisted legacy source identity is preserved on registration');
state = registeredA.state;

const recordA = createRecordFromMarkdown('# Existing A\n\nSource-bound material.', {
  path: '.topics/Foo/existing-a.trace.md',
  sourceMode: 'source'
});
const materializedA = lifecycle.addWorkspaceSourceRecords(state, workspaceId, legacyId, [recordA], { discoveryState: 'loaded' });
assert.equal(materializedA.ok, true);
state = materializedA.state;

const samePlanMerge = mergeWorkspaceEntrypointSet({ lifecycle, state, sourceInputs: [planA] });
assert.equal(samePlanMerge.ok, true);
assert.equal(samePlanMerge.merge.skippedLoads, 1, 'same canonical plan reuses the existing loaded configured source');
assert.equal(samePlanMerge.sourceInputs.length, 0, 'same loaded plan does not create a second materialization source');
state = samePlanMerge.state;
let workspace = state.workspaces.find((item) => item.id === workspaceId);
assert.equal(workspace.sources.filter((source) => sourceSignature(source) === sourceSignature(planA)).length, 1, 'same canonical plan remains one configured source');
assert(workspace.records.some((record) => record.source?.id === legacyId), 'source-bound records remain attached to the persisted source identity');

const distinctMerge = mergeWorkspaceEntrypointSet({ lifecycle, state, sourceInputs: [planB] });
assert.equal(distinctMerge.ok, true);
assert.equal(distinctMerge.merge.skippedLoads, 0, 'case-distinct plan remains eligible for materialization');
assert.equal(distinctMerge.sourceInputs.length, 1, 'case-distinct plan receives its own configured source/materialization input');
state = distinctMerge.state;
workspace = state.workspaces.find((item) => item.id === workspaceId);
const sourceA = workspace.sources.find((source) => sourceSignature(source) === sourceSignature(planA));
const sourceB = workspace.sources.find((source) => sourceSignature(source) === sourceSignature(planB));
assert(sourceA, 'existing Main/Foo source must survive registration of main/foo');
assert(sourceB, 'new main/foo source must coexist as a distinct configured source');
assert.equal(sourceA.id, legacyId, 'existing persisted source keeps its original identity');
assert.notEqual(sourceB.id, sourceA.id, 'distinct canonical source plans must never collide in configured-source storage');
assert.equal(sourceA.ref, 'Main');
assert.equal(sourceA.rootPath, '.topics/Foo');
assert.equal(sourceA.discoveryState, 'loaded', 'new distinct plan must not replace existing materialization truth');
assert.equal(sourceB.ref, 'main');
assert.equal(sourceB.rootPath, '.topics/foo');
assert.equal(sourceB.discoveryState, 'deferred');
assert(workspace.records.some((record) => record.source?.id === legacyId), 'existing source-bound record survives distinct-plan registration');
assert.equal(distinctMerge.sourceInputs[0].sourceId, sourceB.id, 'materialization is planned against the collision-safe new source identity');

// Re-register the same canonical persisted plan through the actual configured-source registration owner.
const samePlanRegistration = lifecycle.addWorkspaceSource(state, workspaceId, Object.assign({}, planA, {
  discoveryState: sourceA.discoveryState,
  count: sourceA.count,
  surfaces: sourceA.surfaces
}));
assert.equal(samePlanRegistration.ok, true);
assert.equal(samePlanRegistration.source.id, legacyId, 'same canonical plan reuses persisted/legacy source identity rather than adopting the new generator format');
workspace = samePlanRegistration.state.workspaces.find((item) => item.id === workspaceId);
assert.equal(workspace.sources.filter((source) => sourceSignature(source) === sourceSignature(planA)).length, 1, 'same-plan registration does not duplicate configured sources');
assert(workspace.records.some((record) => record.source?.id === legacyId), 'same-plan registration leaves source-bound records attached to the surviving source id');

console.log('✓ M3 configured source identity/equality closure tests passed');
