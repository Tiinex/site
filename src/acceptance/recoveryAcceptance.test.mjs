import assert from 'node:assert/strict';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { runLocalMaterialImportCommand } from '../app/localMaterialCommand.js';
import { applyGithubSourceMaterializationCommand } from '../app/githubSourceMaterializationCommand.js';
import { loadFullLineageCommand } from '../app/lineageCommand.js';
import { buildWorkspaceTreeExportBundle } from '../export/tree.bundle.js';
import { exportTreeZipUint8Array } from '../export/package.zip.js';
import { buildWorkspaceMaterialLedger } from '../workspaces/workspace.materialLedger.js';
import { stateWithSourceMaterialCleared } from '../workspaces/workspace.sourceMaterial.js';
import '../sources/source.identity.js';
import '../workspaces/workspace.lifecycle.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;
const clock = () => '2026-08-09T00:00:00.000Z';

const issuePath = '.topics/.github/tiinusen/socials/.issues/3/000-fs25-markaryd.workspace.md';
const localChildPath = '.topics/.github/tiinusen/socials/.issues/3/004-fler-bondg-rdar.trace.md';

const localBundle = {
  schema: 'tiinex.export.tree.bundle.v1',
  packageEnvelope: false,
  files: [
    { path: '.topics/gaming/root.workspace.md', kind: 'workspace-markdown', content: workspaceMarkdown('Gaming Import Shell') },
    { path: localChildPath, kind: 'artifact-markdown', content: artifactMarkdown('Fler bondgårdar', 'tiinex.discovery.finding.v1', 'Gräns i spelet är nådd.', { integrity: 'fler-bondgardar' }) },
    { path: issuePath, kind: 'workspace-markdown', content: workspaceMarkdown('FS25 Markaryd', { integrity: 'fs25-markaryd' }) },
    { path: 'assets/evidence/local-note.txt', kind: 'asset-content', content: 'local evidence' }
  ]
};

const imported = await runLocalMaterialImportCommand({
  lifecycle,
  state: lifecycle.makeEmptyAppState(),
  fileList: [fileFromZip('tiinex-tree-gaming.zip', exportTreeZipUint8Array(localBundle))],
  options: { clock, sourceMode: 'drop' }
});
assert.equal(imported.ok, true, imported.error);
let state = imported.state;
const importWorkspace = lifecycle.activeWorkspace(state);
assert.equal(importWorkspace.records.length, 2, 'local tree import rehydrates leaf + workspace artifacts on one canonical record spine');
assert.equal(importWorkspace.assets.length, 1, 'local tree import rehydrates assets');
assert.equal(Object.prototype.hasOwnProperty.call(importWorkspace, 'workspaceMergeCandidates'), false, 'new local import does not create the legacy candidate runtime shape');
assert.equal(importWorkspace.records.filter((record) => record.source?.adapterId === 'local').length, 2, 'imported artifacts stay browser-local/session');
assert(importWorkspace.records.some((record) => record.path === issuePath && record.workspaceArtifactRole?.openEligible), 'workspace artifact carries Open/Merge capability as a record role');

const registered = lifecycle.addWorkspaceSource(state, importWorkspace.id, {
  label: 'Tiinusen/socials',
  repository: 'Tiinusen/socials',
  rootPath: '.topics',
  issueDiscovery: true,
  issueUrls: 'https://github.com/Tiinusen/socials/issues/3',
  requestedSurfaces: { issueSnapshots: { requested: true }, repoFiles: { requested: false }, explicitFiles: { requested: false } }
});
assert.equal(registered.ok, true, registered.error);
state = registered.state;
const source = registered.source;
const sourceRecords = [
  sourceRecord('FS25 Markaryd', 'tiinex.workspace.v1', issuePath, workspaceMarkdown('FS25 Markaryd', { integrity: 'fs25-markaryd' })),
  sourceRecord('Lagar och regler', 'tiinex.topic.v1', '.topics/.github/tiinusen/socials/.issues/3/comment-000-lagar-och-regler.trace.md', artifactMarkdown('Lagar och regler', 'tiinex.topic.v1', 'Nu ska vi få ordning på torpet.', { integrity: 'lagar' })),
  sourceRecord('§1 Ångkvistlagen', 'tiinex.decision.v1', '.topics/.github/tiinusen/socials/.issues/3/comment-001-1-ngkvistlagen.trace.md', artifactMarkdown('§1 Ångkvistlagen', 'tiinex.decision.v1', 'Regelutkast för Ångkvistlagen.', { integrity: 'angkvistlagen' })),
  sourceRecord('Klagomuren', 'tiinex.topic.v1', '.topics/.github/tiinusen/socials/.issues/3/comment-002-klagomuren.trace.md', artifactMarkdown('Klagomuren', 'tiinex.topic.v1', 'Klagomuren är parent till fler bondgårdar.', { integrity: 'klagomuren' })),
  sourceRecord('Fler bondgårdar', 'tiinex.discovery.finding.v1', localChildPath, artifactMarkdown('Fler bondgårdar', 'tiinex.discovery.finding.v1', 'Gräns i spelet är nådd.', { trace: 'comment-002-klagomuren.trace.md', integrity: 'fler-bondgardar' }))
];
const materialized = applyGithubSourceMaterializationCommand({
  lifecycle,
  state,
  workspaceId: importWorkspace.id,
  source,
  sourceId: source.id,
  sourceLabel: source.label,
  adapterResult: { okCount: sourceRecords.length, records: sourceRecords, diagnostics: { surfaces: { issueSnapshots: { loaded: sourceRecords.length } } } },
  repository: 'Tiinusen/socials',
  rootPath: '.topics',
  issueDiscovery: true,
  issueUrls: 'https://github.com/Tiinusen/socials/issues/3',
  requestedSurfaces: source.requestedSurfaces,
  selectedTransportSurfaces: ['issueSnapshots'],
  transportLabel: 'proxy',
  transportRefreshTier: 'proxy'
});
assert.equal(materialized.ok, true, materialized.error);
state = materialized.state;
const sourceWorkspace = state.workspaces.find((workspace) => workspace.id === importWorkspace.id);
const sourceAfter = sourceWorkspace.sources.find((item) => item.id === source.id);
assert.equal(sourceAfter.discoveryState, 'loaded', 'materialized source is marked loaded');
assert.equal(sourceAfter.count, 5, 'source count tracks inserted source-backed records');
assert.equal(sourceAfter.surfaces.issueSnapshots.loaded, 5, 'issue surface count survives source command');
assert.equal(sourceWorkspace.records.filter((record) => record.source?.id === source.id).length, 5, 'source command inserts all source issue artifacts');
assert.equal(sourceWorkspace.records.filter((record) => record.source?.adapterId === 'local').length, 0, 'verified equivalent local artifacts are pruned once source becomes canonical');
assert.equal(Object.prototype.hasOwnProperty.call(sourceWorkspace, 'workspaceMergeCandidates'), false, 'workspace artifacts stay canonical records without a legacy candidate runtime shape');
const ledger = buildWorkspaceMaterialLedger(sourceWorkspace, { displayOptions: sourceWorkspace.displayOptions || {} });
assert.equal(ledger.recordsBySource[source.id], 5, 'ledger source count matches inserted issue artifacts');
assert.equal(Number(ledger.groupedRecordsBySource.local || 0), 0, 'exact local duplicates are not hidden as shadow payloads');
assert.equal(ledger.workspaceArtifactsBySource[source.id], 1, 'ledger counts source-backed workspace artifact records');
assert.equal(materialized.materialLedgerReceipt.rawAdapterRecords, 5, 'source receipt keeps raw adapter count');
assert.equal(materialized.materialLedgerReceipt.sourceRecords, 5, 'source receipt keeps inserted source count');
assert.equal(materialized.materialLedgerReceipt.sourceWorkspaceArtifacts, 1, 'source receipt exposes workspace artifact role without candidate duplication');

const cleared = stateWithSourceMaterialCleared(state, importWorkspace.id, source.id, { discoveryState: 'deferred' });
assert.equal(cleared.ok, true, cleared.error);
assert.equal(cleared.workspace.records.some((record) => record.source?.id === source.id), false, 'source refresh clear removes source-backed records');
assert.equal(cleared.workspace.records.filter((record) => record.source?.adapterId === 'local').length, 0, 'source clear does not resurrect deduplicated local copies');
assert.equal(cleared.workspace.assets.length, 1, 'independent local asset remains after source clear');

const exportBundle = buildWorkspaceTreeExportBundle(sourceWorkspace, { clock });
assert.equal(exportBundle.packageEnvelope, false, 'ordinary tree export remains envelope-free');
assert.equal(exportBundle.counts.records, 4, 'tree export counts non-workspace artifact Markdown separately');
assert.equal(exportBundle.counts.workspaceEntries, 2, 'tree export includes current workspace entry and canonical workspace artifact record');
assert(exportBundle.files.some((file) => file.path === issuePath), 'tree export preserves source-canonical workspace entry path');
assert(!exportBundle.files.some((file) => file.path.startsWith('tiinex.package/')), 'ordinary tree export does not include package envelope paths');

const reimported = await runLocalMaterialImportCommand({
  lifecycle,
  state: lifecycle.makeEmptyAppState(),
  fileList: [fileFromZip('roundtrip.zip', exportTreeZipUint8Array(exportBundle))],
  options: { clock, sourceMode: 'acceptance-roundtrip' }
});
assert.equal(reimported.ok, true, reimported.error);
const roundtripWorkspace = lifecycle.activeWorkspace(reimported.state);
assert(roundtripWorkspace.records.length >= 5, 'roundtrip rehydrates exported artifact records');
assert.equal(roundtripWorkspace.records.filter((record) => record.source?.adapterId === 'github').length, 0, 'roundtrip import remains local/session and does not infer GitHub source-backed authority');
assert.equal(Object.prototype.hasOwnProperty.call(roundtripWorkspace, 'workspaceMergeCandidates'), false, 'roundtrip preserves workspace capability on records without legacy candidate runtime shape');
assert(roundtripWorkspace.records.some((record) => record.path === issuePath && record.workspaceArtifactRole?.openEligible), 'roundtrip preserves workspace artifact capability');

const lineageChildMarkdown = `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)\n- Parent\n  - Parent Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)\n  - Trace: [Recovered parent](recovered-parent.trace.md)\n  - Origin: [Recovered parent](https://github.com/Tiinex/docs/blob/abc123/.topics/recovered-parent.trace.md)\n- Current\n  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)\n  - Summary: Local child with explicit source boundary\n\n---\n\n# Local Child With Explicit Origin`;
const lineageChild = Object.assign(createRecordFromMarkdown(lineageChildMarkdown, { path: 'local/child.trace.md', sourceMode: 'archive-local' }), {
  id: 'local:acceptance-origin-child',
  source: { id: 'local', kind: 'local', adapterId: 'local', sourceKind: 'local.session' }
});
const lineageCreated = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { name: 'Acceptance Lineage' }, { clock });
const lineageWorkspace = lifecycle.activeWorkspace(lineageCreated.state);
lineageWorkspace.records = [lineageChild];
lineageWorkspace.sources = [{ id: 'local', kind: 'local', adapterId: 'local', sourceKind: 'local.session', sourceBacked: false }];
const fetched = [];
const lineageLoaded = await loadFullLineageCommand({
  lifecycle,
  state: lineageCreated.state,
  workspace: lineageWorkspace,
  selectedRecordId: lineageChild.id,
  fetchImpl: async (url) => {
    fetched.push(String(url || ''));
    return { ok: true, status: 200, statusText: 'OK', transportTier: 'direct', text: async () => artifactMarkdown('Recovered Parent', 'tiinex.topic.v1', 'Recovered parent', { integrity: 'recovered-parent' }) };
  },
  clock
});
assert.equal(lineageLoaded.ok, true, lineageLoaded.error);
assert.equal(lineageLoaded.recoveredParents, 1, 'explicit origin recovers missing parent without a pre-added discovery source');
assert.equal(lineageLoaded.lineageLoadReport.state, 'complete');
assert(fetched.includes('https://raw.githubusercontent.com/tiinex/docs/abc123/.topics/recovered-parent.trace.md'), 'lineage recovery uses exact GitHub blob ref from Origin');
const lineageAfter = lifecycle.activeWorkspace(lineageLoaded.state);
assert.equal(lineageAfter.records.find((record) => record.id === lineageChild.id).source.id, 'local', 'declaring imported/local child remains local after recovery');
const recoverySource = lineageAfter.sources.find((item) => item.id === 'origin:github:tiinex:docs');
assert(recoverySource && recoverySource.originReferenceSource, 'recovery-only source boundary is registered');
assert.equal(recoverySource.sourceBacked, false, 'recovery-only boundary does not claim imported material is source-backed');

console.log('✓ recovery acceptance scenarios passed');

function fileFromZip(name, zip) {
  return { name, size: zip.byteLength, type: 'application/zip', arrayBuffer: async () => zip.buffer.slice(zip.byteOffset, zip.byteOffset + zip.byteLength) };
}

function sourceRecord(title, schemaId, path, markdown) {
  return {
    title,
    path,
    kind: schemaId,
    schemaId,
    markdown,
    sourceMode: 'github-issue-embedded-artifact',
    sourceTarget: {
      surface: 'issueSnapshots',
      targetKind: 'github-issue-embedded-artifact',
      inputTarget: 'https://github.com/Tiinusen/socials/issues/3',
      sourceArtifactPath: path
    },
    integrity: { entries: [{ towards: 'self', value: integrityFromMarkdown(markdown) }] }
  };
}

function workspaceMarkdown(title, options = {}) {
  const integrity = options.integrity || slug(title);
  return `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)\n- Current\n  - Current Schema: [tiinex.workspace.v1](tiinex.workspace.v1.schema.md)\n  - Created At: 2026-08-09\n  - Summary: ${title} workspace.\n\n---\n\n# ${title}\n\n- Browser Title: ${title}\n\n---\n\n# Continuity Integrity\n\n- sha256-base64url-c14n-v2\n  - Towards: self\n  - Value: ${integrity}\n`;
}

function artifactMarkdown(title, schemaId, summary, options = {}) {
  const parent = options.trace ? `- Parent\n  - Parent Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)\n  - Trace: [Parent](${options.trace})\n` : '';
  const integrity = options.integrity || slug(title);
  return `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)\n${parent}- Current\n  - Current Schema: [${schemaId}](${schemaId}.schema.md)\n  - Created At: 2026-08-09\n  - Summary: ${summary}\n\n---\n\n# ${title}\n\n${summary}\n\n---\n\n# Continuity Integrity\n\n- sha256-base64url-c14n-v2\n  - Towards: self\n  - Value: ${integrity}\n`;
}

function integrityFromMarkdown(markdown = '') {
  return String(markdown).match(/-\s*Value:\s*(.+)$/mi)?.[1]?.trim() || '';
}

function slug(value = '') {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'fixture';
}
