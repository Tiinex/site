import { buildWorkspaceTreeExportBundle } from './tree.bundle.js';
import { resolveTransportPlan, TransportLevel } from '../sources/transport.levels.js';

export const EXPORT_PLAN_SCHEMA_ID = 'tiinex.export.plan.v1';
export const ExportAdapterId = Object.freeze({
  download: 'download',
  github: 'github',
  handoffPackage: 'handoff-package'
});
export const ExportType = Object.freeze({
  tree: 'tree',
  handoffPackage: 'handoff-package',
  githubPublish: 'github-publish',
  workspaceEntrypoint: 'workspace-entrypoint',
  duplicate: 'duplicate'
});
export const ExportScope = Object.freeze({
  local: 'local',
  source: 'source',
  all: 'all'
});

export function buildWorkspaceExportPlan(workspace = {}, options = {}) {
  const selectedExportType = normalizeExportType(options.exportType || ExportType.tree);
  const impliedAdapter = selectedExportType === ExportType.handoffPackage ? ExportAdapterId.handoffPackage : selectedExportType === ExportType.githubPublish ? ExportAdapterId.github : ExportAdapterId.download;
  const selectedAdapterId = normalizeExportAdapterId(options.adapterId || impliedAdapter);
  const selectedScope = normalizeExportScope(options.scope || ExportScope.all);
  const treeBundle = selectedAdapterId === ExportAdapterId.download && selectedExportType === ExportType.tree
    ? buildWorkspaceTreeExportBundle(workspace, { clock: options.clock })
    : null;
  const transport = resolveTransportPlan({ transportLevels: { 'local-download': TransportLevel.TL0 } }, 'local-download', { defaultLevel: TransportLevel.TL0, allowFallback: false });
  const counts = exportCounts(workspace, treeBundle);
  const adapters = buildAdapterPlans({ selectedAdapterId, selectedExportType, selectedScope, counts, transport, treeBundle });
  const selectedAdapter = adapters.find((adapter) => adapter.id === selectedAdapterId) || adapters[0];
  return deepFreeze({
    schema: EXPORT_PLAN_SCHEMA_ID,
    status: selectedAdapter?.status || 'blocked',
    step: 'configure',
    selectedAdapterId,
    selectedExportType,
    selectedScope,
    operation: selectedAdapter?.operation || 'local-download',
    transport,
    transportLevel: transport.selectedLevel,
    adapters,
    scopes: buildScopePlans(selectedScope, counts),
    exportTypes: buildExportTypePlans(selectedExportType, treeBundle),
    counts,
    execution: executionPlan({ selectedAdapter, selectedAdapterId, selectedExportType }),
    boundary: 'Export Plan is a read-model for adapter/scope/transport selection. It does not mutate source material or infer provenance from presentation paths.',
    packageEnvelope: selectedExportType === ExportType.handoffPackage,
    treeBundle
  });
}

export function normalizeExportAdapterId(value = '') {
  const text = String(value || '').trim().toLowerCase();
  if (text === ExportAdapterId.github) return ExportAdapterId.github;
  if (text === ExportAdapterId.handoffPackage || text === 'package' || text === 'handoff') return ExportAdapterId.handoffPackage;
  return ExportAdapterId.download;
}

export function normalizeExportType(value = '') {
  const text = String(value || '').trim().toLowerCase();
  if (text === ExportType.handoffPackage || text === 'package' || text === 'handoff') return ExportType.handoffPackage;
  if (text === ExportType.githubPublish || text === 'publish' || text === 'github') return ExportType.githubPublish;
  if (text === ExportType.workspaceEntrypoint || text === 'workspace') return ExportType.workspaceEntrypoint;
  if (text === ExportType.duplicate || text === 'copy') return ExportType.duplicate;
  return ExportType.tree;
}

export function normalizeExportScope(value = '') {
  const text = String(value || '').trim().toLowerCase();
  if (text === ExportScope.local) return ExportScope.local;
  if (text === ExportScope.source) return ExportScope.source;
  return ExportScope.all;
}

function buildAdapterPlans({ selectedAdapterId, selectedExportType, selectedScope, counts, transport, treeBundle }) {
  return Object.freeze([
    Object.freeze({
      id: ExportAdapterId.download,
      label: 'Download',
      icon: 'download',
      status: selectedExportType === ExportType.tree ? 'ready' : 'disabled',
      selected: selectedAdapterId === ExportAdapterId.download,
      operation: 'local-download',
      transportLevel: transport.selectedLevel,
      capability: 'Files · assets · ordinary tree zip',
      description: 'Client-side TL0 local download. Ordinary tree export mirrors the logical Tiinex tree and has no package envelope.',
      files: treeBundle?.counts?.files || counts.records + counts.assets + counts.workspaceEntries,
      boundary: 'No source write, no remote traversal, no credential material.'
    }),
    Object.freeze({
      id: ExportAdapterId.github,
      label: 'GitHub',
      icon: 'github',
      status: 'available',
      selected: selectedAdapterId === ExportAdapterId.github,
      operation: 'guided-browser-publication',
      transportLevel: TransportLevel.TL0,
      capability: 'Exact issue / issue-comment · Copy · Open · Verify',
      description: 'Guided no-auth GitHub publication uses the accepted shared exact social target contract. Tiinex copies the exact payload, opens GitHub, then requires read-after-write verification before creating a local receipt/source binding.',
      files: counts.records,
      boundary: 'Visible as a future adapter only; this dialog never fakes GitHub write.'
    }),
    Object.freeze({
      id: ExportAdapterId.handoffPackage,
      label: 'Handoff package',
      icon: 'archive',
      status: 'available',
      selected: selectedAdapterId === ExportAdapterId.handoffPackage,
      operation: 'local-download',
      transportLevel: TransportLevel.TL0,
      capability: 'Recoverability envelope · local material + source references + workspace context',
      description: 'Explicit execution builds and qualifies the operational package from the latest workspace through shared package authority. No package snapshot is built or cached in this read-model.',
      files: 0,
      boundary: 'Explicit non-default package envelope. Ordinary Tree export stays envelope-free.'
    })
  ]);
}

function buildScopePlans(selectedScope, counts) {
  return Object.freeze([
    Object.freeze({ id: ExportScope.local, label: 'Local', selected: selectedScope === ExportScope.local, status: 'future', description: 'Local drafts and browser-session material. Scope filtering is reserved for a later slice.', count: counts.localRecords }),
    Object.freeze({ id: ExportScope.source, label: 'Source', selected: selectedScope === ExportScope.source, status: 'future', description: 'Source-backed material references. Scope filtering is reserved for a later slice.', count: counts.sourceRecords }),
    Object.freeze({ id: ExportScope.all, label: 'All', selected: selectedScope === ExportScope.all, status: 'ready', description: 'Every loaded record/file in this workspace tree.', count: counts.records + counts.workspaceEntries })
  ]);
}

function buildExportTypePlans(selectedExportType, treeBundle) {
  return Object.freeze([
    Object.freeze({ id: ExportType.tree, label: 'Tree export', selected: selectedExportType === ExportType.tree, status: 'ready', description: 'Ordinary zip mirroring the visible logical tree 1:1.', packageEnvelope: false, files: treeBundle?.counts?.files || 0 }),
    Object.freeze({ id: ExportType.handoffPackage, label: 'Handoff package', selected: selectedExportType === ExportType.handoffPackage, status: 'available', description: 'Explicit Execute builds and qualifies the recoverability package from the latest workspace. No package bytes or exact inspection are prepared during render/read-model construction.', packageEnvelope: true, files: 0 }),
    Object.freeze({ id: ExportType.githubPublish, label: 'GitHub publish', selected: selectedExportType === ExportType.githubPublish, status: 'available', description: 'Guided issue / issue-comment publication. Exact local Markdown remains the shared outbound payload; GitHub mutation stays human-performed.', packageEnvelope: false })
  ]);
}

function executionPlan({ selectedAdapter, selectedAdapterId, selectedExportType }) {
  if (selectedExportType === ExportType.handoffPackage && selectedAdapterId === ExportAdapterId.handoffPackage) {
    return Object.freeze({
      available: true,
      action: 'download-handoff-package',
      label: 'Download Handoff package',
      boundary: 'Explicit execution resolves the latest workspace, builds and inspects that exact operational package once, then performs one TL0 browser download. No serialized Handoff snapshot is cached in the render/read-model plan.'
    });
  }
  if (selectedExportType === ExportType.githubPublish || selectedAdapterId === ExportAdapterId.github) {
    return Object.freeze({ available: true, action: 'guided-github-publication', label: 'Guided GitHub publication', boundary: 'Guided browser routine only: exact shared plan → Copy → Open GitHub → exact read-after-write Verify. No GitHub API mutation occurs in Site.' });
  }
  return Object.freeze({
    available: selectedAdapter?.status === 'ready' && selectedExportType === ExportType.tree && selectedAdapterId === ExportAdapterId.download,
    action: 'download-tree-zip',
    label: 'Execute tree export',
    boundary: 'Executes a TL0 local browser download. It does not publish, write to a source, create a handoff package, or include credential material.'
  });
}

function exportCounts(workspace = {}, treeBundle = null) {
  const records = Array.isArray(workspace.records) ? workspace.records : [];
  const assets = Array.isArray(workspace.assets) ? workspace.assets : [];
  const sourceRecords = records.filter((record) => String(record?.source?.boundary || record?.boundary || '').toLowerCase().includes('source-backed') || record?.source?.sourceBacked === true).length;
  const localRecords = records.length - sourceRecords;
  return Object.freeze({
    records: records.length,
    assets: assets.length,
    workspaceEntries: treeBundle?.counts?.workspaceEntries || 0,
    sourceRecords,
    localRecords,
    files: treeBundle?.counts?.files ?? (records.length + assets.length),
    findings: treeBundle?.counts?.findings || 0,
    errors: treeBundle?.counts?.errors || 0,
    warnings: treeBundle?.counts?.warnings || 0
  });
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}
