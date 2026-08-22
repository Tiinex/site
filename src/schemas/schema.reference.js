import { canonicalGithubSchemaSourceTargets } from './schema.githubSourceTarget.js';

export const SCHEMA_REFERENCE_AUTHORITY_SCHEMA_ID = 'tiinex.site.schema-reference-authority.v1';
export const SCHEMA_REFERENCE_MATERIAL_COHERENCE_SCHEMA_ID = 'tiinex.site.schema-reference-material-coherence.v1';

export function schemaReferenceAuthorityFromBinding(schemaId = '', binding = {}, sourceAuthority = null, sourceQualification = null) {
  const id = String(schemaId || binding?.schemaId || '').trim();
  const exactSourceTargets = canonicalGithubSchemaSourceTargets(sourceAuthority);
  const exactTargets = exactSourceTargets.state === 'qualified' ? [...exactSourceTargets.targets] : [];
  const semanticMaterialIdentity = normalizeMaterialIdentity(sourceQualification?.materialIdentity || {});
  const sourceQualified = sourceQualification?.state === 'qualified' && semanticMaterialIdentity.state === 'qualified';
  const materialBoundTarget = Boolean(exactTargets.length && sourceQualified && sourceQualification?.bindingMaterialCoherence?.state === 'qualified');
  const preferredTarget = exactTargets[0] || '';
  return Object.freeze({
    schema: SCHEMA_REFERENCE_AUTHORITY_SCHEMA_ID,
    schemaId: id,
    exactTargets: Object.freeze(exactTargets),
    semanticSourceTargets: Object.freeze(exactTargets),
    materialBoundTarget,
    preferredTarget,
    targetAuthority: exactTargets.length ? 'exact-source-target' : 'schema-id-only',
    resolutionState: materialBoundTarget ? 'qualified' : exactTargets.length ? 'unresolved' : 'unavailable',
    resolutionEvidence: Object.freeze(materialBoundTarget ? resolvedMaterialEvidence(preferredTarget, semanticMaterialIdentity) : {}),
    semanticMaterialIdentity,
    exactSourceTargets
  });
}

export function qualifySchemaReferenceMaterialCoherence(authority = {}) {
  const semantic = normalizeMaterialIdentity(authority?.semanticMaterialIdentity || {});
  const target = String(authority?.preferredTarget || authority?.target || '').trim();
  const directSourceTarget = authority?.materialBoundTarget === true;
  const schemaIdOnly = !target && String(authority?.targetAuthority || '') === 'schema-id-only';
  const resolutionEvidence = normalizeResolutionEvidence(authority?.resolutionEvidence || authority?.evidence || {}, target);
  const evidence = resolutionEvidence.materialIdentity;
  const findings = [];
  if (semantic.state !== 'qualified') findings.push('Qualified semantic schema material identity is unavailable.');
  let match = false;
  let mode = 'unavailable';
  if (semantic.state === 'qualified' && schemaIdOnly) {
    match = true;
    mode = 'schema-id-only-semantic-material';
  } else if (semantic.state === 'qualified' && directSourceTarget) {
    match = true;
    mode = 'declared-source-target';
  } else if (semantic.state === 'qualified' && resolutionEvidence.state === 'qualified' && evidence.state === 'qualified') {
    match = materialIdentitiesMatch(semantic, evidence);
    mode = match ? 'resolved-byte-equivalent-material' : 'resolved-material-mismatch';
    if (!match) findings.push('Resolved schema-reference material does not match the semantic schema material used for exact creation.');
  } else if (semantic.state === 'qualified') {
    findings.push('Resolved schema-reference material identity is unavailable or not target-qualified; exact creation cannot bind the declared reference to the semantic schema material.');
  }
  if (!schemaIdOnly && authority?.resolutionState !== 'qualified') findings.push(`Declared schema reference resolver state is ${authority?.resolutionState || 'unavailable'}; exact creation requires qualified resolution.`);
  return Object.freeze({ schema: SCHEMA_REFERENCE_MATERIAL_COHERENCE_SCHEMA_ID, state: findings.length || !match ? 'unavailable' : 'qualified', mode, target, semanticMaterialIdentity: semantic, resolverEvidence: resolutionEvidence, resolvedMaterialIdentity: evidence, findings: Object.freeze(findings) });
}

function normalizeMaterialIdentity(value = {}) {
  const sha256 = String(value?.sha256 || value?.checksum || '').trim().toLowerCase();
  const sourceBlobSha = String(value?.sourceBlobSha || value?.gitBlobSha || value?.blobSha || '').trim().toLowerCase();
  const bytes = Number(value?.bytes || value?.byteLength || 0);
  const schemaId = String(value?.schemaId || '').trim();
  const qualified = value?.state === 'qualified' && Boolean(sha256 || sourceBlobSha);
  return Object.freeze({ schema: String(value?.schema || 'tiinex.site.schema-material-identity.v1'), state: qualified ? 'qualified' : 'unavailable', schemaId, sha256, sourceBlobSha, bytes: Number.isFinite(bytes) && bytes > 0 ? bytes : 0, sourceRepository: String(value?.sourceRepository || ''), sourceCommit: String(value?.sourceCommit || ''), sourcePath: String(value?.sourcePath || '') });
}

function normalizeResolutionEvidence(value = {}, target = '') {
  const declaredTarget = String(value?.target || value?.resolvedTarget || '').trim();
  const state = String(value?.state || value?.qualification || '').trim();
  const materialIdentity = normalizeResolvedMaterialIdentity(value?.materialIdentity || value?.material || {});
  const qualified = state === 'qualified' && declaredTarget && declaredTarget === String(target || '').trim() && materialIdentity.state === 'qualified';
  return Object.freeze({ state: qualified ? 'qualified' : 'unavailable', target: declaredTarget, materialIdentity, evidenceKind: String(value?.kind || value?.evidenceKind || '') });
}

function normalizeResolvedMaterialIdentity(value = {}) {
  const sha256 = String(value?.sha256 || value?.checksum || value?.materialSha256 || '').trim().toLowerCase();
  const sourceBlobSha = String(value?.sourceBlobSha || value?.gitBlobSha || value?.blobSha || '').trim().toLowerCase();
  const bytes = Number(value?.bytes || value?.byteLength || 0);
  return Object.freeze({ schema: 'tiinex.site.schema-material-identity.v1', state: sha256 || sourceBlobSha ? 'qualified' : 'unavailable', schemaId: String(value?.schemaId || ''), sha256, sourceBlobSha, bytes: Number.isFinite(bytes) && bytes > 0 ? bytes : 0, sourceRepository: String(value?.sourceRepository || value?.repository || ''), sourceCommit: String(value?.sourceCommit || value?.commit || ''), sourcePath: String(value?.sourcePath || value?.path || '') });
}

function resolvedMaterialEvidence(target = '', identity = {}) {
  return Object.freeze({ state: 'qualified', target: String(target || ''), materialIdentity: Object.freeze({ state: 'qualified', sha256: String(identity?.sha256 || ''), gitBlobSha: String(identity?.sourceBlobSha || ''), bytes: Number(identity?.bytes || 0), sourceRepository: String(identity?.sourceRepository || ''), sourceCommit: String(identity?.sourceCommit || ''), sourcePath: String(identity?.sourcePath || '') }) });
}

function materialIdentitiesMatch(semantic = {}, resolved = {}) {
  const cryptographic = [];
  if (semantic.sha256 && resolved.sha256) cryptographic.push(semantic.sha256 === resolved.sha256);
  if (semantic.sourceBlobSha && resolved.sourceBlobSha) cryptographic.push(semantic.sourceBlobSha === resolved.sourceBlobSha);
  if (!cryptographic.length || cryptographic.some((match) => !match)) return false;
  if (semantic.bytes && resolved.bytes && semantic.bytes !== resolved.bytes) return false;
  return true;
}

export function parseSchemaReferenceValue(value = '') {
  const raw = String(value ?? '');
  if (!raw) return Object.freeze({ raw: '', form: 'empty', schemaId: '', target: '' });
  const link = raw.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
  if (link) return Object.freeze({ raw, form: 'markdown-link', schemaId: link[1], target: link[2] });
  return Object.freeze({ raw, form: 'plain-schema-id', schemaId: raw, target: '' });
}

export function renderSchemaReference(authority = {}) {
  const schemaId = String(authority?.schemaId || '').trim();
  if (!schemaId) throw new Error('schema-reference-id-missing');
  const target = String(authority?.preferredTarget || '').trim();
  return target ? `[${schemaId}](${target})` : schemaId;
}

export function qualifySchemaReferenceValue(value = '', authority = {}) {
  const observed = parseSchemaReferenceValue(value);
  const expectedSchemaId = String(authority?.schemaId || '').trim();
  const exactTargets = new Set([...(authority?.exactTargets || [])].map((item) => String(item ?? '')).filter(Boolean));
  const findings = [];
  if (!expectedSchemaId) findings.push('Expected schema identifier authority is unavailable.');
  if (observed.schemaId !== expectedSchemaId) findings.push(`Schema identifier must be exactly ${expectedSchemaId}; observed ${observed.schemaId || '(empty)'}.`);
  let targetState = 'not-present';
  if (observed.form === 'markdown-link') {
    targetState = exactTargets.has(observed.target) ? 'qualified' : 'unqualified';
    if (targetState !== 'qualified') findings.push(`Schema reference target is not qualified for ${expectedSchemaId}: ${observed.target || '(empty)'}.`);
  }
  if (observed.form === 'empty') findings.push('Schema reference value is empty.');
  return Object.freeze({
    state: findings.length ? 'unavailable' : 'qualified',
    schemaIdState: observed.schemaId === expectedSchemaId && expectedSchemaId ? 'qualified' : 'unavailable',
    targetState,
    observed,
    authority,
    findings: Object.freeze(findings)
  });
}
