import { parseArtifactMarkdown } from '../artifacts/artifact.parse.js';
import { presentRecordActions, RecordActionKind } from '../actions/record.actions.js';
import { resolveSchemaModule, schemaRegistry } from './registry.js';

export const SCHEMA_COMPANION_CONTRACT_ID = 'tiinex.web.schema-companion.v1';

const DEFAULT_READ_SECTIONS = Object.freeze(['Artifact Body', 'Summary', 'Content']);
const DEFAULT_LINEAGE_ACTIONS = Object.freeze([
  RecordActionKind.open,
  RecordActionKind.markdown,
  RecordActionKind.continue,
  RecordActionKind.reference,
  RecordActionKind.source
]);

export function companionForRecord(record = {}) {
  const schemaId = recordSchemaId(record);
  return resolveSchemaModule({ schemaId }) || schemaRegistry.fallback;
}

export function schemaReadPresentation(record = {}, options = {}) {
  const parsed = parseRecordMarkdown(record);
  const schema = recordSchemaId(record, parsed);
  const companion = companionForRecord({ ...record, schemaId: schema });
  const read = companion?.read || {};
  const sections = extractMarkdownSections(parsed.body?.text || record.markdown || '');
  const wanted = Array.isArray(read.sections) && read.sections.length ? read.sections : DEFAULT_READ_SECTIONS;
  const picked = [];
  for (const label of wanted) {
    const value = sectionValueByName(sections, label);
    if (value) picked.push({ label: displaySectionLabel(label), value: trimReadValue(value, options) });
  }
  if (!picked.length) {
    for (const [label, value] of sections.entries()) {
      if (/^(continuity context|continuity integrity)$/i.test(label)) continue;
      if (options.compact && isRedundantIdentitySection(label, value, record, schema)) continue;
      if (picked.length >= (options.compact ? 2 : 5)) break;
      picked.push({ label: displaySectionLabel(label), value: trimReadValue(value, options) });
    }
  }
  if (!picked.length && parsed.body?.text) picked.push({ label: 'Artifact body', value: trimReadValue(parsed.body.text, options) });
  const maxSections = Number(options.maxSections || 0);
  const visibleSections = maxSections > 0 ? picked.slice(0, maxSections) : picked;
  return {
    schema,
    companionId: companion?.id || 'tiinex.root.v1',
    contract: SCHEMA_COMPANION_CONTRACT_ID,
    label: read.label || companion?.label || displaySchemaLabel(schema),
    title: record.title || parsed.title || 'Untitled artifact',
    summary: record.summary || parsed.envelope?.current?.summary || '',
    sections: visibleSections
  };
}

export function schemaReadSummaryItems(record = {}, limit = 2) {
  const presentation = schemaReadPresentation(record, { compact: true, lineClamp: true });
  return (presentation.sections || []).slice(0, limit).map((section) => ({
    label: section.label,
    value: trimReadValue(section.value, { compact: true }).replace(/\s+/g, ' ')
  })).filter((section) => section.value);
}

export function schemaLineageActions(record = {}, context = {}) {
  const companion = companionForRecord(record);
  const allowed = companion?.viewActions?.lineage || companion?.viewActions?.default || DEFAULT_LINEAGE_ACTIONS;
  const allowedSet = new Set(allowed);
  return presentRecordActions(record).filter((action) => {
    if (action.enabled === false) return false;
    if (!allowedSet.has(action.id)) return false;
    if (context.hideShare !== false && action.id === RecordActionKind.share) return false;
    return true;
  });
}

export function schemaCanonicalBinding(record = {}) {
  const companion = companionForRecord(record);
  const binding = companion?.binding || {};
  return {
    schemaId: companion?.id || recordSchemaId(record),
    label: companion?.label || displaySchemaLabel(companion?.id || recordSchemaId(record)),
    sourcePath: binding.sourcePath || '',
    permalink: binding.permalink || '',
    snapshot: binding.snapshot || '',
    originTrustRole: binding.originTrustRole || 'canonical-core'
  };
}

function parseRecordMarkdown(record = {}) {
  try { return parseArtifactMarkdown(record.markdown || ''); }
  catch (error) { return { title: record.title || '', envelope: {}, body: { text: record.markdown || '' } }; }
}

function recordSchemaId(record = {}, parsed = null) {
  return String(record.schemaId || record.currentSchemaId || record.kind || parsed?.envelope?.current?.schema?.id || '').trim();
}

function extractMarkdownSections(markdown = '') {
  const text = String(markdown || '').replace(/\r\n?/g, '\n').trim();
  const map = new Map();
  if (!text) return map;
  const lines = text.split('\n');
  let current = '';
  let buffer = [];
  const flush = () => {
    if (!current) return;
    const value = buffer.join('\n').trim();
    if (value) map.set(current, value);
  };
  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (match) {
      flush();
      current = match[2].trim();
      buffer = [];
    } else if (current) {
      buffer.push(line);
    }
  }
  flush();
  return map;
}

function sectionValueByName(sections = new Map(), label = '') {
  const exact = sections.get(label);
  if (exact) return exact;
  const wanted = normalizeSectionName(label);
  for (const [key, value] of sections.entries()) {
    if (normalizeSectionName(key) === wanted) return value;
  }
  return '';
}

function normalizeSectionName(value = '') {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function displaySectionLabel(label = '') {
  return String(label || '').replace(/\s+/g, ' ').trim().toUpperCase();
}

function displaySchemaLabel(schemaId = '') {
  return String(schemaId || 'artifact').replace(/^tiinex\./, '').replace(/\.v\d+$/, '').replace(/[._-]+/g, ' ');
}

function trimReadValue(value = '', options = {}) {
  const text = String(value || '').trim();
  const max = options.compact ? 520 : 1800;
  const clipped = text.length > max ? `${text.slice(0, max).trim()}\n…` : text;
  if (!options.lineClamp) return clipped;
  return clipped.split('\n').slice(0, options.compact ? 7 : 18).join('\n');
}

function isRedundantIdentitySection(label = '', value = '', record = {}, schema = '') {
  const normalized = normalizeSectionName(label);
  if (normalized === 'root') return true;
  const title = normalizeSectionName(record.title || '');
  const summary = normalizeSectionName(record.summary || '');
  const body = normalizeSectionName(value).slice(0, 240);
  if (title && body.startsWith(title) && summary && body.includes(summary.slice(0, 80))) return true;
  if (schema === 'tiinex.topic.v1' && normalized === 'topic') return true;
  if (schema === 'tiinex.evidence.v1' && normalized === 'evidence') return true;
  return false;
}
