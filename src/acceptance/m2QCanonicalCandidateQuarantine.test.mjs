import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { canonicalProductState } from '../app/productStateBoundary.js';
import { presentRecordActions, RecordActionKind } from '../actions/record.actions.js';
import { buildWorkspaceDiscoveryView } from '../workspaces/workspace.discoveryView.js';
import { buildWorkspacePathTree } from '../workspaces/workspace.pathTree.js';
import { summarizeWorkspaceMaterial } from '../workspaces/workspace.summary.js';
import { inferRecordMaterialRole, MaterialRole } from '../workspaces/workspace.materialRole.js';
import { assertCanonicalWorkspaceRuntimeState } from '../workspaces/workspace.runtimeCanonical.js';

const sandbox = { window: {}, globalThis: {} };
sandbox.globalThis = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(readFileSync(new URL('../workspaces/workspace.persistenceRecovery.js', import.meta.url), 'utf8'), sandbox);
const recovery = sandbox.window.TiinexWorkspacePersistenceRecovery;
assert.equal(typeof recovery?.normalizeLegacyWorkspaceCandidateState, 'function', 'legacy candidate migration remains an explicit I/O compatibility boundary');

const legacyState = {
  activeWorkspaceId: 'workspace:origin',
  view: {
    workspaceVerse: 'feed',
    displayOptions: { showWorkspaceCandidates: true, artifactFilter: 'workspace-candidate' }
  },
  workspaces: [{
    id: 'workspace:origin',
    name: 'Origin',
    title: 'Origin',
    records: [],
    assets: [],
    sources: [
      { id: 'local', adapterId: 'local', kind: 'local-session', sourceKind: 'local.session', label: 'Local' },
      { id: 'github:legacy', adapterId: 'github', kind: 'github-tree', sourceKind: 'github.repo', label: 'Legacy repo', closeable: true }
    ],
    workspaceMergeCandidates: [
      {
        id: 'candidate:source',
        title: 'Source workspace',
        path: '.topics/source.workspace.md',
        markdown: '# Source workspace',
        sourceMode: 'source-backed-workspace-file',
        source: { id: 'github:legacy', adapterId: 'github', kind: 'github-tree', sourceKind: 'github.repo', label: 'Legacy repo' }
      },
      {
        id: 'candidate:local',
        title: 'Local workspace',
        path: '.topics/local.workspace.md',
        markdown: '# Local workspace',
        sourceMode: 'local-workspace-file',
        source: { id: 'local', adapterId: 'local', kind: 'local-session', sourceKind: 'local.session', label: 'Local' }
      }
    ]
  }]
};

const migrated = recovery.normalizeLegacyWorkspaceCandidateState(legacyState);
const canonical = canonicalProductState(migrated, recovery, 'v381-legacy-ingress');
const workspace = canonical.workspaces[0];
assert.equal(Object.prototype.hasOwnProperty.call(workspace, 'workspaceMergeCandidates'), false, 'legacy candidate shape is consumed at ingress and absent from canonical runtime');
assert.equal(workspace.records.length, 2, 'legacy candidate inputs become canonical Workspace Artifact records exactly once');
assert.equal(canonical.view.displayOptions.showWorkspaceArtifacts, true, 'legacy display option migrates to canonical Workspace Artifact terminology at ingress');
assert.equal('showWorkspaceCandidates' in canonical.view.displayOptions, false, 'legacy display option is not retained as a runtime alias');
assert.equal(canonical.view.displayOptions.artifactFilter, 'workspace-artifact', 'legacy material filter migrates once at ingress');
assert.equal(assertCanonicalWorkspaceRuntimeState(canonical, 'v381').ok, true, 'normalized state satisfies strict canonical runtime shape');

for (const record of workspace.records) {
  assert.equal(inferRecordMaterialRole(record), MaterialRole.workspaceArtifact, 'normalized workspace record has canonical workspace-artifact material role');
  const actionIds = presentRecordActions(record).filter((action) => action.enabled !== false).map((action) => action.id);
  assert(actionIds.includes(RecordActionKind.open), 'Workspace Artifact keeps ordinary inspection action');
  assert(actionIds.includes(RecordActionKind.markdown), 'Workspace Artifact keeps ordinary Markdown action');
  assert(actionIds.includes(RecordActionKind.workspaceOpen), 'Workspace Artifact gains Open capability through ordinary record actions');
  assert(actionIds.includes(RecordActionKind.workspaceMerge), 'Workspace Artifact gains Merge capability through ordinary record actions');
}

const discovery = buildWorkspaceDiscoveryView(workspace, { displayOptions: canonical.view.displayOptions, query: '' });
assert.equal(discovery.counts.workspaceArtifacts, 2, 'canonical discovery names and counts Workspace Artifacts, not candidates');
assert.equal('workspaceCandidates' in discovery.counts, false, 'canonical discovery exposes no candidate count alias');
const tree = buildWorkspacePathTree(workspace, { displayOptions: canonical.view.displayOptions, query: '' });
assert.equal(tree.counts.workspaceArtifacts, 2, 'canonical tree names Workspace Artifacts');
assert.equal('workspaceCandidates' in tree.counts, false, 'canonical tree exposes no candidate count alias');
const summary = summarizeWorkspaceMaterial(workspace);
assert.equal(summary.counts.workspaceArtifacts, 2, 'canonical summary names Workspace Artifacts');
assert.equal('workspaceCandidates' in summary.counts, false, 'canonical summary exposes no candidate count alias');

await import('../sources/source.identity.js');
await import('../workspaces/workspace.lifecycle.js');
const lifecycle = globalThis.TiinexWorkspaceLifecycle;
assert(lifecycle, 'canonical lifecycle is available');

const sourceClosed = lifecycle.closeWorkspaceSource(canonical, workspace.id, 'github:legacy');
assert.equal(sourceClosed.ok, true, 'canonical source-close operates on normalized records');
const afterSourceClose = sourceClosed.state.workspaces.find((item) => item.id === workspace.id);
assert.equal(Object.prototype.hasOwnProperty.call(afterSourceClose, 'workspaceMergeCandidates'), false, 'source-close never recreates legacy candidate runtime shape');
assert.equal(afterSourceClose.records.some((record) => record.source?.id === 'github:legacy'), false, 'source-close removes source-backed Workspace Artifact record through the record spine');
assert.equal(afterSourceClose.records.some((record) => record.source?.id === 'local'), true, 'source-close preserves local Workspace Artifact record');

const localCleared = lifecycle.closeWorkspaceSource(sourceClosed.state, workspace.id, 'local');
assert.equal(localCleared.ok, true, 'canonical local-clear operates on normalized records');
const afterLocalClear = localCleared.state.workspaces.find((item) => item.id === workspace.id);
assert.equal(Object.prototype.hasOwnProperty.call(afterLocalClear, 'workspaceMergeCandidates'), false, 'local-clear never recreates legacy candidate runtime shape');
assert.equal(afterLocalClear.records.some((record) => record.source?.id === 'local'), false, 'local-clear removes local Workspace Artifact record through the record spine');
assert.equal(assertCanonicalWorkspaceRuntimeState(localCleared.state, 'v381-after-lifecycle').ok, true, 'subsequent canonical lifecycle remains candidate-free');

const leaked = { workspaces: [{ id: 'workspace:leak', records: [], workspaceMergeCandidates: [] }] };
assert.throws(
  () => canonicalProductState(leaked, null, 'v381-leak'),
  /workspace\.runtime-candidate-leak:v381-leak:workspace:leak/,
  'even an empty legacy candidate property past the boundary is an invariant failure, never a lifecycle/UI fallback'
);

const canonicalRuntimeFiles = [
  '../app/TiinexApp.jsx',
  '../workspaces/workspace.openSemantics.js',
  '../workspaces/workspace.localSourceLifecycle.js',
  '../workspaces/workspace.lifecycle.js',
  '../workspaces/workspace.sourceMaterial.js',
  '../workspaces/workspace.importConflicts.js',
  '../workspaces/workspace.discoveryView.js',
  '../workspaces/workspace.pathTree.js',
  '../workspaces/workspace.materialLedger.js',
  '../workspaces/workspace.summary.js',
  '../workspaces/workspace.displayOptions.js',
  '../workspaces/workspace.displayFilters.js'
];
const forbiddenRuntimeTerms = ['workspaceMergeCandidates', 'WorkspaceCandidate', 'workspaceCandidate', 'workspace-candidate', 'showWorkspaceCandidates', 'hidden-workspace-candidates'];
for (const relativePath of canonicalRuntimeFiles) {
  const source = readFileSync(new URL(relativePath, import.meta.url), 'utf8');
  for (const term of forbiddenRuntimeTerms) {
    assert.equal(source.includes(term), false, `${relativePath} must not depend on legacy candidate runtime term ${term}`);
  }
}

console.log('✓ M2 canonical candidate quarantine tests passed');
