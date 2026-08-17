import { portableFinding } from '../findings.js';
import { qualifyResolvedMachineShape } from './contract.machine-shape.js';

export const PORTABLE_FIELD_DOMAIN_VALIDATION_SCHEMA_ID = 'tiinex.portable.field-domain-validation.v1';

export function validatePortableFieldDomains(input = {}) {
  const constraints = (input.constraints || []).filter((item) => item?.kind === 'field-domain');
  const parsedDeclarations = input.parsedDeclarations || [];
  const ordinary = input.ordinary || { groups: [] };
  const findings = [];
  const groups = [];

  for (const constraint of constraints) {
    const qualification = String(constraint.authorityQualification || constraint.declarationQualification || 'unresolved');
    if (qualification === 'valid') continue;
    const state = qualification === 'structurally-invalid' ? 'structurally-invalid' : 'unresolved';
    findings.push(fieldDomainFinding(
      state === 'structurally-invalid' ? 'error' : 'warning',
      state === 'structurally-invalid'
        ? 'portable.contract.field-domain.authority.invalid'
        : 'portable.contract.field-domain.authority.unresolved',
      `Field-domain authority is ${state} for ${constraint.sourceGroup || '(unknown group)'} / ${constraint.field || '(unknown field)'}.`,
      state,
      { constraint, reasons: constraint.authorityFindings || constraint.declarationFindings || [] }
    ));
  }

  const valid = constraints.filter((item) => String(item.authorityQualification || item.declarationQualification || '') === 'valid' && item.targetGroup && item.field);
  const byTarget = groupConstraints(valid);
  for (const bucket of byTarget.values()) {
    const conflict = detectDeterministicConflict(bucket.contributions);
    if (conflict) {
      findings.push(fieldDomainFinding(
        'error',
        'portable.contract.field-domain.authority.unsatisfiable',
        `Field-domain authority is unsatisfiable for ${bucket.group}.${bucket.field}.`,
        'contradictory',
        { group: bucket.group, field: bucket.field, contributions: bucket.contributions, conflict }
      ));
    }

    const occurrences = collectFieldOccurrences(bucket.group, bucket.field, parsedDeclarations, ordinary);
    const projected = [];
    for (const occurrence of occurrences) {
      const results = bucket.contributions.map((contribution) => evaluateContribution(occurrence.value, contribution));
      const qualification = summarizeContributionResults(results);
      projected.push(Object.freeze({
        owner: occurrence.owner,
        value: occurrence.value,
        qualification,
        contributions: Object.freeze(results)
      }));

      if (qualification === 'invalid') {
        findings.push(fieldDomainFinding(
          'error',
          'portable.contract.field-domain.value.invalid',
          `Value is outside the allowed field domain for ${bucket.group}.${bucket.field}: ${occurrence.value}.`,
          'structurally-invalid',
          { group: bucket.group, field: bucket.field, value: occurrence.value, owner: occurrence.owner, contributions: results }
        ));
      } else if (qualification === 'extension-candidate') {
        findings.push(fieldDomainFinding(
          'warning',
          'portable.contract.field-domain.extension.unresolved',
          `Value is an unresolved extension candidate for ${bucket.group}.${bucket.field}: ${occurrence.value}.`,
          'unresolved',
          { group: bucket.group, field: bucket.field, value: occurrence.value, owner: occurrence.owner, contributions: results }
        ));
      } else if (qualification === 'authority-unresolved') {
        findings.push(fieldDomainFinding(
          'warning',
          'portable.contract.field-domain.shape.unresolved',
          `Field-domain shape authority cannot be fully evaluated for ${bucket.group}.${bucket.field}: ${occurrence.value}.`,
          'unresolved',
          { group: bucket.group, field: bucket.field, value: occurrence.value, owner: occurrence.owner, contributions: results }
        ));
      }
    }

    groups.push(Object.freeze({
      group: bucket.group,
      field: bucket.field,
      contributions: Object.freeze(bucket.contributions),
      authorityQualification: conflict ? 'contradictory' : 'valid',
      occurrences: Object.freeze(projected)
    }));
  }

  return Object.freeze({
    schema: PORTABLE_FIELD_DOMAIN_VALIDATION_SCHEMA_ID,
    constraints: Object.freeze([...constraints]),
    groups: Object.freeze(groups),
    findings: Object.freeze(findings)
  });
}

function groupConstraints(constraints = []) {
  const out = new Map();
  for (const constraint of constraints) {
    const key = `${exact(constraint.targetGroup)}\u0000${exact(constraint.field)}`;
    if (!out.has(key)) out.set(key, { group: constraint.targetGroup, field: constraint.field, contributions: [] });
    out.get(key).contributions.push(constraint);
  }
  return out;
}

function collectFieldOccurrences(groupName, fieldName, parsedDeclarations = [], ordinary = {}) {
  const out = [];
  const declarationGroup = (parsedDeclarations || []).find((item) => exact(item.contract?.group) === exact(groupName));
  if (declarationGroup) {
    for (const section of declarationGroup.sections || []) {
      if (!section.present) continue;
      for (const entry of section.entries || []) {
        if (entry.name === 'none') continue;
        if (!Object.prototype.hasOwnProperty.call(entry.fields || {}, fieldName)) continue;
        const value = String(entry.fields[fieldName] ?? '');
        if (!value) continue;
        out.push(Object.freeze({
          value,
          owner: Object.freeze({ kind: 'declaration', group: groupName, heading: section.heading, entry: entry.name, field: fieldName })
        }));
      }
    }
    return out;
  }

  const ordinaryGroup = (ordinary.groups || []).find((item) => exact(item.group) === exact(groupName));
  if (ordinaryGroup) {
    const field = (ordinaryGroup.fields || []).find((item) => exact(item.label) === exact(fieldName));
    for (const occurrence of field?.occurrences || []) {
      out.push(Object.freeze({
        value: String(occurrence.value ?? ''),
        owner: Object.freeze({ kind: 'ordinary', group: groupName, heading: ordinaryGroup.target?.heading || '', field: fieldName, line: Number(occurrence.line || 0) })
      }));
    }
  }
  return out;
}

function evaluateContribution(value, contribution) {
  const text = String(value ?? '');
  const allowedValues = contribution.allowedValues || [];
  const shapeAuthorities = contribution.allowedShapeAuthorities || [];
  const literalMatch = allowedValues.some((candidate) => String(candidate) === text);
  if (literalMatch) return contributionResult(contribution, 'core', 'allowed-value', 'matched');

  // `unknown` is an uncertainty sentinel, never an extension escape hatch and never
  // rescued by shape authority when it is not explicitly allowed by every contribution.
  if (text === 'unknown') return contributionResult(contribution, 'invalid', 'unknown-not-allowed', 'not-matched');

  let supportedShapeSeen = false;
  let unresolvedShapeSeen = false;
  const shapeResults = [];
  for (const authority of shapeAuthorities) {
    const result = qualifyResolvedMachineShape(text, authority);
    shapeResults.push(Object.freeze({
      shapeLabel: authority.shapeLabel || '',
      qualification: result.qualification,
      authorityQualification: authority.qualification || 'unresolved',
      resolvedDefinitionProvenance: authority.resolvedDefinitionProvenance || null,
      findings: authority.findings || Object.freeze([])
    }));
    if (result.qualification === 'matched') return contributionResult(contribution, 'core', 'allowed-shape', 'matched', authority.shapeLabel, shapeResults);
    if (result.qualification === 'not-matched') supportedShapeSeen = true;
    else unresolvedShapeSeen = true;
  }

  // A declared Allowed Shape with no compiled authority must never be treated as a
  // closed no-match. This also protects callers carrying older/pre-resolution data.
  if ((contribution.allowedShapes || []).length > shapeAuthorities.length) unresolvedShapeSeen = true;
  if (unresolvedShapeSeen) return contributionResult(contribution, 'authority-unresolved', 'allowed-shape', 'unresolved', '', shapeResults);
  if (contribution.domainPolicy === 'extension-authorized') return contributionResult(contribution, 'extension-candidate', 'extension-policy', 'unresolved', '', shapeResults);
  return contributionResult(contribution, 'invalid', supportedShapeSeen ? 'allowed-shape' : 'allowed-value', 'not-matched', '', shapeResults);
}

function contributionResult(contribution, qualification, authority, match, shape = '', shapeResults = []) {
  return Object.freeze({
    qualification,
    authority,
    match,
    matchedShape: shape,
    shapeResults: Object.freeze([...shapeResults]),
    sourceSchemaId: contribution.sourceSchemaId || '',
    sourceGroup: contribution.sourceGroup || '',
    targetGroup: contribution.targetGroup || '',
    targetMode: contribution.targetMode || '',
    targetOwnership: contribution.targetOwnership || '',
    ownershipSourceSchemaIds: contribution.ownershipSourceSchemaIds || Object.freeze([]),
    appliesToTarget: contribution.appliesToTarget || '',
    field: contribution.field || '',
    allowedValues: contribution.allowedValues || Object.freeze([]),
    allowedShapes: contribution.allowedShapes || Object.freeze([]),
    allowedShapeAuthorities: contribution.allowedShapeAuthorities || Object.freeze([]),
    domainPolicy: contribution.domainPolicy || '',
    declarationLine: Number(contribution.declarationLine || 0)
  });
}

function summarizeContributionResults(results = []) {
  if (results.some((item) => item.qualification === 'invalid')) return 'invalid';
  if (results.some((item) => item.qualification === 'authority-unresolved')) return 'authority-unresolved';
  if (results.some((item) => item.qualification === 'extension-candidate')) return 'extension-candidate';
  return 'core';
}

function detectDeterministicConflict(contributions = []) {
  const closed = contributions.filter((item) => item.domainPolicy === 'closed');
  if (closed.length < 2) return null;

  const literalCandidates = [...new Set(closed.flatMap((item) => item.allowedValues || []))];
  for (const candidate of literalCandidates) {
    const matches = closed.map((item) => coreMatch(candidate, item));
    if (matches.every((item) => item === 'matched')) return null;
    if (matches.some((item) => item === 'unresolved')) return null;
  }

  // Proving two arbitrary lexical languages disjoint is outside this bounded surface.
  // If any contribution offers a machine shape, retain the obligations and validate
  // concrete values instead of inventing an intersection theorem.
  if (closed.some((item) => (item.allowedShapes || []).length)) return null;
  return Object.freeze({
    kind: 'empty-domain-intersection',
    sourceGroups: Object.freeze(closed.map((item) => item.sourceGroup || ''))
  });
}

function coreMatch(value, contribution) {
  if ((contribution.allowedValues || []).some((candidate) => String(candidate) === String(value))) return 'matched';
  let unresolved = false;
  const authorities = contribution.allowedShapeAuthorities || [];
  if ((contribution.allowedShapes || []).length > authorities.length) unresolved = true;
  for (const authority of authorities) {
    const result = qualifyResolvedMachineShape(value, authority);
    if (result.qualification === 'matched') return 'matched';
    if (result.qualification === 'unresolved') unresolved = true;
  }
  return unresolved ? 'unresolved' : 'not-matched';
}

function fieldDomainFinding(severity, code, message, state, extra = {}) {
  return portableFinding(severity, code, message, { ...extra, state });
}

function exact(value = '') {
  return String(value || '').trim();
}
