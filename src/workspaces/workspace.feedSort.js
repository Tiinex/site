export function sortWorkspaceFeedRecords(records = []) {
  const list = Array.isArray(records) ? records.slice() : [];
  return list.sort(compareWorkspaceFeedRecords);
}

export function compareWorkspaceFeedRecords(a = {}, b = {}) {
  const timeDelta = workspaceRecordSortTimestamp(b) - workspaceRecordSortTimestamp(a);
  if (timeDelta) return timeDelta;
  const issueSequenceDelta = issuePublicationSequence(b) - issuePublicationSequence(a);
  if (issueSequenceDelta) return issueSequenceDelta;
  const pathDelta = normalizedRecordPath(a).localeCompare(normalizedRecordPath(b), undefined, { numeric: true, sensitivity: 'base' });
  if (pathDelta) return pathDelta;
  return String(a.id || '').localeCompare(String(b.id || ''), undefined, { numeric: true, sensitivity: 'base' });
}

export function workspaceRecordSortTimestamp(record = {}) {
  const createdAt = record.currentCreatedAt || record.createdAt || record.date || '';
  const createdTime = sortableDate(createdAt);
  const issueSourceTime = issueSourceSortTimestamp(record);
  if (issueSourceTime) {
    if (!isEmbeddedIssueArtifact(record)) return issueSourceTime;
    if (!createdTime) return issueSourceTime;
    const sourceDay = utcDatePartFromTimestamp(issueSourceTime);
    const createdDay = utcDatePartFromTimestamp(createdTime);
    return sourceDay && createdDay && sourceDay === createdDay ? issueSourceTime : createdTime;
  }
  const midnightDate = createdAtMidnightDate(createdAt);
  const committedAt = record.gitCommittedAt
    || record.committedAt
    || record.sourceTarget?.gitCommittedAt
    || record.sourceTarget?.committedAt
    || record.file?.gitCommittedAt
    || record.file?.committedAt
    || '';
  if (!midnightDate || !committedAt) return createdTime;
  if (utcDatePart(committedAt) !== midnightDate) return createdTime;
  return sortableDate(committedAt) || createdTime;
}

function issueSourceSortTimestamp(record = {}) {
  if (!hasIssuePublicationIdentity(record) && String(record?.sourceTarget?.surface || '') !== 'issueSnapshots') return 0;
  return sortableDate(record.sourceTarget?.sourceSortAt || record.sourceTarget?.sourceUpdatedAt || record.snapshot?.sourceSortAt || record.snapshot?.sourceUpdatedAt || '');
}

function issuePublicationSequence(record = {}) {
  const values = [
    record.recoveredFromUrl,
    record.sourceTarget?.inputTarget,
    record.sourceTarget?.rawUrl,
    record.sourceTarget?.browseUrl,
    record.snapshot?.sourceUrl,
    record.snapshot?.target?.canonicalUrl,
    record.path,
    record.sourceTarget?.sourceArtifactPath,
    record.snapshot?.sourceArtifactPath
  ];
  if (String(record?.sourceTarget?.surface || '') !== 'issueSnapshots' && !values.some((value) => githubIssueCommentIdFromValue(value) || githubIssueNumberFromValue(value))) return 0;
  for (const value of values) {
    const commentId = githubIssueCommentIdFromValue(value);
    if (commentId) return commentId;
  }
  for (const value of values) {
    const issueNumber = githubIssueNumberFromValue(value);
    if (issueNumber) return issueNumber;
  }
  return 0;
}


function isEmbeddedIssueArtifact(record = {}) {
  const mode = String(record.sourceMode || record.recoveryKind || '').toLowerCase();
  const targetKind = String(record.sourceTarget?.targetKind || '').toLowerCase();
  if (record.snapshot?.embedded === true) return true;
  if (mode.includes('embedded-artifact')) return true;
  if (targetKind.includes('embedded-artifact')) return true;
  return false;
}

function utcDatePartFromTimestamp(value = 0) {
  const t = Number(value || 0);
  if (!Number.isFinite(t) || t <= 0) return '';
  return new Date(t).toISOString().slice(0, 10);
}

function hasIssuePublicationIdentity(record = {}) {
  const values = [
    record.recoveredFromUrl,
    record.sourceTarget?.inputTarget,
    record.sourceTarget?.rawUrl,
    record.sourceTarget?.browseUrl,
    record.snapshot?.sourceUrl,
    record.snapshot?.target?.canonicalUrl,
    record.path,
    record.sourceTarget?.sourceArtifactPath,
    record.snapshot?.sourceArtifactPath
  ];
  return values.some((value) => githubIssueCommentIdFromValue(value) || githubIssueNumberFromValue(value));
}

function githubIssueCommentIdFromValue(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return 0;
  const direct = raw.match(/(?:issuecomment-|issues\/comments\/|comment-(?:\d+-)?)(\d{4,})/i)?.[1] || '';
  if (direct) return Number(direct) || 0;
  try {
    const url = new URL(raw);
    return Number(url.hash.match(/issuecomment-(\d+)/i)?.[1] || 0) || 0;
  } catch (_) {}
  return 0;
}

function githubIssueNumberFromValue(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return 0;
  try {
    const url = new URL(raw);
    const parts = url.pathname.split('/').filter(Boolean);
    const issueIndex = parts.findIndex((part) => part === 'issues');
    const number = issueIndex >= 0 ? Number(parts[issueIndex + 1] || 0) : 0;
    return Number.isFinite(number) ? number : 0;
  } catch (_) {}
  const pathParts = raw.replace(/\\/g, '/').split('/').filter(Boolean);
  const issueIndex = pathParts.findIndex((part) => part.toLowerCase() === 'issues');
  const number = issueIndex >= 0 ? Number(pathParts[issueIndex + 1] || 0) : 0;
  return Number.isFinite(number) ? number : 0;
}

function sortableDate(value = '') {
  const s = String(value || '').trim();
  if (!s || /^unknown/i.test(s)) return 0;
  const hasZone = /(?:z|[+-]\d{2}:?\d{2})$/i.test(s);
  const iso = hasZone ? s : `${s.replace(' ', 'T')}Z`;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
}

function createdAtMidnightDate(value = '') {
  const s = String(value || '').trim();
  const match = s.match(/^(\d{4}-\d{2}-\d{2})(?:[ T]00:00:00(?:\.000)?(?:Z)?)?$/i);
  if (!match) return '';
  return match[1];
}

function utcDatePart(value = '') {
  const t = sortableDate(value);
  if (!t) return '';
  return new Date(t).toISOString().slice(0, 10);
}

function normalizedRecordPath(record = {}) {
  return String(record.path || record.title || record.name || '').trim();
}
