import { resolveFieldDomainShapeAuthoritiesAcrossChain } from './contract.machine-shape.js';

export function compileFieldShapeRequirements(document = {}) {
  const sourceSchemaId = String(document?.schemaId || '').trim();
  const out = [];
  for (const group of document?.validation?.groups || []) {
    const allowedShapes = unique(categoryItems(group, ['Allowed Shapes']).map(cleanToken));
    if (!allowedShapes.length) continue;
    let fields = unique(categoryItems(group, ['Fields']).map(cleanToken));
    if (!fields.length && /\s+Field$/u.test(String(group?.name || ''))) fields = [String(group.name).replace(/\s+Field$/u, '').trim()];
    if (!fields.length) continue;
    for (const field of fields) out.push(Object.freeze({ kind: 'field-shape', sourceSchemaId, group: String(group.name || ''), field, allowedShapes: Object.freeze(allowedShapes) }));
  }
  return Object.freeze(out);
}

export function resolveFieldShapeRequirements(requirements = [], compiledLineage = []) {
  if (!requirements.length) return Object.freeze([]);
  const faux = requirements.map((requirement) => Object.freeze({ ...requirement, kind: 'field-domain', policy: 'closed', allowedValues: Object.freeze([]) }));
  const resolved = resolveFieldDomainShapeAuthoritiesAcrossChain(faux, compiledLineage);
  return Object.freeze(resolved.map((item) => Object.freeze({
    kind: 'field-shape', sourceSchemaId: item.sourceSchemaId, group: item.group, field: item.field,
    allowedShapes: Object.freeze([...(item.allowedShapes || [])]),
    allowedShapeAuthorities: Object.freeze([...(item.allowedShapeAuthorities || [])])
  })));
}

function categoryItems(group = {}, names = []) {
  const wanted = new Set(names.map(exactToken));
  return (group.categories || []).flatMap((category) => wanted.has(exactToken(category.name)) ? category.items : []);
}
function cleanToken(value = '') { return String(value || '').trim().replace(/^`|`$/g, '').trim(); }
function exactToken(value = '') { return String(value || '').trim(); }
function unique(values = []) { return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))]; }
