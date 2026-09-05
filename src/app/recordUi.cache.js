import { hydrateGithubRecordFromSourceCache, hydrateGithubWorkspaceFromSourceCache } from '../sources/github/github.transport.js';

const positiveRecordHydration = new WeakMap();
const workspaceHydration = new WeakMap();
const NEGATIVE_RECHECK_MS = 1200;

export function cachedHydratedRecord(record, storage) {
  if (!record || String(record.markdown || '').trim()) return record || null;
  const cached = positiveRecordHydration.get(record);
  if (cached) return cached;
  const hydrated = hydrateGithubRecordFromSourceCache(record, { storage });
  if (hydrated !== record) positiveRecordHydration.set(record, hydrated);
  return hydrated;
}

export function cachedHydratedWorkspace(workspace, storage) {
  if (!workspace) return null;
  const records = Array.isArray(workspace.records) ? workspace.records : [];
  const now = Date.now();
  const cached = workspaceHydration.get(workspace);
  if (cached && cached.records === records && (cached.complete || now - cached.checkedAt < NEGATIVE_RECHECK_MS)) return cached.value;
  const value = hydrateGithubWorkspaceFromSourceCache(workspace, { storage });
  const hydratedRecords = Array.isArray(value?.records) ? value.records : records;
  for (let index = 0; index < Math.min(records.length, hydratedRecords.length); index += 1) if (hydratedRecords[index] !== records[index]) positiveRecordHydration.set(records[index], hydratedRecords[index]);
  const complete = !hydratedRecords.some(recordNeedsSourceCacheHydration);
  workspaceHydration.set(workspace, { records, value, complete, checkedAt: now });
  return value;
}

function recordNeedsSourceCacheHydration(record = {}) {
  if (String(record.markdown || '').trim()) return false;
  const source = record.source || {};
  const adapter = String(source.adapterId || record.sourceMode || '').toLowerCase();
  return adapter.includes('github') || String(record.sourceMode || '').toLowerCase().includes('source-backed');
}
