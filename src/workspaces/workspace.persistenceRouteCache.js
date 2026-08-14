(function attachWorkspacePersistenceRouteCache(global) {
  'use strict';

  function mergeWorkspaceRouteShell(routeWorkspace = {}, cachedWorkspace = {}) {
    const routeSources = asArray(routeWorkspace.sources);
    const routeSourceIds = new Set(routeSources.map(sourceIdentity).filter(Boolean));
    return Object.assign({}, cachedWorkspace, routeWorkspace, {
      source: Object.assign({}, cachedWorkspace.source || {}, routeWorkspace.source || {}),
      sources: hydrateRouteMembers(routeSources, cachedWorkspace.sources, sourceIdentity, hydrateSource),
      sourceOrder: routeSourceOrder(routeWorkspace.sourceOrder, routeSources, routeSourceIds),
      records: hydrateRouteMembers(routeWorkspace.records, cachedWorkspace.records, recordIdentity, hydrateRecord),
      assets: hydrateRouteMembers(routeWorkspace.assets, cachedWorkspace.assets, assetIdentity, hydrateAsset),
      ...((Array.isArray(routeWorkspace.workspaceMergeCandidates) && routeWorkspace.workspaceMergeCandidates.length) || (Array.isArray(cachedWorkspace.workspaceMergeCandidates) && cachedWorkspace.workspaceMergeCandidates.length)
        ? { workspaceMergeCandidates: hydrateRouteMembers(routeWorkspace.workspaceMergeCandidates, cachedWorkspace.workspaceMergeCandidates, recordIdentity, hydrateRecord) }
        : {}),
      importLog: asArray(routeWorkspace.importLog),
      workspaceMarkdown: routeWorkspace.workspaceMarkdown || cachedWorkspace.workspaceMarkdown || '',
      workspaceImport: Object.assign({}, cachedWorkspace.workspaceImport || {}, routeWorkspace.workspaceImport || {})
    });
  }

  function hydrateRouteMembers(routeItems = [], cachedItems = [], identity = recordIdentity, hydrate = hydrateRecord) {
    const cachedByIdentity = new Map();
    for (const item of asArray(cachedItems)) {
      const key = identity(item);
      if (key) cachedByIdentity.set(key, item);
    }
    return asArray(routeItems).map((routeItem) => {
      const cachedItem = cachedByIdentity.get(identity(routeItem));
      return cachedItem ? hydrate(routeItem, cachedItem) : routeItem;
    });
  }

  function hydrateRecord(routeItem = {}, cachedItem = {}) {
    const next = Object.assign({}, cachedItem, routeItem, {
      source: Object.assign({}, cachedItem.source || {}, routeItem.source || {})
    });
    if (!recordHasRouteOwnedMaterial(routeItem)) {
      if (cachedItem.cacheState) next.cacheState = cachedItem.cacheState;
      if (cachedItem.materialAvailability) next.materialAvailability = cachedItem.materialAvailability;
    }
    return next;
  }

  function hydrateAsset(routeItem = {}, cachedItem = {}) {
    const next = Object.assign({}, cachedItem, routeItem, {
      source: Object.assign({}, cachedItem.source || {}, routeItem.source || {})
    });
    if (!assetHasRouteOwnedMaterial(routeItem)) {
      if (cachedItem.cacheState) next.cacheState = cachedItem.cacheState;
      if (cachedItem.previewState) next.previewState = cachedItem.previewState;
    }
    return next;
  }

  function recordHasRouteOwnedMaterial(item = {}) {
    return Boolean(String(item.markdown || '')) || item.materialAvailability === 'available';
  }

  function assetHasRouteOwnedMaterial(item = {}) {
    return Boolean(item.content || item.bytes || item.blob || item.objectUrl) || item.previewState === 'available' || item.materialAvailability === 'available';
  }

  function hydrateSource(routeItem = {}, cachedItem = {}) {
    return Object.assign({}, cachedItem, routeItem, {
      surfaces: Object.assign({}, cachedItem.surfaces || {}, routeItem.surfaces || {})
    });
  }

  function routeSourceOrder(routeOrder = [], routeSources = [], routeSourceIds = new Set()) {
    const ordered = asArray(routeOrder).filter((id) => routeSourceIds.has(id));
    for (const source of routeSources) if (source?.id && !ordered.includes(source.id)) ordered.push(source.id);
    return ordered;
  }

  function sourceIdentity(source = {}) { return String(source.id || '').trim(); }
  function recordIdentity(record = {}) { return String(record.id || record.path || record.sourcePath || '').trim(); }
  function assetIdentity(asset = {}) { return String(asset.id || asset.path || asset.sourcePath || '').trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }

  global.TiinexWorkspacePersistenceRouteCache = { mergeWorkspaceRouteShell };
})(typeof window !== 'undefined' ? window : globalThis);
