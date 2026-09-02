import assert from 'node:assert/strict';
import '../sources/source.identity.js';
import './workspace.route.js';
import './workspace.persistenceRouteCache.js';
import './workspace.persistenceClear.js';
import './workspace.persistence.js';
import './workspace.lifecycle.js';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { applyLocalAdapterResultToWorkspace } from './workspace.import.js';
import { summarizeWorkspaceMaterial } from './workspace.summary.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;
const persistence = globalThis.TiinexWorkspacePersistence;
const clock = () => '2026-08-11T00:00:00.000Z';

function memoryEnv() {
  const storageMap = new Map();
  const location = { pathname: '/index.html', search: '', hash: '' };
  const history = {
    replaceState: (_state, _title, url) => { location.hash = url.includes('#') ? `#${url.split('#').pop()}` : ''; },
    pushState: (_state, _title, url) => { location.hash = url.includes('#') ? `#${url.split('#').pop()}` : ''; }
  };
  const storage = {
    getItem: (key) => storageMap.get(key) || null,
    setItem: (key, value) => storageMap.set(key, String(value)),
    removeItem: (key) => storageMap.delete(key)
  };
  return { storage, location, history, storageMap };
}

let state = lifecycle.makeEmptyAppState();
const created = lifecycle.createWorkspace(state, { name: 'M1 Lifecycle' }, { clock });
state = created.state;
const workspaceId = created.workspace.id;
const registered = lifecycle.addWorkspaceSource(state, workspaceId, { label: 'Tiinex/docs', repository: 'Tiinex/docs', rootPath: '.topics', repoDiscovery: true });
state = registered.state;
const source = registered.source;

const startPath = '.topics/start.md';
const startMarkdown = '# Start\n\nSame content';
const docsPath = '.topics/docs.workspace.md';
const docsMarkdown = '# Documentation\n\n- Current Schema: tiinex.workspace.v1\n\n## Workspace Entrypoints\n\n- Source Kind: github-tree\n- Repository: Tiinex/docs\n- Root Path: .topics\n';

const sourceLoaded = lifecycle.addWorkspaceSourceRecords(state, workspaceId, source.id, [
  { title: 'Start', path: startPath, markdown: startMarkdown, sourceMode: 'source-backed', integrity: { entries: [{ towards: 'self', value: 'sha-start' }] } },
  { title: 'Documentation', path: docsPath, kind: 'tiinex.workspace.v1', schemaId: 'tiinex.workspace.v1', markdown: docsMarkdown, sourceMode: 'source-backed', integrity: { entries: [{ towards: 'self', value: 'sha-docs' }] } }
], { clock });
assert.equal(sourceLoaded.ok, true, sourceLoaded.error);
state = sourceLoaded.state;
assert.equal(Object.prototype.hasOwnProperty.call(sourceLoaded.workspace, 'workspaceMergeCandidates'), false, 'source workspace artifacts stay on the canonical record spine');

const imported = applyLocalAdapterResultToWorkspace(lifecycle, state, workspaceId, {
  schema: 'tiinex.adapter.result.v1', adapterId: 'archive', sourceId: 'local',
  records: [createRecordFromMarkdown(startMarkdown, { title: 'Start local duplicate', path: startPath, sourceMode: 'archive-local' })],
  assets: [{ path: 'assets/evidence.png', name: 'evidence.png', type: 'image/png', size: 12, dataUrl: 'data:image/png;base64,ZmFrZQ==', sourceMode: 'archive-local-asset', source: { id: source.id, adapterId: 'github', kind: 'github-tree' }, publicAvailability: 'public' }],
  workspaceEntries: [{ title: 'Documentation local duplicate', path: docsPath, markdown: docsMarkdown, sourceMode: 'zip' }],
  warnings: [], errors: [], diagnostics: { suggestedWorkspaceName: 'Ignored' }
}, { clock });
assert.equal(imported.ok, true, imported.summary?.message);
state = imported.state;

const reconciled = lifecycle.activeWorkspace(state);
assert.equal(reconciled.records.length, 2, 'verified source equivalents stay canonical with redundant local payload pruned');
assert.equal(Object.prototype.hasOwnProperty.call(reconciled, 'workspaceMergeCandidates'), false, 'workspace artifact reconciliation does not create legacy candidate runtime shape');
assert.equal(reconciled.records.filter((record) => record.source?.id === source.id).length, 2);
assert.equal(reconciled.records.some((record) => record.materialReconciliation?.localSnapshot), false, 'new reconciliation never hides exact local duplicates as resurrection snapshots');
assert.equal(reconciled.assets.length, 1, 'independent local asset remains available');
assert.equal(reconciled.assets[0].source.adapterId, 'local', 'local asset cannot carry fake GitHub source');
assert.equal(reconciled.assets[0].publicAvailability, 'not-public', 'local asset availability is not public truth');
const summary = summarizeWorkspaceMaterial(reconciled);
assert.equal(summary.counts.localAssets, 1);
assert.equal(summary.counts.reconciledLocalRecords, 0, 'snapshot counts are zero for new canonical reconciliation');
assert.equal('reconciledLocalWorkspaceCandidates' in summary.counts, false, 'canonical summary exposes no legacy candidate reconciliation count');
assert.equal(summary.boundaryReadability.mixed, true, 'source records plus independent local asset remain an explicit mixed boundary');

const env = memoryEnv();
persistence.writeState(state, { storage: env.storage, location: env.location, history: env.history, mode: 'push' });
assert(env.storageMap.has(persistence.STORAGE_KEY), 'route/source shell cache is separate');
assert(env.storageMap.has(persistence.LOCAL_DELTA_KEY), 'durable local delta store is separate');
const restored = persistence.readInitialState({ storage: env.storage, location: env.location });
assert(restored, 'explicit route restore merges route/source shell with local deltas');
const restoredWorkspace = restored.workspaces.find((workspace) => workspace.id === workspaceId);
assert.equal(restoredWorkspace.records.length, 2, 'source record shells restore without local duplicate resurrection');
assert(restoredWorkspace.records.every((record) => !record.markdown), 'source-backed Markdown is not localStorage authority');
assert.equal(restoredWorkspace.assets.length, 1, 'durable local asset delta rejoins the matching workspace');
assert.equal(restoredWorkspace.assets[0].publicAvailability, 'not-public');

const sourceClosedFirst = lifecycle.closeWorkspaceSource(restored, workspaceId, source.id);
assert.equal(sourceClosedFirst.ok, true);
assert.equal(sourceClosedFirst.workspace.records.length, 0, 'closing source does not resurrect previously deduplicated local copies');
assert.equal(Object.prototype.hasOwnProperty.call(sourceClosedFirst.workspace, 'workspaceMergeCandidates'), false, 'source-close does not recreate legacy candidate runtime shape');
assert.equal(sourceClosedFirst.workspace.assets.length, 1, 'independent local asset survives source close');

const localCleared = lifecycle.closeWorkspaceSource(restored, workspaceId, 'local');
assert.equal(localCleared.ok, true);
assert.equal(localCleared.workspace.records.length, 2, 'clear local leaves source-backed record shells intact');
assert.equal(localCleared.workspace.assets.length, 0, 'clear local removes local asset availability');
const sourceClosedAfterClear = lifecycle.closeWorkspaceSource(localCleared.state, workspaceId, source.id);
assert.equal(sourceClosedAfterClear.ok, true);
assert.equal(sourceClosedAfterClear.workspace.records.length, 0, 'source close after local clear has nothing local to resurrect');
assert.equal(sourceClosedAfterClear.workspace.assets.length, 0);

// Page/Playthings global drop is an explicit new-workspace operation for ordinary material.
// It must never silently target whichever workspace happens to be active.
const globalDrop = applyLocalAdapterResultToWorkspace(lifecycle, state, '', {
  schema: 'tiinex.adapter.result.v1', adapterId: 'local', sourceId: 'local',
  records: [createRecordFromMarkdown('# Globally dropped', { path: 'global-drop.md', sourceMode: 'manual-file' })],
  assets: [], workspaceEntries: [], warnings: [], errors: [], diagnostics: { suggestedWorkspaceName: 'Global drop' }
}, { clock, dropScope: 'global' });
assert.equal(globalDrop.ok, true);
assert.equal(globalDrop.state.workspaces.length, state.workspaces.length + 1, 'ordinary global drop creates a separate workspace');
assert.notEqual(globalDrop.workspaceId, workspaceId, 'ordinary global drop must not inherit active workspace identity');
assert.equal(globalDrop.state.workspaces.find((workspace) => workspace.id === globalDrop.workspaceId)?.records.length, 1);

console.log('✓ workspace import lifecycle tests passed');
