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

export function repoTransportFallbackTiers(options = {}, source = {}) {
  const normalized = requestedRepoTransportTier(options);
  const defaultTiers = repoProxyAutoEnabled(source, options) ? REPO_TRANSPORT_FALLBACKS.default : REPO_TRANSPORT_FALLBACKS.default.filter((tier) => tier !== 'proxy');
  const tiers = Array.from(normalized ? (REPO_TRANSPORT_FALLBACKS[normalized] || [normalized]) : defaultTiers);
  if (options.allowCache === false && normalized !== 'cache') return tiers.filter((tier) => tier !== 'cache');
  return tiers;
}

export async function preMaterializeGithubRepoFiles(source = {}, options = {}) {
  const tiers = repoTransportFallbackTiers(options, source);
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

function repoProxyAutoEnabled(source = {}, options = {}) {
  if (options.allowManualProxy === true || requestedRepoTransportTier(options) === 'proxy') return true;
  const repo = String(source.repo || source.repository || '').trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '').replace(/^\/+|\/+$/g, '').split('/').slice(0, 2).join('/').toLowerCase();
  const configured = Array.isArray(options.workspaceConfig?.repositoryTransports) ? options.workspaceConfig.repositoryTransports : [];
  return configured.some((item) => {
    const kind = String(item.kind || '').toLowerCase();
    if (!kind.includes('proxy')) return false;
    const activation = String(item.activation || item.mode || item.use || '').trim().toLowerCase();
    if (['manual', 'explicit', 'opt-in', 'optin', 'user', 'off', 'disabled', 'never'].includes(activation)) return false;
    const proxy = String(item.proxy || item.proxyUrl || item.corsProxy || '').trim();
    if (!proxy) return false;
    const match = String(item.match || item.repository || item.repo || '').trim().toLowerCase();
    return !match || match === repo || match === 'github.com/*' || match === 'github.com/**' || (match.endsWith('*') && repo.startsWith(match.slice(0, -1).replace(/^github\.com\//, '')));
  });
}

function withDiagnostics(result = {}, tiers = [], diagnostics = {}) {
  return Object.assign({}, result, { attemptedTiers: tiers, diagnostics: Object.assign({}, result.diagnostics || {}, { transportEvents: diagnostics.transportEvents }) });
}
