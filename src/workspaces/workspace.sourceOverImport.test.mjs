import assert from 'node:assert/strict';
import '../sources/source.identity.js';
import './workspace.lifecycle.js';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { applyLocalAdapterResultToWorkspace } from './workspace.import.js';
import { stateWithSourceMaterialCleared } from './workspace.sourceMaterial.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;
const clock = () => '2026-08-09T00:00:00.000Z';

function sourceWorkspace(name = 'Source shell') {
  let state = lifecycle.makeEmptyAppState();
  const created = lifecycle.createWorkspace(state, { name }, { clock });
  state = created.state;
  const registered = lifecycle.addWorkspaceSource(state, created.workspace.id, {
    label: 'Tiinex/docs', repository: 'Tiinex/docs', rootPath: '.topics'
  });
  return { state: registered.state, workspaceId: created.workspace.id, source: registered.source };
}

// PoC parity: identical local workspace artifact becomes redundant when verified
// source material with the same identity/checksum arrives. Workspace-ness is a
// role on the artifact record; no parallel workspace-candidate object is created.
{
  const fixture = sourceWorkspace('Workspace artifact source-over-import');
  const path = '.topics/docs/docs.workspace.md';
  const markdown = workspaceMarkdown('Documentation');
  const local = lifecycle.addWorkspaceRecord(fixture.state, fixture.workspaceId, {
    title: 'Documentation', path, kind: 'tiinex.workspace.v1', schemaId: 'tiinex.workspace.v1',
    markdown, sourceMode: 'local-tree-import', integrity: { entries: [{ towards: 'self', value: 'sha-docs-workspace' }] }
  }, { clock });
  const loaded = lifecycle.addWorkspaceSourceRecords(local.state, fixture.workspaceId, fixture.source.id, [{
    title: 'Documentation', path, kind: 'tiinex.workspace.v1', schemaId: 'tiinex.workspace.v1',
    markdown, sourceMode: 'source-backed-workspace-file', integrity: { entries: [{ towards: 'self', value: 'sha-docs-workspace' }] }
  }], { clock });
  assert.equal(loaded.ok, true);
  assert.equal(loaded.workspace.records.filter((record) => record.path === path).length, 1, 'verified equivalent workspace artifact has one canonical record');
  assert.equal(loaded.workspace.records[0].source.id, fixture.source.id, 'verified source becomes canonical');
  assert.equal(loaded.workspace.records[0].materialReconciliation?.status, 'source-canonical-pruned-local-duplicate');
  assert.equal(Object.prototype.hasOwnProperty.call(loaded.workspace, 'workspaceMergeCandidates'), false, 'workspace artifact must stay on canonical record runtime');

  const clearedForRefresh = stateWithSourceMaterialCleared(loaded.state, fixture.workspaceId, fixture.source.id, { discoveryState: 'deferred' });
  assert.equal(clearedForRefresh.ok, true);
  assert.equal(clearedForRefresh.workspace.records.some((record) => record.path === path), false, 'source refresh clear does not resurrect a previously deduplicated local copy');

  const closed = lifecycle.closeWorkspaceSource(loaded.state, fixture.workspaceId, fixture.source.id);
  assert.equal(closed.ok, true);
  assert.equal(closed.workspace.records.some((record) => record.path === path), false, 'source close does not resurrect a redundant local duplicate');
}

// Reverse direction: exact local import over already-loaded source material is
// ignored as redundant local payload. Divergent material is tested separately in
// workspace.materialReconciliation.test.mjs and remains explicit local material.
{
  const fixture = sourceWorkspace('Record reverse source-over-import');
  const path = '.topics/start.md';
  const markdown = '# Start\n\nSame content';
  const loaded = lifecycle.addWorkspaceSourceRecords(fixture.state, fixture.workspaceId, fixture.source.id, [{
    title: 'Start', path, markdown, sourceMode: 'source-backed', integrity: { entries: [{ towards: 'self', value: 'sha-start' }] }
  }], { clock });
  const imported = applyLocalAdapterResultToWorkspace(lifecycle, loaded.state, fixture.workspaceId, {
    schema: 'tiinex.adapter.result.v1', adapterId: 'archive', sourceId: 'local',
    records: [createRecordFromMarkdown(markdown, { path, sourceMode: 'archive-local', integrity: { entries: [{ towards: 'self', value: 'sha-start' }] } })],
    assets: [], workspaceEntries: [], warnings: [], errors: [], diagnostics: {}
  }, { clock });
  const workspace = lifecycle.activeWorkspace(imported.state);
  assert.equal(workspace.records.length, 1, 'exact local import over source does not create a competing record');
  assert.equal(workspace.records[0].source.id, fixture.source.id);
  assert.equal(workspace.records[0].materialReconciliation?.status, 'local-duplicate-pruned-source-canonical');
  assert.equal(workspace.records[0].materialReconciliation?.localSnapshot, undefined, 'no hidden local payload is retained');
  assert.equal(workspace.sources.find((item) => item.id === 'local')?.count || 0, 0, 'redundant local payload does not inflate Local counts');

  const clearLocal = lifecycle.closeWorkspaceSource(imported.state, fixture.workspaceId, 'local');
  assert.equal(clearLocal.workspace.records.length, 1, 'clearing Local leaves source canonical unchanged');
  const closeSource = lifecycle.closeWorkspaceSource(imported.state, fixture.workspaceId, fixture.source.id);
  assert.equal(closeSource.workspace.records.length, 0, 'closing source does not resurrect exact local duplicate');
}

// Workspace artifacts follow the exact same reverse contract as ordinary records.
{
  const fixture = sourceWorkspace('Workspace reverse source-over-import');
  const path = '.topics/docs/docs.workspace.md';
  const markdown = workspaceMarkdown('Documentation');
  const loaded = lifecycle.addWorkspaceSourceRecords(fixture.state, fixture.workspaceId, fixture.source.id, [{
    title: 'Documentation', path, kind: 'tiinex.workspace.v1', schemaId: 'tiinex.workspace.v1', markdown,
    sourceMode: 'source-backed-workspace-file', integrity: { entries: [{ towards: 'self', value: 'sha-docs-workspace' }] }
  }], { clock });
  const imported = applyLocalAdapterResultToWorkspace(lifecycle, loaded.state, fixture.workspaceId, {
    schema: 'tiinex.adapter.result.v1', adapterId: 'archive', sourceId: 'local', records: [], assets: [],
    workspaceEntries: [{ title: 'Documentation local', path, markdown, sourceMode: 'zip' }],
    warnings: [], errors: [], diagnostics: {}
  }, { clock });
  const workspace = lifecycle.activeWorkspace(imported.state);
  assert.equal(workspace.records.filter((record) => record.path === path).length, 1, 'workspace artifact remains one canonical record');
  assert.equal(workspace.records.find((record) => record.path === path)?.source.id, fixture.source.id, 'source workspace artifact stays canonical');
  assert.equal(Object.prototype.hasOwnProperty.call(workspace, 'workspaceMergeCandidates'), false, 'reverse workspace import does not create legacy candidate runtime shape');
}

// Local assets remain browser-local availability, never source/public truth.
{
  const imported = applyLocalAdapterResultToWorkspace(lifecycle, lifecycle.makeEmptyAppState(), '', {
    schema: 'tiinex.adapter.result.v1', adapterId: 'archive', sourceId: 'local', records: [],
    assets: [{ path: 'assets/evidence.png', name: 'evidence.png', type: 'image/png', size: 10, dataUrl: 'data:image/png;base64,ZmFrZQ==', source: { id: 'github:fake-assets', adapterId: 'github', kind: 'github-tree', label: 'Fake source' } }],
    workspaceEntries: [], warnings: [], errors: [], diagnostics: { suggestedWorkspaceName: 'Asset import' }
  }, { clock });
  const workspace = lifecycle.activeWorkspace(imported.state);
  assert.equal(workspace.assets[0].source.adapterId, 'local');
  assert.equal(workspace.assets[0].assetBoundary, 'local-asset-store');
  assert.equal(workspace.assets[0].publicAvailability, 'not-public');
  const cleared = lifecycle.closeWorkspaceSource(imported.state, workspace.id, 'local');
  assert.equal(cleared.workspace.assets.length, 0);
}

console.log('✓ workspace source-over-import tests passed');

function workspaceMarkdown(title) {
  return `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)\n- Current\n  - Current Schema: [tiinex.workspace.v1](tiinex.workspace.v1.schema.md)\n  - Created At: 2026-08-09\n  - Summary: ${title} workspace.\n\n---\n\n# ${title}\n\n## Workspace Entrypoints\n\n- Source Kind: github-tree\n- Repository: Tiinex/docs\n- Root Path: .topics\n\n# Continuity Integrity\n\n- sha256-base64url-c14n-v2\n  - Towards: self\n  - Value: sha-docs-workspace\n`;
}
