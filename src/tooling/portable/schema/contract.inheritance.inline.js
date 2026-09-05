export const INLINE_INHERITANCE_OVERRIDE_CATEGORY = 'Inheritance Overrides';
export const INLINE_INHERITANCE_OVERRIDE_REQUIRED_FIELDS = Object.freeze(['Merge Operation', 'Parent Schema', 'Parent Node', 'Child Node']);
export const INLINE_INHERITANCE_OVERRIDE_OPTIONAL_FIELDS = Object.freeze(['Reason', 'Effective Result']);

export function compileInlineSchemaInheritanceOverrides(document = {}) {
  const sourceSchemaId = String(document?.schemaId || '').trim();
  const declarations = [];
  const findings = [];
  const seenNames = new Set();

  for (const group of document?.validation?.groups || []) {
    const categories = (group?.categories || []).filter((category) => exact(category?.name) === INLINE_INHERITANCE_OVERRIDE_CATEGORY);
    if (categories.length > 1) findings.push(`Inheritance Overrides category appears ${categories.length} times in contract group ${group?.name || '(unnamed)'}.`);
    for (const category of categories) {
      if (!(category?.nodes || []).length) findings.push(`Inheritance Overrides in contract group ${group?.name || '(unnamed)'} must contain at least one Named Declaration.`);
      for (const node of category?.nodes || []) {
        const parsed = parseOverrideDeclaration(node, { sourceSchemaId, sourceGroup: String(group?.name || '') });
        if (seenNames.has(parsed.name)) findings.push(`Inheritance Overrides declaration name is duplicated in ${sourceSchemaId || '(unknown schema)'}: ${parsed.name || '(unnamed)'}.`);
        seenNames.add(parsed.name);
        findings.push(...parsed.findings);
        declarations.push(parsed.declaration);
      }
    }
  }

  return Object.freeze({
    schema: 'tiinex.portable.inline-schema-inheritance-overrides.v1',
    sourceSchemaId,
    state: findings.length ? 'unresolved' : declarations.length ? 'declared' : 'not-declared',
    declarations: Object.freeze(declarations),
    findings: Object.freeze(findings)
  });
}

export function qualifyInlineInheritanceOverrideAuthority(rootCompiled = null) {
  const findings = [];
  if (!rootCompiled || String(rootCompiled.schemaId || '') !== 'tiinex.root.v1') return blockedAuthority('Compiled Root contract is unavailable for inline inheritance override authority.');
  const syntax = exactGroups(rootCompiled?.validation?.groups || [], 'Contract Syntax');
  if (syntax.length !== 1) findings.push(`Root Contract Syntax resolves to ${syntax.length} groups.`);
  const known = syntax.length === 1 ? exactCategories(syntax[0], 'Known Category Labels') : [];
  if (known.length !== 1) findings.push(`Root Known Category Labels resolves to ${known.length} categories.`);
  if (known.length === 1 && !(known[0].items || []).some((item) => exact(item) === INLINE_INHERITANCE_OVERRIDE_CATEGORY)) findings.push('Root Known Category Labels does not declare Inheritance Overrides.');

  const groups = exactGroups(rootCompiled?.validation?.groups || [], INLINE_INHERITANCE_OVERRIDE_CATEGORY);
  if (groups.length !== 1) findings.push(`Root Inheritance Overrides authority resolves to ${groups.length} groups.`);
  if (groups.length === 1) {
    const group = groups[0];
    const entryShape = categoryItems(group, 'Entry Shape');
    const required = categoryItems(group, 'Required Fields');
    const optional = categoryItems(group, 'Optional Fields');
    if (!entryShape.includes('Named Declaration')) findings.push('Root Inheritance Overrides authority does not declare Entry Shape: Named Declaration.');
    for (const field of INLINE_INHERITANCE_OVERRIDE_REQUIRED_FIELDS) if (!required.includes(field)) findings.push(`Root Inheritance Overrides authority is missing Required Field: ${field}.`);
    for (const field of INLINE_INHERITANCE_OVERRIDE_OPTIONAL_FIELDS) if (!optional.includes(field)) findings.push(`Root Inheritance Overrides authority is missing Optional Field: ${field}.`);
  }
  return Object.freeze({ state: findings.length ? 'unresolved' : 'qualified', findings: Object.freeze(findings) });
}

function parseOverrideDeclaration(node = {}, context = {}) {
  const name = exact(node?.value);
  const findings = [];
  const fields = {};
  if (!name || /^.+:\s*/.test(name)) findings.push('Inheritance Overrides declaration must have one exact non-field declaration name.');
  if (!(node?.children || []).length) findings.push(`Inheritance Overrides declaration ${name || '(unnamed)'} has no declaration fields.`);
  for (const child of node?.children || []) {
    if ((child?.children || []).length) findings.push(`Inheritance Overrides declaration ${name || '(unnamed)'} field nesting must be exactly one level.`);
    const parsed = parseField(child?.value);
    if (!parsed) {
      findings.push(`Inheritance Overrides declaration ${name || '(unnamed)'} contains malformed field: ${exact(child?.value) || '(empty)'}.`);
      continue;
    }
    if (Object.prototype.hasOwnProperty.call(fields, parsed.field)) findings.push(`Inheritance Overrides declaration ${name || '(unnamed)'} duplicates field ${parsed.field}.`);
    fields[parsed.field] = parsed.value;
  }
  const allowed = new Set([...INLINE_INHERITANCE_OVERRIDE_REQUIRED_FIELDS, ...INLINE_INHERITANCE_OVERRIDE_OPTIONAL_FIELDS]);
  for (const field of Object.keys(fields)) if (!allowed.has(field)) findings.push(`Inheritance Overrides declaration ${name || '(unnamed)'} uses undeclared field ${field}.`);
  for (const field of INLINE_INHERITANCE_OVERRIDE_REQUIRED_FIELDS) if (!exact(fields[field])) findings.push(`Inheritance Overrides declaration ${name || '(unnamed)'} is missing ${field}.`);

  const declaration = Object.freeze({
    name,
    sourceSchemaId: context.sourceSchemaId,
    sourceGroup: context.sourceGroup,
    declarationLine: Number(node?.line || 0),
    operation: exact(fields['Merge Operation']),
    parentSchemaId: exact(fields['Parent Schema']),
    parentNode: exact(fields['Parent Node']),
    childNode: exact(fields['Child Node']),
    reason: exact(fields.Reason),
    effectiveResult: exact(fields['Effective Result'])
  });
  return Object.freeze({ declaration, findings: Object.freeze(findings) });
}

function parseField(value = '') {
  const match = String(value || '').match(/^([^:]+):\s*(.*?)\s*$/);
  if (!match) return null;
  return { field: exact(match[1]), value: exact(match[2]) };
}

function exactGroups(groups = [], name = '') { return (groups || []).filter((group) => exact(group?.name) === exact(name)); }
function exactCategories(group = {}, name = '') { return (group?.categories || []).filter((category) => exact(category?.name) === exact(name)); }
function categoryItems(group = {}, name = '') { return exactCategories(group, name).flatMap((category) => (category?.items || []).map(exact)); }
function exact(value = '') { return String(value || '').trim(); }
function blockedAuthority(message) { return Object.freeze({ state: 'unresolved', findings: Object.freeze([message]) }); }
