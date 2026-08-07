export function recordLogicalPath(record = {}) {
  const explicit = firstNonEmpty(record.logicalPath, record.treePath, record.displayPath);
  if (explicit) return normalizeWorkspacePath(explicit);
  const issuePath = githubIssueLogicalPathForRecord(record);
  if (issuePath) return issuePath;
  return normalizeWorkspacePath(record.path || record.sourcePath || record.source?.path || '');
}

export function normalizeWorkspacePath(value = '') {
  let raw = String(value || '').trim();
  if (!raw) return '';
  raw = raw.replace(/^file:\/\/+/i, '').replace(/\\/g, '/').replace(/[#?].*$/, '');
  try {
    const url = new URL(raw);
    raw = url.pathname.replace(/^\/+/, '');
  } catch (_) {}
  const out = [];
  for (const part of raw.split('/')) {
    const clean = part.trim();
    if (!clean || clean === '.') continue;
    if (clean === '..') { if (out.length) out.pop(); continue; }
    out.push(clean);
  }
  return out.join('/');
}

export function githubIssueLogicalPathForRecord(record = {}) {
  const current = normalizeWorkspacePath(record.path || '');
  if (isCanonicalGithubIssueSidecarPath(current)) return current;

  const target = githubIssueTargetForRecord(record);
  const normalizedCurrent = normalizeLegacyGithubIssuePath(current, target);
  if (normalizedCurrent) return normalizedCurrent;

  if (!target.ok) return '';
  const existingFile = current && !isGithubIssuePseudoPath(current) && !isUrlPathLike(record.path) && !isLegacyGithubIssueMaterialPath(current)
    ? basename(current)
    : '';
  const filename = existingFile || issueMaterialFallbackFilename(record, target);
  return `${githubIssueSidecarFolder(target)}/${filename}`;
}

function githubIssueTargetForRecord(record = {}) {
  const values = [
    record.recoveredFromUrl,
    record.sourceTarget?.inputTarget,
    record.sourceTarget?.url,
    record.snapshot?.sourceUrl,
    record.snapshot?.target?.canonicalUrl,
    record.path
  ];
  for (const value of values) {
    const parsed = githubIssueTargetParts(value);
    if (parsed.ok) return parsed;
  }
  const current = normalizeWorkspacePath(record.path || '');
  const legacy = legacyIssuePathParts(current);
  if (legacy.ok) {
    const sourceRepo = repoPartsFromSource(record.source || {});
    return Object.assign({}, legacy, sourceRepo.ok ? { owner: sourceRepo.owner, repo: sourceRepo.repo } : {});
  }
  return { ok: false };
}

function normalizeLegacyGithubIssuePath(path = '', target = {}) {
  const clean = normalizeWorkspacePath(path);
  if (!clean || isCanonicalGithubIssueSidecarPath(clean)) return '';

  const oldLogical = clean.match(/^\.topics\/\.issues\/github\/([^/]+)\/(\d+)\/(.+)$/i);
  if (oldLogical) {
    const owner = target?.owner || decomposeRepoSlug(oldLogical[1]).owner;
    const repo = target?.repo || decomposeRepoSlug(oldLogical[1]).repo;
    return `${githubIssueSidecarFolder({ owner, repo, number: oldLogical[2], surface: 'issues' })}/${oldLogical[3]}`;
  }

  const legacy = clean.match(/^(?:\.topics\/)?\.github\/\.issues\/([^/]+)-issue-(\d+)\/(.+)$/i)
    || clean.match(/(?:^|\/)\.github\/\.issues\/([^/]+)-issue-(\d+)\/(.+)$/i);
  if (legacy) {
    const owner = target?.owner || decomposeRepoSlug(legacy[1]).owner;
    const repo = target?.repo || decomposeRepoSlug(legacy[1]).repo;
    return `${githubIssueSidecarFolder({ owner, repo, number: legacy[2], surface: 'issues' })}/${legacy[3]}`;
  }
  return '';
}

function issueMaterialFallbackFilename(record = {}, target = {}) {
  const title = slugPart(record.title || record.name || (target.commentId ? 'comment' : 'issue-snapshot'));
  if (target.commentId) return `comment-${target.commentId}-${title}.trace.md`;
  const mode = String(record.sourceMode || record.sourceTarget?.targetKind || '').toLowerCase();
  if (mode.includes('embedded')) return `issue-root-recovered-${title}.trace.md`;
  return 'issue-snapshot.trace.md';
}

function githubIssueSidecarFolder(target = {}) {
  const owner = slugPart(target.owner || 'owner');
  const repo = slugPart(target.repo || 'repo');
  const surface = surfaceFolder(target.surface || 'issues');
  const number = String(target.number || 'target').replace(/[^A-Za-z0-9_.-]+/g, '-') || 'target';
  return `.topics/.github/${owner}/${repo}/${surface}/${number}`;
}

function surfaceFolder(surface = 'issues') {
  const raw = String(surface || 'issues').toLowerCase();
  if (raw.includes('discussion')) return '.discussions';
  if (raw.includes('pull')) return '.pulls';
  return '.issues';
}

function githubIssueTargetParts(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return { ok: false };
  const canonical = normalizeWorkspacePath(raw);
  const canonicalSidecar = canonical.match(/^\.topics\/\.github\/([^/]+)\/([^/]+)\/(\.issues|\.discussions|\.pulls)\/(\d+)(?:\/.*?(?:issuecomment-|discussioncomment-|comment-(?:\d+-)?)(\d{4,}))?/i);
  if (canonicalSidecar) return { ok: true, owner: canonicalSidecar[1], repo: canonicalSidecar[2], surface: canonicalSidecar[3].replace(/^\./, ''), number: canonicalSidecar[4], commentId: canonicalSidecar[5] || '' };
  const pseudo = raw.match(/^([^/:?#]+)\/([^/:?#]+)\/(issues|discussions|pull)\/(\d+)(?:.*?(?:issuecomment-|discussioncomment-)(\d+))?/i);
  if (pseudo) return { ok: true, owner: pseudo[1], repo: pseudo[2], surface: pseudo[3], number: pseudo[4], commentId: pseudo[5] || '' };
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    const parts = url.pathname.split('/').filter(Boolean);
    if ((host === 'github.com' || host.endsWith('.github.com')) && parts.length >= 4 && (parts[2] === 'issues' || parts[2] === 'discussions' || parts[2] === 'pull')) {
      const commentId = (url.hash.match(/(?:issuecomment-|discussioncomment-)(\d+)/i) || [])[1] || '';
      return { ok: true, owner: parts[0], repo: parts[1], surface: parts[2], number: parts[3], commentId };
    }
  } catch (_) {}
  return { ok: false };
}

function legacyIssuePathParts(path = '') {
  const clean = normalizeWorkspacePath(path);
  const oldLogical = clean.match(/^\.topics\/\.issues\/github\/([^/]+)\/(\d+)\//i);
  if (oldLogical) return Object.assign({ ok: true, number: oldLogical[2], surface: 'issues' }, decomposeRepoSlug(oldLogical[1]));
  const legacy = clean.match(/(?:^|\/)\.github\/\.issues\/([^/]+)-issue-(\d+)\//i);
  if (legacy) return Object.assign({ ok: true, number: legacy[2], surface: 'issues' }, decomposeRepoSlug(legacy[1]));
  return { ok: false };
}

function repoPartsFromSource(source = {}) {
  const repo = String(source.repo || source.repository || source.config?.repo || source.id || '').trim();
  const parts = repo.split('/').filter(Boolean);
  if (parts.length >= 2) return { ok: true, owner: parts[0], repo: parts[1] };
  return { ok: false };
}

function decomposeRepoSlug(slug = '') {
  const raw = String(slug || '').trim();
  const parts = raw.split('-').filter(Boolean);
  if (parts.length >= 2) return { owner: parts[0], repo: parts.slice(1).join('-') };
  return { owner: raw || 'owner', repo: 'repo' };
}

function isCanonicalGithubIssueSidecarPath(path = '') {
  return /^\.topics\/\.github\/[^/]+\/[^/]+\/(\.issues|\.discussions|\.pulls)\/\d+\//i.test(normalizeWorkspacePath(path));
}

function isLegacyGithubIssueMaterialPath(path = '') {
  const clean = normalizeWorkspacePath(path);
  return /^\.topics\/\.issues\/github\//i.test(clean) || /(?:^|\/)\.github\/\.issues\//i.test(clean);
}

function isGithubIssuePseudoPath(path = '') {
  return /^[^/]+\/[^/]+\/(issues|discussions|pull)\/\d+/i.test(normalizeWorkspacePath(path));
}

function isUrlPathLike(value = '') { return /^https?:\/\//i.test(String(value || '').trim()); }
function basename(path = '') { return normalizeWorkspacePath(path).split('/').filter(Boolean).pop() || ''; }
function firstNonEmpty(...items) { return items.map((item) => String(item || '').trim()).find(Boolean) || ''; }
function slugPart(value = '') { return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item'; }
