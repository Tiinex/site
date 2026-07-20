import { AdapterAvailability, makeAdapterDefinition, makeAdapterResult } from '../adapter.contracts.js';
import { loadGithubFilesForSource } from '../../sources/github/github.loader.js';

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
    notes: ['Repo tree discovery is public/read-only and bounded. Auth, mirror cache, and issue reader are separate adapter slices.']
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
  const diagnostics = { transport: 'public-github-api/raw', explicitFileRefs: explicitRefs.length, discoveredFileRefs: 0 };
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
      warnings.push(githubDiscoveryWarning(error));
      diagnostics.discoveryUnavailable = true;
      diagnostics.discoveryError = String(error && error.message ? error.message : error);
    }
  }

  if (input.issueDiscovery || input.issueUrls) {
    warnings.push({ code: 'github.issue.reader.deferred', message: 'Issue/discussion snapshot reader is registered but not materialized in this adapter slice.' });
  }

  const sourceForLoad = Object.assign({}, source, { ref: resolvedRef });
  const unique = uniqueRefs(refs);
  const result = unique.length ? await loadGithubFilesForSource(sourceForLoad, unique, options) : { records: [], errors: [], okCount: 0, failCount: 0 };
  return makeAdapterResult({
    adapterId: GITHUB_ADAPTER_ID,
    sourceId: source?.id || '',
    records: result.records,
    errors: errors.concat(result.errors || []),
    warnings,
    okCount: result.okCount,
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
