import { schemaIdForRecord } from '../schemas/schema.identity.js';

export function recordLogicalPath(record = {}) {
  const stripPackageEnvelope = recordHasPackageEnvelopeContext(record);
  const explicit = firstNonEmpty(record.logicalPath, record.treePath, record.displayPath);
  if (explicit) return normalizeRecordMaterialPath(explicit, { stripPackageEnvelope });
  const issuePath = githubIssueLogicalPathForRecord(record);
  if (issuePath) return issuePath;
  return normalizeRecordMaterialPath(record.path || record.sourcePath || record.source?.path || '', { stripPackageEnvelope });
}


export function buildRecordLogicalPathMap(records = []) {
  const items = Array.isArray(records) ? records : [];
  const base = new Map();
  const groups = new Map();

  for (const record of items) {
    const key = recordPathMapKey(record);
    const path = recordLogicalPath(record);
    base.set(key, path);
    const info = githubIssuePathInfo(path, record);
    if (!info.ok) continue;
    if (!groups.has(info.folder)) groups.set(info.folder, []);
    groups.get(info.folder).push({ record, key, path, info });
  }

  for (const [folder, group] of groups.entries()) {
    const remapped = assignIssueDimensionPrefixes(folder, group);
    for (const [key, path] of remapped.entries()) base.set(key, path);
  }

  return base;
}

export function recordLogicalPathFromMap(record = {}, pathMap = null) {
  if (pathMap && typeof pathMap.get === 'function') {
    const mapped = pathMap.get(recordPathMapKey(record));
    if (mapped) return mapped;
  }
  return recordLogicalPath(record);
}

export function normalizeRecordMaterialPath(value = '', options = {}) {
  const clean = normalizeWorkspacePath(value);
  return options.stripPackageEnvelope ? stripPackageEnvelopePath(clean) : clean;
}

export function stripPackageEnvelopePath(path = '') {
  const clean = normalizeWorkspacePath(path);
  if (!clean) return '';
  // Handoff/package exports intentionally use envelope folders such as
  // artifacts/, sources/, and tiinex.package/. Those prefixes are package
  // transport structure, not Tiinex logical tree structure. Only callers
  // that have package-import context should strip them.
  const artifact = clean.match(/^artifacts\/(.+)$/i);
  if (artifact && looksLikeMaterialPath(artifact[1])) return artifact[1];
  return clean;
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
  const current = normalizeRecordMaterialPath(record.path || '', { stripPackageEnvelope: recordHasPackageEnvelopeContext(record) });

  const target = githubIssueTargetForRecord(record);
  if (isCanonicalGithubIssueSidecarPath(current)) return canonicalizeGithubIssueSidecarPath(current, record, target);

  const normalizedCurrent = normalizeLegacyGithubIssuePath(current, record, target);
  if (normalizedCurrent) return normalizedCurrent;

  if (!target.ok) return '';
  const existingFile = current && !isGithubIssuePseudoPath(current) && !isUrlPathLike(record.path) && !isLegacyGithubIssueMaterialPath(current)
    ? canonicalizeGithubIssueMaterialFilename(basename(current), record, target)
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
  const current = normalizeRecordMaterialPath(record.path || '', { stripPackageEnvelope: recordHasPackageEnvelopeContext(record) });
  const legacy = legacyIssuePathParts(current);
  if (legacy.ok) {
    const sourceRepo = repoPartsFromSource(record.source || {});
    return Object.assign({}, legacy, sourceRepo.ok ? { owner: sourceRepo.owner, repo: sourceRepo.repo } : {});
  }
  return { ok: false };
}

function normalizeLegacyGithubIssuePath(path = '', record = {}, target = {}) {
  const clean = normalizeWorkspacePath(path);
  if (!clean || isCanonicalGithubIssueSidecarPath(clean)) return '';

  const oldLogical = clean.match(/^\.topics\/\.issues\/github\/([^/]+)\/(\d+)\/(.+)$/i);
  if (oldLogical) {
    const owner = target?.owner || decomposeRepoSlug(oldLogical[1]).owner;
    const repo = target?.repo || decomposeRepoSlug(oldLogical[1]).repo;
    const canonicalFilename = canonicalizeGithubIssueMaterialFilename(oldLogical[3], record, target);
    return `${githubIssueSidecarFolder({ owner, repo, number: oldLogical[2], surface: 'issues' })}/${canonicalFilename}`;
  }

  const legacy = clean.match(/^(?:\.topics\/)?\.github\/\.issues\/([^/]+)-issue-(\d+)\/(.+)$/i)
    || clean.match(/(?:^|\/)\.github\/\.issues\/([^/]+)-issue-(\d+)\/(.+)$/i);
  if (legacy) {
    const owner = target?.owner || decomposeRepoSlug(legacy[1]).owner;
    const repo = target?.repo || decomposeRepoSlug(legacy[1]).repo;
    const canonicalFilename = canonicalizeGithubIssueMaterialFilename(legacy[3], record, target);
    return `${githubIssueSidecarFolder({ owner, repo, number: legacy[2], surface: 'issues' })}/${canonicalFilename}`;
  }
  return '';
}

export function canonicalizeGithubIssueMaterialFilename(filename = '', record = {}, target = {}) {
  const clean = basename(filename);
  if (!clean) return '';
  const extension = issueMaterialExtension(clean, record);

  if (/^issue-snapshot\.(workspace\.md|trace\.md|markdown|md)$/i.test(clean)) return `000-${slugPart(record.title || record.name || 'issue-snapshot')}${extension}`;
  const issueRoot = clean.match(/^issue-(?:root-)?(?:recovered-)?(.+?)\.(workspace\.md|trace\.md|markdown|md)$/i);
  if (issueRoot) return `000-${slugPart(issueRoot[1] || record.title || 'issue-root')}${extension}`;

  const commentWithOrdinal = clean.match(/^comment-(\d{1,4})-(?:\d{4,}-)?(?:recovered-)?(.+?)\.(workspace\.md|trace\.md|markdown|md)$/i);
  if (commentWithOrdinal) return `${padOrdinal(commentWithOrdinal[1])}-${slugPart(commentWithOrdinal[2] || record.title || 'artifact')}${extension}`;

  const commentWithId = clean.match(/^comment-(?:issuecomment-)?(\d{4,})-(?:recovered-)?(.+?)\.(workspace\.md|trace\.md|markdown|md)$/i);
  if (commentWithId) {
    const ordinal = recordIssueOrdinal(record) || target?.ordinal || target?.sourceOrdinal || '';
    const prefix = ordinal ? padOrdinal(ordinal) : String(commentWithId[1]);
    return `${prefix}-${slugPart(commentWithId[2] || record.title || 'artifact')}${extension}`;
  }

  return clean;
}

function canonicalizeGithubIssueSidecarPath(path = '', record = {}, target = {}) {
  const clean = normalizeWorkspacePath(path);
  const match = clean.match(/^(\.topics\/\.github\/[^/]+\/[^/]+\/(?:\.issues|\.discussions|\.pulls)\/\d+)\/(.+)$/i);
  if (!match) return clean;
  return `${match[1]}/${canonicalizeGithubIssueMaterialFilename(match[2], record, target)}`;
}

function issueMaterialFallbackFilename(record = {}, target = {}) {
  const title = slugPart(record.title || record.name || (target.commentId ? 'comment' : 'issue-snapshot'));
  const extension = issueMaterialExtension('', record);
  if (target.commentId) {
    const ordinal = recordIssueOrdinal(record) || target.ordinal || target.sourceOrdinal || '';
    const prefix = ordinal ? padOrdinal(ordinal) : String(target.commentId);
    return `${prefix}-${title}${extension}`;
  }
  const mode = String(record.sourceMode || record.sourceTarget?.targetKind || '').toLowerCase();
  if (mode.includes('embedded')) return `000-${title}${extension}`;
  return `000-${title || 'issue-snapshot'}${extension}`;
}


function issueMaterialExtension(filename = '', record = {}) {
  const clean = String(filename || '').toLowerCase();
  if (/\.workspace\.md$/i.test(clean)) return '.workspace.md';
  const schema = schemaIdForRecord(record).toLowerCase();
  if (schema === 'tiinex.workspace.v1' || schema.includes('.workspace.')) return '.workspace.md';
  return '.trace.md';
}

function recordIssueOrdinal(record = {}) {
  return firstNonEmpty(
    record.sourceTarget?.sourceOrdinal,
    record.sourceTarget?.ordinal,
    record.snapshot?.sourceOrdinal,
    record.snapshot?.ordinal,
    record.publicationOrdinal,
    record.issueOrdinal
  );
}

function padOrdinal(value = '') {
  const text = String(value ?? '').trim();
  if (!/^\d+$/.test(text)) return text;
  if (text.length >= 3) return text;
  return text.padStart(3, '0');
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


function assignIssueDimensionPrefixes(folder = '', group = []) {
  const used = new Set();
  const fixed = new Map();
  const remapped = new Map();
  const sorted = Array.from(group || []).sort(compareIssueGroupItems);

  for (const item of sorted) {
    const ordinal = fixedIssueOrdinal(item.info.filename);
    if (ordinal !== null) {
      used.add(ordinal);
      fixed.set(item.key, ordinal);
      remapped.set(item.key, `${folder}/${filenameWithIssueOrdinal(item.info.filename, ordinal, item.record)}`);
    }
  }

  let cursor = 1;
  for (let index = 0; index < sorted.length; index += 1) {
    const item = sorted[index];
    if (fixed.has(item.key)) {
      cursor = Math.max(cursor, fixed.get(item.key) + 1);
      continue;
    }
    const appendFallback = isLongIssueFallbackFilename(item.info.filename);
    const lower = appendFallback ? highestUsedOrdinal(used) : previousFixedOrdinal(sorted, fixed, index);
    const upper = appendFallback ? Infinity : nextFixedOrdinal(sorted, fixed, index);
    const assigned = chooseAvailableOrdinal(used, Math.max(cursor, lower + 1), upper);
    used.add(assigned);
    cursor = assigned + 1;
    remapped.set(item.key, `${folder}/${filenameWithIssueOrdinal(item.info.filename, assigned, item.record)}`);
  }
  return remapped;
}

function githubIssuePathInfo(path = '', record = {}) {
  const clean = normalizeWorkspacePath(path);
  const sidecar = clean.match(/^(\.topics\/\.github\/[^/]+\/[^/]+\/(?:\.issues|\.discussions|\.pulls)\/\d+)\/(.+)$/i);
  if (!sidecar) return { ok: false };
  return {
    ok: true,
    folder: sidecar[1],
    filename: sidecar[2],
    commentId: issueCommentIdFromRecord(record) || issueCommentIdFromFilename(sidecar[2]) || ''
  };
}

function fixedIssueOrdinal(filename = '') {
  const match = basename(filename).match(/^(\d{3})(?:-|\.)/);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) && value >= 0 && value < 1000 ? value : null;
}

function isLongIssueFallbackFilename(filename = '') {
  const clean = basename(filename);
  return /^\d{4,}-/.test(clean) || /^comment-(?:issuecomment-)?\d{4,}-/i.test(clean);
}

function highestUsedOrdinal(used = new Set()) {
  let max = 0;
  for (const value of used) if (Number.isFinite(value)) max = Math.max(max, value);
  return max;
}

function filenameWithIssueOrdinal(filename = '', ordinal = 1, record = {}) {
  const clean = basename(filename);
  const extension = issueMaterialExtension(clean, record);
  const stem = clean.replace(/\.(?:workspace\.md|trace\.md|markdown|md)$/i, '');
  const hadCanonicalOrdinal = /^\d{3}-/.test(stem);
  let slug = stem
    .replace(/^comment-\d{1,4}-(?:\d{4,}-)?(?:recovered-)?/i, '')
    .replace(/^comment-(?:issuecomment-)?\d{4,}-(?:recovered-)?/i, '')
    .replace(/^\d{3,}-/i, '')
    .replace(/^\d{4,}-/i, '');
  if (!hadCanonicalOrdinal) slug = slug.replace(/^issue-(?:root-)?(?:recovered-)?/i, '');
  slug = slug.replace(/^(?:recovered-)?/i, '');
  slug = slugPart(slug || record.title || record.name || 'artifact');
  return `${padOrdinal(ordinal)}-${slug}${extension}`;
}

function chooseAvailableOrdinal(used = new Set(), start = 1, upper = Infinity) {
  let candidate = Math.max(1, Number(start || 1));
  while (used.has(candidate) && candidate < upper) candidate += 1;
  if (!used.has(candidate) && candidate < upper) return candidate;
  candidate = 1;
  while (used.has(candidate)) candidate += 1;
  return candidate;
}

function previousFixedOrdinal(sorted = [], fixed = new Map(), index = 0) {
  for (let i = index - 1; i >= 0; i -= 1) {
    const value = fixed.get(sorted[i].key);
    if (Number.isFinite(value)) return value;
  }
  return 0;
}

function nextFixedOrdinal(sorted = [], fixed = new Map(), index = 0) {
  for (let i = index + 1; i < sorted.length; i += 1) {
    const value = fixed.get(sorted[i].key);
    if (Number.isFinite(value)) return value;
  }
  return Infinity;
}

function compareIssueGroupItems(a = {}, b = {}) {
  const aComment = numericId(a.info?.commentId);
  const bComment = numericId(b.info?.commentId);
  if (aComment && bComment && aComment !== bComment) return aComment - bComment;
  const timeDelta = dateValue(a.record?.sourceTarget?.sourceSortAt || a.record?.snapshot?.sourceSortAt || a.record?.currentCreatedAt || a.record?.createdAt) - dateValue(b.record?.sourceTarget?.sourceSortAt || b.record?.snapshot?.sourceSortAt || b.record?.currentCreatedAt || b.record?.createdAt);
  if (timeDelta) return timeDelta;
  const commentDelta = aComment - bComment;
  if (commentDelta) return commentDelta;
  return String(a.path || a.record?.title || '').localeCompare(String(b.path || b.record?.title || ''), undefined, { numeric: true, sensitivity: 'base' });
}

function issueCommentIdFromRecord(record = {}) {
  const values = [record.sourceTarget?.inputTarget, record.sourceTarget?.url, record.recoveredFromUrl, record.snapshot?.sourceUrl, record.path];
  for (const value of values) {
    const id = String(value || '').match(/(?:issuecomment-|discussioncomment-|comments\/|comment-(?:\d+-)?)(\d{4,})/i)?.[1] || '';
    if (id) return id;
  }
  return '';
}

function issueCommentIdFromFilename(filename = '') {
  return String(filename || '').match(/(?:issuecomment-|discussioncomment-|comment-(?:\d+-)?)(\d{4,})/i)?.[1] || String(filename || '').match(/^(\d{4,})-/)?.[1] || '';
}

function dateValue(value = '') {
  const n = Date.parse(String(value || '').trim());
  return Number.isFinite(n) ? n : 0;
}
function numericId(value = '') { const n = Number(String(value || '').replace(/\D+/g, '')); return Number.isFinite(n) ? n : 0; }
function recordPathMapKey(record = {}) { return record.id || `${record.path || ''}\n${record.sourceTarget?.inputTarget || record.recoveredFromUrl || ''}\n${record.title || record.name || ''}`; }

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

function recordHasPackageEnvelopeContext(record = {}) {
  const source = record.source || {};
  const mode = String(record.sourceMode || record.importMode || '').toLowerCase();
  return Boolean(record.packageImport || record.packagePath || mode.includes('package-import') || mode.includes('export-package') || source.adapterId === 'export-package' || source.sourceKind === 'export.package.import');
}
function isUrlPathLike(value = '') { return /^https?:\/\//i.test(String(value || '').trim()); }
function looksLikeMaterialPath(path = '') { return /(?:^|\/)(?:\.topics|topics|[^/]+\.(?:md|markdown))\//i.test(String(path || '') + '/') || /\.(?:md|markdown)$/i.test(String(path || '')); }
function basename(path = '') { return normalizeWorkspacePath(path).split('/').filter(Boolean).pop() || ''; }
function firstNonEmpty(...items) { return items.map((item) => String(item || '').trim()).find(Boolean) || ''; }
function slugPart(value = '') { return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item'; }
