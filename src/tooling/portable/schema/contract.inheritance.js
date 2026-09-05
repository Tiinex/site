import { compileOrdinaryGroupContribution } from './ordinary.contract.js';
import { qualifyInlineInheritanceOverrideAuthority } from './contract.inheritance.inline.js';
import { parseStandaloneInheritanceRecord } from './contract.inheritance.record.js';

export const PORTABLE_SCHEMA_INHERITANCE_RESOLUTION_SCHEMA_ID = 'tiinex.portable.schema-inheritance-resolution.v1';

export function applySchemaInheritanceOverrides(compiled = [], artifacts = []) {
  const baseComposition = Object.freeze([...compiled]);
  const declarations = compiled.flatMap((item) => item?.inheritanceOverrides?.declarations || []);
  const findings = compiled.flatMap((item) => item?.inheritanceOverrides?.findings || []);
  const standaloneInputs = (Array.isArray(artifacts) ? artifacts : [artifacts]).filter(Boolean);
  const corroborations = [];

  if (declarations.length) {
    const authority = qualifyInlineInheritanceOverrideAuthority(compiled.find((item) => String(item?.schemaId || '') === 'tiinex.root.v1'));
    findings.push(...authority.findings);
  }

  const qualified = declarations.map((declaration) => qualifyOverrideDeclaration(declaration, compiled));
  for (const item of qualified) findings.push(...item.findings);
  findings.push(...competingOverrideFindings(qualified));
  findings.push(...compareStandaloneRecords(standaloneInputs, declarations, corroborations));

  if (findings.length) return result(baseComposition, 'unresolved', declarations, [], findings, corroborations);
  if (!declarations.length) return result(baseComposition, 'not-declared', declarations, [], [], corroborations);

  let composition = [...compiled];
  const applications = [];
  for (const item of qualified) {
    const applied = applyQualifiedOverride(composition, item);
    if (applied.state !== 'qualified') return result(baseComposition, 'unresolved', declarations, [], applied.findings, corroborations);
    composition = [...applied.composition];
    applications.push(applied.application);
  }
  return result(Object.freeze(composition), 'qualified', declarations, applications, [], corroborations);
}

function qualifyOverrideDeclaration(declaration = {}, composition = []) {
  const findings = [];
  if (String(declaration.operation || '') !== 'override') findings.push(`Inheritance Overrides declaration ${label(declaration)} must use Merge Operation: override.`);
  const childSchemaId = String(declaration.sourceSchemaId || '');
  const parentSchemaId = String(declaration.parentSchemaId || '');
  const parentIndexes = exactSchemaIndexes(composition, parentSchemaId);
  const childIndexes = exactSchemaIndexes(composition, childSchemaId);
  if (parentIndexes.length !== 1) findings.push(`Inheritance Overrides Parent Schema ${parentSchemaId || '(missing)'} resolves to ${parentIndexes.length} supplied lineage positions.`);
  if (childIndexes.length !== 1) findings.push(`Inheritance Overrides declaring Child Schema ${childSchemaId || '(missing)'} resolves to ${childIndexes.length} supplied lineage positions.`);
  const parentIndex = parentIndexes[0] ?? -1;
  const childIndex = childIndexes[0] ?? -1;
  if (parentIndex >= 0 && childIndex >= 0 && childIndex <= parentIndex) findings.push('Inheritance Overrides Parent Schema must be an actual ancestor of the declaring child schema.');

  const parentNode = parseContractNode(declaration.parentNode);
  const childNode = parseContractNode(declaration.childNode);
  if (!parentNode) findings.push(`Parent Node is not one exact Schema Validation Contract / group / category path: ${declaration.parentNode || '(missing)'}.`);
  if (!childNode) findings.push(`Child Node is not one exact Schema Validation Contract / group / category path: ${declaration.childNode || '(missing)'}.`);

  const parent = parentIndex >= 0 ? composition[parentIndex] : null;
  const child = childIndex >= 0 ? composition[childIndex] : null;
  const parentMatch = parentNode && parent ? exactCategoryMatch(parent.validation?.groups || [], parentNode) : null;
  const childMatch = childNode && child ? exactCategoryMatch(child.validation?.groups || [], childNode) : null;
  if (parentMatch?.state === 'unresolved') findings.push(`Parent Node must resolve exactly once in ${parentSchemaId}: ${declaration.parentNode}; observed ${parentMatch.count}.`);
  if (childMatch?.state === 'unresolved') findings.push(`Child Node must resolve exactly once in ${childSchemaId}: ${declaration.childNode}; observed ${childMatch.count}.`);

  let suppressedGroups = Object.freeze([]);
  if (!findings.length && parentNode.category === 'Required Shape' && childNode.category === 'Required Shape') {
    const structural = qualifyRequiredShapeStructuralDeactivation(parent, child, parentMatch.category, childMatch.category, composition);
    findings.push(...structural.findings);
    suppressedGroups = structural.suppressedGroups;
  }

  return Object.freeze({
    state: findings.length ? 'unresolved' : 'qualified', findings: Object.freeze(findings), declaration,
    parentSchemaId, childSchemaId, parentIndex, childIndex, parentNode, childNode,
    parentContribution: parentMatch?.category || null, childContribution: childMatch?.category || null,
    suppressedGroups
  });
}

function qualifyRequiredShapeStructuralDeactivation(parent = {}, child = {}, parentCategory = {}, childCategory = {}, composition = []) {
  void child;
  const findings = [];
  const parentHeadings = headingRequirements(parentCategory.items || []);
  const childHeadings = headingRequirements(childCategory.items || []);
  if (!parentHeadings.length) findings.push('Required Shape Parent Node has no machine-readable heading requirements.');
  if (!childHeadings.length) findings.push('Required Shape Child Node has no machine-readable heading requirements.');
  const rootAuthority = composition.find((item) => item?.validation?.ordinaryFieldAuthority?.state === 'available')?.validation?.ordinaryFieldAuthority || null;
  const replacement = new Set(childHeadings.map((item) => headingKey(item.level, item.title)));
  const removedSecondLevel = new Set(parentHeadings.filter((item) => item.level === 2 && !replacement.has(headingKey(item.level, item.title))).map((item) => item.title));
  if (removedSecondLevel.size && !rootAuthority) findings.push('Root ordinary instance-field target authority is unavailable for Required Shape structural deactivation.');

  const suppressed = [];
  if (rootAuthority) {
    for (const group of parent?.validation?.groups || []) {
      const contribution = compileOrdinaryGroupContribution(group, rootAuthority);
      if (!contribution) continue;
      if (contribution.target?.qualification !== 'valid') {
        findings.push(`Parent ordinary group ${group.name || '(unnamed)'} has unresolved Instance Target ownership during Required Shape override.`);
        continue;
      }
      if (contribution.target.level === 2 && removedSecondLevel.has(contribution.target.title)) suppressed.push(group.name);
    }
  }
  return Object.freeze({ state: findings.length ? 'unresolved' : 'qualified', findings: Object.freeze(findings), suppressedGroups: Object.freeze(unique(suppressed)) });
}

function competingOverrideFindings(qualified = []) {
  const findings = [];
  const byParent = new Map();
  for (const item of qualified) {
    if (item.state !== 'qualified') continue;
    const key = `${item.parentSchemaId}\u0000${item.declaration.parentNode}`;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(item);
  }
  for (const items of byParent.values()) if (items.length > 1) findings.push(`Competing active Inheritance Overrides declarations target the same parent contribution: ${items.map((item) => label(item.declaration)).join(', ')}.`);
  return findings;
}

function compareStandaloneRecords(inputs = [], declarations = [], corroborations = []) {
  const findings = [];
  for (const input of inputs) {
    const record = parseStandaloneInheritanceRecord(input);
    if (record.state !== 'qualified') { findings.push(...record.findings); continue; }
    const matches = declarations.filter((declaration) => declaration.name === record.handle && declaration.sourceSchemaId === record.childSchemaId);
    if (matches.length !== 1) {
      findings.push(`Standalone inheritance record ${record.handle || '(unnamed)'} has ${matches.length} matching canonical inline declarations; standalone records cannot add schema-local override authority.`);
      continue;
    }
    const declaration = matches[0];
    for (const rule of record.rules) {
      const exact = rule.operation === declaration.operation
        && record.parentSchemaId === declaration.parentSchemaId
        && record.childSchemaId === declaration.sourceSchemaId
        && rule.parentNode === declaration.parentNode
        && rule.childNode === declaration.childNode;
      if (!exact) findings.push(`Standalone inheritance record ${record.handle} disagrees with the canonical inline declaration.`);
      else corroborations.push(Object.freeze({ handle: record.handle, source: 'tiinex.schema.inheritance.v1', state: 'corroborating-record' }));
    }
  }
  return findings;
}

function applyQualifiedOverride(composition = [], qualified = {}) {
  const parent = composition[qualified.parentIndex];
  const transformedParent = deactivateParentContribution(parent, qualified.parentNode, new Set(qualified.suppressedGroups || []));
  const next = [...composition];
  next[qualified.parentIndex] = transformedParent;
  const declaration = qualified.declaration;
  const application = Object.freeze({
    handle: declaration.name,
    declaration: Object.freeze({ sourceSchemaId: declaration.sourceSchemaId, sourceGroup: declaration.sourceGroup, name: declaration.name, line: declaration.declarationLine, reason: declaration.reason, effectiveResult: declaration.effectiveResult }),
    operation: declaration.operation,
    parentSchemaId: qualified.parentSchemaId,
    childSchemaId: qualified.childSchemaId,
    parentNode: declaration.parentNode,
    childNode: declaration.childNode,
    state: 'applied',
    deactivatedContributions: Object.freeze([
      Object.freeze({ sourceSchemaId: qualified.parentSchemaId, group: qualified.parentNode.group, category: qualified.parentNode.category, state: 'inactive', items: Object.freeze([...(qualified.parentContribution?.items || [])]), declarationName: declaration.name }),
      ...(qualified.suppressedGroups || []).map((group) => Object.freeze({ sourceSchemaId: qualified.parentSchemaId, group, category: 'ordinary-instance-field-group', state: 'inactive', items: Object.freeze([]), declarationName: declaration.name }))
    ]),
    replacementContribution: Object.freeze({ sourceSchemaId: qualified.childSchemaId, group: qualified.childNode.group, category: qualified.childNode.category, state: 'active', items: Object.freeze([...(qualified.childContribution?.items || [])]), declarationName: declaration.name })
  });
  return Object.freeze({ state: 'qualified', findings: Object.freeze([]), composition: Object.freeze(next), application });
}

function deactivateParentContribution(parent = {}, node = {}, suppressedGroups = new Set()) {
  const groups = (parent.validation?.groups || []).flatMap((group) => {
    if (suppressedGroups.has(String(group.name || ''))) return [];
    if (String(group.name || '') !== node.group) return [group];
    const categories = (group.categories || []).filter((category) => String(category.name || '') !== node.category);
    return [Object.freeze({ ...group, categories: Object.freeze(categories) })];
  });
  const declarationNames = new Set((parent.declarations || []).map((item) => String(item.group || '')));
  return Object.freeze({
    ...parent,
    validation: Object.freeze({
      ...parent.validation,
      groups: Object.freeze(groups),
      requiredSections: Object.freeze(requiredSectionsFromGroups(groups)),
      requiredHeadings: Object.freeze(requiredHeadingsFromGroups(groups)),
      optionalSections: Object.freeze(optionalSectionsFromGroups(groups)),
      requiredFields: Object.freeze(fieldsFromGroups(groups, declarationNames, 'Required Fields', true)),
      optionalFields: Object.freeze(fieldsFromGroups(groups, declarationNames, 'Optional Fields', false)),
      requiredEntries: Object.freeze((parent.validation?.requiredEntries || []).map((item) => Object.freeze({ ...item, targetHeadings: Object.freeze((item.targetHeadings || []).filter((heading) => !suppressedGroups.has(stripHeading(heading)))) })))
    })
  });
}

function exactCategoryMatch(groups = [], node = {}) {
  const groupMatches = (groups || []).filter((item) => String(item.name || '') === node.group);
  if (groupMatches.length !== 1) return Object.freeze({ state: 'unresolved', count: groupMatches.length, category: null });
  const categoryMatches = (groupMatches[0].categories || []).filter((item) => String(item.name || '') === node.category);
  return categoryMatches.length === 1 ? Object.freeze({ state: 'qualified', count: 1, category: categoryMatches[0] }) : Object.freeze({ state: 'unresolved', count: categoryMatches.length, category: null });
}
function exactSchemaIndexes(composition = [], schemaId = '') { return composition.map((item, index) => String(item?.schemaId || '') === schemaId ? index : -1).filter((index) => index >= 0); }
function parseContractNode(value = '') { const parts = String(value || '').split('/').map((item) => item.trim()).filter(Boolean); return parts.length === 3 && parts[0] === 'Schema Validation Contract' ? Object.freeze({ contract: parts[0], group: parts[1], category: parts[2] }) : null; }
function result(composition, state, declarations, applications, findings, corroborations) { return Object.freeze({ composition, resolution: Object.freeze({ schema: PORTABLE_SCHEMA_INHERITANCE_RESOLUTION_SCHEMA_ID, state, declarations: Object.freeze((declarations || []).map((item) => Object.freeze({ ...item }))), applications: Object.freeze(applications), corroborations: Object.freeze(corroborations), findings: Object.freeze(findings) }) }); }
function requiredSectionsFromGroups(groups = []) { return unique(groups.filter(unconditional).flatMap((group) => group.categories || []).flatMap((category) => structuralSections(category))); }
function requiredHeadingsFromGroups(groups = []) { const seen = new Set(); return groups.filter(unconditional).flatMap((group) => group.categories || []).filter((category) => ['Required Shape', 'Required Heading'].includes(String(category.name || ''))).flatMap((category) => headingRequirements(category.items || [])).filter((item) => { const key = headingKey(item.level, item.title); if (seen.has(key)) return false; seen.add(key); return true; }).map((item) => Object.freeze({ ...item, source: item.source || '' })); }
function optionalSectionsFromGroups(groups = []) { return unique(groups.flatMap((group) => group.categories || []).filter((category) => String(category.name || '') === 'Optional Sections').flatMap((category) => category.items || []).map(cleanSection)); }
function structuralSections(category = {}) { const name = String(category.name || ''); if (['Required Sections', 'Header Sections', 'Footer Sections', 'Required Heading'].includes(name)) return (category.items || []).map(cleanSection); if (name === 'Required Shape') return headingRequirements(category.items || []).map((item) => item.title); return []; }
function fieldsFromGroups(groups = [], declarationNames = new Set(), categoryName = '', unconditionalOnly = false) { return unique(groups.filter((group) => !declarationNames.has(String(group.name || '')) && (!unconditionalOnly || unconditional(group))).flatMap((group) => group.categories || []).filter((category) => String(category.name || '') === categoryName).flatMap((category) => category.items || []).map(cleanField)); }
function headingRequirements(items = []) { return items.flatMap((value) => { const text = String(value || ''); const quoted = [...text.matchAll(/`(#{1,6})\s+([^`]+)`/g)].map((match) => ({ level: match[1].length, title: match[2].trim(), source: text })); if (quoted.length) return quoted; const plain = text.match(/^(#{1,6})\s+(.+)$/); return plain ? [{ level: plain[1].length, title: plain[2].trim(), source: text }] : []; }); }
function unconditional(group = {}) { return !(group.requiredWhen || []).length; }
function cleanSection(value = '') { return stripHeading(String(value || '').trim().replace(/^`|`$/g, '').replace(/\s+section$/i, '')); }
function cleanField(value = '') { return String(value || '').trim().replace(/^`|`$/g, '').trim(); }
function stripHeading(value = '') { return String(value || '').replace(/^#{1,6}\s+/, '').trim(); }
function headingKey(level, title) { return `${Number(level || 0)}\u0000${String(title || '')}`; }
function unique(values = []) { return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))]; }
function label(declaration = {}) { return declaration.name || `${declaration.sourceSchemaId || '(unknown schema)'} declaration`; }
