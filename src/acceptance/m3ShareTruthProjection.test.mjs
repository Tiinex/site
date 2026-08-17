import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import '../workspaces/workspace.config.js';
import '../workspaces/workspace.lifecycle.js';
import '../workspaces/workspace.route.js';
import '../workspaces/workspace.persistence.js';
import { runPublicTargetRestoreCommand } from '../app/publicTargetRestoreCommand.js';
import { parsePublicTargetHash, publicTargetFromExternalUrl } from '../app/publicTarget.js';
import {
  projectShareTruth,
  ShareAccessStatus,
  ShareScope,
  ShareTargetStatus
} from '../app/shareProjection.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;
const config = globalThis.TiinexWorkspaceConfig;
const route = globalThis.TiinexWorkspaceRoute;
const persistence = globalThis.TiinexWorkspacePersistence;
const runtimeApi = { lifecycle, config };
const publicViewerUrl = 'https://viewer.example/app';
const exactStateBaseUrl = 'https://sender.example/app?mode=viewer#old';

// Artifact scope: explicit provenance yields exactly that artifact target, not the session.
const topicUrl = 'https://example.test/shared/topic.trace.md';
const topicState = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { id: 'topic-w', name: 'Topic workspace' }).state;
const topicWorkspace = lifecycle.activeWorkspace(topicState);
const topicRecord = {
  id: 'topic',
  title: 'Public Topic',
  path: 'topic.trace.md',
  sourceMode: 'source-backed',
  source: { id: 'web-topic', adapterId: 'web', sourceKind: 'web.markdown', url: topicUrl },
  sourceTarget: { inputTarget: topicUrl }
};
topicWorkspace.records.push(topicRecord);
topicState.view = Object.assign({}, topicState.view, { workspaceVerse: 'lineage', selectedRecordId: topicRecord.id });
const topicProjection = projectShareTruth({ scope: ShareScope.artifact, state: topicState, workspace: topicWorkspace, record: topicRecord, publicViewerUrl, exactStateBaseUrl, routeCodec: route, persistenceCodec: persistence });
assert.equal(topicProjection.targetStatus, ShareTargetStatus.available);
assert.equal(topicProjection.publicTarget?.targetKind, 'web.markdown');
assert.equal(topicProjection.publicTarget?.externalTarget, topicUrl);
assert.equal(topicProjection.accessStatus, ShareAccessStatus.unknown, 'sender-loadable HTTPS does not imply recipient access');
assert(topicProjection.publicUrl.startsWith(`${publicViewerUrl}#`));
assert.equal(topicProjection.exactStateUrl, '', 'artifact scope does not borrow the current multi-workspace exact-state URL');
assert.deepEqual(topicProjection.allowedActions, ['copy-public-url']);
const topicReceiver = await runPublicTargetRestoreCommand({
  target: publicTargetFromUrl(topicProjection.publicUrl),
  runtimeApi,
  fetchImpl: async (url) => responseText(url === topicUrl ? topicMarkdown('Public Topic') : '', url === topicUrl)
});
assert.equal(topicReceiver.ok, true, topicReceiver.error);
assert.equal(topicReceiver.record.title, 'Public Topic', 'artifact projection round-trips through the M3-A receiver as the exact artifact');

// Local artifact never receives guessed external provenance even though an exact semantic state URL can be described.
const localRecord = { id: 'local-topic', title: 'Local Topic', path: 'draft.trace.md', markdown: '# Local', sourceMode: 'local-draft', source: { id: 'local', adapterId: 'local', sourceKind: 'local.session' } };
topicWorkspace.records.push(localRecord);
const localProjection = projectShareTruth({ scope: ShareScope.artifact, state: topicState, workspace: topicWorkspace, record: localRecord, publicViewerUrl, exactStateBaseUrl, routeCodec: route, persistenceCodec: persistence });
assert.equal(localProjection.publicTarget, null);
assert.equal(localProjection.publicUrl, '');
assert.equal(localProjection.targetStatus, ShareTargetStatus.localOnly);
assert.equal(localProjection.accessStatus, ShareAccessStatus.notApplicable);
assert(localProjection.warnings.some((warning) => warning.code === 'share.local-only'));

// Workspace descriptor/set target remains a different semantic object from one member.
const descriptorUrl = 'https://example.test/shared/viewer.workspace.md';
const descriptorRecord = workspaceRecord('descriptor', descriptorUrl, descriptorMarkdown());
const descriptorProjection = projectShareTruth({ scope: ShareScope.workspaceSet, state: topicState, record: descriptorRecord, publicViewerUrl, exactStateBaseUrl, routeCodec: route, persistenceCodec: persistence });
assert.equal(descriptorProjection.publicTarget?.targetKind, 'workspace');
const descriptorReceiver = await restoreWorkspaceProjection(descriptorProjection, descriptorMarkdown());
assert.deepEqual(descriptorReceiver.state.workspaces.map((workspace) => workspace.name), ['News', 'Documentation'], 'descriptor/set target preserves Open-On-Apply semantics');

// Exact member authority reconstructs one workspace only.
const documentation = descriptorReceiver.state.workspaces.find((workspace) => workspace.name === 'Documentation');
const workspaceProjection = projectShareTruth({ scope: ShareScope.workspace, state: descriptorReceiver.state, workspace: documentation, publicViewerUrl, exactStateBaseUrl, routeCodec: route, persistenceCodec: persistence });
assert.equal(workspaceProjection.publicTarget?.targetKind, 'workspace.member');
assert.equal(workspaceProjection.targetStatus, ShareTargetStatus.available);
const memberReceiver = await restoreWorkspaceProjection(workspaceProjection, descriptorMarkdown());
assert.deepEqual(memberReceiver.state.workspaces.map((workspace) => workspace.name), ['Documentation'], 'Share workspace projects only the selected runtime workspace, never its descriptor siblings');

// A public artifact contained in a workspace never substitutes for missing workspace authority.
const unbound = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { id: 'unbound', name: 'Unbound' }).workspace;
unbound.records.push(topicRecord);
const unboundProjection = projectShareTruth({ scope: ShareScope.workspace, state: Object.assign({}, topicState, { workspaces: [unbound], activeWorkspaceId: unbound.id }), workspace: unbound, publicViewerUrl, exactStateBaseUrl, routeCodec: route, persistenceCodec: persistence });
assert.equal(unboundProjection.publicTarget, null);
assert.equal(unboundProjection.targetStatus, ShareTargetStatus.unavailable, 'source-backed contents without member authority do not borrow current-session exact state at workspace scope');
assert.equal(unboundProjection.exactStateUrl, '');
assert.deepEqual(unboundProjection.allowedActions, []);
assert.equal(unboundProjection.publicUrl, '');

// Composite provenance cannot claim one single-workspace target.
const composite = structuredClone(documentation);
composite.id = 'composite';
composite.workspaceMemberBindings.push({
  schema: 'tiinex.workspace.memberBinding.v1',
  descriptorTarget: publicTargetFromExternalUrl('https://example.test/shared/other.workspace.md', 'workspace'),
  memberIdentity: Object.assign({}, composite.workspaceMemberBindings[0].memberIdentity, { key: `${composite.workspaceMemberBindings[0].memberIdentity.key}:other` })
});
const compositeProjection = projectShareTruth({ scope: ShareScope.workspace, state: Object.assign({}, descriptorReceiver.state, { workspaces: [composite], activeWorkspaceId: composite.id }), workspace: composite, publicViewerUrl, exactStateBaseUrl, routeCodec: route, persistenceCodec: persistence });
assert.equal(compositeProjection.publicTarget, null);
assert.equal(compositeProjection.targetStatus, ShareTargetStatus.unavailable);
assert.equal(compositeProjection.exactStateUrl, '');

// A reconstructive workspace target remains valid with local material, but truthfully warns that the local delta does not travel.
const mixed = structuredClone(documentation);
mixed.id = 'mixed';
mixed.records.push({ id: 'draft', title: 'Local draft', path: 'draft.md', markdown: '# Draft', sourceMode: 'local-draft', source: { id: 'local', adapterId: 'local', sourceKind: 'local.session' } });
const mixedProjection = projectShareTruth({ scope: ShareScope.workspace, state: Object.assign({}, descriptorReceiver.state, { workspaces: [mixed], activeWorkspaceId: mixed.id }), workspace: mixed, publicViewerUrl, exactStateBaseUrl, routeCodec: route, persistenceCodec: persistence });
assert.equal(mixedProjection.targetStatus, ShareTargetStatus.available);
assert.equal(mixedProjection.publicTarget?.targetKind, 'workspace.member');
assert.equal(mixedProjection.localMaterialWarning?.code, 'share.local-material-not-carried');

// Explicit access-bound evidence stays conservative; otherwise access remains unknown.
const accessBoundRecord = Object.assign({}, topicRecord, { source: Object.assign({}, topicRecord.source, { config: { authRequired: true } }) });
const accessProjection = projectShareTruth({ scope: ShareScope.artifact, state: topicState, workspace: topicWorkspace, record: accessBoundRecord, publicViewerUrl, exactStateBaseUrl, routeCodec: route, persistenceCodec: persistence });
assert.equal(accessProjection.accessStatus, ShareAccessStatus.accessBound);

// Global/current scope means exact semantic state and never silently switches to the selected artifact.
const beforeState = JSON.stringify(topicState);
const currentProjection = projectShareTruth({ scope: ShareScope.current, state: topicState, workspace: topicWorkspace, record: topicRecord, publicViewerUrl, exactStateBaseUrl, routeCodec: route, persistenceCodec: persistence });
assert.equal(currentProjection.publicTarget, null);
assert.equal(currentProjection.publicUrl, '');
assert.equal(currentProjection.targetStatus, ShareTargetStatus.exactViewOnly);
assert(currentProjection.exactStateUrl.includes('#state='));
assert.equal(JSON.stringify(topicState), beforeState, 'projection construction does not mutate workspace state');
assert.deepEqual(currentProjection.allowedActions, ['copy-exact-state-url']);

// Projection owner stays read-only: no clipboard, persistence writes, fetch, publication or export responsibilities.
const projectionSource = readFileSync(new URL('../app/shareProjection.js', import.meta.url), 'utf8');
for (const forbidden of ['navigator.clipboard', '.writeState(', '.clearState(', 'localStorage', 'sessionStorage', 'fetch(', 'publication', 'exportPackage']) {
  assert.equal(projectionSource.includes(forbidden), false, `Share projection must stay side-effect free (${forbidden})`);
}

console.log('✓ M3-B2 Share Truth Projection tests passed');

async function restoreWorkspaceProjection(projection, markdown) {
  return runPublicTargetRestoreCommand({
    target: publicTargetFromUrl(projection.publicUrl),
    runtimeApi,
    fetchImpl: async (url) => responseText(/\.workspace\.md$/i.test(String(url)) ? markdown : '', /\.workspace\.md$/i.test(String(url))),
    runGithubOperation: async (context = {}) => ({ ok: true, state: context.state })
  });
}

function publicTargetFromUrl(value = '') {
  const url = new URL(value);
  return parsePublicTargetHash(url.hash);
}

function topicMarkdown(title) {
  return `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)\n- Current\n  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)\n  - Created At: 2026-08-14\n  - Summary: Public target topic.\n\n---\n\n# ${title}\n\nPublic target material.\n`;
}

function descriptorMarkdown() {
  return `# Shared descriptor\n\n## Workspace Entrypoints\n\n### News\n- Source Kind: github-tree\n- Repository: Owner/News\n- Workspace Label: News\n- Open On Apply: true\n\n### Hidden\n- Source Kind: github-tree\n- Repository: Owner/Hidden\n- Workspace Label: Hidden\n- Open On Apply: false\n\n### Documentation\n- Source Kind: github-tree\n- Repository: Owner/Docs\n- Workspace Label: Documentation\n`;
}

function workspaceRecord(id, url, body) {
  return {
    id,
    title: 'Workspace descriptor',
    path: new URL(url).pathname.split('/').pop(),
    markdown: body,
    source: { adapterId: 'web', url },
    sourceTarget: { inputTarget: url, sourceArtifactPath: new URL(url).pathname.replace(/^\//, '') },
    workspaceArtifactRole: { openEligible: true }
  };
}

function responseText(text, ok = true) {
  return { ok, status: ok ? 200 : 404, statusText: ok ? 'OK' : 'Not Found', text: async () => text };
}
