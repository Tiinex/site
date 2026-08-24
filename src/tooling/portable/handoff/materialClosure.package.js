import { buildExportPackageBundle, inspectExportPackageBundle } from '../../../export/package.builder.js';
import { buildExportPackageFileMap, finalizeFile } from '../../../export/package.fileMap.js';
import { packageFileBytes, stableFingerprintBytes, utf8Bytes } from '../../../export/package.bytes.js';
import { packageMaterialRepresentationSha256 } from '../../../export/package.controlIntegrity.js';
import { roundTripPortableRuntimePackage } from '../package/runtime.package.js';
import { planRecipientRelativeHandoffMaterialClosure, qualifyWorkspaceMaterializationCorrelationEntry, workspaceMaterializationCorrelationKey } from './materialClosure.plan.js';
import { buildHandoffClosureDescriptor, HANDOFF_CLOSURE_DESCRIPTOR_PATH, inspectHandoffClosureDescriptor } from './materialClosure.descriptor.js';
import { qualifyHandoffMaterialClosurePlanReadiness } from './materialClosure.readiness.js';
import { qualifyHandoffMaterialClosurePlanInputBinding } from './materialClosure.inputBinding.js';
import { qualifyHandoffMaterializedOutput } from './materialClosure.materialized.js';
import { buildHandoffTransportCompanionProjection, HANDOFF_TRANSPORT_COMPANION_PATH, inspectHandoffTransportCompanion } from './transportCompanion.js';
import { buildHandoffCarrierProjection, HANDOFF_CARRIER_PROJECTION_PATH, inspectHandoffCarrierProjection } from './carrierProjection.js';
import { buildHandoffColdConsumerProjection, renderHandoffColdConsumerEntrypoint, HANDOFF_COLD_CONSUMER_ENTRYPOINT_PATH, inspectHandoffColdConsumerEntrypoint } from './coldConsumerEntrypoint.js';
import { buildHandoffPointerEntrypoints, inspectHandoffPointerEntrypoints, HANDOFF_POINTER_ENTRYPOINT_PREFIX } from './pointerEntrypoint.js';

export const PORTABLE_HANDOFF_TRANSPORT_PACKAGE_SCHEMA_ID = 'tiinex.portable.handoff-transport-package.v1';

export function buildRecipientRelativeHandoffTransportPackage(input = {}, options = {}) {
  const plan = input.plan || planRecipientRelativeHandoffMaterialClosure(input, options);
  const planReadiness = qualifyHandoffMaterialClosurePlanReadiness(plan);
  const planInputBinding = qualifyHandoffMaterialClosurePlanInputBinding(plan, input, { externallySupplied: Boolean(input.plan) });
  const materializedOutputQualification = qualifyHandoffMaterializedOutput(plan);
  const baseBundle = input.baseBundle || buildExportPackageBundle(input.workspace || {}, { ...(input.packageInput || {}), ...(options.packageInput || {}) });
  const extraFiles = [];
  const packagedMaterial = [];
  for (const entry of materializedOutputQualification.state === 'qualified' ? materializedOutputQualification.expected : []) {
    const packagePath = materialPackagePath(entry);
    const file = finalizeFile({ path: packagePath, kind: 'handoff-material', logicalKind: 'recipient-relative-material', entryId: entry.requirementId, mediaType: entry.mediaType || 'application/octet-stream', data: entry.data, boundary: 'Recipient-relative exact byte carrier. Canonical artifact/source/workspace authority remains external and is preserved in the closure descriptor.' });
    extraFiles.push(file);
    packagedMaterial.push(Object.freeze({ ...entry, packagePath: file.path, bytes: file.bytes, sha256: file.sha256 }));
  }
  const packagedWorkspaces = [];
  const qualifiedWorkspaceByCorrelation = indexWorkspaceMaterializationTruth(plan.workspaceMaterializations || []);
  const rawWorkspaceCorrelationCounts = countWorkspaceCorrelationKeys(input.workspaceMaterializations || []);
  let workspaceCorrelationBlocked = false;
  for (const workspace of input.workspaceMaterializations || []) {
    const transportCorrelationKey = workspaceMaterializationCorrelationKey(workspace);
    const correlation = resolveWorkspaceMaterializationTruth(qualifiedWorkspaceByCorrelation, transportCorrelationKey, rawWorkspaceCorrelationCounts.get(transportCorrelationKey) || 0);
    const qualifiedWorkspace = correlation.workspace;
    const correlationStatus = correlation.status;
    if (correlationStatus !== 'qualified') workspaceCorrelationBlocked = true;
    const workspaceId = String(qualifiedWorkspace?.id || workspace.id || workspace.workspaceId || 'workspace');
    const packagedEntries = [];
    for (const entry of workspace.entries || []) {
      if (!hasBytes(entry)) continue;
      const file = finalizeFile({ path: workspacePackagePath(workspace, entry, workspaceId), kind: 'handoff-workspace-material', logicalKind: 'recipient-relative-workspace-byte-carrier', entryId: `workspace:${workspaceId}:${entry.path || ''}`, mediaType: entry.mediaType || entry.type || 'application/octet-stream', data: packageFileBytes(entry), boundary: workspaceCarrierBoundary(qualifiedWorkspace) });
      extraFiles.push(file);
      packagedEntries.push(Object.freeze({ path: String(entry.path || ''), packagePath: file.path, bytes: file.bytes, sha256: file.sha256, referenceTarget: String(entry.referenceTarget || '') }));
    }
    packagedWorkspaces.push(Object.freeze({ id: workspaceId, transportCorrelationKey, correlationStatus, entries: Object.freeze(packagedEntries) }));
  }
  let bootstrapPath = '';
  let bootstrapCarrierBlocked = false;
  if (plan.bootstrap?.status === 'present') {
    const bootstrapPresented = input.bootstrap?.present === true || input.bootstrap?.include === true;
    const bootstrapData = packageFileBytes(input.bootstrap || {});
    if (!bootstrapPresented || bootstrapData.byteLength === 0) {
      bootstrapCarrierBlocked = true;
    } else {
      bootstrapPath = safePath(input.bootstrap?.path || 'tiinex.package/bootstrap.md');
      extraFiles.push(finalizeFile({ path: bootstrapPath, kind: 'handoff-bootstrap', logicalKind: 'transport-orientation', mediaType: String(input.bootstrap?.mediaType || input.bootstrap?.type || 'text/markdown'), data: bootstrapData, boundary: 'Optional transport orientation only; not a Tiinex artifact or workspace lineage member.' }));
    }
  }
  let additionalTransportBlocked = false;
  const additionalTransportPaths = new Set();
  for (const entry of input.additionalTransportFiles || []) {
    const filePath = safePath(entry.path || '');
    const data = packageFileBytes(entry);
    if (!filePath || data.byteLength === 0 || additionalTransportPaths.has(filePath) || reservedGeneratedPath(filePath)) {
      additionalTransportBlocked = true;
      continue;
    }
    additionalTransportPaths.add(filePath);
    extraFiles.push(finalizeFile({
      path: filePath,
      kind: String(entry.kind || 'handoff-transport-material'),
      logicalKind: String(entry.logicalKind || 'recipient-relative-transport-material'),
      entryId: String(entry.entryId || ''),
      mediaType: String(entry.mediaType || entry.type || 'application/octet-stream'),
      data,
      boundary: String(entry.boundary || 'Additional recipient-relative transport byte; package placement does not create semantic authority.'),
      sourceBoundary: String(entry.sourceBoundary || '')
    }));
  }
  const localRunId = String(input.localRunId || `handoff-closure:${stableFingerprintBytes(utf8Bytes(JSON.stringify({ handoff: plan.handoff, required: plan.requirements?.required?.map((x) => [x.requirementId, x.disposition]), reference: plan.requirements?.reference?.map((x) => [x.requirementId, x.disposition]) })))}`);
  const descriptor = buildHandoffClosureDescriptor(plan, { materialized: packagedMaterial, workspaces: packagedWorkspaces, bootstrapPath, localRunId, planInputBinding, materializedOutputQualification });
  const descriptorFile = finalizeFile({ path: HANDOFF_CLOSURE_DESCRIPTOR_PATH, kind: 'handoff-closure-descriptor', logicalKind: 'disposable-transport-control', mediaType: 'application/json', content: `${stablePrettyJson(descriptor)}\n`, boundary: descriptor.boundary });
  const packageClosureStatus = planReadiness.state === 'qualified' && planReadiness.expectedRequiredClosureReady && planInputBinding.state === 'qualified' && materializedOutputQualification.state === 'qualified' && baseBundle.status !== 'blocked' && !workspaceCorrelationBlocked && !bootstrapCarrierBlocked && !additionalTransportBlocked ? (baseBundle.status === 'degraded' ? 'degraded' : 'ready') : 'blocked';
  const projectionBundle = { ...baseBundle, files: [...(baseBundle.files || []), ...extraFiles, descriptorFile], handoffClosure: descriptor };
  const carrierProjection = buildHandoffCarrierProjection({ bundle: projectionBundle, descriptor, routes: input.transportRoutes || input.handoffRoutes || [] });
  const carrierFile = finalizeFile({ path: HANDOFF_CARRIER_PROJECTION_PATH, kind: 'handoff-carrier-projection', logicalKind: 'disposable-human-transport-projection', mediaType: 'application/json', content: `${stablePrettyJson(carrierProjection)}\n`, boundary: carrierProjection.boundary });
  const pointerEntrypointProjection = buildHandoffPointerEntrypoints({ carrierProjection, createdAt: baseBundle.manifest?.createdAt || baseBundle.builtAt || '' });
  const pointerEntrypointFiles = pointerEntrypointProjection.entries.map((entry) => finalizeFile({ path: entry.path, kind: 'handoff-route-pointer', logicalKind: 'disposable-package-orientation-projection', mediaType: 'text/markdown', content: entry.markdown, boundary: entry.boundary }));
  const coldConsumerProjection = buildHandoffColdConsumerProjection({ carrierProjection });
  const coldConsumerEntrypointFile = finalizeFile({ path: HANDOFF_COLD_CONSUMER_ENTRYPOINT_PATH, kind: 'handoff-cold-consumer-entrypoint', logicalKind: 'disposable-package-orientation-projection', mediaType: 'text/markdown', content: renderHandoffColdConsumerEntrypoint({ projection: coldConsumerProjection }), boundary: coldConsumerProjection.boundary });
  const transportStatus = carrierProjection.mode === 'shared' && carrierProjection.status !== 'ready' ? 'blocked' : packageClosureStatus;
  const transportCompanion = buildHandoffTransportCompanionProjection({ bundle: baseBundle, descriptor, packageStatus: transportStatus, participation: input.transportParticipation || input.participation || {} });
  const companionFile = finalizeFile({ path: HANDOFF_TRANSPORT_COMPANION_PATH, kind: 'handoff-transport-companion', logicalKind: 'disposable-transport-projection', mediaType: 'application/json', content: `${stablePrettyJson(transportCompanion)}\n`, boundary: transportCompanion.boundary });
  const oldFileMapPath = 'tiinex.package/file-map.json';
  const buildReceiptPath = 'tiinex.package/build-receipt.json';
  const baseGoverned = [...(baseBundle.files || []).filter((file) => ![oldFileMapPath, buildReceiptPath].includes(String(file.path || ''))), ...extraFiles, descriptorFile, carrierFile, ...pointerEntrypointFiles, coldConsumerEntrypointFile, companionFile].map(finalizeFile);
  const materialRepresentationSha256 = packageMaterialRepresentationSha256(baseGoverned);
  const priorBuildReceipt = parseJsonFile((baseBundle.files || []).find((file) => String(file.path || '') === buildReceiptPath)) || {};
  const buildReceipt = Object.freeze({ ...priorBuildReceipt, materialRepresentationSha256, counts: Object.freeze({ ...(priorBuildReceipt.counts || {}), materialFiles: baseGoverned.filter((file) => file.path && !String(file.path).startsWith('tiinex.package/')).length }) });
  const buildReceiptFile = finalizeFile({ path: buildReceiptPath, kind: 'package-build-receipt', mediaType: 'application/json', content: `${stablePrettyJson(buildReceipt)}\n` });
  const governed = [...baseGoverned, buildReceiptFile].map(finalizeFile);
  const fileMap = buildExportPackageFileMap(governed, { packageId: baseBundle.packageId || '' });
  const fileMapFile = finalizeFile({ path: oldFileMapPath, kind: 'package-file-map', mediaType: 'application/json', content: `${stablePrettyJson(fileMap)}\n` });
  const files = Object.freeze([...governed, fileMapFile]);
  const status = transportStatus;
  const bundle = deepFreeze({ ...baseBundle, schema: baseBundle.schema, status, files, fileMap, packageRepresentationSha256: fileMap.representationSha256, handoffClosure: descriptor, boundary: `${baseBundle.boundary} Recipient-relative Handoff closure descriptor/material are disposable transport controls and do not alter semantic Handoff or workspace truth.` });
  const inspection = inspectExportPackageBundle(bundle);
  const closureInspection = inspectHandoffClosureDescriptor(bundle);
  const carrierInspection = inspectHandoffCarrierProjection(bundle);
  const pointerEntrypointInspection = inspectHandoffPointerEntrypoints(bundle);
  const coldConsumerEntrypointInspection = inspectHandoffColdConsumerEntrypoint(bundle);
  const companionInspection = inspectHandoffTransportCompanion(bundle);
  return deepFreeze({ schema: PORTABLE_HANDOFF_TRANSPORT_PACKAGE_SCHEMA_ID, status: inspection.status === 'valid' && closureInspection.status === 'valid' && carrierInspection.status === 'valid' && pointerEntrypointInspection.status === 'valid' && coldConsumerEntrypointInspection.status === 'valid' && companionInspection.status === 'valid' ? status : 'blocked', plan, planReadiness, planInputBinding, materializedOutputQualification, bundle, inspection, closureInspection, descriptor, carrierProjection, carrierInspection, pointerEntrypointProjection, pointerEntrypointInspection, coldConsumerProjection, coldConsumerEntrypointInspection, transportCompanion, companionInspection });
}

export function roundTripRecipientRelativeHandoffTransportPackage(input = {}, options = {}) {
  const built = input.bundle ? input : buildRecipientRelativeHandoffTransportPackage(input, options);
  const bundle = built.bundle || input.bundle;
  const runtime = roundTripPortableRuntimePackage({ bundle });
  const closureInspection = inspectHandoffClosureDescriptor(bundle);
  const carrierInspection = inspectHandoffCarrierProjection(bundle);
  const pointerEntrypointInspection = inspectHandoffPointerEntrypoints(bundle);
  const coldConsumerEntrypointInspection = inspectHandoffColdConsumerEntrypoint(bundle);
  const companionInspection = inspectHandoffTransportCompanion(bundle);
  const status = runtime.status.startsWith('passed') && closureInspection.status === 'valid' && carrierInspection.status === 'valid' && pointerEntrypointInspection.status === 'valid' && coldConsumerEntrypointInspection.status === 'valid' && companionInspection.status === 'valid' ? 'passed' : 'failed';
  return deepFreeze({ schema: 'tiinex.portable.handoff-transport-package.roundtrip.v1', status, built, runtime, closureInspection, carrierInspection, pointerEntrypointInspection, coldConsumerEntrypointInspection, companionInspection, verification: Object.freeze({ descriptorPath: HANDOFF_CLOSURE_DESCRIPTOR_PATH, descriptorVerified: closureInspection.status === 'valid', carrierProjectionPath: HANDOFF_CARRIER_PROJECTION_PATH, carrierProjectionVerified: carrierInspection.status === 'valid', pointerEntrypointsVerified: pointerEntrypointInspection.status === 'valid', coldConsumerEntrypointPath: HANDOFF_COLD_CONSUMER_ENTRYPOINT_PATH, coldConsumerEntrypointVerified: coldConsumerEntrypointInspection.status === 'valid', companionPath: HANDOFF_TRANSPORT_COMPANION_PATH, companionVerified: companionInspection.status === 'valid', packageRoundtrip: runtime.status, requiredClosureReady: Boolean(built.plan?.requiredClosureReady) }) });
}


function indexWorkspaceMaterializationTruth(items = []) {
  const index = new Map();
  for (const workspace of items) {
    const qualification = qualifyWorkspaceMaterializationCorrelationEntry(workspace);
    if (qualification.state !== 'qualified') continue;
    const key = qualification.key;
    const current = index.get(key);
    if (!current) index.set(key, Object.freeze({ status: 'qualified', workspace }));
    else index.set(key, Object.freeze({ status: 'ambiguous', workspace: null }));
  }
  return index;
}

function countWorkspaceCorrelationKeys(items = []) {
  const counts = new Map();
  for (const workspace of items) {
    const key = workspaceMaterializationCorrelationKey(workspace);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return counts;
}

function resolveWorkspaceMaterializationTruth(index, key = '', rawCount = 0) {
  if (!key || rawCount !== 1) return Object.freeze({ status: rawCount > 1 ? 'ambiguous' : 'unresolved', workspace: null });
  const entry = index.get(String(key || ''));
  if (!entry) return Object.freeze({ status: 'unresolved', workspace: null });
  return entry;
}


function workspaceCarrierBoundary(workspace = null) {
  if (workspace?.qualification === 'qualified' && workspace?.materialization === 'complete') return 'Package-local complete-evidence-backed workspace byte carrier; directory shape is not completeness proof.';
  if (workspace?.qualification && workspace.qualification !== 'qualified') return `Package-local partial workspace byte carrier; planner-qualified workspace truth is ${workspace.materialization || 'partial'}/${workspace.qualification}. Raw caller completeness claims are not package authority.`;
  return 'Package-local partial workspace byte carrier; directory shape is not completeness proof.';
}

function reservedGeneratedPath(value = '') { const path = String(value || ''); return path.startsWith(HANDOFF_POINTER_ENTRYPOINT_PREFIX) || ['tiinex.package/file-map.json', 'tiinex.package/build-receipt.json', HANDOFF_CLOSURE_DESCRIPTOR_PATH, HANDOFF_CARRIER_PROJECTION_PATH, HANDOFF_COLD_CONSUMER_ENTRYPOINT_PATH, HANDOFF_TRANSPORT_COMPANION_PATH].includes(path); }
function materialPackagePath(entry = {}) { return safePath(entry.requestedPackagePath || `handoff.material/${safeToken(entry.requirementId || 'material')}/material.bin`); }
function workspacePackagePath(workspace = {}, entry = {}, qualifiedWorkspaceId = '') { return safePath(entry.packagePath || `handoff.workspaces/${safeToken(qualifiedWorkspaceId || workspace.id || workspace.workspaceId || 'workspace')}/${safePath(entry.path || 'material.bin')}`); }
function safePath(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\/+/, '').split('/').filter((part) => part && part !== '.' && part !== '..').map((part) => part.replace(/[\u0000-\u001f<>:"|?*]/g, '_')).join('/') || 'material.bin'; }
function safeToken(value = '') { return String(value || '').trim().replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100) || 'material'; }
function hasBytes(value = {}) { return packageFileBytes(value).byteLength > 0; }
function parseJsonFile(file = {}) { try { return JSON.parse(new TextDecoder().decode(packageFileBytes(file))); } catch { return null; } }
function stablePrettyJson(value) { return JSON.stringify(sortJson(value), null, 2); }
function sortJson(value) { if (Array.isArray(value)) return value.map(sortJson); if (!value || typeof value !== 'object') return value; if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return undefined; return Object.fromEntries(Object.keys(value).sort().flatMap((key) => { const sorted = sortJson(value[key]); return typeof sorted === 'undefined' ? [] : [[key, sorted]]; })); }
function deepFreeze(value) { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value; for (const child of Object.values(value)) deepFreeze(child); return Object.freeze(value); }
