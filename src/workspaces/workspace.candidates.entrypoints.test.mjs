import assert from 'node:assert/strict';
import '../sources/source.identity.js';
import { openWorkspaceCandidate } from './workspace.candidates.js';

await import('./workspace.lifecycle.js');
await import('./workspace.config.js');
const lifecycle = globalThis.TiinexWorkspaceLifecycle;
const parseWorkspaceConfig = globalThis.TiinexWorkspaceConfig.parseWorkspaceConfig;

function documentationWorkspaceMarkdown() {
  return `# Documentation

- Browser Title: Documentation

## Workspace Entrypoints

### Documentation

- Source Kind: github-tree
- Repository: Tiinex/docs
- Root Path: .topics
- Repo Files Discovery: true
- Issue Discovery: false
`;
}

const created = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { name: 'Package A/B/C' }, { clock: () => '2026-08-11T10:00:00.000Z' });
let state = created.state;
const packageWorkspace = lifecycle.activeWorkspace(state);
packageWorkspace.records = [
  { id: 'record:start', title: 'Start sibling', path: 'start.trace.md', markdown: '# Start', source: { id: 'source:origin', adapterId: 'github', repository: 'Tiinex/site' } },
  { id: 'record:news', title: 'News sibling', path: 'news.trace.md', markdown: '# News', source: { id: 'source:origin', adapterId: 'github', repository: 'Tiinex/site' } }
];
packageWorkspace.sources = [{ id: 'source:origin', adapterId: 'github', repository: 'Tiinex/site', repo: 'Tiinex/site', rootPath: '.topics', label: 'Origin package source', discoveryState: 'loaded', count: 2 }];
packageWorkspace.sourceOrder = ['source:origin'];
packageWorkspace.workspaceMergeCandidates = [
  { id: 'candidate:documentation', title: 'Documentation', path: '.topics/documentation/documentation.workspace.md', markdown: documentationWorkspaceMarkdown(), sourceMode: 'source-backed-workspace-file' },
  { id: 'candidate:news', title: 'News', path: '.topics/news/news.workspace.md', markdown: '# News\n' }
];

const opened = openWorkspaceCandidate(lifecycle, state, packageWorkspace.id, 'candidate:documentation', { parseWorkspaceConfig, clock: () => '2026-08-11T10:01:00.000Z' });
assert.equal(opened.ok, true, opened.error);
const openedWorkspace = lifecycle.activeWorkspace(opened.state);

assert.equal(openedWorkspace.title, 'Documentation', 'candidate-open focuses the selected workspace artifact');
assert.equal(openedWorkspace.records.length, 0, 'candidate-open must not own sibling package records');
assert.equal(openedWorkspace.workspaceMergeCandidates.length, 0, 'candidate-open must not own sibling candidates');
assert.equal(openedWorkspace.sources.some((source) => source.id === 'source:origin'), false, 'candidate-open must not inherit origin/package source rows as active source rows');
assert.equal(openedWorkspace.contextReferences[0].sourceWorkspaceId, packageWorkspace.id, 'candidate-open still references origin context for lineage/recovery');
assert.equal(opened.sourceInputs.length, 1, 'candidate-open must return the selected workspace entrypoint source input for materialization');
assert.equal(opened.sourceInputs[0].repository, 'Tiinex/docs');
assert.equal(opened.sourceInputs[0].workspaceId, openedWorkspace.id);
assert.equal(openedWorkspace.sources.some((source) => source.repo === 'Tiinex/docs' && source.discoveryState === 'deferred'), true, 'candidate-open registers selected entrypoint as deferred workspace source');
assert.equal(openedWorkspace.workspaceImport.mode, 'workspace-candidate-entrypoint-opened', 'candidate-open discloses entrypoint-aware open mode');
assert.equal(opened.state.workspaces.some((workspace) => workspace.id === packageWorkspace.id), false, 'candidate Open replaces a source-only origin workspace instead of adding another visible pane');

console.log('✓ workspace candidate entrypoint tests passed');
