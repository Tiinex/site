import { isOriginReferenceSource } from '../sources/origin.references.js';
import { countReconciledLocalSnapshots, stripLocalSnapshotFromReconciledRecord } from './workspace.materialReconciliation.js';
const LOCAL_SESSION_KIND = 'local-session';
const LOCAL_SOURCE_ID = 'local';

export function isLocalSessionSource(source = {}) {
  const id = String(source?.id || '').trim();
  const kind = String(source?.kind || '').trim();
  const adapter = String(source?.adapterId || '').trim();
  const sourceKind = String(source?.sourceKind || '').trim();
  return id === LOCAL_SOURCE_ID || kind === LOCAL_SESSION_KIND || kind === 'local' || adapter === 'local' || sourceKind === 'local.session';
}

export function isLocalSessionMaterial(item = {}) {
  const source = item?.source || {};
  const mode = String(item?.sourceMode || '').trim().toLowerCase();
  return isLocalSessionSource(source) || mode.startsWith('local') || mode === 'archive-local' || mode === 'zip' || mode === 'manual-file' || mode === 'manual-folder' || mode.startsWith('package-import');
}

export function countLocalRecords(workspace = {}) {
  return (Array.isArray(workspace.records) ? workspace.records : []).filter((record) => isLocalSessionMaterial(record)).length;
}

export function summarizeLocalSourceMaterial(workspace = {}) {
  const workspaceRecords = Array.isArray(workspace.records) ? workspace.records : [];
  const directRecords = workspaceRecords.filter((record) => isLocalSessionMaterial(record)).length;
  const reconciledLocalRecords = countReconciledLocalSnapshots(workspaceRecords);
  const records = directRecords + reconciledLocalRecords;
  const assets = (Array.isArray(workspace.assets) ? workspace.assets : []).filter((asset) => isLocalSessionMaterial(asset)).length;
  const total = records + assets;
  return Object.freeze({ records, directRecords, reconciledLocalRecords, assets, total });
}

export function countLocalSourceItems(workspace = {}) {
  return summarizeLocalSourceMaterial(workspace).total;
}

export function makeLocalSource(input = {}) {
  const counts = input.counts && typeof input.counts === 'object'
    ? Object.assign({ records: 0, assets: 0, total: 0 }, input.counts)
    : null;
  const count = Number(input.count ?? counts?.total ?? 0);
  const materialCounts = counts || Object.freeze({ records: count, assets: 0, total: count });
  return {
    id: LOCAL_SOURCE_ID,
    kind: 'local',
    adapterId: 'local',
    sourceKind: 'local.session',
    label: 'Local',
    count,
    materialCounts,
    config: { persistence: 'browser-local' },
    boundary: 'browser-local session material: local drafts, archive imports, assets, and workspace artifacts; no source provenance is inferred',
    closeLabel: 'Clear local/session material',
    closeAction: 'clear-local-session',
    closeable: input.closeable === true || count > 0
  };
}

export function makeLocalSourceForWorkspace(workspace = {}) {
  const counts = summarizeLocalSourceMaterial(workspace);
  return makeLocalSource({ count: counts.total, counts });
}

export function clearLocalSessionMaterial(workspace = {}) {
  const beforeRecords = Array.isArray(workspace.records) ? workspace.records : [];
  const beforeAssets = Array.isArray(workspace.assets) ? workspace.assets : [];
  let strippedReconciledLocalRecords = 0;
  workspace.records = beforeRecords.flatMap((record) => {
    if (isLocalSessionMaterial(record)) return [];
    const stripped = stripLocalSnapshotFromReconciledRecord(record);
    if (stripped.stripped) strippedReconciledLocalRecords += 1;
    return [stripped.record];
  });
  workspace.assets = beforeAssets.filter((asset) => !isLocalSessionMaterial(asset));
  return {
    records: (beforeRecords.length - workspace.records.length) + strippedReconciledLocalRecords,
    reconciledLocalRecords: strippedReconciledLocalRecords,
    assets: beforeAssets.length - workspace.assets.length
  };
}

export function clearLocalSourceBoundary(workspace = {}, nextState = {}) {
  const counts = clearLocalSessionMaterial(workspace);
  workspace.sources = [makeLocalSourceForWorkspace(workspace)].concat((Array.isArray(workspace.sources) ? workspace.sources : []).filter((source) => source.id !== LOCAL_SOURCE_ID && !isOriginReferenceSource(source)));
  workspace.sourceOrder = workspace.sources.map((source) => source.id);
  if (workspace.discoveryProgress?.sourceId === LOCAL_SOURCE_ID) workspace.discoveryProgress = null;
  const selected = String(nextState.view?.selectedRecordId || '').trim();
  if (selected && !workspace.records.some((record) => String(record?.id || '') === selected)) nextState.view = Object.assign(nextState.view || {}, { selectedRecordId: '', lineageAuditReport: null, lineageLoadReport: null });
  return counts;
}
