import assert from 'node:assert/strict';
import { assertCanonicalWorkspaceRuntimeState, workspaceRuntimeCandidateViolations } from './workspace.runtimeCanonical.js';

const canonical = { workspaces: [{ id: 'w', records: [{ id: 'workspace-record', workspaceArtifactRole: { schema: 'tiinex.workspace.artifact.role.v1', openEligible: true, mergeEligible: true } }] }] };
assert.equal(assertCanonicalWorkspaceRuntimeState(canonical, 'test').ok, true);
const leaked = { workspaces: [{ id: 'w', records: [], workspaceMergeCandidates: [] }] };
assert.equal(assertCanonicalWorkspaceRuntimeState(leaked, 'test').ok, false, 'legacy candidate runtime shape is forbidden even when empty');
assert.deepEqual(workspaceRuntimeCandidateViolations(leaked), [{ workspaceId: 'w', count: 0, reason: 'legacy-candidate-shape-present' }]);
console.log('✓ workspace runtime canonical invariant tests passed');
