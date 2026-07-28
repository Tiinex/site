import { createRecordFromMarkdown } from '../../artifacts/artifact.record.js';
import { zipBufferToImportEntries } from '../archive/archive.adapter.js';
import { githubRawUrlForSourcePath, readGithubSourceCacheEntry, writeGithubSourceCacheEntry } from '../../sources/github/github.transport.js';
import { governanceBoundaryFromRootFiles } from '../../governance/governance.boundary.js';

const MARKDOWN_RE = /(?:\.md|\.markdown|\.trace\.md|\.schema\.md|\.validator\.md|\.workspace\.md)$/i;

export async function materializeGithubRepoFilesFromSourceCache(source = {}, options = {}) {
  const manifest = readRepoDiscoveryManifest(source, options);
  if (!manifest?.refs?.length || !manifest.ref) return emptyRepoMirrorResult('cache', 'github.repo.cache.miss', 'No complete cached repo-file manifest was available for this source.');
  const sourceForRaw = Object.assign({}, source, { ref: manifest.ref });
  const records = [];
  const missing = [];
  for (const ref of manifest.refs || []) {
    const rawUrl = githubRawUrlForSourcePath(sourceForRaw, ref);
    const cached = readGithubSourceCacheEntry(rawUrl, 'raw-markdown', options);
    if (!cached?.body) {
      missing.push(ref);
      continue;
    }
    records.push(recordFromRepoMarkdown(cached.body, sourceForRaw, ref, rawUrl, 'cache'));
  }
  if (!records.length || missing.length) {
    return emptyRepoMirrorResult('cache', 'github.repo.cache.incomplete', `Cached repo-file material is incomplete (${records.length}/${manifest.refs.length} available).`, { missing });
  }
  return {
    schema: 'tiinex.github.repoFiles.materialization.v1',
    transportTier: 'cache',
    ref: manifest.ref,
    records,
    warnings: [],
    errors: [],
    counts: { records: records.length, loaded: records.length, failed: 0, discovered: manifest.refs.length },
    diagnostics: { manifestUrl: repoDiscoveryCacheUrl(sourceForRaw), transportEvents: [{ tier: 'cache', code: 'github.repo.cache.hit', severity: 'info', resource: 'repo-files', loaded: records.length }] }
  };
}

export async function materializeGithubRepoFilesViaHostedMirror(source = {}, options = {}) {
  const repoRaw = String(source.repo || source.repository || '').trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '').replace(/^\/+|\/+$/g, '').split('/').slice(0, 2).join('/');
  const repo = normalizeRepo(repoRaw);
  const fetchImpl = options.fetchImpl || (typeof fetch !== 'undefined' ? fetch : null);
  if (!repo || !fetchImpl) return emptyRepoMirrorResult('mirror', 'github.repo.mirror.unavailable', 'Hosted repository mirror is unavailable without a repository and fetch implementation.');
  const candidates = hostedRepoMirrorMetadataUrlCandidates(repo, options, repoRaw);
  const errors = [];
  for (const metadataUrl of candidates) {
    try {
      const meta = await fetchJson(metadataUrl, fetchImpl, 'mirror', options);
      if (!repoMatches(meta, repo)) throw new Error(`Repository mirror metadata did not match ${repo}.`);
      const archiveUrl = resolveArchiveUrl(metadataUrl, meta);
      if (!archiveUrl) throw new Error('Repository mirror metadata did not contain an archive URL.');
      const archiveBuffer = await fetchArrayBuffer(archiveUrl, fetchImpl, 'mirror', options);
      const imported = await zipBufferToImportEntries(archiveBuffer, { source: 'github-repository-mirror', excludeRepositoryInternals: true });
      const ref = String(meta.commit || meta.ref || source.ref || '').trim();
      const sourceForRaw = Object.assign({}, source, { ref });
      const roots = rootPaths(source);
      const governanceRootFiles = governanceRootFilesFromMirrorEntries(imported.entries || [], sourceForRaw, meta);
      for (const file of governanceRootFiles) {
        if (file?.url && file?.text) await writeGithubSourceCacheEntry(file.url, file.text, 'text/markdown; charset=utf-8', 'raw-markdown', options);
      }
      const governanceBoundary = governanceBoundaryFromRootFiles(sourceForRaw, governanceRootFiles, { rootChecked: true, discoveredFrom: 'repo-mirror-archive' });
      const records = [];
      const refs = [];
      for (const entry of imported.entries || []) {
        const path = repoMirrorEntryPath(entry.path || '', meta, roots);
        if (!path || typeof entry.content !== 'string') continue;
        const rawUrl = githubRawUrlForSourcePath(sourceForRaw, path);
        records.push(recordFromRepoMarkdown(entry.content, sourceForRaw, path, rawUrl, 'mirror'));
        refs.push(path);
        await writeGithubSourceCacheEntry(rawUrl, entry.content, 'text/markdown; charset=utf-8', 'raw-markdown', options);
      }
      refs.sort((a, b) => a.localeCompare(b));
      if (records.length) await writeRepoDiscoveryManifest(sourceForRaw, refs, options);
      return {
        schema: 'tiinex.github.repoFiles.materialization.v1',
        transportTier: 'mirror',
        ref,
        records,
        warnings: imported.warnings || [],
        errors: imported.errors || [],
        counts: { records: records.length, loaded: records.length, failed: 0, discovered: refs.length },
        diagnostics: { metadataUrl, archiveUrl, governanceBoundary, transportEvents: [{ tier: 'mirror', code: 'github.repo.mirror.ok', severity: 'info', url: metadataUrl, resource: 'repo-snapshot', loaded: records.length }] },
        governanceBoundary
      };
    } catch (error) {
      errors.push({ metadataUrl, message: error?.message || String(error || '') });
    }
  }
  return emptyRepoMirrorResult('mirror', 'github.repo.mirror.unavailable', 'Hosted repository mirror did not materialize repo files.', { errors });
}

export async function writeGithubRepoDiscoveryCache(source = {}, refs = [], options = {}) {
  return writeRepoDiscoveryManifest(source, refs, options);
}

function governanceRootFilesFromMirrorEntries(entries = [], source = {}, meta = {}) {
  const out = [];
  for (const entry of entries || []) {
    const path = repoMirrorRootEntryPath(entry?.path || '', meta);
    if (!path || typeof entry?.content !== 'string') continue;
    out.push({ path, kind: path, text: entry.content, url: githubRawUrlForSourcePath(source, path) });
  }
  return out;
}

function repoMirrorRootEntryPath(path = '', meta = {}) {
  const candidates = [stripArchivePrefix(path, meta), stripFirstArchiveSegment(path)];
  for (const candidate of candidates) {
    const clean = String(candidate || '').replace(/^\/+/, '').replace(/\\/g, '/');
    if (clean && !clean.includes('/')) return clean;
  }
  return '';
}

function recordFromRepoMarkdown(markdown = '', source = {}, path = '', rawUrl = '', tier = '') {
  const name = String(path || rawUrl).split('/').pop() || 'source.md';
  return Object.assign(createRecordFromMarkdown(markdown, { path: rawUrl || path, name, sourceMode: 'github-source' }), {
    sourceTarget: {
      schema: 'tiinex.source.material.target.v1',
      surface: 'repoFiles',
      targetKind: tier === 'mirror' ? 'repo-mirror-markdown' : tier === 'cache' ? 'repo-cache-markdown' : 'repo-markdown',
      inputTarget: path,
      targetIndex: 0,
      rawUrl,
      sourceArtifactPath: path,
      transportTier: tier,
      loaded: true
    }
  });
}

function emptyRepoMirrorResult(tier = '', code = '', message = '', extra = {}) {
  return {
    schema: 'tiinex.github.repoFiles.materialization.v1',
    transportTier: tier,
    records: [],
    warnings: [{ code, severity: tier === 'cache' ? 'info' : 'warning', surface: 'repoFiles', transportTier: tier, message }],
    errors: [],
    counts: { records: 0, loaded: 0, failed: 0, discovered: 0 },
    diagnostics: Object.assign({ transportEvents: [{ tier, code, severity: tier === 'cache' ? 'info' : 'warning', resource: 'repo-files', message }] }, extra || {})
  };
}

function repoDiscoveryCacheUrl(source = {}) {
  const repo = normalizeRepo(source.repo || source.repository || '');
  const ref = String(source.ref || '').trim();
  const roots = rootPaths(source).join(',') || '.topics';
  return `tiinex://github-repo-discovery/${repo}?ref=${encodeURIComponent(ref)}&roots=${encodeURIComponent(roots)}`;
}

function readRepoDiscoveryManifest(source = {}, options = {}) {
  const entry = readGithubSourceCacheEntry(repoDiscoveryCacheUrl(source), 'repo-discovery-json', options);
  if (!entry?.body) return null;
  try { return JSON.parse(entry.body); } catch (_) { return null; }
}

async function writeRepoDiscoveryManifest(source = {}, refs = [], options = {}) {
  const manifest = { schema: 'tiinex.github.repoFiles.cache.v1', repo: normalizeRepo(source.repo || source.repository || ''), ref: String(source.ref || '').trim(), rootPath: source.rootPath || '', refs: Array.from(new Set((refs || []).filter(Boolean))).sort() };
  if (!manifest.repo || !manifest.ref || !manifest.refs.length) return false;
  return writeGithubSourceCacheEntry(repoDiscoveryCacheUrl(source), JSON.stringify(manifest), 'application/json', 'repo-discovery-json', options);
}

function hostedRepoMirrorMetadataUrlCandidates(repo = '', options = {}, rawRepo = '') {
  const repoPaths = Array.from(new Set([rawRepo, repo].map((item) => String(item || '').replace(/^\/+|\/+$/g, '')).filter(Boolean)));

  const bases = [];
  const addBase = (value) => {
    const clean = String(value || '').trim();
    if (!clean) return;
    try { bases.push(new URL(clean, typeof location !== 'undefined' ? location.href : 'https://example.invalid/').toString()); } catch (_) {}
  };
  (options.hostedRepoMirrorBaseUrls || options.repositoryMirrorBaseUrls || []).forEach(addBase);
  if (typeof window !== 'undefined') addBase(window.TIINEX_VIEWER_OPTIONS?.publicBaseUrl || window.TIINEX_VIEWER_OPTIONS?.viewerBaseUrl || window.TIINEX_VIEWER_OPTIONS?.shareBaseUrl || '');
  if (typeof location !== 'undefined' && location.origin) addBase(`${location.origin}/`);
  const sourcePages = githubPagesDefaultBaseUrlForRepository(rawRepo || repo);
  if (sourcePages) addBase(sourcePages);
  const urls = [];
  for (const base of bases) {
    for (const repoPath of repoPaths) {
      urls.push(new URL(`.mirrors/github.com/${repoPath}.json`, base).toString());
      urls.push(new URL(`mirrors/github.com/${repoPath}.json`, base).toString());
    }
  }
  return [...new Set(urls)];
}

function githubPagesDefaultBaseUrlForRepository(repo = '') {
  const [owner, repository] = String(repo || '').split('/').filter(Boolean);
  if (!owner || !repository) return '';
  return `https://${owner.toLowerCase()}.github.io/${encodeURIComponent(repository)}/`;
}

async function fetchJson(url, fetchImpl, tier, options = {}) {
  const cached = readGithubSourceCacheEntry(url, 'api-json', options);
  if (cached?.body && options.cacheMode !== 'refresh') return JSON.parse(cached.body || '{}');
  const res = await fetchImpl(url, { cache: 'no-cache', headers: { Accept: 'application/json,*/*' } });
  if (!res?.ok) throw Object.assign(new Error(`Repository mirror metadata ${res?.status || 0} ${res?.statusText || ''}`.trim()), { status: res?.status || 0, url });
  const text = typeof res.clone === 'function' ? await res.clone().text() : JSON.stringify(await res.json());
  await writeGithubSourceCacheEntry(url, text, 'application/json', 'api-json', options);
  return JSON.parse(text || '{}');
}

async function fetchArrayBuffer(url, fetchImpl, tier, options = {}) {
  const res = await fetchImpl(url, { cache: 'no-cache', headers: { Accept: 'application/zip,application/octet-stream,*/*' } });
  if (!res?.ok) throw Object.assign(new Error(`Repository mirror archive ${res?.status || 0} ${res?.statusText || ''}`.trim()), { status: res?.status || 0, url });
  return await res.arrayBuffer();
}

function resolveArchiveUrl(metadataUrl = '', meta = {}) {
  const archive = String(meta.archive || meta.archiveUrl || meta.zip || '').trim();
  if (!archive) return '';
  try { return new URL(archive, metadataUrl).toString(); } catch (_) { return ''; }
}

function repoMatches(meta = {}, repo = '') {
  const expected = normalizeRepo(repo);
  const actual = normalizeRepo(meta.repository || meta.repo || '');
  return Boolean(expected && actual && expected === actual && (!meta.type || meta.type === 'tiinex.repository.snapshot'));
}

function stripArchivePrefix(path = '', meta = {}) {
  let clean = String(path || '').replace(/^\/+/, '').replace(/\\/g, '/');
  const prefixes = [meta.prefix, meta.root, meta.archiveRoot, meta.directory].map((item) => String(item || '').replace(/^\/+|\/+$/g, '')).filter(Boolean);
  for (const prefix of prefixes) if (clean.startsWith(prefix + '/')) clean = clean.slice(prefix.length + 1);
  return clean;
}


function repoMirrorEntryPath(path = '', meta = {}, roots = []) {
  const candidates = [stripArchivePrefix(path, meta), stripFirstArchiveSegment(path)];
  for (const candidate of candidates) {
    const clean = String(candidate || '').replace(/^\/+/, '').replace(/\\/g, '/');
    if (clean && MARKDOWN_RE.test(clean) && underRoots(clean, roots)) return clean;
  }
  return '';
}

function stripFirstArchiveSegment(path = '') {
  const clean = String(path || '').replace(/^\/+/, '').replace(/\\/g, '/');
  const parts = clean.split('/').filter(Boolean);
  return parts.length > 1 ? parts.slice(1).join('/') : clean;
}

function rootPaths(source = {}) {
  return String(source.rootPath || '.topics').split(/\r?\n|,/).map((item) => item.trim().replace(/^\.\//, '').replace(/^\/+/, '').replace(/\/+$/, '')).filter(Boolean);
}

function underRoots(path = '', roots = []) {
  if (!roots.length) return true;
  return roots.some((root) => path === root || path.startsWith(root + '/'));
}

function normalizeRepo(value = '') {
  return String(value || '').trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '').replace(/^\/+|\/+$/g, '').split('/').slice(0, 2).join('/').toLowerCase();
}
