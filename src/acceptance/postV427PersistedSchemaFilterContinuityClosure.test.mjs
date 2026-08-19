import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { canonicalProductState } from '../app/productStateBoundary.js';
import { buildWorkspaceDiscoveryView } from '../workspaces/workspace.discoveryView.js';

function loadPersistence() {
  const storageMap = new Map();
  const sandbox = {
    Buffer,
    window: {
      localStorage: {
        getItem: (key) => storageMap.get(key) || null,
        setItem: (key, value) => storageMap.set(key, String(value)),
        removeItem: (key) => storageMap.delete(key)
      },
      location: { pathname: '/index.html', search: '', hash: '' },
      history: {
        replaceState: (_a, _b, url) => { sandbox.window.location.hash = url.includes('#') ? `#${url.split('#').pop()}` : ''; },
        pushState: (_a, _b, url) => { sandbox.window.location.hash = url.includes('#') ? `#${url.split('#').pop()}` : ''; }
      }
    },
    globalThis: {}
  };
  sandbox.globalThis = sandbox.window;
  vm.createContext(sandbox);
  for (const file of [
    '../workspaces/workspace.route.js',
    '../workspaces/workspace.persistenceRecovery.js',
    '../workspaces/workspace.persistenceRouteCache.js',
    '../workspaces/workspace.persistencePresentation.js',
    '../workspaces/workspace.persistenceClear.js',
    '../workspaces/workspace.persistence.js'
  ]) vm.runInContext(readFileSync(new URL(file, import.meta.url), 'utf8'), sandbox);
  return { persistence: sandbox.window.TiinexWorkspacePersistence, env: sandbox.window };
}

const records = [
  { id: 'topic', title: 'Topic', path: 'topic.trace.md', schemaId: 'tiinex.topic.v1', kind: 'markdown', sourceMode: 'local-manual', source: { adapterId: 'local' }, markdown: '# Topic\n\n# Continuity Context' },
  { id: 'task', title: 'Task', path: 'task.trace.md', currentSchemaId: 'tiinex.task.v1', kind: 'markdown', sourceMode: 'local-manual', source: { adapterId: 'local' }, markdown: '# Task\n\n# Continuity Context' },
  { id: 'readme', title: 'README', path: 'README.md', kind: 'markdown', sourceMode: 'local-manual', source: { adapterId: 'local' }, markdown: '# README' }
];
const workspace = { id: 'w', name: 'Workspace', title: 'Workspace', records, assets: [], sources: [], sourceOrder: [] };
const baseDisplayOptions = {
  leavesOnly: false,
  showSupportingMarkdown: true,
  showWorkspaceArtifacts: true,
  showAssets: false,
  artifactFilter: 'all',
  sourceFilter: 'all'
};

function persistedState(schemaFilter) {
  const view = { workspaceVerse: 'feed', query: '', displayOptions: { ...baseDisplayOptions, schemaFilter } };
  return { version: 1, activeWorkspaceId: 'w', view, workspaceViews: { w: view }, workspaces: [workspace] };
}

const staleRoundtrip = loadPersistence();
staleRoundtrip.persistence.writeState(persistedState('markdown'), {
  storage: staleRoundtrip.env.localStorage,
  location: staleRoundtrip.env.location,
  history: staleRoundtrip.env.history,
  mode: 'replace'
});
const staleRestored = staleRoundtrip.persistence.readInitialState({ storage: staleRoundtrip.env.localStorage, location: staleRoundtrip.env.location });
assert.equal(staleRestored.workspaceViews.w.displayOptions.schemaFilter, 'markdown', 'persistence restore reproduces the v426-like stale pseudo-schema selection before runtime qualification');
const staleCanonical = canonicalProductState(staleRestored, staleRoundtrip.persistence, 'v427-persisted-schema-filter-stale');
assert.equal(staleCanonical.view.displayOptions.schemaFilter, 'all', 'runtime product boundary clears a stale Schema selection absent from current qualified Schema projection');
assert.equal(staleCanonical.workspaceViews.w.displayOptions.schemaFilter, 'all', 'workspace-scoped presentation state also clears the stale invisible Schema selection');
const staleDiscovery = buildWorkspaceDiscoveryView(workspace, { displayOptions: staleCanonical.view.displayOptions, query: '' });
assert.deepEqual(staleDiscovery.records.map((record) => record.id), ['readme', 'task', 'topic'], 'stale hidden Schema state cannot make Discovery empty after restore');
assert.deepEqual(staleDiscovery.choices.schemas, [['tiinex.task.v1', 1], ['tiinex.topic.v1', 1]], 'kind-only markdown remains absent from qualified Schema choices after stale-state recovery');

const validRoundtrip = loadPersistence();
validRoundtrip.persistence.writeState(persistedState('tiinex.topic.v1'), {
  storage: validRoundtrip.env.localStorage,
  location: validRoundtrip.env.location,
  history: validRoundtrip.env.history,
  mode: 'replace'
});
const validRestored = validRoundtrip.persistence.readInitialState({ storage: validRoundtrip.env.localStorage, location: validRoundtrip.env.location });
const validCanonical = canonicalProductState(validRestored, validRoundtrip.persistence, 'v427-persisted-schema-filter-valid');
assert.equal(validCanonical.view.displayOptions.schemaFilter, 'tiinex.topic.v1', 'valid qualified Schema selection persists and restores');
assert.equal(validCanonical.workspaceViews.w.displayOptions.schemaFilter, 'tiinex.topic.v1', 'valid workspace-scoped Schema selection is preserved');
const validDiscovery = buildWorkspaceDiscoveryView(workspace, { displayOptions: validCanonical.view.displayOptions, query: '' });
assert.deepEqual(validDiscovery.records.map((record) => record.id), ['topic'], 'restored valid Schema selection continues filtering by qualified schema identity');

console.log('✓ post-v427 persisted Schema-filter continuity closure passed');
