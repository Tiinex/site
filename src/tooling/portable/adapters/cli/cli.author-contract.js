import { schemaRegistry } from '../../../../schemas/registry.js';

export function publicAuthorSchemaBodyContract(schemaId = '') {
  const id = String(schemaId || '').trim();
  const module = schemaRegistry.byId.get(id) || null;
  const contract = module?.schemaSource?.runtimeProjection?.validationContract || null;
  const validation = contract?.validation || null;
  if (!id || !module || !validation) return Object.freeze({
    schema: 'tiinex.portable.author-schema-body-contract.v1',
    schemaId: id,
    status: 'unavailable',
    requiredHeadings: Object.freeze([]),
    ordinaryFields: Object.freeze([]),
    declarationEntries: Object.freeze([]),
    authority: 'unavailable'
  });

  const requiredHeadings = uniqueStrings((validation.requiredHeadings || [])
    .filter((entry) => Number(entry?.level || 0) === 2)
    .map((entry) => `## ${String(entry?.title || '').trim()}`));
  const ordinaryFields = uniqueObjects((validation.ordinaryGroups || [])
    .filter((group) => Number(group?.target?.level || 0) === 2 && Array.isArray(group?.requiredFields) && group.requiredFields.length)
    .map((group) => Object.freeze({
      heading: String(group?.target?.heading || `## ${group?.group || ''}`).trim(),
      fields: Object.freeze(uniqueStrings(group.requiredFields))
    })), (entry) => entry.heading);
  const declarationEntries = uniqueObjects((contract.declarations || [])
    .filter((entry) => (entry?.targetHeadings || []).some((heading) => /^##\s+/.test(String(heading || '').trim())) && Array.isArray(entry?.requiredFields) && entry.requiredFields.length)
    .map((entry) => Object.freeze({
      group: String(entry.group || '').trim(),
      headings: Object.freeze(uniqueStrings((entry.targetHeadings || []).filter((heading) => /^##\s+/.test(String(heading || '').trim())))),
      fields: Object.freeze(uniqueStrings(entry.requiredFields)),
      allowLiteralNone: Boolean(entry.allowLiteralNone)
    })), (entry) => `${entry.group}\0${entry.headings.join('\0')}`);

  return Object.freeze({
    schema: 'tiinex.portable.author-schema-body-contract.v1',
    schemaId: id,
    status: 'qualified',
    requiredHeadings: Object.freeze(requiredHeadings),
    ordinaryFields: Object.freeze(ordinaryFields),
    declarationEntries: Object.freeze(declarationEntries),
    authority: 'registered-schema-runtime-validation-contract'
  });
}

export function publicAuthorSchemaBodyContractHelpLines(schemaId = '') {
  const contract = publicAuthorSchemaBodyContract(schemaId);
  if (contract.status !== 'qualified') return [
    `Schema body contract — ${contract.schemaId || 'unknown schema'}`,
    '',
    'No registered schema runtime validation contract is available for this schema id. Authoring remains fail-closed.'
  ];
  const lines = [
    `Schema body contract — ${contract.schemaId}`,
    '',
    'Required body headings:'
  ];
  for (const heading of contract.requiredHeadings) lines.push(`- ${heading}`);
  if (contract.ordinaryFields.length) {
    lines.push('', 'Required ordinary fields:');
    for (const group of contract.ordinaryFields) lines.push(`- ${group.heading}: ${group.fields.join(', ')}`);
  }
  if (contract.declarationEntries.length) {
    lines.push('', 'Required fields for repeated declaration entries:');
    for (const entry of contract.declarationEntries) {
      const none = entry.allowLiteralNone ? ' (literal `none` is allowed only where the schema contract permits it)' : '';
      lines.push(`- ${entry.headings.join(' / ')} — each ${entry.group} entry: ${entry.fields.join(', ')}${none}`);
    }
  }
  lines.push('', 'This view is projected from the registered schema runtime validation contract; it does not replace or relax schema validation.');
  return lines;
}

function uniqueStrings(values = []) {
  return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))];
}

function uniqueObjects(values = [], keyFn = (value) => JSON.stringify(value)) {
  const out = [];
  const seen = new Set();
  for (const value of values) {
    const key = keyFn(value);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out;
}
