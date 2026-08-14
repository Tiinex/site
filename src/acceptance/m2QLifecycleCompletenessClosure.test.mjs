import assert from 'node:assert/strict';
import '../workspaces/workspace.lifecycle.js';
import { mergeWorkspaceEntrypointSet } from '../workspaces/workspace.entrypointLifecycle.js';
import { sourceMaterializationCompleteEnough } from '../workspaces/workspace.entrypoints.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;

function loadedExactState(refs = []) {
  let state = lifecycle.makeEmptyAppState();
  const created = lifecycle.createWorkspace(state, { name: 'Exact files' });
  state = created.state;
  const added = lifecycle.addWorkspaceSource(state, created.workspace.id, {
    repository: 'owner/repo', ref: 'main', rootPath: '.topics', label: 'Exact files',
    sourceKind: 'github.repo', repoDiscovery: false, issueDiscovery: false,
    explicitFileRefs: refs, discoveryState: 'loaded', count: refs.length,
    surfaces: { explicitFiles: { requested: true, attempted: true, loaded: refs.length, requestedCount: refs.length } },
    transportRefreshTier: 'mirror', loadable: true
  });
  return { state: added.state, workspaceId: created.workspace.id, sourceId: added.source.id, source: added.source };
}

const existing = loadedExactState(['.topics/x.md', '.topics/y.md']);
const before = JSON.parse(JSON.stringify(existing.state.workspaces.find((w) => w.id === existing.workspaceId).sources.find((s) => s.id === existing.sourceId)));
const reordered = mergeWorkspaceEntrypointSet({
  lifecycle,
  state: existing.state,
  sourceInputs: [{ repository: 'owner/repo', ref: 'main', rootPath: '.topics', label: 'Exact files', repoDiscovery: false, issueDiscovery: false, explicitFileRefs: ['.topics/y.md', '.topics/x.md'] }]
});
assert.equal(reordered.ok, true);
assert.equal(reordered.merge.skippedLoads, 1, 'plan-equivalent exact target set must skip materialization');
assert.equal(reordered.sourceInputs.length, 0, 'no materialization input should be prepared for a complete equivalent plan');
const after = reordered.state.workspaces.find((w) => w.id === existing.workspaceId).sources.find((s) => s.id === existing.sourceId);
assert.equal(after.id, before.id, 'same stable source must survive the no-op merge');
assert.equal(after.count, 2, 'no-op merge must preserve source material count');
assert.equal(after.surfaces?.explicitFiles?.loaded, 2, 'no-op merge must preserve exact-file materialization evidence');
assert.equal(after.sourceKind, 'github.repo', 'no-op merge must preserve source kind/capability details');
assert.equal(after.discoveryState, 'loaded', 'no-op merge must preserve current discovery state');
assert.equal(after.transportRefreshTier, 'mirror', 'no-op merge must preserve transport capability/runtime truth');

const exactLoaded = { requested: true, attempted: true, requestedCount: 1, loaded: 1 };
assert.equal(sourceMaterializationCompleteEnough({
  discoveryState: 'loaded', count: 1,
  surfaces: { explicitFiles: exactLoaded, repoFiles: { requested: true, attempted: false, loaded: 0 } }
}, { repoDiscovery: true, issueDiscovery: false, explicitFileRefs: ['.topics/x.md'] }), false, 'exact success must not stand in for unattempted broad repo discovery');

assert.equal(sourceMaterializationCompleteEnough({
  discoveryState: 'loaded', count: 1,
  surfaces: { explicitFiles: exactLoaded, repoFiles: { requested: true, attempted: true, discovered: 0, loaded: 0 } }
}, { repoDiscovery: true, issueDiscovery: false, explicitFileRefs: ['.topics/x.md'] }), true, 'completed broad repo attempt may truthfully find zero results while exact target is loaded');

assert.equal(sourceMaterializationCompleteEnough({
  discoveryState: 'partial', count: 1,
  surfaces: { explicitFiles: exactLoaded, issueSnapshots: { requested: true, attempted: false, loaded: 0 } }
}, { repoDiscovery: false, issueDiscovery: true, explicitFileRefs: ['.topics/x.md'] }), false, 'exact success must not stand in for unhandled broad issue discovery');

assert.equal(sourceMaterializationCompleteEnough({
  discoveryState: 'loaded', count: 1,
  surfaces: { explicitFiles: exactLoaded }
}, { repoDiscovery: false, issueDiscovery: false, explicitFileRefs: ['.topics/x.md'] }), true, 'exact-only loaded source remains complete');

console.log('✓ M2 Q lifecycle completeness closure tests passed');
