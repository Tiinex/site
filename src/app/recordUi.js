import { hydrateGithubRecordFromSourceCache, hydrateGithubWorkspaceFromSourceCache } from '../sources/github/github.transport.js';

export function hydrateUiRecord(record) {
  if (!record) return null;
  return hydrateGithubRecordFromSourceCache(record, { storage: typeof window !== 'undefined' ? window.localStorage : null });
}

export function hydrateUiWorkspace(workspace) {
  if (!workspace) return null;
  return hydrateGithubWorkspaceFromSourceCache(workspace, { storage: typeof window !== 'undefined' ? window.localStorage : null });
}
