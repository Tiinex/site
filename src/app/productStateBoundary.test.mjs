import assert from 'node:assert/strict';
import { canonicalProductState } from './productStateBoundary.js';

const current = {
  activeWorkspaceId: 'a',
  workspaces: [{ id: 'a', records: [{ id: 'r1' }], assets: [], sources: [] }],
  workspaceViews: { a: { workspaceVerse: 'feed' }, b: { workspaceVerse: 'tree', query: 'stale-view' } }
};
const canonical = canonicalProductState(current, { normalizeLegacyWorkspaceCandidateState() { throw new Error('runtime commit must not invoke persistence migration'); } }, 'current-runtime');
assert.equal(canonical.workspaces[0], current.workspaces[0], 'current workspace identity survives the hot product-state boundary');
assert.equal(canonical.workspaces[0].records, current.workspaces[0].records, 'current record collection identity survives the hot product-state boundary');
assert.equal(canonical.workspaceViews.b, undefined, 'normal product-state boundary still prunes presentation owned by closed workspaces');
assert.equal(canonical.activeWorkspaceId, 'a');

assert.throws(
  () => canonicalProductState({ workspaces: [{ id: 'w', workspaceMergeCandidates: [{ id: 'legacy' }] }] }, { normalizeLegacyWorkspaceCandidateState() { return {}; } }, 'test'),
  /workspace\.runtime-candidate-leak:test:w/,
  'legacy candidate compatibility must be consumed at persistence/recovery intake, not silently migrated during an ordinary runtime commit'
);

console.log('✓ product state boundary tests passed');
