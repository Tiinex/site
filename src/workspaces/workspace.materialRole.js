export const MaterialRole = Object.freeze({
  leaf: 'leaf',
  schemaDefinition: 'schema-definition',
  supporting: 'supporting',
  workspaceCandidate: 'workspace-candidate',
  asset: 'asset',
  unknown: 'unknown'
});

export function sourceBoundaryClass(record = {}) {
  const source = record.source || {};
  const mode = String(record.sourceMode || '').toLowerCase();
  if (source.adapterId === 'github' || source.kind === 'github-tree' || source.sourceKind === 'github.repo' || mode === 'source-backed') return 'source-backed';
  if (source.adapterId === 'local' || source.kind === 'local-session' || mode.startsWith('local')) return 'local';
  return 'unknown';
}

export function inferRecordMaterialRole(record = {}) {
  const declared = normalizeMaterialRole(record.materialRole || record.materialKind || record.artifactRole || record.presentationRole);
  if (declared) return declared;
  const path = String(record.path || record.name || '').toLowerCase();
  const kind = String(record.kind || '').toLowerCase();
  const schema = String(record.schemaId || record.currentSchemaId || record.envelopeSchemaId || '').toLowerCase();
  const markdown = String(record.markdown || '');

  if (isWorkspaceCandidatePath(path) || kind.includes('workspace')) return MaterialRole.workspaceCandidate;
  if (isSchemaDefinitionPath(path) || kind.includes('schema module') || kind.includes('schema-definition')) return MaterialRole.schemaDefinition;
  if (kind.includes('supporting') || schema.includes('tiinex.markdown.supporting')) return MaterialRole.supporting;
  if (hasDeclaredTiinexLeaf(record, markdown)) return MaterialRole.leaf;
  if (markdown.trim()) return MaterialRole.supporting;
  if (sourceBoundaryClass(record) === 'source-backed' && (schema || record.hasContinuityContext || record.hasIntegrity)) return MaterialRole.leaf;
  return MaterialRole.unknown;
}

export function isWorkLeafRecord(record = {}) {
  return inferRecordMaterialRole(record) === MaterialRole.leaf;
}

export function isSupportingRecord(record = {}) {
  const role = inferRecordMaterialRole(record);
  return role === MaterialRole.supporting || role === MaterialRole.schemaDefinition || role === MaterialRole.unknown;
}

export function isSchemaDefinitionRecord(record = {}) {
  return inferRecordMaterialRole(record) === MaterialRole.schemaDefinition;
}

export function materialRoleLabel(role = '') {
  const normalized = normalizeMaterialRole(role) || MaterialRole.unknown;
  if (normalized === MaterialRole.leaf) return 'Leaves';
  if (normalized === MaterialRole.schemaDefinition) return 'Schema definitions';
  if (normalized === MaterialRole.supporting) return 'Supporting docs';
  if (normalized === MaterialRole.workspaceCandidate) return 'Workspace candidates';
  if (normalized === MaterialRole.asset) return 'Assets';
  return 'Unknown/supporting';
}

function normalizeMaterialRole(value = '') {
  const role = String(value || '').trim().toLowerCase();
  if (role === MaterialRole.leaf || role === 'work-leaf' || role === 'artifact-leaf') return MaterialRole.leaf;
  if (role === MaterialRole.schemaDefinition || role === 'schema' || role === 'schema-definition') return MaterialRole.schemaDefinition;
  if (role === MaterialRole.supporting || role === 'doc' || role === 'supporting-material') return MaterialRole.supporting;
  if (role === MaterialRole.workspaceCandidate || role === 'workspace') return MaterialRole.workspaceCandidate;
  if (role === MaterialRole.asset) return MaterialRole.asset;
  if (role === MaterialRole.unknown) return MaterialRole.unknown;
  return '';
}

function hasDeclaredTiinexLeaf(record = {}, markdown = '') {
  if (record.hasContinuityContext || record.hasIntegrity || record.trace || record.origin || record.parentSchemaId) return true;
  if (record.schemaId || record.currentSchemaId || record.envelopeSchemaId) return true;
  if (/^\s*#\s*Continuity Context\b/im.test(markdown)) return true;
  if (/^\s*Current Schema\s*:/im.test(markdown) || /^\s*Envelope Schema\s*:/im.test(markdown)) return true;
  return false;
}

function isSchemaDefinitionPath(path = '') {
  return /(?:^|\/)[^/]+\.schema\.md$/i.test(path)
    || /(?:^|\/)[^/]+\.validator\.md$/i.test(path)
    || path.includes('/schemas/')
    || path.includes('/schema/')
    || path.endsWith('schema.json');
}

function isWorkspaceCandidatePath(path = '') {
  return /(?:^|\/)[^/]+\.workspace\.md$/i.test(path);
}
