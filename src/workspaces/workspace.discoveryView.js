import { resolveLineage } from '../lineage/lineage.resolve.js';
import { LineageEdgeKind, LineageResolutionStatus } from '../lineage/lineage.model.js';
import { inferRecordMaterialRole, isDiscoveryWorkLeafEligible, isSupportingRecord, sourceBoundaryClass, MaterialRole } from './workspace.materialRole.js';
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
    for (const key of recordKeys(record)) {
      membershipById.set(key, inclusion);
      if (!inclusion.visible) hiddenReasonsById.set(key, inclusion.reason);
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
  const parentReason = discoveryParentReason(record, materialIndex);
  if (options.leavesOnly && !discoveryLeaf) return hidden(parentReason || 'hidden-not-terminal-work-leaf', role, discoveryLeaf, supporting);
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

export function buildDiscoveryMaterialIndex(records = []) {
  const source = Array.isArray(records) ? records : [];
  const lineageParentKeys = new Set();
  const lineageChildKeys = new Set();
  const pathParentKeys = new Set();
  const pathChildKeys = new Set();
  const parentReasonsByKey = new Map();
  let resolved = null;
  try {
    resolved = resolveLineage(source, { depth: 'discovery-membership' });
  } catch {
    resolved = null;
  }
  for (const edge of Array.isArray(resolved?.edges) ? resolved.edges : []) {
    if (edge.kind !== LineageEdgeKind.parent) continue;
    if (!edge.from || !edge.to) continue;
    if (edge.status === LineageResolutionStatus.missing) continue;
    const parent = source.find((record) => recordKeyMatches(record, edge.from));
    const child = source.find((record) => recordKeyMatches(record, edge.to));
    for (const key of parent ? recordKeys(parent) : [String(edge.from)]) {
      lineageParentKeys.add(key);
      parentReasonsByKey.set(key, 'hidden-loaded-parent');
    }
    for (const key of child ? recordKeys(child) : [String(edge.to)]) lineageChildKeys.add(key);
  }

  for (const { parent, children, reason } of discoverPathParentEntries(source)) {
    for (const key of recordKeys(parent)) {
      pathParentKeys.add(key);
      if (!parentReasonsByKey.has(key)) parentReasonsByKey.set(key, reason);
    }
    for (const child of children) {
      for (const key of recordKeys(child)) pathChildKeys.add(key);
    }
  }

  const parentKeys = unionSets(lineageParentKeys, pathParentKeys);
  const childKeys = unionSets(lineageChildKeys, pathChildKeys);
  return Object.freeze({
    parentKeys,
    childKeys,
    parentIds: parentKeys,
    childIds: childKeys,
    lineageParentKeys,
    lineageChildKeys,
    pathParentKeys,
    pathChildKeys,
    parentReasonsByKey,
    hasLineage: Boolean(resolved),
    parentCount: parentKeys.size,
    childCount: childKeys.size,
    lineageParentCount: lineageParentKeys.size,
    pathParentCount: pathParentKeys.size
  });
}

export function isDiscoveryLeafRecord(record = {}, materialIndex = null) {
  if (!isDiscoveryWorkLeafEligible(record)) return false;
  if (!materialIndex?.parentKeys) return true;
  return !recordKeys(record).some((key) => materialIndex.parentKeys.has(key));
}

export function discoveryParentReason(record = {}, materialIndex = null) {
  if (!isDiscoveryWorkLeafEligible(record)) {
    const role = inferRecordMaterialRole(record);
    if (role === MaterialRole.schemaDefinition) return 'hidden-schema-definition';
    if (role === MaterialRole.supporting || role === MaterialRole.unknown) return 'hidden-supporting';
    return 'hidden-not-work-leaf';
  }
  for (const key of recordKeys(record)) {
    const reason = materialIndex?.parentReasonsByKey?.get(key);
    if (reason) return reason;
  }
  return '';
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

function discoverPathParentEntries(records = []) {
  const candidates = (Array.isArray(records) ? records : []).filter((record) => isDiscoveryWorkLeafEligible(record));
  const entries = [];
  for (const parent of candidates) {
    const parentPath = normalizeDiscoveryPath(parent.path || parent.sourcePath || '');
    const parentDir = dirname(parentPath);
    const parentName = basename(parentPath).toLowerCase();
    if (!parentPath || !parentDir) continue;
    const isFolderRootTrace = parentName === '001.trace.md';
    const children = candidates.filter((child) => {
      if (sameRecord(parent, child)) return false;
      const childPath = normalizeDiscoveryPath(child.path || child.sourcePath || '');
      if (!childPath) return false;
      const childDir = dirname(childPath);
      if (!childDir) return false;
      if (childDir.startsWith(`${parentDir}/`)) return true;
      return isFolderRootTrace && childDir === parentDir;
    });
    if (children.length) entries.push({ parent, children, reason: 'hidden-path-parent' });
  }
  return entries;
}

function sameRecord(a = {}, b = {}) {
  return recordKeys(a).some((key) => recordKeys(b).includes(key));
}

function recordKeyMatches(record = {}, key = '') {
  const target = String(key || '').trim();
  return Boolean(target && recordKeys(record).includes(target));
}

function recordKeys(record = {}) {
  const keys = [record.id, record.path, record.sourcePath, record.source?.path]
    .map((value) => String(value || '').trim())
    .filter(Boolean);
  const canonical = keys.map((value) => normalizeDiscoveryPath(value)).filter(Boolean);
  return Array.from(new Set(keys.concat(canonical)));
}

function unionSets(...sets) {
  const out = new Set();
  for (const set of sets) for (const value of set || []) out.add(value);
  return out;
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

function normalizeDiscoveryPath(value = '') {
  let raw = String(value || '').trim();
  if (!raw) return '';
  try {
    const url = new URL(raw);
    raw = url.pathname.replace(/^\/+/g, '');
  } catch {
    // not a URL
  }
  const out = [];
  for (const part of raw.replace(/\\/g, '/').replace(/[#?].*$/, '').split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') out.pop();
    else out.push(part);
  }
  return out.join('/');
}

function dirname(path = '') {
  const parts = normalizeDiscoveryPath(path).split('/').filter(Boolean);
  parts.pop();
  return parts.join('/');
}

function basename(path = '') {
  const parts = normalizeDiscoveryPath(path).split('/').filter(Boolean);
  return parts[parts.length - 1] || '';
}
