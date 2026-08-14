import { inferRecordMaterialRole, isSupportingRecord, sourceBoundaryClass } from './workspace.materialRole.js';
import { normalizeDisplayFilterValue } from './workspace.displayOptions.js';

export function isSupportingMarkdownRecord(record = {}) {
  return isSupportingRecord(record);
}

export function recordSourceClass(record = {}) {
  return sourceBoundaryClass(record);
}

export function recordSchemaValue(record = {}) {
  return String(record.schemaId || record.kind || record.schema || 'artifact').trim() || 'artifact';
}

export function recordArtifactClass(record = {}) {
  return inferRecordMaterialRole(record);
}

export function auditIsMismatch(record = {}, auditItem = null) {
  const status = String(auditItem?.status || '').toLowerCase();
  return status === 'invalid-or-incomplete' || status === 'degraded' || status === 'missing' || status === 'error';
}

export function displayRecordIncluded(record = {}, options = {}, auditById = new Map()) {
  const supporting = isSupportingMarkdownRecord(record);
  if (options.leavesOnly && recordArtifactClass(record) !== 'leaf') return false;
  if (!options.showSupportingMarkdown && supporting) return false;
  if (options.mismatchesOnly && !auditIsMismatch(record, auditById.get(record.id))) return false;
  const schemaFilter = normalizeDisplayFilterValue(options.schemaFilter);
  if (schemaFilter !== 'all' && recordSchemaValue(record) !== schemaFilter) return false;
  const artifactFilter = normalizeDisplayFilterValue(options.artifactFilter);
  if (artifactFilter !== 'all' && recordArtifactClass(record) !== artifactFilter) return false;
  const sourceFilter = normalizeDisplayFilterValue(options.sourceFilter);
  if (sourceFilter !== 'all' && recordSourceClass(record) !== sourceFilter) return false;
  return true;
}

export function recordMatchesQuery(record = {}, query = '') {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return true;
  return [record.title, record.summary, record.kind, record.status, record.path].some((value) => String(value || '').toLowerCase().includes(q));
}

export function assetMatchesQuery(asset = {}, query = '') {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return true;
  return [asset.name, asset.path, asset.type, asset.previewState, asset.sourceMode].some((value) => String(value || '').toLowerCase().includes(q));
}
