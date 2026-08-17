import { parseArtifactMarkdown } from '../artifacts/artifact.parse.js';

export function declaredSchemaRecoveryTarget(record = {}, schemaId = '') {
  const href = declaredSchemaHref(record);
  if (!href) return { ok: false, reason: 'no-declared-target', schemaId };
  if (/^https?:\/\//i.test(href)) return absoluteSchemaTarget(href, schemaId);
  const source = record.source || {};
  const repo = String(source.repo || source.repository || source.config?.repo || '').trim();
  const ref = String(source.ref || source.config?.ref || '').trim();
  const sourcePath = String(record.sourceTarget?.sourceArtifactPath || record.sourcePath || record.path || '').trim();
  if (source.adapterId !== 'github' || !repo || !ref || !sourcePath) return { ok: false, reason: 'relative-target-without-verified-source', schemaId, href };
  const path = joinPath(dirname(sourcePath), href);
  if (!path) return { ok: false, reason: 'relative-target-invalid', schemaId, href };
  return githubSchemaTarget({ repo, ref, path, schemaId, declaredHref: href });
}

export async function recoverDeclaredSchemaEntry({ record = {}, schemaId = '', fetchImpl = globalThis.fetch } = {}) {
  const target = declaredSchemaRecoveryTarget(record, schemaId);
  if (!target.ok) return target;
  if (typeof fetchImpl !== 'function') return Object.assign({}, target, { ok: false, reason: 'fetch-unavailable' });
  try {
    const response = await fetchImpl(target.fetchUrl);
    if (!response?.ok) return Object.assign({}, target, { ok: false, reason: 'fetch-failed', status: response?.status || 0 });
    const markdown = await response.text();
    if (!String(markdown || '').trim()) return Object.assign({}, target, { ok: false, reason: 'empty-schema-body' });
    return Object.assign({}, target, { ok: true, markdown, path: target.path || target.fetchUrl });
  } catch (exception) {
    return Object.assign({}, target, { ok: false, reason: 'fetch-exception', exception });
  }
}

function declaredSchemaHref(record = {}) {
  const parsed = parseArtifactMarkdown(record.markdown || '');
  const raw = String(parsed.envelope?.current?.schema?.raw || '').trim();
  return raw.match(/^\[[^\]]+\]\(([^)]+)\)$/u)?.[1]?.trim() || '';
}

function absoluteSchemaTarget(href = '', schemaId = '') {
  try {
    const url = new URL(href);
    if (url.hostname === 'github.com') {
      const parts = url.pathname.split('/').filter(Boolean);
      const blob = parts[2] === 'blob';
      if (parts.length >= 5 && blob) return githubSchemaTarget({ repo: `${parts[0]}/${parts[1]}`, ref: parts[3], path: parts.slice(4).join('/'), schemaId, declaredHref: href });
    }
    if (url.hostname === 'raw.githubusercontent.com') {
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length >= 4) return githubSchemaTarget({ repo: `${parts[0]}/${parts[1]}`, ref: parts[2], path: parts.slice(3).join('/'), schemaId, declaredHref: href });
    }
    return {
      ok: true, schemaId, declaredHref: href, fetchUrl: href, browseUrl: href, path: href,
      source: { id: `schema-url:${href}`, label: url.hostname || 'Declared schema source', adapterId: 'http', sourceKind: 'http.file', kind: 'http-file', permalink: href, boundary: 'explicit Current Schema URL; source-backed reading contract', sourceBacked: true }
    };
  } catch { return { ok: false, reason: 'absolute-target-invalid', schemaId, href }; }
}

function githubSchemaTarget({ repo = '', ref = '', path = '', schemaId = '', declaredHref = '' } = {}) {
  const cleanPath = normalizePath(path);
  const encodedPath = cleanPath.split('/').map(encodeURIComponent).join('/');
  const fetchUrl = `https://raw.githubusercontent.com/${repo}/${encodeURIComponent(ref)}/${encodedPath}`;
  const browseUrl = `https://github.com/${repo}/blob/${encodeURIComponent(ref)}/${encodedPath}`;
  return {
    ok: true, schemaId, declaredHref, repo, ref, path: cleanPath, fetchUrl, browseUrl,
    source: {
      id: `github-exact:${repo.toLowerCase()}:${ref || 'default'}:${schemaRootPath(cleanPath)}`,
      label: repo,
      kind: 'github-tree', adapterId: 'github', sourceKind: 'github.repo', repo, repository: repo, ref, rootPath: schemaRootPath(cleanPath),
      boundary: 'configured exact-target GitHub source; broad discovery remains explicit', sourceBacked: true, loadable: true,
      repoDiscovery: false, issueDiscovery: false, issueUrls: '', explicitFileRefs: [cleanPath],
      config: { repo, ref, rootPath: schemaRootPath(cleanPath), issueUrls: '', explicitFileRefs: [cleanPath] },
      requestedSurfaces: { repoFiles: { requested: false }, explicitFiles: { requested: true, requestedCount: 1 }, issueSnapshots: { requested: false } },
      count: 1, recordCount: 1
    }
  };
}

function schemaRootPath(path = '') { const clean = normalizePath(path); return clean === '.topics' || clean.startsWith('.topics/') ? '.topics' : (clean.split('/').filter(Boolean)[0] || '.'); }

function normalizePath(value = '') {
  const out = [];
  for (const part of String(value || '').replace(/\\/g, '/').split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') out.pop(); else out.push(part);
  }
  return out.join('/');
}
function dirname(path = '') { const parts = normalizePath(path).split('/').filter(Boolean); parts.pop(); return parts.join('/'); }
function joinPath(...parts) { return normalizePath(parts.filter(Boolean).join('/')); }
