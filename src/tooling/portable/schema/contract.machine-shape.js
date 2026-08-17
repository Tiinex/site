import { compileLexicalShapeV1, qualifyLexicalShapeV1, PORTABLE_LEXICAL_SHAPE_PROFILE_V1 } from './lexical.shape.v1.js';

export const PORTABLE_MACHINE_SHAPE_AUTHORITY_SCHEMA_ID = 'tiinex.portable.machine-shape-authority.v1';

export function compileMachineShapeDefinitions(document = {}) {
  const sourceSchemaId = String(document.schemaId || '');
  const definitions = [];
  for (const group of document.validation?.groups || []) {
    for (const category of group.categories || []) {
      if (exact(category.name) !== 'Machine Shape Definitions') continue;
      for (const declaration of category.nodes || []) {
        definitions.push(compileDefinition({ declaration, sourceSchemaId, sourceGroup: group.name }));
      }
    }
  }
  return Object.freeze(definitions);
}

export function resolveFieldDomainShapeAuthoritiesAcrossChain(constraints = [], compiledLineage = []) {
  return Object.freeze((constraints || []).map((constraint) => {
    if (constraint?.kind !== 'field-domain') return constraint;
    const allowedShapes = constraint.allowedShapes || [];
    if (!allowedShapes.length) return Object.freeze({ ...constraint, allowedShapeAuthorities: Object.freeze([]) });
    const resolutions = allowedShapes.map((shape) => resolveShapeAtSourcePoint(shape, constraint.sourceSchemaId, compiledLineage));
    return Object.freeze({ ...constraint, allowedShapeAuthorities: Object.freeze(resolutions) });
  }));
}

export function summarizeMachineShapeAuthority(compiledLineage = []) {
  const definitions = Object.freeze(compiledLineage.flatMap((item) => item.machineShapes?.definitions || []));
  const leafSchemaId = String(compiledLineage.at(-1)?.schemaId || '');
  const labels = unique(definitions.map((definition) => definition.shapeLabel));
  const active = Object.freeze(labels.map((label) => resolveShapeAtSourcePoint(label, leafSchemaId, compiledLineage)));
  const findings = [];
  for (const definition of definitions) {
    if (definition.definitionQualification === 'structurally-invalid') {
      findings.push(Object.freeze({
        state: 'structurally-invalid',
        shapeLabel: definition.shapeLabel,
        sourceSchemaId: definition.sourceSchemaId,
        sourceGroup: definition.sourceGroup,
        reasons: definition.definitionFindings
      }));
    }
  }
  for (const resolution of active) {
    if (resolution.qualification === 'conflicting') findings.push(Object.freeze({
      state: 'contradictory',
      shapeLabel: resolution.shapeLabel,
      reasons: resolution.findings
    }));
  }
  return Object.freeze({
    schema: PORTABLE_MACHINE_SHAPE_AUTHORITY_SCHEMA_ID,
    definitions,
    active,
    findings: Object.freeze(findings)
  });
}

export function projectMachineShapeSemanticIdentity(document = {}) {
  const definitions = compileMachineShapeDefinitions(document).map(projectDefinitionSemanticIdentity);
  definitions.sort(compareSemanticIdentity);
  const categoryOccurrences = projectMachineShapeCategoryOccurrences(document);
  return Object.freeze({
    schema: PORTABLE_MACHINE_SHAPE_AUTHORITY_SCHEMA_ID,
    categoryOccurrences,
    definitions: Object.freeze(definitions)
  });
}

function projectMachineShapeCategoryOccurrences(document = {}) {
  const sourceSchemaId = String(document.schemaId || '');
  const occurrences = [];
  for (const group of document.validation?.groups || []) {
    for (const category of group.categories || []) {
      if (exact(category.name) !== 'Machine Shape Definitions') continue;
      const definitions = (category.nodes || [])
        .map((declaration) => compileDefinition({ declaration, sourceSchemaId, sourceGroup: group.name }))
        .map(projectDefinitionSemanticIdentity)
        .sort(compareSemanticIdentity);
      occurrences.push(Object.freeze({
        sourceSchemaId,
        sourceGroup: String(group.name || ''),
        category: 'Machine Shape Definitions',
        definitions: Object.freeze(definitions)
      }));
    }
  }
  occurrences.sort(compareSemanticIdentity);
  return Object.freeze(occurrences);
}

export function qualifyResolvedMachineShape(value = '', resolution = {}) {
  if (resolution?.qualification !== 'evaluable' || !resolution.definition) return Object.freeze({ qualification: 'unresolved' });
  const definition = resolution.definition;
  if (definition.grammarProfile === PORTABLE_LEXICAL_SHAPE_PROFILE_V1) return qualifyLexicalShapeV1(definition.compiledGrammar, value);
  return Object.freeze({ qualification: 'unresolved' });
}

function compileDefinition({ declaration = {}, sourceSchemaId = '', sourceGroup = '' } = {}) {
  const shapeLabel = exact(declaration.value);
  const profiles = [];
  const startRules = [];
  const grammarRules = [];
  const humanMeanings = [];
  const unknown = [];
  const findings = [];

  for (const child of declaration.children || []) {
    const parsed = splitProperty(child.rawValue ?? child.value);
    if (!parsed || (child.children || []).length) {
      unknown.push(String(child.value || ''));
      continue;
    }
    if (parsed.name === 'Grammar Profile') profiles.push(exact(parsed.value));
    else if (parsed.name === 'Start Rule') startRules.push(exact(parsed.value));
    else if (parsed.name === 'Grammar Rule') grammarRules.push(parsed.value);
    else if (parsed.name === 'Human Meaning') humanMeanings.push(exact(parsed.value));
    else unknown.push(String(child.value || ''));
  }

  if (!shapeLabel) findings.push('Machine Shape Definition has no exact shape label.');
  if (profiles.length !== 1) findings.push(`Expected exactly one Grammar Profile; found ${profiles.length}.`);
  if (startRules.length !== 1) findings.push(`Expected exactly one Start Rule; found ${startRules.length}.`);
  if (!grammarRules.length) findings.push('Expected one or more Grammar Rule fields.');
  if (humanMeanings.length !== 1) findings.push(`Expected exactly one Human Meaning; found ${humanMeanings.length}.`);
  if (unknown.length) findings.push(`Unsupported Machine Shape Definition properties: ${unknown.join(', ')}.`);

  const grammarProfile = profiles.length === 1 ? profiles[0] : '';
  const startRule = startRules.length === 1 ? startRules[0] : '';
  const humanMeaning = humanMeanings.length === 1 ? humanMeanings[0] : '';
  let compiledGrammar = null;
  let qualificationSupport = 'unavailable';

  if (!findings.length && grammarProfile === PORTABLE_LEXICAL_SHAPE_PROFILE_V1) {
    compiledGrammar = compileLexicalShapeV1({ startRule, grammarRules });
    qualificationSupport = compiledGrammar.qualification === 'valid' ? 'available' : 'invalid';
    if (compiledGrammar.qualification !== 'valid') findings.push(...compiledGrammar.findings);
  } else if (findings.length) {
    qualificationSupport = 'invalid';
  }

  return Object.freeze({
    kind: 'machine-shape-definition',
    shapeLabel,
    sourceSchemaId,
    sourceGroup,
    declarationSource: Object.freeze({ line: Number(declaration.line || 0) }),
    visibilityPolicy: 'lineage-prefix-ancestors-and-same-source',
    grammarProfile,
    startRule,
    grammarRules: Object.freeze([...grammarRules]),
    humanMeaning,
    qualificationSupport,
    definitionQualification: findings.length ? 'structurally-invalid' : 'valid',
    definitionFindings: Object.freeze(findings),
    declarationStructure: projectDeclarationStructure(declaration),
    compiledGrammar
  });
}

function projectDefinitionSemanticIdentity(definition = {}) {
  const common = {
    shapeLabel: String(definition.shapeLabel || ''),
    sourceSchemaId: String(definition.sourceSchemaId || ''),
    sourceGroup: String(definition.sourceGroup || ''),
    grammarProfile: String(definition.grammarProfile || ''),
    startRule: String(definition.startRule || ''),
    humanMeaning: String(definition.humanMeaning || ''),
    qualificationSupport: String(definition.qualificationSupport || ''),
    definitionQualification: String(definition.definitionQualification || ''),
    grammarRuleCount: (definition.grammarRules || []).length
  };

  if (definition.grammarProfile === PORTABLE_LEXICAL_SHAPE_PROFILE_V1 && definition.compiledGrammar?.qualification === 'valid') {
    return Object.freeze({
      ...common,
      grammar: projectValidLexicalGrammar(definition.compiledGrammar)
    });
  }

  return Object.freeze({
    ...common,
    structuralDeclaration: definition.declarationStructure || Object.freeze({ value: String(definition.shapeLabel || ''), children: Object.freeze([]) }),
    grammar: Object.freeze({
      qualification: String(definition.compiledGrammar?.qualification || definition.definitionQualification || ''),
      rawRules: Object.freeze([...(definition.grammarRules || [])].map(String).sort(compareExactStrings))
    })
  });
}

function projectDeclarationStructure(node = {}, isRoot = true) {
  const children = (node.children || []).map((child) => projectDeclarationStructure(child, false));
  children.sort(compareSemanticIdentity);
  return Object.freeze({
    value: isRoot ? exact(node.value) : String(node.rawValue ?? node.value ?? ''),
    children: Object.freeze(children)
  });
}

function projectValidLexicalGrammar(compiled = {}) {
  const rules = (compiled.grammarRules || []).map((rule) => Object.freeze({
    name: String(rule.name || ''),
    expression: canonicalExpression(rule.expression)
  }));
  rules.sort((left, right) => compareExactStrings(left.name, right.name) || compareSemanticIdentity(left, right));
  return Object.freeze({
    qualification: String(compiled.qualification || ''),
    startRule: String(compiled.startRule || ''),
    rules: Object.freeze(rules)
  });
}

function canonicalExpression(node = {}) {
  if (!node || typeof node !== 'object') return node;
  if (node.type === 'alternation') {
    const alternatives = (node.alternatives || []).map(canonicalExpression).sort(compareSemanticIdentity);
    return Object.freeze({ type: 'alternation', alternatives: Object.freeze(alternatives) });
  }
  if (node.type === 'concatenation') {
    return Object.freeze({ type: 'concatenation', parts: Object.freeze((node.parts || []).map(canonicalExpression)) });
  }
  if (node.type === 'repeat') {
    return Object.freeze({ type: 'repeat', quantifier: String(node.quantifier || ''), expression: canonicalExpression(node.expression) });
  }
  if (node.type === 'any-except') {
    return Object.freeze({ type: 'any-except', exclusions: Object.freeze([...(node.exclusions || [])].map(String).sort(compareExactStrings)) });
  }
  if (node.type === 'literal') return Object.freeze({ type: 'literal', value: String(node.value ?? '') });
  if (node.type === 'builtin') return Object.freeze({ type: 'builtin', name: String(node.name || '') });
  if (node.type === 'reference') return Object.freeze({ type: 'reference', name: String(node.name || '') });
  return Object.freeze({ ...node });
}

function compareSemanticIdentity(left = {}, right = {}) {
  return compareExactStrings(JSON.stringify(left), JSON.stringify(right));
}

function compareExactStrings(left = '', right = '') {
  const a = String(left);
  const b = String(right);
  return a < b ? -1 : a > b ? 1 : 0;
}

function resolveShapeAtSourcePoint(shapeLabel = '', sourceSchemaId = '', compiledLineage = []) {
  const label = exact(shapeLabel);
  const sourceMatches = compiledLineage
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => String(item?.schemaId || '') === String(sourceSchemaId || ''));
  if (sourceMatches.length !== 1) return resolution(label, 'unresolved', null, [
    `Machine-shape use source schema ${sourceSchemaId || '(unknown schema)'} resolves to ${sourceMatches.length} lineage positions.`
  ], [], sourceSchemaId, []);

  const prefix = compiledLineage.slice(0, sourceMatches[0].index + 1);
  const visibleSchemaIds = prefix.map((item) => String(item?.schemaId || '')).filter(Boolean);
  const visible = prefix.flatMap((item) => (item.machineShapes?.definitions || []).filter((definition) => exact(definition.shapeLabel) === label));
  if (!visible.length) return resolution(label, 'unresolved', null, [`No visible Machine Shape Definition exists for exact label ${label || '(empty)'}.`], [], sourceSchemaId, visibleSchemaIds);
  if (visible.length > 1) return resolution(label, 'conflicting', null, [`Exact Machine Shape Definition label ${label} resolves to ${visible.length} active definitions at source point ${sourceSchemaId}.`], visible, sourceSchemaId, visibleSchemaIds);

  const definition = visible[0];
  if (definition.definitionQualification !== 'valid') return resolution(label, 'unresolved', definition, [
    `Machine Shape Definition ${label} is structurally invalid.`,
    ...(definition.definitionFindings || [])
  ], visible, sourceSchemaId, visibleSchemaIds);
  if (definition.qualificationSupport !== 'available') return resolution(label, 'unresolved', definition, [
    `Machine Shape Definition ${label} uses unsupported or unavailable Grammar Profile ${definition.grammarProfile || '(none)'}.`
  ], visible, sourceSchemaId, visibleSchemaIds);
  return resolution(label, 'evaluable', definition, [], visible, sourceSchemaId, visibleSchemaIds);
}

function resolution(shapeLabel, qualification, definition, findings, visibleDefinitions, useSourceSchemaId = '', visibleSchemaIds = []) {
  return Object.freeze({
    shapeLabel,
    qualification,
    useSourceSchemaId: String(useSourceSchemaId || ''),
    visibilityPolicy: 'lineage-prefix-ancestors-and-same-source',
    visibleSchemaIds: Object.freeze([...visibleSchemaIds]),
    definition: definition || null,
    resolvedDefinitionProvenance: definition ? Object.freeze({
      sourceSchemaId: definition.sourceSchemaId,
      sourceGroup: definition.sourceGroup,
      declarationSource: definition.declarationSource
    }) : null,
    visibleDefinitions: Object.freeze((visibleDefinitions || []).map((item) => Object.freeze({
      shapeLabel: item.shapeLabel,
      sourceSchemaId: item.sourceSchemaId,
      sourceGroup: item.sourceGroup,
      declarationSource: item.declarationSource,
      grammarProfile: item.grammarProfile,
      definitionQualification: item.definitionQualification,
      qualificationSupport: item.qualificationSupport
    }))),
    findings: Object.freeze(findings || [])
  });
}

function splitProperty(value = '') {
  const text = String(value || '');
  const separator = text.indexOf(':');
  if (separator <= 0) return null;
  const name = text.slice(0, separator).trim();
  const propertyValue = text.slice(separator + 1);
  if (!name || !exact(propertyValue)) return null;
  return { name, value: propertyValue };
}

function exact(value = '') { return String(value || '').trim(); }
function unique(values = []) { return [...new Set(values.map(exact).filter(Boolean))]; }
