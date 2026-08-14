import assert from 'node:assert/strict';
import { replaceNonDraftWorkspaceSet, workspaceHasDurableLocalMaterial } from './workspace.openSemantics.js';

const sourceOnly = {
  id: 'workspace:source-only',
  name: 'Source only',
  records: [{ id: 'source:r', path: 'source.md', markdown: '# Source', source: { adapterId: 'github' }, materialRole: { mode: 'source-backed-record' } }],
  assets: [],
  sources: [{ id: 'github', adapterId: 'github' }]
};
const localDraft = {
  id: 'workspace:local-draft',
  name: 'Local draft',
  records: [{ id: 'local:r', path: 'draft.md', markdown: '# Draft', source: { adapterId: 'local' }, materialRole: { mode: 'local-session-record' } }],
  assets: [],
  sources: [{ id: 'local', adapterId: 'local' }]
};
const opened = { id: 'workspace:opened', name: 'Opened', records: [], assets: [], sources: [] };

assert.equal(workspaceHasDurableLocalMaterial(sourceOnly), false, 'source-only workspace is replaceable by Open');
assert.equal(workspaceHasDurableLocalMaterial(localDraft), true, 'durable browser-local material survives Open replacement');

const result = replaceNonDraftWorkspaceSet({
  workspaces: [sourceOnly, localDraft, opened],
  activeWorkspaceId: sourceOnly.id,
  workspaceViews: {
    [sourceOnly.id]: { display: 'feed' },
    [localDraft.id]: { display: 'feed' },
    [opened.id]: { display: 'tree' }
  }
}, [opened.id]);

assert.deepEqual(result.state.workspaces.map((workspace) => workspace.id), [localDraft.id, opened.id], 'Open replaces previous non-draft/source-only workspaces while preserving durable local work');
assert.equal(result.state.activeWorkspaceId, opened.id, 'opened workspace becomes active after replacement');
assert.ok(result.state.workspaceViews[sourceOnly.id], 'Open replacement leaves presentation cleanup to the central product-state boundary');
assert.deepEqual(result.report.closedNonDraftWorkspaces, [sourceOnly.id]);
assert.deepEqual(result.report.keptLocalWorkspaces, [localDraft.id]);
assert.deepEqual(result.report.openedWorkspaceIds, [opened.id]);
console.log('✓ workspace Open replacement semantics tests passed');
