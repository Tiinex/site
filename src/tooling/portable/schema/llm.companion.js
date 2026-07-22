import { portableFinding } from '../findings.js';

export const PORTABLE_LLM_SCHEMA_COMPANION_SCHEMA_ID = 'tiinex.llm.schema-companion.v1';

export function resolvePortableLlmCompanion({ schemaId = '', task = 'read', module = null, input = {}, options = {} } = {}) {
  const findings = [];
  const direct = input.llmCompanion || options.llmCompanion || null;
  const collection = input.llmCompanions || options.llmCompanions || null;
  const fromCollection = companionFromCollection(collection, schemaId);
  const materialResult = companionFromMaterial(input.materials || input, schemaId);
  findings.push(...materialResult.findings);
  const raw = direct || fromCollection || materialResult.companion || module?.llmCompanion || module?.llm || null;
  if (!raw) return Object.freeze({ companion: emptyCompanion(task), findings: Object.freeze(findings) });

  const declaredSchemaId = String(raw.schemaId || '').trim();
  if (declaredSchemaId && declaredSchemaId !== schemaId) {
    findings.push(portableFinding('error', 'portable.schema-guide.llm-companion.schema-mismatch', 'Schema-specific LLM companion does not match the requested schema.', {
      requestedSchemaId: schemaId,
      companionSchemaId: declaredSchemaId
    }));
  }

  const taskHints = raw.tasks?.[task] || raw[task] || {};
  const companion = Object.freeze({
    schema: String(raw.schema || PORTABLE_LLM_SCHEMA_COMPANION_SCHEMA_ID),
    schemaId: declaredSchemaId || schemaId,
    task,
    available: true,
    source: direct ? 'direct-request' : fromCollection ? 'supplied-collection' : materialResult.companion ? 'supplied-companion-data' : 'registered-schema-module',
    version: String(raw.version || taskHints.version || '1'),
    purpose: String(taskHints.purpose || raw.purpose || ''),
    authoringSteps: normalizeList(taskHints.authoringSteps || taskHints.steps || []),
    hardRules: normalizeList(taskHints.hardRules || taskHints.emphasis || raw.hardRules || []),
    questions: normalizeList(taskHints.questions || []),
    commonFailures: normalizeList(taskHints.commonFailures || []),
    prioritySections: normalizeList(taskHints.prioritySections || taskHints.readFirst || []),
    retrievalHints: normalizeList(taskHints.retrievalHints || taskHints.retrieve || [])
  });

  if (companion.schema !== PORTABLE_LLM_SCHEMA_COMPANION_SCHEMA_ID) {
    findings.push(portableFinding('warning', 'portable.schema-guide.llm-companion.schema-unknown', 'LLM companion uses an unrecognized companion schema id; hints were preserved but not treated as canonical rules.', {
      schemaId,
      companionSchema: companion.schema
    }));
  }

  return Object.freeze({ companion, findings: Object.freeze(findings) });
}

function companionFromMaterial(input = {}, schemaId = '') {
  const findings = [];
  const files = [
    ...(Array.isArray(input.files) ? input.files : []),
    ...(Array.isArray(input.records) ? input.records.map((record) => ({ path: record.path, content: record.markdown })) : [])
  ];
  const exactName = `${schemaId}.llm.json`.toLowerCase();
  const candidates = files.filter((file) => {
    const path = String(file?.path || file?.name || '').replace(/\\/g, '/').toLowerCase();
    return path.endsWith(exactName) || path.endsWith('.llm.json') || path.endsWith('.llm-companion.json');
  });
  for (const file of candidates) {
    const content = typeof file?.content === 'string' ? file.content : typeof file?.markdown === 'string' ? file.markdown : '';
    if (!content) continue;
    let parsed;
    try { parsed = JSON.parse(content); }
    catch (error) {
      findings.push(portableFinding('warning', 'portable.schema-guide.llm-companion.invalid-json', 'Supplied LLM companion data could not be parsed as JSON and was ignored.', {
        ref: file.path || file.name || '',
        detail: String(error?.message || error)
      }));
      continue;
    }
    if (String(parsed?.schemaId || '').trim() !== schemaId) continue;
    return Object.freeze({ companion: parsed, findings: Object.freeze(findings) });
  }
  return Object.freeze({ companion: null, findings: Object.freeze(findings) });
}

function companionFromCollection(collection, schemaId) {
  if (!collection) return null;
  if (Array.isArray(collection)) return collection.find((entry) => String(entry?.schemaId || '').trim() === schemaId) || null;
  if (collection instanceof Map) return collection.get(schemaId) || null;
  if (typeof collection === 'object') return collection[schemaId] || null;
  return null;
}

function emptyCompanion(task) {
  return Object.freeze({
    schema: PORTABLE_LLM_SCHEMA_COMPANION_SCHEMA_ID,
    schemaId: '',
    task,
    available: false,
    source: 'generic-compiler',
    version: 'generic',
    purpose: '',
    authoringSteps: Object.freeze([]),
    hardRules: Object.freeze([]),
    questions: Object.freeze([]),
    commonFailures: Object.freeze([]),
    prioritySections: Object.freeze([]),
    retrievalHints: Object.freeze([])
  });
}

function normalizeList(value) {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return Object.freeze([...new Set(list.map((item) => String(item || '').trim()).filter(Boolean))]);
}
