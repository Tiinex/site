import { createRecordFromMarkdown } from '../../artifacts/artifact.record.js';

function isHttps(url) {
  return /^https:\/\//i.test(url);
}

function normalizeLoadTarget(item, index = 0) {
  if (item && typeof item === 'object') {
    const ref = String(item.ref || item.path || item.url || item.target || '').trim();
    return {
      ref,
      surface: String(item.surface || item.sourceSurface || 'explicitFiles').trim() || 'explicitFiles',
      targetKind: String(item.targetKind || item.kind || 'github-markdown').trim() || 'github-markdown',
      inputTarget: String(item.inputTarget || item.original || item.ref || ref).trim() || ref,
      targetIndex: Number.isFinite(Number(item.targetIndex)) ? Number(item.targetIndex) : index
    };
  }
  const ref = String(item || '').trim();
  return { ref, surface: 'explicitFiles', targetKind: 'github-markdown', inputTarget: ref, targetIndex: index };
}

function targetAttribution(target = {}) {
  return {
    surface: target.surface || 'explicitFiles',
    targetKind: target.targetKind || 'github-markdown',
    inputTarget: target.inputTarget || target.ref || '',
    targetIndex: Number.isFinite(Number(target.targetIndex)) ? Number(target.targetIndex) : 0
  };
}

function toRawFromBlobUrl(url) {
  // https://github.com/:owner/:repo/blob/:ref/:path -> https://raw.githubusercontent.com/:owner/:repo/:ref/:path
  const u = new URL(url);
  const parts = u.pathname.split('/').filter(Boolean);
  // parts: [owner, repo, 'blob', ref, ...path]
  if (parts.length < 5) throw new Error('invalid blob URL');
  const owner = parts[0];
  const repo = parts[1];
  const ref = parts[3];
  const path = parts.slice(4).join('/');
  return `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${path}`;
}

function rootPaths(source) {
  return String(source?.rootPath || '')
    .split(/\r?\n|,/)
    .map((item) => item.trim().replace(/^\.\//, '').replace(/^\/+/, '').replace(/\/+$/, ''))
    .filter((item) => item && item !== '.');
}

function sourceRepo(source) {
  const srcRepo = String(source?.repo || source?.repository || '').trim().toLowerCase();
  if (!srcRepo) throw new Error('source.repo missing');
  return srcRepo;
}

function normalizeRelativePath(source, ref) {
  const relative = String(ref || '').trim().replace(/^\/+/, '').replace(/\\/g, '/').replace(/\/{2,}/g, '/');
  const roots = rootPaths(source);
  if (!roots.length) return relative;
  const matchingRoot = roots.find((root) => relative === root || relative.startsWith(root + '/')) || roots[0];
  return relative === matchingRoot || relative.startsWith(matchingRoot + '/') ? relative : `${matchingRoot}/${relative}`;
}

export function normalizeGithubRefToRaw(source, ref) {
  const srcRepo = sourceRepo(source);
  const trimmed = String(ref || '').trim();
  if (!trimmed) throw new Error('empty ref');

  // Absolute URL handling: explicitly reject unsupported hosts or non-https.
  const looksAbsolute = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed);
  if (looksAbsolute) {
    const u = new URL(trimmed);
    if (u.protocol !== 'https:') throw new Error('non-https URL');
    if (u.hostname === 'raw.githubusercontent.com') {
      const parts = u.pathname.split('/').filter(Boolean);
      if (parts.length < 4) throw new Error('invalid raw GitHub URL');
      const ownerRepo = `${parts[0]}/${parts[1]}`.toLowerCase();
      if (ownerRepo !== srcRepo) throw new Error('cross-repo URL not allowed');
      return u.href;
    }
    if (u.hostname === 'github.com' && /\/blob\//.test(u.pathname)) {
      const raw = toRawFromBlobUrl(u.href);
      const parts = new URL(raw).pathname.split('/').filter(Boolean);
      const ownerRepo = `${parts[0]}/${parts[1]}`.toLowerCase();
      if (ownerRepo !== srcRepo) throw new Error('cross-repo blob URL not allowed');
      return raw;
    }
    // Explicit absolute URL but unsupported host: reject.
    throw new Error('unsupported host');
  }

  const sourceRef = String(source.ref || '').trim();
  if (!sourceRef) throw new Error('source.ref missing for repo-relative path');
  const path = normalizeRelativePath(source, trimmed);
  const [owner, repo] = srcRepo.split('/');
  return `https://raw.githubusercontent.com/${owner}/${repo}/${sourceRef}/${path}`;
}


function exactCommitFromRawUrl(url = '') {
  try {
    const parts = new URL(url).pathname.split('/').filter(Boolean);
    const ref = parts[2] || '';
    return /^[0-9a-f]{40}$/i.test(ref) ? ref : '';
  } catch (_) { return ''; }
}

export async function loadGithubFilesForSource(source, fileRefs = [], options = {}) {
  const fetchImpl = options.fetchImpl || (typeof fetch !== 'undefined' ? fetch : null);
  if (!fetchImpl) throw new Error('fetchImpl not available');
  const refs = (Array.isArray(fileRefs) ? fileRefs : []).map((item, index) => normalizeLoadTarget(item, index));
  const total = refs.length;
  const concurrency = Math.max(1, Math.min(Number(options.concurrency || options.maxConcurrency || 8) || 8, 12, Math.max(total, 1)));
  const recordsByIndex = new Array(total);
  const errorsByIndex = new Array(total);
  const transportEvents = [];
  let requests = 0;
  let nextIndex = 0;
  let completed = 0;
  let lastReported = -1;

  const report = (loaded, labelPrefix = 'Loaded') => {
    if (typeof options.onProgress !== 'function') return;
    if (loaded === lastReported && loaded !== 0 && loaded !== total) return;
    if (loaded !== 0 && loaded !== total && loaded % 10 !== 0) return;
    lastReported = loaded;
    options.onProgress({
      phase: 'raw-file-load',
      loaded,
      total,
      percent: total ? Math.min(92, 40 + Math.round((loaded / total) * 50)) : 90,
      label: `${labelPrefix} GitHub Markdown ${loaded}/${total}`
    });
  };

  const loadOne = async (index) => {
    const target = refs[index];
    const ref = target.ref;
    let rawUrl;
    try {
      rawUrl = normalizeGithubRefToRaw(source, ref);
    } catch (e) {
      const message = String(e && e.message ? e.message : e);
      errorsByIndex[index] = Object.assign({ ref, error: message }, targetAttribution(target));
      transportEvents.push(Object.assign({ ref, code: 'github.raw.ref.invalid', severity: 'error', message }, targetAttribution(target)));
      return;
    }
    if (!isHttps(rawUrl)) {
      errorsByIndex[index] = Object.assign({ ref, error: 'non-https URL' }, targetAttribution(target));
      transportEvents.push(Object.assign({ ref, code: 'github.raw.non-https', severity: 'error', message: 'non-https URL' }, targetAttribution(target)));
      return;
    }
    try {
      requests += 1;
      const res = await fetchImpl(rawUrl, {});
      if (!res || !res.ok) {
        const message = `${res?.status || 'ERR'} ${res?.statusText || ''}`.trim();
        errorsByIndex[index] = Object.assign({ ref, error: message }, targetAttribution(target));
        transportEvents.push(Object.assign({ ref, url: rawUrl, status: res?.status || 0, code: 'github.raw.fetch.failed', severity: 'error', message }, targetAttribution(target)));
        return;
      }
      const markdown = await res.text();
      const name = rawUrl.split('/').pop() || ref;
      const sourceTarget = Object.assign({
        schema: 'tiinex.source.material.target.v1',
        rawUrl,
        materializedCommit: exactCommitFromRawUrl(rawUrl),
        transportTier: res.transportTier || '',
        loaded: true
      }, targetAttribution(target));
      recordsByIndex[index] = Object.assign(createRecordFromMarkdown(markdown, { path: rawUrl, name, sourceMode: 'github-source' }), { sourceTarget });
      transportEvents.push(Object.assign({ ref, url: rawUrl, tier: res.transportTier || '', code: 'github.raw.record.loaded', severity: 'info' }, targetAttribution(target)));
    } catch (e) {
      const message = String(e && e.message ? e.message : e);
      errorsByIndex[index] = Object.assign({ ref, error: message }, targetAttribution(target));
      transportEvents.push(Object.assign({ ref, url: rawUrl || '', code: 'github.raw.fetch.exception', severity: 'error', message }, targetAttribution(target)));
    }
  };

  const worker = async () => {
    for (;;) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= total) return;
      await loadOne(index);
      completed += 1;
      report(completed);
    }
  };

  if (total) report(0, 'Starting');
  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  const records = recordsByIndex.filter(Boolean);
  const errors = errorsByIndex.filter(Boolean);
  return {
    records,
    errors,
    okCount: records.length,
    failCount: errors.length,
    diagnostics: { requests, concurrency, transportEvents }
  };
}
