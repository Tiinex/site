import { HANDOFF_WORKSPACE_BYTE_PROVIDER_SCHEMA_ID } from './workspaceByteProvider.js';

export function buildDirectArchiveProjectionProvider(records = []) {
  const workspaces = records.map(({ workspace = {}, binding = {}, qualified = {}, archiveFile = null } = {}) => {
    const archivePath = String(binding.representation?.packagePath || archiveFile?.path || '');
    const entries = (qualified.entries || []).map((entry) => deepFreeze({
      path: String(entry.path || ''),
      innerPath: String(entry.path || ''),
      archivePackagePath: archivePath,
      packagePath: archivePath,
      bytes: Number(entry.bytes || 0),
      sha256: String(entry.sha256 || ''),
      referenceTarget: String(entry.referenceTarget || ''),
      data: entry.data
    }));
    return deepFreeze({
      state: 'qualified',
      id: String(workspace.id || ''),
      title: String(workspace.title || workspace.id || ''),
      mode: 'archive',
      materialization: workspace,
      entries: Object.freeze(entries),
      workspaceTarget: deepFreeze({ ...(binding.workspaceTarget || {}), data: qualified.target?.data || new Uint8Array() }),
      archive: deepFreeze({ ...(binding.representation || {}), data: archiveFile?.data || new Uint8Array() }),
      binding,
      reasons: Object.freeze([]),
      authority: Object.freeze({ locatorAuthority: false, filenameAuthority: false, packagePlacementAuthority: false, bindingAuthority: 'manufacture-local-exact-qualified-workspace-source-plus-new-archive-byte-identity' })
    });
  });
  return deepFreeze({
    schema: HANDOFF_WORKSPACE_BYTE_PROVIDER_SCHEMA_ID,
    status: workspaces.length && workspaces.every((workspace) => workspace.state === 'qualified') ? 'ready' : 'blocked',
    workspaces: Object.freeze(workspaces),
    findings: Object.freeze([]),
    boundary: 'Manufacture-local projection provider only. It reuses already exact-qualified source bytes solely to construct the disposable carrier projection; serialized-byte closure verification independently reconstructs the authoritative archive provider.'
  });
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}
