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

export function inspectRecipientZipPayload(file, facts = {}, findings = [], role = 'payload', verifiedIdentity = null) {
  if (!file) return null;
  const data = packageFileByteView(file);
  const expectedPath = String(facts.archivePath || '');
  if (expectedPath && expectedPath !== String(file.path || '')) findings.push(finding('error', `portable.handoff-v2-surface.${role}.path-mismatch`, 'Payload artifact local archive path does not resolve to the inspected payload.', { expectedPath, actualPath: file.path || '' }));
  if (Number(facts.archiveBytes || 0) !== data.byteLength) findings.push(finding('error', `portable.handoff-v2-surface.${role}.bytes-mismatch`, 'Payload byte length differs from its qualified visible declaration.', { path: file.path || '' }));
  const archiveSha256 = reusableVerifiedIdentity(verifiedIdentity, data) || sha256Hex(data);
  if (String(facts.archiveSha256 || '') !== archiveSha256) findings.push(finding('error', `portable.handoff-v2-surface.${role}.sha256-mismatch`, 'Payload digest differs from its qualified visible declaration.', { path: file.path || '' }));
  const archive = inspectStoredWorkspaceArchive(data, { ownedBytes: true });
  if (archive.state !== 'qualified') for (const item of archive.findings || []) findings.push(finding('error', `portable.handoff-v2-surface.${role}.archive-invalid`, item.message || 'Stored ZIP payload is invalid.', { path: file.path || '', cause: item.code || '' }));
  return Object.freeze({ data, sha256: archiveSha256, bytes: data.byteLength, archive });
}



function reusableVerifiedIdentity(identity, data) {
  if (!identity || Number(identity.bytes) !== data.byteLength) return '';
  const digest = String(identity.sha256 || '').toLowerCase();
  return /^[a-f0-9]{64}$/.test(digest) ? digest : '';
}

export function buildQualifiedRecipientV2WorkspaceByteProvider(workspaceParts = []) {
  const providerFindings = [];
  const idCounts = new Map();
  for (const part of workspaceParts) idCounts.set(String(part?.workspaceId || ''), (idCounts.get(String(part?.workspaceId || '')) || 0) + 1);
  const workspaces = workspaceParts.map((part) => {
    const descriptorPart = part?.descriptorPart || {};
    const workspace = descriptorPart.workspace || {};
    const binding = descriptorPart.binding || {};
    const archive = part?.archive || {};
    const representation = part?.representation || {};
    const payload = part?.payload || {};
    const parsedEntries = archive.archive?.entries || [];
    const workspaceId = String(workspace.id || part?.workspaceId || '');
    const reasons = [];
    const reject = (code, detail = '') => reasons.push(Object.freeze({ code, detail }));
    if (!workspaceId || idCounts.get(workspaceId) !== 1) reject('workspace-identity-ambiguous', `count=${idCounts.get(workspaceId) || 0}`);
    if (part?.artifact?.schemaId !== 'tiinex.workspace.v1' || part?.artifact?.status !== 'qualified') reject('workspace-artifact-unqualified');
    if (part?.representationArtifact?.schemaId !== 'tiinex.workspace.representation.v1' || part?.representationArtifact?.status !== 'qualified') reject('workspace-representation-unqualified');
    if (part?.payloadArtifact?.schemaId !== 'tiinex.external.payload.v1' || part?.payloadArtifact?.status !== 'qualified') reject('workspace-representation-payload-unqualified');
    if (representation.workspaceArtifactPath !== part?.artifact?.path) reject('workspace-representation-workspace-endpoint-mismatch');
    if (representation.payloadArtifactPath !== part?.payloadArtifact?.path) reject('workspace-representation-payload-endpoint-mismatch');
    if (representation.representationKind !== 'exact-workspace-byte-tree-archive' || representation.coverage !== 'complete' || representation.bindingState !== 'verified') reject('workspace-representation-not-verified-complete');
    if (representation.workspaceTreeRoot !== '.' || representation.archiveEntryRoot !== '.' || representation.pathMapping !== 'identity-relative-paths' || representation.collisionPolicy !== 'reject-ambiguous-or-unsafe-paths' || representation.decoderRequirement !== 'deterministic stored ZIP with safe-entry validation') reject('workspace-representation-correlation-invalid');
    if (representation.activationRule !== 'verified-complete-only' || representation.payloadIntegrityRequirement !== 'verified-exact-payload-bytes' || representation.coverageRequirement !== 'complete' || representation.stalenessRule !== 'requalify-on-binding-relevant-change' || representation.selectionRule !== 'exactly-one-binding-per-workspace' || representation.multiWorkspaceIsolation !== 'independent-binding-closure') reject('workspace-representation-provider-contract-invalid');
    if (representation.pathMapping === 'manifest' && !representation.mappingManifest) reject('workspace-representation-mapping-manifest-missing');
    if (payload.mediaType !== 'application/zip' || payload.format !== 'deterministic stored ZIP' || payload.integrityStatus !== 'verified' || payload.integrityMethod !== 'sha256' || payload.integrityTarget !== 'exact payload bytes as carried at the declared local Location') reject('workspace-representation-payload-contract-invalid');
    if (payload.location !== String(part?.archiveFile?.path || '')) reject('workspace-representation-payload-location-mismatch');
    if (Number(payload.bytes || 0) !== Number(archive.bytes || 0) || String(payload.integrityValue || '') !== String(archive.sha256 || '')) reject('workspace-representation-payload-integrity-mismatch');
    if (archive.archive?.state !== 'qualified') reject('workspace-representation-payload-decoder-unqualified');
    if (String(representation.workspaceArtifactInnerPath || '') !== String(part?.sourceTargetEntry?.path || '')) reject('workspace-representation-inner-workspace-mismatch');
    if (part?.targetQualification?.state !== 'qualified') reject('workspace-representation-inner-workspace-unqualified');
    const exactEntriesFingerprint = recipientEntriesFingerprint(parsedEntries);
    const facts = part?.facts || {};
    const representationFacts = part?.representationArtifact?.facts || {};
    const payloadFacts = part?.payloadArtifact?.facts || {};
    if (String(facts.sourceWorkspaceTargetInnerPath || '') !== String(representation.workspaceArtifactInnerPath || '') || String(facts.sourceWorkspaceTargetSha256 || '') !== String(part?.targetFile?.sha256 || '') || Number(facts.sourceWorkspaceTargetBytes || 0) !== Number(part?.targetFile?.bytes || 0) || Number(facts.entryCount || 0) !== parsedEntries.length || String(facts.entriesFingerprint || '') !== exactEntriesFingerprint || String(facts.completenessState || '') !== 'qualified') reject('workspace-transport-witness-stale');
    if (String(representationFacts.workspaceId || '') !== workspaceId || String(representationFacts.workspaceArtifactPath || '') !== String(part?.artifact?.path || '') || String(representationFacts.payloadArtifactPath || '') !== String(part?.payloadArtifact?.path || '') || String(representationFacts.sourceWorkspaceTargetInnerPath || '') !== String(representation.workspaceArtifactInnerPath || '') || String(representationFacts.archivePath || '') !== String(payload.location || '') || String(representationFacts.archiveSha256 || '') !== String(archive.sha256 || '') || Number(representationFacts.entryCount || 0) !== parsedEntries.length || String(representationFacts.entriesFingerprint || '') !== exactEntriesFingerprint || String(representationFacts.completenessState || '') !== 'qualified') reject('workspace-representation-transport-witness-stale');
    if (String(payloadFacts.workspaceId || '') !== workspaceId || String(payloadFacts.archivePath || '') !== String(payload.location || '') || String(payloadFacts.archiveSha256 || '') !== String(archive.sha256 || '')) reject('workspace-representation-payload-transport-witness-stale');
    const declaredByPath = new Map((binding.entryMap?.entries || []).map((entry) => [String(entry.path || ''), entry]));
    const archivePath = String(binding.representation?.packagePath || part?.archiveFile?.path || '');
    const entries = parsedEntries.map((entry) => {
      const declared = declaredByPath.get(String(entry.path || '')) || {};
      return deepFreeze({ path: String(entry.path || ''), innerPath: String(entry.path || ''), archivePackagePath: archivePath, packagePath: archivePath, bytes: Number(entry.bytes || 0), sha256: String(entry.sha256 || ''), referenceTarget: String(declared.referenceTarget || ''), data: entry.data });
    });
    const state = reasons.length ? 'blocked' : 'qualified';
    for (const reason of reasons) providerFindings.push(finding('error', `portable.handoff-v2-surface.workspace-provider.${reason.code}`, 'Canonical Workspace Representation provider activation failed closed.', { workspaceId, detail: reason.detail || '' }));
    return deepFreeze({
      state,
      id: workspaceId,
      title: String(workspace.title || workspace.id || part?.workspaceId || ''),
      mode: 'archive',
      materialization: workspace,
      entries: Object.freeze(entries),
      workspaceTarget: deepFreeze({ ...(binding.workspaceTarget || {}), data: packageFileByteView(part?.targetFile || {}) }),
      archive: deepFreeze({ ...(binding.representation || {}), data: archive.data || new Uint8Array() }),
      binding,
      reasons: Object.freeze(reasons),
      authority: Object.freeze({ locatorAuthority: false, filenameAuthority: false, packagePlacementAuthority: false, bindingAuthority: 'schema-valid-tiinex.workspace.representation.v1-visible-binding-plus-schema-valid-external-payload-plus-exact-qualified-archive-bytes', hiddenTransportBindingAuthority: false })
    });
  });
  return deepFreeze({
    schema: HANDOFF_WORKSPACE_BYTE_PROVIDER_SCHEMA_ID,
    status: workspaces.length > 0 && workspaces.every((workspace) => workspace.state === 'qualified') ? 'ready' : 'blocked',
    workspaces: Object.freeze(workspaces),
    findings: Object.freeze(providerFindings),
    boundary: 'Recipient-v2 archive provider activation is authorized only by one schema-valid verified-complete tiinex.workspace.representation.v1 artifact, its explicitly referenced schema-valid External Payload, and exact qualified payload bytes. Hidden transport binding metadata is compatibility/materialization evidence only and has no semantic provider authority.'
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
  const representation = input.representation || {};
  const payload = input.payload || {};
  const entries = recipientEntryIdentities(input.entries || []).map((entry) => Object.freeze({ ...entry, referenceTarget: '' }));
  const workspaceId = String(input.workspaceId || facts.workspaceId || '');
  const targetPath = String(input.targetPackagePath || '');
  const targetInnerPath = String(representation.workspaceArtifactInnerPath || '');
  const archivePath = String(payload.location || input.archiveFile?.path || '');
  const targetFile = input.targetFile || {};
  const selfIntegrity = validatedC14nV2PrimarySelfDigest(input.targetMarkdown || '');
  const archiveFile = input.archiveFile || {};
  const totalBytes = entries.reduce((sum, entry) => sum + entry.bytes, 0);
  const completenessEvidence = Object.freeze({ state: 'qualified', basis: 'canonical-verified-complete-workspace-representation-plus-exact-external-payload-and-qualified-complete-entry-set', entryCount: entries.length, totalBytes });
  const transportCorrelationKey = recipientLocalWorkspaceCorrelationKey({ workspaceId, representation, payload, targetFile, entries });
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
    completeness: Object.freeze({ state: 'qualified', basis: 'canonical-verified-complete-workspace-representation-plus-exact-external-payload-and-qualified-complete-entry-set', entryCount: entries.length, totalBytes, entriesFingerprint: '' }),
    provider: Object.freeze({ kind: String(facts.providerKind || HANDOFF_WORKSPACE_ARCHIVE_PROVIDER_KIND), state: 'ready', addressing: 'qualified-workspace-id-plus-normalized-inner-path', fallback: 'none' }),
    authority: Object.freeze({ workspaceIdentity: 'explicit-canonical-workspace-representation-workspace-endpoint-plus-exact-workspace-target-byte-identity', archiveIdentity: 'explicit-external-payload-endpoint-plus-exact-archive-byte-digest', canonicalRepresentationSchema: 'tiinex.workspace.representation.v1', hiddenTransportBindingAuthority: false, pathAuthority: false, adjacencyAuthority: false, orderingAuthority: false })
  });
  return Object.freeze({ workspace, binding });
}


function recipientLocalWorkspaceCorrelationKey(input = {}) {
  const identity = {
    format: 'recipient-v2-canonical-workspace-representation-binding',
    workspaceId: String(input.workspaceId || ''),
    workspaceArtifactPath: String(input.representation?.workspaceArtifactPath || ''),
    payloadArtifactPath: String(input.representation?.payloadArtifactPath || ''),
    sourceWorkspaceTargetInnerPath: String(input.representation?.workspaceArtifactInnerPath || ''),
    sourceWorkspaceTargetSha256: String(input.targetFile?.sha256 || ''),
    sourceWorkspaceTargetBytes: Number(input.targetFile?.bytes || 0),
    archivePath: String(input.payload?.location || ''),
    archiveSha256: String(input.payload?.integrityValue || ''),
    entriesFingerprint: recipientEntriesFingerprint(input.entries || [])
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
