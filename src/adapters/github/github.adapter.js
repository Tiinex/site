import { AdapterAvailability, makeAdapterDefinition, makeAdapterResult } from '../adapter.contracts.js';
import { loadGithubFilesForSource } from '../../sources/github/github.loader.js';
import { materializeGithubIssueSnapshotFixtures, parseGithubIssueSnapshotTargets } from './github.issueSnapshot.js';
import { authorizeSourceTransport } from '../../sources/transport.policy.js';

export const GITHUB_ADAPTER_ID = 'github';
const MARKDOWN_EXTENSIONS = /\.(md|markdown|trace\.md|schema\.md|validator\.md|workspace\.md)$/i;

export function createGithubAdapter() {
  return makeAdapterDefinition({
    id: GITHUB_ADAPTER_ID,
    label: 'GitHub',
    availability: AdapterAvailability.available,
    sourceKinds: ['github.repo', 'github.file', 'github.issue-snapshot'],
    capabilities: {
      registerSource: true,
      materialize: true,
      discover: true,
      resolveAsset: true,
      openExternal: true,
      requiresBridge: false
    },
    configShape: {
      repo: 'owner/name',
      ref: 'branch | tag | commit | empty means resolve public default branch',
      rootPath: 'one or more repo-relative root paths',
      fileRefs: 'explicit Markdown paths or raw/blob URLs'
    },
    boundary: 'explicit GitHub source boundary; public tree/raw/blob file reads only in browser viewer',
    notes: ['Repo tree discovery is public/read-only and bounded. Issue/discussion snapshots require explicit targets and are materialized only from supplied fixtures or a future reader slice.']
  });
}

function repoParts(source = {}) {
  const repo = String(source.repo || source.repository || '').trim();
  const parts = repo.split('/').filter(Boolean);
  if (parts.length < 2) throw new Error('source.repo missing or invalid');
  return { repo: `${parts[0]}/${parts[1]}`, owner: parts[0], name: parts[1] };
}

function rootPaths(source = {}) {
  return String(source.rootPath || '')
    .split(/\r?\n|,/)
    .map((item) => item.trim().replace(/^\.\//, '').replace(/^\/+/, '').replace(/\/+$/, ''))
    .filter((item) => item && item !== '.');
}

function underRoots(path, roots) {
  if (!roots.length) return true;
  return roots.some((root) => path === root || path.startsWith(root + '/'));
}

function isMarkdownPath(path) {
  return MARKDOWN_EXTENSIONS.test(String(path || ''));
}

async function fetchJson(url, fetchImpl) {
  const res = await fetchImpl(url, { cache: 'no-store', headers: { Accept: 'application/vnd.github+json' } });
  if (!res || !res.ok) {
    const status = res?.status || 'ERR';
    const statusText = res?.statusText || '';
    let bodyMessage = '';
    try {
      const body = await res.json();
      bodyMessage = body?.message ? String(body.message) : '';
    } catch (error) {
      bodyMessage = '';
    }
    const message = [String(status), statusText, bodyMessage].filter(Boolean).join(' ').trim();
    const err = new Error(message || 'GitHub API request failed');
    err.status = status;
    err.statusText = statusText;
    err.url = url;
    return Promise.reject(err);
  }
  return res.json();
}

function githubDiscoveryWarning(error) {
  const status = error?.status || null;
  const base = status ? `GitHub API ${status}` : 'GitHub API';
  let message = `${base} prevented repo discovery. Registering the source is still safe; use explicit file refs/raw URLs or try discovery later.`;
  let code = 'github.repo.discovery.unavailable';
  if (Number(status) === 403) {
    code = 'github.repo.discovery.rate-limited-or-forbidden';
    message = 'GitHub repo discovery is unavailable right now (API 403/rate-limit). Source was registered; add explicit file refs/raw URLs or try later.';
  } else if (Number(status) === 404) {
    code = 'github.repo.discovery.not-found';
    message = 'GitHub repo discovery did not find that repo/ref. Source was registered; verify repo/ref or use explicit raw/blob URLs.';
  }
  return {
    code,
    severity: 'warning',
    message,
    status,
    url: error?.url || ''
  };
}

export async function resolveGithubSourceRef(source, options = {}) {
  const fetchImpl = options.fetchImpl || (typeof fetch !== 'undefined' ? fetch : null);
  if (!fetchImpl) throw new Error('fetchImpl not available');
  const explicit = String(source?.ref || '').trim();
  if (explicit) return { ref: explicit, resolvedBy: 'source.ref' };
  const { owner, name } = repoParts(source);
  const data = await fetchJson(`https://api.github.com/repos/${owner}/${name}`, fetchImpl);
  const ref = String(data.default_branch || '').trim();
  if (!ref) throw new Error('default branch unavailable');
  return { ref, resolvedBy: 'github.repo.default_branch' };
}

export async function discoverGithubMarkdownRefs(source, options = {}) {
  const fetchImpl = options.fetchImpl || (typeof fetch !== 'undefined' ? fetch : null);
  if (!fetchImpl) throw new Error('fetchImpl not available');
  const maxFiles = Math.max(1, Number(options.maxFiles || 500));
  const { owner, name } = repoParts(source);
  const resolved = await resolveGithubSourceRef(source, { fetchImpl });
  const treeUrl = `https://api.github.com/repos/${owner}/${name}/git/trees/${encodeURIComponent(resolved.ref)}?recursive=1`;
  const tree = await fetchJson(treeUrl, fetchImpl);
  const roots = rootPaths(source);
  const refs = [];
  const warnings = [];
  for (const item of Array.isArray(tree.tree) ? tree.tree : []) {
    const path = String(item.path || '').replace(/^\/+/, '');
    if (item.type !== 'blob') continue;
    if (!underRoots(path, roots)) continue;
    if (!isMarkdownPath(path)) continue;
    refs.push(path);
    if (refs.length >= maxFiles) break;
  }
  refs.sort((a, b) => a.localeCompare(b));
  if (tree.truncated) warnings.push({ code: 'github.tree.truncated', message: 'GitHub tree response was truncated.' });
  const totalMarkdown = (Array.isArray(tree.tree) ? tree.tree : []).filter((item) => item.type === 'blob' && underRoots(String(item.path || ''), roots) && isMarkdownPath(item.path)).length;
  if (totalMarkdown > refs.length) warnings.push({ code: 'github.discovery.bounded', message: `Loaded first ${refs.length} of ${totalMarkdown} markdown files.` });
  return { refs, warnings, ref: resolved.ref, resolvedBy: resolved.resolvedBy, treeUrl, totalMarkdown };
}

function uniqueRefs(items = []) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const key = String(item || '').trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}

export async function materializeGithubSource(source, input = {}, options = {}) {
  const explicitRefs = Array.isArray(input.fileRefs) ? input.fileRefs : [];
  let refs = explicitRefs.slice();
  let resolvedRef = String(source?.ref || '').trim();
  const diagnostics = { transport: 'public-github-api/raw', explicitFileRefs: explicitRefs.length, discoveredFileRefs: 0, transportEvents: [] };
  const warnings = [];
  const errors = [];

  if (input.repoDiscovery) {
    try {
      const discovered = await discoverGithubMarkdownRefs(source, options);
      refs = refs.concat(discovered.refs);
      resolvedRef = discovered.ref || resolvedRef;
      diagnostics.discoveredFileRefs = discovered.refs.length;
      diagnostics.treeUrl = discovered.treeUrl;
      diagnostics.resolvedBy = discovered.resolvedBy;
      warnings.push(...(discovered.warnings || []));
    } catch (error) {
      const warning = githubDiscoveryWarning(error);
      warnings.push(warning);
      diagnostics.transportEvents.push(Object.assign({ adapterId: GITHUB_ADAPTER_ID, sourceId: source?.id || '', resultKind: 'repo-discovery' }, warning));
      diagnostics.discoveryUnavailable = true;
      diagnostics.discoveryError = String(error && error.message ? error.message : error);
    }
  }

  let issueSnapshotResult = { records: [], warnings: [], errors: [], counts: { targets: 0, records: 0, warnings: 0, errors: 0 } };
  if (input.issueDiscovery || input.issueUrls) {
    const parsedIssueTargets = parseGithubIssueSnapshotTargets(input.issueUrls || []);
    diagnostics.issueSnapshotTargets = parsedIssueTargets.counts.targets;
    if (parsedIssueTargets.errors.length) errors.push(...parsedIssueTargets.errors.map((entry) => Object.assign({ ref: entry.ref }, entry)));
    if (options.issueSnapshotFixtures && parsedIssueTargets.counts.targets) {
      issueSnapshotResult = materializeGithubIssueSnapshotFixtures(input.issueUrls || [], options.issueSnapshotFixtures);
      warnings.push(...issueSnapshotResult.warnings);
      errors.push(...issueSnapshotResult.errors);
      diagnostics.issueSnapshotRecords = issueSnapshotResult.records.length;
    } else if (parsedIssueTargets.counts.targets) {
      warnings.push({ code: 'github.issue.reader.deferred', severity: 'warning', message: 'Explicit GitHub issue/discussion targets were parsed, but snapshot fetching is deferred without fixtures or a future reader slice.' });
    }
  }

  const sourceForLoad = Object.assign({}, source, { ref: resolvedRef });
  const unique = uniqueRefs(refs);
  const policyInput = options.transportPolicy || (Number(options.maxRequestsPerOperation || options.maxRequestsPerSource || options.maxRequests || 0) > 0 || options.offline || options.cooldownUntil ? options : null);
  const authorization = policyInput ? authorizeSourceTransport({ kind: 'github.raw-file-load', sourceId: source?.id || '', adapterId: GITHUB_ADAPTER_ID, requestedRequests: unique.length }, policyInput) : null;
  let result = { records: [], errors: [], okCount: 0, failCount: 0, diagnostics: { requests: 0, transportEvents: [] } };
  if (authorization && !authorization.allowed) {
    diagnostics.transportPolicy = authorization;
    for (const issue of authorization.findings || []) {
      warnings.push({ code: issue.code, severity: issue.severity || 'warning', message: issue.message, sourceId: issue.sourceId || source?.id || '', adapterId: GITHUB_ADAPTER_ID, retryable: issue.retryable === true });
      diagnostics.transportEvents.push({ code: issue.code, severity: issue.severity || 'warning', message: issue.message, sourceId: issue.sourceId || source?.id || '', adapterId: GITHUB_ADAPTER_ID, resultKind: 'transport-policy', retryable: issue.retryable === true });
    }
  } else {
    result = unique.length ? await loadGithubFilesForSource(sourceForLoad, unique, options) : result;
  }
  diagnostics.requests = Number(result.diagnostics?.requests || 0);
  diagnostics.transportEvents = diagnostics.transportEvents.concat(result.diagnostics?.transportEvents || []);
  const records = result.records.concat(issueSnapshotResult.records || []);
  return makeAdapterResult({
    adapterId: GITHUB_ADAPTER_ID,
    sourceId: source?.id || '',
    records,
    errors: errors.concat(result.errors || []),
    warnings,
    okCount: (result.okCount || 0) + (issueSnapshotResult.records?.length || 0),
    failCount: errors.length + (result.failCount || 0),
    diagnostics: Object.assign(diagnostics, {
      fileRefs: unique.length,
      resolvedRef
    })
  });
}

export async function materializeGithubFiles(source, fileRefs = [], options = {}) {
  return materializeGithubSource(source, { fileRefs, repoDiscovery: false }, options);
}
