import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { canonicalProductState } from '../app/productStateBoundary.js';
import { presentRecordActions, RecordActionKind } from '../actions/record.actions.js';
import { buildWorkspaceDiscoveryView } from '../workspaces/workspace.discoveryView.js';
import { assertCanonicalWorkspaceRuntimeState } from '../workspaces/workspace.runtimeCanonical.js';

const sandbox = { window: {}, globalThis: {} };
sandbox.globalThis = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(readFileSync(new URL('../workspaces/workspace.persistenceRecovery.js', import.meta.url), 'utf8'), sandbox);
const recovery = sandbox.window.TiinexWorkspacePersistenceRecovery;
assert.equal(typeof recovery?.normalizeLegacyWorkspaceCandidateState, 'function', 'legacy candidate normalization remains an explicit compatibility boundary');

const legacyCandidate = {
  id: 'candidate:legacy-docs',
  title: 'Documentation',
  path: '.topics/documentation/documentation.workspace.md',
  markdown: '# Documentation\n\n- Current Schema: [tiinex.workspace.v1](tiinex.workspace.v1.schema.md)\n',
  sourceMode: 'package-import-workspace-candidate',
  source: { id: 'package:legacy', adapterId: 'package', label: 'Legacy package' }
};
const legacyState = {
  activeWorkspaceId: 'workspace:origin',
  view: { workspaceVerse: 'feed' },
  workspaces: [{ id: 'workspace:origin', name: 'Origin', title: 'Origin', records: [], assets: [], sources: [], workspaceMergeCandidates: [legacyCandidate] }]
};

const canonical = canonicalProductState(legacyState, recovery, 'v380-legacy-compatibility');
assert.equal(Object.prototype.hasOwnProperty.call(canonical.workspaces[0], 'workspaceMergeCandidates'), false, 'legacy candidate shape is consumed before product runtime');
assert.equal(canonical.workspaces[0].records.length, 1, 'legacy candidate becomes one canonical artifact record');
const record = canonical.workspaces[0].records[0];
assert.equal(record.workspaceArtifactRole?.migratedFromLegacyCandidate, true, 'compatibility normalization preserves migration evidence on the canonical record');
assert.equal(assertCanonicalWorkspaceRuntimeState(canonical, 'v380').ok, true, 'normalized state satisfies canonical runtime invariant');

const actionIds = presentRecordActions(record).filter((action) => action.enabled !== false).map((action) => action.id);
assert(actionIds.includes(RecordActionKind.workspaceOpen), 'canonical workspace artifact receives Open through ordinary record actions');
assert(actionIds.includes(RecordActionKind.workspaceMerge), 'canonical workspace artifact receives Merge through ordinary record actions');
assert(actionIds.includes(RecordActionKind.open), 'canonical workspace artifact retains generic artifact inspection actions');
assert(actionIds.includes(RecordActionKind.markdown), 'canonical workspace artifact retains generic Markdown action');

const discovery = buildWorkspaceDiscoveryView(canonical.workspaces[0], {
  displayOptions: { leavesOnly: false, showSupportingMarkdown: true, showWorkspaceArtifacts: true, showAssets: true },
  query: ''
});
assert.equal(discovery.records.length, 1, 'canonical discovery consumes workspace artifact as an ordinary record');
assert.equal('workspaceCandidates' in discovery, false, 'canonical discovery exposes no parallel candidate collection');

const cardsSource = readFileSync(new URL('../schemas/workspace/workspace.cards.views.jsx', import.meta.url), 'utf8');
const discoverySource = readFileSync(new URL('../schemas/workspace/workspace.discovery.views.jsx', import.meta.url), 'utf8');
const treeSource = readFileSync(new URL('../schemas/workspace/workspace.tree.views.jsx', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../app/TiinexApp.jsx', import.meta.url), 'utf8');
assert.equal(cardsSource.includes('WorkspaceCandidateCard'), false, 'candidate-specific card renderer is removed');
assert.equal(discoverySource.includes('WorkspaceCandidateCard'), false, 'discovery cannot fall back to candidate-specific product UI');
assert.equal(treeSource.includes('tx-tree-workspace-candidate-row'), false, 'tree has no candidate-specific product row');
assert.equal(appSource.includes("workspace.candidates.js"), false, 'TiinexApp canonical product path does not import legacy candidate commands');

const leaked = { workspaces: [{ id: 'workspace:leak', records: [], workspaceMergeCandidates: [{ id: 'leak' }] }] };
assert.throws(() => canonicalProductState(leaked, null, 'v380-leak'), /workspace\.runtime-candidate-leak:v380-leak:workspace:leak/, 'unnormalized candidate leakage fails the product invariant instead of rendering a fallback');

console.log('✓ M2 canonical workspace runtime debt closure tests passed');
