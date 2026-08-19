import { prepareWorkspaceHandoffExport } from '../export/handoff.plan.js';
import { exportPackageZipBlob } from '../export/package.zip.js';

export function executeWorkspaceHandoffExportCommand(input = {}) {
  const workspace = input.workspace;
  if (!workspace) return { ok: false, error: 'workspace.missing', notice: 'No workspace to export.' };
  const preparation = prepareWorkspaceHandoffExport(workspace, {
    clock: input.clock,
    includeDegraded: true
  });
  if (!preparation.executable) {
    const reason = firstBlockingFinding(preparation.inspection?.findings || preparation.bundle?.findings || []);
    return { ok: false, error: 'export.handoff.blocked', preparation, notice: reason ? `Handoff package blocked: ${reason}` : 'Handoff package is blocked by package inspection.' };
  }
  try {
    const download = input.download || exportWorkspaceHandoffDownload;
    const result = download(workspace, input.document || globalThis.document, input.window || globalThis.window || globalThis, preparation);
    return {
      ok: true,
      preparation,
      freshness: Object.freeze({ source: 'execution-workspace', workspaceId: String(workspace.id || ''), recordCount: Array.isArray(workspace.records) ? workspace.records.length : 0, assetCount: Array.isArray(workspace.assets) ? workspace.assets.length : 0 }),
      bundle: preparation.bundle,
      filename: result.filename,
      notice: `Handoff package ${preparation.status}: ${preparation.bundle.counts.files} governed file${preparation.bundle.counts.files === 1 ? '' : 's'} · ${preparation.bundle.counts.localDraftFiles} local artifact${preparation.bundle.counts.localDraftFiles === 1 ? '' : 's'} · ${preparation.bundle.counts.sourceReferenceFiles + preparation.bundle.counts.assetReferenceFiles} source reference${preparation.bundle.counts.sourceReferenceFiles + preparation.bundle.counts.assetReferenceFiles === 1 ? '' : 's'}.`
    };
  } catch (error) {
    return { ok: false, error: 'export.handoff.failed', exception: error, preparation, notice: 'Could not build or download Handoff package.' };
  }
}

export function exportWorkspaceHandoffDownload(workspace = {}, doc = globalThis.document, win = globalThis.window || globalThis, preparation = null) {
  const prepared = preparation || prepareWorkspaceHandoffExport(workspace);
  if (!prepared.executable || prepared.inspection?.status !== 'valid') throw new Error('handoff-package-not-valid');
  const blob = exportPackageZipBlob(prepared.bundle);
  const url = win.URL.createObjectURL(blob);
  const link = doc.createElement('a');
  link.href = url;
  link.download = handoffPackageFilename(workspace, prepared.bundle);
  link.rel = 'noopener';
  doc.body.appendChild(link);
  link.click();
  link.remove();
  win.setTimeout(() => win.URL.revokeObjectURL(url), 1000);
  return Object.freeze({ filename: link.download, bundle: prepared.bundle, inspection: prepared.inspection });
}

export function handoffPackageFilename(workspace = {}, bundle = {}) {
  const slug = String(workspace.title || workspace.name || workspace.id || 'workspace').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'workspace';
  const stamp = String(bundle.builtAt || new Date().toISOString()).replace(/[^0-9]/g, '').slice(0, 14) || 'session';
  return `tiinex-handoff-${slug}-${stamp}.zip`;
}

function firstBlockingFinding(findings = []) {
  const item = (Array.isArray(findings) ? findings : []).find((finding) => finding?.severity === 'error') || (Array.isArray(findings) ? findings : [])[0];
  return String(item?.message || '').trim();
}
