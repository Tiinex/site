import { packageFileBytes, sha256Hex, utf8Bytes } from '../../../export/package.bytes.js';
import { inspectStoredWorkspaceArchiveBytes } from './workspaceByteProvider.archive.js';
import { qualifyHandoffWorkspaceTarget } from './workspaceTargetConformance.js';

export const HANDOFF_WORKSPACE_BYTE_PROVIDER_SCHEMA_ID = 'tiinex.portable.handoff-workspace-byte-provider.v1';
export const HANDOFF_WORKSPACE_ARCHIVE_BINDING_SCHEMA_ID = 'tiinex.transport.handoff-workspace-archive-binding.v1';
export const HANDOFF_WORKSPACE_ARCHIVE_PROVIDER_KIND = 'package-local-stored-zip-v1';
export const HANDOFF_WORKSPACE_ARCHIVE_CODEC = 'zip-store-v1';
export const HANDOFF_WORKSPACE_INNER_PATH_NORMALIZATION = 'tiinex.workspace-inner-path.v1';

export function buildHandoffWorkspaceByteProvider(bundle = {}, descriptor = {}) {
  const workspaceItems = descriptor.workspaceMaterializations || [];
  const archiveBindings = descriptor.workspaceArchiveBindings || [];
  const workspaceCounts = countBy(workspaceItems, (item) => String(item.id || ''));
  const bindingCounts = countBy(archiveBindings, (item) => String(item.workspaceId || ''));
  const workspaces = [];
  const findings = [];

  for (const workspace of workspaceItems) {
    const id = String(workspace.id || '');
    if (!id) {
      const provider = blockedWorkspace(workspace, 'exploded', ['workspace-id-unresolved']);
      workspaces.push(provider);
      findings.push(providerFinding(provider, 'workspace-id-unresolved'));
      continue;
    }
    if ((workspaceCounts.get(id) || 0) !== 1) {
      const provider = blockedWorkspace(workspace, 'exploded', ['workspace-id-ambiguous'], 'ambiguous');
      workspaces.push(provider);
      findings.push(providerFinding(provider, 'workspace-id-ambiguous'));
      continue;
    }
    const matchingBindings = archiveBindings.filter((item) => String(item.workspaceId || '') === id);
    let provider;
    if (matchingBindings.length === 1) provider = qualifyArchiveWorkspace(bundle, workspace, matchingBindings[0]);
    else if (matchingBindings.length > 1 || (bindingCounts.get(id) || 0) > 1) provider = blockedWorkspace(workspace, 'archive', ['workspace-archive-binding-ambiguous'], 'ambiguous');
    else provider = qualifyExplodedWorkspace(bundle, workspace);
    workspaces.push(provider);
    for (const reason of provider.reasons || []) findings.push(providerFinding(provider, reason));
  }

  for (const binding of archiveBindings) {
    const id = String(binding.workspaceId || '');
    if (!id || !workspaceItems.some((workspace) => String(workspace.id || '') === id)) {
      findings.push(finding('error', 'portable.handoff-workspace-provider.archive-binding.unbound', 'Workspace/archive binding does not resolve to exactly one descriptor workspace.', { workspaceId: id }));
    }
  }

  const status = workspaces.length > 0 && workspaces.every((workspace) => workspace.state === 'qualified') && !findings.some((item) => item.severity === 'error') ? 'ready' : 'blocked';
  return deepFreeze({
    schema: HANDOFF_WORKSPACE_BYTE_PROVIDER_SCHEMA_ID,
    status,
    workspaces: Object.freeze(workspaces),
    findings: Object.freeze(dedupeFindings(findings)),
    boundary: 'Package-local manufacture/material-closure byte provider. Its tiinex.transport.handoff-workspace-archive-binding.v1 descriptor is mechanical transport evidence, not recipient semantic provider authority. Recipient-v2 archive activation separately requires a qualified tiinex.workspace.representation.v1 binding plus its explicit External Payload and exact payload bytes; filename, placement, declaration order, UI state, and path similarity have no semantic authority.'
  });
}

export function handoffWorkspaceProviderForId(provider = {}, workspaceId = '') {
  const matches = (provider.workspaces || []).filter((workspace) => String(workspace.id || '') === String(workspaceId || ''));
  if (matches.length === 1) return matches[0];
  return deepFreeze({ state: matches.length > 1 ? 'ambiguous' : 'unresolved', id: String(workspaceId || ''), mode: '', entries: Object.freeze([]), reasons: Object.freeze([matches.length > 1 ? 'workspace-id-ambiguous' : 'workspace-id-unresolved']) });
}

export function listHandoffWorkspaceEntries(provider = {}, workspaceId = '') {
  const workspace = handoffWorkspaceProviderForId(provider, workspaceId);
  return workspace.state === 'qualified' ? workspace.entries || Object.freeze([]) : Object.freeze([]);
}

export function resolveHandoffWorkspaceEntry(provider = {}, workspaceId = '', innerPath = '') {
  const workspace = handoffWorkspaceProviderForId(provider, workspaceId);
  if (workspace.state !== 'qualified') return deepFreeze({ state: workspace.state || 'blocked', reason: (workspace.reasons || [])[0] || 'workspace-provider-unqualified' });
  const normalized = normalizeHandoffWorkspaceInnerPath(innerPath);
  if (normalized.state !== 'qualified') return deepFreeze({ state: 'blocked', reason: normalized.reason || 'workspace-inner-path-unsafe' });
  const matches = (workspace.entries || []).filter((entry) => entry.path === normalized.path);
  if (matches.length !== 1) return deepFreeze({ state: matches.length > 1 ? 'ambiguous' : 'unresolved', reason: matches.length > 1 ? 'workspace-inner-path-ambiguous' : 'workspace-inner-path-unresolved', workspaceId: workspace.id, workspaceRelativePath: normalized.path });
  const entry = matches[0];
  return deepFreeze({
    state: 'qualified',
    kind: workspace.mode === 'archive' ? 'workspace-archive-entry' : 'workspace-material',
    providerMode: workspace.mode,
    workspaceId: workspace.id,
    workspaceRelativePath: entry.path,
    packagePath: String(entry.packagePath || workspace.archive?.packagePath || ''),
    archivePackagePath: String(entry.archivePackagePath || workspace.archive?.packagePath || ''),
    innerPath: String(entry.innerPath || entry.path || ''),
    bytes: Number(entry.bytes || 0),
    sha256: String(entry.sha256 || ''),
    data: entry.data,
    referenceTarget: String(entry.referenceTarget || '')
  });
}

export function normalizeHandoffWorkspaceInnerPath(value = '') {
  const raw = String(value || '');
  if (!raw || raw.includes('\u0000') || /[\u0000-\u001f]/.test(raw)) return Object.freeze({ state: 'invalid', path: '', reason: 'workspace-inner-path-unsafe' });
  const slashed = raw.replace(/\\/g, '/');
  if (slashed.startsWith('/') || slashed.startsWith('//') || /^[A-Za-z]:\//.test(slashed)) return Object.freeze({ state: 'invalid', path: '', reason: 'workspace-inner-path-unsafe' });
  const parts = [];
  for (const part of slashed.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') return Object.freeze({ state: 'invalid', path: '', reason: 'workspace-inner-path-traversal' });
    parts.push(part);
  }
  if (!parts.length) return Object.freeze({ state: 'invalid', path: '', reason: 'workspace-inner-path-unsafe' });
  return Object.freeze({ state: 'qualified', path: parts.join('/'), reason: '' });
}

export function inspectStoredWorkspaceArchive(bytesInput = new Uint8Array(), options = {}) { return inspectStoredWorkspaceArchiveBytes(bytesInput, normalizeHandoffWorkspaceInnerPath, options); }

function qualifyExplodedWorkspace(bundle, workspace) {
  const reasons = [];
  if (String(workspace.qualification || '') !== 'qualified') reasons.push('workspace-qualification-unqualified');
  if (String(workspace.correlationStatus || '') !== 'qualified') reasons.push('workspace-correlation-unqualified');
  const entries = [];
  const seen = new Set();
  for (const declared of workspace.includedEntries || []) {
    const normalized = normalizeHandoffWorkspaceInnerPath(declared.path || '');
    if (normalized.state !== 'qualified') { reasons.push(normalized.reason || 'workspace-inner-path-unsafe'); continue; }
    if (seen.has(normalized.path)) { reasons.push('workspace-inner-path-duplicate'); continue; }
    seen.add(normalized.path);
    const packagePath = String(declared.packagePath || '');
    const matches = (bundle.files || []).filter((file) => String(file.path || '') === packagePath);
    if (!packagePath || matches.length !== 1) { reasons.push(matches.length > 1 ? 'workspace-package-path-ambiguous' : 'workspace-package-path-unresolved'); continue; }
    const data = packageFileBytes(matches[0]);
    if (Number(declared.bytes || 0) !== data.byteLength) reasons.push('workspace-byte-count-mismatch');
    if (String(declared.sha256 || '') !== sha256Hex(data)) reasons.push('workspace-byte-digest-mismatch');
    entries.push(deepFreeze({ path: normalized.path, packagePath, innerPath: normalized.path, bytes: data.byteLength, sha256: sha256Hex(data), referenceTarget: String(declared.referenceTarget || ''), data }));
  }
  return deepFreeze({
    state: reasons.length ? 'blocked' : 'qualified',
    id: String(workspace.id || ''),
    title: String(workspace.title || workspace.id || ''),
    mode: 'exploded',
    materialization: workspace,
    entries: Object.freeze(entries),
    workspaceTarget: null,
    archive: null,
    reasons: Object.freeze([...new Set(reasons)]),
    authority: Object.freeze({ locatorAuthority: false, filenameAuthority: false, packagePlacementAuthority: false })
  });
}

function qualifyArchiveWorkspace(bundle, workspace, binding = {}) {
  const reasons = [];
  if (String(binding.schema || '') !== HANDOFF_WORKSPACE_ARCHIVE_BINDING_SCHEMA_ID) reasons.push('workspace-archive-binding-schema-invalid');
  if (String(binding.workspaceId || '') !== String(workspace.id || '')) reasons.push('workspace-archive-binding-workspace-id-mismatch');
  if (String(binding.transportCorrelationKey || '') !== String(workspace.transportCorrelationKey || '')) reasons.push('workspace-archive-binding-stale');
  const coverage = String(workspace.materialization || '') === 'bounded' ? 'bounded' : String(workspace.materialization || '') === 'complete' ? 'complete' : '';
  const coverageEvidence = coverage === 'bounded' ? (workspace.scopeEvidence || {}) : (workspace.completenessEvidence || {});
  if (!coverage || String(workspace.qualification || '') !== 'qualified' || String(coverageEvidence.state || '') !== 'qualified') reasons.push(coverage === 'bounded' ? 'workspace-archive-bounded-scope-unqualified' : 'workspace-archive-completeness-unqualified');
  const expectedRepresentationKind = coverage === 'bounded' ? 'bounded-workspace-snapshot' : 'complete-workspace-snapshot';
  if (String(binding.coverage || coverage) !== coverage || String(binding.representation?.kind || '') !== expectedRepresentationKind) reasons.push('workspace-archive-representation-kind-invalid');
  if (String(binding.provider?.kind || '') !== HANDOFF_WORKSPACE_ARCHIVE_PROVIDER_KIND || String(binding.provider?.state || '') !== 'ready') reasons.push('workspace-archive-provider-unavailable');
  if (String(binding.representation?.codec || '') !== HANDOFF_WORKSPACE_ARCHIVE_CODEC || String(binding.representation?.mediaType || '') !== 'application/zip') reasons.push('workspace-archive-decoder-unavailable');
  if (String(binding.entryMap?.normalization || '') !== HANDOFF_WORKSPACE_INNER_PATH_NORMALIZATION) reasons.push('workspace-archive-normalization-unqualified');

  const targetPath = String(binding.workspaceTarget?.packagePath || '');
  const targetFiles = (bundle.files || []).filter((file) => String(file.path || '') === targetPath);
  const targetData = targetFiles.length === 1 ? packageFileBytes(targetFiles[0]) : new Uint8Array();
  if (!targetPath || targetFiles.length !== 1) reasons.push(targetFiles.length > 1 ? 'workspace-target-ambiguous' : 'workspace-target-unresolvable');
  if (targetData.byteLength) {
    if (Number(binding.workspaceTarget?.bytes || 0) !== targetData.byteLength) reasons.push('workspace-target-byte-count-mismatch');
    if (String(binding.workspaceTarget?.sha256 || '') !== sha256Hex(targetData)) reasons.push('workspace-target-digest-mismatch');
  }
  if (String(binding.workspaceTarget?.schema || '') !== 'tiinex.workspace.v1') reasons.push('workspace-target-schema-binding-invalid');

  const archivePath = String(binding.representation?.packagePath || '');
  const archiveFiles = (bundle.files || []).filter((file) => String(file.path || '') === archivePath);
  const archiveData = archiveFiles.length === 1 ? packageFileBytes(archiveFiles[0]) : new Uint8Array();
  if (!archivePath || archiveFiles.length !== 1) reasons.push(archiveFiles.length > 1 ? 'workspace-archive-locator-ambiguous' : 'workspace-archive-locator-unresolved');
  if (archiveData.byteLength) {
    if (Number(binding.representation?.bytes || 0) !== archiveData.byteLength) reasons.push('workspace-archive-byte-count-mismatch');
    if (String(binding.representation?.digest?.method || '') !== 'sha256') reasons.push('workspace-archive-digest-method-invalid');
    if (String(binding.representation?.digest?.value || '') !== sha256Hex(archiveData)) reasons.push('workspace-archive-digest-mismatch');
    if (String(binding.representation?.digest?.target || '') !== 'archive-bytes-as-carried') reasons.push('workspace-archive-digest-target-invalid');
  }

  const parsedArchive = archiveData.byteLength ? inspectStoredWorkspaceArchive(archiveData, { ownedBytes: true }) : deepFreeze({ state: 'invalid', entries: Object.freeze([]), findings: Object.freeze([]) });
  if (archiveData.byteLength && parsedArchive.state !== 'qualified') reasons.push(...parsedArchive.findings.map((item) => archiveFindingReason(item.code)));
  const declaredEntries = normalizeBindingEntries(binding.entryMap?.entries || [], reasons);
  if (Number(binding.entryMap?.count || 0) !== declaredEntries.length) reasons.push('workspace-archive-entry-map-count-mismatch');
  if (!sameEntryIdentitySet(declaredEntries, parsedArchive.entries || [])) reasons.push('workspace-archive-entry-map-mismatch');
  if (!sameEntryIdentitySet(declaredEntries, workspace.includedEntries || [])) reasons.push('workspace-archive-binding-stale');

  const bindingEvidence = coverage === 'bounded' ? (binding.scope || {}) : (binding.completeness || {});
  if (String(bindingEvidence.state || '') !== 'qualified') reasons.push(coverage === 'bounded' ? 'workspace-archive-bounded-scope-unqualified' : 'workspace-archive-completeness-unqualified');
  if (Number(bindingEvidence.entryCount || 0) !== declaredEntries.length) reasons.push(coverage === 'bounded' ? 'workspace-archive-bounded-scope-entry-count-mismatch' : 'workspace-archive-completeness-entry-count-mismatch');
  const totalBytes = declaredEntries.reduce((sum, entry) => sum + Number(entry.bytes || 0), 0);
  if (Number(bindingEvidence.totalBytes || 0) !== totalBytes) reasons.push(coverage === 'bounded' ? 'workspace-archive-bounded-scope-byte-count-mismatch' : 'workspace-archive-completeness-byte-count-mismatch');
  if (String(bindingEvidence.entriesFingerprint || '') && String(bindingEvidence.entriesFingerprint || '') !== entrySetFingerprint(declaredEntries)) reasons.push(coverage === 'bounded' ? 'workspace-archive-bounded-scope-fingerprint-mismatch' : 'workspace-archive-completeness-fingerprint-mismatch');
  if (String(coverageEvidence.entriesFingerprint || '') && String(coverageEvidence.entriesFingerprint) !== entrySetFingerprint(declaredEntries)) reasons.push(coverage === 'bounded' ? 'workspace-archive-bounded-scope-evidence-stale' : 'workspace-archive-completeness-evidence-stale');
  if (Number(coverageEvidence.entryCount || declaredEntries.length) !== declaredEntries.length) reasons.push(coverage === 'bounded' ? 'workspace-archive-bounded-scope-evidence-stale' : 'workspace-archive-completeness-evidence-stale');
  if (Number(coverageEvidence.totalBytes || totalBytes) !== totalBytes) reasons.push(coverage === 'bounded' ? 'workspace-archive-bounded-scope-evidence-stale' : 'workspace-archive-completeness-evidence-stale');
  if (coverage === 'bounded') {
    if (String(binding.selection?.rule || '') !== 'explicit-binding-per-bounded-scope') reasons.push('workspace-archive-bounded-selection-unqualified');
    if (String(bindingEvidence.scopeBasis || '') !== 'exact-representation-entry-set' || String(bindingEvidence.includedEntryAuthority || '') !== 'qualified-decoded-entry-set' || String(bindingEvidence.omittedEntryMeaning || '') !== 'outside-representation-not-absent-from-workspace' || String(bindingEvidence.sourceMembershipClaim || '') !== 'represented-entries-are-workspace-relative-source-bytes' || String(bindingEvidence.recoveryClosureBoundary || '') !== 'separate-qualified-closure') reasons.push('workspace-archive-bounded-scope-unqualified');
  }

  const targetInner = normalizeHandoffWorkspaceInnerPath(binding.workspaceTarget?.innerPath || '');
  if (targetInner.state !== 'qualified') reasons.push('workspace-target-inner-path-unqualified');
  const parsedByPath = new Map((parsedArchive.entries || []).map((entry) => [entry.path, entry]));
  const targetArchiveEntry = targetInner.state === 'qualified' ? parsedByPath.get(targetInner.path) : null;
  if (!targetArchiveEntry) reasons.push('workspace-target-archive-entry-unresolved');
  else if (targetData.byteLength && (targetArchiveEntry.bytes !== targetData.byteLength || targetArchiveEntry.sha256 !== sha256Hex(targetData))) reasons.push('workspace-target-archive-entry-mismatch');

  if (targetData.byteLength && targetInner.state === 'qualified') {
    const targetQualification = qualifyHandoffWorkspaceTarget({ targetPath: targetInner.path, targetData, entries: parsedArchive.entries || [] });
    if (targetQualification.state !== 'qualified') reasons.push(...(targetQualification.reasons || ['workspace-target-artifact-conformance-unqualified']));
    const declaredSelfState = String(binding.workspaceTarget?.selfIntegrity?.state || '');
    if (declaredSelfState !== 'verified') reasons.push('workspace-target-self-integrity-descriptor-unverified');
    if (declaredSelfState && declaredSelfState !== String(targetQualification.selfIntegrity?.state || '')) reasons.push('workspace-target-self-integrity-stale');
    if (declaredSelfState === 'verified' && String(binding.workspaceTarget?.selfIntegrity?.value || '') !== String(targetQualification.selfIntegrity?.value || '')) reasons.push('workspace-target-self-integrity-mismatch');
  }

  const declaredByPath = new Map(declaredEntries.map((entry) => [entry.path, entry]));
  const runtimeEntries = (parsedArchive.entries || []).map((entry) => {
    const declared = declaredByPath.get(entry.path) || {};
    return deepFreeze({ path: entry.path, innerPath: entry.path, archivePackagePath: archivePath, packagePath: archivePath, bytes: entry.bytes, sha256: entry.sha256, referenceTarget: String(declared.referenceTarget || ''), data: entry.data });
  });
  return deepFreeze({
    state: reasons.length ? (reasons.includes('workspace-target-ambiguous') || reasons.includes('workspace-archive-locator-ambiguous') ? 'ambiguous' : 'blocked') : 'qualified',
    id: String(workspace.id || ''),
    title: String(workspace.title || workspace.id || ''),
    mode: 'archive',
    materialization: workspace,
    entries: Object.freeze(runtimeEntries),
    workspaceTarget: deepFreeze({ ...(binding.workspaceTarget || {}), data: targetData }),
    archive: deepFreeze({ ...(binding.representation || {}), data: archiveData }),
    binding,
    reasons: Object.freeze([...new Set(reasons)]),
    authority: Object.freeze({ locatorAuthority: false, filenameAuthority: false, packagePlacementAuthority: false, bindingAuthority: 'manufacture-material-closure-transport-evidence-only', recipientSemanticActivationAuthority: false })
  });
}

function normalizeBindingEntries(entries = [], reasons = []) {
  const out = [];
  const seen = new Set();
  for (const entry of entries) {
    const normalized = normalizeHandoffWorkspaceInnerPath(entry.path || entry.innerPath || '');
    if (normalized.state !== 'qualified') { reasons.push(normalized.reason || 'workspace-inner-path-unsafe'); continue; }
    if (seen.has(normalized.path)) { reasons.push('workspace-inner-path-duplicate'); continue; }
    seen.add(normalized.path);
    const bytes = Number(entry.bytes || 0);
    const sha256 = String(entry.sha256 || '');
    if (bytes < 0 || !/^[0-9a-f]{64}$/i.test(sha256)) reasons.push('workspace-archive-entry-map-identity-invalid');
    out.push(deepFreeze({ path: normalized.path, bytes, sha256: sha256.toLowerCase(), referenceTarget: String(entry.referenceTarget || '') }));
  }
  return out.sort((a, b) => a.path.localeCompare(b.path));
}

function sameEntryIdentitySet(a = [], b = []) {
  const left = normalizeEntryIdentitySet(a);
  const right = normalizeEntryIdentitySet(b);
  return stableJson(left) === stableJson(right);
}
function normalizeEntryIdentitySet(entries = []) {
  return entries.map((entry) => ({ path: String(entry.path || entry.innerPath || ''), bytes: Number(entry.bytes || 0), sha256: String(entry.sha256 || '').toLowerCase(), referenceTarget: String(entry.referenceTarget || '') })).sort((a, b) => a.path.localeCompare(b.path));
}
function entrySetFingerprint(entries = []) { return sha256Hex(utf8Bytes(stableJson(normalizeEntryIdentitySet(entries)))); }
function blockedWorkspace(workspace = {}, mode = '', reasons = [], state = 'blocked') { return deepFreeze({ state, id: String(workspace.id || ''), title: String(workspace.title || workspace.id || ''), mode, materialization: workspace, entries: Object.freeze([]), workspaceTarget: null, archive: null, reasons: Object.freeze(reasons), authority: Object.freeze({ locatorAuthority: false, filenameAuthority: false, packagePlacementAuthority: false }) }); }
function providerFinding(provider = {}, reason = '') { return finding('error', `portable.handoff-workspace-provider.${String(reason || 'unqualified').replace(/[^a-z0-9.-]+/gi, '-')}`, 'Workspace byte provider could not qualify exact workspace bytes.', { workspaceId: String(provider.id || ''), mode: String(provider.mode || ''), reason }); }
function archiveFindingReason(code = '') { const suffix = String(code || '').split('.').pop() || 'archive-invalid'; return `workspace-archive-${suffix}`; }
function countBy(items = [], keyFn) { const out = new Map(); for (const item of items) { const key = keyFn(item); if (key) out.set(key, (out.get(key) || 0) + 1); } return out; }
function decodeUtf8(data) { try { return new TextDecoder('utf-8', { fatal: true }).decode(data); } catch { return ''; } }
function stableJson(value) { return JSON.stringify(sortJson(value)); }
function sortJson(value) { if (Array.isArray(value)) return value.map(sortJson); if (!value || typeof value !== 'object') return value; return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])])); }
function finding(severity, code, message, extra = {}) { return Object.freeze({ severity, code, message, ...extra }); }
function dedupeFindings(items = []) { const map = new Map(); for (const item of items) { const key = `${item.severity || ''}:${item.code || ''}:${item.workspaceId || ''}:${item.reason || ''}:${item.path || ''}`; if (!map.has(key)) map.set(key, item); } return [...map.values()]; }
function deepFreeze(value) { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value; for (const child of Object.values(value)) deepFreeze(child); return Object.freeze(value); }

