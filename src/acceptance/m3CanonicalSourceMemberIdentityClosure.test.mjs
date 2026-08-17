import assert from 'node:assert/strict';
import '../workspaces/workspace.lifecycle.js';
import { mergeWorkspaceEntrypointSet, normalizeWorkspaceEntrypointSet } from '../workspaces/workspace.entrypointLifecycle.js';
import { sourceSignature } from '../workspaces/workspace.entrypoints.js';
import { workspaceEntrypointMemberIdentity } from '../workspaces/workspace.memberIdentity.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;

function plan(overrides = {}) {
  return Object.assign({
    repository: 'Owner/Repo',
    ref: 'Main',
    rootPath: '.topics/Foo',
    label: 'Workspace',
    sourceKind: 'github-tree',
    repoDiscovery: false,
    issueDiscovery: true,
    issueUrls: 'https://github.com/Owner/Repo/issues/1\nhttps://github.com/Owner/Repo/issues/2',
    explicitFileRefs: ['b.md', 'a.md'],
    workspaceEntrypoint: { name: 'Workspace', workspaceLabel: 'Workspace' }
  }, overrides);
}

function memberKey(sourceInput) {
  return workspaceEntrypointMemberIdentity(sourceInput.workspaceEntrypoint, sourceInput)?.key || '';
}

const issueSetA = plan();
const issueSetB = plan({ issueUrls: 'https://github.com/Owner/Repo/issues/2\nhttps://github.com/Owner/Repo/issues/1\nhttps://github.com/Owner/Repo/issues/1' });
assert.equal(sourceSignature(issueSetA), sourceSignature(issueSetB), 'issue target ordering and redundant duplicates are one canonical source plan');
assert.equal(memberKey(issueSetA), memberKey(issueSetB), 'set-like issue target changes do not stale the semantic workspace member key');

const fileSetA = plan({ issueDiscovery: false, issueUrls: '', explicitFileRefs: ['b.md', 'a.md', 'a.md'] });
const fileSetB = plan({ issueDiscovery: false, issueUrls: '', explicitFileRefs: ['a.md', 'b.md'] });
assert.equal(sourceSignature(fileSetA), sourceSignature(fileSetB), 'exact file target ordering/dedup remains canonical-set equivalent');
assert.equal(memberKey(fileSetA), memberKey(fileSetB), 'exact file set normalization remains stable for member identity');

const repoCaseA = plan({ repository: 'Owner/Repo' });
const repoCaseB = plan({ repository: 'owner/repo' });
assert.equal(sourceSignature(repoCaseA), sourceSignature(repoCaseB), 'repository owner/name casing keeps the established case-insensitive plan identity');
assert.equal(memberKey(repoCaseA), memberKey(repoCaseB), 'repository casing alone does not stale member identity');

const refCaseA = plan({ ref: 'Main' });
const refCaseB = plan({ ref: 'main' });
assert.notEqual(sourceSignature(refCaseA), sourceSignature(refCaseB), 'Git ref case is material source-plan identity');
assert.notEqual(memberKey(refCaseA), memberKey(refCaseB), 'material ref case change makes an old member key stale');

const rootCaseA = plan({ rootPath: '.topics/Foo' });
const rootCaseB = plan({ rootPath: '.topics/foo' });
assert.notEqual(sourceSignature(rootCaseA), sourceSignature(rootCaseB), 'repo root path case is material source-plan identity');
assert.notEqual(memberKey(rootCaseA), memberKey(rootCaseB), 'material root path case change makes an old member key stale');

const dedupedEquivalent = normalizeWorkspaceEntrypointSet([issueSetA, issueSetB]);
assert.equal(dedupedEquivalent.length, 1, 'entrypoint-set normalization consumes canonical source-plan equality for issue sets');
const retainedRefVariants = normalizeWorkspaceEntrypointSet([refCaseA, refCaseB]);
assert.equal(retainedRefVariants.length, 2, 'entrypoint-set normalization must not collapse case-distinct refs');
const retainedRootVariants = normalizeWorkspaceEntrypointSet([rootCaseA, rootCaseB]);
assert.equal(retainedRootVariants.length, 2, 'entrypoint-set normalization must not collapse case-distinct roots');

function loadedState(sourceInput) {
  let state = lifecycle.makeEmptyAppState();
  const created = lifecycle.createWorkspace(state, { name: sourceInput.label });
  state = created.state;
  const added = lifecycle.addWorkspaceSource(state, created.workspace.id, Object.assign({}, sourceInput, {
    discoveryState: 'loaded',
    count: 1,
    surfaces: { repoFiles: { attempted: true, loaded: 1 } }
  }));
  return { state: added.state, workspaceId: created.workspace.id };
}

const loadedRef = loadedState(plan({ ref: 'Main', repoDiscovery: true, issueDiscovery: false, issueUrls: '', explicitFileRefs: [] }));
const refChangedMerge = mergeWorkspaceEntrypointSet({
  lifecycle,
  state: loadedRef.state,
  sourceInputs: [plan({ ref: 'main', repoDiscovery: true, issueDiscovery: false, issueUrls: '', explicitFileRefs: [] })]
});
assert.equal(refChangedMerge.ok, true);
assert.equal(refChangedMerge.merge.skippedLoads, 0, 'case-distinct ref plan must not be treated as an already-loaded equivalent source');
assert.equal(refChangedMerge.sourceInputs.length, 1, 'case-distinct ref plan remains eligible for materialization');

const loadedRoot = loadedState(plan({ rootPath: '.topics/Foo', repoDiscovery: true, issueDiscovery: false, issueUrls: '', explicitFileRefs: [] }));
const rootChangedMerge = mergeWorkspaceEntrypointSet({
  lifecycle,
  state: loadedRoot.state,
  sourceInputs: [plan({ rootPath: '.topics/foo', repoDiscovery: true, issueDiscovery: false, issueUrls: '', explicitFileRefs: [] })]
});
assert.equal(rootChangedMerge.ok, true);
assert.equal(rootChangedMerge.merge.skippedLoads, 0, 'case-distinct root plan must not be treated as an already-loaded equivalent source');
assert.equal(rootChangedMerge.sourceInputs.length, 1, 'case-distinct root plan remains eligible for materialization');

console.log('✓ M3 canonical source/member identity closure tests passed');
