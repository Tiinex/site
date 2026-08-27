import { runAudit } from '../../../audit/audit.run.js';
import { resolveLineage } from '../../../lineage/lineage.resolve.js';
import { LineageResolutionStatus } from '../../../lineage/lineage.model.js';
import { traverseLoadedLineage } from '../../../lineage/lineage.traverse.js';
import { normalizePortableInput } from '../input/portable.input.js';
import { portableFinding } from '../findings.js';
import { portableRuntimeValidationContractForSchema } from '../schema/qualifiedLocalRoot.runtime.js';

export const PORTABLE_LINEAGE_SEARCH_SCHEMA_ID = 'tiinex.portable.lineage-search.v1';

export function searchPortableLineage(input = {}, options = {}) {
  const material = normalizePortableInput(input.materials || input);
  const query = String(input.query ?? options.query ?? '').trim();
  const filters = normalizeFilters(input.filters || options.filters || legacyFilterInput(input));
  const resolved = resolveLineage(material.records, { depth: 'loaded-portable-search' });
  const scopedIds = resolveScopeIds(material.records, resolved, input, options);
  const relationIndex = buildRelationIndex(resolved);
  const audits = needsAudits(filters) ? new Map(material.records.map((record) => {
    const runtimeProjection = portableRuntimeValidationContractForSchema(record.schemaId || record.currentSchemaId || '');
    return [record.id, runAudit({ record, markdown: record.markdown, validationContractOverride: runtimeProjection.state === 'qualified' ? runtimeProjection.compiledContract : null })];
  })) : new Map();
  const candidates = material.records.filter((record) => !scopedIds || scopedIds.has(record.id));
  const matches = [];
  for (const record of candidates) {
    const node = resolved.nodes.find((item) => item.id === record.id) || {};
    const audit = audits.get(record.id) || null;
    const relation = relationIndex.get(record.id) || { root: false, leaf: false, parents: [], children: [] };
    if (!matchesFilters(record, node, audit, relation, filters)) continue;
    const score = queryScore(record, node, query, filters.searchFields);
    if (query && score <= 0) continue;
    matches.push(buildMatch(record, node, audit, relation, score, query, filters));
  }
  matches.sort((a, b) => b.score - a.score || a.path.localeCompare(b.path));
  const limited = matches.slice(filters.offset, filters.offset + filters.limit);
  const findings = [...material.findings];
  if (!query && !hasActiveFilters(filters)) findings.push(portableFinding('info', 'portable.lineage-search.unfiltered', 'No query or restrictive filter was supplied; all loaded lineage records are eligible.'));
  return Object.freeze({
    schema: PORTABLE_LINEAGE_SEARCH_SCHEMA_ID,
    boundary: Object.freeze({
      material: 'loaded-only',
      remoteFetch: false,
      inferredEdges: false,
      fullTextFields: Object.freeze(filters.searchFields)
    }),
    query,
    filters,
    scope: Object.freeze({
      mode: String(input.scope || options.scope || (scopedIds ? 'traversal' : 'all-loaded')),
      startIds: Object.freeze(normalizeList(input.startIds || input.startId || options.startIds || options.startId)),
      eligibleRecords: candidates.length
    }),
    matches: Object.freeze(limited),
    page: Object.freeze({ offset: filters.offset, limit: filters.limit, returned: limited.length, total: matches.length }),
    facets: buildFacets(matches),
    findings: Object.freeze(findings)
  });
}

function resolveScopeIds(records, resolved, input, options) {
  const startIds = normalizeList(input.startIds || input.startId || options.startIds || options.startId);
  const scope = String(input.scope || options.scope || '').toLowerCase();
  if (!startIds.length && !['ancestors', 'descendants', 'both', 'traversal'].includes(scope)) return null;
  if (!startIds.length) return null;
  const traversal = traverseLoadedLineage(records, {
    resolvedLineage: resolved,
    startIds,
    direction: scope === 'descendants' ? 'descendants' : scope === 'both' ? 'both' : 'ancestors',
    maxDepth: Number(input.maxDepth ?? options.maxDepth ?? 16)
  });
  return new Set((traversal.nodes || []).map((node) => node.id));
}

const TOPOLOGICAL_PARENT_EDGE_STATUSES = new Set([
  LineageResolutionStatus.resolved,
  LineageResolutionStatus.verified,
  LineageResolutionStatus.probable,
  LineageResolutionStatus.mismatch
]);

function buildRelationIndex(resolved = {}) {
  const map = new Map((resolved.nodes || []).map((node) => [node.id, { root: true, leaf: true, parents: [], children: [] }]));
  for (const edge of resolved.edges || []) {
    if (edge.kind !== 'parent' || !TOPOLOGICAL_PARENT_EDGE_STATUSES.has(edge.status) || !edge.from || !edge.to) continue;
    const parent = map.get(edge.from);
    const child = map.get(edge.to);
    if (parent && child) {
      parent.leaf = false;
      child.root = false;
      parent.children.push(edge.to);
      child.parents.push(edge.from);
    }
  }
  return map;
}

function matchesFilters(record, node, audit, relation, filters) {
  if (filters.schemaIds.length && !filters.schemaIds.includes(String(record.schemaId || node.schemaId || ''))) return false;
  if (filters.parentSchemaIds.length && !filters.parentSchemaIds.includes(String(record.parentSchemaId || node.parentSchemaId || ''))) return false;
  if (filters.sourceModes.length && !filters.sourceModes.includes(String(record.sourceMode || node.sourceMode || ''))) return false;
  if (filters.paths.length && !filters.paths.some((prefix) => String(record.path || '').toLowerCase().startsWith(prefix.toLowerCase()))) return false;
  if (filters.hasIntegrity !== null && Boolean(record.hasIntegrity ?? node.hasIntegrity) !== filters.hasIntegrity) return false;
  if (filters.hasContinuityContext !== null && Boolean(record.hasContinuityContext ?? node.hasContinuityContext) !== filters.hasContinuityContext) return false;
  if (filters.relation === 'root' && !relation.root) return false;
  if (filters.relation === 'leaf' && !relation.leaf) return false;
  if (filters.relation === 'intermediate' && (relation.root || relation.leaf)) return false;
  if (filters.findingSeverities.length) {
    const severities = new Set((audit?.findings || []).map((finding) => String(finding.severity || 'info')));
    if (!filters.findingSeverities.some((severity) => severities.has(severity))) return false;
  }
  if (filters.qualification.length) {
    const status = auditQualification(audit);
    if (!filters.qualification.includes(status)) return false;
  }
  return true;
}

function queryScore(record, node, query, fields) {
  if (!query) return 1;
  const tokens = tokenize(query);
  if (!tokens.length) return 1;
  const values = searchValues(record, node, fields);
  let score = 0;
  for (const token of tokens) {
    let best = 0;
    for (const entry of values) {
      if (!entry.value.includes(token)) continue;
      const exact = entry.value === token ? 3 : entry.value.startsWith(token) ? 2 : 1;
      best = Math.max(best, exact * entry.weight);
    }
    if (!best) return 0;
    score += best;
  }
  return score;
}

function searchValues(record, node, fields) {
  const enabled = new Set(fields);
  const values = [];
  const add = (field, value, weight) => {
    if (!enabled.has(field)) return;
    const normalized = normalizeText(value);
    if (normalized) values.push({ field, value: normalized, weight });
  };
  add('title', record.title || node.title, 8);
  add('summary', record.summary, 6);
  add('path', record.path || node.path, 5);
  add('schema', record.schemaId || node.schemaId, 5);
  add('body', record.markdown, 2);
  add('origin', record.origin || node.origin, 3);
  add('trace', record.trace || node.trace, 3);
  add('source', [record.sourceMode, record.source?.label, record.source?.path, record.source?.boundary].filter(Boolean).join(' '), 3);
  return values;
}

function buildMatch(record, node, audit, relation, score, query, filters) {
  return Object.freeze({
    id: record.id,
    path: record.path || '',
    title: record.title || node.title || record.id,
    summary: record.summary || '',
    schemaId: record.schemaId || node.schemaId || '',
    parentSchemaId: record.parentSchemaId || node.parentSchemaId || '',
    sourceMode: record.sourceMode || node.sourceMode || '',
    relation: Object.freeze({ root: relation.root, leaf: relation.leaf, parents: Object.freeze(relation.parents), children: Object.freeze(relation.children) }),
    integrity: Boolean(record.hasIntegrity ?? node.hasIntegrity),
    continuity: Boolean(record.hasContinuityContext ?? node.hasContinuityContext),
    qualification: audit ? auditQualification(audit) : 'not-evaluated',
    findingSummary: audit ? summarizeFindings(audit.findings || []) : null,
    score,
    snippet: buildSnippet(record, query, filters.snippetChars)
  });
}

function auditQualification(audit = null) {
  if (!audit) return 'not-evaluated';
  if (audit.resolution?.fallbackUsed) return 'fallback';
  if ((audit.findings || []).some((finding) => finding.code === 'audit.validator.unavailable')) return 'partial';
  return 'exact';
}

function buildSnippet(record, query, maxChars) {
  const source = String(record.summary || record.markdown || '').replace(/\s+/g, ' ').trim();
  if (!source) return '';
  const token = tokenize(query)[0] || '';
  const lower = source.toLowerCase();
  const index = token ? lower.indexOf(token) : 0;
  const start = Math.max(0, index - Math.floor(maxChars / 3));
  const snippet = source.slice(start, start + maxChars).trim();
  return `${start > 0 ? '…' : ''}${snippet}${start + maxChars < source.length ? '…' : ''}`;
}

function buildFacets(matches = []) {
  return Object.freeze({
    schemas: countBy(matches, (item) => item.schemaId || 'unknown'),
    sourceModes: countBy(matches, (item) => item.sourceMode || 'unknown'),
    relation: Object.freeze({
      roots: matches.filter((item) => item.relation.root).length,
      leaves: matches.filter((item) => item.relation.leaf).length,
      intermediate: matches.filter((item) => !item.relation.root && !item.relation.leaf).length
    }),
    qualification: countBy(matches, (item) => item.qualification)
  });
}

function countBy(items, keyFn) {
  const counts = {};
  for (const item of items) {
    const key = String(keyFn(item) || 'unknown');
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.freeze(Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b))));
}

function summarizeFindings(findings = []) {
  const counts = { error: 0, warning: 0, info: 0 };
  for (const finding of findings) counts[finding.severity === 'error' ? 'error' : finding.severity === 'warning' ? 'warning' : 'info'] += 1;
  return Object.freeze({ ...counts, total: counts.error + counts.warning + counts.info });
}

function legacyFilterInput(input = {}) {
  const materialPayloadPresent = Boolean(input.materials || input.markdown || input.files || input.records || input.assets);
  return Object.freeze({
    schemaIds: input.schemaIds || input.schemaId,
    parentSchemaIds: input.parentSchemaIds || input.parentSchemaId,
    sourceModes: input.sourceModes || (!materialPayloadPresent ? input.sourceMode : undefined),
    paths: input.paths || input.pathPrefix,
    relation: input.relation || input.lineageRole,
    hasIntegrity: input.hasIntegrity,
    hasContinuityContext: input.hasContinuityContext,
    findingSeverities: input.findingSeverities || input.findingSeverity,
    qualification: input.qualification,
    searchFields: input.searchFields,
    snippetChars: input.snippetChars,
    offset: input.offset,
    limit: input.limit
  });
}

function normalizeFilters(raw = {}) {
  return Object.freeze({
    schemaIds: Object.freeze(normalizeList(raw.schemaIds || raw.schemaId)),
    parentSchemaIds: Object.freeze(normalizeList(raw.parentSchemaIds || raw.parentSchemaId)),
    sourceModes: Object.freeze(normalizeList(raw.sourceModes || raw.sourceMode)),
    paths: Object.freeze(normalizeList(raw.paths || raw.pathPrefix)),
    relation: normalizeRelation(raw.relation || raw.lineageRole),
    hasIntegrity: normalizeBooleanFilter(raw.hasIntegrity),
    hasContinuityContext: normalizeBooleanFilter(raw.hasContinuityContext),
    findingSeverities: Object.freeze(normalizeList(raw.findingSeverities || raw.findingSeverity).map((value) => value.toLowerCase())),
    qualification: Object.freeze(normalizeList(raw.qualification).map((value) => value.toLowerCase())),
    searchFields: Object.freeze(normalizeSearchFields(raw.searchFields)),
    snippetChars: normalizeInteger(raw.snippetChars, 280, 80, 2000),
    offset: normalizeInteger(raw.offset, 0, 0, 100000),
    limit: normalizeInteger(raw.limit, 50, 1, 500)
  });
}

function normalizeSearchFields(value) {
  const allowed = new Set(['title', 'summary', 'path', 'schema', 'body', 'origin', 'trace', 'source']);
  const selected = normalizeList(value).filter((field) => allowed.has(field));
  return selected.length ? selected : ['title', 'summary', 'path', 'schema', 'body', 'origin', 'trace', 'source'];
}

function normalizeRelation(value = '') {
  const relation = String(value || '').toLowerCase();
  return ['root', 'leaf', 'intermediate'].includes(relation) ? relation : '';
}

function normalizeBooleanFilter(value) {
  if (value === true || value === false) return value;
  const normalized = String(value ?? '').toLowerCase();
  if (['true', 'yes', '1'].includes(normalized)) return true;
  if (['false', 'no', '0'].includes(normalized)) return false;
  return null;
}

function needsAudits(filters) {
  return filters.findingSeverities.length > 0 || filters.qualification.length > 0;
}

function hasActiveFilters(filters) {
  return Boolean(filters.schemaIds.length || filters.parentSchemaIds.length || filters.sourceModes.length || filters.paths.length || filters.relation || filters.hasIntegrity !== null || filters.hasContinuityContext !== null || filters.findingSeverities.length || filters.qualification.length);
}

function tokenize(value = '') {
  return normalizeText(value).split(' ').filter(Boolean);
}

function normalizeText(value = '') {
  return String(value || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9._:/-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeList(value) {
  const list = Array.isArray(value) ? value : value ? String(value).split(',') : [];
  return [...new Set(list.map((item) => String(item || '').trim()).filter(Boolean))];
}

function normalizeInteger(value, fallback, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(number)));
}
