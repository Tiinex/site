const SOURCE_STATES = new Set(['not-started', 'deferred', 'loading', 'loaded', 'partial', 'failed', 'unavailable']);

export function stateWithSourceMaterialCleared(state = {}, workspaceId = '', sourceId = '', options = {}) {
  const next = cloneState(state);
  const workspace = (next.workspaces || []).find((item) => item.id === (workspaceId || next.activeWorkspaceId));
  const cleanId = String(sourceId || '').trim();
  if (!workspace || !cleanId || cleanId === 'local') return { ok: false, error: workspace ? 'source.material.clear.refused' : 'workspace.not.found', state };
  const source = (Array.isArray(workspace.sources) ? workspace.sources : []).find((item) => item.id === cleanId);
  if (!source || source.kind !== 'github-tree') return { ok: false, error: 'source.not.configured', state };
  const counts = clearSourceMaterialFromWorkspace(workspace, cleanId, { surfaces: options.surfaces });
  const remainingCount = countSourceRecords(workspace, cleanId);
  workspace.sources = upsertSource(workspace.sources, Object.assign({}, source, { count: remainingCount, discoveryState: normalizeSourceDiscoveryState(options.discoveryState || 'deferred') }));
  workspace.sourceOrder = workspace.sources.map((item) => item.id);
  const selected = String(next.view?.selectedRecordId || '').trim();
  if (selected && !workspaceHasRecord(workspace, selected)) next.view = Object.assign(next.view || {}, { selectedRecordId: '', lineageLoadReport: null, lineageAuditReport: null });
  next.activeWorkspaceId = workspace.id;
  return { ok: true, counts, workspace, state: next };
}

export function clearSourceMaterialFromWorkspace(workspace = {}, sourceId = '', options = {}) {
  const cleanId = String(sourceId || '').trim();
  const counts = { records: 0, assets: 0, workspaceMergeCandidates: 0 };
  if (!workspace || !cleanId) return counts;
  const surfaceSet = new Set((Array.isArray(options.surfaces) ? options.surfaces : []).map((item) => String(item || '').trim()).filter(Boolean));
  const keep = (item) => {
    if (String(item?.source?.id || '') !== cleanId) return true;
    if (!surfaceSet.size) return false;
    return !surfaceSet.has(String(item?.sourceTarget?.surface || '').trim());
  };
  for (const key of ['records', 'assets', 'workspaceMergeCandidates']) {
    const before = Array.isArray(workspace[key]) ? workspace[key] : [];
    const after = before.filter(keep);
    counts[key] = before.length - after.length;
    workspace[key] = after;
  }
  if (workspace.discoveryProgress?.sourceId === cleanId) workspace.discoveryProgress = null;
  return counts;
}

function countSourceRecords(workspace = {}, sourceId = '') {
  const cleanId = String(sourceId || '').trim();
  return Array.isArray(workspace.records) ? workspace.records.filter((record) => String(record?.source?.id || '') === cleanId).length : 0;
}

export function workspaceHasRecord(workspace = {}, recordId = '') {
  const id = String(recordId || '').trim();
  return Boolean(id && Array.isArray(workspace.records) && workspace.records.some((record) => String(record?.id || '') === id));
}

function upsertSource(sources = [], source = {}) {
  const hasLocal = sources.some((item) => item.id === 'local');
  const local = hasLocal ? [] : [{ id: 'local', kind: 'local', adapterId: 'local', sourceKind: 'local.session', label: 'Local', count: 0, closeable: false }];
  return local.concat(sources.filter((item) => item.id !== source.id), [source]);
}

function normalizeSourceDiscoveryState(value = '') {
  const candidate = String(value || '').trim();
  return SOURCE_STATES.has(candidate) ? candidate : 'deferred';
}

function cloneState(state = {}) {
  return JSON.parse(JSON.stringify(Object.assign({ version: 1, activeWorkspaceId: '', view: {}, workspaces: [] }, state || {})));
}
