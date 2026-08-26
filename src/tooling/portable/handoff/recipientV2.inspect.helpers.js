import { packageFileByteView, packageFileBytes, sha256Hex, utf8Bytes } from '../../../export/package.bytes.js';
import { validatedC14nV2PrimarySelfDigest } from '../../../integrity/integrity.c14nV2.js';
import { inspectStoredWorkspaceArchive, HANDOFF_WORKSPACE_BYTE_PROVIDER_SCHEMA_ID, HANDOFF_WORKSPACE_ARCHIVE_BINDING_SCHEMA_ID, HANDOFF_WORKSPACE_ARCHIVE_CODEC, HANDOFF_WORKSPACE_ARCHIVE_PROVIDER_KIND, HANDOFF_WORKSPACE_INNER_PATH_NORMALIZATION } from './workspaceByteProvider.js';

export function indexRecipientFiles(files = [], findings = []) {
  const map = new Map();
  for (const file of files) {
    const path = String(file.path || '');
    const list = map.get(path) || [];
    list.push(file);
    map.set(path, list);
  }
  for (const [path, list] of map) if (list.length !== 1) findings.push(finding('error', 'portable.handoff-v2-surface.path-duplicate', 'Recipient-facing v2 root contains a duplicate path.', { path, count: list.length }));
  return map;
}

export function oneRecipientFile(index, path = '') {
  const list = index.get(String(path || '')) || [];
  return list.length === 1 ? list[0] : null;
}

export function inspectRecipientZipPayload(file, facts = {}, findings = [], role = 'payload') {
  if (!file) return null;
  const data = packageFileByteView(file);
  const expectedPath = String(facts.archivePath || '');
  if (expectedPath && expectedPath !== String(file.path || '')) findings.push(finding('error', `portable.handoff-v2-surface.${role}.path-mismatch`, 'Payload artifact local archive path does not resolve to the inspected payload.', { expectedPath, actualPath: file.path || '' }));
  if (Number(facts.archiveBytes || 0) !== data.byteLength) findings.push(finding('error', `portable.handoff-v2-surface.${role}.bytes-mismatch`, 'Payload byte length differs from its qualified visible declaration.', { path: file.path || '' }));
  const archiveSha256 = sha256Hex(data);
  if (String(facts.archiveSha256 || '') !== archiveSha256) findings.push(finding('error', `portable.handoff-v2-surface.${role}.sha256-mismatch`, 'Payload digest differs from its qualified visible declaration.', { path: file.path || '' }));
  const archive = inspectStoredWorkspaceArchive(data, { ownedBytes: true });
  if (archive.state !== 'qualified') for (const item of archive.findings || []) findings.push(finding('error', `portable.handoff-v2-surface.${role}.archive-invalid`, item.message || 'Stored ZIP payload is invalid.', { path: file.path || '', cause: item.code || '' }));
  return Object.freeze({ data, sha256: archiveSha256, bytes: data.byteLength, archive });
}


export function buildQualifiedRecipientV2WorkspaceByteProvider(workspaceParts = []) {
  const workspaces = workspaceParts.map((part) => {
    const descriptorPart = part?.descriptorPart || {};
    const workspace = descriptorPart.workspace || {};
    const binding = descriptorPart.binding || {};
    const archive = part?.archive || {};
    const parsedEntries = archive.archive?.entries || [];
    const declaredByPath = new Map((binding.entryMap?.entries || []).map((entry) => [String(entry.path || ''), entry]));
    const archivePath = String(binding.representation?.packagePath || part?.archiveFile?.path || '');
    const entries = parsedEntries.map((entry) => {
      const declared = declaredByPath.get(String(entry.path || '')) || {};
      return deepFreeze({ path: String(entry.path || ''), innerPath: String(entry.path || ''), archivePackagePath: archivePath, packagePath: archivePath, bytes: Number(entry.bytes || 0), sha256: String(entry.sha256 || ''), referenceTarget: String(declared.referenceTarget || ''), data: entry.data });
    });
    return deepFreeze({
      state: 'qualified',
      id: String(workspace.id || part?.workspaceId || ''),
      title: String(workspace.title || workspace.id || part?.workspaceId || ''),
      mode: 'archive',
      materialization: workspace,
      entries: Object.freeze(entries),
      workspaceTarget: deepFreeze({ ...(binding.workspaceTarget || {}), data: packageFileByteView(part?.targetFile || {}) }),
      archive: deepFreeze({ ...(binding.representation || {}), data: archive.data || new Uint8Array() }),
      binding,
      reasons: Object.freeze([]),
      authority: Object.freeze({ locatorAuthority: false, filenameAuthority: false, packagePlacementAuthority: false, bindingAuthority: 'recipient-visible-artifacts-plus-independently-qualified-exact-archive-bytes' })
    });
  });
  return deepFreeze({
    schema: HANDOFF_WORKSPACE_BYTE_PROVIDER_SCHEMA_ID,
    status: workspaces.length > 0 && workspaces.every((workspace) => workspace.state === 'qualified') ? 'ready' : 'blocked',
    workspaces: Object.freeze(workspaces),
    findings: Object.freeze([]),
    boundary: 'Recipient-v2 inspection provider reconstructed only from already independently qualified visible Workspace artifacts and exact parsed archive bytes. It performs no filename, adjacency, or package-placement inference.'
  });
}

export function recipientEntryIdentities(entries = []) {
  return entries.map((entry) => ({ path: String(entry.path || ''), bytes: Number(entry.bytes || 0), sha256: String(entry.sha256 || '') })).sort((a, b) => a.path.localeCompare(b.path));
}

export function recipientEntriesFingerprint(entries = []) {
  return sha256Hex(utf8Bytes(stableJson(recipientEntryIdentities(entries))));
}

export function recipientWorkspaceDescriptor(input = {}) {
  const facts = input.facts || {};
  const entries = recipientEntryIdentities(input.entries || []).map((entry) => Object.freeze({ ...entry, referenceTarget: '' }));
  const workspaceId = String(facts.workspaceId || '');
  const targetPath = String(input.targetPackagePath || '');
  const targetInnerPath = String(facts.sourceWorkspaceTargetInnerPath || '');
  const archivePath = String(facts.archivePath || '');
  const targetFile = input.targetFile || {};
  const selfIntegrity = validatedC14nV2PrimarySelfDigest(input.targetMarkdown || '');
  const archiveFile = input.archiveFile || {};
  const totalBytes = entries.reduce((sum, entry) => sum + entry.bytes, 0);
  const completenessEvidence = Object.freeze({ state: 'qualified', basis: String(facts.completenessBasis || 'recipient-v2-visible-payload-and-exact-archive-entry-set'), entryCount: entries.length, totalBytes });
  const transportCorrelationKey = recipientLocalWorkspaceCorrelationKey(facts);
  const workspace = Object.freeze({
    id: workspaceId,
    title: workspaceId,
    materialization: 'complete',
    qualification: 'qualified',
    correlationStatus: 'qualified',
    transportCorrelationKey,
    completenessEvidence,
    includedEntries: Object.freeze(entries)
  });
  const binding = Object.freeze({
    schema: HANDOFF_WORKSPACE_ARCHIVE_BINDING_SCHEMA_ID,
    version: 1,
    workspaceId,
    transportCorrelationKey,
    workspaceTarget: Object.freeze({ packagePath: targetPath, innerPath: targetInnerPath, bytes: Number(targetFile.bytes || 0), sha256: String(targetFile.sha256 || ''), schema: 'tiinex.workspace.v1', selfIntegrity: Object.freeze({ state: String(selfIntegrity.state || ''), value: String(selfIntegrity.value || '') }), locatorAuthority: false }),
    representation: Object.freeze({ kind: 'complete-workspace-snapshot', packagePath: archivePath, mediaType: 'application/zip', codec: HANDOFF_WORKSPACE_ARCHIVE_CODEC, bytes: Number(archiveFile.bytes || 0), digest: Object.freeze({ method: 'sha256', value: String(archiveFile.sha256 || ''), target: 'archive-bytes-as-carried' }), deterministic: true, locatorAuthority: false }),
    entryMap: Object.freeze({ normalization: HANDOFF_WORKSPACE_INNER_PATH_NORMALIZATION, count: entries.length, entries: Object.freeze(entries) }),
    completeness: Object.freeze({ state: 'qualified', basis: String(facts.completenessBasis || 'recipient-v2-visible-payload-and-exact-archive-entry-set'), entryCount: entries.length, totalBytes, entriesFingerprint: '' }),
    provider: Object.freeze({ kind: String(facts.providerKind || HANDOFF_WORKSPACE_ARCHIVE_PROVIDER_KIND), state: 'ready', addressing: 'qualified-workspace-id-plus-normalized-inner-path', fallback: 'none' }),
    authority: Object.freeze({ workspaceIdentity: 'exact-workspace-target-byte-identity', archiveIdentity: 'exact-archive-byte-digest', pathAuthority: false, adjacencyAuthority: false, orderingAuthority: false })
  });
  return Object.freeze({ workspace, binding });
}


function recipientLocalWorkspaceCorrelationKey(facts = {}) {
  const identity = {
    format: 'recipient-v2-qualified-workspace-binding',
    workspaceId: String(facts.workspaceId || ''),
    sourceWorkspaceTargetInnerPath: String(facts.sourceWorkspaceTargetInnerPath || ''),
    sourceWorkspaceTargetSha256: String(facts.sourceWorkspaceTargetSha256 || ''),
    sourceWorkspaceTargetBytes: Number(facts.sourceWorkspaceTargetBytes || 0),
    archivePath: String(facts.archivePath || ''),
    archiveSha256: String(facts.archiveSha256 || ''),
    entriesFingerprint: String(facts.entriesFingerprint || '')
  };
  return `recipient-v2:${sha256Hex(utf8Bytes(stableJson(identity)))}`;
}

export function virtualCacheMaterial(cache = {}, findings = []) {
  const archive = cache.archive?.archive;
  const byPath = new Map((archive?.entries || []).map((entry) => [String(entry.path || ''), entry]));
  const files = [];
  const materialized = [];
  for (const item of cache.facts?.materials || []) {
    const entry = byPath.get(String(item.archiveEntry || ''));
    if (!entry) {
      findings.push(finding('error', 'portable.handoff-v2-surface.cache.entry-missing', 'Context cache declaration does not resolve to exactly one archive entry.', { requirementId: item.requirementId || '', archiveEntry: item.archiveEntry || '' }));
      continue;
    }
    if (Number(item.bytes || 0) !== Number(entry.bytes || 0) || String(item.sha256 || '') !== String(entry.sha256 || '')) findings.push(finding('error', 'portable.handoff-v2-surface.cache.entry-identity-mismatch', 'Context cache entry bytes differ from its visible declaration.', { requirementId: item.requirementId || '', archiveEntry: item.archiveEntry || '' }));
    const packagePath = `recipient.v2.cache/${safeToken(cache.facts?.workspaceId || 'workspace')}/${safeToken(item.requirementId || item.archiveEntry)}.bin`;
    files.push(Object.freeze({ path: packagePath, data: entry.data, size: entry.bytes, kind: 'recipient-v2-virtual-cache-material' }));
    materialized.push(Object.freeze({ requirementId: String(item.requirementId || ''), classification: String(item.classification || ''), referenceTarget: String(item.referenceTarget || ''), originalPath: String(item.originalPath || ''), packagePath, carrierKind: 'detached-material', bytes: Number(entry.bytes || 0), sha256: String(entry.sha256 || ''), authority: Object.freeze({ carrierDedupBasis: 'visible-cache-artifact-plus-exact-archive-entry-byte-identity' }) }));
  }
  return Object.freeze({ files: Object.freeze(files), materialized: Object.freeze(materialized) });
}


export function recipientColdProjection(carrier = {}, readPath = '001-1-READ-BEFORE-PROCEEDING.trace.md') {
  const routes = Object.freeze((carrier.routes || []).map((route) => Object.freeze({ id: String(route.id || ''), state: String(route.state || ''), workspaceId: String(route.workspaceId || ''), workspaceRelativeHandoffPath: String(route.workspaceRelativePath || ''), packagePath: String(route.packagePath || ''), sha256: String(route.sha256 || ''), from: String(route.parties?.from || ''), to: String(route.parties?.to || '') })));
  const workspaces = Object.freeze((carrier.workspaces || []).map((workspace) => Object.freeze({ id: String(workspace.id || ''), title: String(workspace.title || workspace.id || ''), slug: String(workspace.slug || ''), qualification: String(workspace.qualification || '') })));
  const qualified = routes.filter((route) => route.state === 'qualified');
  return deepFreeze({ schema: 'tiinex.portable.handoff-cold-consumer-projection.v1', version: 1, status: carrier.status === 'ready' ? 'ready' : 'blocked', controls: Object.freeze({ start: readPath, carrier: 'visible-qualified-artifacts', closure: 'visible-qualified-artifacts-plus-exact-payload-bytes', fileMap: 'not-exposed-in-v2', manifest: 'not-exposed-in-v2' }), preferredPath: Object.freeze({ ingressKind: 'routed-handoff-package', firstSemanticOperation: 'orient-handoff-package', groundingOperation: 'ground-cold-consumer', qualificationOperation: 'qualify-cold-start', minimalHostBootstrapActions: 1, nativeFallback: 'explicit-and-justified-only', providerSpecificSemanticAuthority: false }), workspaces, routes, selection: Object.freeze({ policy: String(carrier.selection?.policy || ''), qualifiedRouteCount: qualified.length, implicitRouteId: qualified.length === 1 ? qualified[0].id : '' }), authority: Object.freeze({ semanticAuthority: 'none', packageTruthRequired: true, routeBindingAuthority: 'qualified-visible-artifact-plus-exact-payload-byte-truth-only' }) });
}

export function isForbiddenLegacyV2Path(path = '') {
  const value = String(path || '');
  return value.startsWith('context/') || value.startsWith('handoff.workspaces/') || value.startsWith('tiinex.bootstrap/') || value.startsWith('tiinex.package/') || /^handoff-entrypoint-.*\.trace\.md$/i.test(value);
}

export function finding(severity, code, message, extra = {}) { return Object.freeze({ severity, code, message, ...extra }); }
export function stableJson(value) { return JSON.stringify(sortJson(value)); }
export function dedupeFindings(items = []) { const map = new Map(); for (const item of items) { const key = `${item.severity || ''}:${item.code || ''}:${item.path || item.workspaceId || item.requirementId || ''}:${item.message || ''}`; if (!map.has(key)) map.set(key, item); } return [...map.values()]; }
export function deepFreeze(value) { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value; for (const child of Object.values(value)) deepFreeze(child); return Object.freeze(value); }
function sortJson(value) { if (Array.isArray(value)) return value.map(sortJson); if (!value || typeof value !== 'object') return value; return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])])); }
function safeToken(value = '') { return String(value || '').trim().toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100) || 'material'; }
