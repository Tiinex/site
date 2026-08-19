import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import '../workspaces/workspace.config.js';
import '../workspaces/workspace.lifecycle.js';
import '../workspaces/workspace.route.js';
import '../workspaces/workspace.persistence.js';
import { parsePublicTargetHash } from '../app/publicTarget.js';
import { runPublicTargetRestoreCommand } from '../app/publicTargetRestoreCommand.js';
import { executeShareProjectionAction } from '../app/shareActionCommand.js';
import { projectShareTruth, ShareScope } from '../app/shareProjection.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;
const config = globalThis.TiinexWorkspaceConfig;
const route = globalThis.TiinexWorkspaceRoute;
const persistence = globalThis.TiinexWorkspacePersistence;
const runtimeApi = { lifecycle, config };
const publicViewerUrl = 'https://viewer.example/app';
const exactStateBaseUrl = 'https://sender.example/app?mode=viewer';

function projection(input = {}) {
  return projectShareTruth(Object.assign({ publicViewerUrl, exactStateBaseUrl, routeCodec: route, persistenceCodec: persistence }, input));
}
function clipboardCapture() {
  const writes = [];
  return { writes, clipboard: { writeText: async (value) => { writes.push(String(value)); } } };
}

// ARTIFACT: a source-backed Topic copies its reconstructive artifact URL, never the current #state route.
const topicUrl = 'https://example.test/shared/topic.trace.md';
const topicState = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { id: 'topic-w', name: 'Topic workspace' }).state;
const topicWorkspace = lifecycle.activeWorkspace(topicState);
const topicRecord = sourceRecord('topic', 'Public Topic', topicUrl);
topicWorkspace.records.push(topicRecord);
const topicShare = projection({ scope: ShareScope.artifact, state: topicState, workspace: topicWorkspace, record: topicRecord });
const topicClipboard = clipboardCapture();
const topicAction = await executeShareProjectionAction({ projection: topicShare, clipboard: topicClipboard.clipboard, label: topicRecord.title });
assert.equal(topicAction.ok, true);
assert.deepEqual(topicClipboard.writes, [topicShare.publicUrl]);
assert.equal(topicClipboard.writes[0].includes('#state='), false, 'artifact Share must not copy current semantic state');
const topicReceiver = await restoreProjection(topicShare, async (url) => responseText(url === topicUrl ? topicMarkdown('Public Topic') : '', url === topicUrl));
assert.equal(topicReceiver.ok, true, topicReceiver.error);
assert.equal(topicReceiver.record.title, 'Public Topic');

// Local artifact: no hidden fallback to current URL and no clipboard success claim.
const localRecord = { id: 'local', title: 'Local draft', path: 'draft.md', markdown: '# Draft', sourceMode: 'local-draft', source: { id: 'local', adapterId: 'local', sourceKind: 'local.session' } };
topicWorkspace.records.push(localRecord);
const localShare = projection({ scope: ShareScope.artifact, state: topicState, workspace: topicWorkspace, record: localRecord });
const localClipboard = clipboardCapture();
const localAction = await executeShareProjectionAction({ projection: localShare, clipboard: localClipboard.clipboard, label: localRecord.title });
assert.equal(localAction.ok, false);
assert.deepEqual(localClipboard.writes, []);
assert.match(localAction.notice, /browser-local/i);

// Workspace Artifact ordinary Share remains artifact intent and does not apply the descriptor set.
const descriptorUrl = 'https://example.test/shared/viewer.workspace.md';
const descriptorBody = descriptorMarkdown();
const descriptorRecord = workspaceRecord('descriptor', descriptorUrl, descriptorBody);
const descriptorArtifactShare = projection({ scope: ShareScope.artifact, state: topicState, workspace: topicWorkspace, record: descriptorRecord });
const descriptorClipboard = clipboardCapture();
await executeShareProjectionAction({ projection: descriptorArtifactShare, clipboard: descriptorClipboard.clipboard, label: descriptorRecord.title });
assert.deepEqual(descriptorClipboard.writes, [descriptorArtifactShare.publicUrl]);
const descriptorArtifactReceiver = await restoreProjection(descriptorArtifactShare, async (url) => responseText(String(url) === descriptorUrl ? descriptorBody : '', String(url) === descriptorUrl));
assert.equal(descriptorArtifactReceiver.workspaceTarget, false);
assert.equal(descriptorArtifactReceiver.state.workspaces.some((workspace) => ['News', 'Documentation'].includes(workspace.name)), false);

// WORKSPACE: descriptor application establishes B1 authority, then Share workspace Documentation reconstructs Documentation only.
const descriptorSetShare = projection({ scope: ShareScope.workspaceSet, state: topicState, record: descriptorRecord });
const descriptorSetReceiver = await restoreProjection(descriptorSetShare, async (url) => responseText(String(url) === descriptorUrl ? descriptorBody : '', String(url) === descriptorUrl));
assert.deepEqual(descriptorSetReceiver.state.workspaces.map((workspace) => workspace.name), ['News', 'Documentation']);
const documentation = descriptorSetReceiver.state.workspaces.find((workspace) => workspace.name === 'Documentation');
const documentationShare = projection({ scope: ShareScope.workspace, state: descriptorSetReceiver.state, workspace: documentation });
const workspaceClipboard = clipboardCapture();
const workspaceAction = await executeShareProjectionAction({ projection: documentationShare, clipboard: workspaceClipboard.clipboard, label: documentation.name });
assert.equal(workspaceAction.ok, true);
assert.deepEqual(workspaceClipboard.writes, [documentationShare.publicUrl]);
const documentationReceiver = await restoreProjection(documentationShare, async (url) => responseText(String(url) === descriptorUrl ? descriptorBody : '', String(url) === descriptorUrl));
assert.deepEqual(documentationReceiver.state.workspaces.map((workspace) => workspace.name), ['Documentation']);

// An unbound workspace cannot borrow a public Topic target.
const unbound = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { id: 'unbound', name: 'Unbound' }).workspace;
unbound.records.push(topicRecord);
const unboundShare = projection({ scope: ShareScope.workspace, state: { workspaces: [unbound], activeWorkspaceId: unbound.id }, workspace: unbound });
const unboundClipboard = clipboardCapture();
const unboundAction = await executeShareProjectionAction({ projection: unboundShare, clipboard: unboundClipboard.clipboard, label: unbound.name });
assert.equal(unboundAction.ok, false);
assert.deepEqual(unboundClipboard.writes, []);

// Workspace member with local material still copies the reconstructive member URL and surfaces the warning.
const mixed = structuredClone(documentation);
mixed.id = 'mixed';
mixed.records.push(localRecord);
const mixedShare = projection({ scope: ShareScope.workspace, state: { workspaces: [mixed], activeWorkspaceId: mixed.id }, workspace: mixed });
const mixedClipboard = clipboardCapture();
const mixedAction = await executeShareProjectionAction({ projection: mixedShare, clipboard: mixedClipboard.clipboard, label: mixed.name });
assert.equal(mixedAction.ok, true);
assert.deepEqual(mixedClipboard.writes, [mixedShare.publicUrl]);
assert.match(mixedAction.notice, /Browser-local material is not included/i);

// CURRENT/GLOBAL: explicit current scope copies side-effect-free multi-workspace #state and never selected artifact target.
let currentState = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { id: 'a', name: 'A' }).state;
currentState = lifecycle.createWorkspace(currentState, { id: 'b', name: 'B' }).state;
currentState.activeWorkspaceId = 'b';
const currentShare = projection({ scope: ShareScope.current, state: currentState, workspace: currentState.workspaces[1], record: topicRecord });
const currentClipboard = clipboardCapture();
const currentAction = await executeShareProjectionAction({ projection: currentShare, clipboard: currentClipboard.clipboard });
assert.equal(currentAction.ok, true);
assert.deepEqual(currentClipboard.writes, [currentShare.exactStateUrl]);
assert.equal(currentClipboard.writes[0].includes('#state='), true);
const currentUrl = new URL(currentClipboard.writes[0]);
const decodedCurrent = persistence.decodeState(currentUrl.hash.replace(/^#state=/, ''));
assert.deepEqual(decodedCurrent.workspaces.map((workspace) => workspace.id), ['a', 'b']);
assert.equal(decodedCurrent.activeWorkspaceId, 'b');
assert.match(currentAction.notice, /exact link to the current view/i);

// Product wiring consumes projection truth instead of the old generic current-URL Share path.
const appSource = readFileSync(new URL('../app/TiinexApp.jsx', import.meta.url), 'utf8');
const workspaceViewSource = readFileSync(new URL('../schemas/workspace/workspace.views.jsx', import.meta.url), 'utf8');
const dialogsSource = readFileSync(new URL('../schemas/workspace/workspace.recordDialogs.views.jsx', import.meta.url), 'utf8');
const actionsSource = readFileSync(new URL('../actions/record.actions.js', import.meta.url), 'utf8');
assert.equal(appSource.includes('copyShareUrl'), false, 'generic current URL Share owner is removed');
assert.equal(appSource.includes("flush?.('share-url')"), false, 'Share no longer depends on persistence flush to calculate a link');
assert.match(appSource, /projectShareTruth/);
assert.match(appSource, /executeShareProjectionAction/);
assert.match(appSource, /shareProjectionFor\(ShareScope\.artifact/);
assert.match(appSource, /shareProjectionFor\(ShareScope\.workspace/);
assert.match(appSource, /shareProjectionFor\(ShareScope\.current/);
assert.match(appSource, /onShareWorkspace=\{\(\) => historicalResolved \? shareCurrent\(\) : shareWorkspace\(workspace\.id\)\}/, 'visible live workspace Share receives clicked workspace explicitly while historical review shares exact current route state');
assert.match(appSource, /onShare=\{shareCurrent\}/, 'Global Dock Share is explicit current scope');
const shareRecordBody = appSource.match(/async function shareRecord[\s\S]*?\n  }/)?.[0] || '';
assert.equal(shareRecordBody.includes('focusWorkspaceForInteraction'), false, 'Record Share target correctness does not depend on focus mutation');
const addIndex = workspaceViewSource.indexOf('aria-label="Add to workspace"');
const workspaceShareIndex = workspaceViewSource.indexOf('aria-label="Share workspace"');
const renameIndex = workspaceViewSource.indexOf('aria-label="Rename workspace"');
assert(addIndex >= 0 && workspaceShareIndex > addIndex && renameIndex > workspaceShareIndex, 'expanded workspace Share sits naturally beside Add before secondary workspace actions');
const compactBlock = workspaceViewSource.slice(workspaceViewSource.indexOf("if (layoutMode === 'compact')"), workspaceViewSource.indexOf('return (', workspaceViewSource.indexOf("if (layoutMode === 'compact')") + 30));
assert.equal(compactBlock.includes('Share workspace'), false, 'compact workspace does not blindly gain another control');
assert.equal(dialogsSource.includes('Share session'), false);
assert.equal(dialogsSource.includes('Share parent session'), false);
assert.match(dialogsSource, /Share artifact/);
assert.match(dialogsSource, /Share parent artifact/);
assert.match(actionsSource, /label: 'Share artifact'/);

console.log('✓ M3-B3 Share Action Consumption tests passed');

async function restoreProjection(shareProjection, fetchImpl) {
  return runPublicTargetRestoreCommand({
    target: parsePublicTargetHash(new URL(shareProjection.publicUrl).hash),
    runtimeApi,
    fetchImpl,
    runGithubOperation: async (context = {}) => ({ ok: true, state: context.state })
  });
}

function sourceRecord(id, title, url) {
  return { id, title, path: new URL(url).pathname.split('/').pop(), sourceMode: 'source-backed', source: { id: `source:${id}`, adapterId: 'web', sourceKind: 'web.markdown', url }, sourceTarget: { inputTarget: url } };
}
function workspaceRecord(id, url, markdown) {
  return { id, title: 'Workspace descriptor', path: new URL(url).pathname.split('/').pop(), markdown, sourceMode: 'source-backed', source: { id: 'descriptor-source', adapterId: 'web', sourceKind: 'web.markdown', url }, sourceTarget: { inputTarget: url, sourceArtifactPath: new URL(url).pathname.replace(/^\//, '') }, workspaceArtifactRole: { openEligible: true } };
}
function descriptorMarkdown() {
  return `# Shared descriptor\n\n## Workspace Entrypoints\n\n### News\n- Source Kind: github-tree\n- Repository: Owner/News\n- Workspace Label: News\n- Open On Apply: true\n\n### Hidden\n- Source Kind: github-tree\n- Repository: Owner/Hidden\n- Workspace Label: Hidden\n- Open On Apply: false\n\n### Documentation\n- Source Kind: github-tree\n- Repository: Owner/Docs\n- Workspace Label: Documentation\n`;
}
function topicMarkdown(title) {
  return `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)\n- Current\n  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)\n  - Created At: 2026-08-14\n  - Summary: Shared topic.\n\n---\n\n# ${title}\n\nPublic target material.\n`;
}
function responseText(text, ok = true) {
  return { ok, status: ok ? 200 : 404, statusText: ok ? 'OK' : 'Not Found', text: async () => text };
}
