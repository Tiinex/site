import { finalizeFile } from '../../../export/package.fileMap.js';
import { packageFileBytes, sha256Hex, utf8Bytes } from '../../../export/package.bytes.js';
import { exportFileMapZipUint8Array } from '../../../export/package.zip.js';
import { buildHandoffCarrierProjection, HANDOFF_CARRIER_PROJECTION_PATH, inspectHandoffCarrierProjection } from './carrierProjection.js';
import { HANDOFF_COLD_CONSUMER_ENTRYPOINT_PATH } from './coldConsumerEntrypoint.js';
import { HANDOFF_CLOSURE_DESCRIPTOR_PATH, HANDOFF_CLOSURE_DESCRIPTOR_V2_SCHEMA_ID } from './materialClosure.descriptor.js';
import { HANDOFF_POINTER_ENTRYPOINT_PREFIX } from './pointerEntrypoint.js';
import { buildHandoffTransportCompanionProjection, HANDOFF_TRANSPORT_COMPANION_PATH, inspectHandoffTransportCompanion } from './transportCompanion.js';
import { HANDOFF_WORKSPACE_ARCHIVE_BINDING_SCHEMA_ID, HANDOFF_WORKSPACE_ARCHIVE_CODEC, HANDOFF_WORKSPACE_ARCHIVE_PROVIDER_KIND, HANDOFF_WORKSPACE_INNER_PATH_NORMALIZATION, normalizeHandoffWorkspaceInnerPath } from './workspaceByteProvider.js';
import { indexWorkspaceTargetDeclarations, mapArchiveRequirements, qualifyDirectWorkspaceForArchive, qualifyWorkspaceForArchive } from './materialClosure.archiveV2.workspace.js';
import { buildRecipientFacingV2Topology, RECIPIENT_V2_FORMAT_ID } from './recipientV2.topology.js';
import { inspectRecipientFacingV2Topology, roundTripRecipientFacingV2Topology } from './recipientV2.inspect.js';
import { indexDirectWorkspaceSources, indexUniqueArchiveBaselineFiles, resolveDirectWorkspaceSource } from './materialClosure.archiveV2.indexes.js';
import { buildDirectArchiveProjectionProvider } from './materialClosure.archiveV2.projectionProvider.js';

export const PORTABLE_HANDOFF_TRANSPORT_PACKAGE_V2_SCHEMA_ID = 'tiinex.portable.handoff-transport-package.v2';

export function upgradeRecipientRelativeHandoffTransportPackageV2(baseline = {}, input = {}, options = {}) {
  const findings = [];
  const baselineBundle = baseline.bundle || {};
  const baselineDescriptor = baseline.descriptor || baselineBundle.handoffClosure || {};
  if (!baselineBundle.files?.length || !baselineDescriptor.workspaceMaterializations?.length) {
    return blockedUpgrade(baseline, [finding('error', 'portable.handoff-v2.baseline.unavailable', 'Archive-backed v2 manufacture requires a qualified recipient-relative semantic/control baseline.')]);
  }

  const byPath = indexUniqueArchiveBaselineFiles(baselineBundle.files || [], findings);
  const archiveBindings = [];
  const workspaceMaterializations = [];
  const workspaceFiles = [];
  const removedWorkspacePaths = new Set();
  const workspaceEntryByQualifiedPath = new Map();
  const workspaceTargetDeclarations = indexWorkspaceTargetDeclarations(input.workspaceTargets || input.workspaceTargetBindings || []);
  const directSourcesByCorrelation = indexDirectWorkspaceSources(baseline.directWorkspaceSources || []);
  let avoidedExplodedWorkspaceFiles = 0;
  const records = [];

  for (const workspace of baselineDescriptor.workspaceMaterializations || []) {
    const directSource = resolveDirectWorkspaceSource(directSourcesByCorrelation, workspace.transportCorrelationKey);
    const qualified = directSource
      ? qualifyDirectWorkspaceForArchive(workspace, directSource.workspace, workspaceTargetDeclarations.get(String(workspace.id || '')) || [])
      : qualifyWorkspaceForArchive(workspace, byPath, workspaceTargetDeclarations.get(String(workspace.id || '')) || []);
    findings.push(...qualified.findings);
    if (qualified.status !== 'qualified') continue;
    const workspaceId = String(workspace.id || '');
    const archivePath = `handoff.workspaces/${safeToken(workspaceId)}/workspace.snapshot.zip`;
    const targetPath = `handoff.workspaces/${safeToken(workspaceId)}/workspace.artifact.md`;
    const archiveBytes = exportFileMapZipUint8Array(qualified.entries.map((entry) => ({ path: entry.path, data: entry.data })), 'portable.handoff-v2.workspace-archive.path.invalid');
    const archiveFile = finalizeFile({ path: archivePath, kind: 'handoff-workspace-archive', logicalKind: 'recipient-relative-complete-workspace-archive', mediaType: 'application/zip', data: archiveBytes, boundary: 'Exact complete Workspace snapshot representation; Workspace identity comes only from the exact qualified target plus binding, never archive name/placement.' });
    const targetFile = finalizeFile({ path: targetPath, kind: 'handoff-workspace-target', logicalKind: 'recipient-relative-workspace-identity-target', mediaType: 'text/markdown', data: qualified.target.data, boundary: 'Exact tiinex.workspace.v1 target binding carrier id to Workspace identity; package name/placement have no authority.' });
    workspaceFiles.push(targetFile, archiveFile);
    for (const entry of qualified.entries) {
      if (entry.packagePath && byPath.has(entry.packagePath)) removedWorkspacePaths.add(entry.packagePath);
      else avoidedExplodedWorkspaceFiles += 1;
      workspaceEntryByQualifiedPath.set(`${workspaceId}\u0000${entry.path}`, entry);
    }
    const entries = qualified.entries.map((entry) => Object.freeze({ path: entry.path, bytes: entry.bytes, sha256: entry.sha256, referenceTarget: entry.referenceTarget }));
    const entriesFingerprint = sha256Hex(utf8Bytes(stableJson(entries)));
    const totalBytes = entries.reduce((sum, entry) => sum + entry.bytes, 0);
    const binding = deepFreeze({
      schema: HANDOFF_WORKSPACE_ARCHIVE_BINDING_SCHEMA_ID,
      version: 1,
      workspaceId,
      transportCorrelationKey: String(workspace.transportCorrelationKey || ''),
      workspaceTarget: Object.freeze({
        packagePath: targetFile.path,
        innerPath: qualified.target.path,
        bytes: targetFile.bytes,
        sha256: targetFile.sha256,
        schema: 'tiinex.workspace.v1',
        selfIntegrity: Object.freeze({ state: String(qualified.target.selfIntegrity.state || ''), value: String(qualified.target.selfIntegrity.value || '') }),
        locatorAuthority: false
      }),
      representation: Object.freeze({
        kind: 'complete-workspace-snapshot',
        packagePath: archiveFile.path,
        mediaType: 'application/zip',
        codec: HANDOFF_WORKSPACE_ARCHIVE_CODEC,
        bytes: archiveFile.bytes,
        digest: Object.freeze({ method: 'sha256', value: archiveFile.sha256, target: 'archive-bytes-as-carried' }),
        deterministic: true,
        locatorAuthority: false
      }),
      entryMap: Object.freeze({ normalization: HANDOFF_WORKSPACE_INNER_PATH_NORMALIZATION, count: entries.length, entries: Object.freeze(entries) }),
      completeness: Object.freeze({ state: 'qualified', basis: 'exact-qualified-workspace-completeness-evidence-plus-complete-archive-entry-set', entryCount: entries.length, totalBytes, entriesFingerprint }),
      provider: Object.freeze({ kind: HANDOFF_WORKSPACE_ARCHIVE_PROVIDER_KIND, state: 'ready', addressing: 'qualified-workspace-id-plus-normalized-inner-path', fallback: 'none' }),
      authority: Object.freeze({ workspaceIdentity: 'exact-workspace-target-byte-identity', archiveIdentity: 'exact-archive-byte-digest', pathAuthority: false, adjacencyAuthority: false, orderingAuthority: false, priorProvenanceAuthority: false })
    });
    archiveBindings.push(binding);
    workspaceMaterializations.push(deepFreeze({ ...workspace, includedEntries: Object.freeze(entries) }));
    records.push(Object.freeze({ workspace, binding, qualified, archiveFile }));
  }

  if (workspaceMaterializations.length !== (baselineDescriptor.workspaceMaterializations || []).length) {
    return blockedUpgrade(baseline, findings.length ? findings : [finding('error', 'portable.handoff-v2.workspace.unqualified', 'One or more workspace snapshots could not qualify for archive-backed carriage.')]);
  }

  const removedMaterialPaths = new Set();
  const materialized = (baselineDescriptor.materialized || []).map((material) => {
    const workspaceId = String(material.provenance?.workspaceId || '');
    const relative = normalizedOrEmpty(material.provenance?.path || material.originalPath || '');
    const entry = workspaceId && relative ? workspaceEntryByQualifiedPath.get(`${workspaceId}\u0000${relative}`) : null;
    if (entry && Number(material.bytes || 0) === entry.bytes && String(material.sha256 || '') === entry.sha256) {
      if (material.packagePath) removedMaterialPaths.add(String(material.packagePath));
      return deepFreeze({ ...material, packagePath: '', carrierKind: 'workspace-archive-entry', workspaceId, workspaceRelativePath: relative, authority: Object.freeze({ ...(material.authority || {}), carrierDedupBasis: 'exact-qualified-workspace-archive-entry-byte-identity' }) });
    }
    return material;
  });

  const bindingByWorkspace = new Map(archiveBindings.map((binding) => [binding.workspaceId, binding]));
  const requirements = mapArchiveRequirements(baselineDescriptor.requirements || {}, materialized, bindingByWorkspace);
  const descriptor = deepFreeze({
    ...baselineDescriptor,
    schema: HANDOFF_CLOSURE_DESCRIPTOR_V2_SCHEMA_ID,
    version: 2,
    boundary: 'Disposable recipient-relative transport metadata with exact archive-backed Workspace binding. Safe to delete with the package; not a Tiinex artifact, semantic Parent, workspace owner, package identity, Handoff acceptance/completion state, or semantic provider authority.',
    requirements,
    materialized: Object.freeze(materialized),
    workspaceMaterializations: Object.freeze(workspaceMaterializations),
    workspaceArchiveBindings: Object.freeze(archiveBindings),
    providerProvenance: Object.freeze(materialized.map((entry) => Object.freeze({ requirementId: entry.requirementId, provider: entry.provider || {}, provenance: entry.provenance || {}, carrierKind: String(entry.carrierKind || 'detached-material') }))),
    roundtripVerification: Object.freeze({
      state: 'build-verified',
      verifier: 'durable-outer-file-map-plus-qualified-workspace-archive-provider-rehydration-required',
      descriptorPath: HANDOFF_CLOSURE_DESCRIPTOR_PATH,
      expectedMaterial: Object.freeze([
        ...materialized.filter((entry) => entry.carrierKind !== 'workspace-archive-entry').map((entry) => Object.freeze({ packagePath: entry.packagePath, bytes: entry.bytes, sha256: entry.sha256 })),
        ...archiveBindings.flatMap((binding) => [
          Object.freeze({ packagePath: binding.workspaceTarget.packagePath, bytes: binding.workspaceTarget.bytes, sha256: binding.workspaceTarget.sha256 }),
          Object.freeze({ packagePath: binding.representation.packagePath, bytes: binding.representation.bytes, sha256: binding.representation.digest.value })
        ])
      ]),
      note: 'Outer file-map integrity governs package files. Workspace entry identity/completeness is independently re-established from the exact archive digest, entry map, per-entry byte identity, and exact carried Workspace target; descriptor presence alone proves neither delivery nor Handoff acceptance.'
    })
  });

  const generatedPaths = new Set([HANDOFF_CLOSURE_DESCRIPTOR_PATH, HANDOFF_CARRIER_PROJECTION_PATH, HANDOFF_COLD_CONSUMER_ENTRYPOINT_PATH, HANDOFF_TRANSPORT_COMPANION_PATH, 'tiinex.package/file-map.json', 'tiinex.package/build-receipt.json']);
  const retained = (baselineBundle.files || []).filter((file) => {
    const path = String(file.path || '');
    return !generatedPaths.has(path) && !path.startsWith(HANDOFF_POINTER_ENTRYPOINT_PREFIX) && !removedWorkspacePaths.has(path) && !removedMaterialPaths.has(path);
  });
  const descriptorFile = finalizeFile({ path: HANDOFF_CLOSURE_DESCRIPTOR_PATH, kind: 'handoff-closure-descriptor', logicalKind: 'disposable-transport-control', mediaType: 'application/json', content: `${stablePrettyJson(descriptor)}\n`, boundary: descriptor.boundary });
  const projectionBundle = { ...baselineBundle, files: [...retained, ...workspaceFiles, descriptorFile], handoffClosure: descriptor };
  const provider = buildDirectArchiveProjectionProvider(records);
  const carrierProjection = buildHandoffCarrierProjection({ bundle: projectionBundle, descriptor, workspaceByteProvider: provider, carrierLineage: input.carrierLineage || baseline.carrierProjection?.lineage || null, routes: input.transportRoutes || input.handoffRoutes || (baseline.carrierProjection?.routes || []).map((route) => ({ workspaceId: route.workspaceId, path: route.workspaceRelativePath, purpose: route.purpose })) });
  const createdAt=baselineBundle.manifest?.createdAt||baselineBundle.builtAt||'';
  const transportStatus = baseline.status === 'blocked' || carrierProjection.status !== 'ready' ? 'blocked' : baseline.status;
  const transportCompanion = buildHandoffTransportCompanionProjection({ bundle: projectionBundle, descriptor, packageStatus: transportStatus, participation: input.transportParticipation || input.participation || {} });
  const companionFile = finalizeFile({ path: HANDOFF_TRANSPORT_COMPANION_PATH, kind: 'handoff-transport-companion', logicalKind: 'disposable-transport-projection', mediaType: 'application/json', content: `${stablePrettyJson(transportCompanion)}\n`, boundary: transportCompanion.boundary });
  const companionInspectionRaw = inspectHandoffTransportCompanion({ ...projectionBundle, status: transportStatus, handoffClosure: descriptor, files: Object.freeze([...projectionBundle.files, companionFile]) });

  // Recipient-v2 is the canonical carrier. Do not serialize and fully re-inspect the hidden
  // legacy export-package control graph before building the recipient surface: that duplicated
  // whole-archive hashing and let an implementation-only representation gate the real carrier.
  // The direct closure/carrier builders qualify exact source bytes first; the visible recipient
  // surface is then independently inspected, and optional roundtrip verifies its serialized bytes.
  const recipientSurface = buildRecipientFacingV2Topology({ bundle: projectionBundle, descriptor, carrierProjection, routeSelector: input.recipientRouteSelector || '', createdAt });
  findings.push(...(recipientSurface.findings || []));
  const bundle = deepFreeze({ ...baselineBundle, status: transportStatus, files: recipientSurface.files, fileMap: null, packageRepresentationSha256: '', handoffClosure: null, transportFormat: RECIPIENT_V2_FORMAT_ID, boundary: `${baselineBundle.boundary || ''} Recipient-facing v2 exposes a flat qualified-artifact/payload root; legacy control JSON is not serialized.` });
  const fullRecipientVerificationRequested = options.verifyRoundtrip !== false && input.verifyRoundtrip !== false;
  const inspection = fullRecipientVerificationRequested
    ? inspectRecipientFacingV2Topology(bundle)
    : constructionRecipientV2Inspection(recipientSurface, carrierProjection, descriptor);
  const runtime = fullRecipientVerificationRequested ? roundTripRecipientFacingV2Topology(bundle, inspection) : null;
  const carrierReady = carrierProjection.status === 'ready';
  const flatReady = recipientSurface.status === 'ready' && inspection.status === 'valid' && (!runtime || runtime.status === 'passed');
  const verificationReady = carrierReady && flatReady && companionInspectionRaw.status === 'valid';
  const closureInspection = deepFreeze({ schema: 'tiinex.portable.handoff-v2.recipient-closure.inspection.v1', status: inspection.status, workspaceByteProvider: inspection.workspaceByteProvider, findings: inspection.findings });
  const carrierInspection = deepFreeze({ schema: 'tiinex.portable.handoff-v2.recipient-carrier.inspection.v1', status: inspection.status, projection: inspection.carrierProjection, findings: inspection.findings });
  const pointerEntrypointInspection = deepFreeze({ schema: 'tiinex.portable.handoff-v2.recipient-pointer.inspection.v1', status: inspection.status, entries: inspection.routes, findings: inspection.findings });
  const coldConsumerEntrypointInspection = deepFreeze({ schema: 'tiinex.portable.handoff-v2.recipient-orientation.inspection.v1', status: inspection.status, projection: inspection.coldConsumerProjection, findings: inspection.findings });
  const companionInspection = deepFreeze({ schema: 'tiinex.portable.handoff-v2.internal-companion.inspection.v1', status: companionInspectionRaw.status, projection: transportCompanion, serialized: false, findings: companionInspectionRaw.findings || [] });
  if (!verificationReady) findings.push(finding('error', 'portable.handoff-v2.verification.blocked', 'Canonical recipient-v2 package failed one or more direct carrier, recipient-facing topology/provider/route, companion, or roundtrip verification gates.', { carrierProjection: carrierProjection.status, recipientSurface: recipientSurface.status, recipientInspection: inspection.status, companionInspection: companionInspectionRaw.status, roundtrip: runtime?.status || 'not-requested' }));

  const __out = deepFreeze({
    schema: PORTABLE_HANDOFF_TRANSPORT_PACKAGE_V2_SCHEMA_ID,
    status: verificationReady ? transportStatus : 'blocked',
    bundle,
    descriptor: inspection.descriptor || descriptor,
    carrierProjection: inspection.carrierProjection,
    pointerEntrypointProjection: Object.freeze({ schema: 'tiinex.portable.handoff-v2.recipient-pointer-projection.v1', entries: inspection.routes || Object.freeze([]) }),
    coldConsumerProjection: inspection.coldConsumerProjection,
    transportCompanion,
    recipientSurface,
    inspection,
    closureInspection,
    carrierInspection,
    pointerEntrypointInspection,
    coldConsumerEntrypointInspection,
    companionInspection,
    roundtrip: runtime,
    findings: Object.freeze(dedupeFindings(findings)),
    migration: Object.freeze({ mode: 'canonical-archive-backed-recipient', recipientTopology: RECIPIENT_V2_FORMAT_ID, manufacturePath: directSourcesByCorrelation.size ? 'direct-qualified-workspace-to-archive' : 'archive-baseline-upgrade', removedExplodedWorkspaceFiles: removedWorkspacePaths.size, avoidedExplodedWorkspaceFiles, deduplicatedDetachedMaterialFiles: removedMaterialPaths.size, exposedWorkspaceTargets: archiveBindings.length, workspaceArchives: archiveBindings.length }),
    boundary: 'Canonical recipient transport representation only. No semantic Workspace identity is minted and this result carries no remote mutation authority.'
  });
  return __out;
}


function constructionRecipientV2Inspection(recipientSurface = {}, carrierProjection = {}, descriptor = {}) {
  const topology = recipientSurface.topology || {};
  const findings = Object.freeze([...(recipientSurface.findings || [])]);
  const status = recipientSurface.status === 'ready' && !findings.some((item) => item.severity === 'error') ? 'valid' : 'invalid';
  return deepFreeze({
    schema: 'tiinex.portable.recipient-facing-handoff-v2.construction-inspection.v1',
    detected: true,
    status,
    format: RECIPIENT_V2_FORMAT_ID,
    verificationMode: 'construction-qualified; physical re-ingest required for independent recipient verification',
    rootArtifact: topology.root ? Object.freeze({ path: String(topology.root.path || ''), sha256: String(topology.root.sha256 || '') }) : null,
    readArtifact: topology.read ? Object.freeze({ path: String(topology.read.path || ''), status: 'qualified' }) : null,
    workspaces: Object.freeze((topology.workspaces || []).map((item) => Object.freeze({
      workspaceId: String(item.workspaceId || ''),
      workspaceArtifactPath: String(item.workspacePath || ''),
      workspaceArchivePath: String(item.archivePath || ''),
      sourceWorkspaceTargetInnerPath: String(item.sourceWorkspaceTargetInnerPath || ''),
      sourceWorkspaceTargetSha256: String(item.sourceWorkspaceTargetSha256 || '')
    }))),
    routes: Object.freeze((topology.routes || []).map((item) => Object.freeze({
      pointerPath: String(item.pointerPath || ''),
      workspaceId: String(item.workspaceId || ''),
      workspaceRelativeHandoffPath: String(item.workspaceRelativeHandoffPath || ''),
      participantRolePointers: Object.freeze((topology.participantRoles || [])
        .filter((role) => String(role.routeId || '') === String(item.routeId || ''))
        .map((role) => String(role.pointerPath || ''))
        .filter(Boolean))
    }))),
    participantRoles: Object.freeze((topology.participantRoles || []).map((item) => Object.freeze({ ...item }))),
    caches: Object.freeze((topology.caches || []).map((item) => Object.freeze({ ...item }))),
    descriptor,
    carrierProjection,
    coldConsumerProjection: null,
    bootstrapInspection: null,
    findings,
    findingSummary: Object.freeze({ errors: findings.filter((item) => item.severity === 'error').length, findings: findings.length }),
    boundary: 'Producer-side construction qualification only. Independent recipient qualification is intentionally deferred to physical package re-ingest when full roundtrip is not requested.'
  });
}

function normalizedOrEmpty(value = '') { const normalized = normalizeHandoffWorkspaceInnerPath(value); return normalized.state === 'qualified' ? normalized.path : ''; }
function blockedUpgrade(baseline = {}, findings = []) { return deepFreeze({ schema: PORTABLE_HANDOFF_TRANSPORT_PACKAGE_V2_SCHEMA_ID, status: 'blocked', bundle: baseline.bundle || null, descriptor: baseline.descriptor || null, carrierProjection: baseline.carrierProjection || null, findings: Object.freeze(dedupeFindings(findings)), migration: Object.freeze({ mode: 'canonical-archive-backed-recipient', state: 'blocked-before-representation-switch' }), boundary: 'Canonical archive-backed recipient manufacture failed closed before changing the baseline carrier representation.' }); }
function findFile(bundle = {}, path = '') { return (bundle.files || []).find((file) => String(file.path || '') === String(path || '')) || null; }
function parseJsonFile(file = null) { try { return file ? JSON.parse(decodeUtf8(packageFileBytes(file))) : null; } catch { return null; } }
function decodeUtf8(data) { try { return new TextDecoder('utf-8', { fatal: true }).decode(data); } catch { return ''; } }
function safeToken(value = '') { return String(value || '').trim().replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100) || 'workspace'; }
function stableJson(value) { return JSON.stringify(sortJson(value)); }
function stablePrettyJson(value) { return JSON.stringify(sortJson(value), null, 2); }
function sortJson(value) { if (Array.isArray(value)) return value.map(sortJson); if (!value || typeof value !== 'object') return value; if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return undefined; return Object.fromEntries(Object.keys(value).sort().flatMap((key) => { const sorted = sortJson(value[key]); return typeof sorted === 'undefined' ? [] : [[key, sorted]]; })); }
function finding(severity, code, message, extra = {}) { return Object.freeze({ severity, code, message, ...extra }); }
function dedupeFindings(items = []) { const map = new Map(); for (const item of items) { const key = `${item.severity || ''}:${item.code || ''}:${item.workspaceId || ''}:${item.path || ''}:${item.packagePath || ''}`; if (!map.has(key)) map.set(key, item); } return [...map.values()]; }
function deepFreeze(value) { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value; for (const child of Object.values(value)) deepFreeze(child); return Object.freeze(value); }
