import { stateWithWorkspacePresentationPruned } from './workspaceMulticolumn.js';

export function canonicalProductState(state = {}, _persistence = null, boundary = 'product-runtime') {
  const violation = (state?.workspaces || []).find((workspace) => workspace && Object.prototype.hasOwnProperty.call(workspace, 'workspaceMergeCandidates'));
  if (violation) throw new Error(`workspace.runtime-candidate-leak:${boundary}:${violation.id || 'workspace'}`);
  return stateWithWorkspacePresentationPruned(state);
}
