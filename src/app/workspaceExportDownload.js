import { buildWorkspaceTreeExportBundle } from '../export/tree.bundle.js';
import { exportTreeZipBlob } from '../export/package.zip.js';

export function exportWorkspaceTreeDownload(workspace = {}, doc = globalThis.document, win = globalThis.window || globalThis, options = {}) {
  const bundle = options?.prebuiltBundle || buildWorkspaceTreeExportBundle(workspace);
  const blob = exportTreeZipBlob(bundle);
  const url = win.URL.createObjectURL(blob);
  const link = doc.createElement('a');
  link.href = url;
  link.download = exportTreeFilename(workspace, bundle);
  link.rel = 'noopener';
  doc.body.appendChild(link);
  link.click();
  link.remove();
  win.setTimeout(() => win.URL.revokeObjectURL(url), 1000);
  return bundle;
}

export function exportTreeFilename(workspace = {}, bundle = {}) {
  const slug = String(workspace.title || workspace.name || workspace.id || 'workspace').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'workspace';
  const stamp = String(bundle.builtAt || new Date().toISOString()).replace(/[^0-9]/g, '').slice(0, 14) || 'session';
  return `tiinex-tree-${slug}-${stamp}.zip`;
}
