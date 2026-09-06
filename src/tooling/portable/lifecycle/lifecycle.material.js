import { resolveLineage } from '../../../lineage/lineage.resolve.js';
import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { auditPortableRecord } from '../audit/audit.capability.js';
import { normalizePortableInput } from '../input/portable.input.js';

const QUALIFIED_PARENT_STATUSES = new Set(['verified', 'resolved']);
const MAX_OBLIGATIONS = 64;

export function prepareLifecycleMaterial(input = {}, options = {}) {
  const material = normalizePortableInput(input.materials || input);
  const records = [...(material.records || [])];
  const index = recordIndex(records);
  const requested = String(input.controllingTask || input.task || options.controllingTask || '').trim();
  const taskResolution = resolveUniqueRecord(records, requested);
  const task = taskResolution.record;
  const auditCache = new Map();
  const qualification = task ? qualifyRecord(task, auditCache) : unresolvedQualification(taskResolution.state);
  const criteria = task ? taskCriteria(task) : Object.freeze({ state: 'unresolved', sections: Object.freeze([]), basis: '' });
  const lineage = resolveLineage(records, { depth: 'portable-lifecycle-readiness' });
  const automatic = task && qualification.state === 'qualified'
    ? directTaskObligations(task, records, lineage, auditCache)
    : [];
  const explicit = explicitWorkObligations(input.workObligations || input.obligations || [], records, auditCache);
  const obligations = dedupeObligations([...automatic, ...explicit]);
  const overflow = obligations.length > MAX_OBLIGATIONS;
  const bounded = obligations.slice(0, MAX_OBLIGATIONS);

  return Object.freeze({
    material,
    records: Object.freeze(records),
    index,
    auditCache,
    lineage,
    controllingTask: Object.freeze({
      requested,
      state: task && qualification.state === 'qualified' && criteria.state === 'qualified' ? 'qualified' : 'unresolved',
      resolutionState: taskResolution.state,
      record: task ? identity(task) : null,
      qualification,
      criteria
    }),
    obligations: Object.freeze(bounded),
    obligationsOmitted: overflow ? obligations.length - MAX_OBLIGATIONS : 0,
    lineageIssues: Object.freeze(relevantLineageIssues(lineage, new Set([task?.id, ...bounded.map((item) => item.task?.id)].filter(Boolean)))),
    findings: Object.freeze([...(material.findings || []), ...(lineage.findings || [])]),
    boundary: Object.freeze({
      automaticWorkScope: 'direct qualified tiinex.task.v1 Parent continuity only',
      typedWorkScope: 'explicit normalized workObligations whose semanticState is qualified; arbitrary Relation Type text is not interpreted here',
      currentness: 'not inferred from filenames, timestamps, Root Status, lexical lifecycleStatus/currentStatus, branch state, or file absence',
      maxObligations: MAX_OBLIGATIONS
    })
  });
}

export function qualifyRecord(record = {}, cache = new Map()) {
  const key = String(record.id || record.path || '');
  if (cache.has(key)) return cache.get(key);
  const audit = auditPortableRecord(record);
  const errors = (audit.findings || []).filter((item) => item.severity === 'error');
  const qualified = Boolean(record.hasContinuityContext && record.hasIntegrity && audit.qualification?.exact && !errors.length);
  const result = Object.freeze({
    state: qualified ? 'qualified' : 'unresolved',
    exact: qualified,
    schemaId: String(record.schemaId || ''),
    auditStatus: String(audit.status || ''),
    findingCodes: Object.freeze(errors.map((item) => String(item.code || '')).filter(Boolean))
  });
  cache.set(key, result);
  return result;
}

export function resolveFactRecord(material = {}, requested = '') {
  const resolution = resolveUniqueRecord(material.records || [], requested);
  if (!resolution.record) return Object.freeze({ state: resolution.state, record: null, qualification: unresolvedQualification(resolution.state) });
  return Object.freeze({ state: resolution.state, record: resolution.record, qualification: qualifyRecord(resolution.record, material.auditCache) });
}

function taskCriteria(record = {}) {
  let parsed;
  try { parsed = parseArtifactMarkdown(record.markdown || ''); } catch { return Object.freeze({ state: 'unresolved', sections: Object.freeze([]), basis: 'parse-failed' }); }
  const text = String(parsed.body?.text || '');
  const names = ['Done Criteria', 'Acceptance Criteria'];
  const sections = names.map((name) => ({ name, text: section(text, name) })).filter((item) => item.text);
  return Object.freeze({
    state: String(record.schemaId || '') === 'tiinex.task.v1' && sections.length ? 'qualified' : 'unresolved',
    sections: Object.freeze(sections.map((item) => Object.freeze({ name: item.name, text: compact(item.text, 360) }))),
    basis: sections.length ? 'qualified controlling Task criteria section(s)' : 'no Done Criteria or Acceptance Criteria section is available'
  });
}

function directTaskObligations(task, records, lineage, auditCache) {
  const byId = new Map(records.map((record) => [String(record.id || record.path || ''), record]));
  const out = [];
  for (const edge of lineage.edges || []) {
    if (edge.kind !== 'parent' || edge.from !== task.id || !edge.to) continue;
    const child = byId.get(String(edge.to));
    if (!child || String(child.schemaId || '') !== 'tiinex.task.v1') continue;
    const childQualification = qualifyRecord(child, auditCache);
    const edgeQualified = QUALIFIED_PARENT_STATUSES.has(String(edge.status || '')) && childQualification.state === 'qualified';
    out.push(Object.freeze({
      id: `task-continuity:${child.id}`,
      state: edgeQualified ? 'qualified' : 'unresolved',
      kind: 'task-continuity',
      task: identity(child),
      relation: Object.freeze({ kind: 'parent', state: edgeQualified ? 'qualified' : 'unresolved', status: String(edge.status || ''), from: String(edge.from || ''), to: String(edge.to || ''), target: String(edge.target || '') }),
      basis: 'direct qualified Task Parent continuity; Parent is not generalized beyond this Task-to-Task edge'
    }));
  }
  return out;
}

function explicitWorkObligations(values = [], records = [], auditCache = new Map()) {
  const list = Array.isArray(values) ? values : [];
  return list.map((value, index) => {
    const taskResolution = resolveUniqueRecord(records, value.task || value.path || value.source || '');
    const task = taskResolution.record;
    const taskQualification = task ? qualifyRecord(task, auditCache) : unresolvedQualification(taskResolution.state);
    const semanticState = String(value.semanticState || value.state || 'unresolved');
    const qualified = Boolean(task && taskQualification.state === 'qualified' && String(task.schemaId || '') === 'tiinex.task.v1' && semanticState === 'qualified' && nonEmptyBasis(value.basis));
    return Object.freeze({
      id: String(value.id || `explicit-work:${index + 1}:${task?.id || value.task || value.path || 'unresolved'}`),
      state: qualified ? 'qualified' : 'unresolved',
      kind: 'declared-typed-work',
      task: task ? identity(task) : Object.freeze({ id: '', path: String(value.task || value.path || ''), schemaId: '' }),
      relation: Object.freeze({ kind: 'declared-typed-work', state: qualified ? 'qualified' : 'unresolved', semanticState, predicate: String(value.predicate || value.relationType || ''), basis: compactBasis(value.basis) }),
      basis: qualified ? 'explicit upstream-qualified typed work/provenance semantic fact' : 'typed work/provenance meaning or target qualification is unresolved'
    });
  });
}

function dedupeObligations(values = []) {
  const byTask = new Map();
  for (const value of values) {
    const key = String(value.task?.id || value.task?.path || value.id || '');
    const current = byTask.get(key);
    if (!current || (current.state !== 'qualified' && value.state === 'qualified')) byTask.set(key, value);
  }
  return [...byTask.values()];
}

function relevantLineageIssues(lineage = {}, ids = new Set()) {
  const issues = [];
  for (const edge of lineage.edges || []) {
    if (edge.kind !== 'parent' || !ids.has(edge.to)) continue;
    if (!edge.from || ['missing', 'mismatch', 'ambiguous', 'degraded'].includes(String(edge.status || ''))) issues.push(Object.freeze({ code: `lineage.parent.${edge.status || 'missing'}`, nodeId: String(edge.to || ''), target: String(edge.target || ''), status: String(edge.status || '') }));
  }
  for (const finding of lineage.findings || []) {
    if (!ids.has(String(finding.nodeId || ''))) continue;
    if (/ambiguous|missing|mismatch|outOfBoundary/i.test(String(finding.code || ''))) issues.push(Object.freeze({ code: String(finding.code || ''), nodeId: String(finding.nodeId || ''), target: String(finding.target || ''), status: 'unresolved' }));
  }
  return uniqueBy(issues, (item) => `${item.code}|${item.nodeId}|${item.target}`);
}

function resolveUniqueRecord(records = [], requested = '') {
  const wanted = normalizePath(requested);
  if (!wanted) return { state: 'missing', record: null };
  const exact = records.filter((record) => normalizePath(record.path) === wanted || String(record.id || '') === requested);
  if (exact.length === 1) return { state: 'exact', record: exact[0] };
  if (exact.length > 1) return { state: 'ambiguous', record: null };
  const suffix = records.filter((record) => normalizePath(record.path).endsWith(`/${wanted}`));
  return suffix.length === 1 ? { state: 'suffix', record: suffix[0] } : { state: suffix.length > 1 ? 'ambiguous' : 'missing', record: null };
}

function recordIndex(records = []) { const map = new Map(); for (const record of records) map.set(String(record.id || record.path || ''), record); return map; }
function identity(record = {}) { return Object.freeze({ id: String(record.id || record.path || ''), path: String(record.path || ''), title: String(record.title || ''), schemaId: String(record.schemaId || '') }); }
function unresolvedQualification(reason = '') { return Object.freeze({ state: 'unresolved', exact: false, schemaId: '', auditStatus: '', findingCodes: Object.freeze(reason ? [String(reason)] : []) }); }
function section(text = '', name = '') { const e = escape(name); return String(text).match(new RegExp(`(?:^|\\n)##\\s+${e}\\s*\\r?\\n([\\s\\S]*?)(?=\\n##\\s+|$)`, 'i'))?.[1]?.trim() || ''; }
function compact(value = '', limit = 360) { const text = String(value || '').replace(/\s+/g, ' ').trim(); return text.length > limit ? `${text.slice(0, limit - 1).trimEnd()}…` : text; }
function compactBasis(value) { return Array.isArray(value) ? Object.freeze(value.map((item) => typeof item === 'string' ? compact(item, 180) : Object.freeze({ ...item })).slice(0, 8)) : typeof value === 'string' ? compact(value, 360) : value && typeof value === 'object' ? Object.freeze({ ...value }) : null; }
function nonEmptyBasis(value) { return Array.isArray(value) ? value.length > 0 : typeof value === 'string' ? Boolean(value.trim()) : Boolean(value && typeof value === 'object' && Object.keys(value).length); }
function normalizePath(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, '').trim(); }
function escape(value = '') { return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function uniqueBy(values, keyFn) { const seen = new Set(); return values.filter((value) => { const key = keyFn(value); if (seen.has(key)) return false; seen.add(key); return true; }); }
