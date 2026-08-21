import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { createArtifactDraftMarkdown, validateArtifactCreationResult } from '../../../schemas/creation.contracts.js';

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
    source: parent.source || null
  });
}

export function qualifyPortableExactParent(parent = {}, transitionType = 'create-artifact') {
  const rootCreation = String(transitionType || 'create-artifact') === 'create-artifact';
  const declared = parentHasAnyValue(parent);
  if (rootCreation) return declared
    ? invalid('root-parent-declared')
    : qualified(Object.freeze({}));
  if (!declared) return invalid('continuation-parent-required');
  if (!parent.id) return invalid('continuation-parent-id-required');
  const schemaAuthority = qualifyParentSchemaAuthority(parent);
  if (schemaAuthority.state !== 'qualified') return invalid(schemaAuthority.reason, schemaAuthority.evidence);
  if (!parent.path) return invalid('continuation-parent-origin-required');
  const createdAtAuthority = qualifyParentCreatedAtAuthority(parent);
  if (createdAtAuthority.state !== 'qualified') return invalid(createdAtAuthority.reason, createdAtAuthority.evidence);
  const expectedTrace = `record:${parent.id}`;
  if (parent.continuationTrace && parent.continuationTrace !== expectedTrace) return invalid('continuation-parent-trace-contradictory', {
    expectedTrace,
    observedTrace: parent.continuationTrace
  });
  return qualified(Object.freeze({
    ...parent,
    schemaId: schemaAuthority.schemaId,
    createdAt: createdAtAuthority.createdAt,
    continuationTrace: expectedTrace
  }));
}

function qualifyParentCreatedAtAuthority(parent = {}) {
  const declared = [
    ...(parent.currentCreatedAt ? [{ field: 'currentCreatedAt', value: String(parent.currentCreatedAt) }] : []),
    ...(parent.createdAt ? [{ field: 'createdAt', value: String(parent.createdAt) }] : [])
  ];
  const distinct = [...new Set(declared.map((item) => item.value))];
  if (distinct.length > 1) return Object.freeze({
    state: 'invalid',
    reason: 'continuation-parent-created-at-contradictory',
    createdAt: '',
    evidence: Object.freeze({ declared: Object.freeze(declared.map((item) => Object.freeze({ ...item }))) })
  });
  const createdAt = distinct[0] || '';
  if (createdAt && !ROOT_TIMESTAMP_SHAPE.test(createdAt)) return Object.freeze({
    state: 'invalid',
    reason: 'continuation-parent-created-at-invalid',
    createdAt: '',
    evidence: Object.freeze({
      observedCreatedAt: createdAt,
      requiredShape: 'YYYY-MM-DD hh:mm:ss',
      declared: Object.freeze(declared.map((item) => Object.freeze({ ...item })))
    })
  });
  return Object.freeze({ state: 'qualified', reason: '', createdAt, evidence: Object.freeze({ declared: Object.freeze(declared.map((item) => Object.freeze({ ...item }))) }) });
}

export function renderQualifiedPortableExactDraft({ contract = {}, schemaId = '', transitionType = 'create-artifact', parentSnapshot = {}, rendererInput = {} } = {}) {
  const markdown = createArtifactDraftMarkdown(contract, { ...rendererInput, parentRecord: parentSnapshot, currentSchemaId: schemaId });
  if (!markdown) return Object.freeze({ state: 'unqualified', reason: 'exact-renderer-empty-or-unqualified', markdown: '', validation: null, parentRepresentation: null });
  const validation = validateArtifactCreationResult({ schemaId, status: 'local', sourceMode: 'local-portable-draft', markdown }, parentSnapshot, { contract });
  const parentRepresentation = qualifyPortableRenderedParentRepresentation(markdown, parentSnapshot, transitionType);
  if (!validation.ok) return Object.freeze({ state: 'unqualified', reason: 'exact-result-validation-failed', markdown: '', validation, parentRepresentation });
  if (parentRepresentation.state !== 'qualified') return Object.freeze({ state: 'unqualified', reason: parentRepresentation.reason, markdown: '', validation, parentRepresentation });
  return Object.freeze({ state: 'qualified', reason: '', markdown, validation, parentRepresentation });
}

function qualifyParentSchemaAuthority(parent = {}) {
  const schemaId = String(parent.schemaId || '');
  const currentSchemaId = String(parent.currentSchemaId || '');
  const declared = [
    ...(schemaId ? [{ field: 'schemaId', value: schemaId }] : []),
    ...(currentSchemaId ? [{ field: 'currentSchemaId', value: currentSchemaId }] : [])
  ];
  if (!declared.length) return Object.freeze({ state: 'invalid', reason: 'continuation-parent-schema-required', schemaId: '', evidence: Object.freeze({}) });
  const distinct = [...new Set(declared.map((item) => item.value))];
  if (distinct.length !== 1) return Object.freeze({
    state: 'invalid',
    reason: 'continuation-parent-schema-contradictory',
    schemaId: '',
    evidence: Object.freeze({
      schemaId,
      currentSchemaId,
      declared: Object.freeze(declared.map((item) => Object.freeze({ ...item })))
    })
  });
  return Object.freeze({ state: 'qualified', reason: '', schemaId: distinct[0], evidence: Object.freeze({ declared: Object.freeze(declared.map((item) => Object.freeze({ ...item }))) }) });
}

export function qualifyPortableRenderedParentRepresentation(markdown = '', parent = {}, transitionType = 'create-artifact') {
  const rootCreation = String(transitionType || 'create-artifact') === 'create-artifact';
  let parsed;
  try { parsed = parseArtifactMarkdown(markdown); }
  catch (_) { return Object.freeze({ state: 'invalid', reason: 'exact-result-parent-parse-failed' }); }
  const observed = parsed.envelope?.parent || {};
  const hasObserved = Boolean(observed.schema?.id || observed.trace || observed.origin || observed.createdAt || observed.boundary);
  if (rootCreation) return Object.freeze({ state: hasObserved ? 'invalid' : 'qualified', reason: hasObserved ? 'exact-result-parent-unexpected' : '' });
  const expectedTrace = `record:${parent.id}`;
  const expectedCreatedAt = String(parent.createdAt || '');
  const createdAtRepresentation = inspectRenderedParentCreatedAt(markdown);
  const createdAtExact = expectedCreatedAt
    ? createdAtRepresentation.lines.length === 1
      && createdAtRepresentation.lines[0] === `  - Created At: ${expectedCreatedAt}`
      && String(observed.createdAt || '') === expectedCreatedAt
    : createdAtRepresentation.lines.length === 0 && !String(observed.createdAt || '');
  const identityExact = String(observed.schema?.id || '') === String(parent.schemaId || '')
    && String(observed.trace || '') === expectedTrace
    && String(observed.origin || '') === String(parent.path || '');
  const exact = identityExact && createdAtExact;
  return Object.freeze({
    state: exact ? 'qualified' : 'invalid',
    reason: exact ? '' : !identityExact ? 'exact-result-parent-identity-mismatch' : 'exact-result-parent-created-at-mismatch',
    expected: Object.freeze({ schemaId: String(parent.schemaId || ''), trace: expectedTrace, origin: String(parent.path || ''), createdAt: expectedCreatedAt }),
    observed: Object.freeze({ schemaId: String(observed.schema?.id || ''), trace: String(observed.trace || ''), origin: String(observed.origin || ''), createdAt: String(observed.createdAt || ''), createdAtLines: createdAtRepresentation.lines })
  });
}

function inspectRenderedParentCreatedAt(markdown = '') {
  const lines = String(markdown).split('\n');
  const start = lines.findIndex((line) => line === '- Parent');
  if (start < 0) return Object.freeze({ lines: Object.freeze([]) });
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^-\s+\S/.test(lines[i])) { end = i; break; }
  }
  const createdAtLines = lines.slice(start + 1, end).filter((line) => /^\s+-\s+Created At:/.test(line));
  return Object.freeze({ lines: Object.freeze(createdAtLines) });
}

function parentHasAnyValue(parent = {}) {
  return Boolean(parent.id || parent.path || parent.kind || parent.schemaId || parent.currentSchemaId || parent.continuationTrace || parent.currentCreatedAt || parent.createdAt || parent.boundary || parent.sourceMode || parent.source);
}
function qualified(snapshot) { return Object.freeze({ state: 'qualified', reason: '', snapshot }); }
function invalid(reason, evidence = {}) { return Object.freeze({ state: 'invalid', reason, snapshot: null, evidence: Object.freeze({ ...evidence }) }); }
