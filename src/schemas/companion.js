import { parseArtifactMarkdown } from '../artifacts/artifact.parse.js';
import { schemaIdForRecord } from './schema.identity.js';
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
  const schemaId = schemaIdForRecord(record);
  return resolveSchemaModule({ schemaId }) || schemaRegistry.fallback;
}

export function schemaReadPresentation(record = {}, options = {}) {
  const parsed = parseRecordMarkdown(record);
  const schema = schemaIdForRecord(record, { markdown: record.markdown || parsed?.body?.text || '' }) || String(parsed?.envelope?.current?.schema?.id || '').trim();
  const exactCompanion = Boolean(schema && schemaRegistry.byId?.has(schema));
  const companion = companionForRecord({ ...record, schemaId: schema });
  const read = companion?.read || {};
  const sections = extractMarkdownSections(parsed.body?.text || record.markdown || '');
  const bodyAvailable = Boolean(String(record.markdown || parsed.body?.text || '').trim());
  const fallbackUsed = Boolean(schema && !exactCompanion);
  const readState = classifyReadState({ schema, companion, exactCompanion, fallbackUsed, bodyAvailable });
  const schemaCoverage = classifySchemaCoverage({ schema, exactCompanion, fallbackUsed });
  const bodyAvailability = bodyAvailable ? 'available' : 'unavailable-body';
  const picked = fallbackUsed
    ? rootFallbackReadSections({ parsed, record, schema, sections, options })
    : schemaOwnedReadSections({ parsed, record, schema, sections, read, options });
  const maxSections = Number(options.maxSections || 0);
  const visibleSections = maxSections > 0 ? picked.slice(0, maxSections) : picked;
  return {
    schema,
    companionId: companion?.id || 'tiinex.root.v1',
    contract: SCHEMA_COMPANION_CONTRACT_ID,
    label: fallbackUsed ? 'Root fallback' : (read.label || companion?.label || displaySchemaLabel(schema)),
    title: record.title || parsed.title || 'Untitled artifact',
    summary: record.summary || parsed.envelope?.current?.summary || '',
    sections: visibleSections,
    readMode: fallbackUsed ? 'root-fallback' : 'schema-owned',
    readState,
    schemaCoverage,
    bodyAvailability,
    fallbackUsed,
    exactCompanion
  };
}

export function classifyReadState({ schema = '', companion = null, exactCompanion = false, fallbackUsed = false, bodyAvailable = false } = {}) {
  if (!bodyAvailable) return 'unavailable-body';
  if (fallbackUsed) return 'root-fallback';
  if (exactCompanion && (companion?.id === 'tiinex.root.v1' || String(schema || '') === 'tiinex.root.v1')) return 'root-readable';
  if (exactCompanion) return 'schema-owned';
  return 'unknown-schema';
}

export function classifySchemaCoverage({ schema = '', exactCompanion = false, fallbackUsed = false } = {}) {
  if (!schema) return 'missing-schema';
  if (fallbackUsed || !exactCompanion) return 'unknown-schema';
  return 'exact-companion';
}

function schemaOwnedReadSections({ parsed, record, schema, sections, read, options }) {
  const wanted = Array.isArray(read.sections) && read.sections.length ? read.sections : DEFAULT_READ_SECTIONS;
  const picked = [];
  for (const label of wanted) {
    const value = sectionValueByName(sections, label);
    if (value) picked.push({ label: displaySectionLabel(label), value: trimReadValue(value, options) });
  }
  if (!picked.length) {
    for (const [label, value] of sections.entries()) {
      if (isEnvelopeSection(label)) continue;
      if (options.compact && isRedundantIdentitySection(label, value, record, read)) continue;
      if (picked.length >= (options.compact ? 2 : 5)) break;
      picked.push({ label: displaySectionLabel(label), value: trimReadValue(value, options) });
    }
  }
  if (!picked.length && parsed.body?.text) picked.push({ label: 'Artifact body', value: trimReadValue(stripEnvelopeSectionText(parsed.body.text), options) });
  return picked.filter((section) => String(section.value || '').trim());
}

function rootFallbackReadSections({ parsed, record, schema, sections, options }) {
  const envelope = parsed.envelope || {};
  const current = envelope.current || {};
  const parent = envelope.parent || {};
  const currentLines = compactLines([
    schema ? `Schema: ${schema}` : '',
    current.createdAt || record.currentCreatedAt ? `Created: ${current.createdAt || record.currentCreatedAt}` : '',
    current.status || record.lifecycleStatus || record.status ? `Status: ${current.status || record.lifecycleStatus || record.status}` : '',
    current.summary || record.summary ? `Summary: ${current.summary || record.summary}` : ''
  ]);
  const continuityLines = compactLines([
    parent.schema?.id || record.parentSchemaId ? `Parent schema: ${parent.schema?.id || record.parentSchemaId}` : '',
    parent.trace || record.trace ? `Trace: ${parent.trace || record.trace}` : '',
    parent.origin || record.origin ? `Origin: ${parent.origin || record.origin}` : '',
    parent.boundary || record.boundary ? `Boundary: ${parent.boundary || record.boundary}` : ''
  ]);
  const picked = [];
  if (currentLines) picked.push({ label: 'Fallback status', value: trimReadValue(`Root fallback preserves ${schema || 'this schema'} because no exact schema-owned read companion is registered yet.\n${currentLines}`, options) });
  if (continuityLines) picked.push({ label: 'Continuity', value: trimReadValue(continuityLines, options) });
  const bodySections = Array.from(sections.entries()).filter(([label, value]) => !isEnvelopeSection(label) && !isRedundantIdentitySection(label, value, record, {}));
  for (const [label, value] of bodySections) {
    if (picked.length >= (options.compact ? 2 : 5)) break;
    picked.push({ label: displaySectionLabel(label), value: trimReadValue(value, options) });
  }
  if (picked.length < (options.compact ? 2 : 5)) {
    const body = stripEnvelopeSectionText(parsed.body?.text || record.markdown || '');
    if (body && !picked.some((section) => section.value === body)) picked.push({ label: 'Readable body', value: trimReadValue(body, options) });
  }
  return picked.filter((section) => String(section.value || '').trim());
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
    schemaId: companion?.id || schemaIdForRecord(record),
    label: companion?.label || displaySchemaLabel(companion?.id || schemaIdForRecord(record)),
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

function isEnvelopeSection(label = '') {
  return /^(continuity context|continuity integrity)$/i.test(String(label || '').trim());
}

function compactLines(lines = []) {
  return lines.filter(Boolean).map((line) => `- ${line}`).join('\n');
}

function stripEnvelopeSectionText(text = '') {
  const sections = extractMarkdownSections(text);
  const kept = [];
  for (const [label, value] of sections.entries()) {
    if (isEnvelopeSection(label)) continue;
    if (!String(value || '').trim()) continue;
    kept.push(`## ${label}\n\n${value}`);
  }
  if (kept.length) return kept.join('\n\n');
  return String(text || '').replace(/^#\s+Continuity Context[\s\S]*?(?=^#\s+|\Z)/m, '').replace(/^#\s+Continuity Integrity[\s\S]*?(?=^#\s+|\Z)/m, '').trim();
}

function trimReadValue(value = '', options = {}) {
  const text = String(value || '').trim();
  const max = options.compact ? 520 : 1800;
  const clipped = text.length > max ? `${text.slice(0, max).trim()}\n…` : text;
  if (!options.lineClamp) return clipped;
  return clipped.split('\n').slice(0, options.compact ? 7 : 18).join('\n');
}

function isRedundantIdentitySection(label = '', value = '', record = {}, read = {}) {
  const normalized = normalizeSectionName(label);
  if (normalized === 'root') return true;
  const title = normalizeSectionName(record.title || '');
  const summary = normalizeSectionName(record.summary || '');
  const body = normalizeSectionName(value).slice(0, 240);
  if (title && body.startsWith(title) && summary && body.includes(summary.slice(0, 80))) return true;
  const redundant = new Set((Array.isArray(read?.redundantIdentitySections) ? read.redundantIdentitySections : []).map(normalizeSectionName));
  if (redundant.has(normalized)) return true;
  return false;
}
