export function lineageBasePathForNode(node = {}) {
  return lineageBasePathForRecord(node?.record || { path: node?.path || '' }, node?.path || '');
}

export function lineageBasePathForRecord(record = {}, fallbackPath = '') {
  const recordPath = firstNonEmpty(fallbackPath, record.path);
  const sourcePath = firstNonEmpty(record.sourceTarget?.sourceArtifactPath, record.snapshot?.sourceArtifactPath, record.sourcePath, record.source?.path);
  if (isSyntheticIssueMaterialPath(recordPath)) return sourcePath || recordPath;
  return recordPath || sourcePath;
}

function firstNonEmpty(...items) { return items.map((item) => String(item || '').trim()).find(Boolean) || ''; }

function isSyntheticIssueMaterialPath(path = '') {
  const raw = String(path || '').trim();
  const clean = canonicalPath(raw).toLowerCase();
  if (!clean) return false;
  if (/^https?:\/\/github\.com\//i.test(raw)) return true;
  return clean.includes('/.github/.issues/') || clean.includes('/.issues/github/') || clean.includes('/issues/') || /^github\.com\/[^/]+\/[^/]+\/issues\/\d+/.test(clean);
}

function canonicalPath(value = '') {
  let raw = String(value || '').trim();
  if (!raw) return '';
  const githubPath = githubRepoRelativePathFromUrl(raw);
  if (githubPath) raw = githubPath;
  else { try { const url = new URL(raw); raw = url.pathname.replace(/^\/+/, ''); } catch (_) {} }
  const out = [];
  for (const part of raw.replace(/\\/g, '/').split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') out.pop();
    else out.push(part);
  }
  return out.join('/');
}


function githubRepoRelativePathFromUrl(value = '') {
  try {
    const url = new URL(String(value || '').trim());
    const parts = url.pathname.split('/').filter(Boolean);
    const host = url.hostname.toLowerCase();
    if (host === 'raw.githubusercontent.com' && parts.length >= 4) return parts.slice(3).join('/');
    if ((host === 'github.com' || host.endsWith('.github.com')) && parts.length >= 5 && parts[2] === 'blob') return parts.slice(4).join('/');
  } catch (_) {}
  return '';
}
