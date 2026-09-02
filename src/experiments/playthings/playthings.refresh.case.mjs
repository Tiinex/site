import assert from 'node:assert/strict';
import { refreshPlaythingsRepositoryMaterial } from './playthings.refresh.js';

const calls = [];
const initial = {
  workspaces: [
    {
      id: 'site',
      sources: [
        { id: 'local', kind: 'local' },
        { id: 'site-source', repo: 'Tiinex/site', ref: 'refactor', rootPath: '.topics', repoDiscovery: true, label: 'Site' }
      ]
    },
    {
      id: 'docs',
      sources: [{ id: 'docs-source', repo: 'Tiinex/docs', ref: 'master', repoDiscovery: false, issueDiscovery: false }]
    }
  ]
};
const refreshed = Object.assign({}, initial, { marker: 'refreshed' });
const result = await refreshPlaythingsRepositoryMaterial({
  state: initial,
  addGitHubSource: async (input, context) => {
    calls.push({ input, context });
    return { state: refreshed };
  }
});

assert.equal(result.attempted, 1, 'only configured repository sources should refresh');
assert.equal(result.state, refreshed, 'refresh should return the latest Tiinex state from the normal source path');
assert.equal(calls[0].input.repository, 'Tiinex/site');
assert.equal(calls[0].input.preserveView, true);
assert.equal(calls[0].input.resetSourceMaterial, true);
assert.equal(calls[0].input.resetSourceCache, true);
assert.equal(calls[0].context.workspaceId, 'site');

console.log('✓ Playthings source refresh orchestration passed');
