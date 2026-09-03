import { buildWorkspaceLineageView } from '../../workspaces/workspace.lineageView.js';

export function playthingsLineageSnapshotFor(state = {}, recordId = '', workspaceId = '') {
  const id = String(recordId || '').trim();
  const targetWorkspaceId = String(workspaceId || state?.activeWorkspaceId || '').trim();
  const workspace = (state?.workspaces || []).find((candidate) => String(candidate?.id || '') === targetWorkspaceId) || null;
  if (!workspace || !id) return null;
  const view = buildWorkspaceLineageView(workspace, { records: workspace.records || [], query: '', selectedRecordId: id });
  const selected = (workspace.records || []).find((record) => String(record.id) === id) || null;
  return Object.freeze({
    schema: 'tiinex.playthings.lineage-dialog-projection.experimental.v1',
    workspaceId: workspace.id || '',
    workspaceTitle: workspace.title || workspace.name || 'workspace',
    selectedRecordId: id,
    selectedTitle: selected?.title || selected?.path || 'Selected artifact',
    selectedTraversal: view.selectedTraversal || null,
    semanticAuthority: 'none'
  });
}
