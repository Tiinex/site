import assert from 'node:assert/strict';
import '../workspaces/workspace.config.js';
import '../workspaces/workspace.lifecycle.js';
import '../workspaces/workspace.route.js';
import '../workspaces/workspace.persistence.js';
import { publicTargetFromExternalUrl } from '../app/publicTarget.js';
import {
  projectShareTruth,
  ShareAccessStatus,
  ShareScope,
  ShareTargetStatus
} from '../app/shareProjection.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;
const route = globalThis.TiinexWorkspaceRoute;
const persistence = globalThis.TiinexWorkspacePersistence;
const publicViewerUrl = 'https://viewer.example/app';
const exactStateBaseUrl = 'https://sender.example/app';

// Artifact access truth belongs to the artifact target, not unrelated workspace sources.
const artifactUrl = 'https://example.test/public.md';
const state = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { id: 'w', name: 'Workspace' }).state;
const workspace = lifecycle.activeWorkspace(state);
const artifact = {
  id: 'public-artifact',
  title: 'Public artifact',
  path: 'public.md',
  sourceMode: 'source-backed',
  source: { id: 'public-web', adapterId: 'web', sourceKind: 'web.markdown', url: artifactUrl },
  sourceTarget: { inputTarget: artifactUrl }
};
workspace.records.push(artifact);
workspace.sources.push({ id: 'private-unrelated', adapterId: 'github', repo: 'Private/Repo', config: { authRequired: true } });
const artifactProjection = projection(ShareScope.artifact, { state, workspace, record: artifact });
assert.equal(artifactProjection.targetStatus, ShareTargetStatus.available);
assert.equal(artifactProjection.accessStatus, ShareAccessStatus.unknown, 'unrelated auth-bound workspace source cannot contaminate artifact access truth');

const authBoundArtifact = {
  ...artifact,
  id: 'auth-artifact',
  source: { ...artifact.source, config: { authRequired: true } }
};
const authArtifactProjection = projection(ShareScope.artifact, { state, workspace, record: authBoundArtifact });
assert.equal(authArtifactProjection.accessStatus, ShareAccessStatus.accessBound, 'artifact-scoped auth evidence remains access-bound');

// Workspace member access stays conservative when the exact member binding does not carry auth evidence.
const descriptorTarget = publicTargetFromExternalUrl('https://example.test/shared/viewer.workspace.md', 'workspace');
const memberWorkspace = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { id: 'member', name: 'Documentation' }).workspace;
memberWorkspace.workspaceMemberBindings = [{
  schema: 'tiinex.workspace.memberBinding.v1',
  descriptorTarget,
  memberIdentity: {
    schema: 'tiinex.workspace.memberIdentity.v1',
    kind: 'semantic',
    key: 'semantic:documentation:documentation:github-tree:owner%2Fdocs',
    name: 'documentation',
    label: 'documentation',
    sourceKind: 'github-tree',
    sourceSignature: 'owner/docs'
  }
}];
memberWorkspace.sources.push({ id: 'member-source', adapterId: 'github', repo: 'Owner/Docs' });
memberWorkspace.sources.push({ id: 'private-extra', adapterId: 'github', repo: 'Private/Extra', authRequired: true });
const memberState = { ...lifecycle.makeEmptyAppState(), workspaces: [memberWorkspace], activeWorkspaceId: memberWorkspace.id };
const memberProjection = projection(ShareScope.workspace, { state: memberState, workspace: memberWorkspace });
assert.equal(memberProjection.targetStatus, ShareTargetStatus.available);
assert.equal(memberProjection.publicTarget?.targetKind, 'workspace.member');
assert.equal(memberProjection.accessStatus, ShareAccessStatus.unknown, 'unrelated additional workspace source cannot contaminate exact member access truth');

// Workspace-set is anchored to the descriptor record for local/source truth.
const localDescriptor = {
  id: 'local-descriptor',
  title: 'Local descriptor',
  path: 'local.workspace.md',
  markdown: '# Local workspace',
  sourceMode: 'local-draft',
  source: { id: 'local', adapterId: 'local', sourceKind: 'local.session' },
  workspaceArtifactRole: { openEligible: true }
};
const localArtifactProjection = projection(ShareScope.artifact, { state, workspace, record: localDescriptor });
const localWorkspaceSetProjection = projection(ShareScope.workspaceSet, { state, workspace, record: localDescriptor });
for (const result of [localArtifactProjection, localWorkspaceSetProjection]) {
  assert.equal(result.publicTarget, null);
  assert.equal(result.publicUrl, '');
  assert.equal(result.targetStatus, ShareTargetStatus.localOnly);
  assert.equal(result.accessStatus, ShareAccessStatus.notApplicable);
  assert(result.warnings.some((warning) => warning.code === 'share.local-only'));
}

// Descriptor-scoped auth evidence remains scoped to the descriptor when a reconstructive target exists.
const descriptorUrl = 'https://example.test/shared/source.workspace.md';
const authDescriptor = {
  id: 'auth-descriptor',
  title: 'Auth descriptor',
  path: 'source.workspace.md',
  sourceMode: 'source-backed',
  source: { id: 'descriptor-source', adapterId: 'web', sourceKind: 'web.markdown', url: descriptorUrl, authRequired: true },
  sourceTarget: { inputTarget: descriptorUrl },
  workspaceArtifactRole: { openEligible: true }
};
const descriptorProjection = projection(ShareScope.workspaceSet, { state, workspace, record: authDescriptor });
assert.equal(descriptorProjection.targetStatus, ShareTargetStatus.available);
assert.equal(descriptorProjection.accessStatus, ShareAccessStatus.accessBound);

console.log('✓ M3-B2 Share projection access/local scope truth closure tests passed');

function projection(scope, values = {}) {
  return projectShareTruth({
    scope,
    publicViewerUrl,
    exactStateBaseUrl,
    routeCodec: route,
    persistenceCodec: persistence,
    ...values
  });
}
