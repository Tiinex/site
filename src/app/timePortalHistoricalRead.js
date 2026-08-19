import { materializeGithubSource } from '../adapters/github/github.adapter.js';
import { normalizeResolvedSnapshot } from '../workspaces/workspace.timePortal.js';

export function historicalSnapshotReadModelKey(snapshot = {}) {
  const exact = normalizeResolvedSnapshot(snapshot);
  return exact ? `${exact.sourceId}@${exact.materializedCommit}` : '';
}

export function historicalSourceForSnapshot(liveSource = {}, snapshot = {}) {
  const exact = normalizeResolvedSnapshot(snapshot);
  if (!exact) throw new Error('time-portal.snapshot.invalid');
  if (String(liveSource.id || '') !== exact.sourceId) throw new Error('time-portal.snapshot.source-mismatch');
  return Object.assign({}, liveSource, {
    id: `historical:${exact.sourceId}:${exact.materializedCommit}`,
    label: `${liveSource.label || exact.repository} @ ${exact.materializedCommit.slice(0, 10)}`,
    repo: exact.repository,
    ref: exact.materializedCommit,
    requestedRef: exact.requestedRef,
    materializedCommit: exact.materializedCommit,
    rootPath: exact.rootPath || liveSource.rootPath || liveSource.config?.rootPath || '',
    config: Object.assign({}, liveSource.config || {}, {
      repo: exact.repository,
      ref: exact.materializedCommit,
      requestedRef: exact.requestedRef,
      materializedCommit: exact.materializedCommit,
      rootPath: exact.rootPath || liveSource.rootPath || liveSource.config?.rootPath || ''
    }),
    issueDiscovery: false,
    issueUrls: '',
    closeable: false,
    loadable: false,
    boundary: 'read-only historical source snapshot; does not redefine live source authority'
  });
}

export async function loadTimePortalHistoricalReadModel({ workspace, snapshot, fetchImpl, options = {} } = {}) {
  const exact = normalizeResolvedSnapshot(snapshot);
  if (!exact) return failure('time-portal.snapshot.invalid', 'Exact historical snapshot identity is required.');
  const liveSource = (workspace?.sources || []).find((source) => source.id === exact.sourceId) || null;
  if (!liveSource) return failure('time-portal.source.unavailable', 'Configured live source for this historical snapshot is unavailable.', { key: historicalSnapshotReadModelKey(exact), workspaceId: String(workspace?.id || ''), snapshot: exact });
  const liveBefore = JSON.stringify({ sources: workspace.sources || [], records: workspace.records || [], assets: workspace.assets || [] });
  let adapterResult;
  const historicalSource = historicalSourceForSnapshot(liveSource, exact);
  try {
    adapterResult = await materializeGithubSource(historicalSource, {
      repoDiscovery: Boolean(liveSource.repoDiscovery),
      fileRefs: Array.isArray(liveSource.explicitFileRefs || liveSource.config?.explicitFileRefs) ? Array.from(liveSource.explicitFileRefs || liveSource.config?.explicitFileRefs) : [],
      issueDiscovery: false,
      issueUrls: ''
    }, Object.assign({}, options, { fetchImpl }));
  } catch (error) {
    return failure('time-portal.materialization.exception', error?.message || 'Historical snapshot materialization failed.', { key: historicalSnapshotReadModelKey(exact), workspaceId: String(workspace?.id || ''), snapshot: exact, source: historicalSource });
  }
  if (JSON.stringify({ sources: workspace.sources || [], records: workspace.records || [], assets: workspace.assets || [] }) !== liveBefore) {
    throw new Error('time-portal.live-source-mutation-detected');
  }
  const records = (adapterResult.records || []).map((record, index) => historicalRecord(record, historicalSource, exact, index));
  const warnings = Array.isArray(adapterResult.warnings) ? adapterResult.warnings.slice() : [];
  const errors = Array.isArray(adapterResult.errors) ? adapterResult.errors.slice() : [];
  const state = records.length
    ? (errors.length || Number(adapterResult.failCount || 0) ? 'degraded' : 'loaded')
    : (errors.length || Number(adapterResult.failCount || 0) || adapterResult.diagnostics?.discoveryUnavailable ? 'unavailable' : 'empty');
  const cacheState = records.some((record) => String(record?.sourceTarget?.transportTier || '').toLowerCase() === 'cache')
    || (Array.isArray(adapterResult.diagnostics?.transportTiers) && adapterResult.diagnostics.transportTiers.some((tier) => String(tier || '').toLowerCase() === 'cache'))
    ? 'cache'
    : 'not-cache-proven';
  return {
    ok: state !== 'unavailable',
    schema: 'tiinex.site.timePortalHistoricalReadModel.v1',
    key: historicalSnapshotReadModelKey(exact),
    workspaceId: String(workspace?.id || ''),
    snapshot: exact,
    source: historicalSource,
    records,
    assets: [],
    assetReferences: adapterResult.diagnostics?.assetReferences || null,
    state,
    cacheState,
    warnings,
    errors,
    diagnostics: adapterResult.diagnostics || {},
    loadedAt: options.clock ? options.clock() : new Date().toISOString()
  };
}

export function historicalWorkspaceForReadModel(liveWorkspace = {}, readModel = null) {
  if (!readModel || readModel.workspaceId !== String(liveWorkspace.id || '')) return null;
  return Object.assign({}, liveWorkspace, {
    records: Array.isArray(readModel.records) ? readModel.records : [],
    assets: Array.isArray(readModel.assets) ? readModel.assets : [],
    sources: readModel.source ? [readModel.source] : [],
    sourceOrder: readModel.source ? [readModel.source.id] : [],
    discoveryProgress: null,
    importLog: [],
    historicalReview: true,
    historicalSnapshot: readModel.snapshot
  });
}

function historicalRecord(record = {}, source = {}, snapshot = {}, index = 0) {
  const path = String(record.path || record.sourceTarget?.sourceArtifactPath || record.sourceTarget?.inputTarget || `record-${index}`).trim();
  const id = `historical:${snapshot.materializedCommit}:${encodeURIComponent(path)}`;
  return Object.assign({}, record, {
    id,
    sourceMode: 'source-backed-historical',
    source: Object.assign({}, source),
    sourceTarget: Object.assign({}, record.sourceTarget || {}, { materializedCommit: snapshot.materializedCommit }),
    historicalSnapshot: { materializedCommit: snapshot.materializedCommit, liveSourceId: snapshot.sourceId }
  });
}

function failure(code, message, extras = {}) {
  return Object.assign({ ok: false, schema: 'tiinex.site.timePortalHistoricalReadModel.v1', code, message, state: 'unavailable', records: [], assets: [], warnings: [], errors: [] }, extras);
}
