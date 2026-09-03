import { cachedHydratedRecord, cachedHydratedWorkspace } from './recordUi.cache.js';

function storage() { return typeof window !== 'undefined' ? window.localStorage : null; }

export function hydrateUiRecord(record) {
  return cachedHydratedRecord(record, storage());
}

export function hydrateUiWorkspace(workspace) {
  return cachedHydratedWorkspace(workspace, storage());
}
