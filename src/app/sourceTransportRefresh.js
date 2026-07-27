import { nextGithubTransportTier, normalizeGithubTransportTier } from '../sources/github/github.transport.js';

export const GITHUB_SOURCE_TRANSPORT_SURFACES = Object.freeze([
  Object.freeze({ key: 'repoFiles', label: 'repo files', shortLabel: 'files', inputKey: 'repoDiscovery' }),
  Object.freeze({ key: 'explicitFiles', label: 'explicit files', shortLabel: 'explicit', inputKey: 'explicitFiles' }),
  Object.freeze({ key: 'issueSnapshots', label: 'issue snapshots', shortLabel: 'issues', inputKey: 'issueDiscovery' })
]);

const SURFACE_BY_KEY = Object.freeze(Object.fromEntries(GITHUB_SOURCE_TRANSPORT_SURFACES.map((surface) => [surface.key, surface])));

export function sourceTransportSequenceTier(source = {}, fallbackTier = '') {
  const outcome = source.transportOutcome || {};
  return normalizeGithubTransportTier(
    fallbackTier
    || outcome.sequenceTier
    || source.transportRefreshTier
    || outcome.requestedTier
    || outcome.refreshTier
    || ''
  ) || 'cache';
}

export function sourceTransportSurfaceState(source = {}, key = '') {
  const surfaceKey = String(key || '').trim();
  const requested = source.requestedSurfaces?.[surfaceKey] || {};
  const actual = source.surfaces?.[surfaceKey] || {};
  return Object.assign({}, requested, actual);
}

export function sourceTransportSurfaceTier(source = {}, key = '', fallbackTier = '') {
  const surface = sourceTransportSurfaceState(source, key);
  const list = Array.isArray(surface.transportTiers) ? surface.transportTiers.map((tier) => normalizeGithubTransportTier(tier)).filter(Boolean) : [];
  const actualTier = normalizeGithubTransportTier(surface.transportTier || list[list.length - 1] || '');
  return normalizeGithubTransportTier(
    fallbackTier
    || actualTier
    || surface.sequenceTier
    || surface.transportRefreshTier
    || ''
  ) || sourceTransportSequenceTier(source, '');
}

export function sourceTransportActiveSurfaces(source = {}) {
  return GITHUB_SOURCE_TRANSPORT_SURFACES.filter((surface) => {
    const state = sourceTransportSurfaceState(source, surface.key);
    if (state.requested || state.attempted || state.loaded || state.discovered || state.requestedCount || state.unavailable || state.skipped || state.failed) return true;
    if (surface.key === 'repoFiles' && source.repoDiscovery) return true;
    if (surface.key === 'issueSnapshots' && (source.issueDiscovery || source.issueUrls || source.config?.issueUrls)) return true;
    return false;
  }).map((surface) => surface.key);
}

export function normalizeTransportSurfaceKeys(value, source = {}) {
  const requested = Array.isArray(value) ? value : String(value || '').split(',');
  const keys = requested.map((item) => String(item || '').trim()).filter(Boolean).filter((key) => Boolean(SURFACE_BY_KEY[key]));
  if (keys.length) return Array.from(new Set(keys));
  const active = sourceTransportActiveSurfaces(source).filter((key) => key !== 'explicitFiles');
  return active.length ? active : [];
}

export function sourceTransportBadgesForSource(source = {}) {
  const activeKeys = sourceTransportActiveSurfaces(source).filter((key) => key !== 'explicitFiles');
  if (!activeKeys.length) return [];
  const configured = source.transportOutcome?.configured || source.transportPlan?.configured || {};
  const rows = activeKeys.map((key) => {
    const surface = sourceTransportSurfaceState(source, key);
    const pendingTier = normalizeGithubTransportTier(surface.pendingTier || '');
    const tier = pendingTier || sourceTransportSurfaceTier(source, key);
    const status = String(surface.status || surface.activeStatus || (surface.unavailable || surface.skipped ? 'unavailable' : surface.failed ? 'failed' : surface.loaded ? 'ok' : '')).toLowerCase();
    const nextTier = pendingTier ? '' : nextGithubTransportTier(tier || 'cache', configured);
    return {
      key,
      label: SURFACE_BY_KEY[key]?.label || key,
      shortLabel: SURFACE_BY_KEY[key]?.shortLabel || key,
      tier,
      pendingTier,
      status,
      nextTier,
      refreshable: Boolean(nextTier),
      loaded: Number(surface.loaded || 0),
      unavailable: Boolean(surface.unavailable || surface.skipped),
      failed: Number(surface.failed || 0) > 0
    };
  });
  const tierSet = new Set(rows.map((row) => row.tier || 'cache'));
  const pendingSet = new Set(rows.map((row) => row.pendingTier || ''));
  const allSameTier = tierSet.size === 1 && pendingSet.size === 1;
  if (allSameTier) {
    const first = rows[0];
    return [Object.assign({}, first, {
      key: 'all',
      surfaceKeys: rows.map((row) => row.key),
      label: first.tier || 'transport',
      shortLabel: '',
      mixed: false,
      rows,
      refreshable: rows.some((row) => row.refreshable),
      nextTier: first.nextTier || ''
    })];
  }
  return rows.map((row) => Object.assign({}, row, { surfaceKeys: [row.key], mixed: true }));
}

export function sourceTransportRefreshInputForSource(source = {}, currentTier = '', surfaceKeysInput = null) {
  const selectedSurfaceKeys = normalizeTransportSurfaceKeys(surfaceKeysInput, source);
  const pendingTier = normalizeGithubTransportTier(source.transportOutcome?.pendingTier || '');
  const pendingSurfaces = Array.isArray(source.transportOutcome?.pendingSurfaces) ? source.transportOutcome.pendingSurfaces : [];
  if (pendingTier) return { ok: false, reason: 'pending', pendingTier, pendingSurfaces, observedTier: sourceTransportSequenceTier(source, source.transportOutcome?.pendingFromTier || currentTier) };
  const observedTier = normalizeGithubTransportTier(currentTier) || (selectedSurfaceKeys.length === 1 ? sourceTransportSurfaceTier(source, selectedSurfaceKeys[0]) : sourceTransportSequenceTier(source, currentTier));
  const nextTier = nextGithubTransportTier(observedTier, source.transportPlan?.configured || source.transportOutcome?.configured || {});
  if (!nextTier) return { ok: false, reason: 'last-tier', observedTier, selectedSurfaceKeys };
  const issueUrls = source.issueUrls || source.config?.issueUrls || '';
  const repoDiscovery = selectedSurfaceKeys.includes('repoFiles');
  const issueDiscovery = selectedSurfaceKeys.includes('issueSnapshots');
  if (!repoDiscovery && !issueDiscovery && !issueUrls) return { ok: false, reason: 'no-surfaces', nextTier, observedTier, selectedSurfaceKeys };
  return {
    ok: true,
    nextTier,
    observedTier,
    selectedSurfaceKeys,
    input: {
      sourceId: source.id || '',
      repository: source.repo || source.repository || source.config?.repo || '',
      ref: source.ref || source.config?.ref || '',
      rootPath: source.rootPath || source.config?.rootPath || '.topics',
      label: source.label || source.repo || 'GitHub source',
      repoDiscovery,
      issueDiscovery,
      issueUrls,
      transportRefreshTier: nextTier,
      transportRefreshSurfaces: selectedSurfaceKeys
    }
  };
}

export function sourceTransportPendingUpdateInputForSource(source = {}, refresh = {}) {
  const nextTier = normalizeGithubTransportTier(refresh.nextTier || '') || 'direct';
  const selectedSurfaceKeys = normalizeTransportSurfaceKeys(refresh.selectedSurfaceKeys, source);
  const repo = source.repo || source.repository || source.config?.repo || '';
  const surfaces = Object.assign({}, source.surfaces || {});
  for (const key of selectedSurfaceKeys) surfaces[key] = Object.assign({}, surfaces[key] || {}, { pendingTier: nextTier, transportRefreshTier: nextTier });
  return Object.assign({}, source, {
    id: source.id || '', repository: repo, repo,
    ref: source.ref || source.config?.ref || '',
    rootPath: source.rootPath || source.config?.rootPath || '.topics',
    label: source.label || source.repo || 'GitHub source',
    discoveryState: 'loading',
    surfaces,
    transportRefreshTier: nextTier,
    transportOutcome: Object.assign({}, source.transportOutcome || {}, { pendingTier: nextTier, pendingFromTier: refresh.observedTier || source.transportRefreshTier || '', pendingSurfaces: selectedSurfaceKeys })
  });
}
