import { posix } from 'node:path';
import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { relationValidate } from '../../../schemas/core/relation/tiinex.relation.v1.validate.js';
import { projectQualifiedWorkTargetContext } from './grounding.workContext.js';

const FAMILY = 'work-provenance';
const MAX_EDGES = 12;

export function projectWorkProvenance({ records = [], topology = {} } = {}) {
  const byPath = recordIndex(records);
  const edges = records.filter(isCandidate).map((record) => relationEdge(record, byPath)).filter(Boolean).slice(0, MAX_EDGES);
  const frontierPaths = new Set((topology.currentFrontier || []).map((item) => String(item.path || '')).filter(Boolean));
  const relevantPaths = new Set([
    ...(topology.relevantPaths || []),
    ...(topology.currentTasks || []).map((item) => String(item.path || '')),
    ...frontierPaths
  ].filter(Boolean));
  const exactQualified = edges.filter((edge) => edge.state === 'qualified' && frontierPaths.has(edge.source.resolvedPath));
  const lineageQualified = exactQualified.length ? [] : edges.filter((edge) => edge.state === 'qualified' && relevantPaths.has(edge.source.resolvedPath));
  const selected = exactQualified.length ? exactQualified : lineageQualified;
  const selectionState = exactQualified.length ? 'qualified' : lineageQualified.length ? 'qualified-relevant' : 'unresolved';
  const unresolved = [];

  if (!frontierPaths.size) unresolved.push(issue('organizational-work-provenance', 'current-work-anchor-unresolved', 'No current work frontier.'));
  else if (!selected.length) {
    const candidates = edges.filter((edge) => relevantPaths.has(edge.source.resolvedPath));
    unresolved.push(issue('organizational-work-provenance', 'organizational-work-provenance-unresolved', candidates.length ? 'Declared work-provenance material on the selected lineage exists, but source/target qualification is unresolved.' : 'No qualified declared edge on current lineage.'));
  } else {
    if (!selected.some((edge) => edge.context?.project?.state === 'qualified-carried')) unresolved.push(issue('project-context', 'project-context-unresolved', 'Qualified work provenance is available, but no explicit qualified project identity/context is recoverable from its target context.'));
    if (!selected.some((edge) => edge.context?.organization?.state === 'qualified-carried')) unresolved.push(issue('organization-context', 'organization-context-unresolved', 'Qualified work provenance is available, but no explicit qualified organization identity/context is recoverable from its target context.'));
  }

  if (!edges.length) return Object.freeze({
    state: 'unresolved',
    current: Object.freeze({ state: 'unresolved', sourceAnchors: Object.freeze([...frontierPaths]), relationSourceAnchors: Object.freeze([]), edges: Object.freeze([]) }),
    context: Object.freeze({ state: 'unresolved', items: Object.freeze([]) }),
    unresolved: Object.freeze(unresolved)
  });

  return Object.freeze({
    state: selectionState,
    current: Object.freeze({
      state: exactQualified.length ? 'qualified' : lineageQualified.length ? 'qualified-via-selected-lineage' : 'unresolved',
      sourceAnchors: Object.freeze([...frontierPaths]),
      relationSourceAnchors: Object.freeze(selected.map((edge) => edge.source.resolvedPath)),
      edges: Object.freeze(selected),
      basis: selected.length ? (exactQualified.length ? 'exact-qualified-frontier-source' : 'qualified-declared-relation-source-on-selected-parent-lineage') : 'unresolved'
    }),
    edges: Object.freeze(edges),
    reverseDiscovery: reverseIndex(edges.filter((edge) => edge.state === 'qualified')),
    context: contextProjection(selected, selectionState),
    unresolved: Object.freeze(unresolved),
    boundary: 'Declared qualified edges only; selected Parent lineage may establish relevance but never creates or redirects an edge; reverse discovery is the same edge.'
  });
}

function isCandidate(record = {}) {
  return String(record.schemaId || '') === 'tiinex.relation.v1' && field(section(record.markdown, 'Relation Declaration'), 'Relation Family').toLowerCase() === FAMILY;
}

function relationEdge(record, byPath) {
  const markdown = String(record.markdown || '');
  let parsed;
  try { parsed = parseArtifactMarkdown(markdown); } catch { return null; }
  const findings = relationValidate(parsed);
  const declaration = section(markdown, 'Relation Declaration');
  const sourceRef = reference(section(markdown, 'Relation Source'), 'Source');
  const targetRef = reference(section(markdown, 'Relation Target'), 'Target');
  const source = resolveReference(sourceRef, record.path, byPath);
  const target = resolveReference(targetRef, record.path, byPath);
  const contractQualified = Boolean(record.hasContinuityContext && record.hasIntegrity && !findings.some((item) => item.severity === 'error'));
  const state = contractQualified && source.state === 'qualified-carried' && target.state === 'qualified-carried' ? 'qualified' : 'unresolved';
  const context = target.state === 'qualified-carried'
    ? projectQualifiedWorkTargetContext(target, byPath)
    : Object.freeze({ state: 'unresolved', project: unresolvedContext('project-context-unresolved'), organization: unresolvedContext('organization-context-unresolved'), contexts: Object.freeze([]), boundary: 'Target context is unavailable until the declared relation target is qualified-carried.' });
  return Object.freeze({
    state,
    relationFamily: FAMILY,
    relationType: field(declaration, 'Relation Type'),
    direction: field(declaration, 'Relation Direction'),
    scope: field(declaration, 'Relation Scope'),
    source,
    target,
    context,
    basis: Object.freeze({ relationArtifact: String(record.path || ''), schemaId: String(record.schemaId || ''), contractState: contractQualified ? 'qualified-carried-contract' : 'unqualified', integrityPresent: Boolean(record.hasIntegrity) })
  });
}

function contextProjection(edges = [], state = 'unresolved') {
  return Object.freeze({
    state: edges.length ? (edges.every((edge) => edge.context?.state === 'qualified') ? 'qualified' : edges.some((edge) => edge.context?.state !== 'unresolved') ? 'qualified-partial' : 'unresolved') : 'unresolved',
    selectionState: state,
    items: Object.freeze(edges.map((edge) => Object.freeze({
      relationType: edge.relationType,
      targetPath: edge.target.resolvedPath,
      project: edge.context?.project || unresolvedContext('project-context-unresolved'),
      organization: edge.context?.organization || unresolvedContext('organization-context-unresolved'),
      basis: edge.basis
    }))),
    boundary: 'Project/organization context requires explicit qualified target context; names/paths/Parent/chat do not manufacture membership.'
  });
}

function resolveReference(ref = {}, ownerPath = '', byPath = new Map()) {
  const target = String(ref.target || '').trim();
  if (!target) return Object.freeze({ state: 'unresolved-missing-reference', label: ref.label || '', reference: '', resolvedPath: '' });
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(target)) return Object.freeze({ state: 'external-not-loaded', label: ref.label || '', reference: target, resolvedPath: '' });
  const path = resolvePath(target, ownerPath);
  if (!path) return Object.freeze({ state: 'unresolved-reference', label: ref.label || '', reference: target, resolvedPath: '' });
  const matches = byPath.get(path) || [];
  if (matches.length !== 1) return Object.freeze({ state: matches.length ? 'ambiguous-carried-target' : 'not-carried', label: ref.label || '', reference: target, resolvedPath: path });
  const record = matches[0];
  const qualified = Boolean(record.hasContinuityContext && record.hasIntegrity);
  return Object.freeze({ state: qualified ? 'qualified-carried' : 'present-unqualified', label: ref.label || record.title || '', reference: target, resolvedPath: path, title: String(record.title || ''), schemaId: String(record.schemaId || ''), summary: compact(record.summary || '', 180) });
}

function reverseIndex(edges = []) {
  const groups = new Map();
  for (const edge of edges) {
    const key = edge.target.resolvedPath;
    if (!groups.has(key)) groups.set(key, { target: edge.target, spawned: [] });
    groups.get(key).spawned.push(Object.freeze({ source: edge.source, relationType: edge.relationType, direction: edge.direction, scope: edge.scope, basis: edge.basis }));
  }
  return Object.freeze([...groups.values()].map((entry) => Object.freeze({ target: entry.target, spawned: Object.freeze(entry.spawned) })));
}

function recordIndex(records = []) {
  const map = new Map();
  for (const record of records) { const key = String(record.path || ''); if (!map.has(key)) map.set(key, []); map.get(key).push(record); }
  return map;
}

function resolvePath(reference = '', ownerPath = '') {
  const raw = String(reference || '').split('#')[0].trim();
  const cross = raw.match(/^([^:/\\]+)::(.+)$/);
  const candidate = cross ? `${cross[1]}/${cross[2].replace(/^\/+/, '')}` : raw.startsWith('/') ? raw.slice(1) : posix.join(posix.dirname(String(ownerPath || '')), raw);
  const normalized = posix.normalize(candidate).replace(/^\.\//, '');
  return !normalized || normalized === '..' || normalized.startsWith('../') ? '' : normalized;
}

function reference(markdown = '', label = '') {
  const raw = rawField(markdown, label);
  const link = raw.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
  return Object.freeze({ label: link ? strip(link[1]) : strip(raw), target: link ? link[2].trim() : strip(raw) });
}
function section(markdown = '', heading = '') { const e = escape(heading); return String(markdown || '').match(new RegExp(`(?:^|\\n)##\\s+${e}\\s*\\r?\\n([\\s\\S]*?)(?=\\n##\\s+|\\n#\\s+Continuity Integrity|$)`, 'i'))?.[1]?.trim() || ''; }
function rawField(markdown = '', label = '') { const e = escape(label); return String(markdown || '').match(new RegExp(`^\\s*-\\s+${e}:\\s*(.+)$`, 'mi'))?.[1]?.trim() || ''; }
function field(markdown = '', label = '') { return strip(rawField(markdown, label)); }
function strip(value = '') { return String(value || '').replace(/^\[([^\]]+)\]\([^)]+\)$/, '$1').replace(/[`*_]/g, '').trim(); }
function compact(value = '', limit = 180) { const text = strip(String(value || '').replace(/\s+/g, ' ')); return text.length > limit ? `${text.slice(0, limit - 1).trimEnd()}…` : text; }
function escape(value = '') { return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function issue(slot, code, detail) { return Object.freeze({ slot, state: 'unresolved', code, detail }); }
function unresolvedContext(code) { return Object.freeze({ state: 'unresolved', code, membershipClaim: false }); }
