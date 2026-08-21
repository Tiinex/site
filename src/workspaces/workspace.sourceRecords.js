import { reconcileSourceRecordWithWorkspace } from './workspace.materialReconciliation.js';
import { schemaIdForRecord } from '../schemas/schema.identity.js';

export function addWorkspaceSourceRecordsWithReconciliation(state, workspaceId, sourceId, inputs = [], options = {}, runtime = {}) {
  const records = Array.isArray(inputs) ? inputs : [];
  const next = runtime.cloneState(state);
  const targetId = workspaceId || next.activeWorkspaceId;
  const workspace = next.workspaces.find((item) => item.id === targetId);
  if (!workspace) return { ok: false, error: 'workspace.not.found', state };
  const existingSource = Array.isArray(workspace.sources) ? workspace.sources.find((s) => s.id === sourceId) : null;
  if (!existingSource) return { ok: false, error: 'source.not.found', state };
  if (existingSource.kind !== runtime.CONFIGURED_SOURCE_KIND) return { ok: false, error: 'source.not.configured', state };
  const added = [];
  for (const input of records) {
    const title = runtime.normalizeRecordTitle(input.title || input.name);
    if (!title) continue;
    const createdAt = runtime.nowIso(options.clock);
    const canonicalPath = runtime.canonicalizeSourceRecordPath(input, existingSource);
    const deterministicId = `source:${existingSource.id}:${canonicalPath || 'root'}`;
    const record = Object.assign({}, input, {
      id: deterministicId,
      title,
      summary: runtime.normalizeRecordSummary(input.summary || input.body || 'Source-backed material added in Tiinex.'),
      kind: input.kind || 'local.material',
      status: input.status || 'local',
      createdAt: input.createdAt || createdAt.slice(0, 10),
      path: canonicalPath || '',
      markdown: input.markdown || '',
      sourceMode: input.sourceMode || 'source-backed',
      hasContinuityContext: Boolean(input.hasContinuityContext),
      hasIntegrity: Boolean(input.hasIntegrity),
      source: Object.assign({}, existingSource)
    });
    const reconciled = reconcileSourceRecordWithWorkspace(workspace, record, existingSource);
    if (reconciled.action === 'insert') {
      workspace.records = [record].concat(Array.isArray(workspace.records) ? workspace.records : []);
      added.push(record);
    } else {
      const finalRecord = reconciled.record || record;
      added.push(finalRecord);
    }
  }
  if (!added.length) return { ok: false, error: 'records.empty', state };
  const count = workspace.records.filter((r) => r.source && r.source.id === existingSource.id).length;
  const materializedSource = Object.assign({}, existingSource, {
    count,
    discoveryState: runtime.normalizeSourceDiscoveryState(options.discoveryState || 'loaded', 'loaded')
  });
  workspace.sources = runtime.ensureWorkspaceSources(workspace);
  runtime.upsertSource(workspace, materializedSource);
  next.activeWorkspaceId = workspace.id;
  if (!options.preserveView) next.view = Object.assign({ universe: 'column', workspaceVerse: 'feed', reader: 'scan', query: '' }, next.view || {}, { workspaceVerse: 'feed' });
  const finalWorkspace = runtime.activeWorkspace(next);
  return { ok: true, records: added, workspace: finalWorkspace, state: next, receipt: buildSourceRecordInsertReceipt({ sourceId: existingSource.id, inputRecords: records, addedRecords: added, workspace: finalWorkspace }) };
}

function isWorkspaceRecord(record = {}) {
  const schema = schemaIdForRecord(record).toLowerCase();
  const path = String(record.path || record.sourceTarget?.sourceArtifactPath || '').trim().toLowerCase();
  return schema === 'tiinex.workspace.v1' || schema.includes('.workspace.') || /\.workspace\.md$/i.test(path);
}

function buildSourceRecordInsertReceipt({ sourceId = '', inputRecords = [], addedRecords = [], workspace = {} } = {}) {
  const sourceRecords = (Array.isArray(workspace.records) ? workspace.records : []).filter((record) => String(record?.source?.id || '') === String(sourceId || ''));
  const sourceWorkspaceArtifacts = sourceRecords.filter(isWorkspaceRecord).length;
  return Object.freeze({
    schema: 'tiinex.workspace.source-material.receipt.v1',
    sourceId,
    rawAdapterRecords: Array.isArray(inputRecords) ? inputRecords.length : 0,
    returnedRecords: Array.isArray(addedRecords) ? addedRecords.length : 0,
    sourceRecords: sourceRecords.length,
    sourceWorkspaceArtifacts,
    hiddenOrGroupedRecords: Math.max(0, Number(inputRecords.length || 0) - sourceRecords.length)
  });
}
