import { fetchTiinexAppConfigSource, resolveTiinexRuntimeWorkspaceCandidate, tiinexAppConfigSourceToStartupPlan } from './tiinexAppConfigSource.js';
import { normalizeWorkspaceBootstrapCandidate } from './tiinexHostedWorkspaceConventions.js';

export function tiinexAppStartupRequestContext(options = {}) {
  const locationLike = options.locationLike || globalThis.location || { href: '', search: '' };
  let params;
  try { params = new URLSearchParams(locationLike.search || new URL(locationLike.href || '', 'http://localhost/').search || ''); } catch (_) { params = new URLSearchParams(''); }
  const pointer = params.get('workspacePointer') || params.get('issueWorkspace') || params.get('viewerWorkspacePointer') || params.get('workspaceIssue') || '';
  const workspace = params.get('viewerWorkspace') || params.get('workspace') || params.get('viewerConfig') || params.get('config') || params.get('identity') || '';
  return Object.freeze({ explicitQueryRequested: Boolean(pointer || workspace), pointer, workspace });
}

export function tiinexAppStartupCandidates(options = {}) {
  const locationLike = options.locationLike || globalThis.location || { href: '', search: '' };
  const hostInput = options.hostWorkspace !== undefined
    ? options.hostWorkspace
    : (options.windowObj?.TiinexWorkspace || options.windowObj?.tiinexWorkspace || options.windowObj?.TIINEX_WORKSPACE || globalThis.TiinexWorkspace || globalThis.tiinexWorkspace || globalThis.TIINEX_WORKSPACE || {});
  const host = typeof hostInput === 'string' ? { defaultWorkspace: hostInput } : (hostInput && typeof hostInput === 'object' ? hostInput : {});
  const candidates = [];
  const add = (input, defaults = {}) => {
    const normalized = normalizeWorkspaceBootstrapCandidate(input, defaults);
    if (normalized) candidates.push(normalized);
  };
  const requestContext = tiinexAppStartupRequestContext({ locationLike });
  if (requestContext.pointer) add({ kind: 'github-issue-pointer', url: requestContext.pointer }, { role: 'query-primary', label: 'Query workspace pointer', source: 'query' });
  if (requestContext.workspace) add({ kind: 'workspace-url', url: requestContext.workspace }, { role: 'query-workspace', label: 'Query workspace', source: 'query' });
  if (Array.isArray(host.candidates)) host.candidates.forEach((candidate, index) => add(candidate, { role: `runtime-${index + 1}`, source: 'window.TiinexWorkspace.candidates' }));
  if (host.pointer) add(host.pointer, { kind: 'github-issue-pointer', role: 'runtime-pointer', label: 'Runtime workspace pointer', source: 'window.TiinexWorkspace.pointer' });
  if (Array.isArray(host.pointers)) host.pointers.forEach((value, index) => add(value, { kind: 'github-issue-pointer', role: `runtime-pointer-${index + 1}`, source: 'window.TiinexWorkspace.pointers' }));
  for (const key of ['defaultWorkspace', 'workspace', 'viewerWorkspace']) if (host[key]) add({ kind: 'workspace-url', url: host[key] }, { role: `runtime-${key}`, label: key, source: `window.TiinexWorkspace.${key}` });
  if (host.fallbackWorkspace) add({ kind: 'workspace-url', url: host.fallbackWorkspace }, { role: 'runtime-fallback', label: 'Runtime fallback workspace', source: 'window.TiinexWorkspace.fallbackWorkspace' });
  if (Array.isArray(host.fallbacks)) host.fallbacks.forEach((value, index) => add(value, { kind: 'workspace-url', role: `runtime-fallback-${index + 1}`, source: 'window.TiinexWorkspace.fallbacks' }));
  const seen = new Set();
  return candidates.filter((candidate) => {
    const key = `${candidate.kind}\n${candidate.url || ''}\n${candidate.path || ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function resolveTiinexAppStartupGithubInput(targetUrl = '', options = {}) {
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  const parseWorkspaceConfig = options.parseWorkspaceConfig || ((markdown) => ({ workspaceEntrypoints: [] }));
  const startupCandidates = tiinexAppStartupCandidates(options);
  const requestContext = tiinexAppStartupRequestContext(options);
  const diagnostics = { startupCandidates: startupCandidates.map(compactCandidate), attempts: [], explicitQueryRequested: requestContext.explicitQueryRequested };
  for (const candidate of startupCandidates) {
    const attempt = Object.assign(compactCandidate(candidate), { ok: false });
    diagnostics.attempts.push(attempt);
    const resolved = await resolveTiinexRuntimeWorkspaceCandidate(candidate, { fetchImpl, parseWorkspaceConfig, targetUrl, locationLike: options.locationLike, diagnostics });
    if (!resolved?.ok) { attempt.error = resolved?.message || resolved?.error || 'unavailable'; continue; }
    attempt.ok = true;
    return mapStartupResult(resolved, 'explicit-runtime-config', diagnostics, requestContext);
  }
  const hosted = await fetchTiinexAppConfigSource(targetUrl, { fetchImpl, parseWorkspaceConfig, baseUrl: options.baseUrl });
  if (!hosted?.ok) return Object.assign({}, hosted || { ok: false, message: 'No hosted Tiinex startup config was found.' }, { startupClass: 'unresolved', explicitQueryRequested: requestContext.explicitQueryRequested, diagnostics: Object.assign({}, hosted?.diagnostics || {}, diagnostics) });
  const convention = String(hosted.diagnostics?.selectedConvention || '').toLowerCase();
  const startupClass = /embedded-default-workspace|convention-path/.test(convention) ? 'packaged-fallback-config' : 'hosted-config';
  return mapStartupResult(hosted, startupClass, diagnostics, requestContext);
}

function mapStartupResult(result = {}, startupClass = '', diagnostics = {}, requestContext = {}) {
  const mapped = tiinexAppConfigSourceToStartupPlan(result);
  if (!mapped.ok) return Object.assign({}, mapped, { startupClass, explicitQueryRequested: Boolean(requestContext.explicitQueryRequested), diagnostics: result.diagnostics, configUrl: result.configUrl });
  return Object.assign({}, mapped, {
    startupClass,
    explicitQueryRequested: Boolean(requestContext.explicitQueryRequested),
    markdown: result.markdown || '',
    config: result.config || {},
    configUrl: result.configUrl || '',
    targetUrl: result.targetUrl || '',
    diagnostics: Object.assign({}, result.diagnostics || {}, diagnostics, { selectedConvention: result.diagnostics?.selectedConvention || '' })
  });
}

function compactCandidate(candidate = {}) {
  return { kind: candidate.kind || '', role: candidate.role || '', source: candidate.source || '', url: candidate.url || '', path: candidate.path || '' };
}
