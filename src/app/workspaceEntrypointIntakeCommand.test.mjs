import assert from 'node:assert/strict';
import '../workspaces/workspace.lifecycle.js';
import '../workspaces/workspace.config.js';
import { runWorkspaceEntrypointIntakeCommand } from './workspaceEntrypointIntakeCommand.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;
const parseWorkspaceConfig = globalThis.TiinexWorkspaceConfig.parseWorkspaceConfig;
const workspaceMarkdown = (title, repo) => `# Tiinex Viewer\n\n## Viewer Identity\n\n- Browser Title: ${title}\n\n## Workspace Entrypoints\n\n### ${title}\n\n- Repository: ${repo}\n- Root Path: .topics\n- Repo Files Discovery: on\n`;
const adapterResult = {
  records: [], assets: [],
  workspaceEntries: [{ path: 'news.workspace.md', title: 'News', markdown: workspaceMarkdown('News', 'Tiinex/site'), sourceMode: 'upload' }]
};

const empty = lifecycle.makeEmptyAppState();
const autoOpened = await runWorkspaceEntrypointIntakeCommand({ lifecycle, state: empty, parseWorkspaceConfig, adapterResult });
assert.equal(autoOpened.ok, true, 'empty page-level workspace drop opens directly');
assert.equal(autoOpened.mode, 'open');
assert.equal(autoOpened.state.workspaces[0].title, 'News');
assert.equal(autoOpened.sourceInputs[0].repository, 'Tiinex/site');

const origin = lifecycle.createWorkspace(empty, { name: 'Origin' }).state;
const choice = await runWorkspaceEntrypointIntakeCommand({ lifecycle, state: origin, parseWorkspaceConfig, adapterResult });
assert.equal(choice.requiresChoice, true, 'page-level workspace drop with an open workspace requires explicit Open/Merge choice');
assert.equal(choice.state.workspaces[0].title, 'Origin', 'choice preparation does not mutate current workspace set');

const opened = await runWorkspaceEntrypointIntakeCommand({ lifecycle, state: origin, parseWorkspaceConfig, adapterResult, mode: 'open' });
assert.equal(opened.ok, true);
assert.equal(opened.state.workspaces.some((workspace) => workspace.title === 'Origin'), false, 'global Open replaces non-draft visible workspace set');
assert.equal(opened.state.workspaces.some((workspace) => workspace.title === 'News'), true);

const merged = await runWorkspaceEntrypointIntakeCommand({ lifecycle, state: origin, parseWorkspaceConfig, adapterResult, mode: 'merge' });
assert.equal(merged.ok, true);
assert.equal(merged.state.workspaces.some((workspace) => workspace.title === 'Origin'), true, 'global Merge retains current workspace set');
assert.equal(merged.state.workspaces.some((workspace) => workspace.title === 'News'), true, 'global Merge adds declared workspace');

const mixed = await runWorkspaceEntrypointIntakeCommand({ lifecycle, state: origin, parseWorkspaceConfig, adapterResult: { ...adapterResult, records: [{ id: 'r', path: 'readme.md' }] } });
assert.equal(mixed.error, 'workspace.entrypoint.mixed-global-material', 'mixed page-level drops must be routed into a concrete workspace instead of silently applying config');

console.log('✓ workspace entrypoint intake command tests passed');
