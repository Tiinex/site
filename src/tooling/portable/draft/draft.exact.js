import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { createArtifactDraftMarkdown, renderArtifactCreationCandidateMarkdown, validateArtifactCreationResult } from '../../../schemas/creation.contracts.js';

const ROOT_TIMESTAMP_SHAPE = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

export function normalizePortableParentRecord(parent = {}) {
  return Object.freeze({
    id: String(parent.id || ''),
    path: String(parent.path || ''),
    kind: String(parent.kind || ''),
    schemaId: String(parent.schemaId || ''),
    currentSchemaId: String(parent.currentSchemaId || ''),
    currentCreatedAt: String(parent.currentCreatedAt || ''),
    createdAt: String(parent.createdAt || ''),
    continuationTrace: String(parent.continuationTrace || ''),
    boundary: String(parent.boundary || parent.source?.boundary || ''),
    sourceMode: String(parent.sourceMode || ''),
    source: parent.source || null,
    markdown: String(parent.markdown || ''),
    integrity: parent.integrity || null,
    publishedReference: normalizeReferenceEvidence(parent.publishedReference || parent.browseGitReference || parent.browseGit || null),
    schemaReferenceAuthority: normalizeSchemaReferenceEvidence(parent.schemaReferenceAuthority || parent.parentSchemaReferenceAuthority || null)
  });
}

export function qualifyPortableExactParent(parent = {}, transitionType = 'create-artifact') {
  const rootCreation = String(transitionType || 'create-artifact') === 'create-artifact';
  const declared = parentHasAnyValue(parent);
  if (rootCreation) return declared ? invalid('root-parent-declared') : qualified(Object.freeze({}));
  if (!declared) return invalid('continuation-parent-required');
  if (!parent.id) return invalid('continuation-parent-id-required');
  const schemaAuthority = qualifyParentSchemaAuthority(parent);
  if (schemaAuthority.state !== 'qualified') return invalid(schemaAuthority.reason, schemaAuthority.evidence);
  if (!parent.path) return invalid('continuation-parent-origin-required');
  const createdAtAuthority = qualifyParentCreatedAtAuthority(parent);
  if (createdAtAuthority.state !== 'qualified') return invalid(createdAtAuthority.reason, createdAtAuthority.evidence);
  if (parent.continuationTrace) return invalid('continuation-parent-legacy-trace-not-authority', { observedTrace: parent.continuationTrace });
  const schemaReference = parent.schemaReferenceAuthority || {};
  if (schemaReference.schemaId && schemaReference.schemaId !== schemaAuthority.schemaId) return invalid('continuation-parent-schema-reference-contradictory', { schemaId: schemaAuthority.schemaId, referenceSchemaId: schemaReference.schemaId });
  const snapshot = Object.freeze({
    ...parent,
    schemaId: schemaAuthority.schemaId,
    createdAt: createdAtAuthority.createdAt,
    continuationTrace: ''
  });
  const schemaReferenceQualified = Boolean(schemaReference.preferredTarget && schemaReference.resolutionState === 'qualified');
  const published = parent.publishedReference || {};
  const publishedQualified = Boolean(published.target && published.state === 'qualified');
  if (schemaReferenceQualified && publishedQualified) return qualified(snapshot);
  if (!schemaReferenceQualified) return qualifiedLocal(snapshot, 'continuation-parent-schema-reference-unqualified', {
    schemaReferenceAuthority: schemaReference,
    publishedReference: published,
    exactnessConflict: 'Local continuity can preserve the declared Parent Schema identity/reference, but exact continuation requires independently qualified Parent Schema authority.'
  });
  if (!published.target) return qualifiedLocal(snapshot, 'continuation-parent-browse-git-root-contract-conflict', {
    publishedReference: published,
    rootContractConflict: 'Parent Origin currently requires browse + git for exact Root qualification, while unpublished local continuity has no truthful published representation.'
  });
  return qualifiedLocal(snapshot, 'continuation-parent-browse-git-unqualified', {
    publishedReference: published,
    exactnessConflict: 'A supplied published Parent reference is not qualified; local continuity remains usable without promoting that reference to browse + git authority.'
  });
}

function qualifyParentCreatedAtAuthority(parent = {}) {
  const declared = [
    ...(parent.currentCreatedAt ? [{ field: 'currentCreatedAt', value: String(parent.currentCreatedAt) }] : []),
    ...(parent.createdAt ? [{ field: 'createdAt', value: String(parent.createdAt) }] : [])
  ];
  const distinct = [...new Set(declared.map((item) => item.value))];
  if (distinct.length > 1) return Object.freeze({ state: 'invalid', reason: 'continuation-parent-created-at-contradictory', createdAt: '', evidence: Object.freeze({ declared: Object.freeze(declared.map((item) => Object.freeze({ ...item }))) }) });
  const createdAt = distinct[0] || '';
  if (createdAt && !ROOT_TIMESTAMP_SHAPE.test(createdAt)) return Object.freeze({ state: 'invalid', reason: 'continuation-parent-created-at-invalid', createdAt: '', evidence: Object.freeze({ observedCreatedAt: createdAt, requiredShape: 'YYYY-MM-DD hh:mm:ss', declared: Object.freeze(declared.map((item) => Object.freeze({ ...item }))) }) });
  return Object.freeze({ state: 'qualified', reason: '', createdAt, evidence: Object.freeze({ declared: Object.freeze(declared.map((item) => Object.freeze({ ...item }))) }) });
}

export function renderQualifiedPortableExactDraft({ contract = {}, schemaId = '', transitionType = 'create-artifact', parentSnapshot = {}, rendererInput = {} } = {}) {
  const markdown = createArtifactDraftMarkdown(contract, { ...rendererInput, parentRecord: parentSnapshot, currentSchemaId: schemaId });
  if (!markdown) return Object.freeze({ state: 'unqualified', reason: 'exact-renderer-empty-or-unqualified', markdown: '', validation: null, parentRepresentation: null });
  const validation = validateArtifactCreationResult({ schemaId, status: 'local', sourceMode: 'local-portable-draft', markdown }, parentSnapshot, { contract, childPath: rendererInput.childPath || '', expectedAuthors: rendererInput.authors });
  const parentRepresentation = qualifyPortableRenderedParentRepresentation(markdown, parentSnapshot, transitionType, rendererInput.childPath || '');
  if (!validation.ok) return Object.freeze({ state: 'unqualified', reason: 'exact-result-validation-failed', markdown: '', validation, parentRepresentation });
  if (parentRepresentation.state !== 'qualified') return Object.freeze({ state: 'unqualified', reason: parentRepresentation.reason, markdown: '', validation, parentRepresentation });
  return Object.freeze({ state: 'qualified', reason: '', markdown, validation, parentRepresentation });
}

export function renderPortableLocalContinuityDraft({ contract = {}, schemaId = '', transitionType = 'continue-from-record', parentSnapshot = {}, rendererInput = {} } = {}) {
  const markdown = renderArtifactCreationCandidateMarkdown(contract, { ...rendererInput, parentRecord: parentSnapshot, currentSchemaId: schemaId });
  if (!markdown) return Object.freeze({ state: 'unqualified', reason: 'local-continuity-renderer-empty', markdown: '', validation: null, parentRepresentation: null });
  const parentRepresentation = qualifyPortableRenderedParentRepresentation(markdown, parentSnapshot, transitionType, rendererInput.childPath || '', { allowUnpublishedLocalParent: true });
  if (parentRepresentation.state !== 'qualified-local-continuity') return Object.freeze({ state: 'unqualified', reason: parentRepresentation.reason || 'local-continuity-parent-representation-mismatch', markdown: '', validation: null, parentRepresentation });
  const validation = validateArtifactCreationResult({ schemaId, status: 'local', sourceMode: 'local-portable-draft', markdown }, parentSnapshot, { contract, childPath: rendererInput.childPath || '', expectedAuthors: rendererInput.authors });
  return Object.freeze({
    state: 'qualified-local-continuity',
    reason: 'continuation-parent-browse-git-root-contract-conflict',
    markdown,
    validation,
    parentRepresentation
  });
}

function qualifyParentSchemaAuthority(parent = {}) {
  const schemaId = String(parent.schemaId || '');
  const currentSchemaId = String(parent.currentSchemaId || '');
  const declared = [...(schemaId ? [{ field: 'schemaId', value: schemaId }] : []), ...(currentSchemaId ? [{ field: 'currentSchemaId', value: currentSchemaId }] : [])];
  if (!declared.length) return Object.freeze({ state: 'invalid', reason: 'continuation-parent-schema-required', schemaId: '', evidence: Object.freeze({}) });
  const distinct = [...new Set(declared.map((item) => item.value))];
  if (distinct.length !== 1) return Object.freeze({ state: 'invalid', reason: 'continuation-parent-schema-contradictory', schemaId: '', evidence: Object.freeze({ schemaId, currentSchemaId, declared: Object.freeze(declared.map((item) => Object.freeze({ ...item }))) }) });
  return Object.freeze({ state: 'qualified', reason: '', schemaId: distinct[0], evidence: Object.freeze({ declared: Object.freeze(declared.map((item) => Object.freeze({ ...item }))) }) });
}

export function qualifyPortableRenderedParentRepresentation(markdown = '', parent = {}, transitionType = 'create-artifact', childPath = '', options = {}) {
  const rootCreation = String(transitionType || 'create-artifact') === 'create-artifact';
  let parsed;
  try { parsed = parseArtifactMarkdown(markdown); } catch (_) { return Object.freeze({ state: 'invalid', reason: 'exact-result-parent-parse-failed' }); }
  const observed = parsed.envelope?.parent || {};
  const hasObserved = Boolean(observed.schema?.id || observed.trace || observed.origin || observed.createdAt || observed.boundary || observed.originEntries?.length);
  if (rootCreation) return Object.freeze({ state: hasObserved ? 'invalid' : 'qualified', reason: hasObserved ? 'exact-result-parent-unexpected' : '' });
  const relative = relativePath(dirname(childPath), parent.path);
  const published = String(parent.publishedReference?.target || '');
  const schemaTarget = String(parent.schemaReferenceAuthority?.preferredTarget || '');
  const origins = observed.originEntries || [];
  const createdAtLines = renderedParentFieldLines(markdown, 'Created At');
  const expectedCreatedAt = String(parent.createdAt || '');
  const createdAtExact = expectedCreatedAt ? createdAtLines.length === 1 && createdAtLines[0] === `  - Created At: ${expectedCreatedAt}` : createdAtLines.length === 0;
  const relativeOrigins = origins.filter((entry) => entry.label === 'relative');
  const browseOrigins = origins.filter((entry) => entry.label === 'browse + git');
  const localOnly = options.allowUnpublishedLocalParent === true && !published;
  const localExact = localOnly
    && String(observed.schema?.id || '') === String(parent.schemaId || '')
    && String(observed.schema?.target || '') === schemaTarget
    && String(observed.trace || '') === relative
    && /^\[[^\]]+\]\([^)]+\)$/.test(String(observed.traceRaw || ''))
    && relativeOrigins.length === 1 && relativeOrigins[0].target === relative
    && browseOrigins.length === 0
    && origins.length === 1
    && !String(observed.boundary || '')
    && createdAtExact
    && String(observed.createdAt || '') === expectedCreatedAt;
  const exact = String(observed.schema?.id || '') === String(parent.schemaId || '')
    && String(observed.schema?.target || '') === schemaTarget
    && String(observed.trace || '') === relative
    && /^\[[^\]]+\]\([^)]+\)$/.test(String(observed.traceRaw || ''))
    && relativeOrigins.length === 1 && relativeOrigins[0].target === relative
    && browseOrigins.length === 1 && browseOrigins[0].target === published
    && origins.length === 2
    && !String(observed.boundary || '')
    && createdAtExact
    && String(observed.createdAt || '') === expectedCreatedAt;
  return Object.freeze({
    state: exact ? 'qualified' : localExact ? 'qualified-local-continuity' : 'invalid',
    reason: exact ? '' : localExact ? 'continuation-parent-browse-git-root-contract-conflict' : 'exact-result-parent-representation-mismatch',
    expected: Object.freeze({ schemaId: String(parent.schemaId || ''), schemaTarget, trace: relative, relativeOrigin: relative, browseGitOrigin: published, createdAt: expectedCreatedAt }),
    observed: Object.freeze({ schemaId: String(observed.schema?.id || ''), schemaTarget: String(observed.schema?.target || ''), trace: String(observed.trace || ''), traceRaw: String(observed.traceRaw || ''), origins: Object.freeze(origins), boundary: String(observed.boundary || ''), createdAt: String(observed.createdAt || ''), createdAtLines: Object.freeze(createdAtLines) })
  });
}

function renderedParentFieldLines(markdown = '', label = '') {
  const lines = String(markdown || '').split('\n');
  const start = lines.findIndex((line) => line === '- Parent');
  if (start < 0) return [];
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i += 1) if (/^-\s+\S/.test(lines[i])) { end = i; break; }
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`^  - ${escaped}:`);
  return lines.slice(start + 1, end).filter((line) => re.test(line));
}

function normalizeReferenceEvidence(value) {
  if (!value) return Object.freeze({ target: '', state: 'unavailable', evidence: Object.freeze({}) });
  if (typeof value === 'string') return Object.freeze({ target: value, state: 'unresolved', evidence: Object.freeze({}) });
  return Object.freeze({ target: String(value.target || value.url || ''), state: String(value.state || value.resolutionState || 'unresolved'), evidence: Object.freeze({ ...(value.evidence || value.resolutionEvidence || {}) }) });
}
function normalizeSchemaReferenceEvidence(value) {
  if (!value) return Object.freeze({ schemaId: '', preferredTarget: '', exactTargets: Object.freeze([]), resolutionState: 'unavailable', evidence: Object.freeze({}) });
  if (typeof value === 'string') return Object.freeze({ schemaId: '', preferredTarget: value, exactTargets: Object.freeze([value]), resolutionState: 'unresolved', evidence: Object.freeze({}) });
  const preferredTarget = String(value.preferredTarget || value.target || '');
  return Object.freeze({ schemaId: String(value.schemaId || ''), preferredTarget, exactTargets: Object.freeze([...new Set([...(value.exactTargets || []), preferredTarget].map(String).filter(Boolean))]), resolutionState: String(value.resolutionState || value.state || 'unresolved'), evidence: Object.freeze({ ...(value.evidence || value.resolutionEvidence || {}) }) });
}
function parentHasAnyValue(parent = {}) { return Boolean(parent.id || parent.path || parent.kind || parent.schemaId || parent.currentSchemaId || parent.continuationTrace || parent.currentCreatedAt || parent.createdAt || parent.boundary || parent.sourceMode || parent.source || parent.publishedReference?.target || parent.schemaReferenceAuthority?.preferredTarget); }
function qualified(snapshot) { return Object.freeze({ state: 'qualified', reason: '', snapshot }); }
function qualifiedLocal(snapshot, reason = 'continuation-parent-browse-git-root-contract-conflict', evidence = {}) { return Object.freeze({ state: 'qualified-local-continuity', reason, snapshot, evidence: Object.freeze({ ...evidence }) }); }
function invalid(reason, evidence = {}) { return Object.freeze({ state: 'invalid', reason, snapshot: null, evidence: Object.freeze({ ...evidence }) }); }
function normalizePath(value='') { return String(value || '').replace(/\\/g,'/').replace(/^\.\//,'').replace(/^\/+|\/+$/g,''); }
function dirname(value='') { const p=normalizePath(value); const i=p.lastIndexOf('/'); return i<0?'':p.slice(0,i); }
function relativePath(fromDir='', toPath='') { const from=normalizePath(fromDir).split('/').filter(Boolean), to=normalizePath(toPath).split('/').filter(Boolean); let i=0; while(i<from.length&&i<to.length&&from[i]===to[i])i++; return [...Array(from.length-i).fill('..'),...to.slice(i)].join('/') || (to.at(-1)||''); }
