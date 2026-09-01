import { buildExportPackageBundle } from '../../../export/package.builder.js';
import { buildExportPackageFileMap, finalizeFile } from '../../../export/package.fileMap.js';
import { packageFileBytes, sha256Hex, stableFingerprintBytes, utf8Bytes } from '../../../export/package.bytes.js';
import { packageMaterialRepresentationSha256 } from '../../../export/package.controlIntegrity.js';
import { planRecipientRelativeHandoffMaterialClosure, workspaceMaterializationCorrelationKey } from './materialClosure.plan.js';
import { buildHandoffClosureDescriptor, HANDOFF_CLOSURE_DESCRIPTOR_PATH } from './materialClosure.descriptor.js';
import { qualifyHandoffMaterialClosurePlanReadiness } from './materialClosure.readiness.js';
import { qualifyHandoffMaterialClosurePlanInputBinding } from './materialClosure.inputBinding.js';
import { qualifyHandoffMaterializedOutput } from './materialClosure.materialized.js';
import { HANDOFF_CARRIER_PROJECTION_PATH } from './carrierProjection.js';
import { HANDOFF_COLD_CONSUMER_ENTRYPOINT_PATH } from './coldConsumerEntrypoint.js';
import { HANDOFF_POINTER_ENTRYPOINT_PREFIX } from './pointerEntrypoint.js';
import { HANDOFF_TRANSPORT_COMPANION_PATH } from './transportCompanion.js';

export const PORTABLE_HANDOFF_V2_DIRECT_BASELINE_SCHEMA_ID = 'tiinex.portable.handoff-v2-direct-baseline.v1';

export function buildRecipientRelativeHandoffV2DirectBaseline(input = {}, options = {}) {
  const plan = input.plan || planRecipientRelativeHandoffMaterialClosure(input, options);
  const planReadiness = qualifyHandoffMaterialClosurePlanReadiness(plan);
  const planInputBinding = qualifyHandoffMaterialClosurePlanInputBinding(plan, input, { externallySupplied: Boolean(input.plan) });
  const materializedOutputQualification = qualifyHandoffMaterializedOutput(plan);
  const baseBundle = input.baseBundle || buildExportPackageBundle(input.workspace || {}, { ...(input.packageInput || {}), ...(options.packageInput || {}) });
  const extraFiles = [];
  const packagedMaterial = [];
  for (const entry of materializedOutputQualification.state === 'qualified' ? materializedOutputQualification.expected : []) {
    const file = finalizeFile({
      path: materialPackagePath(entry),
      kind: 'handoff-material',
      logicalKind: 'recipient-relative-material',
      entryId: entry.requirementId,
      mediaType: entry.mediaType || 'application/octet-stream',
      data: entry.data,
      boundary: 'Recipient-relative exact byte carrier. Canonical artifact/source/workspace authority remains external and is preserved in the closure descriptor.'
    });
    extraFiles.push(file);
    packagedMaterial.push(Object.freeze({ ...entry, packagePath: file.path, bytes: file.bytes, sha256: file.sha256 }));
  }

  const directWorkspaceSources = [];
  const packagedWorkspaces = [];
  const planByCorrelation = indexPlanWorkspaces(plan.workspaceMaterializations || []);
  const rawCorrelationCounts = countRawCorrelations(input.workspaceMaterializations || []);
  let workspaceCorrelationBlocked = false;
  for (const rawWorkspace of input.workspaceMaterializations || []) {
    const transportCorrelationKey = workspaceMaterializationCorrelationKey(rawWorkspace);
    const matches = planByCorrelation.get(transportCorrelationKey) || [];
    const rawCount = rawCorrelationCounts.get(transportCorrelationKey) || 0;
    const qualifiedWorkspace = matches.length === 1 && rawCount === 1 ? matches[0] : null;
    const correlationStatus = qualifiedWorkspace ? 'qualified' : (matches.length > 1 || rawCount > 1 ? 'ambiguous' : 'unresolved');
    if (!qualifiedWorkspace) workspaceCorrelationBlocked = true;
    const workspaceId = String(qualifiedWorkspace?.id || rawWorkspace.id || rawWorkspace.workspaceId || 'workspace');
    packagedWorkspaces.push(Object.freeze({
      id: workspaceId,
      transportCorrelationKey,
      correlationStatus,
      entries: Object.freeze((qualifiedWorkspace?.includedEntries || []).map((entry) => Object.freeze({ ...entry })))
    }));
    directWorkspaceSources.push(Object.freeze({ workspaceId, transportCorrelationKey, correlationStatus, workspace: rawWorkspace }));
  }
  if ((plan.workspaceMaterializations || []).length !== packagedWorkspaces.length) workspaceCorrelationBlocked = true;

  let bootstrapPath = '';
  let bootstrapCarrierBlocked = false;
  if (plan.bootstrap?.status === 'present') {
    const bootstrapPresented = input.bootstrap?.present === true || input.bootstrap?.include === true;
    const bootstrapData = packageFileBytes(input.bootstrap || {});
    if (!bootstrapPresented || bootstrapData.byteLength === 0) bootstrapCarrierBlocked = true;
    else {
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
  const semanticReady = planReadiness.state === 'qualified' && planReadiness.expectedRequiredClosureReady && planInputBinding.state === 'qualified' && materializedOutputQualification.state === 'qualified' && baseBundle.status !== 'blocked' && !workspaceCorrelationBlocked && !bootstrapCarrierBlocked && !additionalTransportBlocked;
  const status = semanticReady ? (baseBundle.status === 'degraded' ? 'degraded' : 'ready') : 'blocked';

  const oldFileMapPath = 'tiinex.package/file-map.json';
  const buildReceiptPath = 'tiinex.package/build-receipt.json';
  const baseGoverned = [...(baseBundle.files || []).filter((file) => ![oldFileMapPath, buildReceiptPath].includes(String(file.path || ''))), ...extraFiles, descriptorFile].map(finalizeFile);
  const materialRepresentationSha256 = packageMaterialRepresentationSha256(baseGoverned);
  const priorBuildReceipt = parseJsonFile((baseBundle.files || []).find((file) => String(file.path || '') === buildReceiptPath)) || {};
  const buildReceipt = Object.freeze({ ...priorBuildReceipt, operation: 'archive-backed-handoff-carrier-v2-direct-baseline', materialRepresentationSha256, counts: Object.freeze({ ...(priorBuildReceipt.counts || {}), materialFiles: baseGoverned.filter((file) => file.path && !String(file.path).startsWith('tiinex.package/')).length }), handoffCarrierVersion: 2 });
  const buildReceiptFile = finalizeFile({ path: buildReceiptPath, kind: 'package-build-receipt', mediaType: 'application/json', content: `${stablePrettyJson(buildReceipt)}\n` });
  const governed = [...baseGoverned, buildReceiptFile].map(finalizeFile);
  const fileMap = buildExportPackageFileMap(governed, { packageId: baseBundle.packageId || '' });
  const fileMapFile = finalizeFile({ path: oldFileMapPath, kind: 'package-file-map', mediaType: 'application/json', content: `${stablePrettyJson(fileMap)}\n` });
  const files = Object.freeze([...governed, fileMapFile]);
  const bundle = deepFreeze({ ...baseBundle, status, files, fileMap, packageRepresentationSha256: fileMap.representationSha256, handoffClosure: descriptor, boundary: `${baseBundle.boundary || ''} Direct v2 semantic baseline retains planning/closure truth without exploded complete-workspace outer carriage.` });

  return deepFreeze({
    schema: PORTABLE_HANDOFF_V2_DIRECT_BASELINE_SCHEMA_ID,
    status,
    executable: semanticReady,
    transportExecutable: false,
    plan,
    planReadiness,
    planInputBinding,
    materializedOutputQualification,
    bundle,
    descriptor,
    directWorkspaceSources: Object.freeze(directWorkspaceSources),
    findings: Object.freeze([...(plan.findings || [])]),
    boundary: 'Internal canonical archive-backed manufacture baseline. It reuses shared planning/material-closure owners while deliberately omitting exploded complete-Workspace carrier bytes before archive-backed representation is built.'
  });
}

function indexPlanWorkspaces(items = []) {
  const map = new Map();
  for (const workspace of items) {
    const key = String(workspace.transportCorrelationKey || '');
    const list = map.get(key) || [];
    list.push(workspace);
    map.set(key, list);
  }
  return map;
}
function countRawCorrelations(items = []) {
  const map = new Map();
  for (const workspace of items) {
    const key = workspaceMaterializationCorrelationKey(workspace);
    map.set(key, (map.get(key) || 0) + 1);
  }
  return map;
}
function reservedGeneratedPath(value = '') {
  const path = String(value || '');
  return path.startsWith(HANDOFF_POINTER_ENTRYPOINT_PREFIX) || ['tiinex.package/file-map.json', 'tiinex.package/build-receipt.json', HANDOFF_CLOSURE_DESCRIPTOR_PATH, HANDOFF_CARRIER_PROJECTION_PATH, HANDOFF_COLD_CONSUMER_ENTRYPOINT_PATH, HANDOFF_TRANSPORT_COMPANION_PATH].includes(path);
}
function materialPackagePath(entry = {}) { return safePath(entry.requestedPackagePath || `handoff.material/${safeToken(entry.requirementId || 'material')}/material.bin`); }
function safePath(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\/+/, '').split('/').filter((part) => part && part !== '.' && part !== '..').map((part) => part.replace(/[\u0000-\u001f<>:"|?*]/g, '_')).join('/') || 'material.bin'; }
function safeToken(value = '') { const raw = String(value || ''); const token = raw.trim().replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, ''); if (!token) return 'material'; if (token.length <= 100) return token; return `${token.slice(0, 87)}-${sha256Hex(utf8Bytes(raw)).slice(0, 12)}`; }
function parseJsonFile(file = {}) { try { return JSON.parse(new TextDecoder().decode(packageFileBytes(file))); } catch { return null; } }
function stablePrettyJson(value) { return JSON.stringify(sortJson(value), null, 2); }
function sortJson(value) { if (Array.isArray(value)) return value.map(sortJson); if (!value || typeof value !== 'object') return value; if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return undefined; return Object.fromEntries(Object.keys(value).sort().flatMap((key) => { const sorted = sortJson(value[key]); return typeof sorted === 'undefined' ? [] : [[key, sorted]]; })); }
function deepFreeze(value) { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value; for (const child of Object.values(value)) deepFreeze(child); return Object.freeze(value); }
