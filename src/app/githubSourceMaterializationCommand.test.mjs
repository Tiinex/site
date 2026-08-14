import assert from 'node:assert/strict';
import '../sources/source.identity.js';
import '../workspaces/workspace.lifecycle.js';
import { materializeGithubSource } from '../adapters/github/github.adapter.js';
import { buildWorkspaceDiscoveryView } from '../workspaces/workspace.discoveryView.js';
import { buildWorkspaceMaterialLedger } from '../workspaces/workspace.materialLedger.js';
import { applyGithubSourceMaterializationCommand, githubMaterializationDiscoveryState } from './githubSourceMaterializationCommand.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;
assert.equal(githubMaterializationDiscoveryState({ okCount: 5 }), 'loaded');
assert.equal(githubMaterializationDiscoveryState({ okCount: 5, failCount: 1 }), 'partial');
assert.equal(githubMaterializationDiscoveryState({ okCount: 0, errors: [{ error: 'x' }] }), 'failed');
assert.equal(githubMaterializationDiscoveryState({ okCount: 0 }), 'unavailable');

const created = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { name: 'Gaming source shell' }, { clock: () => '2026-08-08T00:00:00.000Z' });
assert.equal(created.ok, true);
const sourceRegistered = lifecycle.addWorkspaceSource(created.state, created.workspace.id, {
  label: 'Tiinusen/socials',
  repository: 'Tiinusen/socials',
  rootPath: '.topics',
  issueDiscovery: true,
  issueUrls: 'https://github.com/Tiinusen/socials/issues/3',
  requestedSurfaces: { issueSnapshots: { requested: true }, repoFiles: { requested: false }, explicitFiles: { requested: false } }
});
assert.equal(sourceRegistered.ok, true);
const source = sourceRegistered.source;
const issueUrl = 'https://api.github.com/repos/Tiinusen/socials/issues/3';
const commentsUrl = 'https://api.github.com/repos/Tiinusen/socials/issues/3/comments?per_page=24';
const calls = [];
const adapterResult = await materializeGithubSource(source, {
  issueDiscovery: true,
  issueUrls: 'https://github.com/Tiinusen/socials/issues/3'
}, {
  fetchImpl: async (url) => {
    calls.push(url);
    if (url === issueUrl) return responseJson({
      html_url: 'https://github.com/Tiinusen/socials/issues/3',
      number: 3,
      title: 'FS25 Markaryd',
      state: 'open',
      body: sourcePayload(workspaceArtifact('FS25 Markaryd')),
      user: { login: 'q' },
      comments: 4,
      updated_at: '2026-07-18T22:03:24Z'
    }, { transportTier: 'proxy' });
    if (url === commentsUrl) return responseJson([
      comment(5008615398, tiinexArtifact('Lagar och regler', 'tiinex.topic.v1', 'Nu ska vi få ordning på torpet.')),
      comment(5009000001, tiinexArtifact('§1 Ångkvistlagen', 'tiinex.decision.v1', 'Regelutkast för Ångkvistlagen.')),
      comment(5011116876, tiinexArtifact('Klagomuren', 'tiinex.topic.v1', 'Klagomuren är parent till fler bondgårdar.')),
      comment(5011198457, sourcePayload(tiinexArtifact('Fler bondgårdar', 'tiinex.discovery.finding.v1', 'Gräns i spelet är nådd.', 'comment-003-klagomuren.trace.md'), [
        '- Tiinex Parent Artifact Path: comment-003-klagomuren.trace.md',
        '- Tiinex Parent Source URL: https://github.com/Tiinusen/socials/issues/3#issuecomment-5011116876'
      ]))
    ], { transportTier: 'proxy' });
    return responseJson({ message: `missing ${url}` }, { ok: false, status: 404, statusText: 'Not Found' });
  },
  preferredTransports: ['proxy'],
  transportOrderExact: true
});
assert(calls.includes(issueUrl), 'proxy issue materialization should fetch the issue API URL');
assert(calls.includes(commentsUrl), 'proxy issue materialization should fetch the bounded comments window');
assert.equal(adapterResult.okCount, 5, 'Tiinusen issue fixture should materialize one workspace issue payload plus four comment artifacts');
assert.deepEqual(new Set(adapterResult.records.map((record) => record.title)), new Set(['FS25 Markaryd', 'Lagar och regler', '§1 Ångkvistlagen', 'Klagomuren', 'Fler bondgårdar']));
assert.equal(adapterResult.records.filter((record) => String(record.path || '').endsWith('.workspace.md')).length, 1, 'workspace issue payload remains a source-backed workspace artifact record');

const applied = applyGithubSourceMaterializationCommand({
  lifecycle,
  state: sourceRegistered.state,
  workspaceId: created.workspace.id,
  source,
  sourceId: source.id,
  sourceLabel: source.label,
  adapterResult,
  repository: 'Tiinusen/socials',
  rootPath: '.topics',
  issueDiscovery: true,
  issueUrls: 'https://github.com/Tiinusen/socials/issues/3',
  requestedSurfaces: source.requestedSurfaces,
  selectedTransportSurfaces: ['issueSnapshots'],
  transportLabel: 'proxy',
  transportRefreshTier: 'proxy'
});
assert.equal(applied.ok, true, applied.error);
const workspace = lifecycle.activeWorkspace(applied.state);
assert.equal(workspace.records.filter((record) => record.source?.id === source.id).length, 5, 'source command must insert every raw source-backed issue artifact as a source record');
assert.equal(Object.prototype.hasOwnProperty.call(workspace, 'workspaceMergeCandidates'), false, 'canonical source materialization must not create the legacy candidate runtime shape');
const sourceAfter = workspace.sources.find((item) => item.id === source.id);
assert.equal(sourceAfter.discoveryState, 'loaded', 'source command marks successfully materialized sources loaded');
assert.equal(sourceAfter.count, 5, 'source row count comes from inserted source records, not just visible cards');
assert.equal(sourceAfter.surfaces.issueSnapshots.loaded, 5, 'issue surface loaded count survives source update');
const ledger = buildWorkspaceMaterialLedger(workspace, { displayOptions: workspace.displayOptions || {} });
assert.equal(ledger.counts.rawRecords, 5, 'ledger preserves source raw/inserted records');
assert.equal(ledger.counts.rawWorkspaceArtifacts, 1, 'ledger counts workspace capability on canonical artifact records');
assert.equal('rawWorkspaceCandidates' in ledger.counts, false, 'canonical material ledger exposes no legacy candidate count');
assert.equal(ledger.recordsBySource[source.id], 5, 'ledger records per source match inserted issue records');
assert.equal(ledger.workspaceArtifactsBySource[source.id], 1, 'ledger workspace artifacts per source comes from canonical records');
assert.equal('workspaceCandidatesBySource' in ledger, false, 'canonical material ledger exposes no legacy candidate source map');
assert.equal(applied.materialLedgerReceipt.rawAdapterRecords, 5, 'receipt preserves raw adapter count');
assert.equal(applied.materialLedgerReceipt.sourceRecords, 5, 'receipt preserves inserted source count');
assert.equal(applied.materialLedgerReceipt.sourceWorkspaceArtifacts, 1, 'receipt exposes source-backed workspace artifact count without a candidate model');
assert.equal('sourceWorkspaceCandidates' in applied.materialLedgerReceipt, false, 'canonical material receipt exposes no legacy candidate count');
assert(applied.summary.diagnostics.materialLedgerReceipt, 'import summary carries the material ledger receipt for UI/source receipts');
const discovery = buildWorkspaceDiscoveryView(workspace, { displayOptions: workspace.displayOptions || {} });
assert.equal(discovery.counts.workspaceArtifacts, 1, 'discovery counts the workspace artifact from the canonical record spine');
assert.equal('workspaceCandidates' in discovery, false, 'discovery exposes no parallel candidate collection');
assert(discovery.records.some((record) => String(record.path || '').endsWith('.workspace.md')), 'workspace artifact stays in the canonical record projection');
assert(discovery.counts.visibleRecords <= 5 && discovery.counts.visibleRecords >= 1, 'visible records may be filtered, but raw source records are not lost');

function sourcePayload(markdown, boundaryLines = []) {
  return ['## Tiinex Boundary', '', ...boundaryLines, '', '## Source Markdown', '', '```md', markdown, '```'].join('\n');
}

function comment(id, body) {
  return {
    id,
    html_url: `https://github.com/Tiinusen/socials/issues/3#issuecomment-${id}`,
    user: { login: 'q' },
    created_at: '2026-07-18T11:41:06Z',
    updated_at: '2026-07-18T11:41:06Z',
    body: sourcePayload(body)
  };
}

function workspaceArtifact(title) {
  return `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)\n- Current\n  - Current Schema: [tiinex.workspace.v1](tiinex.workspace.v1.schema.md)\n  - Created At: 2026-07-18\n  - Summary: Gaming workspace entrypoint.\n\n---\n\n# ${title}\n\n- Browser Title: Gaming\n\n---\n\n# Continuity Integrity\n\n- sha256-base64url-c14n-v2\n  - Towards: self\n  - Value: ${slug(title)}`;
}

function tiinexArtifact(title, schema, summary, trace = '') {
  const parent = trace ? `- Parent\n  - Parent Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)\n  - Trace: [Parent](${trace})\n` : '';
  return `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)\n${parent}- Current\n  - Current Schema: [${schema}](${schema}.schema.md)\n  - Created At: 2026-07-18\n  - Summary: ${summary}\n\n---\n\n# ${title}\n\n${summary}\n\n---\n\n# Continuity Integrity\n\n- sha256-base64url-c14n-v2\n  - Towards: self\n  - Value: ${slug(title)}`;
}

function slug(value = '') { return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'fixture'; }

function responseJson(json, options = {}) {
  const body = JSON.stringify(json || {});
  return {
    ok: options.ok !== false,
    status: options.status || (options.ok === false ? 500 : 200),
    statusText: options.statusText || (options.ok === false ? 'Error' : 'OK'),
    transportTier: options.transportTier || '',
    json: async () => JSON.parse(body),
    text: async () => body,
    clone: () => responseJson(json, options)
  };
}

console.log('githubSourceMaterializationCommand: ok');
