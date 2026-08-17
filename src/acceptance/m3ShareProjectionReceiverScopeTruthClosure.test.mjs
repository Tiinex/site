import assert from 'node:assert/strict';
import '../workspaces/workspace.config.js';
import '../workspaces/workspace.lifecycle.js';
import '../workspaces/workspace.route.js';
import '../workspaces/workspace.persistence.js';
import {
  PublicTargetRestoreCapability,
  publicTargetRestoreCapability
} from '../app/publicTarget.js';
import { runPublicTargetRestoreCommand } from '../app/publicTargetRestoreCommand.js';
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
const exactStateBaseUrl = 'https://sender.example/app';

// Receiver capability is canonical: a descriptive generic URL is not reconstructively available while M3-A rejects it.
const genericUrl = 'https://example.test/page';
const genericRecord = recordFromUrl('generic', 'Generic page', genericUrl);
const genericState = createStateWithRecords(genericRecord);
const genericWorkspace = genericState.workspaces[0];
const genericProjection = projectShareTruth({
  scope: ShareScope.artifact,
  state: genericState,
  workspace: genericWorkspace,
  record: genericRecord,
  publicViewerUrl,
  exactStateBaseUrl,
  routeCodec: route,
  persistenceCodec: persistence
});
assert.equal(genericProjection.publicTarget?.targetKind, 'web.url');
assert.equal(genericProjection.restoreCapability, PublicTargetRestoreCapability.unsupported);
assert.equal(publicTargetRestoreCapability(genericProjection.publicTarget), PublicTargetRestoreCapability.unsupported);
assert.equal(genericProjection.targetStatus, ShareTargetStatus.unavailable);
assert.equal(genericProjection.publicUrl, '');
assert.equal(genericProjection.accessStatus, ShareAccessStatus.notApplicable);
assert.deepEqual(genericProjection.allowedActions, []);
assert(genericProjection.warnings.some((warning) => warning.code === 'share.public-target-unsupported'));
const genericReceiver = await runPublicTargetRestoreCommand({ target: genericProjection.publicTarget, runtimeApi });
assert.equal(genericReceiver.ok, false);
assert.equal(genericReceiver.error, 'public-target.unsupported');

// A supported Markdown target remains reconstructively available and succeeds through the same M3-A receiver.
const markdownUrl = 'https://example.test/topic.trace.md';
const markdownRecord = recordFromUrl('markdown', 'Markdown topic', markdownUrl);
const markdownState = createStateWithRecords(markdownRecord);
const markdownProjection = projectShareTruth({
  scope: ShareScope.artifact,
  state: markdownState,
  workspace: markdownState.workspaces[0],
  record: markdownRecord,
  publicViewerUrl,
  exactStateBaseUrl,
  routeCodec: route,
  persistenceCodec: persistence
});
assert.equal(markdownProjection.publicTarget?.targetKind, 'web.markdown');
assert.equal(markdownProjection.restoreCapability, PublicTargetRestoreCapability.restorable);
assert.equal(markdownProjection.targetStatus, ShareTargetStatus.available);
assert.deepEqual(markdownProjection.allowedActions, ['copy-public-url']);
const markdownReceiver = await runPublicTargetRestoreCommand({
  target: markdownProjection.publicTarget,
  runtimeApi,
  fetchImpl: async (url) => responseText(String(url) === markdownUrl ? topicMarkdown('Markdown topic') : '', String(url) === markdownUrl)
});
assert.equal(markdownReceiver.ok, true, markdownReceiver.error);
assert.equal(markdownReceiver.record.title, 'Markdown topic');

// Scope truth: workspace A cannot borrow the current A|B/B exact-state URL when B owns current state.
let scopedState = lifecycle.makeEmptyAppState();
scopedState = lifecycle.createWorkspace(scopedState, { id: 'A', name: 'Workspace A' }).state;
scopedState = lifecycle.createWorkspace(scopedState, { id: 'B', name: 'Workspace B' }).state;
const workspaceA = scopedState.workspaces.find((workspace) => workspace.id === 'A');
const workspaceB = scopedState.workspaces.find((workspace) => workspace.id === 'B');
const artifactA = recordFromUrl('artifact-A', 'Artifact A', 'https://example.test/a.trace.md');
workspaceA.records.push(artifactA);
workspaceA.sources.push({ id: 'source-A', adapterId: 'web', sourceKind: 'web.markdown', url: artifactA.sourceTarget.inputTarget });
workspaceB.records.push({ id: 'artifact-B', title: 'Artifact B', path: 'b.trace.md', sourceMode: 'local-draft', source: { id: 'local', adapterId: 'local' } });
scopedState.activeWorkspaceId = 'B';
scopedState.view = Object.assign({}, scopedState.view, { workspaceVerse: 'lineage', selectedRecordId: 'artifact-B' });

const workspaceAProjection = projectShareTruth({
  scope: ShareScope.workspace,
  state: scopedState,
  workspace: workspaceA,
  publicViewerUrl,
  exactStateBaseUrl,
  routeCodec: route,
  persistenceCodec: persistence
});
assert.equal(workspaceAProjection.publicTarget, null);
assert.equal(workspaceAProjection.exactStateUrl, '');
assert.equal(workspaceAProjection.targetStatus, ShareTargetStatus.unavailable);
assert.deepEqual(workspaceAProjection.allowedActions, []);

// Artifact A remains artifact-scoped and may offer its public target, but never the unrelated current exact-state URL.
const artifactAProjection = projectShareTruth({
  scope: ShareScope.artifact,
  state: scopedState,
  workspace: workspaceA,
  record: artifactA,
  publicViewerUrl,
  exactStateBaseUrl,
  routeCodec: route,
  persistenceCodec: persistence
});
assert.equal(artifactAProjection.targetStatus, ShareTargetStatus.available);
assert.equal(artifactAProjection.exactStateUrl, '');
assert.deepEqual(artifactAProjection.allowedActions, ['copy-public-url']);

// Current scope alone owns the current semantic multi-workspace #state.
const currentProjection = projectShareTruth({
  scope: ShareScope.current,
  state: scopedState,
  workspace: workspaceB,
  record: workspaceB.records[0],
  publicViewerUrl,
  exactStateBaseUrl,
  routeCodec: route,
  persistenceCodec: persistence
});
assert.equal(currentProjection.targetStatus, ShareTargetStatus.exactViewOnly);
assert.deepEqual(currentProjection.allowedActions, ['copy-exact-state-url']);
const currentUrl = new URL(currentProjection.exactStateUrl);
const decoded = persistence.decodeState(currentUrl.hash.replace(/^#state=/, ''));
assert.equal(decoded.activeWorkspaceId, 'B');
assert.deepEqual(decoded.workspaces.map((workspace) => workspace.id), ['A', 'B']);

console.log('✓ M3-B2 Share projection receiver/scope truth closure tests passed');

function createStateWithRecords(...records) {
  const out = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { id: 'share', name: 'Share' }).state;
  out.workspaces[0].records.push(...records);
  return out;
}

function recordFromUrl(id, title, url) {
  return {
    id,
    title,
    path: new URL(url).pathname.split('/').pop(),
    sourceMode: 'source-backed',
    source: { id: `source-${id}`, adapterId: 'web', sourceKind: 'web.url', url },
    sourceTarget: { inputTarget: url }
  };
}

function topicMarkdown(title) {
  return `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)\n- Current\n  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)\n  - Created At: 2026-08-14\n  - Summary: Share receiver truth fixture.\n\n---\n\n# ${title}\n\nPublic material.\n`;
}

function responseText(text, ok = true) {
  return { ok, status: ok ? 200 : 404, statusText: ok ? 'OK' : 'Not Found', text: async () => text };
}
