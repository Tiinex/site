import { declarationTargetKey } from './named.declarations.js';
import { dedupeConstraints } from './contract.compile.utils.js';

export function compileContractConstraints(document = {}, declarations = []) {
  const constraints = [];
  const declarationByGroup = new Map(declarations.map((contract) => [exactToken(contract.group), contract]));
  const declarationTargets = new Map();
  for (const contract of declarations) {
    for (const heading of contract.targetHeadings) declarationTargets.set(declarationTargetKey(heading), contract.group);
  }

  for (const group of document.validation?.groups || []) {
    const rules = categoryItems(group, ['Rules']);
    const appliesTo = categoryItems(group, ['Applies To']).map(cleanToken);
    const currentDeclaration = declarationByGroup.get(exactToken(group.name)) || null;
    const appliedGroups = appliesTo.filter((name) => declarationByGroup.has(exactToken(name)));
    for (const rule of rules) {
      constraints.push(...compileReferenceRule(rule, currentDeclaration, declarationTargets));
      const cardinality = compileCardinalityRule(rule, currentDeclaration);
      if (cardinality) constraints.push(cardinality);
      const generation = compileTargetSchemaAuthorityRule(rule, currentDeclaration);
      if (generation) constraints.push(generation);
      const naming = compileNamingAuthorityRule(rule, currentDeclaration);
      if (naming) constraints.push(naming);
      const agreement = compileClassificationAgreementRule(rule, appliedGroups);
      if (agreement) constraints.push(agreement);
      const mapping = compileMemberMappingRule(rule, currentDeclaration);
      if (mapping) constraints.push(mapping);
    }
  }
  return dedupeConstraints(constraints);
}

function compileReferenceRule(rule, declaration, declarationTargets) {
  if (!declaration || !/must resolve to (?:a )?declared/i.test(rule)) return [];
  const before = rule.split(/must resolve to/i)[0];
  const fields = [...before.matchAll(/`([^`]+)`/g)].map((match) => cleanToken(match[1])).filter((field) => field !== 'when present');
  if (!fields.length) return [];
  const after = rule.split(/must resolve to/i)[1] || '';
  const phrase = after.split(/[.;]/)[0].replace(/\bthat\b.*$/i, '').replace(/\band is\b.*$/i, '').trim();
  const targets = [];
  for (const [targetKey, group] of declarationTargets.entries()) {
    const singular = targetKey.replace(/\brole\b/g, 'role').replace(/\bbinding\b/g, 'binding').replace(/\beffect\b/g, 'effect');
    const haystack = normalizeKey(phrase).replace(/\broles\b/g, 'role').replace(/\bbindings\b/g, 'binding').replace(/\beffects\b/g, 'effect');
    if (haystack.includes(singular)) targets.push(group);
  }
  return fields.map((field) => Object.freeze({
    kind: 'declaration-reference',
    group: declaration.group,
    field,
    targets: Object.freeze(unique(targets)),
    optional: /when present/i.test(before) || declaration.optionalFields.includes(field),
    rule
  }));
}

function compileCardinalityRule(rule, declaration) {
  if (!declaration) return null;
  if (!/Maximum count must not be lower than minimum count/i.test(rule)) return null;
  if (!declaration.requiredFields.includes('Minimum Count') || !declaration.requiredFields.includes('Maximum Count')) return null;
  return Object.freeze({ kind: 'cardinality-order', group: declaration.group, minimumField: 'Minimum Count', maximumField: 'Maximum Count', rule });
}

function compileTargetSchemaAuthorityRule(rule, declaration) {
  if (!declaration || !/is unresolved when/i.test(rule) || !/target schema exposes no resolvable generation\/creation authority/i.test(rule)) return null;
  const binding = rule.match(/`([^`:]+):\s*([^`]+)`\s+is unresolved when\s+`([^`]+)`/i);
  if (!binding) return null;
  return Object.freeze({
    kind: 'target-schema-authority',
    group: declaration.group,
    field: cleanToken(binding[1]),
    value: cleanToken(binding[2]),
    schemaField: cleanToken(binding[3]),
    capability: 'generation',
    rule
  });
}

function compileNamingAuthorityRule(rule, declaration) {
  if (!declaration || !/Naming Authority:\s*target-schema/i.test(rule) || !/File Naming authority/i.test(rule) || !/Schema Constraint/i.test(rule)) return null;
  return Object.freeze({
    kind: 'target-schema-authority-via-reference',
    group: declaration.group,
    field: 'Naming Authority',
    value: 'target-schema',
    referenceField: 'Output Binding',
    referencedSchemaField: 'Schema Constraint',
    capability: 'fileNaming',
    rule
  });
}

function compileClassificationAgreementRule(rule, appliedGroups) {
  if (!appliedGroups.length || !/explicit `Target Kind`/i.test(rule) || !/`Schema Constraint`\/authority/i.test(rule) || !/must agree/i.test(rule)) return null;
  return Object.freeze({
    kind: 'classification-agreement',
    groups: Object.freeze([...appliedGroups]),
    explicitField: 'Target Kind',
    schemaField: 'Schema Constraint',
    rule
  });
}

function compileMemberMappingRule(rule, declaration) {
  if (!declaration || !/`Member Mapping` is required when multiplicity/i.test(rule)) return null;
  return Object.freeze({ kind: 'member-mapping-when-ambiguous', group: declaration.group, field: 'Member Mapping', rule });
}

function categoryItems(group = {}, names = []) {
  const wanted = new Set(names.map(exactToken));
  return (group.categories || []).flatMap((category) => wanted.has(exactToken(category.name)) ? category.items : []);
}

function cleanToken(value = '') { return String(value || '').trim().replace(/^`|`$/g, '').trim(); }
function exactToken(value = '') { return String(value || '').trim(); }
function normalizeKey(value = '') { return String(value || '').toLowerCase().replace(/[`*_#]/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); }
function unique(values = []) { return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))]; }
