import assert from 'node:assert/strict';
import '../sources/source.identity.js';
import '../workspaces/workspace.lifecycle.js';
import '../workspaces/workspace.persistenceRecovery.js';
import '../workspaces/workspace.persistenceRouteCache.js';
import '../workspaces/workspace.persistence.js';
import { buildExportPackageBundle } from '../export/package.builder.js';
import { exportFileMapZipUint8Array, exportPackageZipUint8Array, exportTreeZipUint8Array } from '../export/package.zip.js';
import { buildWorkspaceTreeExportBundle } from '../export/tree.bundle.js';
import { applyOperationalHandoffPackageToWorkspace, tryReadOperationalHandoffPackage } from './handoffPackageImportCommand.js';
import { runLocalMaterialImportCommand } from './localMaterialCommand.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;
const persistence = globalThis.TiinexWorkspacePersistence;
const markdown = `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.topic.v1\n  - Created At: 2026-08-19T12:00:00.000Z\n  - Summary: Local draft\n\n---\n\n# Local draft\n\nBody\n\n# Continuity Integrity\n\n- Draft Local Integrity\n  - Method: browser-local-draft\n  - Value: pending-publication-or-export\n`;
const workspaceMarkdown = `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.workspace.v1\n  - Created At: 2026-08-19T12:00:00.000Z\n  - Summary: Package workspace\n\n---\n\n# Package workspace\n\n# Continuity Integrity\n\n- Draft Local Integrity\n  - Method: browser-local-draft\n  - Value: pending-publication-or-export\n`;
const packageWorkspace = {
  id: 'w-package', title: 'Package workspace', workspaceMarkdown,
  workspaceImport: { sourceMode: 'local-manual', boundary: 'browser-local', localDraft: true, path: 'package.workspace.md' },
  records: [
    { id: 'local-a', title: 'Local A', path: 'local/a.trace.md', markdown, sourceMode: 'local-transition', source: { adapterId: 'local' } },
    { id: 'source-a', title: 'Source A', path: '.topics/source.trace.md', markdown, sourceMode: 'source-backed', source: { id: 'github:docs', adapterId: 'github', sourceKind: 'github.repo', repo: 'Tiinex/docs', ref: 'main', materializedCommit: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', sourceBacked: true }, sourceTarget: { surface: 'repoFiles', targetKind: 'github-repo-file', sourceArtifactPath: '.topics/source.trace.md', materializedCommit: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' } }
  ],
  assets: [
    { id: 'bin', path: 'assets/raw.bin', type: 'application/octet-stream', bytes: new Uint8Array([0, 1, 127, 128, 255]), source: { adapterId: 'local' } },
    { id: 'remote', path: 'assets/remote.bin', type: 'application/octet-stream', content: 'DO-NOT-OWN', source: { id: 'github:docs', adapterId: 'github', repo: 'Tiinex/docs', ref: 'main', materializedCommit: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', sourceBacked: true }, sourceTarget: { surface: 'repoFiles', targetKind: 'github-repo-file', sourceArtifactPath: 'assets/remote.bin', materializedCommit: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' } }
  ],
  sources: [{ id: 'local', adapterId: 'local' }, { id: 'github:docs', label: 'Docs', adapterId: 'github', sourceKind: 'github.repo', repo: 'Tiinex/docs', ref: 'main', requestedRef: 'main', materializedCommit: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', rootPath: '.topics' }],
  sourceOrder: ['local', 'github:docs']
};

const bundle = buildExportPackageBundle(packageWorkspace, { clock: () => '2026-08-19T12:10:00.000Z' });
const zip = exportPackageZipUint8Array(bundle);
const file = zipFile('handoff.zip', zip);
const handoff = await tryReadOperationalHandoffPackage([file]);
assert.equal(handoff.detected, true);
assert.equal(handoff.ok, true);
assert.equal(handoff.rehydrated.inspection.status, 'valid');
assert.equal(handoff.importPlan.records.length, 1);
assert.equal(handoff.importPlan.assets.length, 1);
assert.equal(handoff.importPlan.sourceReferences.length, 2);
assert.deepEqual([...handoff.importPlan.assets[0].bytes], [0, 1, 127, 128, 255]);

let state = lifecycle.makeEmptyAppState();
state = lifecycle.createWorkspace(state, { id: 'w-package', name: 'Existing live workspace' }, { clock: () => '2026-08-19T12:11:00.000Z' }).state;
const applied = applyOperationalHandoffPackageToWorkspace({ lifecycle, state, handoff, options: { clock: () => '2026-08-19T12:12:00.000Z' } });
assert.equal(applied.ok, true);
assert.notEqual(applied.workspace.id, 'w-package', 'import must not overwrite an existing workspace with the same package context id');
assert.equal(applied.workspace.records.length, 1);
assert.equal(applied.workspace.records[0].source.adapterId, 'local');
assert.equal(applied.workspace.assets.length, 1);
assert.deepEqual(applied.workspace.assets[0].bytes, [0, 1, 127, 128, 255], 'Site lifecycle stores package bytes in JSON-safe exact byte-array form');
assert.equal(applied.workspace.sources.some((source) => source.id === 'github:docs' && source.materializedCommit === 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'), true);
assert.equal(applied.workspace.workspaceImport.packageSourceReferences.length, 2);
assert.equal(applied.workspace.workspaceImport.packageSourceReferences.some((reference) => reference.target?.repo === 'Tiinex/docs'), true);
assert.equal(applied.workspace.records.some((record) => record.source?.adapterId === 'github'), false, 'source references must not become local/source-backed leaves');
assert.equal((state.workspaces || []).find((workspace) => workspace.id === 'w-package')?.title, 'Existing live workspace', 'input state remains untouched');

const localDelta = persistence.createLocalDeltaState(applied.state);
const persisted = localDelta.workspaces.find((workspace) => workspace.id === applied.workspace.id);
assert.equal(persisted.records.length, 1, 'package-owned local record must enter durable local delta');
assert.equal(persisted.assets.length, 1, 'package-owned local asset must enter durable local delta');
assert.equal(persisted.workspaceImport.packageSourceReferences.length, 2, 'reference-only package descriptors must survive local persistence');

const sessionCache = persistence.createSessionCacheState(applied.state);
const cachedWorkspace = sessionCache.workspaces.find((workspace) => workspace.id === applied.workspace.id);
assert.equal(cachedWorkspace.sources.some((source) => source.id === 'github:docs' && source.materializedCommit === 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'), true, 'session cache keeps exact source descriptor context');
assert.equal(cachedWorkspace.workspaceImport.packageSourceReferences.length, 2, 'session cache keeps package source-reference descriptors');
const routeShell = {
  version: 1, activeWorkspaceId: applied.workspace.id,
  workspaces: [{
    id: applied.workspace.id, title: applied.workspace.title, name: applied.workspace.name,
    sources: (applied.workspace.sources || []).map((source) => ({ id: source.id, adapterId: source.adapterId, repo: source.repo, ref: source.ref, materializedCommit: source.materializedCommit })),
    sourceOrder: applied.workspace.sourceOrder || [], records: [], assets: [], workspaceImport: { path: applied.workspace.workspaceImport?.path || '', sourceMode: applied.workspace.workspaceImport?.sourceMode || '' }
  }]
};
const reopened = persistence.hydrateHashStateFromSessionCache(routeShell, sessionCache, localDelta);
const reopenedWorkspace = reopened.workspaces.find((workspace) => workspace.id === applied.workspace.id);
assert.equal(reopenedWorkspace.records.length, 1, 'reopen restores package-owned local record from durable local delta');
assert.equal(reopenedWorkspace.assets.length, 1, 'reopen restores package-owned local asset from durable local delta');
assert.deepEqual(reopenedWorkspace.assets[0].bytes, [0, 1, 127, 128, 255], 'reopen preserves exact package-owned binary bytes in reusable byte-array form');
assert.equal(reopenedWorkspace.workspaceImport.packageSourceReferences.length, 2, 'reopen preserves source-reference descriptors without creating leaves');
assert.equal(reopenedWorkspace.sources.some((source) => source.id === 'github:docs' && source.materializedCommit === 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'), true, 'reopen preserves exact source registration context');

const commandState = lifecycle.makeEmptyAppState();
const command = await runLocalMaterialImportCommand({ lifecycle, state: commandState, fileList: [file], options: { clock: () => '2026-08-19T12:13:00.000Z' } });
assert.equal(command.ok, true);
assert.equal(command.handoffPackage.ok, true);
assert.match(command.notice, /Imported Handoff package/);

const invalidFiles = bundle.files.filter((entry) => entry.path !== 'tiinex.package/contract.json');
const invalidZip = exportFileMapZipUint8Array(invalidFiles);
const invalid = await tryReadOperationalHandoffPackage([zipFile('claimed-handoff.zip', invalidZip)]);
assert.equal(invalid.detected, true);
assert.equal(invalid.ok, false);
assert.equal(invalid.error, 'handoff-package.invalid');
const invalidCommand = await runLocalMaterialImportCommand({ lifecycle, state: lifecycle.makeEmptyAppState(), fileList: [zipFile('claimed-handoff.zip', invalidZip)], options: {} });
assert.equal(invalidCommand.ok, false);
assert.equal(invalidCommand.error, 'handoff-package.invalid', 'invalid claimed package must fail closed rather than fall through to generic archive leaves');

const treeBundle = buildWorkspaceTreeExportBundle(packageWorkspace, { clock: () => '2026-08-19T12:14:00.000Z' });
const treeZip = exportTreeZipUint8Array(treeBundle);
const ordinary = await tryReadOperationalHandoffPackage([zipFile('tree.zip', treeZip)]);
assert.equal(ordinary.detected, false, 'ordinary Tree ZIP must remain ordinary archive intake');

console.log('handoffPackageImportCommand: ok');

function zipFile(name, bytes) {
  return { name, size: bytes.byteLength, type: 'application/zip', async arrayBuffer() { return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength); } };
}
