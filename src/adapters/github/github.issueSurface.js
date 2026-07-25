import { authorizeSourceTransport } from '../../sources/transport.policy.js';
import { normalizeGithubTransportTier } from '../../sources/github/github.transport.js';
import { discoverGithubIssueSnapshotTargets, materializeGithubIssueSnapshotFixtures, materializeGithubIssueSnapshots, parseGithubIssueSnapshotTargets } from './github.issueSnapshot.js';
import { discoverGithubIssueSnapshotTargetsViaHostedMirror, materializeGithubIssueSnapshotsViaHostedMirror } from './github.issueMirror.js';

export async function materializeGithubIssueSurface(source = {}, input = {}, options = {}) {
  const adapterId = options.adapterId || 'github';
  const sourceId = source?.id || '';
  const fetchImpl = options.fetchImpl;
  const policyInput = options.transportPolicy || null;
  const warnings = [];
  const errors = [];
  const diagnostics = { transportEvents: [] };
  const requestedTier = requestedIssueTransportTier(options);
  const sourceFetchImpl = options.sourceFetchImpl || (typeof fetch !== 'undefined' ? fetch : null);
  const issueApiFetchImpl = issueApiFetchForTier(source, requestedTier, sourceFetchImpl, diagnostics);
  const mirrorFetchImpl = issueMirrorFetchForTier(source, requestedTier, sourceFetchImpl, diagnostics);
  const surface = { attempted: true, requested: true, requestedCount: 0, discovered: 0, loaded: 0, failed: 0, records: [] };
  let result = { records: [], warnings: [], errors: [], counts: { targets: 0, records: 0, warnings: 0, errors: 0 } };
  let parsed = parseGithubIssueSnapshotTargets(input.issueUrls || []);
  progress(options, { phase: 'issue-snapshots', percent: 32, label: 'Discovering bounded GitHub issue snapshots' });

  if (!parsed.counts.targets && input.issueDiscovery) {
    const auth = policyInput ? authorizeSourceTransport({ kind: 'github.issue-discovery', sourceId, adapterId, requestedRequests: Number(options.maxIssues || 25) + 1 }, policyInput) : null;
    if (auth && !auth.allowed) {
      diagnostics.transportPolicy = auth;
      Object.assign(surface, { skipped: true, unavailable: true });
      for (const issue of auth.findings || []) {
        const warning = { code: issue.code, severity: issue.severity || 'warning', surface: 'issueSnapshots', message: issue.message, sourceId, adapterId, retryable: issue.retryable === true };
        warnings.push(warning);
        diagnostics.transportEvents.push(Object.assign({ resultKind: 'issue-discovery-policy' }, warning));
      }
    } else {
      const discovered = requestedTier === 'mirror'
        ? await discoverGithubIssueSnapshotTargetsViaHostedMirror(source, Object.assign({}, options, { fetchImpl: mirrorFetchImpl, onTransportEvent: pushIssueTransportEvent(diagnostics, source, 'mirror') }))
        : await discoverGithubIssueSnapshotTargets(source, Object.assign({}, options, { fetchImpl: requestedTier === 'proxy' || requestedTier === 'direct' ? issueApiFetchImpl : fetchImpl }));
      warnings.push(...(discovered.warnings || []).map((warning) => Object.assign({ surface: 'issueSnapshots' }, warning)));
      errors.push(...(discovered.errors || []).map((error) => Object.assign({ surface: 'issueSnapshots' }, error)));
      parsed = { targets: discovered.targets || [], errors: [], counts: { targets: discovered.targets?.length || 0, errors: 0 } };
      diagnostics.issueSnapshotDiscovery = { status: discovered.status, url: discovered.url || '', discovered: discovered.counts?.discovered || 0 };
      surface.discovered = parsed.counts.targets;
    }
  }

  diagnostics.issueSnapshotTargets = parsed.counts.targets;
  Object.assign(surface, { requestedCount: parsed.counts.targets, targets: parsed.counts.targets });
  if (parsed.errors.length) errors.push(...parsed.errors.map((entry) => Object.assign({ surface: 'issueSnapshots', ref: entry.ref }, entry)));

  const maxComments = Math.max(0, Math.min(100, Number(options.maxComments ?? 6)));
  const materializationAuth = policyInput && parsed.counts.targets && !surface.skipped
    ? authorizeSourceTransport({ kind: 'github.issue-snapshot-load', sourceId, adapterId, requestedRequests: Number(parsed.counts.targets || 0) * (maxComments > 0 ? 2 : 1) }, policyInput)
    : null;
  if (materializationAuth && !materializationAuth.allowed) {
    diagnostics.transportPolicy = materializationAuth;
    Object.assign(surface, { skipped: true, unavailable: true });
    for (const issue of materializationAuth.findings || []) {
      const warning = { code: issue.code, severity: issue.severity || 'warning', surface: 'issueSnapshots', message: issue.message, sourceId, adapterId, retryable: issue.retryable === true };
      warnings.push(warning);
      diagnostics.transportEvents.push(Object.assign({ resultKind: 'issue-snapshot-load-policy' }, warning));
    }
  } else if (options.issueSnapshotFixtures && parsed.counts.targets && input.issueUrls) result = materializeGithubIssueSnapshotFixtures(input.issueUrls || [], options.issueSnapshotFixtures);
  else if (parsed.counts.targets && requestedTier === 'mirror') result = await materializeGithubIssueSnapshotsViaHostedMirror(parsed.targets, Object.assign({}, options, { fetchImpl: mirrorFetchImpl, maxComments, onTransportEvent: pushIssueTransportEvent(diagnostics, source, 'mirror') }));
  else if (parsed.counts.targets) result = await materializeGithubIssueSnapshots(parsed.targets, Object.assign({}, options, { fetchImpl: requestedTier === 'proxy' || requestedTier === 'direct' ? issueApiFetchImpl : fetchImpl, maxComments }));
  else if (!surface.skipped) {
    warnings.push({ code: 'github.issue.discovery.no-targets', severity: 'warning', surface: 'issueSnapshots', requested: true, attempted: true, unavailable: true, targetCount: 0, message: 'Issue snapshot discovery was selected, but no issue targets were discovered or provided.' });
    Object.assign(surface, { unavailable: true, skipped: true });
  }

  warnings.push(...(result.warnings || []).map((warning) => Object.assign({ surface: 'issueSnapshots' }, warning)));
  errors.push(...(result.errors || []).map((error) => Object.assign({ surface: 'issueSnapshots' }, error)));
  diagnostics.issueSnapshotRecords = result.records.length;
  Object.assign(surface, { loaded: result.records.length, failed: Math.max(0, Number(result.counts?.targets || 0) - Number(result.records.length || 0)), records: result.records.map((record) => record.id).filter(Boolean) });
  if (!result.records.length && parsed.counts.targets && !surface.skipped) surface.unavailable = true;
  for (const record of result.records || []) record.sourceTarget = Object.assign({ schema: 'tiinex.source.material.target.v1', surface: 'issueSnapshots', targetKind: 'github-issue-snapshot', loaded: true }, record.sourceTarget || {});
  return { records: result.records || [], warnings, errors, diagnostics, surface, counts: result.counts || {} };
}


function requestedIssueTransportTier(options = {}) {
  const fromOrder = options.transportOrderExact === true && Array.isArray(options.preferredTransports) ? options.preferredTransports[0] : '';
  return normalizeGithubTransportTier(options.transportRefreshTier || options.transportPolicy?.requestedTier || fromOrder || '');
}

function issueApiFetchForTier(source = {}, tier = '', fetchImpl, diagnostics = {}) {
  const normalized = normalizeGithubTransportTier(tier);
  if (normalized !== 'proxy' && normalized !== 'direct') return fetchImpl;
  return async (url, init = {}) => {
    const emit = (event) => diagnostics.transportEvents?.push?.(Object.assign({ adapterId: 'github', sourceId: source?.id || '', repo: source?.repo || source?.repository || '', tier: normalized, resource: 'api-json', url }, event));
    if (!fetchImpl) {
      emit({ code: `github.transport.${normalized}.unavailable`, severity: 'warning', message: `${normalized} issue API reader is unavailable in this runtime.` });
      return responseWithTransport(null, normalized);
    }
    emit({ code: `github.transport.${normalized}.try`, severity: 'info', url, resource: 'api-json' });
    try {
      const res = await fetchImpl(url, init);
      if (res?.ok) emit({ code: `github.transport.${normalized}.ok`, severity: 'info', url, resource: 'api-json', status: res.status || 200 });
      else emit({ code: `github.transport.${normalized}.failed`, severity: 'warning', url, resource: 'api-json', status: res?.status || 0, message: res?.statusText || '' });
      return responseWithTransport(res, normalized);
    } catch (error) {
      emit({ code: `github.transport.${normalized}.exception`, severity: 'warning', message: error?.message || String(error || '') });
      throw error;
    }
  };
}

function issueMirrorFetchForTier(source = {}, tier = '', fetchImpl, diagnostics = {}) {
  const normalized = normalizeGithubTransportTier(tier);
  if (normalized !== 'mirror') return fetchImpl;
  return async (url, init = {}) => {
    const emit = (event) => diagnostics.transportEvents?.push?.(Object.assign({ adapterId: 'github', sourceId: source?.id || '', repo: source?.repo || source?.repository || '', tier: 'mirror', resource: 'api-json', url }, event));
    if (!fetchImpl) {
      emit({ code: 'github.transport.mirror.unavailable', severity: 'warning', message: 'Hosted issue snapshot mirror fetch is unavailable in this runtime.' });
      return responseWithTransport(null, 'mirror');
    }
    emit({ code: 'github.transport.mirror.try', severity: 'info', url, resource: 'api-json' });
    try {
      const res = await fetchImpl(url, init);
      if (res?.ok) emit({ code: 'github.transport.mirror.ok', severity: 'info', url, resource: 'api-json', status: res.status || 200 });
      else emit({ code: 'github.transport.mirror.failed', severity: 'warning', url, resource: 'api-json', status: res?.status || 0, message: res?.statusText || '' });
      return responseWithTransport(res, 'mirror');
    } catch (error) {
      emit({ code: 'github.transport.mirror.exception', severity: 'warning', message: error?.message || String(error || '') });
      throw error;
    }
  };
}

function responseWithTransport(res, tier = '') {
  if (!res) return makeTransportResponse('', { ok: false, status: 503, statusText: 'Transport unavailable', tier, contentType: 'application/json' });
  if (res.transportTier) return res;
  const status = Number(res.status || 0) || (res.ok ? 200 : 500);
  const ok = res.ok !== false && status >= 200 && status < 300;
  const headers = res.headers || { get: () => null };
  // Native Response fields are brand-checked accessors, not plain enumerable
  // properties. Do not wrap native responses with Object.create(Response.prototype):
  // browsers throw when later code reads .ok/.status/.json() from that shell.
  // Keep an ordinary delegating object instead so mirror/proxy issue readers work
  // with real Fetch responses as well as test doubles.
  return Object.freeze({
    ok,
    status,
    statusText: res.statusText || (ok ? 'OK' : 'Error'),
    url: res.url || '',
    transportTier: tier,
    headers: { get: (name) => headers.get?.(name) ?? null },
    text: async () => {
      if (typeof res.clone === 'function') return res.clone().text();
      if (typeof res.text === 'function') return res.text();
      return String(res.body || '');
    },
    json: async () => {
      if (typeof res.clone === 'function') return res.clone().json();
      if (typeof res.json === 'function') return res.json();
      return JSON.parse(String(res.body || '{}'));
    },
    clone: () => responseWithTransport(typeof res.clone === 'function' ? res.clone() : res, tier)
  });
}

function makeTransportResponse(body = '', options = {}) {
  const text = String(body || '');
  const status = Number(options.status || 0) || (options.ok === false ? 503 : 200);
  const ok = options.ok !== false && status >= 200 && status < 300;
  return Object.freeze({
    ok,
    status,
    statusText: options.statusText || (ok ? 'OK' : 'Error'),
    url: options.url || '',
    transportTier: options.tier || '',
    headers: { get: (name) => String(name || '').toLowerCase() === 'content-type' ? (options.contentType || 'application/json') : null },
    text: async () => text,
    json: async () => JSON.parse(text || '{}'),
    clone: () => makeTransportResponse(text, options)
  });
}

function pushIssueTransportEvent(diagnostics = {}, source = {}, tier = '') {
  return (event = {}) => diagnostics.transportEvents?.push?.(Object.assign({ adapterId: 'github', sourceId: source?.id || '', repo: source?.repo || source?.repository || '', tier: tier || event.tier || '', resource: 'api-json' }, event));
}

function progress(options = {}, event = {}) {
  if (typeof options.onProgress === 'function') options.onProgress(event);
}
