import path from 'node:path';
import { buildArtifactCreationContract } from '../../../schemas/creation.contracts.js';
import { createPortableLocalDraft } from '../draft/draft.create.js';
import { portableFinding } from '../findings.js';

export function materializeLiveArtifact({ current, change, material, artifacts, findings, input, options }) {
  if (Object.prototype.hasOwnProperty.call(change, 'bodyMarkdown') && String(change.bodyMarkdown || '').trim()) {
    findings.push(portableFinding('error', 'live-lineage.body-markdown.blocked', 'Use schema-owned values and sections; raw Markdown replacement is blocked.', { artifactId: change.id }));
    return null;
  }
  const schemaId = clean(change.schemaId || current?.schemaId || '');
  const contract = buildArtifactCreationContract({ schemaId, transitionType: change.parentRef || current?.parentRef ? 'continue-from-record' : 'create-artifact' });
  if (contract.status !== 'ready') {
    findings.push(...(contract.findings || []).map((finding) => portableFinding(finding.severity, finding.code, finding.message, { ...finding, artifactId: change.id })));
    return null;
  }
  if (current && schemaId !== current.schemaId) {
    findings.push(portableFinding('error', 'live-lineage.schema-change.blocked', 'Create a new artifact to change schema.', { artifactId: change.id, before: current.schemaId, after: schemaId }));
    return null;
  }

  const requestedPath = change.path || current?.path || defaultArtifactPath(change.id, change.title || current?.title);
  const pathValue = normalizeArtifactPath(requestedPath);
  if (!pathValue) {
    findings.push(portableFinding('error', 'live-lineage.path.reserved-or-invalid', 'Artifact path is invalid or transport-reserved.', { artifactId: change.id, path: String(requestedPath || '') }));
    return null;
  }
  if (current && pathValue !== current.path) {
    findings.push(portableFinding('error', 'live-lineage.path-change.blocked', 'Path is immutable.', { artifactId: change.id, before: current.path, after: pathValue }));
    return null;
  }
  const parentRef = clean(change.parentRef || current?.parentRef || '');
  if (current && parentRef !== current.parentRef) {
    findings.push(portableFinding('error', 'live-lineage.parent-change.blocked', 'Parent cannot change; create a child or repair continuity.', { artifactId: change.id, before: current.parentRef, after: parentRef }));
    return null;
  }

  const parentRecord = resolveParentRecord(parentRef, material, artifacts, pathValue, findings);
  if (parentRef && !parentRecord) return null;
  const evidenceRefs = mergeStrings(current?.evidenceRefs, change.evidenceRefs);
  const knownEvidence = new Set([
    ...(input.state?.evidence || []).map((entry) => entry.id),
    clean(input.turn?.id),
    ...(material.files || []).map((file) => `loaded:${file.path}`),
    ...(material.records || []).map((record) => `loaded:${record.path}`)
  ].filter(Boolean));
  for (const ref of evidenceRefs) {
    if (!knownEvidence.has(ref) && !ref.startsWith('loaded:') && !ref.startsWith('dialogue:')) findings.push(portableFinding('error', 'live-lineage.evidence.unresolved', 'Evidence reference is not declared by dialogue or loaded material.', { artifactId: change.id, evidenceRef: ref }));
  }
  if (findings.some((finding) => finding.severity === 'error' && finding.artifactId === change.id)) return null;

  const values = mergeObjects(current?.values, change.values || change.valuesPatch);
  const sections = mergeObjects(current?.sections, change.sections || change.sectionsPatch);
  const title = clean(change.title || current?.title || change.id);
  const summary = clean(change.summary || current?.summary || title);
  const why = clean(change.why || change.rationale || current?.why || 'Maintained as live local Tiinex lineage.');
  const runtimeObservedAt = timestamp(input.runtimeObservedAt || runtimeTimestamp(options));
  const createdAt = current?.createdAt || runtimeObservedAt;
  const result = createPortableLocalDraft({
    ...material,
    schemaId,
    id: change.id,
    path: pathValue,
    title,
    summary,
    why,
    values,
    sections,
    createdAt,
    parentRecord: parentRecord || {},
    allowIncomplete: change.allowIncomplete !== false
  }, options);
  findings.push(...(result.findings || []).filter((finding) => finding.severity === 'error').map((finding) => portableFinding(finding.severity, finding.code, finding.message, { ...finding, artifactId: change.id })));
  if (!result.draft) return null;

  const revision = current ? current.revision + 1 : 1;
  const exportReady = result.validation?.status === 'clean';
  return freezeArtifact({
    id: change.id,
    schemaId,
    path: pathValue,
    parentRef,
    title,
    summary,
    why,
    values,
    sections,
    evidenceRefs,
    rationale: clean(change.rationale || current?.rationale || ''),
    status: exportReady ? 'live-clean' : 'live-incomplete',
    exportReady,
    revision,
    createdAt,
    updatedAt: runtimeObservedAt,
    draft: result.draft,
    validation: result.validation,
    qualification: result.qualification,
    changeRole: current?.changeRole || 'created',
    baseSha256: current?.baseSha256 || ''
  });
}

function resolveParentRecord(parentRef, material, artifacts, childPath, findings) {
  if (!parentRef) return null;
  if (parentRef.startsWith('live:')) {
    const id = parentRef.slice(5);
    const parent = artifacts.get(id);
    if (!parent || parent.status === 'withdrawn') {
      findings.push(portableFinding('error', 'live-lineage.parent.live-missing', 'Declared live Parent does not exist.', { parentRef }));
      return null;
    }
    return Object.freeze({
      id: parent.path,
      path: parent.path,
      schemaId: parent.schemaId,
      createdAt: parent.createdAt,
      continuationTrace: relativeTrace(childPath, parent.path),
      boundary: 'portable local artifact; no remote provenance',
      sourceMode: 'local-portable-live',
      source: null
    });
  }
  if (parentRef.startsWith('loaded:')) {
    const wanted = parentRef.slice(7);
    const records = (material.records || []).filter((record) => record.path === wanted || record.id === wanted);
    if (records.length !== 1) {
      findings.push(portableFinding('error', records.length ? 'live-lineage.parent.loaded-ambiguous' : 'live-lineage.parent.loaded-missing', records.length ? 'Declared loaded Parent is ambiguous.' : 'Loaded Parent is unavailable.', { parentRef, matches: records.length }));
      return null;
    }
    const record = records[0];
    return Object.freeze({
      id: record.id || record.path,
      path: record.path,
      schemaId: record.schemaId || record.kind,
      createdAt: record.currentCreatedAt || record.createdAt || '',
      continuationTrace: relativeTrace(childPath, record.path),
      boundary: record.boundary || record.source?.boundary || 'explicit loaded material boundary',
      sourceMode: record.sourceMode || '',
      source: null
    });
  }
  findings.push(portableFinding('error', 'live-lineage.parent.ref-invalid', 'Use live:<id> or loaded:<exact-path-or-id> for Parent.', { parentRef }));
  return null;
}

function freezeArtifact(value = {}) {
  return Object.freeze({
    ...value,
    id: clean(value.id), schemaId: clean(value.schemaId), path: normalizeArtifactPath(value.path || ''), parentRef: clean(value.parentRef), title: clean(value.title), summary: clean(value.summary), why: clean(value.why),
    values: Object.freeze(clone(value.values || {})), sections: Object.freeze(clone(value.sections || {})), evidenceRefs: Object.freeze(normalizeStrings(value.evidenceRefs)),
    revision: Math.max(1, Number(value.revision || 1)), status: clean(value.status || 'live-incomplete'), exportReady: value.exportReady === true,
    draft: value.draft ? Object.freeze({ ...value.draft }) : null, validation: value.validation ? Object.freeze({ ...value.validation }) : null, qualification: value.qualification ? Object.freeze({ ...value.qualification }) : null
  });
}
function defaultArtifactPath(id, title) { const stem = slug(id || title || 'topic'); return `.topics/${slug(title || id || 'lineage')}/${stem}.trace.md`; }
function normalizeArtifactPath(value) { const cleanPath = String(value || '').replace(/\\/g, '/').replace(/^\/+/, '').replace(/\.\.(?:\/|$)/g, '').trim(); if (!cleanPath) return ''; const withSuffix = cleanPath.toLowerCase().endsWith('.trace.md') ? cleanPath : cleanPath.replace(/\.md$/i, '') + '.trace.md'; return withSuffix.startsWith('.bootstrap/') || withSuffix === '.bootstrap' ? '' : withSuffix; }
function relativeTrace(childPath, parentPath) { const from = path.posix.dirname(childPath); return path.posix.relative(from === '.' ? '' : from, parentPath) || path.posix.basename(parentPath); }
function mergeObjects(before, patch) { return { ...clone(before || {}), ...clone(patch || {}) }; }
function mergeStrings(...values) { return normalizeStrings(values.flatMap((value) => normalizeArray(value))); }
function normalizeStrings(value) { return [...new Set(normalizeArray(value).map(clean).filter(Boolean))].sort(); }
function normalizeArray(value) { return Array.isArray(value) ? value : value == null ? [] : [value]; }
function clean(value) { return String(value || '').replace(/\s+/g, ' ').trim(); }
function slug(value) { return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'artifact'; }
function timestamp(value) { const text = String(value || '').trim(); return text || new Date().toISOString(); }
function runtimeTimestamp(options = {}) { const value = typeof options.clock === 'function' ? options.clock() : new Date().toISOString(); const date = value instanceof Date ? value : new Date(value); return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString(); }
function clone(value) { return value == null ? {} : JSON.parse(JSON.stringify(value)); }
