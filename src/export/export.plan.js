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
  const selectedAdapterId = normalizeExportAdapterId(options.adapterId || ExportAdapterId.download);
  const selectedExportType = normalizeExportType(options.exportType || ExportType.tree);
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
    execution: Object.freeze({
      available: selectedAdapter?.status === 'ready' && selectedExportType === ExportType.tree && selectedAdapterId === ExportAdapterId.download,
      action: 'download-tree-zip',
      label: 'Execute tree export',
      boundary: 'Executes a TL0 local browser download. It does not publish, write to a source, create a handoff package, or include credential material.'
    }),
    boundary: 'Export Plan is a read-model for adapter/scope/transport selection. It does not mutate source material or infer provenance from presentation paths.',
    packageEnvelope: false,
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
      status: 'future',
      selected: selectedAdapterId === ExportAdapterId.github,
      operation: 'write',
      transportLevel: TransportLevel.TL0,
      capability: 'Manual issue/comment publish later',
      description: 'Future TL0 manual wizard: copy → open GitHub → publish → verify. Disabled until ported deliberately from the PoC.',
      files: counts.records,
      boundary: 'Visible as a future adapter only; this dialog never fakes GitHub write.'
    }),
    Object.freeze({
      id: ExportAdapterId.handoffPackage,
      label: 'Handoff package',
      icon: 'archive',
      status: 'future',
      selected: selectedAdapterId === ExportAdapterId.handoffPackage,
      operation: 'local-download',
      transportLevel: TransportLevel.TL0,
      capability: 'Recoverability envelope later',
      description: 'Future explicit package export. Package envelopes are allowed here, but not in ordinary Tree export.',
      files: counts.records,
      boundary: 'Kept separate so ordinary download does not silently become a handoff package.'
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
    Object.freeze({ id: ExportType.handoffPackage, label: 'Handoff package', selected: selectedExportType === ExportType.handoffPackage, status: 'future', description: 'Recoverability package with explicit envelope and manifest. Not default.', packageEnvelope: true }),
    Object.freeze({ id: ExportType.githubPublish, label: 'GitHub publish', selected: selectedExportType === ExportType.githubPublish, status: 'future', description: 'Manual TL0 publish wizard later. Not implemented in this slice.', packageEnvelope: false })
  ]);
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
