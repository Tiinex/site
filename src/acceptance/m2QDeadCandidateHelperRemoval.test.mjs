import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const sourceRecords = readFileSync(new URL('../workspaces/workspace.sourceRecords.js', import.meta.url), 'utf8');
const lifecycle = readFileSync(new URL('../workspaces/workspace.lifecycle.js', import.meta.url), 'utf8');
const candidates = readFileSync(new URL('../workspaces/workspace.candidates.js', import.meta.url), 'utf8');

for (const name of [
  'reconcileLocalWorkspaceCandidateWithSourceBackedWorkspace',
  'stripLocalSnapshotFromReconciledWorkspaceCandidate',
  'countReconciledLocalWorkspaceCandidateSnapshots',
  'restoreWorkspaceCandidateForRemovedSource',
  'candidateIdentityMatches',
  'candidateIdentityMatchReason',
  'candidateIdentityKeys',
  'isLocalCandidate',
  'isSourceBackedCandidate',
  'canonicalizeCandidatePath'
]) {
  assert.equal(sourceRecords.includes(name), false, `${name} must not remain in canonical workspace.sourceRecords owner`);
}

for (const term of ['workspaceMergeCandidates', 'WorkspaceCandidate', 'workspaceCandidate', 'workspace-candidate']) {
  assert.equal(sourceRecords.includes(term), false, `canonical workspace.sourceRecords must remain candidate-free: ${term}`);
}

assert.equal(lifecycle.includes('restoreWorkspaceCandidateForRemovedSource'), false, 'canonical lifecycle must not regain the removed candidate restoration helper');
assert.equal(candidates.includes('openWorkspaceCandidate'), true, 'explicit legacy candidate adapter remains available for compatibility tests in this bounded closure');

console.log('✓ M2 dead candidate helper removal tests passed');
