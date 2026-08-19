(function attachWorkspacePersistenceRecovery(global) {
  'use strict';
  const LOCAL_RECOVERY_INDEX_KEY = 'tiinex.site.localRecoveryIndex.v1';
  const LOCAL_RECOVERY_INDEX_SCHEMA_ID = 'tiinex.workspace.localRecoveryIndex.v1';

  function createLocalRecoveryIndex(state = {}, localDeltaState = null) {
    const localState = localDeltaState || { activeWorkspaceId: state.activeWorkspaceId || '', workspaces: [] };
    const fullById = new Map((Array.isArray(state.workspaces) ? state.workspaces : []).map((workspace) => [workspace.id, workspace]));
    const workspaces = (Array.isArray(localState.workspaces) ? localState.workspaces : []).map((delta) => {
      const full = fullById.get(delta.id) || {};
      const hasConfiguredSource = (Array.isArray(full.sources) ? full.sources : []).some((source) => source && source.id !== 'local' && source.adapterId !== 'local' && source.kind !== 'local-session');
      return { id: delta.id || '', title: delta.title || delta.name || full.title || full.name || 'Local workspace', name: delta.name || delta.title || full.name || full.title || 'Local workspace', localOnly: !hasConfiguredSource, hadConfiguredSource: hasConfiguredSource, recordCount: Array.isArray(delta.records) ? delta.records.length : 0, assetCount: Array.isArray(delta.assets) ? delta.assets.length : 0, updatedAt: new Date().toISOString() };
    }).filter((workspace) => workspace.id);
    return { schema: LOCAL_RECOVERY_INDEX_SCHEMA_ID, currentWorkspaceId: localState.activeWorkspaceId || state.activeWorkspaceId || workspaces[0]?.id || '', writtenAt: new Date().toISOString(), workspaces };
  }

  function readLocalRecoveryIndex(storage) {
    try {
      const value = storage?.getItem?.(LOCAL_RECOVERY_INDEX_KEY);
      const parsed = value ? JSON.parse(value) : null;
      return parsed && parsed.schema === LOCAL_RECOVERY_INDEX_SCHEMA_ID ? parsed : null;
    } catch (_) { return null; }
  }

  function recoverableStateFromLocalDeltas(localState = {}, index = null) {
    const metaById = new Map((Array.isArray(index?.workspaces) ? index.workspaces : []).map((workspace) => [workspace.id, workspace]));
    const workspaces = (Array.isArray(localState.workspaces) ? localState.workspaces : []).map((delta) => {
      const meta = metaById.get(delta.id) || {};
      const localSource = { id: 'local', kind: 'local', adapterId: 'local', sourceKind: 'local.session', label: 'Local', boundary: 'recovered browser-local material; no source provenance inferred' };
      return Object.assign({}, delta, {
        id: delta.id,
        name: delta.name || delta.title || meta.name || meta.title || 'Recovered local workspace',
        title: delta.title || delta.name || meta.title || meta.name || 'Recovered local workspace',
        kind: 'workspace',
        source: { id: 'local-session', kind: 'local-session', adapterId: 'local', sourceKind: 'local.session', label: 'Local session' },
        sources: [localSource], sourceOrder: ['local'], discoveryProgress: null,
        workspaceRecovery: { schema: LOCAL_RECOVERY_INDEX_SCHEMA_ID, recoveredFromCleanStart: true, hadConfiguredSource: Boolean(meta.hadConfiguredSource), boundary: 'durable local deltas recovered without route/hash; source material must be reloaded explicitly' }
      });
    });
    if (!workspaces.length) return null;
    const current = index?.currentWorkspaceId || localState.activeWorkspaceId || '';
    const activeWorkspaceId = workspaces.some((workspace) => workspace.id === current) ? current : workspaces[0].id;
    return normalizeLegacyWorkspaceCandidateState({ version: localState.version || 1, activeWorkspaceId, view: defaultRecoveredView(), audit: null, workspaces });
  }


  function augmentStartupStateWithLocalRecovery(state = {}, localState = null, index = null, options = {}) {
    const canonical = normalizeLegacyWorkspaceCandidateState(state);
    if (!localState?.workspaces?.length) return canonical;
    const canonicalLocalState = normalizeLegacyWorkspaceCandidateState(localState);
    const localById = new Map((canonicalLocalState.workspaces || []).map((workspace) => [workspace.id, workspace]));
    const workspaces = (canonical.workspaces || []).map((workspace) => mergeWorkspaceLocalDeltaForStartup(workspace, localById.get(workspace.id)));
    const known = new Set(workspaces.map((workspace) => workspace.id));
    const recovered = recoverableStateFromLocalDeltas(localState, index);
    const unmatched = (recovered?.workspaces || []).filter((workspace) => !known.has(workspace.id));
    const combined = [...workspaces, ...unmatched];
    const savedFocusId = String(index?.currentWorkspaceId || localState?.activeWorkspaceId || '').trim();
    const restoreFocus = options.restoreFocus !== false && savedFocusId && combined.some((workspace) => workspace.id === savedFocusId);
    return Object.assign({}, canonical, { workspaces: combined, activeWorkspaceId: restoreFocus ? savedFocusId : (canonical.activeWorkspaceId || combined[0]?.id || '') });
  }

  function mergeWorkspaceLocalDeltaForStartup(workspace = {}, local = null) {
    if (!local) return workspace;
    const isLocal = (item = {}) => item?.source?.adapterId === 'local' || item?.source?.kind === 'local-session' || String(item?.sourceMode || '').startsWith('local-');
    const merge = (primary = [], secondary = []) => {
      const out = primary.slice(); const keys = new Set(out.map((item) => `${item?.id || ''}::${item?.path || ''}`));
      for (const item of secondary) { const key = `${item?.id || ''}::${item?.path || ''}`; if (!keys.has(key)) { out.push(item); keys.add(key); } }
      return out;
    };
    return Object.assign({}, workspace, {
      records: merge((workspace.records || []).filter((record) => !isLocal(record)), local.records || []),
      assets: merge((workspace.assets || []).filter((asset) => !isLocal(asset)), local.assets || []),
      workspaceMarkdown: local.workspaceMarkdown || workspace.workspaceMarkdown || '',
      workspaceImport: Object.assign({}, workspace.workspaceImport || {}, local.workspaceImport || {}),
      importLog: Array.isArray(local.importLog) ? local.importLog : (workspace.importLog || []),
      publicationReceipts: Array.isArray(local.publicationReceipts) ? local.publicationReceipts : (workspace.publicationReceipts || [])
    });
  }

  function surfaceLocalPersistenceFailure(receipt = {}, target = global) {
    target.TiinexLocalStatePersistenceFailure = receipt;
    if (typeof target.dispatchEvent !== 'function' || typeof target.CustomEvent !== 'function') return receipt;
    try { target.dispatchEvent(new target.CustomEvent('tiinex:local-persistence-failure', { detail: receipt })); } catch (_) {}
    return receipt;
  }

  function normalizeLegacyWorkspaceCandidateState(state = {}) {
    if (!state || typeof state !== 'object' || !Array.isArray(state.workspaces)) return state;
    const next = JSON.parse(JSON.stringify(state));
    next.workspaces = next.workspaces.map(normalizeLegacyWorkspaceCandidatesInWorkspace);
    next.view = normalizeLegacyWorkspaceView(next.view || {});
    if (next.workspaceViews && typeof next.workspaceViews === 'object') {
      next.workspaceViews = Object.fromEntries(Object.entries(next.workspaceViews).map(([id, view]) => [id, normalizeLegacyWorkspaceView(view || {})]));
    }
    return next;
  }

  function normalizeLegacyWorkspaceView(view = {}) {
    const next = Object.assign({}, view || {});
    const displayOptions = Object.assign({}, next.displayOptions || {});
    if (displayOptions.showWorkspaceArtifacts == null && displayOptions.showWorkspaceCandidates != null) displayOptions.showWorkspaceArtifacts = displayOptions.showWorkspaceCandidates !== false;
    delete displayOptions.showWorkspaceCandidates;
    if (displayOptions.artifactFilter === 'workspace-candidate') displayOptions.artifactFilter = 'workspace-artifact';
    next.displayOptions = displayOptions;
    return next;
  }

  function normalizeLegacyWorkspaceCandidatesInWorkspace(workspace = {}) {
    const candidates = Array.isArray(workspace.workspaceMergeCandidates) ? workspace.workspaceMergeCandidates : [];
    if (!candidates.length) { const clean = Object.assign({}, workspace); delete clean.workspaceMergeCandidates; return clean; }
    const records = Array.isArray(workspace.records) ? workspace.records.slice() : [];
    for (const candidate of candidates) {
      const path = canonicalCandidatePath(candidate.path || candidate.sourcePath || '');
      const recordIndex = records.findIndex((record) => (candidate.sourceRecordId && record.id === candidate.sourceRecordId) || (path && canonicalCandidatePath(record.path || record.sourceTarget?.sourceArtifactPath || '') === path));
      const role = { schema: 'tiinex.workspace.artifact.role.v1', openEligible: true, mergeEligible: true, migratedFromLegacyCandidate: true, legacyCandidateId: candidate.id || '' };
      if (recordIndex >= 0) records[recordIndex] = Object.assign({}, records[recordIndex], { workspaceArtifactRole: Object.assign({}, records[recordIndex].workspaceArtifactRole || {}, role) });
      else records.push(candidateAsCanonicalRecord(candidate, role));
      migrateDivergentLegacySnapshot(records, candidate, role);
    }
    const canonical = Object.assign({}, workspace, { records, workspaceCandidateMigration: { schema: 'tiinex.workspace.candidate-migration.v1', migrated: candidates.length, runtimeModel: 'canonical-artifact-records' } });
    delete canonical.workspaceMergeCandidates;
    return canonical;
  }

  function migrateDivergentLegacySnapshot(records, candidate, role) {
    const snapshot = candidate?.materialReconciliation?.localCandidateSnapshot;
    if (!snapshot || typeof snapshot !== 'object' || sameCandidatePayload(snapshot, candidate)) return;
    const localRecord = candidateAsCanonicalRecord(snapshot, Object.assign({}, role, { migratedLegacyLocalSnapshot: true }));
    localRecord.source = Object.assign({ id: 'local', kind: 'local-session', adapterId: 'local', sourceKind: 'local.session', label: 'Local' }, snapshot.source?.adapterId === 'local' ? snapshot.source : {});
    localRecord.sourceMode = snapshot.sourceMode || 'local-workspace-file';
    localRecord.materialReconciliation = { schema: 'tiinex.workspace.material.reconciliation.v1', status: 'legacy-candidate-local-snapshot-migrated-explicit', message: 'Legacy hidden candidate snapshot was migrated into explicit local workspace material.' };
    if (!records.some((record) => record.id === localRecord.id && String(record.markdown || '') === String(localRecord.markdown || ''))) records.push(localRecord);
  }

  function candidateAsCanonicalRecord(candidate = {}, role = {}) {
    const path = canonicalCandidatePath(candidate.path || candidate.sourcePath || 'workspace.workspace.md') || 'workspace.workspace.md';
    return Object.assign({}, candidate, { id: candidate.sourceRecordId || candidate.id || `workspace:${path}`, path, title: candidate.title || candidate.name || path.split('/').pop() || 'Workspace', kind: candidate.kind && candidate.kind !== 'workspace-candidate' ? candidate.kind : 'tiinex.workspace.v1', schemaId: candidate.schemaId || candidate.rootFallback?.currentSchemaId || 'tiinex.workspace.v1', sourceMode: candidate.sourceMode || (candidate.source?.adapterId === 'local' ? 'local-workspace-file' : 'source-backed'), workspaceArtifactRole: Object.assign({}, candidate.workspaceArtifactRole || {}, role) });
  }

  function defaultRecoveredView() {
    return { universe: 'column', workspaceVerse: 'feed', reader: 'scan', query: '', displayOptions: { leavesFirst: false, leavesOnly: true, mismatchesOnly: false, showSupportingMarkdown: false, showWorkspaceArtifacts: true, showAssets: false, schemaFilter: 'all', artifactFilter: 'all', sourceFilter: 'all' }, expandedTreeFolders: [] };
  }
  function sameCandidatePayload(a = {}, b = {}) { return canonicalCandidatePath(a.path || '') === canonicalCandidatePath(b.path || '') && String(a.markdown || '') === String(b.markdown || ''); }
  function canonicalCandidatePath(value = '') { const out = []; for (const part of String(value || '').replace(/\\/g, '/').split('/')) { if (!part || part === '.') continue; if (part === '..') out.pop(); else out.push(part); } return out.join('/'); }

  global.TiinexWorkspacePersistenceRecovery = { LOCAL_RECOVERY_INDEX_KEY, LOCAL_RECOVERY_INDEX_SCHEMA_ID, createLocalRecoveryIndex, readLocalRecoveryIndex, recoverableStateFromLocalDeltas, augmentStartupStateWithLocalRecovery, surfaceLocalPersistenceFailure, normalizeLegacyWorkspaceCandidateState };
})(typeof window !== 'undefined' ? window : globalThis);
