import assert from 'node:assert/strict';
import '../workspaces/workspace.config.js';
await import('../workspaces/workspace.lifecycle.js');
import { prepareResolvedStartupWorkspaceCommand, stableStartupWorkspaceId } from './startupWorkspaceCommand.js';
const lifecycle = globalThis.TiinexWorkspaceLifecycle;
const resolved = {
  ok: true,
  startupClass: 'explicit-runtime-config',
  configUrl: 'https://example.test/viewer.workspace.md',
  markdown: '# Tiinex Viewer\n\n## Workspace Entrypoints\n',
  diagnostics: { selectedConvention: 'query' },
  config: { viewerIdentity: { browserTitle: 'Hosted' } },
  input: { repository: 'Tiinex/docs', rootPath: '.topics', label: 'Hosted docs', operation: 'materialize' }
};
let hydratedId = '';
const persistence = { hydrateWorkspaceWithLocalDeltas(state, workspaceId) { hydratedId = workspaceId; return state; } };
const result = prepareResolvedStartupWorkspaceCommand({ lifecycle, persistence, state: lifecycle.makeEmptyAppState(), resolved, storage: {} });
assert.equal(result.ok, true);
assert.equal(result.workspace.id, stableStartupWorkspaceId(resolved.configUrl));
assert.equal(hydratedId, result.workspace.id);
assert.equal(result.workspace.workspaceMarkdown, resolved.markdown);
assert.equal(result.workspace.workspaceBootstrap.startState, 'explicit-runtime-config');
assert.equal(result.sourceInput.repository, 'Tiinex/docs');
assert.equal(Object.prototype.hasOwnProperty.call(result.workspace, 'workspaceMergeCandidates'), false, 'startup workspace remains canonical record runtime');

const multiResolved = {
  ok: true,
  startupClass: 'hosted-config',
  configUrl: 'https://tiinex.dev/#embedded-workspace',
  markdown: '# Hosted workspace set',
  diagnostics: { selectedConvention: 'github-issue-embedded-workspace' },
  config: { viewerIdentity: { browserTitle: 'Tiinex' } },
  inputs: [
    { repository: 'Tiinex/site', rootPath: '.topics/news', label: 'News', operation: 'materialize' },
    { repository: 'Tiinex/docs', rootPath: '.topics/documentation', label: 'Documentation', operation: 'materialize' }
  ]
};
const multi = prepareResolvedStartupWorkspaceCommand({ lifecycle, persistence: { hydrateWorkspaceWithLocalDeltas: (state) => state }, state: lifecycle.makeEmptyAppState(), resolved: multiResolved, storage: {} });
assert.equal(multi.ok, true);
assert.deepEqual(multi.state.workspaces.map((workspace) => workspace.title), ['News', 'Documentation'], 'PoC-compatible startup preserves the configured entrypoint workspace set/order');
assert.equal(multi.state.activeWorkspaceId, multi.workspaces[0].id, 'first configured entrypoint owns initial focus');
assert.deepEqual(multi.sourceInputs.map((input) => input.label), ['News', 'Documentation'], 'every configured entrypoint receives its own source materialization input');

console.log('✓ startup workspace command tests passed');
