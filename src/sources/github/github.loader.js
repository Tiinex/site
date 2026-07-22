import { createRecordFromMarkdown } from '../../artifacts/artifact.record.js';

function isHttps(url) {
  return /^https:\/\//i.test(url);
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

export async function loadGithubFilesForSource(source, fileRefs = [], options = {}) {
  const fetchImpl = options.fetchImpl || (typeof fetch !== 'undefined' ? fetch : null);
  if (!fetchImpl) throw new Error('fetchImpl not available');
  const records = [];
  const errors = [];
  const transportEvents = [];
  let requests = 0;
  const refs = Array.isArray(fileRefs) ? fileRefs : [];
  const total = refs.length;
  for (let index = 0; index < refs.length; index += 1) {
    const ref = refs[index];
    let rawUrl;
    if (typeof options.onProgress === 'function' && (index === 0 || index % 10 === 0 || index === total - 1)) {
      options.onProgress({ phase: 'raw-file-load', loaded: index, total, percent: total ? Math.min(88, 40 + Math.round((index / total) * 48)) : 40, label: `Loading GitHub Markdown ${Math.min(index + 1, total)}/${total}` });
    }
    try {
      rawUrl = normalizeGithubRefToRaw(source, ref);
    } catch (e) {
      const message = String(e && e.message ? e.message : e);
      errors.push({ ref, error: message });
      transportEvents.push({ ref, code: 'github.raw.ref.invalid', severity: 'error', message });
      continue;
    }
    if (!isHttps(rawUrl)) {
      errors.push({ ref, error: 'non-https URL' });
      transportEvents.push({ ref, code: 'github.raw.non-https', severity: 'error', message: 'non-https URL' });
      continue;
    }
    try {
      requests += 1;
      const res = await fetchImpl(rawUrl, { cache: 'no-store' });
      if (!res || !res.ok) {
        const message = `${res?.status || 'ERR'} ${res?.statusText || ''}`.trim();
        errors.push({ ref, error: message });
        transportEvents.push({ ref, url: rawUrl, status: res?.status || 0, code: 'github.raw.fetch.failed', severity: 'error', message });
        continue;
      }
      const markdown = await res.text();
      const name = rawUrl.split('/').pop() || ref;
      const rec = createRecordFromMarkdown(markdown, { path: rawUrl, name, sourceMode: 'github-source' });
      records.push(rec);
    } catch (e) {
      const message = String(e && e.message ? e.message : e);
      errors.push({ ref, error: message });
      transportEvents.push({ ref, url: rawUrl || '', code: 'github.raw.fetch.exception', severity: 'error', message });
    }
    if (typeof options.onProgress === 'function' && ((index + 1) % 10 === 0 || index === total - 1)) {
      options.onProgress({ phase: 'raw-file-load', loaded: index + 1, total, percent: total ? Math.min(92, 40 + Math.round(((index + 1) / total) * 50)) : 90, label: `Loaded GitHub Markdown ${index + 1}/${total}` });
    }
  }
  return { records, errors, okCount: records.length, failCount: errors.length, diagnostics: { requests, transportEvents } };
}
