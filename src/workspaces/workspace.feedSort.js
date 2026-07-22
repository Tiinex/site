export function sortWorkspaceFeedRecords(records = []) {
  const list = Array.isArray(records) ? records.slice() : [];
  return list.sort(compareWorkspaceFeedRecords);
}

export function compareWorkspaceFeedRecords(a = {}, b = {}) {
  const timeDelta = workspaceRecordSortTimestamp(b) - workspaceRecordSortTimestamp(a);
  if (timeDelta) return timeDelta;
  const pathDelta = normalizedRecordPath(a).localeCompare(normalizedRecordPath(b), undefined, { numeric: true, sensitivity: 'base' });
  if (pathDelta) return pathDelta;
  return String(a.id || '').localeCompare(String(b.id || ''), undefined, { numeric: true, sensitivity: 'base' });
}

export function workspaceRecordSortTimestamp(record = {}) {
  const createdAt = record.currentCreatedAt || record.createdAt || record.date || '';
  const createdTime = sortableDate(createdAt);
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
