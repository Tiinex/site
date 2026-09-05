import { cachedHydratedRecord, cachedHydratedWorkspace } from './recordUi.cache.js';

function browserStorage() { return typeof window !== 'undefined' ? window.localStorage : null; }

export function hydrateUiRecord(record) {
  return cachedHydratedRecord(record, browserStorage());
}

export function hydrateUiWorkspace(workspace) {
  return cachedHydratedWorkspace(workspace, browserStorage());
}
