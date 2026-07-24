(function attachWorkspaceRoute(global) {
  'use strict';

  const HASH_PREFIX = '#state=';
  const STATE_VERSION = 2;

  function makeRouteState(appState) {
    const state = appState && typeof appState === 'object' ? appState : {};
    return {
      v: STATE_VERSION,
      activeWorkspaceId: state.activeWorkspaceId || '',
      view: Object.assign({ universe: 'column', workspaceVerse: 'feed', reader: 'scan', query: '', displayOptions: { leavesFirst: false, leavesOnly: true, mismatchesOnly: false, showSupportingMarkdown: false, showWorkspaceCandidates: true, showAssets: false, schemaFilter: 'all', artifactFilter: 'all' } }, state.view || {}),
      workspaces: Array.isArray(state.workspaces) ? state.workspaces.map(compactWorkspace) : []
    };
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
      discoveryProgress: workspace.discoveryProgress ? Object.assign({}, workspace.discoveryProgress) : null,
      records: Array.isArray(workspace.records) ? workspace.records.map(compactRecord) : [],
      assets: Array.isArray(workspace.assets) ? workspace.assets.map(compactAsset) : [],
      workspaceMergeCandidates: Array.isArray(workspace.workspaceMergeCandidates) ? workspace.workspaceMergeCandidates.map(compactWorkspaceCandidate) : [],
      importLog: Array.isArray(workspace.importLog) ? workspace.importLog.slice(0, 10).map(compactImportLogEntry) : [],
      mode: workspace.mode || 'feed'
    };
  }

  function compactSurfaceMap(map = {}) {
    const source = map && typeof map === 'object' ? map : {};
    const out = {};
    for (const [key, value] of Object.entries(source)) {
      if (!value || typeof value !== 'object') continue;
      out[key] = Object.assign({}, value);
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
      rootPath: source.rootPath || config.rootPath || '',
      count: Number(source.count || 0),
      boundary: source.boundary || '',
      transportLabel: source.transportLabel || '',
      transportRefreshTier: source.transportRefreshTier || '',
      transportPlan: source.transportPlan ? Object.assign({}, source.transportPlan) : undefined,
      transportOutcome: source.transportOutcome ? Object.assign({}, source.transportOutcome) : undefined,
      transportTiers: source.transportTiers ? Object.assign({}, source.transportTiers) : undefined,
      discoveryState: source.discoveryState || '',
      repoDiscovery: Boolean(source.repoDiscovery || source.requestedSurfaces?.repoFiles?.requested),
      issueDiscovery: Boolean(source.issueDiscovery || source.requestedSurfaces?.issueSnapshots?.requested),
      issueUrls: source.issueUrls || config.issueUrls || '',
      requestedSurfaces: compactSurfaceMap(source.requestedSurfaces || {}),
      surfaces: compactSurfaceMap(source.surfaces || {}),
      closeable: Boolean(source.closeable),
      config
    };
  }

  function compactAsset(asset = {}) {
    const source = compactSource(asset.source || {});
    const sourceBacked = isSourceBackedAsset(asset, source);
    return {
      id: asset.id || '',
      name: asset.name || asset.path || 'asset',
      path: asset.path || '',
      type: asset.type || asset.mimeType || '',
      size: Number(asset.size || asset.sizeBytes || 0),
      kind: asset.kind || 'asset',
      previewState: asset.previewState || (sourceBacked ? 'metadata-only' : 'material-unavailable'),
      cacheState: asset.cacheState || 'route-shell-material-unavailable',
      materialAvailability: asset.materialAvailability || 'material-unavailable',
      source
    };
  }

  function compactWorkspaceCandidate(candidate = {}) {
    const source = compactSource(candidate.source || {});
    return {
      id: candidate.id || '',
      title: candidate.title || candidate.name || candidate.path || 'Workspace candidate',
      name: candidate.name || candidate.title || '',
      path: candidate.path || '',
      kind: candidate.kind || 'workspace-candidate',
      summary: candidate.summary || '',
      cacheState: candidate.cacheState || 'route-shell-material-unavailable',
      materialAvailability: candidate.materialAvailability || 'material-unavailable',
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
    const source = compactSource(record.source || {});
    const sourceBacked = isSourceBackedShell(record, source);
    const materialUnavailable = !String(record.markdown || '').trim();
    return {
      id: record.id || '',
      title: record.title || '',
      summary: record.summary || '',
      kind: record.kind || '',
      status: record.status || '',
      createdAt: record.createdAt || '',
      path: record.path || '',
      sourceMode: record.sourceMode || (sourceBacked ? 'source-backed' : 'local-route-shell'),
      cacheState: record.cacheState || (materialUnavailable ? 'route-shell-material-unavailable' : ''),
      materialAvailability: record.materialAvailability || (materialUnavailable ? 'material-unavailable' : 'available'),
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

  function routeHasWorkspaces(routeState) {
    return Array.isArray(routeState?.workspaces) && routeState.workspaces.length > 0;
  }

  function normalizeRouteState(routeState, lifecycle) {
    const empty = lifecycle?.makeEmptyAppState?.() || { version: 1, activeWorkspaceId: '', view: {}, workspaces: [], audit: null };
    if (!routeState || !routeHasWorkspaces(routeState)) return empty;
    const next = lifecycle?.cloneState?.(Object.assign({}, empty, routeState)) || JSON.parse(JSON.stringify(Object.assign({}, empty, routeState)));
    next.view = Object.assign({ universe: 'column', workspaceVerse: 'feed', reader: 'scan', query: '', displayOptions: { leavesFirst: false, leavesOnly: true, mismatchesOnly: false, showSupportingMarkdown: false, showWorkspaceCandidates: true, showAssets: false, schemaFilter: 'all', artifactFilter: 'all' } }, next.view || {});
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
      workspaceMergeCandidates: Array.isArray(workspace.workspaceMergeCandidates) ? workspace.workspaceMergeCandidates.map(normalizeRouteWorkspaceCandidateShell) : []
    });
  }

  function normalizeRouteAssetShell(asset = {}) {
    const source = compactSource(asset.source || {});
    const materialAvailability = asset.materialAvailability || 'material-unavailable';
    return Object.assign({}, asset, {
      source,
      content: '',
      dataUrl: '',
      previewState: asset.previewState || 'metadata-only',
      cacheState: asset.cacheState || 'route-shell-material-unavailable',
      materialAvailability,
      routeShell: asset.routeShell !== false,
      materialUnavailable: materialAvailability === 'material-unavailable'
    });
  }

  function normalizeRouteWorkspaceCandidateShell(candidate = {}) {
    const source = compactSource(candidate.source || {});
    const materialAvailability = candidate.materialAvailability || 'material-unavailable';
    return Object.assign({}, candidate, {
      source,
      markdown: '',
      cacheState: candidate.cacheState || 'route-shell-material-unavailable',
      materialAvailability,
      routeShell: candidate.routeShell !== false,
      materialUnavailable: materialAvailability === 'material-unavailable'
    });
  }

  function normalizeRouteRecordShell(record = {}) {
    const source = compactSource(record.source || {});
    const materialAvailability = record.materialAvailability || (String(record.markdown || '').trim() ? 'available' : 'material-unavailable');
    return Object.assign({}, record, {
      source,
      markdown: record.markdown || '',
      sourceMode: record.sourceMode || (isSourceBackedShell(record, source) ? 'source-backed' : 'local-route-shell'),
      cacheState: record.cacheState || (materialAvailability === 'material-unavailable' ? 'route-shell-material-unavailable' : ''),
      materialAvailability,
      routeShell: record.routeShell !== false,
      materialUnavailable: materialAvailability === 'material-unavailable'
    });
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
    normalizeRouteState,
    routeHasWorkspaces,
    routeSummary
  };
})(typeof window !== 'undefined' ? window : globalThis);
