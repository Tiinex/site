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
  raw = raw.replace(/^file:\/\/+/, '').replace(/\\/g, '/').replace(/[#?].*$/, '');
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
  const normalizedCurrent = normalizeLegacyGithubIssuePath(current);
  if (normalizedCurrent) return normalizedCurrent;
  if (current.startsWith('.topics/.issues/github/')) return current;

  const target = githubIssueTargetParts(
    record.recoveredFromUrl ||
    record.sourceTarget?.inputTarget ||
    record.snapshot?.sourceUrl ||
    record.snapshot?.target?.canonicalUrl ||
    record.path || ''
  );
  if (!target.ok) return '';
  const existingFile = current && !isGithubIssuePseudoPath(current) && !isUrlPathLike(record.path) ? basename(current) : '';
  const filename = existingFile || issueMaterialFallbackFilename(record, target);
  return `.topics/.issues/github/${target.repoSlug}/${target.number}/${filename}`;
}

function normalizeLegacyGithubIssuePath(path = '') {
  const clean = normalizeWorkspacePath(path);
  const legacy = clean.match(/^(?:\.topics\/)?\.github\/\.issues\/([^/]+)-issue-(\d+)\/(.+)$/i)
    || clean.match(/(?:^|\/)\.github\/\.issues\/([^/]+)-issue-(\d+)\/(.+)$/i);
  if (legacy) return `.topics/.issues/github/${legacy[1].toLowerCase()}/${legacy[2]}/${legacy[3]}`;
  return '';
}

function issueMaterialFallbackFilename(record = {}, target = {}) {
  const title = slugPart(record.title || record.name || (target.commentId ? 'comment' : 'issue-snapshot'));
  if (target.commentId) return `comment-${target.commentId}-${title}.trace.md`;
  const mode = String(record.sourceMode || record.sourceTarget?.targetKind || '').toLowerCase();
  if (mode.includes('embedded')) return `issue-root-recovered-${title}.trace.md`;
  return 'issue-snapshot.trace.md';
}

function githubIssueTargetParts(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return { ok: false };
  const pseudo = raw.match(/^([^/:?#]+)\/([^/:?#]+)\/(?:issues|discussions|pull)\/(\d+)(?:.*?(?:issuecomment-|discussioncomment-)(\d+))?/i);
  if (pseudo) return { ok: true, owner: pseudo[1], repo: pseudo[2], repoSlug: `${slugPart(pseudo[1])}-${slugPart(pseudo[2])}`, number: pseudo[3], commentId: pseudo[4] || '' };
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    const parts = url.pathname.split('/').filter(Boolean);
    if ((host === 'github.com' || host.endsWith('.github.com')) && parts.length >= 4 && (parts[2] === 'issues' || parts[2] === 'discussions' || parts[2] === 'pull')) {
      const commentId = (url.hash.match(/(?:issuecomment-|discussioncomment-)(\d+)/i) || [])[1] || '';
      return { ok: true, owner: parts[0], repo: parts[1], repoSlug: `${slugPart(parts[0])}-${slugPart(parts[1])}`, number: parts[3], commentId };
    }
  } catch (_) {}
  return { ok: false };
}

function isGithubIssuePseudoPath(path = '') {
  return /^[^/]+\/[^/]+\/(issues|discussions|pull)\/\d+/i.test(normalizeWorkspacePath(path));
}

function isUrlPathLike(value = '') { return /^https?:\/\//i.test(String(value || '').trim()); }
function basename(path = '') { return normalizeWorkspacePath(path).split('/').filter(Boolean).pop() || ''; }
function firstNonEmpty(...items) { return items.map((item) => String(item || '').trim()).find(Boolean) || ''; }
function slugPart(value = '') { return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item'; }
