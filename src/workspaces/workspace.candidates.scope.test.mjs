import assert from 'node:assert/strict';
import { openWorkspaceCandidate } from './workspace.candidates.js';

await import('./workspace.lifecycle.js');
const lifecycle = globalThis.TiinexWorkspaceLifecycle;

const created = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { name: 'Package A/B/C' }, { clock: () => '2026-08-11T10:00:00.000Z' });
let state = created.state;
const packageWorkspace = lifecycle.activeWorkspace(state);
packageWorkspace.records = [
  { id: 'record:a', title: 'Sibling A', path: 'a.trace.md', markdown: '# A', source: { id: 'local', adapterId: 'local', sourceKind: 'local.session' }, sourceMode: 'package-import' },
  { id: 'record:c', title: 'Sibling C', path: 'c.trace.md', markdown: '# C', source: { id: 'origin:github:demo/repo', adapterId: 'github', sourceKind: 'github.origin-reference' }, sourceMode: 'source-reference' }
];
packageWorkspace.assets = [{ id: 'asset:a', path: 'a.png', source: { id: 'local', adapterId: 'local' } }];
packageWorkspace.sources = [
  { id: 'local', adapterId: 'local', sourceKind: 'local.session', label: 'Local', count: 1 },
  { id: 'origin:github:demo/repo', adapterId: 'github', sourceKind: 'github.origin-reference', label: 'GitHub origin · demo/repo', recoveryOnly: true, count: 1 }
];
packageWorkspace.sourceOrder = packageWorkspace.sources.map((source) => source.id);
packageWorkspace.workspaceMergeCandidates = [
  { id: 'candidate:b', title: 'Workspace B', path: 'b.workspace.md', markdown: '# Workspace B\n', sourceMode: 'package-import-workspace-candidate' },
  { id: 'candidate:c', title: 'Workspace C', path: 'c.workspace.md', markdown: '# Workspace C\n', sourceMode: 'package-import-workspace-candidate' }
];

const opened = openWorkspaceCandidate(lifecycle, state, packageWorkspace.id, 'candidate:b', { clock: () => '2026-08-11T10:01:00.000Z' });
assert.equal(opened.ok, true, opened.error);
const openedWorkspace = lifecycle.activeWorkspace(opened.state);

assert.equal(openedWorkspace.title, 'Workspace B');
assert.equal(openedWorkspace.records.length, 0, 'Open must not clone sibling package records into the opened workspace');
assert.equal(openedWorkspace.assets.length, 0, 'Open must not clone sibling package assets into the opened workspace');
assert.deepEqual(openedWorkspace.sources.map((source) => source.id), ['local'], 'Open must not inherit active/recovery source rows from the package workspace');
assert.equal(openedWorkspace.workspaceMergeCandidates.length, 0, 'Open must not inherit sibling workspace candidates as owned candidates');
assert.equal(openedWorkspace.workspaceImport.openedFromWorkspaceId, packageWorkspace.id, 'Open keeps explicit origin reference metadata');
assert.equal(openedWorkspace.workspaceImport.contextReferenceId, `workspace-context:${packageWorkspace.id}:b.workspace.md`, 'Open records a stable context reference id');
assert.equal(openedWorkspace.contextReferences[0].sourceWorkspaceId, packageWorkspace.id, 'Open may reference package context for lineage/recovery');
assert.equal(openedWorkspace.contextReferences[0].ownedMaterialPolicy, 'reference-only', 'Context reference is not owned workspace material');
assert.equal(opened.state.workspaces.some((workspace) => workspace.id === packageWorkspace.id), true, 'Open preserves an origin/package workspace only because it contains durable local material');
assert(opened.openBoundary.keptLocalWorkspaces.includes(packageWorkspace.id), 'preserved package workspace is classified as local-work preservation, not required context visibility');


const sourceOnlyCreated = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { name: 'Source only package' }, { clock: () => '2026-08-11T10:02:00.000Z' });
const sourceOnlyWorkspace = lifecycle.activeWorkspace(sourceOnlyCreated.state);
sourceOnlyWorkspace.records = [{ id: 'source:r', title: 'Remote', path: 'remote.md', markdown: '# Remote', source: { id: 'github:demo/repo', adapterId: 'github', repository: 'demo/repo' }, sourceMode: 'source-backed' }];
sourceOnlyWorkspace.assets = [];
sourceOnlyWorkspace.sources = [{ id: 'github:demo/repo', adapterId: 'github', sourceKind: 'github.repo', repository: 'demo/repo' }];
sourceOnlyWorkspace.sourceOrder = ['github:demo/repo'];
sourceOnlyWorkspace.workspaceMergeCandidates = [{ id: 'candidate:source-only', title: 'Source only target', path: 'target.workspace.md', markdown: '# Source only target\n', sourceMode: 'source-backed-workspace-file', source: { id: 'github:demo/repo', adapterId: 'github' } }];
const sourceOnlyOpened = openWorkspaceCandidate(lifecycle, sourceOnlyCreated.state, sourceOnlyWorkspace.id, 'candidate:source-only', { clock: () => '2026-08-11T10:03:00.000Z' });
assert.equal(sourceOnlyOpened.ok, true, sourceOnlyOpened.error);
assert.equal(sourceOnlyOpened.state.workspaces.some((workspace) => workspace.id === sourceOnlyWorkspace.id), false, 'Open replaces a source-only origin workspace; context reference does not require a visible sibling workspace');
assert.equal(sourceOnlyOpened.workspace.contextReferences[0].sourceWorkspaceId, sourceOnlyWorkspace.id, 'replaced source workspace remains referencable for lineage/recovery');

console.log('✓ workspace candidate scope tests passed');
