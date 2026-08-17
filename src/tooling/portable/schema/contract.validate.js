import { portableFinding } from '../findings.js';
import { parseDeclarationsAgainstContract } from './named.declarations.js';
import { compilePortableSchemaContract } from './contract.compile.js';
import { resolveClassificationAgreement, resolveSchemaAuthority } from './contract.semantic-resolution.js';
import { resolveOrdinaryFieldInstances } from './ordinary.fields.js';
import { validatePortableFieldDomains } from './contract.field-domain.js';

export const PORTABLE_CONTRACT_VALIDATION_SCHEMA_ID = 'tiinex.portable.compiled-contract-validation.v1';

export function validatePortableContractInstance(input = {}, options = {}) {
  const markdown = String(input.markdown || '');
  const compiled = input.compiledContract || compilePortableSchemaContract(input.schemaMarkdown || input.schemaDocument || '');
  const resolvers = input.resolvers || options.resolvers || {};
  const findings = [];
  const headingIndex = parseHeadingIndex(markdown);
  const headings = headingIndex.titles;
  const declarationTargetHeadings = uniqueExact((compiled.declarations || []).flatMap((contract) => contract.targetHeadings || []));
  const ordinaryTargetHeadings = uniqueExact((compiled.validation?.ordinaryGroups || [])
    .filter((group) => group.target?.qualification === 'valid' && group.target?.heading)
    .map((group) => group.target.heading));
  const fields = parseFieldSet(markdown, { excludedHeadings: uniqueExact([...declarationTargetHeadings, ...ordinaryTargetHeadings]) });
  const parsedDeclarations = parseDeclarationsAgainstContract(markdown, compiled.declarations);
  const ordinary = resolveOrdinaryFieldInstances(markdown, compiled, { parsedDeclarations });
  const legacyRequiredFields = requiredFieldsOutsideStructuredOwners(compiled);
  for (const section of compiled.validation.requiredSections || []) {
    if (!headings.has(section)) findings.push(finding('error', 'portable.contract.section.required.missing', `Required section is missing: ${section}.`, 'incomplete', { section }));
  }
  for (const requirement of compiled.validation.requiredHeadings || []) {
    const key = headingKey(requirement.level, requirement.title);
    if (!headingIndex.exact.has(key)) findings.push(finding('error', 'portable.contract.heading.required.missing', `Required heading is missing at level ${requirement.level}: ${'#'.repeat(requirement.level)} ${requirement.title}.`, 'incomplete', { section: requirement.title, level: requirement.level }));
  }
  for (const field of legacyRequiredFields) {
    if (!fields.has(field)) findings.push(finding('error', 'portable.contract.field.required.missing', `Required field is missing outside declaration-owned target regions: ${field}.`, 'incomplete', { field }));
  }

  validateOrdinaryFieldInstances(ordinary, findings);

  validateRequiredEntries(compiled.validation.requiredEntries || [], parsedDeclarations, findings);
  const declarationIndex = buildDeclarationIndex(parsedDeclarations, compiled.constraints || []);
  for (const parsedGroup of parsedDeclarations) {
    const contract = parsedGroup.contract;
    for (const section of parsedGroup.sections) {
      if (!section.present) continue;
      findings.push(...section.findings.map((item) => finding('error', item.code, `Duplicate field ${item.field} in declaration ${item.entry}.`, 'structurally-invalid', item)));
      const names = new Set();
      const noneEntries = section.entries.filter((entry) => entry.name === 'none');
      if (noneEntries.length) {
        if (!contract.allowLiteralNone || section.entries.length !== 1) findings.push(finding('error', 'portable.contract.declaration.none.invalid', `Literal none is not valid in ${section.heading} with other declarations.`, 'structurally-invalid', { group: contract.group, heading: section.heading }));
        continue;
      }
      for (const entry of section.entries) {
        if (names.has(entry.name)) findings.push(finding('error', 'portable.contract.declaration.name.duplicate', `Duplicate declaration name: ${entry.name}.`, 'structurally-invalid', { group: contract.group, entry: entry.name }));
        names.add(entry.name);
        for (const field of contract.requiredFields) {
          if (!Object.prototype.hasOwnProperty.call(entry.fields, field) || entry.fields[field] === '') findings.push(finding('error', 'portable.contract.declaration.field.required.missing', `Required declaration field is missing: ${field}.`, 'incomplete', { group: contract.group, entry: entry.name, field }));
        }
      }
    }
  }

  const fieldDomains = validatePortableFieldDomains({
    constraints: compiled.constraints || [],
    parsedDeclarations,
    ordinary
  });
  findings.push(...fieldDomains.findings);

  for (const constraint of compiled.constraints || []) {
    if (constraint.kind === 'declaration-reference') validateReferenceConstraint(constraint, declarationIndex, findings);
    else if (constraint.kind === 'cardinality-order') validateCardinalityConstraint(constraint, declarationIndex, findings);
    else if (constraint.kind === 'target-schema-authority') validateTargetSchemaAuthority(constraint, declarationIndex, resolvers, findings);
    else if (constraint.kind === 'target-schema-authority-via-reference') validateTargetSchemaAuthorityViaReference(constraint, declarationIndex, resolvers, findings);
    else if (constraint.kind === 'classification-agreement') validateClassificationAgreement(constraint, declarationIndex, resolvers, findings);
    else if (constraint.kind === 'member-mapping-when-ambiguous') validateMemberMapping(constraint, declarationIndex, compiled.constraints || [], findings);
  }

  preserveUnknowns(declarationIndex, findings);
  const states = summarizeStates(findings);
  return Object.freeze({
    schema: PORTABLE_CONTRACT_VALIDATION_SCHEMA_ID,
    schemaId: compiled.schemaId,
    status: states.primary,
    states,
    declarations: Object.freeze(parsedDeclarations),
    ordinaryGroups: ordinary.groups,
    fieldDomains,
    findings: Object.freeze(findings)
  });
}


function requiredFieldsOutsideStructuredOwners(compiled = {}) {
  const ordinaryGroups = new Set((compiled.validation?.ordinaryGroups || []).map((group) => exactToken(group.group)));
  const declarationGroups = new Set((compiled.declarations || []).map((declaration) => exactToken(declaration.group)));
  const fields = [];
  for (const group of compiled.validation?.groups || []) {
    const name = exactToken(group.name);
    if (ordinaryGroups.has(name) || declarationGroups.has(name)) continue;
    if ((group.requiredWhen || []).length) continue;
    for (const category of group.categories || []) {
      if (exactToken(category.name) !== 'Required Fields') continue;
      fields.push(...(category.items || []).map(cleanContractField).filter(Boolean));
    }
  }
  return uniqueExact(fields);
}

function cleanContractField(value = '') {
  return String(value || '').trim().replace(/^`|`$/g, '').trim();
}

function validateOrdinaryFieldInstances(ordinary = {}, findings = []) {
  for (const group of ordinary.groups || []) {
    if (group.qualification === 'structurally-invalid') {
      findings.push(finding('error', 'portable.contract.ordinary.target.invalid', `Ordinary field target authority is structurally invalid for ${group.group}.`, 'structurally-invalid', { group: group.group }));
      continue;
    }
    if (group.qualification === 'conflicting') {
      findings.push(finding('error', 'portable.contract.ordinary.target.conflicting', `Ordinary field target authority conflicts for ${group.group}.`, 'contradictory', { group: group.group }));
      continue;
    }
    if (group.target?.qualification === 'ambiguous') {
      findings.push(finding('error', 'portable.contract.ordinary.target.ambiguous', `Ordinary field target occurs more than once: ${group.target.heading}.`, 'structurally-invalid', { group: group.group, heading: group.target.heading, occurrenceCount: group.target.occurrenceCount }));
      continue;
    }
    if (!group.target?.present && group.target?.requiredness === 'unresolved') {
      findings.push(finding('warning', 'portable.contract.ordinary.target.requiredness.unresolved', `Ordinary field target requiredness is unresolved for ${group.group}: ${group.target.heading}.`, 'unresolved', { group: group.group, heading: group.target.heading }));
    }
    for (const field of group.fields || []) {
      if (field.qualification === 'duplicate') {
        findings.push(finding('error', 'portable.contract.ordinary.field.duplicate', `Duplicate ordinary scalar field ${field.label} in ${group.target.heading}.`, 'structurally-invalid', { group: group.group, field: field.label, heading: group.target.heading, occurrenceCount: field.occurrences.length }));
      } else if (field.qualification === 'missing-required') {
        findings.push(finding('error', 'portable.contract.ordinary.field.required.missing', `Required ordinary field is missing from ${group.target.heading}: ${field.label}.`, 'incomplete', { group: group.group, field: field.label, heading: group.target.heading }));
      }
    }
  }
}

function validateRequiredEntries(requirements = [], parsedDeclarations = [], findings = []) {
  const byGroup = new Map(parsedDeclarations.map((parsed) => [exactToken(parsed.contract.group), parsed]));
  for (const requirement of requirements) {
    for (const entryContractName of requirement.entries || []) {
      const parsed = byGroup.get(exactToken(entryContractName));
      if (!parsed) {
        findings.push(finding('warning', 'portable.contract.entry.contract.unresolved', `Required entry contract cannot be resolved: ${entryContractName}.`, 'unresolved', { group: requirement.group, entryContract: entryContractName }));
        continue;
      }
      const requiredTargets = new Set((requirement.targetHeadings || []).map(exactHeadingTitle));
      const sections = requiredTargets.size
        ? parsed.sections.filter((section) => requiredTargets.has(exactHeadingTitle(section.heading)))
        : parsed.sections;
      const present = sections.filter((section) => section.present);
      if (!present.length) continue;
      if (present.every((section) => section.entries.length === 0)) {
        findings.push(finding('error', 'portable.contract.entry.required.missing', `Required entry is missing: ${entryContractName}.`, 'incomplete', { group: requirement.group, entryContract: entryContractName, targetHeadings: requirement.targetHeadings || [] }));
      }
    }
  }
}

function validateReferenceConstraint(constraint, index, findings) {
  const entries = index.byGroup.get(exactToken(constraint.group)) || [];
  const allowed = new Set(constraint.targets.flatMap((group) => (index.byGroup.get(exactToken(group)) || []).map((entry) => entry.name)));
  for (const entry of entries) {
    if (entry.name === 'none') continue;
    const value = entry.fields[constraint.field];
    if (!value && constraint.optional) continue;
    if (!value) continue;
    if (!allowed.has(value)) findings.push(finding('error', 'portable.contract.reference.unresolved', `${constraint.field} does not resolve to an allowed declaration: ${value}.`, 'structurally-invalid', { group: constraint.group, entry: entry.name, field: constraint.field, value, targets: constraint.targets }));
  }
}

function validateCardinalityConstraint(constraint, index, findings) {
  for (const entry of index.byGroup.get(exactToken(constraint.group)) || []) {
    if (entry.name === 'none') continue;
    const min = cardinality(entry.fields[constraint.minimumField], false);
    const max = cardinality(entry.fields[constraint.maximumField], true);
    if (min.kind === 'invalid' || max.kind === 'invalid') {
      findings.push(finding('error', 'portable.contract.cardinality.invalid', `Cardinality is malformed for ${entry.name}.`, 'structurally-invalid', { group: constraint.group, entry: entry.name, minimum: entry.fields[constraint.minimumField], maximum: entry.fields[constraint.maximumField] }));
      continue;
    }
    if (min.kind === 'number' && max.kind === 'number' && max.value < min.value) findings.push(finding('error', 'portable.contract.cardinality.contradiction', `Maximum Count is lower than Minimum Count for ${entry.name}.`, 'contradictory', { group: constraint.group, entry: entry.name }));
  }
}

function validateTargetSchemaAuthority(constraint, index, resolvers, findings) {
  for (const entry of index.byGroup.get(exactToken(constraint.group)) || []) {
    if (entry.fields[constraint.field] !== constraint.value) continue;
    const schemaId = entry.fields[constraint.schemaField];
    const authority = resolveSchemaAuthority(schemaId, resolvers);
    if (!schemaId || !authority || authority[constraint.capability] !== true) findings.push(finding('warning', 'portable.contract.authority.target-schema.unresolved', `${constraint.field}: ${constraint.value} is unresolved because ${constraint.schemaField} or its ${constraint.capability} authority cannot be resolved.`, 'unresolved', { group: constraint.group, entry: entry.name, schemaId: schemaId || '' }));
  }
}

function validateTargetSchemaAuthorityViaReference(constraint, index, resolvers, findings) {
  const refConstraints = index.referenceConstraints.filter((item) => item.group === constraint.group && item.field === constraint.referenceField);
  const targetGroups = refConstraints.flatMap((item) => item.targets);
  for (const entry of index.byGroup.get(exactToken(constraint.group)) || []) {
    if (entry.fields[constraint.field] !== constraint.value) continue;
    const refName = entry.fields[constraint.referenceField];
    const referenced = targetGroups.flatMap((group) => index.byGroup.get(exactToken(group)) || []).find((candidate) => candidate.name === refName);
    const schemaId = referenced?.fields?.[constraint.referencedSchemaField] || '';
    const authority = resolveSchemaAuthority(schemaId, resolvers);
    if (!schemaId || !authority || authority[constraint.capability] !== true) findings.push(finding('warning', 'portable.contract.naming.target-schema.unresolved', `${constraint.field}: ${constraint.value} cannot resolve target schema naming authority.`, 'unresolved', { group: constraint.group, entry: entry.name, outputBinding: refName || '', schemaId }));
  }
}

function validateClassificationAgreement(constraint, index, resolvers, findings) {
  for (const group of constraint.groups) {
    for (const entry of index.byGroup.get(exactToken(group)) || []) {
      if (entry.name === 'none') continue;
      const resolution = resolveClassificationAgreement({ entry, constraint, resolvers });
      if (resolution.qualification === 'contradictory') {
        findings.push(finding('error', 'portable.contract.classification.contradiction', `Explicit ${constraint.explicitField} (${resolution.declared}) disagrees with resolved schema authority (${resolution.schemaConstraint.observedTargetKind}).`, 'contradictory', {
          group,
          entry: entry.name,
          explicit: resolution.declared,
          resolved: resolution.schemaConstraint.observedTargetKind,
          schemaId: resolution.schemaConstraint.schemaId,
          semanticQualification: resolution.qualification
        }));
        continue;
      }
      if (resolution.schemaConstraint.qualification === 'unresolved' && resolution.declared !== 'unknown') {
        findings.push(finding('info', 'portable.contract.classification.schema.unresolved', `Schema Constraint is unresolved${resolution.declared ? ` while explicit ${constraint.explicitField} remains ${resolution.declared}` : ' and no explicit participant classification resolves the declaration'}.`, 'unresolved', {
          group,
          entry: entry.name,
          explicit: resolution.declared,
          schemaId: resolution.schemaConstraint.schemaId,
          semanticQualification: resolution.qualification
        }));
      }
    }
  }
}

function validateMemberMapping(constraint, index, allConstraints, findings) {
  const refs = allConstraints.filter((item) => item.kind === 'declaration-reference' && item.group === constraint.group);
  for (const entry of index.byGroup.get(exactToken(constraint.group)) || []) {
    if (entry.name === 'none' || entry.fields[constraint.field]) continue;
    const boundRoles = [];
    for (const ref of refs) {
      const value = entry.fields[ref.field];
      if (!value) continue;
      for (const group of ref.targets) {
        const target = (index.byGroup.get(exactToken(group)) || []).find((candidate) => candidate.name === value);
        if (target) boundRoles.push(target);
      }
    }
    if (boundRoles.some((role) => cardinalityCouldBeMultiple(role))) findings.push(finding('warning', 'portable.contract.member-mapping.unresolved', `Member Mapping is absent while referenced role multiplicity can make ${entry.name} ambiguous.`, 'unresolved', { group: constraint.group, entry: entry.name }));
  }
}

function preserveUnknowns(index, findings) {
  for (const [group, entries] of index.byGroup.entries()) {
    for (const entry of entries) {
      for (const [field, value] of Object.entries(entry.fields || {})) {
        if (String(value).trim() === 'unknown') findings.push(finding('info', 'portable.contract.unknown.preserved', `${field}: unknown preserved without normalization.`, 'preserve', { group, entry: entry.name, field }));
      }
    }
  }
}

function buildDeclarationIndex(parsedGroups, constraints = []) {
  const byGroup = new Map();
  for (const group of parsedGroups) byGroup.set(exactToken(group.contract.group), group.sections.flatMap((section) => section.entries));
  return { byGroup, referenceConstraints: constraints.filter((item) => item.kind === 'declaration-reference') };
}

function parseHeadingIndex(markdown = '') {
  const titles = new Set();
  const exact = new Set();
  let fenced = false;
  for (const line of String(markdown || '').split(/\r?\n/)) {
    if (/^\s*```/.test(line)) { fenced = !fenced; continue; }
    if (fenced) continue;
    const match = line.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (!match) continue;
    const level = match[1].length;
    const title = match[2].trim();
    titles.add(title);
    exact.add(headingKey(level, title));
  }
  return { titles, exact };
}

function headingKey(level, title) {
  return `${Number(level || 0)}\u0000${String(title || '').trim()}`;
}


function parseFieldSet(markdown = '', options = {}) {
  const out = new Set();
  const lines = String(markdown || '').split(/\r?\n/);
  const excluded = excludedHeadingRanges(lines, options.excludedHeadings || []);
  let fenced = false;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^\s*```/.test(line)) { fenced = !fenced; continue; }
    if (fenced || lineExcluded(index, excluded)) continue;
    const scalar = line.match(/^\s*-\s+([^:]+):/);
    if (scalar) {
      out.add(scalar[1].trim());
      continue;
    }
    const block = line.match(/^(\s*)-\s+([^:]+?)\s*$/);
    if (!block) continue;
    const indent = block[1].length;
    const next = nextMeaningfulLine(lines, index + 1, excluded);
    if (!next) continue;
    const nested = next.match(/^(\s*)-\s+/);
    if (nested && nested[1].length > indent) out.add(block[2].trim());
  }
  return out;
}

function excludedHeadingRanges(lines = [], targets = []) {
  const wanted = targets.map(parseHeadingTarget).filter(Boolean);
  if (!wanted.length) return [];
  const headings = [];
  let fenced = false;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^\s*```/.test(line)) { fenced = !fenced; continue; }
    if (fenced) continue;
    const match = line.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (match) headings.push({ index, level: match[1].length, title: match[2].trim() });
  }
  const ranges = [];
  for (let position = 0; position < headings.length; position += 1) {
    const heading = headings[position];
    if (!wanted.some((target) => target.title === heading.title && (target.level === null || target.level === heading.level))) continue;
    let end = lines.length;
    for (let cursor = position + 1; cursor < headings.length; cursor += 1) {
      if (headings[cursor].level <= heading.level) { end = headings[cursor].index; break; }
    }
    ranges.push({ start: heading.index + 1, end });
  }
  return ranges;
}

function parseHeadingTarget(value = '') {
  const text = String(value || '').trim();
  if (!text) return null;
  const explicit = text.match(/^(#{1,6})\s+(.+)$/);
  return explicit ? { level: explicit[1].length, title: explicit[2].trim() } : { level: null, title: text };
}

function lineExcluded(index, ranges = []) {
  return ranges.some((range) => index >= range.start && index < range.end);
}

function nextMeaningfulLine(lines = [], start = 0, excluded = []) {
  for (let index = start; index < lines.length; index += 1) {
    if (lineExcluded(index, excluded)) continue;
    if (lines[index].trim()) return lines[index];
  }
  return '';
}

function uniqueExact(values = []) {
  return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))];
}

function exactToken(value = '') {
  return String(value || '').trim();
}

function exactHeadingTitle(value = '') {
  return String(value || '').trim().replace(/^#{1,6}\s+/, '');
}

function normalizeHeadingKey(value = '') {
  return String(value || '').trim().replace(/^#{1,6}\s+/, '').toLowerCase().replace(/[`*_]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

function normalizeKey(value = '') {
  return String(value || '').toLowerCase().replace(/[`*_#]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

function cardinality(value, allowUnbounded) {
  const text = String(value ?? '').trim();
  if (text === 'unknown') return { kind: 'unknown' };
  if (allowUnbounded && text === 'unbounded') return { kind: 'unbounded' };
  if (/^(0|[1-9]\d*)$/.test(text)) return { kind: 'number', value: Number(text) };
  return { kind: 'invalid' };
}

function cardinalityCouldBeMultiple(entry) {
  const max = cardinality(entry.fields?.['Maximum Count'], true);
  if (max.kind === 'unknown' || max.kind === 'unbounded') return true;
  return max.kind === 'number' && max.value > 1;
}

function finding(severity, code, message, state, extra = {}) {
  return portableFinding(severity, code, message, { ...extra, state });
}

function summarizeStates(findings) {
  const counts = { valid: 0, incomplete: 0, unresolved: 0, preserve: 0, contradictory: 0, 'structurally-invalid': 0 };
  for (const item of findings) if (counts[item.state] !== undefined) counts[item.state] += 1;
  let primary = 'valid';
  if (counts.contradictory) primary = 'contradictory';
  else if (counts['structurally-invalid']) primary = 'structurally-invalid';
  else if (counts.incomplete) primary = 'incomplete';
  else if (counts.unresolved) primary = 'unresolved';
  else if (counts.preserve) primary = 'valid-with-preserved-unknowns';
  return Object.freeze({ primary, counts: Object.freeze(counts) });
}
