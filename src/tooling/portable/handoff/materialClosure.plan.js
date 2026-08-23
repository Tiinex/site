import { projectHandoffMaterialRequirements } from './materialClosure.requirements.js';
import { collectHandoffMaterialCandidates, resolveRequirementMaterial } from './materialClosure.materials.js';
import { packageFileBytes, sha256Hex } from '../../../export/package.bytes.js';
import { buildHandoffMaterialClosurePlanInputBinding } from './materialClosure.inputBinding.js';

export const PORTABLE_HANDOFF_MATERIAL_CLOSURE_PLAN_SCHEMA_ID = 'tiinex.portable.handoff-material-closure-plan.v1';

export function planRecipientRelativeHandoffMaterialClosure(input = {}, options = {}) {
  const findings = [];
  const requirements = input.requirements || projectHandoffMaterialRequirements(input.handoff || {});
  const candidates = collectHandoffMaterialCandidates(input);
  const policy = Object.freeze({
    preferReferenceWhenResolvable: input.preferReferenceWhenResolvable !== false,
    includeReferenceMaterial: input.includeReferenceMaterial === true,
    bootstrap: input.bootstrap?.present === true || input.bootstrap?.include === true ? 'present' : 'absent'
  });
  const required = requirements.required.map((requirement) => resolveRequirementMaterial(requirement, candidates, input.recipient || {}, policy));
  const reference = requirements.reference.map((requirement) => referenceDisposition(requirement, candidates, input.recipient || {}, policy));
  const workspaces = qualifyWorkspaceMaterializations(input.workspaceMaterializations || [], findings);
  const inputBinding = buildHandoffMaterialClosurePlanInputBinding(requirements, input.recipient || {}, { required, reference }, { policy, bootstrap: input.bootstrap || {} });
  const requiredBlocked = required.some((item) => ['unresolved', 'ambiguous', 'integrity-conflict'].includes(item.disposition));
  const workspaceBlocked = workspaces.some((item) => item.qualification === 'invalid-completeness-claim');
  const ready = !requiredBlocked && !workspaceBlocked;
  for (const item of required) if (['unresolved', 'ambiguous', 'integrity-conflict'].includes(item.disposition)) findings.push(finding('error', `portable.handoff-material.required.${item.disposition}`, item.reason, { requirementId: item.requirementId, referenceTarget: item.referenceTarget }));
  for (const item of reference) if (item.disposition === 'ambiguous' || item.disposition === 'integrity-conflict') findings.push(finding('warning', `portable.handoff-material.reference.${item.disposition}`, item.reason, { requirementId: item.requirementId, referenceTarget: item.referenceTarget }));
  const materialized = [...required, ...reference].filter((item) => item.disposition === 'materialized' && item.selectedMaterial).map((item) => materializedPlanEntry(item));
  return deepFreeze({
    schema: PORTABLE_HANDOFF_MATERIAL_CLOSURE_PLAN_SCHEMA_ID,
    status: ready ? 'ready' : 'blocked',
    requiredClosureReady: ready,
    semanticHandoffStatus: String(requirements.handoff?.semanticStatus || 'unknown'),
    boundary: 'Recipient-relative disposable transport plan. It does not change Handoff validity/state, artifact identity, workspace ownership, provider semantics, or acceptance/completion.',
    handoff: requirements.handoff,
    inputBinding,
    policy,
    requirements: Object.freeze({ required: Object.freeze(required), reference: Object.freeze(reference) }),
    materialized: Object.freeze(materialized),
    workspaceMaterializations: Object.freeze(workspaces),
    bootstrap: Object.freeze({ status: policy.bootstrap, boundary: 'Optional transport orientation only; not Handoff semantics, workspace authority, or artifact identity.' }),
    findings: Object.freeze([...(requirements.findings || []), ...findings])
  });
}

function referenceDisposition(requirement, candidates, recipient, policy) {
  if (!policy.includeReferenceMaterial) {
    const resolved = resolveRequirementMaterial(requirement, candidates, recipient, policy);
    if (resolved.disposition === 'reference-sufficient') return resolved;
    return Object.freeze({ ...resolved, disposition: 'omitted-by-plan', selectedMaterial: null, reason: 'Reference-only material was intentionally omitted by this recipient-relative plan.' });
  }
  return resolveRequirementMaterial(requirement, candidates, recipient, policy);
}

function materializedPlanEntry(item) {
  const material = item.selectedMaterial || {};
  return Object.freeze({
    requirementId: item.requirementId,
    classification: item.classification,
    referenceTarget: item.referenceTarget,
    path: material.path,
    requestedPackagePath: material.packagePath,
    bytes: material.bytes,
    sha256: material.sha256,
    mediaType: material.mediaType,
    provider: material.provider,
    provenance: material.provenance,
    authority: material.authority,
    data: material.data
  });
}

function qualifyWorkspaceMaterializations(items, findings) {
  return Object.freeze((items || []).map((item, index) => {
    const qualified = qualifyWorkspaceMaterialization(item, index, findings);
    const transportCorrelationEvidence = workspaceMaterializationCorrelationEvidence(item, qualified);
    return deepFreeze({ ...qualified, transportCorrelationEvidence, transportCorrelationKey: workspaceMaterializationCorrelationKeyFromEvidence(transportCorrelationEvidence) });
  }));
}

function qualifyWorkspaceMaterialization(item = {}, index = 0, findings = null) {
  const requested = String(item.state || item.materialization || 'partial');
  const completeEvidence = item.completenessEvidence?.state === 'qualified' || item.completeEvidence?.state === 'qualified';
  const qualification = requested === 'complete' && !completeEvidence ? 'invalid-completeness-claim' : 'qualified';
  if (qualification !== 'qualified' && findings) findings.push(finding('error', 'portable.handoff-material.workspace.complete-unproven', 'Workspace materialization claimed complete without qualified completeness evidence for the declared workspace boundary.', { workspaceId: item.id || item.workspaceId || `workspace-${index}` }));
  return deepFreeze({
    id: String(item.id || item.workspaceId || `workspace-${index}`),
    title: String(item.title || item.name || item.workspaceTitle || item.id || item.workspaceId || `workspace-${index}`),
    source: Object.freeze({ ...(item.source || {}) }),
    materialization: requested === 'complete' && completeEvidence ? 'complete' : 'partial',
    qualification,
    completenessEvidence: Object.freeze({ ...(item.completenessEvidence || item.completeEvidence || {}) }),
    includedEntries: Object.freeze((item.includedEntries || item.entries || []).map(normalizeIncludedEntry))
  });
}

export function workspaceMaterializationCorrelationEvidence(item = {}, prequalified = null) {
  const qualified = prequalified || qualifyWorkspaceMaterialization(item);
  return deepFreeze(sortJson({
    schema: 'tiinex.portable.handoff-workspace-transport-correlation-evidence.v1',
    declared: {
      id: String(item.id || ''),
      workspaceId: String(item.workspaceId || ''),
      requestedMaterialization: String(item.state || item.materialization || 'partial')
    },
    source: serializable(item.source || {}),
    completenessEvidence: serializable(item.completenessEvidence || item.completeEvidence || {}),
    carrierEntries: (item.entries || []).map((entry) => carrierCorrelationEntry(entry)),
    qualifiedTruth: {
      materialization: String(qualified.materialization || 'partial'),
      qualification: String(qualified.qualification || ''),
      completenessEvidence: serializable(qualified.completenessEvidence || {}),
      includedEntries: (qualified.includedEntries || []).map(normalizeIncludedEntry)
    }
  }));
}

export function workspaceMaterializationCorrelationKey(item = {}) {
  return workspaceMaterializationCorrelationKeyFromEvidence(workspaceMaterializationCorrelationEvidence(item));
}

export function workspaceMaterializationCorrelationKeyFromEvidence(evidence = {}) {
  return JSON.stringify(sortJson(serializable(evidence)));
}

export function qualifyWorkspaceMaterializationCorrelationEntry(item = {}) {
  const evidence = item?.transportCorrelationEvidence
    ? deepFreeze(sortJson(serializable(item.transportCorrelationEvidence)))
    : workspaceMaterializationCorrelationEvidence(item);
  const key = String(item?.transportCorrelationKey || '');
  const expectedKey = workspaceMaterializationCorrelationKeyFromEvidence(evidence);
  const findings = [];
  if (!key) findings.push('transport-correlation-key-missing');
  else if (key !== expectedKey) findings.push('transport-correlation-key-stale');
  const qualifiedTruth = evidence.qualifiedTruth || {};
  if (stableJson(item.source || {}) !== stableJson(evidence.source || {})) findings.push('transport-correlation-source-mismatch');
  if (String(item.materialization || '') !== String(qualifiedTruth.materialization || '')) findings.push('transport-correlation-materialization-mismatch');
  if (String(item.qualification || '') !== String(qualifiedTruth.qualification || '')) findings.push('transport-correlation-qualification-mismatch');
  if (stableJson(item.completenessEvidence || {}) !== stableJson(qualifiedTruth.completenessEvidence || {})) findings.push('transport-correlation-completeness-evidence-mismatch');
  if (stableJson(item.includedEntries || []) !== stableJson(qualifiedTruth.includedEntries || [])) findings.push('transport-correlation-included-entries-mismatch');
  return Object.freeze({ state: findings.length ? 'invalid' : 'qualified', key, expectedKey, evidence, findings: Object.freeze(findings) });
}

function carrierCorrelationEntry(entry = {}) {
  const data = packageFileBytes(entry);
  return Object.freeze({
    path: String(entry.path || ''),
    requestedPackagePath: String(entry.packagePath || ''),
    referenceTarget: String(entry.referenceTarget || ''),
    mediaType: String(entry.mediaType || entry.type || ''),
    bytes: data.byteLength,
    sha256: sha256Hex(data)
  });
}

function normalizeIncludedEntry(entry = {}) {
  return Object.freeze({ path: String(entry.path || ''), sha256: String(entry.sha256 || ''), bytes: Number(entry.bytes || 0), referenceTarget: String(entry.referenceTarget || '') });
}

function stableJson(value) { return JSON.stringify(sortJson(serializable(value))); }


function serializable(value = {}) {
  if (Array.isArray(value)) return value.map(serializable);
  if (!value || typeof value !== 'object') return value;
  if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return undefined;
  return Object.fromEntries(Object.entries(value).flatMap(([key, item]) => {
    if (typeof item === 'function' || typeof item === 'undefined') return [];
    const normalized = serializable(item);
    return typeof normalized === 'undefined' ? [] : [[key, normalized]];
  }));
}
function sortJson(value) {
  if (Array.isArray(value)) return value.map(sortJson);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])]));
}

function finding(severity, code, message, extra = {}) { return Object.freeze({ severity, code, message, ...extra }); }
function deepFreeze(value) { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value; for (const child of Object.values(value)) deepFreeze(child); return Object.freeze(value); }
