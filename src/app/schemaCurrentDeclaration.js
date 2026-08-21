import { parseSchemaReferenceValue } from '../schemas/schema.reference.js';

export const CURRENT_SCHEMA_DECLARATION_AUTHORITY_SCHEMA_ID = 'tiinex.site.current-schema-declaration-authority.v1';

export function qualifyRecordCurrentSchemaDeclaration(record = {}, requestedSchemaId = '') {
  let markdown;
  try { markdown = record?.markdown; }
  catch (exception) {
    return freezeResult({ state: 'unavailable', materialState: 'read-failed', reason: 'concrete-material-read-failed', requestedSchemaId, exception, occurrences: [] });
  }
  if (typeof markdown !== 'string' || !markdown.trim()) {
    return freezeResult({ state: 'unavailable', materialState: 'unavailable', reason: 'concrete-material-unavailable', requestedSchemaId, occurrences: [] });
  }
  return qualifyCurrentSchemaDeclarationMarkdown(markdown, requestedSchemaId);
}

export function qualifyCurrentSchemaDeclarationMarkdown(markdown = '', requestedSchemaId = '') {
  const text = String(markdown || '').replace(/\r\n?/g, '\n');
  if (!text.trim()) return freezeResult({ state: 'unavailable', materialState: 'unavailable', reason: 'concrete-material-unavailable', requestedSchemaId, occurrences: [] });
  const occurrences = collectCurrentSchemaOccurrences(text);
  if (occurrences.length === 0) return freezeResult({ state: 'unavailable', materialState: 'concrete', reason: 'current-schema-declaration-missing', requestedSchemaId, occurrences });
  if (occurrences.length > 1) return freezeResult({ state: 'ambiguous', materialState: 'concrete', reason: 'current-schema-declaration-ambiguous', requestedSchemaId, occurrences });

  const observed = parseSchemaReferenceValue(occurrences[0].raw);
  const schemaId = observed.schemaId;
  if (!schemaId) return freezeResult({ state: 'unavailable', materialState: 'concrete', reason: 'current-schema-declaration-invalid', requestedSchemaId, schemaId: '', target: '', observed, occurrences });
  if (requestedSchemaId && schemaId !== requestedSchemaId) {
    return freezeResult({ state: 'mismatch', materialState: 'concrete', reason: 'current-schema-declaration-identity-mismatch', requestedSchemaId, schemaId, target: observed.target || '', observed, occurrences });
  }
  return freezeResult({ state: 'qualified', materialState: 'concrete', reason: '', requestedSchemaId, schemaId, target: observed.target || '', observed, occurrences });
}

function collectCurrentSchemaOccurrences(markdown = '') {
  const envelope = String(markdown || '').split(/^---\s*$/m, 1)[0] || '';
  const lines = envelope.split('\n');
  const occurrences = [];
  let inCurrent = false;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^-\s+Current\s*$/u.test(line)) {
      inCurrent = true;
      continue;
    }
    if (/^-\s+\S/u.test(line)) {
      inCurrent = false;
      continue;
    }
    if (!inCurrent) continue;
    const match = line.match(/^\s+-\s*Current Schema:\s*(.*?)\s*$/u);
    if (!match) continue;
    occurrences.push(Object.freeze({ line: index + 1, raw: match[1] }));
  }
  return occurrences;
}

function freezeResult(value = {}) {
  const occurrences = Object.freeze([...(value.occurrences || [])]);
  return Object.freeze(Object.assign({
    schema: CURRENT_SCHEMA_DECLARATION_AUTHORITY_SCHEMA_ID,
    state: 'unavailable',
    materialState: 'unavailable',
    reason: '',
    requestedSchemaId: '',
    schemaId: '',
    target: '',
    observed: null,
    occurrences
  }, value, { occurrences }));
}
