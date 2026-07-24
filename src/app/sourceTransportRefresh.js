import { nextGithubTransportTier, normalizeGithubTransportTier } from '../sources/github/github.transport.js';

export function sourceTransportRefreshInputForSource(source = {}, currentTier = '') {
  const observedTier = normalizeGithubTransportTier(currentTier || source.transportOutcome?.activeTier || source.transportRefreshTier || 'cache') || 'cache';
  const nextTier = nextGithubTransportTier(observedTier, source.transportPlan?.configured || {});
  if (!nextTier) return { ok: false, reason: 'last-tier', observedTier };
  const requestedSurfaces = source.requestedSurfaces || {};
  const repoDiscovery = Boolean(source.repoDiscovery || requestedSurfaces.repoFiles?.requested);
  const issueDiscovery = Boolean(source.issueDiscovery || requestedSurfaces.issueSnapshots?.requested || source.issueUrls);
  const issueUrls = source.issueUrls || source.config?.issueUrls || '';
  if (!repoDiscovery && !issueDiscovery && !issueUrls) return { ok: false, reason: 'no-surfaces', nextTier, observedTier };
  return {
    ok: true,
    nextTier,
    observedTier,
    input: {
      sourceId: source.id || '',
      repository: source.repo || source.repository || source.config?.repo || '',
      ref: source.ref || source.config?.ref || '',
      rootPath: source.rootPath || source.config?.rootPath || '.topics',
      label: source.label || source.repo || 'GitHub source',
      repoDiscovery,
      issueDiscovery,
      issueUrls,
      transportRefreshTier: nextTier
    }
  };
}
