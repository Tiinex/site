import { stateWithWorkspacePresentationPruned } from './workspaceMulticolumn.js';

export function canonicalProductState(state = {}, persistence = null, boundary = 'product-runtime') {
  const normalized = persistence?.normalizeLegacyWorkspaceCandidateState?.(state) || state;
  const projected = stateWithWorkspacePresentationPruned(normalized);
  const violation = (projected?.workspaces || []).find((workspace) => workspace && Object.prototype.hasOwnProperty.call(workspace, 'workspaceMergeCandidates'));
  if (violation) throw new Error(`workspace.runtime-candidate-leak:${boundary}:${violation.id || 'workspace'}`);
  return projected;
}
