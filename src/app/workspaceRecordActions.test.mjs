import assert from 'node:assert/strict';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { mergeWorkspaceRecordAction, openWorkspaceRecordAction } from './workspaceRecordActions.js';

await import('../workspaces/workspace.lifecycle.js');
const lifecycle = globalThis.TiinexWorkspaceLifecycle;

function workspaceMarkdown(title = 'Opened Workspace') {
  return `# ${title}\n\n- Browser Title: ${title}\n`;
}

function sourceEntrypointMarkdown(title = 'Source Entrypoint') {
  return `# ${title}\n\n- Tiinex Workspace Entrypoints\n  - Repository: Tiinusen/socials\n    Workspace Label: Gaming\n    Issue Discovery: true\n    Repo Files Discovery: false\n`;
}

function parseWorkspaceConfig(markdown = '') {
  if (!/Tiinex Workspace Entrypoints/i.test(markdown)) return { workspaceEntrypoints: [] };
  return { workspaceEntrypoints: [{ repository: 'Tiinusen/socials', workspaceLabel: 'Gaming', issueDiscovery: true, repoFilesDiscovery: false, rootPath: '.topics' }] };
}

const first = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { name: 'M.O.W.S' }, { clock: () => '2026-08-08T00:00:00.000Z' });
let state = first.state;
const sourceWorkspaceId = first.workspace.id;
const draftWorkspaceCreated = lifecycle.createWorkspace(state, { name: 'Local draft notes' }, { clock: () => '2026-08-08T00:00:01.000Z' });
const draftWorkspaceId = draftWorkspaceCreated.workspace.id;
const draftAdded = lifecycle.addWorkspaceRecord(draftWorkspaceCreated.state, draftWorkspaceId, { title: 'Unpublished local draft', path: 'draft.trace.md', markdown: '# Draft', sourceMode: 'local-draft', status: 'draft' });
state = draftAdded.state;
state.activeWorkspaceId = sourceWorkspaceId;
state.view = { universe: 'column', workspaceVerse: 'lineage', selectedRecordId: 'some-record', lineageQuery: 'parent', expandedLineageRecordIds: ['some-record'], lineageAuditReport: { stale: true }, lineageLoadReport: { stale: true } };

const record = createRecordFromMarkdown(workspaceMarkdown('FS25 Markaryd'), { path: '.topics/.github/tiinusen/socials/.issues/3/000-fs25-markaryd.workspace.md' });
const opened = openWorkspaceRecordAction({ lifecycle, parseWorkspaceConfig, state, record });
assert.equal(opened.ok, true, opened.error);
assert.equal(opened.workspace.title, 'Fs25 Markaryd');
assert.equal(opened.state.workspaces.some((workspace) => workspace.id === sourceWorkspaceId), false, 'Open replaces the previous non-draft workspace like PoC');
assert.equal(opened.state.workspaces.some((workspace) => workspace.id === draftWorkspaceId), true, 'Open preserves workspaces that contain durable unpublished local material');
assert.deepEqual(opened.openBoundary.closedNonDraftWorkspaces, [sourceWorkspaceId], 'Open reports the non-draft workspace it replaced');
assert.equal(opened.state.activeWorkspaceId, opened.workspace.id, 'open focuses the opened workspace');
assert.equal(Boolean(opened.state.workspaceViews?.[sourceWorkspaceId]), false, 'closed workspace view state does not survive Open replacement');
assert.equal(opened.state.view.workspaceVerse, 'feed', 'opened workspace starts from a clean feed view');
assert.equal(opened.state.view.selectedRecordId, '', 'opened workspace cannot inherit a selected record from another workspace');

const mergeResult = mergeWorkspaceRecordAction({ lifecycle, parseWorkspaceConfig, state, workspaceId: sourceWorkspaceId, record });
assert.equal(mergeResult.ok, true, mergeResult.error);
assert.equal(mergeResult.state.activeWorkspaceId, sourceWorkspaceId, 'merge keeps active workspace identity');
assert.equal(Object.prototype.hasOwnProperty.call(mergeResult.workspace, 'workspaceMergeCandidates'), false, 'workspace artifact merge must stay on canonical records without legacy candidate runtime shape');
assert.equal(mergeResult.workspace.workspaceMergedEntries.length, 1, 'workspace artifact merge records context metadata on the canonical workspace');
assert.equal(mergeResult.merge.mode, 'artifact-context', 'workspace artifact merge uses the canonical artifact-context contract');

const sourceEntrypointRecord = createRecordFromMarkdown(sourceEntrypointMarkdown('Gaming config'), { path: '000-gaming.workspace.md' });
const openedEntrypoint = openWorkspaceRecordAction({ lifecycle, parseWorkspaceConfig, state, record: sourceEntrypointRecord });
assert.equal(openedEntrypoint.ok, true, openedEntrypoint.error);
assert.equal(openedEntrypoint.openedWorkspaceSet, true, 'workspace entrypoint Open reports that it opened the configured workspace set');
assert.equal(openedEntrypoint.state.workspaces.some((workspace) => workspace.id === sourceWorkspaceId), false, 'workspace entrypoint Open replaces the previous non-draft workspace');
assert.equal(openedEntrypoint.state.workspaces.some((workspace) => workspace.id === draftWorkspaceId), true, 'workspace entrypoint Open preserves durable local work');
assert(openedEntrypoint.sourceInputs.some((input) => input.repository === 'Tiinusen/socials' && input.issueDiscovery === true), 'source entrypoint open queues issue discovery source loading');
assert.equal(openedEntrypoint.state.activeWorkspaceId, openedEntrypoint.workspace.id, 'source entrypoint open focuses the new workspace');

console.log('✓ workspaceRecordActions tests passed');
