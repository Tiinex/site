import assert from 'node:assert/strict';
import '../workspaces/workspace.lifecycle.js';
import { mergeWorkspaceEntrypointSet } from '../workspaces/workspace.entrypointLifecycle.js';
import { sourceMaterializationCompleteEnough, sourceSignature } from '../workspaces/workspace.entrypoints.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;

function sourceStateWithExact(refs, { count = refs.length, loaded = refs.length } = {}) {
  let state = lifecycle.makeEmptyAppState();
  const created = lifecycle.createWorkspace(state, { name: 'Exact files' });
  state = created.state;
  const added = lifecycle.addWorkspaceSource(state, created.workspace.id, {
    repository: 'owner/repo', ref: 'main', rootPath: '.topics', label: 'Exact files',
    repoDiscovery: false, issueDiscovery: false, explicitFileRefs: refs,
    discoveryState: 'loaded', count,
    surfaces: { explicitFiles: { requested: true, loaded, requestedCount: refs.length } }
  });
  return { state: added.state, workspaceId: created.workspace.id, sourceId: added.source.id };
}

const existingX = sourceStateWithExact(['.topics/x.md']);
const changed = mergeWorkspaceEntrypointSet({
  lifecycle,
  state: existingX.state,
  sourceInputs: [{ repository: 'owner/repo', ref: 'main', rootPath: '.topics', label: 'Exact files', repoDiscovery: false, issueDiscovery: false, explicitFileRefs: ['.topics/y.md'] }]
});
assert.equal(changed.ok, true);
assert.equal(changed.merge.createdCount, 0, 'changed exact target plan must reuse the same workspace rather than create a duplicate');
assert.equal(changed.merge.skippedLoads, 0, 'changed exact target plan must not be treated as already loaded');
assert.deepEqual(changed.sourceInputs[0]?.explicitFileRefs, ['.topics/y.md'], 'changed exact target must be prepared for materialization');
const changedSource = changed.state.workspaces.find((workspace) => workspace.id === existingX.workspaceId)?.sources.find((source) => source.id === existingX.sourceId);
assert.deepEqual(changedSource?.explicitFileRefs, ['.topics/y.md'], 'canonical source config updates to the incoming exact target plan');
assert.equal(changedSource?.discoveryState, 'deferred', 'changed source plan must no longer claim loaded material before y.md is materialized');

const existingXY = sourceStateWithExact(['.topics/x.md', '.topics/y.md']);
const reordered = mergeWorkspaceEntrypointSet({
  lifecycle,
  state: existingXY.state,
  sourceInputs: [{ repository: 'owner/repo', ref: 'main', rootPath: '.topics', label: 'Exact files', repoDiscovery: false, issueDiscovery: false, explicitFileRefs: ['.topics/y.md', '.topics/x.md'] }]
});
assert.equal(reordered.merge.skippedLoads, 1, 'same exact target set in different order must remain plan-equivalent');
assert.equal(reordered.sourceInputs.length, 0, 'mere exact-target ordering change must not trigger unnecessary materialization');

assert.equal(sourceMaterializationCompleteEnough({ discoveryState: 'loaded', count: 0, surfaces: { explicitFiles: { loaded: 0 } } }, { repoDiscovery: false, issueDiscovery: false, explicitFileRefs: ['.topics/x.md'] }), false, 'explicit-only source with no loaded exact material is incomplete');
assert.equal(sourceMaterializationCompleteEnough({ discoveryState: 'loaded', count: 1, surfaces: { explicitFiles: { loaded: 1 } } }, { repoDiscovery: false, issueDiscovery: false, explicitFileRefs: ['.topics/x.md'] }), true, 'explicit-only source is complete when its exact material is loaded');

const staleHistory = sourceSignature({ repository: 'owner/repo', ref: 'main', rootPath: '.topics', repoDiscovery: false, requestedSurfaces: { repoFiles: { requested: true } }, explicitFileRefs: ['.topics/x.md'] });
const currentOff = sourceSignature({ repository: 'owner/repo', ref: 'main', rootPath: '.topics', repoDiscovery: false, requestedSurfaces: { repoFiles: { requested: false } }, explicitFileRefs: ['.topics/x.md'] });
assert.equal(staleHistory, currentOff, 'historical requested repo surface must not affect canonical current source-plan identity');

const xy = sourceSignature({ repository: 'owner/repo', ref: 'main', rootPath: '.topics', repoDiscovery: false, explicitFileRefs: ['.topics/x.md', '.topics/y.md'] });
const yx = sourceSignature({ repository: 'owner/repo', ref: 'main', rootPath: '.topics', repoDiscovery: false, explicitFileRefs: ['.topics/y.md', '.topics/x.md'] });
assert.equal(xy, yx, 'exact file target order must not change plan identity');
assert.notEqual(xy, sourceSignature({ repository: 'owner/repo', ref: 'main', rootPath: '.topics', repoDiscovery: false, explicitFileRefs: ['.topics/z.md'] }), 'different exact target set must change plan identity');

console.log('✓ M2 Q source-plan equivalence closure tests passed');
