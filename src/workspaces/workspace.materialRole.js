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
  if (isCanonicalSchemaArtifactPath(path) && hasDeclaredTiinexLeaf(record, markdown)) return MaterialRole.leaf;
  if (isSchemaDefinitionPath(path) || kind.includes('schema module') || kind.includes('schema-definition')) return MaterialRole.schemaDefinition;
  if (isKnownSupportSurfacePath(path) || isKnownSupportSchema(schema) || kind.includes('supporting') || schema.includes('tiinex.markdown.supporting')) return MaterialRole.supporting;
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
  const path = String(record.path || record.name || '').toLowerCase();
  const schema = String(record.schemaId || record.currentSchemaId || record.envelopeSchemaId || '').toLowerCase();
  if (!isCanonicalSchemaArtifactPath(path) && (isKnownSupportSurfacePath(path) || isKnownSupportSchema(schema))) return false;
  if (path.endsWith('.trace.md')) return true;
  if (record.trace || record.parentSchemaId) return true;
  const hasContinuity = record.hasContinuityContext || record.hasIntegrity || /^\s*#\s*Continuity Context\b/im.test(markdown);
  if (isCanonicalSchemaArtifactPath(path) && hasContinuity) return true;
  if (hasContinuity) {
    return !isKnownSupportSchema(schema);
  }
  if (schema && !isKnownSupportSchema(schema) && isKnownWorkSchema(schema)) return true;
  return false;
}

function isKnownSupportSchema(schema = '') {
  const value = String(schema || '').toLowerCase();
  if (!value) return false;
  if (isKnownWorkSchema(value)) return false;
  return value === 'tiinex.root.v1'
    || value === 'tiinex.source.v1'
    || value === 'tiinex.access.v1'
    || value === 'tiinex.origin.v1'
    || value === 'tiinex.digital.origin.v1'
    || value === 'tiinex.natural.origin.v1'
    || value === 'tiinex.tool.v1'
    || value === 'tiinex.interface.v1'
    || value === 'tiinex.adapter.v1'
    || value === 'tiinex.digital.adapter.v1'
    || value.startsWith('tiinex.source.')
    || value.startsWith('tiinex.access.')
    || value.startsWith('tiinex.origin.')
    || value.startsWith('tiinex.digital.origin.')
    || value.startsWith('tiinex.natural.origin.')
    || value.startsWith('tiinex.tool.')
    || value.startsWith('tiinex.interface.')
    || value.startsWith('tiinex.schema.')
    || value.startsWith('tiinex.presentation.surface.')
    || value.startsWith('tiinex.validation.method.');
}

function isKnownWorkSchema(schema = '') {
  const value = String(schema || '').toLowerCase();
  if (!value) return false;
  return value.startsWith('tiinex.topic.')
    || value.startsWith('tiinex.task.')
    || value.startsWith('tiinex.preservation.')
    || value.startsWith('tiinex.evidence.')
    || value.startsWith('tiinex.feedback.')
    || value.startsWith('tiinex.decision.')
    || value.startsWith('tiinex.pointer.')
    || value.startsWith('tiinex.signal.')
    || value.startsWith('tiinex.interpretation.')
    || value.startsWith('tiinex.lineage.')
    || value.startsWith('tiinex.party.')
    || value.startsWith('tiinex.event.')
    || value.startsWith('tiinex.project.')
    || value.startsWith('tiinex.milestone.')
    || value.startsWith('tiinex.schedule.')
    || value.startsWith('tiinex.invitation.')
    || value.startsWith('tiinex.availability.')
    || value.startsWith('tiinex.discovery.')
    || value.startsWith('tiinex.resource.')
    || value.startsWith('tiinex.instrument.')
    || value.startsWith('tiinex.transition.')
    || value.startsWith('tiinex.relation.')
    || value.startsWith('tiinex.validation.finding.')
    || value.startsWith('tiinex.validation.report.')
    || value.startsWith('tiinex.runtime.')
    || value.startsWith('tiinex.ai.runtime.')
    || value.startsWith('tiinex.machine.runtime.')
    || value.startsWith('tiinex.reduction.')
    || value.startsWith('tiinex.redaction.')
    || value.startsWith('tiinex.privacy.')
    || value.startsWith('tiinex.attestation.')
    || value.startsWith('tiinex.external.')
    || value.startsWith('tiinex.traversal.')
    || value.startsWith('tiinex.quantum.')
    || value.startsWith('tiinex.portal.')
    || value.startsWith('tiinex.interaction.')
    || value.startsWith('tiinex.question.')
    || value.startsWith('tiinex.condition.')
    || value.startsWith('tiinex.claim.')
    || value.startsWith('tiinex.derivation.')
    || value.startsWith('tiinex.annotation.')
    || value.startsWith('tiinex.artifact.annotation.')
    || value.startsWith('tiinex.spatial.annotation.')
    || value.startsWith('tiinex.projection.annotation.')
    || value.startsWith('tiinex.temporal.annotation.')
    || value.startsWith('tiinex.semantic.annotation.')
    || value.startsWith('tiinex.style.annotation.')
    || value.startsWith('tiinex.validation.annotation.')
    || value.startsWith('tiinex.adapter.annotation.');
}

function isCanonicalSchemaArtifactPath(path = '') {
  const value = String(path || '').toLowerCase();
  return (value.includes('/.topics/.schemas/') || value.startsWith('.topics/.schemas/'))
    && value.endsWith('.schema.md');
}

function isKnownSupportSurfacePath(path = '') {
  const value = String(path || '').toLowerCase();
  return value.includes('/.schemas/')
    || value.includes('/schemas/')
    || value.includes('/schema/')
    || value.includes('/.adapters/')
    || value.includes('/adapters/')
    || value.includes('/.tools/')
    || value.includes('/tools/')
    || value.includes('/.interfaces/')
    || value.includes('/interfaces/')
    || value.endsWith('/readme.md')
    || value.endsWith('readme.md');
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
