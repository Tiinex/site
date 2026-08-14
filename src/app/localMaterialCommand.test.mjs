import assert from 'node:assert/strict';
import { runLocalMaterialImportCommand, localMaterialCount, makePastedTraceFile } from './localMaterialCommand.js';
import { buildWorkspaceTreeExportBundle } from '../export/tree.bundle.js';
import { exportTreeZipUint8Array } from '../export/package.zip.js';
import '../sources/source.identity.js';
import '../workspaces/workspace.lifecycle.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;
const clock = () => '2026-08-09T00:00:00.000Z';
const recordMarkdown = '# Imported Leaf\n\n- Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)\n\n---\n\nBody';
const workspaceMarkdown = '# Gaming Workspace\n\n- Current Schema: [tiinex.workspace.v1](tiinex.workspace.v1.schema.md)\n';
const candidateMarkdown = '# Extra Workspace\n\n- Current Schema: [tiinex.workspace.v1](tiinex.workspace.v1.schema.md)\n';

function fileFromZip(name, zip) {
  return { name, size: zip.byteLength, type: 'application/zip', arrayBuffer: async () => zip.buffer.slice(zip.byteOffset, zip.byteOffset + zip.byteLength) };
}

const sourceBundle = {
  schema: 'tiinex.export.tree.bundle.v1',
  packageEnvelope: false,
  files: [
    { path: '.topics/gaming/000-gaming.workspace.md', kind: 'workspace-markdown', content: workspaceMarkdown },
    { path: '.topics/gaming/001-imported.trace.md', kind: 'artifact-markdown', content: recordMarkdown },
    { path: '.topics/gaming/999-extra.workspace.md', kind: 'workspace-markdown', content: candidateMarkdown },
    { path: 'assets/evidence/note.txt', kind: 'asset-content', content: 'local evidence' }
  ]
};
const sourceZip = exportTreeZipUint8Array(sourceBundle);
const imported = await runLocalMaterialImportCommand({
  lifecycle,
  state: lifecycle.makeEmptyAppState(),
  fileList: [fileFromZip('tiinex-tree-gaming.zip', sourceZip)],
  options: { clock, sourceMode: 'drop' }
});
assert.equal(imported.ok, true, 'tree zip import should succeed through the command boundary');
assert.equal(localMaterialCount(imported.adapterResult), 4, 'adapter material count includes records, assets, and workspace entries');
assert.equal(imported.applied.workspaceOpened, true, 'first workspace entry opens the workspace on empty state');
const workspace = lifecycle.activeWorkspace(imported.state);
assert.equal(workspace.title, 'Gaming Workspace');
assert.equal(workspace.records.length, 2, 'leaf plus extra workspace artifact share the canonical record spine');
assert.equal(workspace.assets.length, 1);
assert.equal(Object.prototype.hasOwnProperty.call(workspace, 'workspaceMergeCandidates'), false, 'new local imports must not create the legacy candidate runtime shape');
assert.equal(workspace.records.filter((record) => record.source?.kind === lifecycle.SESSION_SOURCE_KIND).length, 2, 'tree import remains browser-local, not guessed source-backed');
assert(workspace.records.some((record) => record.workspaceArtifactRole?.openEligible), 'extra workspace artifact keeps Open/Merge capability as a record role');

const exportedBundle = buildWorkspaceTreeExportBundle(workspace, { clock });
assert.equal(exportedBundle.packageEnvelope, false);
assert.equal(exportedBundle.counts.records, 1);
assert.equal(exportedBundle.counts.assets, 1);
assert.equal(exportedBundle.counts.workspaceEntries, 2, 'ordinary tree export preserves current workspace entry and staged workspace candidates');
assert(exportedBundle.files.some((file) => file.path === '.topics/gaming/000-gaming.workspace.md'));
assert(exportedBundle.files.some((file) => file.path === '.topics/gaming/999-extra.workspace.md'));
assert(!exportedBundle.files.some((file) => file.path.startsWith('artifacts/') || file.path.startsWith('tiinex.package/')));

const reimported = await runLocalMaterialImportCommand({
  lifecycle,
  state: lifecycle.makeEmptyAppState(),
  fileList: [fileFromZip('roundtrip.zip', exportTreeZipUint8Array(exportedBundle))],
  options: { clock, sourceMode: 'roundtrip-tree' }
});
assert.equal(reimported.ok, true);
const reimportedWorkspace = lifecycle.activeWorkspace(reimported.state);
assert.equal(reimportedWorkspace.records.length, 2, 'roundtripped ordinary tree export rehydrates leaf + workspace artifact records');
assert.equal(reimportedWorkspace.assets.length, 1, 'roundtripped ordinary tree export rehydrates local assets');
assert.equal(Object.prototype.hasOwnProperty.call(reimportedWorkspace, 'workspaceMergeCandidates'), false, 'roundtrip keeps workspace artifacts on the canonical record spine without legacy candidate shape');
assert.equal(reimportedWorkspace.records[0].source.kind, lifecycle.SESSION_SOURCE_KIND, 'roundtrip still does not infer GitHub provenance from logical paths');
assert.equal(reimported.summary.counts.records, 2, 'summary counts canonical leaf + workspace artifact records');
assert.equal(reimported.summary.counts.assets, 1);
assert.equal(reimported.summary.counts.workspaceEntries, 2);

const pastedTrace = makePastedTraceFile('# Continuity Context\n\n- Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)\n\n---\n\n# Pasted Trace', { clock });
assert(pastedTrace, 'PoC-compatible pasted trace Markdown must become a local intake file');
const pasted = await runLocalMaterialImportCommand({ lifecycle, state: lifecycle.makeEmptyAppState(), fileList: [pastedTrace], options: { clock, sourceMode: 'pasted-trace' } });
assert.equal(pasted.ok, true);
assert.equal(lifecycle.activeWorkspace(pasted.state).records.length, 1);
assert.equal(lifecycle.activeWorkspace(pasted.state).records[0].source.kind, lifecycle.SESSION_SOURCE_KIND, 'pasted trace remains local/session material');

console.log('✓ localMaterialCommand tests passed');
