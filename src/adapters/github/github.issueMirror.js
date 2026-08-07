import { DEFAULT_ISSUE_SNAPSHOT_MAX_COMMENTS, createGithubIssueSnapshotRecords, githubIssueFetchWarning, parseGithubIssueSnapshotTarget, parseGithubIssueSnapshotTargets } from './github.issueSnapshot.js';
import { readGithubSourceCacheEntry, writeGithubSourceCacheEntry, makeGithubSourceCacheResponse } from '../../sources/github/github.transport.js';

export async function discoverGithubIssueSnapshotTargetsViaHostedMirror(source = {}, options = {}) {
  const repo = String(source.repo || source.repository || '').replace(/^\/+|\/+$/g, '');
  const fetchImpl = options.fetchImpl || (typeof fetch !== 'undefined' ? fetch : null);
  if (!repo || !fetchImpl) {
    return hostedUnavailable('github.issue.mirror.unavailable', 'Hosted issue snapshot mirror is unavailable without a repository and fetch implementation.');
  }
  try {
    const hosted = await loadHostedIssueSnapshotIndex(repo, options);
    const maxIssues = Math.max(1, Math.min(100, Number(options.maxIssues || options.maxIssueSnapshots || 12)));
    const targets = hosted.issues.slice(0, maxIssues)
      .map((entry) => parseGithubIssueSnapshotTarget(entry.issueUrl || `https://github.com/${repo}/issues/${entry.number}`))
      .filter((target) => target.ok)
      .map((target) => Object.assign(target, { hostedSnapshot: { metadataUrl: hosted.metadataUrl } }));
    return {
      schema: 'tiinex.github.issueSnapshot.discovery.v1',
      status: 'ready',
      targets,
      warnings: targets.length >= maxIssues ? [finding('info', 'github.issue.mirror.discovery.bounded', `Hosted issue mirror loaded a bounded first page of ${targets.length} issue target(s).`, { surface: 'issueSnapshots', maxIssues })] : [],
      errors: [],
      counts: { discovered: targets.length, targets: targets.length, warnings: targets.length >= maxIssues ? 1 : 0, errors: 0 },
      url: hosted.metadataUrl,
      transportTier: 'mirror'
    };
  } catch (error) {
    const warning = githubIssueFetchWarning(error, 'github.issue.mirror.unavailable', 'Hosted issue snapshot mirror is unavailable for this repository. Try proxy or direct transport, or provide explicit issue URLs.');
    return { schema: 'tiinex.github.issueSnapshot.discovery.v1', status: 'unavailable', targets: [], warnings: [warning], errors: [], counts: { discovered: 0, targets: 0, warnings: 1, errors: 0 }, url: error?.url || '', transportTier: 'mirror' };
  }
}

export async function materializeGithubIssueSnapshotsViaHostedMirror(issueUrlsOrTargets = '', options = {}) {
  const surfaceTransportTier = String(options.transportTier || 'mirror').trim() || 'mirror';
  const parsed = Array.isArray(issueUrlsOrTargets)
    ? { targets: issueUrlsOrTargets, errors: [], counts: { targets: issueUrlsOrTargets.length, errors: 0 } }
    : parseGithubIssueSnapshotTargets(issueUrlsOrTargets);
  const records = [];
  const warnings = [];
  const errors = [...parsed.errors];
  const targetResults = [];
  const maxComments = Math.max(0, Math.min(100, Number(options.maxComments ?? DEFAULT_ISSUE_SNAPSHOT_MAX_COMMENTS)));
  const indexCache = new Map();
  for (const target of parsed.targets) {
    await yieldToBrowserIfAvailable();
    const normalized = target.ok ? target : parseGithubIssueSnapshotTarget(target.canonicalUrl || target.html_url || target.url || '');
    if (!normalized.ok) {
      errors.push({ ref: target.input || target.url || '', error: normalized.error || 'invalid issue target' });
      targetResults.push(issueTargetResult(target, { status: 'failed', warningCode: 'invalid-issue-target', message: normalized.error || 'invalid issue target' }));
      continue;
    }
    if (normalized.kind === 'discussion') {
      const warning = finding('warning', 'github.discussion.reader.deferred', 'GitHub Discussion snapshots are not available through the hosted issue mirror yet; this target remains deferred.', { surface: 'issueSnapshots', url: normalized.canonicalUrl });
      warnings.push(warning);
      targetResults.push(issueTargetResult(normalized, { status: 'deferred', warningCode: warning.code }));
      continue;
    }
    try {
      const hosted = await loadHostedIssueSnapshotIndex(normalized.repository, Object.assign({}, options, { indexCache, preferredMetadataUrl: target.hostedSnapshot?.metadataUrl }));
      const snapshot = await loadHostedIssueSnapshotThread(hosted, normalized, Object.assign({}, options, { maxComments }));
      warnings.push(...(snapshot.warnings || []));
      const issueRecords = createGithubIssueSnapshotRecords(Object.assign({}, snapshot.issue, { target: normalized, comments: snapshot.comments, method: 'site-issue-snapshot' }), options);
      for (const record of issueRecords) {
        record.sourceTarget = Object.assign({
          schema: 'tiinex.source.material.target.v1',
          surface: 'issueSnapshots',
          targetKind: record.snapshot?.embedded ? `github-${normalized.kind}-embedded-artifact` : `github-${normalized.kind}-snapshot`,
          inputTarget: record.snapshot?.sourceUrl || normalized.canonicalUrl,
          transportTier: surfaceTransportTier,
          loaded: true
        }, record.sourceTarget || {});
        records.push(record);
      }
      targetResults.push(issueTargetResult(normalized, { status: 'loaded', records: issueRecords.length, transportTier: surfaceTransportTier }));
    } catch (error) {
      const warning = githubIssueFetchWarning(error, 'github.issue.mirror.fetch-failed', `Hosted issue mirror could not fetch ${normalized.canonicalUrl}; snapshot remains unavailable.`, { url: normalized.canonicalUrl });
      warnings.push(warning);
      targetResults.push(issueTargetResult(normalized, { status: 'failed', warningCode: warning.code, message: warning.message }));
    }
  }
  return { schema: 'tiinex.github.issueSnapshot.materialization.v1', records, warnings, errors, targetResults, counts: issueMaterializationCounts(parsed.counts.targets, records.length, warnings.length, errors.length, targetResults), transportTier: surfaceTransportTier };
}


function issueTargetResult(target = {}, patch = {}) {
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

function issueMaterializationCounts(targets = 0, records = 0, warnings = 0, errors = 0, targetResults = []) {
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

function hostedUnavailable(code, message) {
  return { schema: 'tiinex.github.issueSnapshot.discovery.v1', status: 'unavailable', targets: [], warnings: [finding('warning', code, message, { surface: 'issueSnapshots' })], errors: [], counts: { discovered: 0, targets: 0, warnings: 1, errors: 0 } };
}

async function loadHostedIssueSnapshotIndex(repo = '', options = {}) {
  const key = String(repo || '').toLowerCase();
  const cache = options.indexCache;
  if (cache?.has?.(key)) return cache.get(key);
  const candidates = hostedIssueSnapshotMetadataUrlCandidates(repo, options);
  if (options.preferredMetadataUrl) candidates.unshift(options.preferredMetadataUrl);
  const unique = [...new Set(candidates.filter(Boolean))];
  const errors = [];
  const hits = [];
  for (const metadataUrl of unique) {
    try {
      const meta = await hostedFetchJson(metadataUrl, options);
      if (!meta || meta.type !== 'tiinex.github.issues.snapshot' || !hostedRepoMatches(meta, repo)) throw new Error(`Hosted issue metadata did not match ${repo}.`);
      let manifest = meta;
      try {
        const manifestUrl = hostedResolve(metadataUrl, meta.manifest || `${String(meta.directory || '').trim() || `${repo.split('/')[1]}/`}manifest.json`);
        manifest = await hostedFetchJson(manifestUrl, options);
      } catch (_) {}
      const issues = hostedManifestIssues(meta, manifest, repo);
      hits.push({ metadataUrl, meta, manifest, issues, freshness: hostedFreshness(meta) });
    } catch (error) {
      errors.push({ metadataUrl, message: error?.message || String(error || '') });
    }
  }
  if (!hits.length) {
    const err = new Error(`Hosted issue snapshot unavailable for ${repo}.`);
    err.snapshotErrors = errors;
    err.url = unique[0] || '';
    throw err;
  }
  hits.sort((a, b) => Number(b.freshness || 0) - Number(a.freshness || 0));
  const selected = hits[0];
  const result = { repo, metadataUrl: selected.metadataUrl, meta: selected.meta, manifest: selected.manifest, issues: selected.issues };
  cache?.set?.(key, result);
  return result;
}

async function loadHostedIssueSnapshotThread(hosted = {}, target = {}, options = {}) {
  const entry = (hosted.issues || []).find((item) => Number(item.number || 0) === Number(target.number || 0)) || { number: target.number, issue: `issues/${target.number}/issue.json`, body: `issues/${target.number}/issue.md` };
  const directory = String(hosted.meta?.directory || '').trim();
  if (!directory) throw new Error(`Hosted issue snapshot metadata for ${target.repository} is missing directory.`);
  const baseUrl = hostedResolveDirectory(hosted.metadataUrl, directory);
  const issueJsonUrl = hostedResolve(baseUrl, entry.issue || `issues/${target.number}/issue.json`);
  const issueBodyUrl = hostedResolve(baseUrl, entry.body || `issues/${target.number}/issue.md`);
  const issueMeta = await hostedFetchJson(issueJsonUrl, options);
  const issueBody = await hostedFetchText(issueBodyUrl, options);
  if (!issueMeta.updated_at && entry.updated_at) issueMeta.updated_at = entry.updated_at;
  if (!issueMeta.updatedAt && entry.updated_at) issueMeta.updatedAt = entry.updated_at;
  const comments = [];
  const warnings = [];
  const maxComments = Math.max(0, Math.min(100, Number(options.maxComments ?? DEFAULT_ISSUE_SNAPSHOT_MAX_COMMENTS)));
  const refs = Array.isArray(issueMeta.comments) ? issueMeta.comments.slice(0, maxComments) : [];
  for (const ref of refs) {
    const commentJsonUrl = hostedResolve(issueJsonUrl, ref.json || `comments/${ref.id}.json`);
    const commentBodyUrl = hostedResolve(issueJsonUrl, ref.path || `comments/${ref.id}.md`);
    try {
      const commentMeta = await hostedFetchJson(commentJsonUrl, options);
      const commentBody = await hostedFetchText(commentBodyUrl, options);
      comments.push(Object.assign({}, commentMeta, { body: commentBody, html_url: commentMeta.html_url || ref.html_url || '' }));
    } catch (error) {
      warnings.push(githubIssueFetchWarning(error, 'github.issue.mirror.comment-fetch-failed', `Hosted issue mirror could not fetch a comment for ${target.canonicalUrl}; issue body still loaded.`, { url: error?.url || commentJsonUrl, targetUrl: target.canonicalUrl }));
    }
  }
  return { issue: Object.assign({}, issueMeta, { body: issueBody, html_url: issueMeta.html_url || target.canonicalUrl }), comments, warnings };
}

function hostedIssueSnapshotMetadataUrlCandidates(repo = '', options = {}) {
  const repoPath = String(repo || '').replace(/^\/+|\/+$/g, '');
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/u.test(repoPath)) return [];
  const relative = `issues/github.com/${repoPath}.json`;
  const bases = [];
  const addBase = (value) => {
    const clean = String(value || '').trim();
    if (!clean) return;
    try { bases.push(new URL(clean, typeof location !== 'undefined' ? location.href : 'https://example.invalid/').toString()); } catch (_) {}
  };
  (options.hostedIssueSnapshotBaseUrls || options.mirrorIssueSnapshotBaseUrls || []).forEach(addBase);
  if (typeof window !== 'undefined') {
    addBase(window.TIINEX_VIEWER_OPTIONS?.publicBaseUrl || window.TIINEX_VIEWER_OPTIONS?.viewerBaseUrl || window.TIINEX_VIEWER_OPTIONS?.shareBaseUrl || '');
  }
  if (typeof location !== 'undefined' && location.origin) addBase(`${location.origin}/`);
  const sourcePages = githubPagesDefaultBaseUrlForRepository(repoPath);
  if (sourcePages) addBase(sourcePages);
  return [...new Set(bases.map((base) => new URL(relative, base).toString()))];
}

function githubPagesDefaultBaseUrlForRepository(repo = '') {
  const parts = String(repo || '').split('/').filter(Boolean);
  if (parts.length !== 2) return '';
  const [owner, repository] = parts;
  if (!/^[A-Za-z0-9_.-]+$/u.test(owner || '') || !/^[A-Za-z0-9_.-]+$/u.test(repository || '')) return '';
  return `https://${owner.toLowerCase()}.github.io/${encodeURIComponent(repository)}/`;
}

function hostedManifestIssues(meta = {}, manifest = {}, repo = '') {
  const list = Array.isArray(manifest?.issues) ? manifest.issues : (Array.isArray(meta?.issues) ? meta.issues : []);
  return list.map((entry) => ({
    number: Number(entry?.number || 0),
    title: entry?.title || '',
    state: entry?.state || '',
    updated_at: entry?.updated_at || entry?.updatedAt || '',
    issue: entry?.issue || '',
    body: entry?.body || '',
    issueUrl: entry?.html_url || entry?.issueUrl || (Number(entry?.number || 0) > 0 && repo ? `https://github.com/${repo}/issues/${Number(entry.number)}` : '')
  })).filter((entry) => Number.isInteger(entry.number) && entry.number > 0 && entry.issueUrl && (!entry.state || String(entry.state).toLowerCase() === 'open')).sort((a, b) => Date.parse(b.updated_at || '') - Date.parse(a.updated_at || ''));
}

function hostedRepoMatches(meta = {}, repo = '') {
  const expected = String(repo || '').trim().toLowerCase();
  const metaRepo = String(meta?.repo || '').trim().toLowerCase();
  const repository = String(meta?.repository || '').replace(/^https?:\/\/github\.com\//iu, '').replace(/\/+$/u, '').toLowerCase();
  return Boolean(expected && (metaRepo === expected || repository === expected));
}

function hostedFreshness(meta = {}) {
  return [meta?.sourceUpdatedAt, meta?.source_updated_at, meta?.generatedAt, meta?.generated_at, meta?.updatedAt, meta?.updated_at]
    .map((value) => Date.parse(String(value || ''))).filter((value) => Number.isFinite(value)).sort((a, b) => b - a)[0] || 0;
}

function hostedResolve(baseUrl = '', rel = '') {
  const path = String(rel || '').trim().replace(/^\/+|\/+$/g, '');
  if (!path || path.split('/').includes('..') || path.includes('\\')) throw new Error(`Unsafe hosted issue snapshot path: ${rel}`);
  return new URL(path, baseUrl).toString();
}

function hostedResolveDirectory(baseUrl = '', rel = '') {
  const path = String(rel || '').trim().replace(/^\/+|\/+$/g, '');
  if (!path || path.split('/').includes('..') || path.includes('\\')) throw new Error(`Unsafe hosted issue snapshot directory: ${rel}`);
  return new URL(`${path}/`, baseUrl).toString();
}

async function hostedFetchJson(url, options = {}) {
  const res = await hostedFetchWithSourceCache(url, Object.assign({}, options, { resource: 'api-json', accept: 'application/json,*/*' }));
  if (!res?.ok) throw Object.assign(new Error(`Hosted issue snapshot ${res?.status || 0} ${res?.statusText || ''}`.trim()), { status: res?.status || 0, url });
  return await res.json();
}

async function hostedFetchText(url, options = {}) {
  const res = await hostedFetchWithSourceCache(url, Object.assign({}, options, { resource: 'raw-markdown', accept: 'text/markdown,text/plain,*/*' }));
  if (!res?.ok) throw Object.assign(new Error(`Hosted issue snapshot ${res?.status || 0} ${res?.statusText || ''}`.trim()), { status: res?.status || 0, url });
  return await res.text();
}

async function hostedFetchWithSourceCache(url, options = {}) {
  const resource = options.resource || 'source-resource';
  const cacheMode = String(options.cacheMode || '').trim().toLowerCase();
  const cached = readGithubSourceCacheEntry(url, resource, options);
  if (cached?.body != null && cacheMode !== 'refresh') {
    options.onTransportEvent?.({ tier: options.transportTier || 'cache', code: 'github.transport.cache.hit', severity: 'info', url, resource, status: 200 });
    return makeGithubSourceCacheResponse(cached.body, { url, tier: options.transportTier || 'cache', contentType: cached.contentType || '' });
  }
  if (cacheMode === 'cache-only') {
    options.onTransportEvent?.({ tier: options.transportTier || 'cache', code: 'github.transport.cache.miss', severity: 'info', url, resource, status: 404 });
    return makeGithubSourceCacheResponse('', { url, tier: options.transportTier || 'cache', status: 404, statusText: 'Source cache miss', contentType: resource === 'api-json' ? 'application/json' : 'text/plain' });
  }
  const fetchImpl = options.fetchImpl || (typeof fetch !== 'undefined' ? fetch : null);
  if (!fetchImpl) return makeGithubSourceCacheResponse('', { url, tier: options.transportTier || 'mirror', status: 503, statusText: 'Fetch unavailable', contentType: resource === 'api-json' ? 'application/json' : 'text/plain' });
  const res = await fetchImpl(url, { cache: 'no-cache', headers: { Accept: options.accept || '*/*' } });
  if (res?.ok) {
    const text = await responseTextForCache(res, resource);
    await writeGithubSourceCacheEntry(url, text, res.headers?.get?.('content-type') || (resource === 'api-json' ? 'application/json' : 'text/plain'), resource, options);
    return makeGithubSourceCacheResponse(text, { url, tier: options.transportTier || 'mirror', status: res.status || 200, statusText: res.statusText || 'OK', contentType: res.headers?.get?.('content-type') || (resource === 'api-json' ? 'application/json' : 'text/plain') });
  }
  return res;
}

async function responseTextForCache(res, resource = '') {
  if (typeof res?.text === 'function') {
    const text = await res.text();
    if (text != null) return String(text);
  }
  if (typeof res?.json === 'function') return JSON.stringify(await res.json());
  if (res?.body != null) return String(res.body);
  return resource === 'api-json' ? '{}' : '';
}


function yieldToBrowserIfAvailable() {
  if (typeof window === 'undefined') return Promise.resolve();
  return new Promise((resolve) => {
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(() => resolve(), { timeout: 80 });
      return;
    }
    if (typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(() => resolve());
      return;
    }
    window.setTimeout(resolve, 0);
  });
}
