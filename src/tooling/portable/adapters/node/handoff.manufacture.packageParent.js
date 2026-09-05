import { packageFileBytes, sha256Hex } from '../../../../export/package.bytes.js';
import { inspectRecipientFacingV2Topology } from '../../handoff/recipientV2.inspect.js';
import { parseHandoffPackageV1, RECIPIENT_V2_PACKAGE_V1_ROOT_PATH } from '../../handoff/recipientV2.packageV1.js';

export function preparePackageParentWorkspaceReuse(input = {}) {
  const bundle = input.bundle || null;
  if (!bundle?.files?.length) return emptyReuse('unavailable');
  const currentIds = new Set([...(input.currentWorkspaceIds || [])].map(normalizeId).filter(Boolean));
  const inspection = inspectRecipientFacingV2Topology(bundle);
  const declared = declaredPackageWorkspaceBindings(bundle, inspection);
  if (!declared.length) return emptyReuse('unsupported-parent-surface');
  if (inspection.status !== 'valid') throw new Error('portable.handoff-manufacture.package-parent.workspace-provider.invalid');
  const missing = declared.filter((item) => !currentIds.has(normalizeId(item.workspaceId)));
  if (!missing.length) return emptyReuse('not-needed');

  const providerById = new Map((inspection.workspaceByteProvider?.workspaces || []).map((item) => [normalizeId(item.id), item]));
  const inspectedById = new Map((inspection.workspaces || []).map((item) => [normalizeId(item.workspaceId), item]));
  const inherited = [];
  const workspaceTargets = [];
  for (const binding of missing) {
    const id = normalizeId(binding.workspaceId);
    const provider = providerById.get(id);
    const inspected = inspectedById.get(id);
    if (!provider || provider.state !== 'qualified' || provider.mode !== 'archive' || provider.materialization?.materialization !== 'complete' || inspected?.coverage !== 'complete') {
      throw new Error(`portable.handoff-manufacture.package-parent.workspace-provider.unqualified:${id}`);
    }
    const targetPath = String(inspected.sourceWorkspaceTargetInnerPath || binding.workspaceArtifactInnerPath || '').trim();
    if (!targetPath) throw new Error(`portable.handoff-manufacture.package-parent.workspace-target.unresolved:${id}`);
    inherited.push(buildInheritedEnumeration(provider, {
      parentPackagePath: input.parentPackagePath || '',
      parentPackageSha256: input.parentPackageSha256 || '',
      archivePackagePath: inspected.workspaceArchivePath || binding.snapshotPath || ''
    }));
    workspaceTargets.push(Object.freeze({ workspaceId: id, path: targetPath, source: 'qualified-package-parent-workspace' }));
  }
  return Object.freeze({
    state: 'qualified',
    inherited: Object.freeze(inherited),
    workspaceTargets: Object.freeze(workspaceTargets),
    inspectionStatus: inspection.status,
    missingWorkspaceIds: Object.freeze(missing.map((item) => normalizeId(item.workspaceId))),
    boundary: 'Exact complete Workspace bytes reused from one independently qualified received package parent. Explicit current Workspace roots take precedence by id; parent-carrier placement and lineage remain non-semantic.'
  });
}

function declaredPackageWorkspaceBindings(bundle = {}, inspection = null) {
  const roots = (bundle.files || []).filter((file) => String(file.path || '') === RECIPIENT_V2_PACKAGE_V1_ROOT_PATH);
  if (roots.length === 1) {
    try {
      const markdown = new TextDecoder('utf-8', { fatal: true }).decode(packageFileBytes(roots[0]));
      const declared = [...(parseHandoffPackageV1(markdown).workspaces || [])];
      if (declared.length) return declared;
    } catch { /* fall through to independently qualified recipient-v2 inspection */ }
  }
  if (!inspection || inspection.detected !== true || inspection.status !== 'valid') return [];
  return (inspection.workspaces || [])
    .filter((workspace) => String(workspace.coverage || '') === 'complete')
    .map((workspace) => Object.freeze({
      workspaceId: String(workspace.workspaceId || ''),
      workspaceArtifactInnerPath: String(workspace.sourceWorkspaceTargetInnerPath || ''),
      snapshotPath: String(workspace.workspaceArchivePath || '')
    }))
    .filter((workspace) => workspace.workspaceId && workspace.workspaceArtifactInnerPath && workspace.snapshotPath);
}

function buildInheritedEnumeration(provider = {}, source = {}) {
  const entries = Object.freeze([...(provider.entries || [])]
    .map((entry) => Object.freeze({
      path: String(entry.path || ''),
      data: entry.data,
      bytes: Number(entry.bytes || 0),
      sha256: String(entry.sha256 || ''),
      mediaType: mediaTypeForPath(entry.path),
      referenceTarget: String(entry.referenceTarget || '')
    }))
    .sort((a, b) => a.path.localeCompare(b.path)));
  const includedEntries = Object.freeze(entries.map((entry) => Object.freeze({
    path: entry.path,
    bytes: entry.bytes,
    sha256: entry.sha256,
    referenceTarget: entry.referenceTarget
  })));
  const totalBytes = includedEntries.reduce((sum, entry) => sum + entry.bytes, 0);
  const evidence = Object.freeze({
    schema: 'tiinex.portable.workspace-completeness-evidence.v1',
    state: 'qualified',
    proof: 'qualified-package-parent-workspace-reuse-v1',
    boundary: 'exact-qualified-parent-carrier-complete-workspace-entry-set',
    workspaceId: normalizeId(provider.id),
    entryCount: includedEntries.length,
    totalBytes,
    entriesFingerprint: sha256Hex(new TextEncoder().encode(stableJson(includedEntries)))
  });
  const materialization = Object.freeze({
    id: normalizeId(provider.id),
    title: String(provider.title || provider.id || ''),
    state: 'complete',
    source: Object.freeze({
      kind: 'qualified-package-parent-workspace',
      workspaceId: normalizeId(provider.id),
      boundary: '.',
      parentPackagePath: String(source.parentPackagePath || ''),
      parentPackageSha256: String(source.parentPackageSha256 || ''),
      parentWorkspaceArchivePath: String(source.archivePackagePath || ''),
      authority: 'none'
    }),
    completenessEvidence: evidence,
    entries,
    includedEntries
  });
  return Object.freeze({
    id: materialization.id,
    root: '',
    enumeration: Object.freeze({
      schema: 'tiinex.portable.package-parent-workspace-enumeration.v1',
      status: 'qualified-complete',
      rootBoundary: '.',
      evidence,
      materialization
    })
  });
}

function emptyReuse(state) {
  return Object.freeze({ state, inherited: Object.freeze([]), workspaceTargets: Object.freeze([]), inspectionStatus: '', missingWorkspaceIds: Object.freeze([]), boundary: 'No package-parent Workspace provider reuse was required.' });
}
function normalizeId(value = '') { return String(value || '').trim().toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, ''); }
function mediaTypeForPath(value = '') { const lower = String(value || '').toLowerCase(); if (lower.endsWith('.md')) return 'text/markdown'; if (lower.endsWith('.json')) return 'application/json'; if (/\.(?:m?js|cjs)$/.test(lower)) return 'text/javascript'; if (lower.endsWith('.ts')) return 'text/typescript'; if (lower.endsWith('.css')) return 'text/css'; if (lower.endsWith('.html')) return 'text/html'; if (/\.(?:yml|yaml)$/.test(lower)) return 'text/yaml'; if (lower.endsWith('.txt')) return 'text/plain'; return 'application/octet-stream'; }
function stableJson(value) { return JSON.stringify(sortJson(value)); }
function sortJson(value) { if (Array.isArray(value)) return value.map(sortJson); if (!value || typeof value !== 'object') return value; return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])])); }
