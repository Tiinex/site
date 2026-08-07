import { inferRecordMaterialRole, MaterialRole, sourceBoundaryClass } from './workspace.materialRole.js';

export const MaterialAuthorityKind = Object.freeze({
  sourceBacked: 'source-backed',
  localDraft: 'local-draft',
  importedLocal: 'imported-local',
  workspaceCandidate: 'workspace-candidate',
  localAsset: 'local-asset',
  localSession: 'local-session',
  unavailable: 'unavailable',
  unknown: 'unknown'
});

export const MaterialMutabilityKind = Object.freeze({
  readOnlySource: 'read-only-source',
  deletableLocalDraft: 'deletable-local-draft',
  removableImportedLocal: 'removable-imported-local',
  openMergeCandidate: 'open-merge-candidate',
  sessionLocal: 'session-local',
  metadataOnly: 'metadata-only',
  unavailable: 'unavailable',
  unknown: 'unknown'
});

export function classifyRecordAuthority(record = {}) {
  const source = record.source || {};
  const role = inferRecordMaterialRole(record);
  const sourceClass = sourceBoundaryClass(record);
  const materialUnavailable = isMaterialUnavailable(record);
  const importedLocal = isImportedLocalRecord(record);
  const localDraft = isLocalDraftRecord(record);
  const workspaceCandidate = role === MaterialRole.workspaceCandidate || isWorkspaceCandidateRecord(record);
  const sourceBacked = sourceClass === 'source-backed';
  const localSession = sourceClass === 'local' || isLocalSessionSource(source);

  if (workspaceCandidate) return freezeAuthority({
    authorityKind: MaterialAuthorityKind.workspaceCandidate,
    mutabilityKind: MaterialMutabilityKind.openMergeCandidate,
    authorityLabel: 'workspace candidate',
    mutabilityLabel: 'open/merge required',
    sourceClass,
    materialRole: role,
    local: true,
    sourceBacked: false,
    removable: false,
    sourceActionAllowed: false,
    boundary: record.boundary || source.boundary || 'Workspace candidate must be opened or merged before it becomes active context.'
  });

  if (sourceBacked) return freezeAuthority({
    authorityKind: MaterialAuthorityKind.sourceBacked,
    mutabilityKind: materialUnavailable ? MaterialMutabilityKind.unavailable : MaterialMutabilityKind.readOnlySource,
    authorityLabel: materialUnavailable ? 'source-backed · unavailable' : 'source-backed',
    mutabilityLabel: materialUnavailable ? 'material unavailable' : 'read-only source',
    sourceClass,
    materialRole: role,
    local: false,
    sourceBacked: true,
    removable: false,
    sourceActionAllowed: true,
    boundary: record.boundary || source.boundary || 'Source-backed material; mutate at source or create local continuation.'
  });

  if (importedLocal) return freezeAuthority({
    authorityKind: MaterialAuthorityKind.importedLocal,
    mutabilityKind: MaterialMutabilityKind.removableImportedLocal,
    authorityLabel: 'imported local',
    mutabilityLabel: 'removable local copy',
    sourceClass: 'local',
    materialRole: role,
    local: true,
    sourceBacked: false,
    removable: Boolean(record.id),
    sourceActionAllowed: false,
    boundary: record.boundary || source.boundary || 'Browser-local imported material; no GitHub provenance inferred.'
  });

  if (localDraft) return freezeAuthority({
    authorityKind: MaterialAuthorityKind.localDraft,
    mutabilityKind: MaterialMutabilityKind.deletableLocalDraft,
    authorityLabel: 'local draft',
    mutabilityLabel: 'deletable local draft',
    sourceClass: 'local',
    materialRole: role,
    local: true,
    sourceBacked: false,
    removable: Boolean(record.id),
    sourceActionAllowed: false,
    boundary: record.boundary || source.boundary || 'Browser-local draft/session material; no source mutation.'
  });

  if (localSession) return freezeAuthority({
    authorityKind: MaterialAuthorityKind.localSession,
    mutabilityKind: materialUnavailable ? MaterialMutabilityKind.unavailable : MaterialMutabilityKind.sessionLocal,
    authorityLabel: materialUnavailable ? 'local/session · unavailable' : 'local/session',
    mutabilityLabel: materialUnavailable ? 'material unavailable' : 'session local',
    sourceClass: 'local',
    materialRole: role,
    local: true,
    sourceBacked: false,
    removable: false,
    sourceActionAllowed: false,
    boundary: record.boundary || source.boundary || 'Browser-local session material; no external source inferred.'
  });

  if (materialUnavailable) return freezeAuthority({
    authorityKind: MaterialAuthorityKind.unavailable,
    mutabilityKind: MaterialMutabilityKind.unavailable,
    authorityLabel: 'unavailable',
    mutabilityLabel: 'material unavailable',
    sourceClass,
    materialRole: role,
    local: false,
    sourceBacked: false,
    removable: false,
    sourceActionAllowed: false,
    boundary: record.boundary || source.boundary || 'Material is unavailable in this session.'
  });

  return freezeAuthority({
    authorityKind: MaterialAuthorityKind.unknown,
    mutabilityKind: MaterialMutabilityKind.unknown,
    authorityLabel: 'unknown authority',
    mutabilityLabel: 'mutability unknown',
    sourceClass,
    materialRole: role,
    local: false,
    sourceBacked: false,
    removable: false,
    sourceActionAllowed: false,
    boundary: record.boundary || source.boundary || 'Authority boundary is not explicit enough to infer mutation affordances.'
  });
}

export function authorityBadgeLabel(record = {}) {
  return classifyRecordAuthority(record).authorityLabel;
}

export function mutabilityBadgeLabel(record = {}) {
  return classifyRecordAuthority(record).mutabilityLabel;
}

export function deleteActionLabelForRecord(record = {}) {
  const authority = classifyRecordAuthority(record);
  if (authority.mutabilityKind === MaterialMutabilityKind.removableImportedLocal) return 'Remove imported local copy';
  return 'Delete local draft';
}

export function isRecordSourceBacked(record = {}) {
  return classifyRecordAuthority(record).sourceBacked;
}

export function isRecordLocalSession(record = {}) {
  return classifyRecordAuthority(record).local;
}

export function isRemovableLocalRecord(record = {}) {
  return classifyRecordAuthority(record).removable;
}

export function isSourceBackedSource(source = {}) {
  if (!source || typeof source !== 'object') return false;
  if (source.sourceBacked === false) return false;
  if (isLocalSessionSource(source)) return false;
  if (String(source.adapterId || '').trim() === 'github') return true;
  return Boolean(source.adapterId && source.adapterId !== 'local');
}

export function isLocalSessionSource(source = {}) {
  if (!source || typeof source !== 'object') return false;
  if (source.sourceBacked === false) return true;
  const adapterId = String(source.adapterId || '').trim();
  const kind = String(source.kind || '').trim();
  const sourceKind = String(source.sourceKind || '').trim();
  return adapterId === 'local'
    || kind === 'local-session'
    || kind === 'local'
    || sourceKind === 'local.session'
    || sourceKind === 'export.package.import';
}

export function isImportedLocalRecord(record = {}) {
  const mode = String(record.sourceMode || '').trim().toLowerCase();
  const source = record.source || {};
  return Boolean(record.packageImport)
    || mode.startsWith('package-import')
    || mode.startsWith('archive-local')
    || mode.startsWith('local-import')
    || source.sourceKind === 'export.package.import'
    || source.adapterId === 'export-package';
}

export function isLocalDraftRecord(record = {}) {
  const source = record.source || {};
  const sourceMode = String(record.sourceMode || '').trim().toLowerCase();
  const status = String(record.status || record.lifecycleStatus || record.currentStatus || record.envelope?.current?.status || '').trim().toLowerCase();
  const localSource = isLocalSessionSource(source);
  const draftLike = sourceMode.startsWith('local-transition')
    || sourceMode.startsWith('local-reference')
    || sourceMode.startsWith('local-draft')
    || status === 'draft'
    || status === 'local'
    || status === 'draft/local';
  return Boolean(localSource && draftLike && !isImportedLocalRecord(record));
}

function isWorkspaceCandidateRecord(record = {}) {
  const path = String(record.path || record.sourcePath || record.sourceTarget?.sourceArtifactPath || record.name || '').trim().toLowerCase();
  const schema = String(record.schemaId || record.currentSchemaId || record.kind || '').trim().toLowerCase();
  return /(?:^|\/)[^/]+\.workspace\.md$/i.test(path) || schema === 'tiinex.workspace.v1' || schema.includes('workspace');
}

function isMaterialUnavailable(record = {}) {
  const cacheState = String(record.cacheState || '').trim().toLowerCase();
  const availability = typeof record.materialAvailability === 'string'
    ? record.materialAvailability
    : record.materialAvailability?.status;
  const materialAvailability = String(availability || '').trim().toLowerCase();
  return cacheState === 'route-shell-material-unavailable'
    || cacheState === 'metadata-only'
    || materialAvailability === 'material-unavailable'
    || materialAvailability === 'unavailable'
    || materialAvailability === 'metadata-only'
    || materialAvailability === 'route-shell-material-unavailable';
}

function freezeAuthority(value = {}) {
  return Object.freeze({
    schema: 'tiinex.workspace.materialAuthority.v1',
    authorityKind: value.authorityKind || MaterialAuthorityKind.unknown,
    mutabilityKind: value.mutabilityKind || MaterialMutabilityKind.unknown,
    authorityLabel: value.authorityLabel || 'unknown authority',
    mutabilityLabel: value.mutabilityLabel || 'mutability unknown',
    sourceClass: value.sourceClass || 'unknown',
    materialRole: value.materialRole || MaterialRole.unknown,
    local: Boolean(value.local),
    sourceBacked: Boolean(value.sourceBacked),
    removable: Boolean(value.removable),
    sourceActionAllowed: Boolean(value.sourceActionAllowed),
    boundary: value.boundary || ''
  });
}
