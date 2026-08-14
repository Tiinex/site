import assert from 'node:assert/strict';
import { canonicalProductState } from './productStateBoundary.js';

const persistence = {
  normalizeLegacyWorkspaceCandidateState(state) {
    return {
      ...state,
      workspaces: (state.workspaces || []).map((workspace) => {
        const canonical = {
          ...workspace,
          records: [
            ...(workspace.records || []),
            ...(workspace.workspaceMergeCandidates || []).map((candidate) => ({
              id: candidate.id,
              path: candidate.path || `${candidate.id || 'legacy'}.workspace.md`,
              workspaceArtifactRole: {
                schema: 'tiinex.workspace.artifact.role.v1',
                openEligible: true,
                mergeEligible: true,
                migratedFromLegacyCandidate: true
              }
            }))
          ]
        };
        delete canonical.workspaceMergeCandidates;
        return canonical;
      })
    };
  }
};

const canonical = canonicalProductState({
  workspaces: [{ id: 'w', records: [], workspaceMergeCandidates: [{ id: 'legacy' }] }]
}, persistence, 'test');
assert.equal(Object.prototype.hasOwnProperty.call(canonical.workspaces[0], 'workspaceMergeCandidates'), false, 'normalization consumes the legacy candidate shape');
assert.equal(canonical.workspaces[0].records.length, 1, 'legacy candidate becomes a canonical record before product state');
assert.throws(
  () => canonicalProductState({ workspaces: [{ id: 'w', workspaceMergeCandidates: [{ id: 'leak' }] }] }, null, 'test'),
  /workspace\.runtime-candidate-leak:test:w/
);

const pruned = canonicalProductState({
  activeWorkspaceId: 'a',
  workspaces: [{ id: 'a', records: [], assets: [], sources: [] }],
  workspaceViews: { a: { workspaceVerse: 'feed' }, b: { workspaceVerse: 'tree', query: 'stale-view' } }
}, null, 'presentation-prune');
assert.equal(pruned.workspaceViews.b, undefined, 'normal product-state boundary prunes presentation owned by closed workspaces');
assert.equal(pruned.activeWorkspaceId, 'a');

console.log('✓ product state boundary tests passed');
