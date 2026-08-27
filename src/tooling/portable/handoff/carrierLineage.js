import path from 'node:path';
import { packageFileBytes, sha256Hex } from '../../../export/package.bytes.js';
import { recipientV2FactsIndex } from './recipientV2.transportManifest.js';

export const HANDOFF_CARRIER_LINEAGE_SCHEMA_ID = 'tiinex.portable.handoff-carrier-lineage.v1';

export function initialHandoffCarrierLineage() {
  return freezeLineage({ mode: 'root', dimension: '001', parentDimension: '', parentPackageSha256: '', parentPackageFilename: '', major: '001', majorReason: 'initial carrier root', checkpointKind: 'major' });
}

export function continueHandoffCarrierLineage(parent = {}) {
  const normalized = normalizeParentLineage(parent);
  if (!normalized.dimension) throw new Error('portable.handoff-carrier-lineage.parent.unresolved');
  return freezeLineage({
    mode: 'continue',
    dimension: `${normalized.dimension}-1`,
    parentDimension: normalized.dimension,
    parentPackageSha256: normalized.packageSha256,
    parentPackageFilename: normalized.packageFilename,
    major: majorSegment(normalized.dimension),
    majorReason: '',
    checkpointKind: 'progression'
  });
}

export function advanceHandoffCarrierMajor(parent = {}, reason = '') {
  const normalized = normalizeParentLineage(parent);
  if (!normalized.dimension) throw new Error('portable.handoff-carrier-lineage.parent.unresolved');
  const majorReason = String(reason || '').trim();
  if (!majorReason) throw new Error('portable.handoff-carrier-lineage.major-reason.required');
  const currentMajor = Number.parseInt(majorSegment(normalized.dimension), 10);
  if (!Number.isFinite(currentMajor) || currentMajor < 1 || currentMajor >= 999) throw new Error('portable.handoff-carrier-lineage.major.invalid');
  const nextMajor = String(currentMajor + 1).padStart(3, '0');
  return freezeLineage({
    mode: 'major',
    dimension: nextMajor,
    parentDimension: normalized.dimension,
    parentPackageSha256: normalized.packageSha256,
    parentPackageFilename: normalized.packageFilename,
    major: nextMajor,
    majorReason,
    checkpointKind: 'major'
  });
}

export function normalizeHandoffCarrierLineage(value = null) {
  if (!value || typeof value !== 'object') return initialHandoffCarrierLineage();
  const dimension = normalizeDimension(value.dimension || '');
  if (!dimension) return initialHandoffCarrierLineage();
  const mode = ['root', 'continue', 'major'].includes(String(value.mode || '')) ? String(value.mode) : dimension.includes('-') ? 'continue' : 'root';
  return freezeLineage({
    mode,
    dimension,
    parentDimension: normalizeDimension(value.parentDimension || ''),
    parentPackageSha256: normalizeSha256(value.parentPackageSha256 || ''),
    parentPackageFilename: String(value.parentPackageFilename || ''),
    major: majorSegment(dimension),
    majorReason: String(value.majorReason || ''),
    checkpointKind: String(value.checkpointKind || (mode === 'continue' ? 'progression' : 'major'))
  });
}

export function parentHandoffCarrierLineageFromBundle(bundle = {}, options = {}) {
  const files = Array.isArray(bundle.files) ? bundle.files : [];
  const factsIndex = recipientV2FactsIndex({ ...bundle, files });
  const roots = [];
  for (const file of files) {
    if (!/\.md$/i.test(String(file.path || ''))) continue;
    const facts = factsIndex.map.get(String(file.path || '')) || null;
    if (facts?.role === 'package-root') roots.push({ file, facts });
  }
  let lineage = null;
  if (roots.length === 1 && roots[0].facts.carrierLineage) lineage = normalizeHandoffCarrierLineage(roots[0].facts.carrierLineage);
  if (!lineage) {
    const dimensions = [...new Set((options.routeDimensions || []).map(normalizeDimension).filter(Boolean))];
    if (dimensions.length === 1) lineage = normalizeHandoffCarrierLineage({ mode: dimensions[0].includes('-') ? 'continue' : 'root', dimension: dimensions[0] });
  }
  if (!lineage) throw new Error('portable.handoff-carrier-lineage.parent.unresolved');
  return Object.freeze({
    ...lineage,
    packageSha256: normalizeSha256(options.packageSha256 || ''),
    packageFilename: String(options.packageFilename || '')
  });
}

export function qualifyMajorCarrierReadiness(input = {}, lineage = {}) {
  if (String(lineage.checkpointKind || '') !== 'major') return Object.freeze({ state: 'not-applicable', completeWorkspaceCount: 0, workspaceCount: 0, reason: '' });
  const workspaces = [...(input.workspaceMaterializations || [])];
  const complete = workspaces.filter((workspace) => String(workspace.state || '') === 'complete' && String(workspace.completenessEvidence?.state || '') === 'qualified').length;
  const ready = workspaces.length > 0 && complete === workspaces.length;
  return Object.freeze({
    state: ready ? 'qualified' : 'blocked',
    workspaceCount: workspaces.length,
    completeWorkspaceCount: complete,
    reason: ready ? 'all-carried-workspaces-are-complete-replacement-capable-snapshots' : 'major-carrier-requires-complete-carried-workspaces',
    semanticClosure: lineage.mode === 'major' ? 'explicit-major-reason-caller-declared' : 'initial-root'
  });
}

export function carrierLineageFromCliParent({ bundle = {}, parentPath = '', parentBytes = null, routeDimensions = [], major = false, majorReason = '' } = {}) {
  const bytes = parentBytes ? packageFileBytes({ data: parentBytes }) : new Uint8Array();
  const parent = parentHandoffCarrierLineageFromBundle(bundle, {
    routeDimensions,
    packageSha256: bytes.byteLength ? sha256Hex(bytes) : '',
    packageFilename: parentPath ? path.basename(parentPath) : ''
  });
  return major ? advanceHandoffCarrierMajor(parent, majorReason) : continueHandoffCarrierLineage(parent);
}

function freezeLineage(value = {}) {
  return Object.freeze({
    schema: HANDOFF_CARRIER_LINEAGE_SCHEMA_ID,
    version: 1,
    mode: String(value.mode || ''),
    dimension: normalizeDimension(value.dimension || ''),
    major: majorSegment(value.dimension || ''),
    parentDimension: normalizeDimension(value.parentDimension || ''),
    parentPackageSha256: normalizeSha256(value.parentPackageSha256 || ''),
    parentPackageFilename: String(value.parentPackageFilename || ''),
    checkpointKind: String(value.checkpointKind || ''),
    majorReason: String(value.majorReason || ''),
    authority: 'human-progress-projection-only',
    boundary: 'Carrier lineage is a compact human progress/retention projection. It never replaces artifact Parent/Trace/Origin, Handoff authority, or source truth. Major checkpoints require complete carried Workspace snapshots and explicit semantic closure intent.'
  });
}
function normalizeParentLineage(value = {}) {
  const lineage = normalizeHandoffCarrierLineage(value);
  return Object.freeze({ ...lineage, packageSha256: normalizeSha256(value.packageSha256 || value.parentPackageSha256 || ''), packageFilename: String(value.packageFilename || value.parentPackageFilename || '') });
}
function normalizeDimension(value = '') { const v = String(value || '').trim(); return /^\d{3}(?:-\d+)*$/.test(v) ? v : ''; }
function majorSegment(value = '') { return normalizeDimension(value).split('-')[0] || ''; }
function normalizeSha256(value = '') { const v = String(value || '').trim().toLowerCase(); return /^[a-f0-9]{64}$/.test(v) ? v : ''; }
function decodeUtf8(data) { try { return new TextDecoder('utf-8', { fatal: true }).decode(data); } catch { return ''; } }
