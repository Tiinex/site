import assert from 'node:assert/strict';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { mergeWorkspaceRecordAction, openWorkspaceRecordAction } from './workspaceRecordActions.js';

await import('../sources/source.identity.js');
await import('../workspaces/workspace.lifecycle.js');
await import('../workspaces/workspace.config.js');
const lifecycle = globalThis.TiinexWorkspaceLifecycle;
const parseWorkspaceConfig = globalThis.TiinexWorkspaceConfig.parseWorkspaceConfig;

function workspaceMarkdown(title, body = '') {
  return `# Continuity Context\n\n- Current\n  - Current Schema: [tiinex.workspace.v1](schema.md)\n  - Summary: ${title}.\n\n---\n\n# ${title}\n\n${body}\n`;
}

function workspaceRecord(title, path, body = '') {
  return Object.assign(createRecordFromMarkdown(workspaceMarkdown(title, body), { path, sourceMode: 'source-backed' }), {
    title,
    path,
    sourceMode: 'source-backed',
    schemaId: 'tiinex.workspace.v1',
    currentSchemaId: 'tiinex.workspace.v1',
    kind: 'tiinex.workspace.v1'
  });
}

function seedChooser() {
  let state = lifecycle.makeEmptyAppState();
  const created = lifecycle.createWorkspace(state, { name: 'Chooser' }, { clock: () => '2026-08-05T00:00:00.000Z' });
  state = created.state;
  const source = lifecycle.addWorkspaceSource(state, created.workspace.id, { repository: 'Tiinusen/socials', ref: 'master', rootPath: '.topics', label: 'Tiinusphere', repoDiscovery: false, issueDiscovery: true, issueUrls: 'https://github.com/Tiinusen/socials/issues/1' });
  state = source.state;
  const parent = workspaceRecord('Tiinusphere', '.topics/issue-root-recovered-tiinusphere.workspace.md', `## Workspace Entrypoints\n\n### Tiinusphere\n\n- Source Kind: github-tree\n- Workspace Label: Tiinusphere\n- Repository: Tiinusen/socials\n- Ref: master\n- Root Path: .topics\n- Repo Files Discovery: off\n- Issue Discovery: on\n- Issue URL: https://github.com/Tiinusen/socials/issues/1\n`);
  const child = workspaceRecord('Hobbies', '.topics/comment-001-recovered-hobbies.workspace.md');
  const loaded = lifecycle.addWorkspaceSourceRecords(state, created.workspace.id, source.source.id, [parent, child], { discoveryState: 'loaded' });
  assert.equal(loaded.ok, true);
  return loaded.state;
}

let state = seedChooser();
const sourceWorkspace = lifecycle.activeWorkspace(state);
assert.equal(sourceWorkspace.records.length, 2);

const opened = openWorkspaceRecordAction({
  lifecycle,
  parseWorkspaceConfig,
  state,
  record: sourceWorkspace.records.find((record) => record.title === 'Tiinusphere')
});
assert.equal(opened.ok, true, opened.error || opened.message);
const active = lifecycle.activeWorkspace(opened.state);
assert.equal(active.title, 'Tiinusphere');
assert.deepEqual(active.records.map((record) => record.title), [], 'Open replaces chooser material with the exact workspace artifact context before source loading');
assert.equal(opened.state.workspaces.length, 1, 'Open replaces the multi-workspace session with the opened workspace entrypoint set');
assert.equal(active.sources.some((item) => item.label === 'Tiinusphere' && item.discoveryState === 'deferred'), true, 'opened workspace registers its configured source boundary');
assert.equal(opened.sourceInputs.length, 1, 'Open returns source materialization inputs for the caller to load');
assert.equal(opened.sourceInputs[0].workspaceId, active.id, 'source materialization input targets the opened workspace');
assert.equal(opened.sourceInputs[0].issueUrls, 'https://github.com/Tiinusen/socials/issues/1', 'source materialization input preserves explicit issue target');

state = seedChooser();
const mergeTarget = lifecycle.createWorkspace(state, { name: 'Notes' }, { clock: () => '2026-08-05T00:01:00.000Z' });
state = mergeTarget.state;
const mergeSourceWorkspace = state.workspaces.find((workspace) => workspace.title === 'Chooser');
const mergeRecord = mergeSourceWorkspace.records.find((record) => record.title === 'Tiinusphere');
const mergedMissing = mergeWorkspaceRecordAction({ lifecycle, parseWorkspaceConfig, state, workspaceId: mergeSourceWorkspace.id, record: mergeRecord });
assert.equal(mergedMissing.ok, true, mergedMissing.error || mergedMissing.message);
assert.equal(mergedMissing.state.workspaces.some((workspace) => workspace.title === 'Tiinusphere'), true, 'Merge opens missing workspace entrypoints instead of mutating only the chooser workspace');
assert.equal(mergedMissing.sourceInputs.length, 1, 'Merge queues loading for a newly opened workspace entrypoint');
assert.equal(mergedMissing.state.activeWorkspaceId, mergeTarget.workspace.id, 'Merge preserves the current active workspace when it adds missing workspace columns');

let loadedMergedState = mergedMissing.state;
const tiinusphere = loadedMergedState.workspaces.find((workspace) => workspace.title === 'Tiinusphere');
const sourceForMerged = tiinusphere.sources.find((source) => source.label === 'Tiinusphere');
loadedMergedState = lifecycle.addWorkspaceSourceRecords(loadedMergedState, tiinusphere.id, sourceForMerged.id, [{ title: 'Hobbies', path: '.topics/hobbies.workspace.md', markdown: '# Hobbies', sourceMode: 'source-backed' }], { discoveryState: 'loaded' }).state;
const noOpMerge = mergeWorkspaceRecordAction({ lifecycle, parseWorkspaceConfig, state: loadedMergedState, workspaceId: mergeSourceWorkspace.id, record: mergeRecord });
assert.equal(noOpMerge.ok, true, noOpMerge.error || noOpMerge.message);
assert.equal(noOpMerge.state.workspaces.filter((workspace) => workspace.title === 'Tiinusphere').length, 1, 'Merge does not duplicate an already open matching workspace');
assert.equal(noOpMerge.sourceInputs.length, 0, 'Merge does not queue discovery when an already open workspace source is loaded and matching');

console.log('✓ workspaceRecordActions tests passed');
