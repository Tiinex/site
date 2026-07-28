import { createGithubTransportFetch, normalizeGithubTransportTier } from '../../sources/github/github.transport.js';
import { createGithubIssueSnapshotRecords, githubIssueFetchWarning, parseGithubIssueSnapshotTarget, parseGithubIssueSnapshotTargets } from './github.issueSnapshot.js';

export function finding(severity, code, message, extra = {}) { return Object.assign({ severity, code, message }, extra); }

export function issueMirrorFetchForTier(source = {}, tier = '', fetchImpl, diagnostics = {}) {
  const normalized = normalizeGithubTransportTier(tier);
  if (normalized !== 'mirror' && normalized !== 'cache') return fetchImpl;
  return async (url, init = {}) => {
    const emit = (event) => diagnostics.transportEvents?.push?.(Object.assign({ adapterId: 'github', sourceId: source?.id || '', repo: source?.repo || source?.repository || '', tier: normalized, resource: 'api-json', url }, event));
    if (!fetchImpl && normalized !== 'cache') {
      emit({ code: `github.transport.${normalized}.unavailable`, severity: 'warning', message: 'Hosted issue snapshot mirror fetch is unavailable in this runtime.' });
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

export function issueApiFetchForTier(source = {}, tier = '', fetchImpl, diagnostics = {}, options = {}) {
  const normalized = normalizeGithubTransportTier(tier);
  if (normalized !== 'proxy') return fetchImpl;
  const apiFetch = options.proxyFetchImpl || fetchImpl;
  const emit = (event) => diagnostics.transportEvents?.push?.(Object.assign({ adapterId: 'github', sourceId: source?.id || '', repo: source?.repo || source?.repository || '', tier: 'proxy', resource: 'github-api-json' }, event));
  if (!apiFetch) {
    return async () => {
      emit({ code: 'github.transport.proxy.unavailable', severity: 'warning', message: 'Proxy/API issue reader is unavailable in this runtime.' });
      return responseWithTransport(null, 'proxy');
    };
  }
  const runtime = createGithubTransportFetch(source, Object.assign({}, options, {
    fetchImpl: apiFetch,
    transportPlan: undefined,
    preferredTransports: ['direct'],
    transportOrderExact: true,
    allowCache: false,
    onTransportEvent: (event = {}) => emit(Object.assign({}, event, {
      tier: 'proxy',
      code: String(event.code || '').replace('github.transport.direct.', 'github.transport.proxy.')
    }))
  }));
  return async (url, init = {}) => {
    const res = await runtime.fetch(url, init);
    return responseWithTransport(res, 'proxy', true);
  };
}


export function directIssueDiscoveryUnavailable(source = {}, diagnostics = {}) {
  const repo = source?.repo || source?.repository || '';
  const warning = finding('warning', 'github.issue.direct.discovery-unavailable', 'Direct issue transport does not perform repository-wide issue discovery. Provide explicit issue URLs, use hosted mirror, or use proxy/API transport.', { surface: 'issueSnapshots', repo, transportTier: 'direct' });
  diagnostics.transportEvents?.push?.({ adapterId: 'github', sourceId: source?.id || '', repo, tier: 'direct', resource: 'issue-raw', code: 'github.transport.direct.discovery-unavailable', severity: 'warning', message: warning.message });
  return { schema: 'tiinex.github.issueSnapshot.discovery.v1', status: 'unavailable', targets: [], warnings: [warning], errors: [], counts: { discovered: 0, targets: 0, warnings: 1, errors: 0 }, transportTier: 'direct' };
}

export async function materializeDirectIssueTargets(targets = [], source = {}, options = {}, diagnostics = {}) {
  const parsed = Array.isArray(targets) ? { targets, errors: [], counts: { targets: targets.length, errors: 0 } } : parseGithubIssueSnapshotTargets(targets || []);
  const records = [];
  const warnings = [];
  const errors = [...(parsed.errors || [])];
  const targetResults = [];
  const fetchImpl = options.fetchImpl;
  if (!fetchImpl) {
    const warning = finding('warning', 'github.issue.direct.reader-unavailable', 'Direct issue transport has no raw fetch implementation in this runtime.', { surface: 'issueSnapshots', transportTier: 'direct' });
    warnings.push(warning);
    return { schema: 'tiinex.github.issueSnapshot.materialization.v1', records, warnings, errors, targetResults, counts: issueSurfaceMaterializationCounts(parsed.counts.targets, 0, warnings.length, errors.length, targetResults), transportTier: 'direct' };
  }
  for (const target of parsed.targets || []) {
    const normalized = target.ok ? target : parseGithubIssueSnapshotTarget(target.canonicalUrl || target.html_url || target.url || '');
    if (!normalized.ok) {
      errors.push({ ref: target.input || target.url || '', error: normalized.error || 'invalid issue target' });
      targetResults.push(issueSurfaceTargetResult(target, { status: 'failed', warningCode: 'invalid-issue-target', message: normalized.error || 'invalid issue target', transportTier: 'direct' }));
      continue;
    }
    try {
      const directUrl = normalized.directRawUrl || normalized.canonicalUrl;
      const res = await fetchImpl(directUrl, { headers: { Accept: 'text/markdown,text/plain,text/html,application/json,*/*' } });
      if (!res?.ok) {
        const warning = githubIssueFetchWarning(Object.assign(new Error(`${res?.status || 0} ${res?.statusText || ''}`.trim()), { status: res?.status || 0, statusText: res?.statusText || '', url: directUrl }), 'github.issue.direct.fetch-failed', `Direct raw issue fetch could not read ${directUrl}; no GitHub API request was made. Normal github.com issue pages may be blocked by browser CORS unless the URL is a browser-readable raw/static snapshot.`, { transportTier: 'direct' });
        warnings.push(warning);
        targetResults.push(issueSurfaceTargetResult(normalized, { status: 'failed', warningCode: warning.code, message: warning.message, transportTier: 'direct' }));
        continue;
      }
      const body = await res.text();
      const issue = directIssueSnapshotFromRawBody(body, normalized);
      const issueRecords = createGithubIssueSnapshotRecords(Object.assign({
        target: normalized,
        html_url: normalized.canonicalUrl,
        number: normalized.number,
        title: `Issue #${normalized.number}`,
        state: '',
        body,
        user: { login: '' },
        comments: [],
        method: 'github-direct-raw-issue-reader'
      }, issue || {}), options);
      for (const record of issueRecords) {
        record.sourceTarget = Object.assign({
          schema: 'tiinex.source.material.target.v1',
          surface: 'issueSnapshots',
          targetKind: record.snapshot?.embedded ? `github-${normalized.kind}-embedded-artifact` : `github-${normalized.kind}-snapshot`,
          inputTarget: record.snapshot?.sourceUrl || normalized.canonicalUrl,
          transportTier: 'direct',
          loaded: true
        }, record.sourceTarget || {});
        records.push(record);
      }
      targetResults.push(issueSurfaceTargetResult(normalized, { status: 'loaded', records: issueRecords.length, transportTier: 'direct' }));
    } catch (error) {
      const warning = githubIssueFetchWarning(error, 'github.issue.direct.fetch-exception', `Direct raw issue fetch could not read ${normalized.canonicalUrl}; no GitHub API request was made.`, { url: normalized.canonicalUrl, transportTier: 'direct' });
      warnings.push(warning);
      targetResults.push(issueSurfaceTargetResult(normalized, { status: 'failed', warningCode: warning.code, message: warning.message, transportTier: 'direct' }));
    }
  }
  return { schema: 'tiinex.github.issueSnapshot.materialization.v1', records, warnings, errors, targetResults, counts: issueSurfaceMaterializationCounts(parsed.counts.targets, records.length, warnings.length, errors.length, targetResults), transportTier: 'direct' };
}


function directIssueSnapshotFromRawBody(body = '', target = {}) {
  if (String(target.directRawFormat || '').toLowerCase() !== 'json') return null;
  try {
    const parsed = JSON.parse(String(body || '{}'));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    return Object.assign({}, parsed, {
      target,
      body: parsed.body || parsed.markdown || parsed.content || '',
      comments: Array.isArray(parsed.comments) ? parsed.comments : [],
      method: 'github-direct-static-issue-json'
    });
  } catch (_) {
    return null;
  }
}

function issueSurfaceMaterializationCounts(targets = 0, records = 0, warnings = 0, errors = 0, targetResults = []) {
  const results = Array.isArray(targetResults) ? targetResults : [];
  return {
    targets,
    records,
    warnings,
    errors,
    loadedTargets: results.filter((item) => item.status === 'loaded').length,
    failedTargets: results.filter((item) => item.status === 'failed').length,
    deferredTargets: results.filter((item) => item.status === 'deferred').length
  };
}

function issueSurfaceTargetResult(target = {}, patch = {}) {
  const number = Number(target.number || 0);
  const canonicalUrl = target.canonicalUrl || target.html_url || target.url || target.input || '';
  return Object.assign({
    schema: 'tiinex.github.issueSnapshot.targetResult.v1',
    repository: target.repository || (target.owner && target.repo ? `${target.owner}/${target.repo}` : ''),
    kind: target.kind || 'issue',
    number: Number.isFinite(number) ? number : 0,
    url: canonicalUrl,
    status: 'pending',
    records: 0,
    transportTier: '',
    warningCode: '',
    message: ''
  }, patch || {});
}

export function issueDirectFetchForTier(source = {}, fetchImpl, diagnostics = {}) {
  return async (url, init = {}) => {
    const emit = (event) => diagnostics.transportEvents?.push?.(Object.assign({ adapterId: 'github', sourceId: source?.id || '', repo: source?.repo || source?.repository || '', tier: 'direct', resource: 'issue-raw', url }, event));
    if (!fetchImpl) {
      emit({ code: 'github.transport.direct.unavailable', severity: 'warning', message: 'Direct issue raw fetch is unavailable in this runtime.' });
      return responseWithTransport(null, 'direct');
    }
    emit({ code: 'github.transport.direct.try', severity: 'info' });
    try {
      const res = await fetchImpl(url, init);
      if (res?.ok) emit({ code: 'github.transport.direct.ok', severity: 'info', status: res.status || 200 });
      else emit({ code: 'github.transport.direct.failed', severity: 'warning', status: res?.status || 0, message: res?.statusText || '' });
      return responseWithTransport(res, 'direct');
    } catch (error) {
      emit({ code: 'github.transport.direct.exception', severity: 'warning', message: error?.message || String(error || '') });
      throw error;
    }
  };
}

export function responseWithTransport(res, tier = '', forceTier = false) {
  // Native Response fields are brand-checked accessors. Keep an ordinary
  // delegating object rather than prototype-shelling real Fetch responses.
  if (!res) return makeTransportResponse('', { ok: false, status: 503, statusText: 'Transport unavailable', tier, contentType: 'application/json' });
  if (res.transportTier && !forceTier) return res;
  const status = Number(res.status || 0) || (res.ok ? 200 : 500);
  const ok = res.ok !== false && status >= 200 && status < 300;
  const headers = res.headers || { get: () => null };
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

export function makeTransportResponse(body = '', options = {}) {
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
