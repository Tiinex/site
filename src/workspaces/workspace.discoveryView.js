import { resolveLineage } from '../lineage/lineage.resolve.js';
import { LineageEdgeKind, LineageResolutionStatus } from '../lineage/lineage.model.js';
import { inferRecordMaterialRole, isDiscoveryWorkLeafEligible, isSupportingRecord, sourceBoundaryClass, MaterialRole } from './workspace.materialRole.js';
import { sortWorkspaceFeedRecords } from './workspace.feedSort.js';
import { normalizeWorkspaceDisplayOptions, normalizeDisplayFilterValue } from './workspace.displayOptions.js';
import { auditIsMismatch, recordSchemaValue, recordMatchesQuery, assetMatchesQuery } from './workspace.displayFilters.js';
import { isLocalShadowedBySourceRecord } from './workspace.materialReconciliation.js';

export function buildWorkspaceDiscoveryView(workspace = {}, options = {}) {
  const records = Array.isArray(options.records) ? options.records : (Array.isArray(workspace.records) ? workspace.records : []);
  const assets = Array.isArray(options.assets) ? options.assets : (Array.isArray(workspace.assets) ? workspace.assets : []);
  const displayOptions = normalizeWorkspaceDisplayOptions(options.displayOptions || {});
  const query = String(options.query || '').trim();
  const auditById = options.auditById instanceof Map ? options.auditById : new Map();
  const materialIndex = options.materialIndex && Array.isArray(options.materialIndex.records) && options.materialIndex.records === records
    ? options.materialIndex
    : buildDiscoveryMaterialIndex(records);
  const hiddenReasonsById = new Map();
  const hiddenReasonsByRecordId = new Map();
  const membershipById = new Map();
  const membershipByRecordId = new Map();

  const visibleRecords = sortWorkspaceFeedRecords(records.filter((record) => {
    const inclusion = discoveryRecordMembership(record, displayOptions, auditById, materialIndex, query);
    membershipByRecordId.set(String(record?.id || record?.path || ''), inclusion);
    if (!inclusion.visible) hiddenReasonsByRecordId.set(String(record?.id || record?.path || ''), inclusion.reason);
    for (const key of descriptorFor(record, materialIndex)?.keys || recordKeys(record)) {
      membershipById.set(key, inclusion);
      if (!inclusion.visible) hiddenReasonsById.set(key, inclusion.reason);
    }
    return inclusion.visible;
  }));

  const visibleAssets = displayOptions.showAssets ? assets.filter((asset) => assetMatchesQuery(asset, query)) : [];
  const projectedRecords = visibleRecords;
  const visibleWorkspaceArtifactCount = projectedRecords.filter((record) => inferRecordMaterialRole(record) === MaterialRole.workspaceArtifact).length;
  const workspaceArtifactCount = records.filter((record) => inferRecordMaterialRole(record) === MaterialRole.workspaceArtifact).length;
  const choices = discoveryOptionChoices(records, auditById, materialIndex);

  return Object.freeze({
    records: projectedRecords,
    assets: visibleAssets,
    materialIndex,
    choices,
    counts: Object.freeze({
      records: records.length,
      visibleRecords: projectedRecords.length,
      leaves: choices.leafCount,
      supportingMarkdown: choices.supportingCount,
      mismatches: choices.mismatchCount,
      assets: assets.length,
      visibleAssets: visibleAssets.length,
      workspaceArtifacts: workspaceArtifactCount,
      visibleWorkspaceArtifacts: visibleWorkspaceArtifactCount,
          }),
    hiddenReasonsById,
    hiddenReasonsByRecordId,
    membershipById,
    membershipByRecordId
  });
}

export function discoveryRecordMembership(record = {}, options = {}, auditById = new Map(), materialIndex = null, query = '') {
  const descriptor = descriptorFor(record, materialIndex);
  const role = descriptor?.role || inferRecordMaterialRole(record);
  const supporting = descriptor ? descriptor.supporting : isSupportingRecord(record);
  const discoveryLeaf = isDiscoveryLeafRecord(record, materialIndex);
  const workspaceArtifactRecord = role === MaterialRole.workspaceArtifact;
  const parentReason = discoveryParentReason(record, materialIndex);
  if (isLocalShadowedBySourceRecord(record)) return hidden('hidden-local-shadowed-by-source', role, discoveryLeaf, supporting);
  const schemaFilter = normalizeDisplayFilterValue(options.schemaFilter);
  const explicitSchemaMatch = schemaFilter !== 'all' && recordSchemaValue(record) === schemaFilter;
  if (workspaceArtifactRecord && options.showWorkspaceArtifacts === false) return hidden('hidden-workspace-artifacts', role, discoveryLeaf, supporting);
  if (options.leavesOnly && !discoveryLeaf && !explicitSchemaMatch) return hidden(parentReason || (workspaceArtifactRecord ? 'hidden-workspace-parent' : 'hidden-not-terminal-work-leaf'), role, discoveryLeaf, supporting);
  if (!workspaceArtifactRecord && !options.showSupportingMarkdown && supporting && !explicitSchemaMatch) return hidden('hidden-supporting', role, discoveryLeaf, supporting);
  if (options.mismatchesOnly && !auditIsMismatch(record, auditById.get(record.id))) return hidden('hidden-filter', role, discoveryLeaf, supporting);
  if (schemaFilter !== 'all' && !explicitSchemaMatch) return hidden('hidden-filter', role, discoveryLeaf, supporting);
  const artifactFilter = normalizeDisplayFilterValue(options.artifactFilter);
  if (artifactFilter !== 'all' && role !== artifactFilter) return hidden('hidden-filter', role, discoveryLeaf, supporting);
  const sourceFilter = normalizeDisplayFilterValue(options.sourceFilter);
  const sourceClass = descriptor?.sourceClass || sourceBoundaryClass(record);
  if (sourceFilter !== 'all' && sourceClass !== sourceFilter) return hidden('hidden-filter', role, discoveryLeaf, supporting);
  if (!recordMatchesQuery(record, query)) return hidden('hidden-query', role, discoveryLeaf, supporting);
  return Object.freeze({ visible: true, reason: 'visible', role, discoveryLeaf, supporting });
}

export function buildDiscoveryDisplayOptionCounts(workspace = {}, options = {}) {
  const auditById = options.auditById instanceof Map ? options.auditById : new Map();
  const view = buildWorkspaceDiscoveryView(workspace, {
    records: Array.isArray(options.records) ? options.records : workspace.records,
    assets: Array.isArray(options.assets) ? options.assets : workspace.assets,
    displayOptions: Object.assign({}, options.displayOptions || {}, {
      leavesOnly: false,
      showSupportingMarkdown: true,
      showWorkspaceArtifacts: true,
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
    workspaceArtifacts: view.counts.workspaceArtifacts,
    schemaChoices: view.choices.schemas,
    artifactChoices: view.choices.artifacts,
    sourceChoices: view.choices.sources
  });
}

export function buildDiscoveryMaterialIndex(records = []) {
  const source = Array.isArray(records) ? records : [];
  const recordIndex = buildDiscoveryRecordIndex(source);
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
    const parent = recordIndex.byKey.get(keyLookup(edge.from));
    const child = recordIndex.byKey.get(keyLookup(edge.to));
    if (edge.status === LineageResolutionStatus.mismatch && !mismatchedEdgeStillOwnsDiscoveryParenthood(parent, child)) continue;
    for (const key of parent ? parent.keys : [String(edge.from)]) {
      lineageParentKeys.add(key);
      parentReasonsByKey.set(key, 'hidden-loaded-parent');
    }
    for (const key of child ? child.keys : [String(edge.to)]) lineageChildKeys.add(key);
  }

  addPathParentMembership(recordIndex, pathParentKeys, pathChildKeys, parentReasonsByKey);

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
    descriptors: recordIndex.descriptors,
    records: source,
    descriptorsByRecord: recordIndex.byRecord,
    descriptorsByKey: recordIndex.byKey,
    hasLineage: Boolean(resolved),
    parentCount: parentKeys.size,
    childCount: childKeys.size,
    lineageParentCount: lineageParentKeys.size,
    pathParentCount: pathParentKeys.size
  });
}

export function isDiscoveryLeafRecord(record = {}, materialIndex = null) {
  const descriptor = descriptorFor(record, materialIndex);
  const workEligible = descriptor ? descriptor.workEligible : isDiscoveryWorkLeafEligible(record);
  if (!workEligible) return false;
  const keys = descriptor?.keys || recordKeys(record);
  if (!materialIndex?.parentKeys) return true;
  return !keys.some((key) => materialIndex.parentKeys.has(key));
}

export function discoveryParentReason(record = {}, materialIndex = null) {
  const descriptor = descriptorFor(record, materialIndex);
  const workEligible = descriptor ? descriptor.workEligible : isDiscoveryWorkLeafEligible(record);
  if (!workEligible) {
    const role = descriptor?.role || inferRecordMaterialRole(record);
    if (role === MaterialRole.schemaDefinition) return 'hidden-schema-definition';
    if (role === MaterialRole.supporting || role === MaterialRole.unknown) return 'hidden-supporting';
    return 'hidden-not-work-leaf';
  }
  for (const key of descriptor?.keys || recordKeys(record)) {
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
    const descriptor = descriptorFor(record, materialIndex);
    const schema = descriptor?.schema || recordSchemaValue(record);
    if (schema) schemaCounts.set(schema, (schemaCounts.get(schema) || 0) + 1);
    const artifact = descriptor?.role || inferRecordMaterialRole(record);
    artifactCounts.set(artifact, (artifactCounts.get(artifact) || 0) + 1);
    const sourceClass = descriptor?.sourceClass || sourceBoundaryClass(record);
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

function buildDiscoveryRecordIndex(records = []) {
  const descriptors = [];
  const byRecord = new Map();
  const byKey = new Map();
  const workCandidates = [];
  const candidatesByDir = new Map();
  const folderRootTracesByDir = new Map();

  for (const record of Array.isArray(records) ? records : []) {
    const role = inferRecordMaterialRole(record);
    const supporting = role === MaterialRole.supporting || role === MaterialRole.schemaDefinition || role === MaterialRole.unknown;
    const sourceClass = sourceBoundaryClass(record);
    const path = normalizeDiscoveryPath(record.path || record.sourcePath || record.source?.path || '');
    const dir = dirname(path);
    const name = basename(path).toLowerCase();
    const keys = recordKeys(record);
    const descriptor = Object.freeze({
      record,
      role,
      supporting,
      sourceClass,
      schema: recordSchemaValue(record),
      path,
      dir,
      name,
      keys,
      keySet: new Set(keys),
      workEligible: (role === MaterialRole.leaf && isDiscoveryWorkLeafEligible(record)) || role === MaterialRole.workspaceArtifact
    });
    descriptors.push(descriptor);
    byRecord.set(record, descriptor);
    for (const key of keys) if (!byKey.has(keyLookup(key))) byKey.set(keyLookup(key), descriptor);
    if (descriptor.workEligible && descriptor.path && descriptor.dir) {
      workCandidates.push(descriptor);
      pushMapList(candidatesByDir, descriptor.dir, descriptor);
      if (descriptor.name === '001.trace.md') pushMapList(folderRootTracesByDir, descriptor.dir, descriptor);
    }
  }

  return Object.freeze({ descriptors, byRecord, byKey, workCandidates, candidatesByDir, folderRootTracesByDir });
}


function mismatchedEdgeStillOwnsDiscoveryParenthood(parent = null, child = null) {
  if (!parent || !child) return false;
  // A mismatched/stale edge between ordinary work leaves should stay visible in Discovery so
  // users can inspect the changed parent material. Workspace/root entrypoints are containers;
  // if a loaded child still points at them, Leaves only should not show them as terminal work.
  return parent.role === MaterialRole.workspaceArtifact && Boolean(child.workEligible);
}

function addPathParentMembership(recordIndex, pathParentKeys, pathChildKeys, parentReasonsByKey) {
  const candidates = Array.isArray(recordIndex?.workCandidates) ? recordIndex.workCandidates : [];
  const byDir = recordIndex?.candidatesByDir instanceof Map ? recordIndex.candidatesByDir : new Map();
  const rootsByDir = recordIndex?.folderRootTracesByDir instanceof Map ? recordIndex.folderRootTracesByDir : new Map();
  for (const child of candidates) {
    for (const ancestorDir of ancestorDirs(child.dir)) {
      const parents = byDir.get(ancestorDir) || [];
      for (const parent of parents) addPathParent(parent, child, pathParentKeys, pathChildKeys, parentReasonsByKey, 'hidden-path-parent');
    }
    for (const parent of rootsByDir.get(child.dir) || []) {
      addPathParent(parent, child, pathParentKeys, pathChildKeys, parentReasonsByKey, 'hidden-path-parent');
    }
  }
}

function addPathParent(parent, child, pathParentKeys, pathChildKeys, parentReasonsByKey, reason) {
  if (!parent || !child || sameDescriptor(parent, child)) return;
  for (const key of parent.keys) {
    pathParentKeys.add(key);
    if (!parentReasonsByKey.has(key)) parentReasonsByKey.set(key, reason);
  }
  for (const key of child.keys) pathChildKeys.add(key);
}

function descriptorFor(record = {}, materialIndex = null) {
  if (materialIndex?.descriptorsByRecord instanceof Map) {
    const byRecord = materialIndex.descriptorsByRecord.get(record);
    if (byRecord) return byRecord;
  }
  if (materialIndex?.descriptorsByKey instanceof Map) {
    for (const key of recordKeys(record)) {
      const byKey = materialIndex.descriptorsByKey.get(keyLookup(key));
      if (byKey) return byKey;
    }
  }
  return null;
}

function sameDescriptor(a = {}, b = {}) {
  if (a.record && b.record && a.record === b.record) return true;
  const aKeys = a.keySet || new Set(a.keys || []);
  for (const key of b.keys || []) if (aKeys.has(key)) return true;
  return false;
}

function recordKeys(record = {}) {
  const keys = [record.id, record.path, record.sourcePath, record.source?.path]
    .map((value) => String(value || '').trim())
    .filter(Boolean);
  const canonical = keys.map((value) => normalizeDiscoveryPath(value)).filter(Boolean);
  return Array.from(new Set(keys.concat(canonical)));
}

function keyLookup(value = '') {
  const raw = String(value || '').trim();
  return normalizeDiscoveryPath(raw) || raw;
}

function unionSets(...sets) {
  const out = new Set();
  for (const set of sets) for (const value of set || []) out.add(value);
  return out;
}

function pushMapList(map, key, value) {
  const existing = map.get(key);
  if (existing) existing.push(value);
  else map.set(key, [value]);
}

function ancestorDirs(dir = '') {
  const parts = normalizeDiscoveryPath(dir).split('/').filter(Boolean);
  const out = [];
  for (let i = 1; i < parts.length; i += 1) out.push(parts.slice(0, i).join('/'));
  return out;
}

function normalizeDiscoveryPath(value = '') {
  let raw = String(value || '').trim();
  if (!raw) return '';
  try {
    const url = new URL(raw);
    raw = url.pathname.replace(/^\/+/, '');
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
