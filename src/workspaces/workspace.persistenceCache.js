(function attachWorkspacePersistenceCache(global) {
  'use strict';

  function compactSourceForSessionCache(source = {}, workspace = {}) {
    const next = Object.assign({}, source || {});
    next.surfaces = cacheSurfaceMapForSource(source, workspace);
    delete next.transportOutcome;
    delete next.transportPlan;
    delete next.transportTiers;
    next.transportRefreshTier = '';
    return next;
  }

  function cacheSurfaceMapForSource(source = {}, workspace = {}) {
    const sourceId = String(source.id || '').trim();
    const base = source.surfaces && typeof source.surfaces === 'object' ? JSON.parse(JSON.stringify(source.surfaces)) : {};
    const records = Array.isArray(workspace.records) ? workspace.records : [];
    const counts = {};
    for (const record of records) {
      if (sourceId && String(record?.source?.id || '') !== sourceId) continue;
      const surface = String(record?.sourceTarget?.surface || '').trim();
      if (!surface) continue;
      counts[surface] ||= { loaded: 0, records: [] };
      counts[surface].loaded += 1;
      if (record.id) counts[surface].records.push(record.id);
    }
    for (const [surface, count] of Object.entries(counts)) {
      base[surface] = Object.assign({}, base[surface] || {}, { requested: true, attempted: true, loaded: count.loaded, records: count.records, transportTier: 'cache', transportTiers: ['cache'], pendingTier: '', transportRefreshTier: '' });
    }
    for (const value of Object.values(base)) {
      if (!value || typeof value !== 'object') continue;
      delete value.pendingTier;
      value.transportRefreshTier = '';
      if (value.loaded && !value.transportTier) value.transportTier = 'cache';
      if (value.loaded && !Array.isArray(value.transportTiers)) value.transportTiers = ['cache'];
    }
    return base;
  }

  global.TiinexWorkspacePersistenceCache = { compactSourceForSessionCache, cacheSurfaceMapForSource };
})(typeof window !== 'undefined' ? window : globalThis);
