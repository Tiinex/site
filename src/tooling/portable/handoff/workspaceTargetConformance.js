import { validatedC14nV2PrimarySelfDigest } from '../../../integrity/integrity.c14nV2.js';
import { qualifyTiinexRouteArtifact } from './routeArtifactConformance.js';

export const HANDOFF_WORKSPACE_TARGET_CONFORMANCE_SCHEMA_ID = 'tiinex.portable.handoff-workspace-target-conformance.v1';

export function qualifyHandoffWorkspaceTarget(input = {}) {
  const targetPath = normalizeInnerPath(input.targetPath || input.path || '');
  const markdown = decodeUtf8(input.targetData || input.data || new Uint8Array());
  if (!targetPath || !markdown) return blockedTarget(targetPath, ['workspace-target-artifact-unreadable']);
  let conformance;
  try {
    conformance = qualifyTiinexRouteArtifact({
      markdown,
      expectedSchemaId: 'tiinex.workspace.v1',
      requireExactContract: true,
      resolveParent: ({ parent, targetEntry }) => resolveWorkspaceParent({ entries: input.entries || [], targetPath, parent, targetEntry })
    });
  } catch (error) {
    return blockedTarget(targetPath, ['workspace-target-artifact-conformance-error'], String(error?.message || error || 'workspace-target-artifact-conformance-error'));
  }
  const reasons = conformanceReasons(conformance);
  const selfIntegrity = Object.freeze({
    state: String(conformance.selfIntegrity?.state || ''),
    value: String(conformance.selfIntegrity?.computedValue || conformance.selfIntegrity?.declaredValue || '')
  });
  return deepFreeze({
    schema: HANDOFF_WORKSPACE_TARGET_CONFORMANCE_SCHEMA_ID,
    state: reasons.length ? 'blocked' : 'qualified',
    targetPath,
    selfIntegrity,
    conformance,
    reasons: Object.freeze(reasons),
    boundary: 'Exact Workspace artifact bytes must qualify through the existing Root/registered-schema/self-integrity/Parent-target authority. Workspace filename, package placement, and matching stored descriptor state cannot create qualification.'
  });
}

function conformanceReasons(conformance = {}) {
  const reasons = [];
  if (String(conformance.observedSchemaId || '') !== 'tiinex.workspace.v1') reasons.push('workspace-target-schema-unqualified');
  const selfState = String(conformance.selfIntegrity?.state || '');
  if (selfState !== 'verified') reasons.push(selfState === 'mismatch' ? 'workspace-target-self-integrity-mismatch' : 'workspace-target-self-integrity-unverified');
  if (conformance.parentContinuity?.parentDeclared && String(conformance.parentContinuity?.state || '') !== 'qualified') reasons.push('workspace-target-parent-continuity-unqualified');
  if (String(conformance.status || '') !== 'qualified') reasons.push('workspace-target-artifact-conformance-unqualified');
  return [...new Set(reasons)];
}

function resolveWorkspaceParent({ entries = [], targetPath = '', parent = {}, targetEntry = {} } = {}) {
  const indexed = indexEntries(entries);
  const localCandidates = new Map();
  for (const reference of parentLocalReferences(parent)) {
    const resolvedPath = resolveRelativeReference(targetPath, reference);
    if (!resolvedPath) continue;
    const entry = indexed.get(resolvedPath);
    const markdown = entry ? decodeUtf8(entry.data) : '';
    if (!entry || !markdown) continue;
    localCandidates.set(resolvedPath, Object.freeze({ state: 'qualified', markdown, basis: 'workspace-parent-local-reference', workspaceRelativePath: resolvedPath, sha256: String(entry.sha256 || '') }));
  }
  if (localCandidates.size === 1) return [...localCandidates.values()][0];
  if (localCandidates.size > 1) return Object.freeze({ state: 'ambiguous', reason: 'multiple-parent-local-reference-candidates' });

  const expectedDigest = String(targetEntry?.value || '').trim();
  if (!expectedDigest) return Object.freeze({ state: 'unavailable', reason: 'parent-target-digest-missing' });
  const digestCandidates = new Map();
  for (const entry of indexed.values()) {
    const markdown = decodeUtf8(entry.data);
    if (!markdown) continue;
    const self = validatedC14nV2PrimarySelfDigest(markdown);
    if (self.state !== 'verified' || self.value !== expectedDigest) continue;
    digestCandidates.set(entry.path, Object.freeze({ state: 'qualified', markdown, basis: 'workspace-parent-target-digest-candidate', workspaceRelativePath: entry.path, sha256: String(entry.sha256 || '') }));
  }
  if (digestCandidates.size === 1) return [...digestCandidates.values()][0];
  if (digestCandidates.size > 1) return Object.freeze({ state: 'ambiguous', reason: 'multiple-parent-target-digest-candidates' });
  return Object.freeze({ state: 'unavailable', reason: 'parent-representation-not-carried' });
}

function indexEntries(entries = []) {
  const out = new Map();
  for (const raw of entries) {
    const entryPath = normalizeInnerPath(raw?.path || raw?.innerPath || '');
    if (!entryPath || out.has(entryPath)) continue;
    out.set(entryPath, Object.freeze({ ...raw, path: entryPath }));
  }
  return out;
}

function parentLocalReferences(parent = {}) {
  const out = [];
  if (parent.trace && !isExternalReference(parent.trace)) out.push(String(parent.trace));
  for (const entry of parent.originEntries || []) {
    if (String(entry?.label || '').trim() === 'relative' && entry?.target && !isExternalReference(entry.target)) out.push(String(entry.target));
  }
  return [...new Set(out)];
}

function resolveRelativeReference(fromPath = '', reference = '') {
  const base = normalizeInnerPath(fromPath);
  if (!base || !reference || isExternalReference(reference)) return '';
  let clean;
  try { clean = decodeURIComponent(String(reference).split('#')[0].split('?')[0]); } catch { return ''; }
  if (!clean || clean.startsWith('/') || clean.startsWith('\\') || /^[A-Za-z]:[\\/]/.test(clean)) return '';
  const parts = base.split('/').slice(0, -1);
  for (const part of clean.replace(/\\/g, '/').split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') { if (!parts.length) return ''; parts.pop(); continue; }
    if (/^[\u0000-\u001f]+$/.test(part)) return '';
    parts.push(part);
  }
  return normalizeInnerPath(parts.join('/'));
}

function normalizeInnerPath(value = '') {
  const raw = String(value || '');
  if (!raw || raw.includes('\u0000') || /[\u0000-\u001f]/.test(raw)) return '';
  const slashed = raw.replace(/\\/g, '/');
  if (slashed.startsWith('/') || slashed.startsWith('//') || /^[A-Za-z]:\//.test(slashed)) return '';
  const parts = [];
  for (const part of slashed.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') return '';
    parts.push(part);
  }
  return parts.join('/');
}

function blockedTarget(targetPath = '', reasons = [], error = '') {
  return deepFreeze({ schema: HANDOFF_WORKSPACE_TARGET_CONFORMANCE_SCHEMA_ID, state: 'blocked', targetPath, selfIntegrity: Object.freeze({ state: '', value: '' }), conformance: null, reasons: Object.freeze(reasons), error, boundary: 'Workspace target qualification failed closed before semantic binding.' });
}
function isExternalReference(value = '') { return /^[a-z][a-z0-9+.-]*:/i.test(String(value || '')) || String(value || '').startsWith('//'); }
function decodeUtf8(data) { try { return new TextDecoder('utf-8', { fatal: true }).decode(data); } catch { return ''; } }
function deepFreeze(value) { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value; for (const child of Object.values(value)) deepFreeze(child); return Object.freeze(value); }
