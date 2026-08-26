import { packageFileBytes, sha256Hex } from '../../../export/package.bytes.js';
import { qualifyHandoffMaterialClosurePlanReadiness } from './materialClosure.readiness.js';
import { buildHandoffWorkspaceByteProvider, resolveHandoffWorkspaceEntry } from './workspaceByteProvider.js';

export const HANDOFF_CLOSURE_DESCRIPTOR_SCHEMA_ID = 'tiinex.transport.handoff-material-closure-descriptor.v1';
export const HANDOFF_CLOSURE_DESCRIPTOR_V2_SCHEMA_ID = 'tiinex.transport.handoff-material-closure-descriptor.v2';
export const HANDOFF_CLOSURE_DESCRIPTOR_PATH = 'tiinex.package/handoff-closure.json';

export function buildHandoffClosureDescriptor(plan = {}, packageMaterial = {}) {
  const materialized = (packageMaterial.materialized || []).map((entry) => descriptorMaterial(entry));
  const packagedWorkspaceByCorrelation = indexPackagedWorkspaces(packageMaterial.workspaces || []);
  const workspaces = (plan.workspaceMaterializations || []).map((workspace) => {
    const packagedResolution = resolvePackagedWorkspace(packagedWorkspaceByCorrelation, workspace.transportCorrelationKey);
    const packaged = packagedResolution.workspace || {};
    const correlationStatus = packagedResolution.status === 'qualified' ? String(packaged.correlationStatus || 'unresolved') : packagedResolution.status;
    const entries = correlationStatus === 'qualified' && (packaged.entries || []).length ? packaged.entries : workspace.includedEntries;
    return Object.freeze({
      id: workspace.id,
      title: String(workspace.title || workspace.id || ''),
      source: workspace.source,
      materialization: workspace.materialization,
      qualification: workspace.qualification,
      completenessEvidence: workspace.completenessEvidence,
      transportCorrelationKey: String(workspace.transportCorrelationKey || ''),
      correlationStatus,
      includedEntries: entries
    });
  });
  return deepFreeze({
    schema: HANDOFF_CLOSURE_DESCRIPTOR_SCHEMA_ID,
    version: 1,
    boundary: 'Disposable recipient-relative transport metadata. Safe to delete with the package; not a Tiinex artifact, semantic Parent, workspace owner, package identity, Handoff acceptance/completion state, or provider authority.',
    handoff: Object.freeze({ id: String(plan.handoff?.id || ''), path: String(plan.handoff?.path || ''), reference: String(plan.handoff?.reference || ''), semanticStatus: String(plan.semanticHandoffStatus || 'unknown') }),
    plan: Object.freeze({ status: String(plan.status || 'blocked'), requiredClosureReady: Boolean(plan.requiredClosureReady), localRunId: String(packageMaterial.localRunId || ''), inputBindingState: String(packageMaterial.planInputBinding?.state || 'unresolved'), inputBindingMode: String(packageMaterial.planInputBinding?.mode || 'unknown'), inputBindingFindings: Object.freeze([...(packageMaterial.planInputBinding?.findings || [])]), materializedOutputState: String(packageMaterial.materializedOutputQualification?.state || 'unresolved'), materializedOutputFindings: Object.freeze([...(packageMaterial.materializedOutputQualification?.findings || [])]) }),
    requirements: Object.freeze({
      required: Object.freeze((plan.requirements?.required || []).map(descriptorRequirement)),
      reference: Object.freeze((plan.requirements?.reference || []).map(descriptorRequirement)),
      endpointRoles: Object.freeze((plan.requirements?.endpointRoles || []).map(descriptorRequirement)),
      participantRoles: Object.freeze((plan.requirements?.participantRoles || []).map(descriptorRequirement)),
      dependencies: Object.freeze((plan.requirements?.dependencies || []).map(descriptorRequirement))
    }),
    materialized: Object.freeze(materialized),
    workspaceMaterializations: Object.freeze(workspaces),
    bootstrap: Object.freeze({ status: String(plan.bootstrap?.status || 'absent'), packagePath: String(packageMaterial.bootstrapPath || ''), boundary: String(plan.bootstrap?.boundary || '') }),
    providerProvenance: Object.freeze(materialized.map((entry) => Object.freeze({ requirementId: entry.requirementId, provider: entry.provider, provenance: entry.provenance }))),
    roundtripVerification: Object.freeze({
      state: 'build-verified',
      verifier: 'durable-file-map-plus-independent-archive-rehydration-required',
      descriptorPath: HANDOFF_CLOSURE_DESCRIPTOR_PATH,
      expectedMaterial: Object.freeze([
        ...materialized.map((entry) => Object.freeze({ packagePath: entry.packagePath, bytes: entry.bytes, sha256: entry.sha256 })),
        ...workspaces.flatMap((workspace) => (workspace.includedEntries || []).filter((entry) => entry.packagePath).map((entry) => Object.freeze({ packagePath: entry.packagePath, bytes: entry.bytes, sha256: entry.sha256 })))
      ]),
      note: 'Build evidence proves descriptor/material byte identities before archive serialization. Independent archive extraction/rehydration must verify the same governed bytes; descriptor presence does not prove delivery or Handoff acceptance.'
    })
  });
}

export function inspectHandoffClosureDescriptor(bundle = {}, options = {}) {
  const findings = [];
  const descriptorFile = (bundle.files || []).find((file) => String(file.path || '') === HANDOFF_CLOSURE_DESCRIPTOR_PATH);
  const descriptor = descriptorFile ? parseJsonFile(descriptorFile) : null;
  if (!descriptor) findings.push(finding('error', 'portable.handoff-closure.descriptor.missing', 'Handoff transport package is missing a readable package-local closure descriptor.'));
  const supportedSchema = descriptor && [HANDOFF_CLOSURE_DESCRIPTOR_SCHEMA_ID, HANDOFF_CLOSURE_DESCRIPTOR_V2_SCHEMA_ID].includes(String(descriptor.schema || ''));
  if (descriptor && !supportedSchema) findings.push(finding('error', 'portable.handoff-closure.descriptor.schema.invalid', 'Handoff closure descriptor schema/version is unsupported.'));
  const isV2 = String(descriptor?.schema || '') === HANDOFF_CLOSURE_DESCRIPTOR_V2_SCHEMA_ID;
  const byPath = new Map((bundle.files || []).map((file) => [String(file.path || ''), file]));
  const suppliedProvider = options.workspaceByteProvider || (options.schema === 'tiinex.portable.handoff-workspace-byte-provider.v1' ? options : null);
  const byteProvider = descriptor ? (suppliedProvider || buildHandoffWorkspaceByteProvider(bundle, descriptor)) : null;
  if (isV2 && byteProvider?.status !== 'ready') findings.push(...(byteProvider?.findings || []));

  for (const entry of descriptor?.materialized || []) {
    if (String(entry.carrierKind || '') === 'workspace-archive-entry') {
      const resolved = resolveHandoffWorkspaceEntry(byteProvider || {}, entry.workspaceId, entry.workspaceRelativePath);
      if (resolved.state !== 'qualified') { findings.push(finding('error', 'portable.handoff-closure.material.workspace-provider-unqualified', 'Descriptor materialized entry cannot be resolved through its qualified workspace archive provider.', { requirementId: entry.requirementId || '', workspaceId: entry.workspaceId || '', workspaceRelativePath: entry.workspaceRelativePath || '', reason: resolved.reason || resolved.state })); continue; }
      const data = packageFileBytes({ data: resolved.data });
      if (Number(entry.bytes || 0) !== data.byteLength) findings.push(finding('error', 'portable.handoff-closure.material.bytes-mismatch', 'Descriptor materialized entry byte length differs from workspace-provider bytes.', { requirementId: entry.requirementId || '', workspaceId: entry.workspaceId || '', workspaceRelativePath: entry.workspaceRelativePath || '' }));
      if (String(entry.sha256 || '') !== sha256Hex(data)) findings.push(finding('error', 'portable.handoff-closure.material.sha256-mismatch', 'Descriptor materialized entry digest differs from workspace-provider bytes.', { requirementId: entry.requirementId || '', workspaceId: entry.workspaceId || '', workspaceRelativePath: entry.workspaceRelativePath || '' }));
      continue;
    }
    const file = byPath.get(String(entry.packagePath || ''));
    if (!file) { findings.push(finding('error', 'portable.handoff-closure.material.missing', 'Descriptor materialized entry is missing from package bytes.', { requirementId: entry.requirementId || '', packagePath: entry.packagePath || '' })); continue; }
    const data = packageFileBytes(file);
    if (Number(entry.bytes || 0) !== data.byteLength) findings.push(finding('error', 'portable.handoff-closure.material.bytes-mismatch', 'Descriptor materialized entry byte length differs from package bytes.', { packagePath: entry.packagePath || '' }));
    if (String(entry.sha256 || '') !== sha256Hex(data)) findings.push(finding('error', 'portable.handoff-closure.material.sha256-mismatch', 'Descriptor materialized entry digest differs from package bytes.', { packagePath: entry.packagePath || '' }));
  }
  for (const workspace of descriptor?.workspaceMaterializations || []) {
    if (String(workspace.correlationStatus || '') !== 'qualified') findings.push(finding('error', 'portable.handoff-closure.workspace-correlation.unqualified', 'Descriptor workspace materialization is not uniquely correlated to one packaged workspace byte carrier.', { workspaceId: workspace.id || '', correlationStatus: workspace.correlationStatus || 'unresolved' }));
    if (isV2) continue;
    for (const entry of workspace.includedEntries || []) {
      if (!entry.packagePath) continue;
      const file = byPath.get(String(entry.packagePath || ''));
      if (!file) { findings.push(finding('error', 'portable.handoff-closure.workspace-material.missing', 'Descriptor workspace material entry is missing from package bytes.', { workspaceId: workspace.id || '', packagePath: entry.packagePath || '' })); continue; }
      const data = packageFileBytes(file);
      if (Number(entry.bytes || 0) !== data.byteLength) findings.push(finding('error', 'portable.handoff-closure.workspace-material.bytes-mismatch', 'Descriptor workspace material entry byte length differs from package bytes.', { workspaceId: workspace.id || '', packagePath: entry.packagePath || '' }));
      if (String(entry.sha256 || '') !== sha256Hex(data)) findings.push(finding('error', 'portable.handoff-closure.workspace-material.sha256-mismatch', 'Descriptor workspace material entry digest differs from package bytes.', { workspaceId: workspace.id || '', packagePath: entry.packagePath || '' }));
    }
  }
  if (descriptor?.bootstrap?.status === 'present' && !byPath.has(String(descriptor.bootstrap.packagePath || ''))) findings.push(finding('error', 'portable.handoff-closure.bootstrap.missing', 'Descriptor declares bootstrap present but the package-local bootstrap file is missing.', { packagePath: descriptor.bootstrap.packagePath || '' }));
  const readinessQualification = descriptor ? qualifyHandoffMaterialClosurePlanReadiness({
    status: descriptor.plan?.status,
    requiredClosureReady: descriptor.plan?.requiredClosureReady,
    requirements: descriptor.requirements,
    workspaceMaterializations: descriptor.workspaceMaterializations
  }) : null;
  if (readinessQualification?.findings.includes('required-closure-ready-contradictory')) findings.push(finding('error', 'portable.handoff-closure.readiness.inconsistent', 'Descriptor required closure readiness conflicts with blocking required-material or workspace-materialization truth.'));
  if (readinessQualification?.findings.includes('plan-status-contradictory')) findings.push(finding('error', 'portable.handoff-closure.plan-status.inconsistent', 'Descriptor plan status conflicts with blocking required-material or workspace-materialization truth.'));
  if (descriptor && String(descriptor.plan?.inputBindingState || '') !== 'qualified') findings.push(finding('error', 'portable.handoff-closure.plan-input-binding.unqualified', 'Descriptor plan is not qualified against the current parallel Handoff/recipient planning inputs.', { mode: descriptor.plan?.inputBindingMode || 'unknown', inputBindingFindings: descriptor.plan?.inputBindingFindings || [] }));
  if (descriptor && String(descriptor.plan?.materializedOutputState || '') !== 'qualified') findings.push(finding('error', 'portable.handoff-closure.materialized-output.unqualified', 'Descriptor plan materialized output is not qualified against its own selected material-resolution truth.', { materializedOutputFindings: descriptor.plan?.materializedOutputFindings || [] }));
  inspectRequirementMaterialCorrespondence(descriptor, findings);
  return deepFreeze({ schema: 'tiinex.transport.handoff-material-closure-descriptor.inspection.v1', status: findings.some((item) => item.severity === 'error') ? 'invalid' : 'valid', descriptor, findings: Object.freeze(dedupeFindings(findings)), ...(isV2 ? { workspaceByteProvider: byteProvider } : {}) });
}


function indexPackagedWorkspaces(items = []) {
  const index = new Map();
  for (const workspace of items) {
    const key = String(workspace?.transportCorrelationKey || '');
    if (!key) continue;
    const current = index.get(key);
    if (!current) index.set(key, Object.freeze({ status: 'qualified', workspace }));
    else index.set(key, Object.freeze({ status: 'ambiguous', workspace: null }));
  }
  return index;
}
function resolvePackagedWorkspace(index, key = '') {
  if (!key) return Object.freeze({ status: 'unresolved', workspace: null });
  return index.get(String(key || '')) || Object.freeze({ status: 'unresolved', workspace: null });
}


function descriptorRequirement(item = {}) {
  return Object.freeze({ requirementId: String(item.requirementId || ''), name: String(item.requirementName || item.name || ''), classification: String(item.classification || ''), disposition: String(item.disposition || ''), referenceTarget: String(item.referenceTarget || ''), reason: String(item.reason || ''), recipientReferenceCapability: Boolean(item.recipientReferenceCapability), routeWorkspaceId: String(item.routeWorkspaceId || ''), routePath: String(item.routePath || ''), sourceRequirementId: String(item.sourceRequirementId || ''), materializedPackagePath: String(item.packagePath || item.selectedMaterial?.packagePath || ''), selectedMaterial: descriptorSelectedMaterial(item.selectedMaterial) });
}
function descriptorSelectedMaterial(material = null) {
  if (!material) return null;
  return Object.freeze({ path: String(material.path || ''), requestedPackagePath: String(material.packagePath || ''), bytes: Number(material.bytes || 0), sha256: String(material.sha256 || ''), mediaType: String(material.mediaType || ''), provider: material.provider || {}, provenance: material.provenance || {}, authority: material.authority || {} });
}
function inspectRequirementMaterialCorrespondence(descriptor, findings) {
  if (!descriptor) return;
  const requirements = [...(descriptor.requirements?.required || []), ...(descriptor.requirements?.reference || []), ...(descriptor.requirements?.endpointRoles || []), ...(descriptor.requirements?.participantRoles || []), ...(descriptor.requirements?.dependencies || [])];
  const materialized = descriptor.materialized || [];
  const byRequirement = new Map();
  for (const carrier of materialized) {
    const id = String(carrier.requirementId || '');
    const list = byRequirement.get(id) || []; list.push(carrier); byRequirement.set(id, list);
  }
  const expectedIds = new Set();
  for (const requirement of requirements) {
    if (String(requirement.disposition || '') !== 'materialized') continue;
    const id = String(requirement.requirementId || ''); expectedIds.add(id);
    const carriers = byRequirement.get(id) || [];
    if (carriers.length === 0) { findings.push(finding('error', 'portable.handoff-closure.materialized-output.required-carrier-missing', 'A materialized requirement has no exact packaged carrier.', { requirementId: id })); continue; }
    if (carriers.length !== 1) { findings.push(finding('error', 'portable.handoff-closure.materialized-output.required-carrier-ambiguous', 'A materialized requirement has multiple packaged carriers without output-selection authority.', { requirementId: id, count: carriers.length })); continue; }
    const selected = requirement.selectedMaterial || {}; const carrier = carriers[0];
    if (!selected.sha256 || Number(selected.bytes || 0) <= 0) findings.push(finding('error', 'portable.handoff-closure.materialized-output.selected-material-unqualified', 'Materialized requirement lacks exact selected-material byte identity.', { requirementId: id }));
    if (String(carrier.sha256 || '') !== String(selected.sha256 || '') || Number(carrier.bytes || 0) !== Number(selected.bytes || 0) || String(carrier.classification || '') !== String(requirement.classification || '') || String(carrier.referenceTarget || '') !== String(requirement.referenceTarget || '')) findings.push(finding('error', 'portable.handoff-closure.materialized-output.carrier-mismatch', 'Packaged material carrier diverges from the requirement selected-material truth.', { requirementId: id }));
  }
  for (const carrier of materialized) if (!expectedIds.has(String(carrier.requirementId || ''))) findings.push(finding('error', 'portable.handoff-closure.materialized-output.unbound-carrier', 'Packaged material carrier is not bound to a requirement whose disposition is materialized.', { requirementId: carrier.requirementId || '', packagePath: carrier.packagePath || '' }));
}

function descriptorMaterial(entry = {}) {
  return Object.freeze({ requirementId: String(entry.requirementId || ''), classification: String(entry.classification || ''), referenceTarget: String(entry.referenceTarget || ''), routeWorkspaceId: String(entry.routeWorkspaceId || ''), routePath: String(entry.routePath || ''), sourceRequirementId: String(entry.sourceRequirementId || ''), packagePath: String(entry.packagePath || ''), originalPath: String(entry.path || ''), bytes: Number(entry.bytes || 0), sha256: String(entry.sha256 || ''), mediaType: String(entry.mediaType || ''), provider: entry.provider || {}, provenance: entry.provenance || {}, authority: entry.authority || {}, ...(entry.carrierKind ? { carrierKind: String(entry.carrierKind), workspaceId: String(entry.workspaceId || ''), workspaceRelativePath: String(entry.workspaceRelativePath || '') } : {}) });
}
function parseJsonFile(file = {}) { try { return JSON.parse(new TextDecoder().decode(packageFileBytes(file))); } catch { return null; } }
function finding(severity, code, message, extra = {}) { return Object.freeze({ severity, code, message, ...extra }); }
function dedupeFindings(items = []) { const map = new Map(); for (const item of items) { const key = `${item.severity || ''}:${item.code || ''}:${item.workspaceId || ''}:${item.requirementId || ''}:${item.packagePath || ''}:${item.workspaceRelativePath || ''}`; if (!map.has(key)) map.set(key, item); } return [...map.values()]; }
function deepFreeze(value) { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value; for (const child of Object.values(value)) deepFreeze(child); return Object.freeze(value); }
