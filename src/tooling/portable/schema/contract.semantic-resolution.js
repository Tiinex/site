export const PORTABLE_CONTRACT_SEMANTIC_RESOLUTION_SCHEMA_ID = 'tiinex.portable.contract-semantic-resolution.v1';

const KNOWN_PARTICIPANT_CLASSIFICATIONS = new Set(['artifact', 'non-artifact']);

export function resolveSchemaAuthority(schemaId, resolvers = {}) {
  const id = String(schemaId || '').trim();
  if (!id) return null;
  if (typeof resolvers.resolveSchemaAuthority === 'function') return resolvers.resolveSchemaAuthority(id) || null;
  return resolvers.schemaAuthorities?.[id] || null;
}

export function resolveClassificationAgreement(input = {}) {
  const entry = input.entry || {};
  const constraint = input.constraint || {};
  const resolvers = input.resolvers || {};
  const explicitField = String(constraint.explicitField || '').trim();
  const schemaField = String(constraint.schemaField || '').trim();
  const declared = fieldValue(entry, explicitField);
  const schemaId = fieldValue(entry, schemaField);
  const authority = resolveSchemaAuthority(schemaId, resolvers);
  const authorityObserved = String(authority?.targetKind || '').trim();
  const authorityResolved = KNOWN_PARTICIPANT_CLASSIFICATIONS.has(authorityObserved) ? authorityObserved : '';
  const schemaConstraintQualification = !schemaId
    ? 'absent'
    : authorityResolved
      ? 'resolved'
      : 'unresolved';

  const evidence = [];
  if (declared) evidence.push(Object.freeze({ source: 'explicit-declaration', field: explicitField, value: declared }));
  if (schemaId) evidence.push(Object.freeze({ source: 'schema-constraint', field: schemaField, schemaId, targetKind: authorityObserved, qualification: schemaConstraintQualification }));

  let qualification = 'unresolved';
  let resolved = '';
  let authoritySource = '';

  if (declared === 'unknown') {
    qualification = 'preserved-unknown';
    resolved = 'unknown';
    authoritySource = 'explicit-declaration';
  } else if (KNOWN_PARTICIPANT_CLASSIFICATIONS.has(declared) && authorityResolved) {
    if (declared === authorityResolved) {
      qualification = 'agreement';
      resolved = declared;
      authoritySource = 'explicit+schema-constraint';
    } else {
      qualification = 'contradictory';
      resolved = '';
      authoritySource = 'conflicting-authorities';
    }
  } else if (KNOWN_PARTICIPANT_CLASSIFICATIONS.has(declared)) {
    qualification = 'explicit';
    resolved = declared;
    authoritySource = 'explicit-declaration';
  } else if (!declared && authorityResolved) {
    qualification = 'resolved-by-authority';
    resolved = authorityResolved;
    authoritySource = 'schema-constraint';
  }

  return Object.freeze({
    schema: PORTABLE_CONTRACT_SEMANTIC_RESOLUTION_SCHEMA_ID,
    kind: 'classification-agreement',
    field: explicitField,
    schemaField,
    declared,
    resolved,
    qualification,
    authority: authoritySource,
    schemaConstraint: Object.freeze({
      schemaId,
      qualification: schemaConstraintQualification,
      observedTargetKind: authorityObserved
    }),
    evidence: Object.freeze(evidence)
  });
}

function fieldValue(entry = {}, field = '') {
  if (!field || !Object.prototype.hasOwnProperty.call(entry.fields || {}, field)) return '';
  return String(entry.fields[field] ?? '').trim();
}
