import { normalizeGithubTransportTier } from '../../sources/github/github.transport.js';
import { materializeGithubRepoFilesFromSourceCache, materializeGithubRepoFilesViaHostedMirror } from './github.repoMirror.js';
import { materializeGithubRepoFilesViaGitProxy } from './github.repoProxy.js';

const REPO_TRANSPORT_FALLBACKS = Object.freeze({
  default: Object.freeze(['cache', 'mirror', 'proxy', 'direct']),
  cache: Object.freeze(['cache', 'mirror', 'proxy', 'direct']),
  mirror: Object.freeze(['mirror']),
  proxy: Object.freeze(['proxy']),
  direct: Object.freeze(['direct'])
});

export function requestedRepoTransportTier(options = {}) {
  const fromOrder = options.transportOrderExact === true && Array.isArray(options.preferredTransports) ? options.preferredTransports[0] : '';
  return normalizeGithubTransportTier(options.transportRefreshTier || options.transportPolicy?.requestedTier || fromOrder || '');
}

export function repoTransportFallbackTiers(options = {}) {
  const normalized = requestedRepoTransportTier(options);
  const tiers = Array.from(normalized ? (REPO_TRANSPORT_FALLBACKS[normalized] || [normalized]) : REPO_TRANSPORT_FALLBACKS.default);
  if (options.allowCache === false && normalized !== 'cache') return tiers.filter((tier) => tier !== 'cache');
  return tiers;
}

export async function preMaterializeGithubRepoFiles(source = {}, options = {}) {
  const tiers = repoTransportFallbackTiers(options);
  const diagnostics = { transportEvents: [] };
  for (const tier of tiers) {
    let result = null;
    if (tier === 'cache') result = await materializeGithubRepoFilesFromSourceCache(source, options);
    else if (tier === 'mirror') result = await materializeGithubRepoFilesViaHostedMirror(source, Object.assign({}, options, { cacheMode: 'refresh' }));
    else if (tier === 'proxy') result = await materializeGithubRepoFilesViaGitProxy(source, options);
    else break;
    diagnostics.transportEvents.push(...(result?.diagnostics?.transportEvents || []));
    if (result?.records?.length) return withDiagnostics(result, tiers, diagnostics);
    if (options.transportOrderExact === true && requestedRepoTransportTier(options)) return withDiagnostics(result || {}, tiers, diagnostics);
  }
  return { records: [], warnings: [], errors: [], counts: { records: 0 }, attemptedTiers: tiers, diagnostics };
}

function withDiagnostics(result = {}, tiers = [], diagnostics = {}) {
  return Object.assign({}, result, { attemptedTiers: tiers, diagnostics: Object.assign({}, result.diagnostics || {}, { transportEvents: diagnostics.transportEvents }) });
}
