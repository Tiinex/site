import { executeWorkspaceTreeExportCommand } from './workspaceExportCommand.js';
import { executeWorkspaceHandoffExportCommand } from './workspaceHandoffExport.js';

export function executeWorkspaceExportCommand(input = {}) {
  const action = String(input.exportPlan?.execution?.action || 'download-tree-zip');
  if (action === 'download-handoff-package') return executeWorkspaceHandoffExportCommand(input);
  if (action === 'download-tree-zip') return executeWorkspaceTreeExportCommand(input);
  if (action === 'guided-github-publication') return { ok: false, error: 'github-publication.guided-routine-required', notice: 'Use the guided Copy / Open / Verify routine; Tiinex does not perform a hidden GitHub write.' };
  return { ok: false, error: 'export.mode.not-executable', notice: 'Selected export mode is not executable.' };
}
