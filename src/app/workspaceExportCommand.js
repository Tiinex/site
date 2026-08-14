import { exportWorkspaceTreeDownload } from './workspaceExportDownload.js';

export function executeWorkspaceTreeExportCommand(input = {}) {
  const workspace = input.workspace;
  if (!workspace) return { ok: false, error: 'workspace.missing', notice: 'No workspace to export.' };
  const exportPlan = input.exportPlan || null;
  if (exportPlan && exportPlan.execution?.available === false) {
    return { ok: false, error: 'export.adapter.not.executable', notice: 'Selected export adapter is not executable yet.' };
  }
  try {
    const download = input.download || exportWorkspaceTreeDownload;
    const bundle = download(workspace, input.document || globalThis.document, input.window || globalThis.window || globalThis, { prebuiltBundle: exportPlan?.treeBundle || null });
    return {
      ok: true,
      bundle,
      notice: `Export tree ${bundle.status}: ${bundle.counts.files} file${bundle.counts.files === 1 ? '' : 's'} · TL0 local download · no package envelope.`
    };
  } catch (error) {
    return { ok: false, error: 'export.tree.failed', exception: error, notice: 'Could not build tree export.' };
  }
}
