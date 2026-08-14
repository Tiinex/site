import assert from 'node:assert/strict';
import { mergeWorkspaceCandidate, openWorkspaceCandidate } from './workspace.candidates.js';

await import('./workspace.lifecycle.js');
const lifecycle = globalThis.TiinexWorkspaceLifecycle;

const sourceCreated = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { name: 'Imported package' }, { clock: () => '2026-08-07T00:00:00.000Z' });
let state = sourceCreated.state;
const workspace = lifecycle.activeWorkspace(state);
workspace.records = [{ id: 'local:a', title: 'Artifact A', path: 'a.md', markdown: '# A', source: { adapterId: 'local', kind: 'local-session' }, sourceMode: 'archive-local' }];
workspace.sources = [{ id: 'local', kind: 'local', adapterId: 'local', sourceKind: 'local.session', label: 'Local', count: 2 }, { id: 'origin:github:demo:repo', sourceKind: 'github.origin-reference', recoveryOnly: true, label: 'GitHub origin · demo/repo', originReferenceCount: 1, sourceBacked: false, closeable: true }];
workspace.sourceOrder = workspace.sources.map((source) => source.id);
workspace.workspaceMergeCandidates = [{ id: 'candidate:fs25', title: 'FS25 Markaryd', path: 'fs25.workspace.md', markdown: '# FS25 Markaryd\n', sourceMode: 'local-workspace-candidate' }];

const opened = openWorkspaceCandidate(lifecycle, state, workspace.id, 'candidate:fs25', { clock: () => '2026-08-07T00:01:00.000Z' });
assert.equal(opened.ok, true, opened.error);
const openedWorkspace = lifecycle.activeWorkspace(opened.state);
assert.equal(openedWorkspace.title, 'FS25 Markaryd');
assert.equal(openedWorkspace.workspaceImport.openedFromWorkspaceTitle, 'Imported package');
assert.equal(openedWorkspace.workspaceMergeCandidates.length, 0, 'opened workspace does not own sibling workspace candidates');
assert.equal(openedWorkspace.records.length, 0, 'opened workspace does not clone package/import sibling records');
assert.deepEqual(openedWorkspace.sources.map((source) => source.id), ['local'], 'opened workspace keeps only its own local/session source row');
assert.equal(openedWorkspace.contextReferences[0].sourceWorkspaceId, workspace.id, 'origin/package identity remains available as reference-only context even when Open replaces its visible workspace');
assert.equal(openedWorkspace.contextReferences[0].ownedMaterialPolicy, 'reference-only', 'referenced context is not owned workspace material');
assert.equal(opened.state.workspaces.some((item) => item.title === 'Imported package'), true, 'local package workspace survives Open only because it contains durable local material');
assert(opened.openBoundary.keptLocalWorkspaces.includes(workspace.id), 'Open replacement report attributes survival to durable local material');

const merged = mergeWorkspaceCandidate(lifecycle, state, workspace.id, 'candidate:fs25', { clock: () => '2026-08-07T00:02:00.000Z' });
assert.equal(merged.ok, true, merged.error);
assert.equal(merged.state.activeWorkspaceId, workspace.id, 'merge keeps current workspace active');
assert.equal(merged.workspace.workspaceMergedEntries[0].mergedIntoWorkspaceTitle, 'Imported package');
assert.equal(merged.workspace.workspaceMergeCandidates.length, 0, 'merged candidate is no longer staged');
assert.equal(merged.merge.mode, 'metadata-context');

console.log('✓ workspace.candidates tests passed');
