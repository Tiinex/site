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

function normalizeRefToRaw(source, ref) {
  const srcRepo = String(source?.repo || '').trim().toLowerCase();
  if (!srcRepo) throw new Error('source.repo missing');
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

  // Repo-relative path: safe normalization that avoids double-prefixing rootPath.
  const relative = trimmed.replace(/^\/+/, '');
  const root = String(source.rootPath || '').replace(/^\/+|\/+$/g, '');
  const path = relative.startsWith(root) || !root ? relative : `${root}/${relative}`;
  const [owner, repo] = srcRepo.split('/');
  const refBranch = String(source.ref || 'master');
  return `https://raw.githubusercontent.com/${owner}/${repo}/${refBranch}/${path}`;
}

export async function loadGithubFilesForSource(source, fileRefs = [], options = {}) {
  const fetchImpl = options.fetchImpl || (typeof fetch !== 'undefined' ? fetch : null);
  if (!fetchImpl) throw new Error('fetchImpl not available');
  const records = [];
  const errors = [];
  for (const ref of Array.isArray(fileRefs) ? fileRefs : []) {
    let rawUrl;
    try {
      rawUrl = normalizeRefToRaw(source, ref);
    } catch (e) {
      errors.push({ ref, error: String(e && e.message ? e.message : e) });
      continue;
    }
    if (!isHttps(rawUrl)) {
      errors.push({ ref, error: 'non-https URL' });
      continue;
    }
    try {
      const res = await fetchImpl(rawUrl, { cache: 'no-store' });
      if (!res || !res.ok) {
        errors.push({ ref, error: `${res?.status || 'ERR'} ${res?.statusText || ''}`.trim() });
        continue;
      }
      const markdown = await res.text();
      const name = rawUrl.split('/').pop() || ref;
      const rec = createRecordFromMarkdown(markdown, { path: rawUrl, name, sourceMode: 'github-source' });
      records.push(rec);
    } catch (e) {
      errors.push({ ref, error: String(e && e.message ? e.message : e) });
    }
  }
  return { records, errors, okCount: records.length, failCount: errors.length };
}
