import assert from 'assert';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { applyLocalAdapterResultToWorkspace, ensureWorkspaceForLocalMaterial, summarizeAdapterImportResult } from './workspace.import.js';
import { mergeWorkspaceCandidate, openWorkspaceCandidate } from './workspace.candidates.js';
import '../sources/source.identity.js';
import './workspace.lifecycle.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;
const clock = () => '2026-07-20T21:30:00.000Z';
const sessionSource = { kind: 'local-session', adapterId: 'archive', sourceKind: 'archive.zip', boundary: 'browser-local archive material; no GitHub provenance inferred' };

try {
  const empty = lifecycle.makeEmptyAppState();
  const created = ensureWorkspaceForLocalMaterial(lifecycle, empty, '', { name: 'document-local-export' }, { clock });
  assert.equal(created.ok, true);
  assert.equal(created.created, true);
  assert.equal(created.workspace.name, 'document-local-export');
  assert.equal(created.state.activeWorkspaceId, created.workspace.id);
  assert(created.workspace.importLog.some((entry) => entry.kind === 'workspace-auto-created-for-local-import'));

  const reused = ensureWorkspaceForLocalMaterial(lifecycle, created.state, created.workspace.id, { name: 'ignored' });
  assert.equal(reused.ok, true);
  assert.equal(reused.created, false);
  assert.equal(reused.workspaceId, created.workspace.id);

  const record = createRecordFromMarkdown('# One\n\nBody', { path: 'docs/one.md', name: 'one.md', sourceMode: 'archive-local' });
  const asset = { path: 'assets/logo.png', name: 'logo.png', type: 'image/png', size: 10, previewState: 'metadata-only', source: sessionSource };
  const materialOnly = applyLocalAdapterResultToWorkspace(lifecycle, lifecycle.makeEmptyAppState(), '', {
    schema: 'tiinex.adapter.result.v1',
    adapterId: 'archive',
    sourceId: 'local',
    records: [record],
    assets: [asset],
    workspaceEntries: [],
    warnings: [{ code: 'archive.sample-warning', ref: 'sample', message: 'sample warning' }],
    errors: [],
    diagnostics: { suggestedWorkspaceName: 'Material bundle', previewOmittedCount: 1 }
  }, { clock });
  assert.equal(materialOnly.ok, true);
  assert.equal(materialOnly.workspaceOpened, true, 'material dropped on empty stage should auto-create workspace');
  const materialWorkspace = lifecycle.activeWorkspace(materialOnly.state);
  assert.equal(materialWorkspace.name, 'Material bundle');
  assert.equal(materialWorkspace.records.length, 1);
  assert.equal(materialWorkspace.assets.length, 1);
  assert.equal(materialWorkspace.records[0].source.kind, lifecycle.SESSION_SOURCE_KIND, 'archive records stay browser-local');
  assert.equal(materialWorkspace.records[0].source?.adapterId, 'local', 'archive records use lifecycle local/session provenance');
  assert.equal(materialWorkspace.assets[0].source.kind, 'local-session', 'archive assets stay browser-local');
  assert.equal(materialWorkspace.importResults[0].schema, 'tiinex.workspace.import.result.v1');
  assert.equal(materialWorkspace.importResults[0].counts.records, 1);
  assert.equal(materialWorkspace.importResults[0].counts.assets, 1);
  assert.equal(materialWorkspace.importResults[0].counts.warnings, 1);
  assert.equal(materialWorkspace.importResults[0].counts.previewOmitted, 1);

  const repeat = applyLocalAdapterResultToWorkspace(lifecycle, materialOnly.state, materialWorkspace.id, {
    schema: 'tiinex.adapter.result.v1',
    adapterId: 'archive',
    sourceId: 'local',
    records: [createRecordFromMarkdown('# One\n\nUpdated', { path: './docs//one.md', name: 'one.md', sourceMode: 'archive-local' })],
    assets: [{ path: './assets//logo.png', name: 'logo.png', type: 'image/png', size: 11, previewState: 'metadata-only', source: sessionSource }],
    workspaceEntries: [],
    warnings: [],
    errors: [],
    diagnostics: { suggestedWorkspaceName: 'Ignored' }
  }, { clock });
  const afterRepeat = lifecycle.activeWorkspace(repeat.state);
  assert.equal(afterRepeat.records.filter((item) => item.path === 'docs/one.md').length, 1, 'same canonical local path should upsert');
  assert.equal(afterRepeat.assets.filter((item) => item.path === 'assets/logo.png').length, 1, 'same canonical asset path should upsert');
  assert.equal(afterRepeat.assets[0].size, 11);

  const workspacePlusMaterial = applyLocalAdapterResultToWorkspace(lifecycle, lifecycle.makeEmptyAppState(), '', {
    schema: 'tiinex.adapter.result.v1',
    adapterId: 'archive',
    sourceId: 'local',
    records: [createRecordFromMarkdown('# Imported Leaf\n\nBody', { path: 'leaves/imported.md', name: 'imported.md', sourceMode: 'archive-local' })],
    assets: [{ path: 'assets/picture.png', name: 'picture.png', type: 'image/png', size: 5, previewState: 'metadata-only', source: sessionSource }],
    workspaceEntries: [{ path: 'viewer.workspace.md', title: 'Viewer Workspace', markdown: '# Viewer Workspace\n\n## Workspace Entrypoints\n', sourceMode: 'zip' }],
    warnings: [],
    errors: [],
    diagnostics: { suggestedWorkspaceName: 'Bundle' }
  }, { clock });
  assert.equal(workspacePlusMaterial.ok, true);
  const openedWorkspace = lifecycle.activeWorkspace(workspacePlusMaterial.state);
  assert.equal(openedWorkspace.workspaceImport.path, 'viewer.workspace.md');
  assert.equal(openedWorkspace.records.length, 1, 'workspace zip material should import into opened workspace');
  assert.equal(openedWorkspace.assets.length, 1, 'workspace zip assets should import into opened workspace');

  const multiWorkspace = applyLocalAdapterResultToWorkspace(lifecycle, lifecycle.makeEmptyAppState(), '', {
    schema: 'tiinex.adapter.result.v1',
    adapterId: 'archive',
    sourceId: 'local',
    records: [createRecordFromMarkdown('# Carried Material\n\nBody', { path: 'docs/carried.md', sourceMode: 'archive-local' })],
    assets: [{ id: 'asset:local:img.png', path: 'img.png', name: 'img.png', schema: 'tiinex.local.asset.v1', source: { kind: 'local-session' } }],
    workspaceEntries: [
      { path: 'a.workspace.md', title: 'Workspace A', markdown: '# Workspace A', sourceMode: 'zip' },
      { path: 'b.workspace.md', title: 'Workspace B', markdown: '# Workspace B', sourceMode: 'zip' }
    ],
    warnings: [],
    errors: [],
    diagnostics: {}
  }, { clock });
  const candidateWorkspace = lifecycle.activeWorkspace(multiWorkspace.state);
  assert.equal(candidateWorkspace.records.length, 1, 'material imported with the workspace bundle should be present before opening a candidate');
  assert.equal(candidateWorkspace.assets.length, 1, 'assets imported with the workspace bundle should be present before opening a candidate');
  assert.equal(candidateWorkspace.workspaceMergeCandidates.length, 1, 'extra workspace files should remain visible/actionable as candidates');
  assert.equal(candidateWorkspace.workspaceMergeCandidates[0].path, 'b.workspace.md');
  const repeatedCandidateImport = applyLocalAdapterResultToWorkspace(lifecycle, multiWorkspace.state, candidateWorkspace.id, {
    schema: 'tiinex.adapter.result.v1',
    adapterId: 'archive',
    sourceId: 'local',
    records: [createRecordFromMarkdown('# Carried Material\n\nBody', { path: 'docs/carried.md', sourceMode: 'archive-local' })],
    assets: [{ id: 'asset:local:img.png', path: 'img.png', name: 'img.png', schema: 'tiinex.local.asset.v1', source: { kind: 'local-session' } }],
    workspaceEntries: [{ path: './b.workspace.md', title: 'Workspace B updated', markdown: '# Workspace B updated', sourceMode: 'zip' }],
    warnings: [],
    errors: [],
    diagnostics: {}
  }, { clock });
  assert.equal(lifecycle.activeWorkspace(repeatedCandidateImport.state).workspaceMergeCandidates.length, 1, 'same workspace candidate path should upsert, not duplicate');
  const openedCandidate = openWorkspaceCandidate(lifecycle, multiWorkspace.state, candidateWorkspace.id, 'b.workspace.md', { clock });
  assert.equal(openedCandidate.ok, true, 'workspace candidates should be openable');
  const openedCandidateWorkspace = lifecycle.activeWorkspace(openedCandidate.state);
  assert.equal(openedCandidateWorkspace.name, 'Workspace B');
  assert.equal(openedCandidateWorkspace.records.length, 1, 'opening a workspace candidate should preserve imported material from the source bundle by default');
  assert.equal(openedCandidateWorkspace.assets.length, 1, 'opening a workspace candidate should preserve imported assets from the source bundle by default');
  assert.equal(openedCandidateWorkspace.workspaceMergeCandidates.length, 0, 'opened candidate should be removed from remaining candidates in the new workspace context');
  const mergedCandidate = mergeWorkspaceCandidate(lifecycle, multiWorkspace.state, candidateWorkspace.id, 'b.workspace.md', { clock });
  assert.equal(mergedCandidate.ok, true, 'workspace candidates should be mergeable');
  assert.equal(lifecycle.activeWorkspace(mergedCandidate.state).workspaceMergeCandidates.length, 0);
  assert.equal(lifecycle.activeWorkspace(mergedCandidate.state).workspaceMergedEntries.length, 1);

  const summary = summarizeAdapterImportResult({ warnings: [], errors: [{ code: 'x' }], diagnostics: {} }, { addedRecords: 0, addedAssets: 0, workspaceOpened: false, workspaceEntries: 0 });
  assert.equal(summary.schema, 'tiinex.workspace.import.result.v1');
  assert.equal(summary.counts.errors, 1);

  console.log('✓ workspace.import tests passed');
  process.exit(0);
} catch (error) {
  console.error('workspace.import tests failed:', error && error.stack ? error.stack : error);
  process.exit(1);
}
