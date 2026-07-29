import { governanceBoundaryFromRootFiles, isGovernanceNoticePath, isGovernancePolicyPath } from '../../governance/governance.boundary.js';

const MARKDOWN_EXTENSIONS = /\.(md|markdown|trace\.md|schema\.md|validator\.md|workspace\.md)$/i;

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

function workspaceMatchPatterns(source = {}, options = {}) {
  return String(options.workspaceMatch || source.workspaceMatch || source.match || '')
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function matchesGithubWorkspacePattern(path = '', patterns = []) {
  const clean = String(path || '').replace(/^\/+/, '').replace(/\\/g, '/');
  if (!patterns || !patterns.length) return true;
  const name = clean.split('/').filter(Boolean).pop() || clean;
  return patterns.some((pattern) => {
    const raw = String(pattern || '').trim().replace(/^\.\//, '');
    if (!raw) return true;
    const target = raw.includes('/') ? clean : name;
    return globToRegExp(raw).test(target);
  });
}

function globToRegExp(pattern = '') {
  const source = String(pattern || '')
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '\u0000')
    .replace(/\*/g, '[^/]*')
    .replace(/\?/g, '[^/]')
    .replace(/\u0000/g, '.*');
  return new RegExp(`^${source}$`, 'i');
}

async function fetchJson(url, fetchImpl) {
  const res = await fetchImpl(url, { headers: { Accept: 'application/vnd.github+json' } });
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
  const patterns = workspaceMatchPatterns(source, options);
  const refs = [];
  const warnings = [];
  const governanceRootFiles = [];
  for (const item of Array.isArray(tree.tree) ? tree.tree : []) {
    const path = String(item.path || '').replace(/^\/+/, '');
    if (item.type !== 'blob') continue;
    if (!path.includes('/') && (isGovernancePolicyPath(path) || isGovernanceNoticePath(path))) governanceRootFiles.push({ path, kind: path });
    if (!underRoots(path, roots)) continue;
    if (!isMarkdownPath(path)) continue;
    if (!matchesGithubWorkspacePattern(path, patterns)) continue;
    if (refs.length < maxFiles) refs.push(path);
  }
  refs.sort((a, b) => a.localeCompare(b));
  if (tree.truncated) warnings.push({ code: 'github.tree.truncated', message: 'GitHub tree response was truncated.' });
  const totalMarkdown = (Array.isArray(tree.tree) ? tree.tree : []).filter((item) => item.type === 'blob' && underRoots(String(item.path || ''), roots) && isMarkdownPath(item.path) && matchesGithubWorkspacePattern(String(item.path || ''), patterns)).length;
  if (totalMarkdown > refs.length) warnings.push({ code: 'github.discovery.bounded', message: `Loaded first ${refs.length} of ${totalMarkdown} markdown files.` });
  return { refs, warnings, ref: resolved.ref, resolvedBy: resolved.resolvedBy, treeUrl, totalMarkdown, governanceBoundary: governanceBoundaryFromRootFiles(Object.assign({}, source, { ref: resolved.ref }), governanceRootFiles, { rootChecked: true, discoveredFrom: 'github-tree-root-manifest' }) };
}
