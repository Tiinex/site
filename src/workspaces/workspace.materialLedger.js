import { buildWorkspaceDiscoveryView } from './workspace.discoveryView.js';
import { isWorkspaceRecord } from '../actions/record.actions.js';

export const WORKSPACE_MATERIAL_LEDGER_SCHEMA = 'tiinex.workspace.material.ledger.v1';

export function buildWorkspaceMaterialLedger(workspace = {}, options = {}) {
  const records = Array.isArray(workspace.records) ? workspace.records : [];
  const assets = Array.isArray(workspace.assets) ? workspace.assets : [];
  const displayOptions = options.displayOptions || workspace.displayOptions || {};
  const query = options.query || '';
  const discovery = buildWorkspaceDiscoveryView(workspace, { records, assets, displayOptions, query, auditById: options.auditById });
  const hiddenReasonsByRecord = discovery.hiddenReasonsByRecordId || new Map();
  const hiddenRecordsByReason = countReasons(hiddenReasonsByRecord);
  const recordsBySource = new Map();
  const visibleRecordsBySource = new Map();
  const hiddenRecordsBySource = new Map();
  const groupedRecordsBySource = new Map();
  const workspaceArtifactsBySource = new Map();
  const visibleWorkspaceArtifactsBySource = new Map();

  for (const record of records) {
    const id = sourceIdForRecord(record);
    recordsBySource.set(id, (recordsBySource.get(id) || 0) + 1);
    const workspaceArtifact = isWorkspaceRecord(record);
    if (workspaceArtifact) workspaceArtifactsBySource.set(id, (workspaceArtifactsBySource.get(id) || 0) + 1);
    const reason = hiddenReasonsByRecord.get(recordKey(record));
    if (reason) {
      hiddenRecordsBySource.set(id, (hiddenRecordsBySource.get(id) || 0) + 1);
      if (reason === 'hidden-local-shadowed-by-source') groupedRecordsBySource.set(id, (groupedRecordsBySource.get(id) || 0) + 1);
    } else {
      visibleRecordsBySource.set(id, (visibleRecordsBySource.get(id) || 0) + 1);
      if (workspaceArtifact) visibleWorkspaceArtifactsBySource.set(id, (visibleWorkspaceArtifactsBySource.get(id) || 0) + 1);
    }
  }

  const hiddenRecords = Math.max(0, records.length - discovery.counts.visibleRecords);
  const groupedRecords = Number(hiddenRecordsByReason['hidden-local-shadowed-by-source'] || 0);
  return Object.freeze({
    schema: WORKSPACE_MATERIAL_LEDGER_SCHEMA,
    workspaceId: workspace.id || '',
    counts: Object.freeze({
      rawRecords: records.length,
      rawAssets: assets.length,
      rawWorkspaceArtifacts: records.filter(isWorkspaceRecord).length,
      visibleRecords: discovery.counts.visibleRecords,
      visibleAssets: discovery.counts.visibleAssets,
      visibleWorkspaceArtifacts: discovery.counts.visibleWorkspaceArtifacts,
      hiddenRecords,
      groupedRecords,
      hiddenByDisplayRecords: Math.max(0, hiddenRecords - groupedRecords),
      hiddenWorkspaceArtifacts: Math.max(0, records.filter(isWorkspaceRecord).length - discovery.counts.visibleWorkspaceArtifacts),
      lineageUsableRecords: records.length
    }),
    hiddenRecordsByReason: Object.freeze(hiddenRecordsByReason),
    recordsBySource: Object.freeze(Object.fromEntries(recordsBySource.entries())),
    visibleRecordsBySource: Object.freeze(Object.fromEntries(visibleRecordsBySource.entries())),
    hiddenRecordsBySource: Object.freeze(Object.fromEntries(hiddenRecordsBySource.entries())),
    groupedRecordsBySource: Object.freeze(Object.fromEntries(groupedRecordsBySource.entries())),
    workspaceArtifactsBySource: Object.freeze(Object.fromEntries(workspaceArtifactsBySource.entries())),
    visibleWorkspaceArtifactsBySource: Object.freeze(Object.fromEntries(visibleWorkspaceArtifactsBySource.entries())),
    discoveryCounts: discovery.counts
  });
}

export function materialLedgerSourceReceipt(workspace = {}, sourceId = '', adapterResult = {}, options = {}) {
  const ledger = buildWorkspaceMaterialLedger(workspace, options);
  const cleanId = String(sourceId || '').trim();
  const sourceRecords = Number(ledger.recordsBySource[cleanId] || 0);
  const visibleSourceRecords = Number(ledger.visibleRecordsBySource[cleanId] || 0);
  const hiddenSourceRecords = Number(ledger.hiddenRecordsBySource[cleanId] || 0);
  const groupedSourceRecords = Number(ledger.groupedRecordsBySource[cleanId] || 0);
  const sourceWorkspaceArtifacts = Number(ledger.workspaceArtifactsBySource[cleanId] || 0);
  const visibleSourceWorkspaceArtifacts = Number(ledger.visibleWorkspaceArtifactsBySource[cleanId] || 0);
  const rawAdapterRecords = Number(adapterResult.rawAdapterRecords ?? adapterResult.records ?? adapterResult.okCount ?? 0);
  return Object.freeze({
    schema: 'tiinex.workspace.source-material.ledger-receipt.v1',
    sourceId: cleanId,
    rawAdapterRecords,
    sourceRecords,
    visibleSourceRecords,
    hiddenSourceRecords,
    groupedSourceRecords,
    sourceWorkspaceArtifacts,
    visibleSourceWorkspaceArtifacts,
    visibleRecords: ledger.counts.visibleRecords,
    hiddenRecords: ledger.counts.hiddenRecords,
    groupedRecords: ledger.counts.groupedRecords,
    hiddenByDisplayRecords: ledger.counts.hiddenByDisplayRecords,
    lineageUsableRecords: ledger.counts.lineageUsableRecords,
    hiddenRecordsByReason: ledger.hiddenRecordsByReason
  });
}

function countReasons(reasonMap) {
  const counts = {};
  if (!reasonMap || typeof reasonMap.forEach !== 'function') return counts;
  reasonMap.forEach((reason) => {
    const key = String(reason || 'hidden').trim() || 'hidden';
    counts[key] = Number(counts[key] || 0) + 1;
  });
  return counts;
}

function sourceIdForRecord(record = {}) {
  return String(record?.source?.id || 'local').trim() || 'local';
}

function recordKey(record = {}) {
  return String(record?.id || record?.path || '').trim();
}
