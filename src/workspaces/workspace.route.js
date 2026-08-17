(function attachWorkspaceRoute(global) {
  'use strict';

  const HASH_PREFIX = '#state=';
  const STATE_VERSION = 2;
  const ROUTE_ISSUE_MARKDOWN_LIMIT = 120000;

  function makeRouteState(appState) {
    const state = appState && typeof appState === 'object' ? appState : {};
    return {
      v: STATE_VERSION,
      activeWorkspaceId: state.activeWorkspaceId || '',
      view: semanticRouteView(state.view || {}),
      workspaces: Array.isArray(state.workspaces) ? state.workspaces.map(compactWorkspace) : []
    };
  }

  function semanticRouteView(view = {}) {
    const out = Object.assign({ universe: 'column', workspaceVerse: 'feed', reader: 'scan', query: '', displayOptions: { leavesFirst: false, leavesOnly: true, mismatchesOnly: false, showSupportingMarkdown: false, showWorkspaceArtifacts: true, showAssets: false, schemaFilter: 'all', artifactFilter: 'all' } }, view || {});
    delete out.layoutMode;
    delete out.scrollPositions;
    const displayOptions = Object.assign({}, out.displayOptions || {});
    if (displayOptions.showWorkspaceArtifacts == null && displayOptions.showWorkspaceCandidates != null) displayOptions.showWorkspaceArtifacts = displayOptions.showWorkspaceCandidates !== false;
    delete displayOptions.showWorkspaceCandidates;
    if (displayOptions.artifactFilter === 'workspace-candidate') displayOptions.artifactFilter = 'workspace-artifact';
    out.displayOptions = displayOptions;
    return out;
  }

  function semanticRouteState(routeState = {}) {
    const source = routeState && typeof routeState === 'object' && !Array.isArray(routeState) ? routeState : {};
    const out = Object.assign({}, source, { view: semanticRouteView(source.view || {}) });
    delete out.workspaceViews;
    delete out.workspaceWindow;
    return out;
  }

  function compactWorkspace(workspace) {
    return {
      id: workspace.id || '',
      name: workspace.name || workspace.title || 'Workspace',
      title: workspace.title || workspace.name || 'Workspace',
      createdAt: workspace.createdAt || '',
      kind: workspace.kind || 'workspace',
      source: compactSource(workspace.source || {}),
      sources: Array.isArray(workspace.sources) ? workspace.sources.map(compactSource) : [],
      sourceOrder: Array.isArray(workspace.sourceOrder) ? workspace.sourceOrder.slice() : [],
      records: Array.isArray(workspace.records) ? workspace.records.map(compactRecord) : [],
      assets: Array.isArray(workspace.assets) ? workspace.assets.map(compactAsset) : [],
      workspaceMemberBindings: compactWorkspaceMemberBindings(workspace.workspaceMemberBindings),
      importLog: Array.isArray(workspace.importLog) ? workspace.importLog.slice(0, 10).map(compactImportLogEntry) : [],
      mode: workspace.mode || 'feed'
    };
  }

  function compactWorkspaceMemberBindings(value = []) {
    return (Array.isArray(value) ? value : []).map((binding) => {
      const descriptor = binding?.descriptorTarget || {};
      const identity = binding?.memberIdentity || {};
      if (!descriptor.externalTarget || !identity.key) return null;
      return {
        schema: binding.schema || 'tiinex.workspace.memberBinding.v1',
        descriptorTarget: {
          schema: descriptor.schema || 'tiinex.publicTarget.v1',
          adapterId: descriptor.adapterId || '',
          targetKind: 'workspace',
          externalTarget: descriptor.externalTarget || '',
          repository: descriptor.repository || '',
          ref: descriptor.ref || '',
          path: descriptor.path || ''
        },
        memberIdentity: {
          schema: identity.schema || 'tiinex.workspace.memberIdentity.v1',
          kind: identity.kind || 'semantic',
          key: identity.key || '',
          name: identity.name || '',
          label: identity.label || '',
          sourceKind: identity.sourceKind || '',
          sourceSignature: identity.sourceSignature || ''
        }
      };
    }).filter(Boolean);
  }

  function compactSurfaceMap(map = {}) {
    const source = map && typeof map === 'object' ? map : {};
    const out = {};
    for (const [key, value] of Object.entries(source)) {
      if (!value || typeof value !== 'object') continue;
      const next = Object.assign({}, value);
      delete next.transportTier;
      delete next.transportTiers;
      delete next.transportRefreshTier;
      delete next.pendingTier;
      delete next.activeStatus;
      delete next.status;
      out[key] = next;
    }
    return out;
  }

  function compactSource(source = {}) {
    const config = Object.assign({}, source.config || {});
    return {
      id: source.id || '',
      kind: source.kind || '',
      adapterId: source.adapterId || '',
      sourceKind: source.sourceKind || '',
      label: source.label || '',
      repo: source.repo || config.repo || '',
      ref: source.ref || config.ref || '',
      requestedRef: source.requestedRef ?? config.requestedRef ?? '',
      materializedCommit: source.materializedCommit || '',
      rootPath: source.rootPath || config.rootPath || '',
      count: Number(source.count || 0),
      boundary: source.boundary || '',
      discoveryState: source.discoveryState || '',
      repoDiscovery: Boolean(source.repoDiscovery),
      issueDiscovery: Boolean(source.issueDiscovery),
      issueUrls: source.issueUrls || config.issueUrls || '',
      explicitFileRefs: Array.isArray(source.explicitFileRefs || config.explicitFileRefs) ? Array.from(source.explicitFileRefs || config.explicitFileRefs) : [],
      workspaceMatch: source.workspaceMatch || config.workspaceMatch || '',
      appConfigPlan: source.appConfigPlan || config.appConfigPlan || '',
      openBehavior: source.openBehavior || config.openBehavior || '',
      preferredDisplay: source.preferredDisplay || config.preferredDisplay || '',
      requestedSurfaces: compactSurfaceMap(source.requestedSurfaces || {}),
      surfaces: compactSurfaceMap(source.surfaces || {}),
      governanceBoundary: compactGovernanceBoundary(source.governanceBoundary || null),
      closeable: Boolean(source.closeable),
      loadable: source.loadable !== false,
      config
    };
  }


  function compactGovernanceBoundary(boundary = null) {
    if (!boundary || typeof boundary !== 'object') return undefined;
    const copyFile = (file = null) => {
      if (!file || typeof file !== 'object') return null;
      const out = {};
      for (const key of ['status', 'kind', 'path', 'url', 'contentAvailable', 'note']) {
        if (file[key] != null && file[key] !== '') out[key] = file[key];
      }
      return Object.keys(out).length ? out : null;
    };
    const out = {};
    for (const key of ['schema', 'status', 'rootChecked', 'discoveredFrom', 'note', 'boundary']) {
      if (boundary[key] != null && boundary[key] !== '') out[key] = boundary[key];
    }
    if (boundary.scope && typeof boundary.scope === 'object') out.scope = Object.assign({}, boundary.scope);
    const policy = copyFile(boundary.policy || null);
    if (policy) out.policy = policy;
    const notice = copyFile(boundary.notice || null);
    if (notice) out.notice = notice;
    if (boundary.candidates && typeof boundary.candidates === 'object') out.candidates = Object.assign({}, boundary.candidates);
    return Object.keys(out).length ? out : undefined;
  }

  function compactRecordSource(source = {}) {
    const config = source.config && typeof source.config === 'object' ? source.config : {};
    const out = {
      id: source.id || '',
      kind: source.kind || '',
      adapterId: source.adapterId || '',
      sourceKind: source.sourceKind || '',
      label: source.label || '',
      repo: source.repo || config.repo || '',
      ref: source.ref || config.ref || '',
      requestedRef: source.requestedRef ?? config.requestedRef ?? '',
      materializedCommit: source.materializedCommit || '',
      rootPath: source.rootPath || config.rootPath || '',
      boundary: source.boundary || ''
    };
    if (source.url) out.url = source.url;
    return out;
  }

  function compactAsset(asset = {}) {
    const source = compactRecordSource(asset.source || {});
    return {
      id: asset.id || '',
      name: asset.name || asset.path || 'asset',
      path: asset.path || '',
      type: asset.type || asset.mimeType || '',
      size: Number(asset.size || asset.sizeBytes || 0),
      kind: asset.kind || 'asset',
      previewState: 'metadata-only',
      cacheState: 'route-shell-material-unavailable',
      materialAvailability: 'material-unavailable',
      source
    };
  }

  function compactWorkspaceCandidate(candidate = {}) {
    const source = compactRecordSource(candidate.source || {});
    return {
      id: candidate.id || '',
      title: candidate.title || candidate.name || candidate.path || 'Workspace candidate',
      name: candidate.name || candidate.title || '',
      path: candidate.path || '',
      kind: candidate.kind || 'workspace-candidate',
      summary: candidate.summary || '',
      cacheState: 'route-shell-material-unavailable',
      materialAvailability: 'material-unavailable',
      source
    };
  }

  function compactImportLogEntry(entry = {}) {
    return {
      kind: entry.kind || entry.adapterId || 'import',
      at: entry.at || entry.createdAt || '',
      ok: entry.ok !== false,
      message: entry.message || '',
      counts: entry.counts ? Object.assign({}, entry.counts) : undefined
    };
  }

  function compactRecord(record = {}) {
    const source = compactRecordSource(record.source || {});
    const sourceBacked = isSourceBackedShell(record, source);
    const routeMarkdown = routeRecordMarkdown(record);
    const materialUnavailable = !String(routeMarkdown || '').trim();
    const out = {
      id: record.id || '',
      title: record.title || '',
      summary: record.summary || '',
      kind: record.kind || '',
      status: record.status || '',
      currentCreatedAt: record.currentCreatedAt || '',
      createdAt: record.createdAt || '',
      path: record.path || '',
      markdown: routeMarkdown,
      sourceMode: record.sourceMode || (sourceBacked ? 'source-backed' : 'local-route-shell'),
      cacheState: materialUnavailable ? 'route-shell-material-unavailable' : 'route-issue-snapshot-cache-complete',
      materialAvailability: materialUnavailable ? 'material-unavailable' : 'available',
      hasContinuityContext: Boolean(record.hasContinuityContext),
      hasIntegrity: Boolean(record.hasIntegrity),
      schemaId: record.schemaId || '',
      envelopeSchemaId: record.envelopeSchemaId || '',
      parentSchemaId: record.parentSchemaId || '',
      trace: record.trace || '',
      origin: record.origin || '',
      boundary: record.boundary || source.boundary || '',
      source
    };
    const sourceTarget = compactSourceTarget(record.sourceTarget || null);
    if (sourceTarget) out.sourceTarget = sourceTarget;
    const snapshot = compactSnapshot(record.snapshot || null);
    if (snapshot) out.snapshot = snapshot;
    return out;
  }

  function routeRecordMarkdown(record = {}) {
    if (!isIssueSnapshotRecord(record)) return '';
    const markdown = String(record.markdown || '');
    if (!markdown.trim()) return '';
    if (markdown.length > ROUTE_ISSUE_MARKDOWN_LIMIT) return '';
    return markdown;
  }

  function isIssueSnapshotRecord(record = {}) {
    return String(record?.sourceTarget?.surface || '') === 'issueSnapshots'
      || String(record?.snapshot?.schema || '') === 'tiinex.github.issueSnapshot.v1'
      || /(^|\/)\.issues\/github\//.test(String(record.path || ''));
  }

  function compactSourceTarget(sourceTarget = null) {
    if (!sourceTarget || typeof sourceTarget !== 'object') return null;
    const out = {};
    for (const key of ['schema', 'surface', 'targetKind', 'inputTarget', 'sourceArtifactPath', 'materializedCommit', 'parentArtifactPath', 'parentRawUrl', 'parentSourceUrl', 'sourceUpdatedAt', 'sourceSortAt', 'gitCommittedAt', 'committedAt', 'transportTier']) {
      if (sourceTarget[key] != null && sourceTarget[key] !== '') out[key] = sourceTarget[key];
    }
    if (sourceTarget.loaded != null) out.loaded = Boolean(sourceTarget.loaded);
    return Object.keys(out).length ? out : null;
  }

  function compactSnapshot(snapshot = null) {
    if (!snapshot || typeof snapshot !== 'object') return null;
    const out = {};
    for (const key of ['schema', 'embedded', 'sourceKind', 'sourceUrl', 'method', 'sourceArtifactPath', 'parentArtifactPath', 'parentRawUrl', 'parentSourceUrl', 'sourceUpdatedAt', 'sourceSortAt', 'comments', 'state', 'author']) {
      if (snapshot[key] != null && snapshot[key] !== '') out[key] = snapshot[key];
    }
    if (snapshot.target && typeof snapshot.target === 'object') {
      out.target = {};
      for (const key of ['repository', 'kind', 'number', 'canonicalUrl', 'apiUrl', 'input', 'directRawUrl', 'directRawFormat']) {
        if (snapshot.target[key] != null && snapshot.target[key] !== '') out.target[key] = snapshot.target[key];
      }
    }
    return Object.keys(out).length ? out : null;
  }

  function isSourceBackedAsset(asset = {}, source = {}) {
    const adapter = String(source.adapterId || asset.source?.adapterId || '').toLowerCase();
    return adapter === 'github' || source.kind === 'github-tree' || source.sourceKind === 'github.repo';
  }

  function isSourceBackedShell(record = {}, source = {}) {
    const adapter = String(source.adapterId || record.source?.adapterId || '').toLowerCase();
    const mode = String(record.sourceMode || '').toLowerCase();
    return adapter === 'github' || mode === 'source-backed' || Boolean(source.repo || source.config?.repo);
  }

  function validateRouteOwnershipState(routeState) {
    if (!routeState || typeof routeState !== 'object' || Array.isArray(routeState)) return { ok: false, reason: 'route-not-object' };
    const routeVersion = routeState.v == null ? null : Number(routeState.v);
    const legacyVersion = routeState.version == null ? null : Number(routeState.version);
    const canonical = routeVersion === STATE_VERSION;
    const legacy = routeVersion === 1 || (routeVersion == null && legacyVersion === 1);
    if (!canonical && !legacy) return { ok: false, reason: 'route-version-unsupported' };
    if (!Array.isArray(routeState.workspaces)) return { ok: false, reason: 'route-workspaces-missing' };
    if (routeState.view != null && (typeof routeState.view !== 'object' || Array.isArray(routeState.view))) return { ok: false, reason: 'route-view-invalid' };
    for (const workspace of routeState.workspaces) {
      if (!workspace || typeof workspace !== 'object' || Array.isArray(workspace)) return { ok: false, reason: 'route-workspace-invalid' };
      if (!String(workspace.id || '').trim()) return { ok: false, reason: 'route-workspace-id-missing' };
    }
    if (legacy) return { ok: true, reason: routeState.workspaces.length ? 'route-owned-legacy-v1' : 'route-owned-legacy-v1-empty' };
    return { ok: true, reason: routeState.workspaces.length ? 'route-owned-workspaces' : 'route-owned-empty' };
  }

  function routeHasWorkspaces(routeState) {
    return Array.isArray(routeState?.workspaces) && routeState.workspaces.length > 0;
  }

  function normalizeRouteState(routeState, lifecycle) {
    const semanticRoute = semanticRouteState(routeState);
    const empty = lifecycle?.makeEmptyAppState?.() || { version: 1, activeWorkspaceId: '', view: {}, workspaces: [], audit: null };
    if (!routeState || !routeHasWorkspaces(semanticRoute)) return empty;
    const next = lifecycle?.cloneState?.(Object.assign({}, empty, semanticRoute)) || JSON.parse(JSON.stringify(Object.assign({}, empty, semanticRoute)));
    next.view = Object.assign({ universe: 'column', workspaceVerse: 'feed', reader: 'scan', query: '', displayOptions: { leavesFirst: false, leavesOnly: true, mismatchesOnly: false, showSupportingMarkdown: false, showWorkspaceArtifacts: true, showAssets: false, schemaFilter: 'all', artifactFilter: 'all' } }, next.view || {});
    next.workspaces = Array.isArray(next.workspaces) ? next.workspaces.map(normalizeRouteWorkspaceShell) : [];
    next.activeWorkspaceId = next.workspaces.some((workspace) => workspace.id === next.activeWorkspaceId)
      ? next.activeWorkspaceId
      : (next.workspaces[0]?.id || '');
    return next;
  }


  function normalizeRouteWorkspaceShell(workspace = {}) {
    return Object.assign({}, workspace, {
      source: workspace.source ? compactSource(workspace.source) : workspace.source,
      sources: Array.isArray(workspace.sources) ? workspace.sources.map(compactSource) : [],
      records: Array.isArray(workspace.records) ? workspace.records.map(normalizeRouteRecordShell) : [],
      assets: Array.isArray(workspace.assets) ? workspace.assets.map(normalizeRouteAssetShell) : [],
      workspaceMemberBindings: compactWorkspaceMemberBindings(workspace.workspaceMemberBindings),
      ...(Array.isArray(workspace.workspaceMergeCandidates) && workspace.workspaceMergeCandidates.length ? { workspaceMergeCandidates: workspace.workspaceMergeCandidates.map(normalizeRouteWorkspaceCandidateShell) } : {})
    });
  }

  function normalizeRouteAssetShell(asset = {}) {
    const source = compactSource(asset.source || {});
    return Object.assign({}, asset, {
      source,
      content: '',
      dataUrl: '',
      previewState: 'metadata-only',
      cacheState: 'route-shell-material-unavailable',
      materialAvailability: 'material-unavailable',
      routeShell: asset.routeShell !== false,
      materialUnavailable: true
    });
  }

  function normalizeRouteWorkspaceCandidateShell(candidate = {}) {
    const source = compactRecordSource(candidate.source || {});
    return Object.assign({}, candidate, {
      source,
      markdown: '',
      cacheState: 'route-shell-material-unavailable',
      materialAvailability: 'material-unavailable',
      routeShell: candidate.routeShell !== false,
      materialUnavailable: true
    });
  }

  function normalizeRouteRecordShell(record = {}) {
    const source = compactRecordSource(record.source || {});
    const markdown = String(record.markdown || '');
    const materialAvailability = markdown.trim() ? 'available' : 'material-unavailable';
    const inlineCacheState = isIssueSnapshotRecord(record) ? 'route-issue-snapshot-cache-complete' : 'route-inline-material-cache-complete';
    return Object.assign({}, record, {
      source,
      markdown,
      sourceMode: record.sourceMode || (isSourceBackedShell(record, source) ? 'source-backed' : 'local-route-shell'),
      cacheState: materialAvailability === 'available' ? inlineCacheState : 'route-shell-material-unavailable',
      materialAvailability,
      routeShell: record.routeShell !== false,
      materialUnavailable: materialAvailability === 'material-unavailable'
    });
  }

  function routeHistoryState(routeState, explicitIndex, existingState = null, statePatch = null) {
    const index = Number.isFinite(Number(explicitIndex)) ? Number(explicitIndex) : Date.now();
    const out = existingState && typeof existingState === 'object' && !Array.isArray(existingState) ? Object.assign({}, existingState) : {};
    Object.assign(out, routeSummary(routeState), { __tiinexRouteIndex: index });
    if (statePatch && typeof statePatch === 'object') {
      for (const [key, value] of Object.entries(statePatch)) {
        if (value == null) delete out[key];
        else out[key] = value;
      }
    }
    return out;
  }

  function routeSummary(routeState) {
    return {
      v: routeState?.v || STATE_VERSION,
      workspaces: Array.isArray(routeState?.workspaces) ? routeState.workspaces.length : 0,
      activeWorkspaceId: routeState?.activeWorkspaceId || '',
      workspaceVerse: routeState?.view?.workspaceVerse || 'feed',
      query: routeState?.view?.query || ''
    };
  }

  global.TiinexWorkspaceRoute = {
    HASH_PREFIX,
    STATE_VERSION,
    compactRecord,
    compactSource,
    compactWorkspace,
    compactAsset,
    compactWorkspaceCandidate,
    makeRouteState,
    semanticRouteView,
    semanticRouteState,
    normalizeRouteState,
    validateRouteOwnershipState,
    routeHasWorkspaces,
    routeSummary,
    routeHistoryState
  };
})(typeof window !== 'undefined' ? window : globalThis);
