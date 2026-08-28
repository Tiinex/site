import {
  conditionalContractGroups,
  contractRules,
  creationToolingConfigurationFields,
  optionalCreationInputFields,
  optionalSchemaSections,
  parsePortableSchemaDocument,
  requiredCreationContentInputs,
  requiredCreationInputFields,
  requiredCreationSections,
  requiredSchemaEntries,
  requiredSchemaHeadings,
  requiredSchemaSections
} from './schema.contract.js';
import { compileNamedDeclarationContracts, declarationTargetKey } from './named.declarations.js';
import { compileOrdinaryFieldAuthority, compileOrdinaryInstanceFieldGroups, mergeOrdinaryFieldAuthorities } from './ordinary.contract.js';
import { compileFieldValueConstraints, resolveFieldDomainConstraintsAcrossChain } from './contract.field-domain.compile.js';
import { compileMachineShapeDefinitions as compileShapes, resolveFieldDomainShapeAuthoritiesAcrossChain as resolveShapeAuthorities, summarizeMachineShapeAuthority as summarizeShapeAuthority } from './contract.machine-shape.js';
import { compileFieldShapeRequirements, resolveFieldShapeRequirements } from './contract.field-shape.compile.js';
import { dedupeConstraints } from './contract.compile.utils.js';

export const PORTABLE_COMPILED_CONTRACT_SCHEMA_ID = 'tiinex.portable.compiled-schema-contract.v1';

const STRING_CONTRACT_CACHE_LIMIT = 64;
const stringContractCache = new Map();

function compilePortableSchemaContractForChain(input = '') {
  if (typeof input !== 'string') return compilePortableSchemaContract(input);
  const cached = stringContractCache.get(input);
  if (cached) {
    stringContractCache.delete(input);
    stringContractCache.set(input, cached);
    return cached;
  }
  const compiled = compilePortableSchemaContract(input);
  stringContractCache.set(input, compiled);
  if (stringContractCache.size > STRING_CONTRACT_CACHE_LIMIT) stringContractCache.delete(stringContractCache.keys().next().value);
  return compiled;
}

export function compilePortableSchemaContract(input = '') {
  const document = typeof input === 'string' ? parsePortableSchemaDocument(input) : input;
  const sourceSchemaId = document?.schemaId || '';
  const requiredEntries = requiredSchemaEntries(document);
  const declarations = bindRequiredEntryTargets(compileNamedDeclarationContracts(document?.validation || {}), requiredEntries);
  const bodyRequiredFields = schemaFieldsByContractOwner(document, declarations, 'Required Fields', { unconditionalOnly: true });
  const bodyOptionalFields = schemaFieldsByContractOwner(document, declarations, 'Optional Fields');
  const machineShapeDefinitions = compileShapes(document);
  const rawFieldShapes = compileFieldShapeRequirements(document);
  const rawConstraints = [
    ...compileFieldValueConstraints(document),
    ...compileContractConstraints(document, declarations)
  ];
  const shapeLineage = [Object.freeze({
    schemaId: sourceSchemaId,
    machineShapes: Object.freeze({ definitions: machineShapeDefinitions })
  })];
  const constraints = resolveShapeAuthorities(rawConstraints, shapeLineage);
  const fieldShapes = resolveFieldShapeRequirements(rawFieldShapes, shapeLineage);
  const compiledRuleKeys = new Set(constraints.flatMap((constraint) => constraint.rule ? [constraint.rule] : []));
  return Object.freeze({
    schema: PORTABLE_COMPILED_CONTRACT_SCHEMA_ID,
    schemaId: document?.schemaId || '',
    parentSchemaId: document?.parentSchemaId || '',
    envelopeSchemaId: document?.envelopeSchemaId || '',
    validation: Object.freeze({
      groups: summarizeGroups(document?.validation || {}, sourceSchemaId),
      requiredSections: Object.freeze(requiredSchemaSections(document)),
      requiredHeadings: requiredSchemaHeadings(document),
      optionalSections: Object.freeze(optionalSchemaSections(document)),
      requiredFields: Object.freeze(bodyRequiredFields),
      optionalFields: Object.freeze(bodyOptionalFields),
      requiredEntries,
      conditionalRequirements: conditionalContractGroups(document?.validation || {}),
      ordinaryFieldAuthority: compileOrdinaryFieldAuthority(document),
      fieldShapes
    }),
    creation: Object.freeze({
      groups: summarizeGroups(document?.creation || {}, sourceSchemaId),
      requiredInputs: Object.freeze(unique([
        ...requiredCreationInputFields(document),
        ...requiredCreationContentInputs(document)
      ])),
      optionalInputs: Object.freeze(optionalCreationInputFields(document)),
      requiredSections: Object.freeze(requiredCreationSections(document)),
      toolingConfigurationFields: Object.freeze(creationToolingConfigurationFields(document))
    }),
    declarations,
    machineShapes: Object.freeze({
      schema: 'tiinex.portable.machine-shape-authority.v1',
      definitions: machineShapeDefinitions
    }),
    constraints: Object.freeze(constraints),
    guidance: Object.freeze({
      validationRules: Object.freeze(contractRules(document?.validation || {}).filter((rule) => !compiledRuleKeys.has(rule))),
      creationRules: Object.freeze(contractRules(document?.creation || {}))
    })
  });
}


export function compilePortableSchemaContractChain(inputs = []) {
  const compiled = (Array.isArray(inputs) ? inputs : [inputs]).filter(Boolean).map((input) => compilePortableSchemaContractForChain(input));
  const qualification = qualifyContractChain(compiled);
  const leaf = compiled.at(-1) || compilePortableSchemaContract('');
  const composition = qualification.state === 'contradictory' ? [leaf] : compiled;
  const requiredFields = unique(composition.flatMap((item) => item.validation.requiredFields || []));
  const requiredFieldKeys = new Set(requiredFields.map(exactToken));
  const optionalFields = unique(composition.flatMap((item) => item.validation.optionalFields || []))
    .filter((field) => !requiredFieldKeys.has(exactToken(field)));
  const mergedValidationGroups = mergeGroups(composition.flatMap((item) => item.validation.groups || []));
  const requiredSections = Object.freeze(unique(composition.flatMap((item) => item.validation.requiredSections || [])));
  const optionalSections = Object.freeze(unique(composition.flatMap((item) => item.validation.optionalSections || [])));
  const declarations = mergeDeclarationContracts(composition.flatMap((item) => item.declarations || []));
  const ordinaryFieldAuthority = mergeOrdinaryFieldAuthorities(composition.map((item) => item.validation.ordinaryFieldAuthority).filter(Boolean));
  const ordinaryGroups = compileOrdinaryInstanceFieldGroups({
    groups: mergedValidationGroups,
    declarations,
    requiredSections,
    requiredHeadings: mergeHeadingRequirements(composition.flatMap((item) => item.validation.requiredHeadings || [])),
    optionalSections,
    authority: ordinaryFieldAuthority
  });
  const ownedConstraints = resolveFieldDomainConstraintsAcrossChain(
    composition.flatMap((item) => item.constraints || []),
    mergedValidationGroups,
    composition
  );
  const constraints = resolveShapeAuthorities(ownedConstraints, composition);
  const machineShapes = summarizeShapeAuthority(composition);
  const fieldShapes = Object.freeze(composition.flatMap((item) => item.validation.fieldShapes || []));
  return Object.freeze({
    schema: 'tiinex.portable.compiled-schema-contract-chain.v1',
    schemaId: leaf.schemaId,
    lineage: Object.freeze(qualification.lineage),
    suppliedLineage: Object.freeze(compiled.map((item) => item.schemaId).filter(Boolean)),
    lineageQualification: qualification,
    validation: Object.freeze({
      groups: mergedValidationGroups,
      requiredSections,
      requiredHeadings: mergeHeadingRequirements(composition.flatMap((item) => item.validation.requiredHeadings || [])),
      optionalSections,
      requiredFields: Object.freeze(requiredFields),
      optionalFields: Object.freeze(optionalFields),
      requiredEntries: mergeRequiredEntryRequirements(composition.flatMap((item) => item.validation.requiredEntries || [])),
      conditionalRequirements: Object.freeze(composition.flatMap((item) => item.validation.conditionalRequirements || [])),
      ordinaryFieldAuthority,
      ordinaryGroups,
      fieldShapes
    }),
    creation: mergeCreationContracts(composition),
    declarations,
    machineShapes,
    constraints,
    guidance: Object.freeze({
      validationRules: Object.freeze(unique(composition.flatMap((item) => item.guidance.validationRules || []))),
      creationRules: Object.freeze(unique(composition.flatMap((item) => item.guidance.creationRules || [])))
    }),
    limitations: Object.freeze([
      'Inheritance is additive. Explicit override semantics remain visible in contract groups and are not guessed by the compiler.',
      'Callers must inspect lineageQualification before treating a compiled chain as complete lineage truth.'
    ])
  });
}

function qualifyContractChain(compiled = []) {
  const supplied = compiled.map((item) => item.schemaId).filter(Boolean);
  const findings = [];
  if (!compiled.length) {
    return Object.freeze({ state: 'unresolved', complete: false, lineage: Object.freeze([]), findings: Object.freeze(['No schema contracts were supplied.']) });
  }
  if (compiled.length === 1) {
    const only = compiled[0];
    if (only.parentSchemaId) {
      findings.push(`Declared parent schema is not supplied: ${only.parentSchemaId}.`);
      return Object.freeze({ state: 'unresolved', complete: false, lineage: Object.freeze(supplied), findings: Object.freeze(findings) });
    }
    return Object.freeze({ state: 'valid', complete: true, lineage: Object.freeze(supplied), findings: Object.freeze([]) });
  }
  if (compiled[0].parentSchemaId) findings.push(`First supplied schema declares an unsupplied parent: ${compiled[0].parentSchemaId}.`);
  for (let index = 1; index < compiled.length; index += 1) {
    const parent = compiled[index - 1];
    const child = compiled[index];
    if (!child.parentSchemaId || child.parentSchemaId !== parent.schemaId) {
      const declared = child.parentSchemaId || '(none)';
      const message = `Lineage edge mismatch: ${child.schemaId || '(unknown child)'} declares parent ${declared}, but preceding schema is ${parent.schemaId || '(unknown parent)'}.`;
      return Object.freeze({ state: 'contradictory', complete: false, lineage: Object.freeze([]), findings: Object.freeze([...findings, message]) });
    }
  }
  if (findings.length) return Object.freeze({ state: 'unresolved', complete: false, lineage: Object.freeze(supplied), findings: Object.freeze(findings) });
  return Object.freeze({ state: 'valid', complete: true, lineage: Object.freeze(supplied), findings: Object.freeze([]) });
}

function mergeHeadingRequirements(requirements = []) {
  const seen = new Set();
  const out = [];
  for (const requirement of requirements) {
    const title = String(requirement?.title || '').trim();
    const level = Number(requirement?.level || 0);
    if (!title || !level) continue;
    const key = `${level}\u0000${title}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(Object.freeze({ level, title, source: String(requirement?.source || '') }));
  }
  return Object.freeze(out);
}

function mergeCreationContracts(compiled = []) {
  const requiredInputs = unique(compiled.flatMap((item) => item.creation?.requiredInputs || []));
  const requiredInputKeys = new Set(requiredInputs.map(exactToken));
  const optionalInputs = unique(compiled.flatMap((item) => item.creation?.optionalInputs || []))
    .filter((field) => !requiredInputKeys.has(exactToken(field)));
  return Object.freeze({
    groups: mergeGroups(compiled.flatMap((item) => item.creation?.groups || [])),
    requiredInputs: Object.freeze(requiredInputs),
    optionalInputs: Object.freeze(optionalInputs),
    requiredSections: Object.freeze(unique(compiled.flatMap((item) => item.creation?.requiredSections || []))),
    toolingConfigurationFields: Object.freeze(unique(compiled.flatMap((item) => item.creation?.toolingConfigurationFields || [])))
  });
}

function schemaFieldsByContractOwner(document = {}, declarations = [], categoryName = '', options = {}) {
  const declarationGroups = new Set((declarations || []).map((declaration) => exactToken(declaration.group)));
  const fields = [];
  for (const group of document.validation?.groups || []) {
    if (declarationGroups.has(exactToken(group.name))) continue;
    if (options.unconditionalOnly && categoryItems(group, ['Required When']).length) continue;
    fields.push(...categoryItems(group, [categoryName]).map(cleanToken));
  }
  return Object.freeze(unique(fields));
}

function summarizeGroups(contract = {}, sourceSchemaId = '') {
  return Object.freeze((contract.groups || []).map((group) => Object.freeze({
    name: group.name,
    sourceSchemaId,
    requiredWhen: Object.freeze(categoryItems(group, ['Required When']).map(cleanToken)),
    labelCandidates: Object.freeze([...(group.labelCandidates || [])]),
    categories: Object.freeze((group.categories || []).map((category) => Object.freeze({
      name: category.name,
      items: Object.freeze([...category.items]),
      nodes: freezeCategoryNodes(category.nodes || [])
    })))
  })));
}

function mergeGroups(groups = []) {
  const order = [];
  const byName = new Map();
  for (const group of groups) {
    const key = exactToken(group.name);
    if (!byName.has(key)) {
      order.push(key);
      byName.set(key, { name: group.name, requiredWhen: [], categories: [], categoryIndex: new Map(), contributors: [] });
    }
    const target = byName.get(key);
    target.contributors.push(Object.freeze({
      sourceSchemaId: String(group.sourceSchemaId || ''),
      name: group.name,
      requiredWhen: Object.freeze([...(group.requiredWhen || [])]),
      labelCandidates: Object.freeze([...(group.labelCandidates || [])]),
      categories: Object.freeze((group.categories || []).map((category) => Object.freeze({
        name: category.name,
        items: Object.freeze([...(category.items || [])]),
        nodes: freezeCategoryNodes(category.nodes || [])
      })))
    }));
    target.requiredWhen = unique([...target.requiredWhen, ...(group.requiredWhen || [])]);
    for (const category of group.categories || []) {
      const categoryKey = exactToken(category.name);
      if (!target.categoryIndex.has(categoryKey)) {
        target.categoryIndex.set(categoryKey, target.categories.length);
        target.categories.push({ name: category.name, items: [], nodes: [] });
      }
      const mergedCategory = target.categories[target.categoryIndex.get(categoryKey)];
      mergedCategory.items = unique([...mergedCategory.items, ...(category.items || [])]);
      mergedCategory.nodes.push(...(category.nodes || []));
    }
  }
  return Object.freeze(order.map((key) => {
    const group = byName.get(key);
    return Object.freeze({
      name: group.name,
      requiredWhen: Object.freeze([...group.requiredWhen]),
      labelCandidates: Object.freeze(unique(group.contributors.flatMap((contribution) => contribution.labelCandidates || []))),
      contributors: Object.freeze([...group.contributors]),
      categories: Object.freeze(group.categories.map((category) => Object.freeze({
        name: category.name,
        items: Object.freeze([...category.items]),
        nodes: freezeCategoryNodes(category.nodes || [])
      })))
    });
  }));
}

function bindRequiredEntryTargets(declarations = [], requirements = []) {
  return Object.freeze((declarations || []).map((declaration) => {
    const inferredTargets = requirements
      .filter((requirement) => (requirement.entries || []).some((entry) => exactToken(entry) === exactToken(declaration.group)))
      .flatMap((requirement) => requirement.targetHeadings || []);
    if (!inferredTargets.length) return declaration;
    return Object.freeze({
      ...declaration,
      targetHeadings: Object.freeze(unique([...(declaration.targetHeadings || []), ...inferredTargets]))
    });
  }));
}

function mergeRequiredEntryRequirements(requirements = []) {
  const order = [];
  const byKey = new Map();
  for (const requirement of requirements) {
    const key = exactToken(requirement.group);
    if (!byKey.has(key)) {
      order.push(key);
      byKey.set(key, { group: requirement.group, entries: [], targetHeadings: [] });
    }
    const target = byKey.get(key);
    target.entries = unique([...target.entries, ...(requirement.entries || [])]);
    target.targetHeadings = unique([...target.targetHeadings, ...(requirement.targetHeadings || [])]);
  }
  return Object.freeze(order.map((key) => {
    const item = byKey.get(key);
    return Object.freeze({
      group: item.group,
      entries: Object.freeze([...item.entries]),
      targetHeadings: Object.freeze([...item.targetHeadings])
    });
  }));
}

function mergeDeclarationContracts(declarations = []) {
  const order = [];
  const byKey = new Map();
  for (const declaration of declarations) {
    const key = exactToken(declaration.group);
    if (!byKey.has(key)) {
      order.push(key);
      byKey.set(key, {
        ...declaration,
        entryShape: [...(declaration.entryShape || [])],
        requiredFields: [...(declaration.requiredFields || [])],
        optionalFields: [...(declaration.optionalFields || [])],
        declarationFields: [...(declaration.declarationFields || [])],
        allowedLabels: [...(declaration.allowedLabels || [])],
        allowedShapes: [...(declaration.allowedShapes || [])],
        targetHeadings: [...(declaration.targetHeadings || [])],
        rules: [...(declaration.rules || [])]
      });
      continue;
    }
    const target = byKey.get(key);
    for (const field of ['entryShape', 'requiredFields', 'optionalFields', 'declarationFields', 'allowedLabels', 'allowedShapes', 'targetHeadings', 'rules']) {
      target[field] = unique([...(target[field] || []), ...(declaration[field] || [])]);
    }
    target.allowLiteralNone = Boolean(target.allowLiteralNone || declaration.allowLiteralNone);
  }
  return Object.freeze(order.map((key) => {
    const declaration = byKey.get(key);
    return Object.freeze({
      ...declaration,
      entryShape: Object.freeze([...declaration.entryShape]),
      requiredFields: Object.freeze([...declaration.requiredFields]),
      optionalFields: Object.freeze([...declaration.optionalFields]),
      declarationFields: Object.freeze([...declaration.declarationFields]),
      allowedLabels: Object.freeze([...declaration.allowedLabels]),
      allowedShapes: Object.freeze([...declaration.allowedShapes]),
      targetHeadings: Object.freeze([...declaration.targetHeadings]),
      rules: Object.freeze([...declaration.rules])
    });
  }));
}


function freezeCategoryNodes(nodes = []) {
  return Object.freeze((nodes || []).map((node) => Object.freeze({
    value: String(node.value || ''),
    line: Number(node.line || 0),
    indent: Number(node.indent || 0),
    children: freezeCategoryNodes(node.children || [])
  })));
}

function compileContractConstraints(document = {}, declarations = []) {
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
