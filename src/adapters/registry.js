import { createExportAdapter } from './export/export.adapter.js';
import { createGitNativeAdapter } from './git-native/git-native.adapter.js';
import { createGithubAdapter } from './github/github.adapter.js';
import { createLocalAdapter } from './local/local.adapter.js';
import { createStaticAdapter } from './static/static.adapter.js';

export function createAdapterRegistry(extraAdapters = []) {
  const adapters = [
    createLocalAdapter(),
    createGithubAdapter(),
    createStaticAdapter(),
    createGitNativeAdapter(),
    createExportAdapter(),
    ...extraAdapters
  ];
  const byId = new Map();
  const bySourceKind = new Map();
  for (const adapter of adapters) {
    if (!adapter?.id) continue;
    byId.set(adapter.id, adapter);
    for (const sourceKind of adapter.sourceKinds || []) bySourceKind.set(sourceKind, adapter);
  }
  return Object.freeze({
    adapters: Object.freeze(Array.from(byId.values())),
    byId: Object.freeze(Object.fromEntries(byId.entries())),
    bySourceKind: Object.freeze(Object.fromEntries(bySourceKind.entries())),
    get(id) { return byId.get(String(id || '').trim().toLowerCase()) || null; },
    forSourceKind(sourceKind) { return bySourceKind.get(String(sourceKind || '').trim()) || null; },
    listSourceKinds() { return Object.freeze(Array.from(bySourceKind.keys()).sort()); }
  });
}

export const TiinexAdapterRegistry = createAdapterRegistry();
