import { buildArtifactCreationContract } from '../../../schemas/creation.contracts.js';
import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { createPortableLocalDraft } from '../draft/draft.create.js';
import { portableFinding } from '../findings.js';
import { projectPortableLoadedParentRecord, resolvePortableLoadedParentReference } from '../materialization/loaded.parent.js';
import { allocateContinuationPath, allocateRootArtifactPath } from '../../../transitions/record.transitions.js';

export function materializeLiveArtifact({ current, change, material, artifacts, findings, input, options }) {
  if (Object.prototype.hasOwnProperty.call(change, 'bodyMarkdown') && String(change.bodyMarkdown || '').trim()) {
    findings.push(portableFinding('error', 'live-lineage.body-markdown.blocked', 'Use schema-owned values and sections; raw Markdown replacement is blocked.', { artifactId: change.id }));
    return null;
  }
  const schemaId = clean(change.schemaId || current?.schemaId || '');
  const transitionType = change.parentRef || current?.parentRef ? 'continue-from-record' : 'create-artifact';
  const contract = buildArtifactCreationContract({ schemaId, transitionType });
  if (contract.status !== 'ready') {
    findings.push(...(contract.findings || []).map((finding) => portableFinding(finding.severity, finding.code, finding.message, { ...finding, artifactId: change.id })));
    return null;
  }
  if (current && schemaId !== current.schemaId) {
    findings.push(portableFinding('error', 'live-lineage.schema-change.blocked', 'Create a new artifact to change schema.', { artifactId: change.id, before: current.schemaId, after: schemaId }));
    return null;
  }

  const parentRef = exact(change.parentRef !== undefined ? change.parentRef : current?.parentRef || '');
  if (current && parentRef !== current.parentRef) {
    findings.push(portableFinding('error', 'live-lineage.parent-change.blocked', 'Parent cannot change; create a child or repair continuity.', { artifactId: change.id, before: current.parentRef, after: parentRef }));
    return null;
  }
  const parentRecord = resolveParentRecord(parentRef, material, artifacts, findings);
  if (parentRef && !parentRecord) return null;

  const explicitOrCurrentPath = change.path || current?.path || '';
  const allocationOptions = Object.freeze({
    existingPaths: Object.freeze([
      ...(material.records || []).map((record) => String(record?.path || '')),
      ...[...artifacts.values()].map((artifact) => String(artifact?.path || ''))
    ].filter(Boolean))
  });
  const allocatedPath = explicitOrCurrentPath || (parentRecord
    ? allocateContinuationPath({ parentRecord, targetId: schemaId, targetLabel: schemaId, title: change.title || current?.title || change.id }, allocationOptions).path
    : allocateRootArtifactPath({ targetId: schemaId, targetLabel: schemaId, title: change.title || current?.title || change.id }, allocationOptions).path);
  const requestedPath = explicitOrCurrentPath || allocatedPath;
  const pathValue = normalizeArtifactPath(requestedPath);
  if (!pathValue) {
    findings.push(portableFinding('error', 'live-lineage.path.reserved-or-invalid', 'Artifact path is invalid or transport-reserved.', { artifactId: change.id, path: String(requestedPath || '') }));
    return null;
  }
  if (current && pathValue !== current.path) {
    findings.push(portableFinding('error', 'live-lineage.path-change.blocked', 'Path is immutable.', { artifactId: change.id, before: current.path, after: pathValue }));
    return null;
  }
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
    schemaReferences: change.schemaReferences || input.schemaReferences || null,
    transitionType: contract.transitionType || transitionType,
    parentRecord: parentRecord || {},
    allowIncomplete: change.allowIncomplete !== false
  }, options);
  const creationErrors = (result.findings || []).filter((finding) => finding.severity === 'error');
  if (!result.draft) {
    findings.push(...creationErrors.map((finding) => portableFinding(finding.severity, finding.code, finding.message, { ...finding, artifactId: change.id })));
    return null;
  }
  const retainedLocalContinuity = result.status === 'created-local-continuity' && result.qualification?.localContinuityUsable === true;
  if (!retainedLocalContinuity) findings.push(...creationErrors.map((finding) => portableFinding(finding.severity, finding.code, finding.message, { ...finding, artifactId: change.id })));

  const revision = current ? current.revision + 1 : 1;
  const exportReady = result.status === 'created-clean' && result.qualification?.exactRuntimeValidation === true;
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

function resolveParentRecord(parentRef, material, artifacts, findings) {
  if (!parentRef) return null;
  if (parentRef.startsWith('live:')) {
    const id = parentRef.slice(5);
    const parent = artifacts.get(id);
    if (!parent || parent.status === 'withdrawn') {
      findings.push(portableFinding('error', 'live-lineage.parent.live-missing', 'Declared live Parent does not exist.', { parentRef }));
      return null;
    }
    const parsed = safeParse(parent.draft?.markdown || '');
    const currentSchema = parsed?.envelope?.current?.schema || {};
    return Object.freeze({
      id: parent.id,
      path: parent.path,
      schemaId: parent.schemaId,
      createdAt: parent.draft?.createdAt || parent.createdAt,
      continuationTrace: '',
      schemaReferenceAuthority: currentSchema.target ? Object.freeze({
        schemaId: currentSchema.id || parent.schemaId,
        preferredTarget: currentSchema.target,
        exactTargets: Object.freeze([currentSchema.target]),
        resolutionState: 'qualified',
        evidence: Object.freeze({ source: 'live-parent-rendered-current-schema-reference' })
      }) : null,
      boundary: 'portable local artifact; no remote provenance',
      sourceMode: 'local-portable-live',
      source: null,
      markdown: String(parent.draft?.markdown || ''),
      integrity: parsed?.integrity || null
    });
  }
  if (parentRef.startsWith('loaded:')) {
    const wanted = parentRef.slice(7);
    const resolved = resolvePortableLoadedParentReference(wanted, material.records || []);
    if (resolved.status !== 'resolved') {
      findings.push(portableFinding('error', resolved.status === 'ambiguous' ? 'live-lineage.parent.loaded-ambiguous' : 'live-lineage.parent.loaded-missing', resolved.status === 'ambiguous' ? 'Declared loaded Parent is ambiguous.' : 'Loaded Parent is unavailable.', { parentRef, matches: resolved.candidates.length }));
      return null;
    }
    return projectPortableLoadedParentRecord(resolved.record);
  }
  findings.push(portableFinding('error', 'live-lineage.parent.ref-invalid', 'Use live:<id> or loaded:<exact-path-or-id> for Parent.', { parentRef }));
  return null;
}

function safeParse(markdown = '') {
  try { return parseArtifactMarkdown(markdown); }
  catch { return null; }
}

function freezeArtifact(value = {}) {
  return Object.freeze({
    ...value,
    id: clean(value.id), schemaId: clean(value.schemaId), path: normalizeArtifactPath(value.path || ''), parentRef: exact(value.parentRef), title: clean(value.title), summary: clean(value.summary), why: clean(value.why),
    values: Object.freeze(clone(value.values || {})), sections: Object.freeze(clone(value.sections || {})), evidenceRefs: Object.freeze(normalizeStrings(value.evidenceRefs)),
    revision: Math.max(1, Number(value.revision || 1)), status: clean(value.status || 'live-incomplete'), exportReady: value.exportReady === true,
    draft: value.draft ? Object.freeze({ ...value.draft }) : null, validation: value.validation ? Object.freeze({ ...value.validation }) : null, qualification: value.qualification ? Object.freeze({ ...value.qualification }) : null
  });
}
function defaultArtifactPath(id, title) { const stem = slug(id || title || 'topic'); return `.topics/${slug(title || id || 'lineage')}/${stem}.trace.md`; }
function normalizeArtifactPath(value) { const cleanPath = String(value || '').replace(/\\/g, '/').replace(/^\/+/, '').replace(/\.\.(?:\/|$)/g, '').trim(); if (!cleanPath) return ''; const withSuffix = cleanPath.toLowerCase().endsWith('.trace.md') ? cleanPath : cleanPath.replace(/\.md$/i, '') + '.trace.md'; return withSuffix.startsWith('.bootstrap/') || withSuffix === '.bootstrap' ? '' : withSuffix; }
function mergeObjects(before, patch) { return { ...clone(before || {}), ...clone(patch || {}) }; }
function mergeStrings(...values) { return normalizeStrings(values.flatMap((value) => normalizeArray(value))); }
function normalizeStrings(value) { return [...new Set(normalizeArray(value).map(clean).filter(Boolean))].sort(); }
function normalizeArray(value) { return Array.isArray(value) ? value : value == null ? [] : [value]; }
function clean(value) { return String(value || '').replace(/\s+/g, ' ').trim(); }
function exact(value) { return String(value ?? ''); }
function slug(value) { return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'artifact'; }
function timestamp(value) { const text = String(value || '').trim(); return text || new Date().toISOString(); }
function runtimeTimestamp(options = {}) { const value = typeof options.clock === 'function' ? options.clock() : new Date().toISOString(); const date = value instanceof Date ? value : new Date(value); return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString(); }
function clone(value) { return value == null ? {} : JSON.parse(JSON.stringify(value)); }
