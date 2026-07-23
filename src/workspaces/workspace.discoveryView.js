import { buildDiscoveryMaterialIndex, inferRecordMaterialRole, isDiscoveryLeafRecord, isSupportingRecord, sourceBoundaryClass, MaterialRole } from './workspace.materialRole.js';
import { sortWorkspaceFeedRecords } from './workspace.feedSort.js';

export function buildWorkspaceDiscoveryView(workspace = {}, options = {}) {
  const records = Array.isArray(options.records) ? options.records : (Array.isArray(workspace.records) ? workspace.records : []);
  const assets = Array.isArray(options.assets) ? options.assets : (Array.isArray(workspace.assets) ? workspace.assets : []);
  const workspaceCandidates = Array.isArray(options.workspaceCandidates) ? options.workspaceCandidates : (Array.isArray(workspace.workspaceMergeCandidates) ? workspace.workspaceMergeCandidates : []);
  const displayOptions = normalizeDiscoveryDisplayOptions(options.displayOptions || {});
  const query = String(options.query || '').trim();
  const auditById = options.auditById instanceof Map ? options.auditById : new Map();
  const materialIndex = buildDiscoveryMaterialIndex(records);
  const hiddenReasonsById = new Map();
  const membershipById = new Map();

  const visibleRecords = sortWorkspaceFeedRecords(records.filter((record) => {
    const inclusion = discoveryRecordMembership(record, displayOptions, auditById, materialIndex, query);
    const id = String(record.id || record.path || '').trim();
    if (id) {
      membershipById.set(id, inclusion);
      if (!inclusion.visible) hiddenReasonsById.set(id, inclusion.reason);
    }
    return inclusion.visible;
  }));

  const visibleAssets = displayOptions.showAssets ? assets.filter((asset) => assetMatchesQuery(asset, query)) : [];
  const visibleWorkspaceCandidates = displayOptions.showWorkspaceCandidates ? workspaceCandidates.filter((candidate) => workspaceCandidateMatchesQuery(candidate, query)) : [];
  const choices = discoveryOptionChoices(records, auditById, materialIndex);

  return Object.freeze({
    records: visibleRecords,
    assets: visibleAssets,
    workspaceCandidates: visibleWorkspaceCandidates,
    materialIndex,
    choices,
    counts: Object.freeze({
      records: records.length,
      visibleRecords: visibleRecords.length,
      leaves: choices.leafCount,
      supportingMarkdown: choices.supportingCount,
      mismatches: choices.mismatchCount,
      assets: assets.length,
      visibleAssets: visibleAssets.length,
      workspaceCandidates: workspaceCandidates.length,
      visibleWorkspaceCandidates: visibleWorkspaceCandidates.length
    }),
    hiddenReasonsById,
    membershipById
  });
}

export function discoveryRecordMembership(record = {}, options = {}, auditById = new Map(), materialIndex = null, query = '') {
  const role = inferRecordMaterialRole(record);
  const supporting = isSupportingRecord(record);
  const discoveryLeaf = isDiscoveryLeafRecord(record, materialIndex);
  if (options.leavesOnly && !discoveryLeaf) return hidden('hidden-not-terminal-work-leaf', role, discoveryLeaf, supporting);
  if (!options.showSupportingMarkdown && supporting) return hidden('hidden-supporting', role, discoveryLeaf, supporting);
  if (options.mismatchesOnly && !auditIsMismatch(record, auditById.get(record.id))) return hidden('hidden-filter', role, discoveryLeaf, supporting);
  const schemaFilter = normalizeDisplayFilterValue(options.schemaFilter);
  if (schemaFilter !== 'all' && recordSchemaValue(record) !== schemaFilter) return hidden('hidden-filter', role, discoveryLeaf, supporting);
  const artifactFilter = normalizeDisplayFilterValue(options.artifactFilter);
  if (artifactFilter !== 'all' && role !== artifactFilter) return hidden('hidden-filter', role, discoveryLeaf, supporting);
  const sourceFilter = normalizeDisplayFilterValue(options.sourceFilter);
  if (sourceFilter !== 'all' && sourceBoundaryClass(record) !== sourceFilter) return hidden('hidden-filter', role, discoveryLeaf, supporting);
  if (!recordMatchesQuery(record, query)) return hidden('hidden-query', role, discoveryLeaf, supporting);
  return Object.freeze({ visible: true, reason: 'visible', role, discoveryLeaf, supporting });
}

export function buildDiscoveryDisplayOptionCounts(workspace = {}, options = {}) {
  const auditById = options.auditById instanceof Map ? options.auditById : new Map();
  const view = buildWorkspaceDiscoveryView(workspace, {
    records: Array.isArray(options.records) ? options.records : workspace.records,
    assets: Array.isArray(options.assets) ? options.assets : workspace.assets,
    workspaceCandidates: Array.isArray(options.workspaceCandidates) ? options.workspaceCandidates : workspace.workspaceMergeCandidates,
    displayOptions: Object.assign({}, options.displayOptions || {}, {
      leavesOnly: false,
      showSupportingMarkdown: true,
      showWorkspaceCandidates: true,
      showAssets: true,
      mismatchesOnly: false,
      schemaFilter: 'all',
      artifactFilter: 'all',
      sourceFilter: 'all'
    }),
    query: '',
    auditById
  });
  return Object.freeze({
    records: view.counts.records,
    leaves: view.counts.leaves,
    supportingMarkdown: view.counts.supportingMarkdown,
    mismatches: view.counts.mismatches,
    assets: view.counts.assets,
    workspaceCandidates: view.counts.workspaceCandidates,
    schemaChoices: view.choices.schemas,
    artifactChoices: view.choices.artifacts,
    sourceChoices: view.choices.sources
  });
}

function hidden(reason, role, discoveryLeaf, supporting) {
  return Object.freeze({ visible: false, reason, role, discoveryLeaf, supporting });
}

function discoveryOptionChoices(records = [], auditById = new Map(), materialIndex = null) {
  const schemaCounts = new Map();
  const artifactCounts = new Map();
  const sourceCounts = new Map();
  const items = Array.isArray(records) ? records : [];
  for (const record of items) {
    const schema = recordSchemaValue(record);
    schemaCounts.set(schema, (schemaCounts.get(schema) || 0) + 1);
    const artifact = inferRecordMaterialRole(record);
    artifactCounts.set(artifact, (artifactCounts.get(artifact) || 0) + 1);
    const sourceClass = sourceBoundaryClass(record);
    sourceCounts.set(sourceClass, (sourceCounts.get(sourceClass) || 0) + 1);
  }
  const mismatchCount = items.filter((record) => auditIsMismatch(record, auditById.get(record.id))).length;
  return Object.freeze({
    schemas: Array.from(schemaCounts.entries()).sort((a, b) => a[0].localeCompare(b[0])),
    artifacts: [MaterialRole.leaf, MaterialRole.schemaDefinition, MaterialRole.supporting, MaterialRole.unknown]
      .filter((key) => artifactCounts.has(key))
      .map((key) => [key, artifactCounts.get(key)]),
    sources: ['source-backed', 'local', 'unknown']
      .filter((key) => sourceCounts.has(key))
      .map((key) => [key, sourceCounts.get(key)]),
    supportingCount: (artifactCounts.get(MaterialRole.supporting) || 0) + (artifactCounts.get(MaterialRole.schemaDefinition) || 0) + (artifactCounts.get(MaterialRole.unknown) || 0),
    mismatchCount,
    leafCount: items.filter((record) => isDiscoveryLeafRecord(record, materialIndex)).length
  });
}

function normalizeDiscoveryDisplayOptions(input = {}) {
  return {
    leavesOnly: input.leavesOnly !== false,
    showSupportingMarkdown: input.showSupportingMarkdown === true,
    showWorkspaceCandidates: input.showWorkspaceCandidates !== false,
    showAssets: input.showAssets === true,
    mismatchesOnly: input.mismatchesOnly === true,
    schemaFilter: normalizeDisplayFilterValue(input.schemaFilter),
    artifactFilter: normalizeDisplayFilterValue(input.artifactFilter),
    sourceFilter: normalizeDisplayFilterValue(input.sourceFilter)
  };
}

function normalizeDisplayFilterValue(value) {
  const text = String(value || 'all').trim();
  return text || 'all';
}

function recordSchemaValue(record = {}) {
  return String(record.schemaId || record.currentSchemaId || record.envelopeSchemaId || record.kind || 'artifact').trim() || 'artifact';
}

function auditIsMismatch(record = {}, auditItem = null) {
  if (!auditItem) return false;
  const status = String(auditItem.status || record.status || '').toLowerCase();
  return status.includes('mismatch') || status.includes('invalid') || status.includes('error');
}

function recordMatchesQuery(record = {}, query = '') {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return true;
  return [record.title, record.summary, record.kind, record.status, record.path].some((value) => String(value || '').toLowerCase().includes(q));
}

function assetMatchesQuery(asset = {}, query = '') {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return true;
  return [asset.name, asset.path, asset.type, asset.previewState, asset.sourceMode].some((value) => String(value || '').toLowerCase().includes(q));
}

function workspaceCandidateMatchesQuery(candidate = {}, query = '') {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return true;
  return [candidate.title, candidate.path, candidate.sourceMode, candidate.schema].some((value) => String(value || '').toLowerCase().includes(q));
}
