import assert from 'assert';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { applyLocalAdapterResultToWorkspace, ensureWorkspaceForLocalMaterial, summarizeAdapterImportResult } from './workspace.import.js';
import { makeAdapterResult } from '../adapters/adapter.contracts.js';
import { materializeLocalMarkdownFiles } from '../adapters/local/local.adapter.js';
import { exportTreeZipUint8Array } from '../export/package.zip.js';
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
  assert.equal(candidateWorkspace.records.length, 2, 'material plus additional workspace artifact should share the canonical record spine');
  assert.equal(candidateWorkspace.assets.length, 1, 'assets imported with the workspace bundle should be present before opening a candidate');
  assert.equal(Object.prototype.hasOwnProperty.call(candidateWorkspace, 'workspaceMergeCandidates'), false, 'workspace artifacts must not create the legacy candidate runtime shape');
  assert(candidateWorkspace.records.some((record) => record.path === 'b.workspace.md' && (record.schemaId === 'tiinex.workspace.v1' || /workspace/.test(record.kind || '') || /\.workspace\.md$/i.test(record.path))), 'additional workspace file remains a normal artifact record with workspace capability');
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
  const repeatedWorkspace = lifecycle.activeWorkspace(repeatedCandidateImport.state);
  assert.equal(Object.prototype.hasOwnProperty.call(repeatedWorkspace, 'workspaceMergeCandidates'), false, 'repeat workspace import must remain on canonical artifact records without legacy candidate shape');
  assert.equal(repeatedWorkspace.records.filter((record) => record.path === 'b.workspace.md').length, 1, 'same local workspace artifact path currently resolves to one canonical record pending explicit conflict UI');



  const originMarkdown = `# Continuity Context

- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.workspace.v1](tiinex.workspace.v1.schema.md)
  - Trace: [issue root](issue-root-recovered-fs25-markaryd.workspace.md)
  - Origin:
    - relative: issue-root-recovered-fs25-markaryd.workspace.md
    - [github issue](https://github.com/Tiinusen/socials/issues/3)
- Current
  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)
  - Summary: origin child

---

# Origin Child`;
  const originAdapterResult = makeAdapterResult({
    adapterId: 'archive',
    sourceId: 'local',
    records: [createRecordFromMarkdown(originMarkdown, { path: '.topics/.github/tiinusen/socials/.issues/3/001-origin-child.trace.md', sourceMode: 'archive-local' })],
    assets: [],
    workspaceEntries: [],
    warnings: [],
    errors: [],
    diagnostics: { suggestedWorkspaceName: 'Origin Archive' }
  });
  assert(Object.isFrozen(originAdapterResult.diagnostics), 'adapter diagnostics are immutable at the adapter boundary');
  const originImport = applyLocalAdapterResultToWorkspace(lifecycle, lifecycle.makeEmptyAppState(), '', originAdapterResult, { clock });
  const originWorkspace = lifecycle.activeWorkspace(originImport.state);
  assert.equal(originWorkspace.records[0].source.kind, lifecycle.SESSION_SOURCE_KIND, 'imported origin-linked artifacts remain browser-local authority');
  const recoverySource = originWorkspace.sources.find((source) => source.id === 'origin:github:tiinusen:socials');
  assert(recoverySource, 'explicit origin reference should register a recovery source row');
  assert.equal(recoverySource.sourceBacked, false, 'origin recovery source must not make imported records source-backed');
  assert.equal(recoverySource.config.issueUrls, 'https://github.com/Tiinusen/socials/issues/3');
  assert.equal(originWorkspace.importResults[0].diagnostics.originReferenceSourceCount, 1, 'origin reference diagnostics should be copied into import summary without mutating frozen adapter result');
  assert.equal(originAdapterResult.diagnostics.originReferenceSourceCount, undefined, 'adapter result remains immutable/input-only');

  const treeZip = exportTreeZipUint8Array({
    schema: 'tiinex.export.tree.bundle.v1',
    packageEnvelope: false,
    files: [
      { path: '.topics/example/001-origin-child.trace.md', kind: 'artifact-markdown', content: originMarkdown },
      { path: '.topics/example/000-example.workspace.md', kind: 'artifact-markdown', content: '# Example Workspace\n\n- Current Schema: [tiinex.workspace.v1](tiinex.workspace.v1.schema.md)\n' }
    ]
  });
  const treeFile = {
    name: '001-example.zip',
    size: treeZip.byteLength,
    type: 'application/zip',
    arrayBuffer: async () => treeZip.buffer.slice(treeZip.byteOffset, treeZip.byteOffset + treeZip.byteLength)
  };
  const localZipResult = await materializeLocalMarkdownFiles([treeFile], { sourceMode: 'drop' });
  assert(Object.isFrozen(localZipResult), 'local adapter result should be immutable');
  assert.equal(localZipResult.records.length, 1, 'tree zip import should materialize record entries');
  assert.equal(localZipResult.workspaceEntries.length, 1, 'tree zip import should stage workspace entries through the same path');
  const target = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { name: 'Drop Target' }, { clock });
  const appliedTreeZip = applyLocalAdapterResultToWorkspace(lifecycle, target.state, target.workspace.id, localZipResult, { clock });
  assert.equal(appliedTreeZip.ok, true, 'drag/drop tree zip should apply into the active workspace');
  const dropWorkspace = lifecycle.activeWorkspace(appliedTreeZip.state);
  assert.equal(dropWorkspace.records.length, 2, 'drag/drop tree zip should preserve trace + workspace artifact on one canonical record spine');
  assert.equal(Object.prototype.hasOwnProperty.call(dropWorkspace, 'workspaceMergeCandidates'), false, 'drag/drop workspace artifact must not create the legacy candidate runtime shape');
  assert.equal(dropWorkspace.importResults[0].counts.records, 2);
  assert.equal(dropWorkspace.importResults[0].counts.workspaceEntries, 1);

  const summary = summarizeAdapterImportResult({ warnings: [], errors: [{ code: 'x' }], diagnostics: {} }, { addedRecords: 0, addedAssets: 0, workspaceOpened: false, workspaceEntries: 0 });
  assert.equal(summary.schema, 'tiinex.workspace.import.result.v1');
  assert.equal(summary.counts.errors, 1);

  console.log('✓ workspace.import tests passed');
  process.exit(0);
} catch (error) {
  console.error('workspace.import tests failed:', error && error.stack ? error.stack : error);
  process.exit(1);
}
