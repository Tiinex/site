import { hydrateGithubRecordFromSourceCache } from '../sources/github/github.transport.js';

export function hydrateUiRecord(record) {
  if (!record) return null;
  return hydrateGithubRecordFromSourceCache(record, { storage: typeof window !== 'undefined' ? window.localStorage : null });
}
