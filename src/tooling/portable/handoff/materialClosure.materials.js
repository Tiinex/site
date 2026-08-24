import { packageFileBytes, sha256Hex } from '../../../export/package.bytes.js';

export const PORTABLE_HANDOFF_MATERIAL_CANDIDATE_SCHEMA_ID = 'tiinex.portable.handoff-material-candidate.v1';

export function collectHandoffMaterialCandidates(input = {}) {
  const out = [];
  for (const material of input.materials || []) out.push(normalizeCandidate(material, { providerId: material.providerId || 'supplied-material', providerKind: material.providerKind || 'supplied-material' }));
  for (const response of input.providerResults || []) {
    const providerId = String(response.providerId || response.provider?.id || 'provider-result');
    const providerKind = String(response.providerKind || response.provider?.kind || 'provider');
    for (const candidate of response.candidates || response.materials || []) out.push(normalizeCandidate({ ...candidate, requirementId: candidate.requirementId || response.requirementId, referenceTarget: candidate.referenceTarget || response.referenceTarget }, { providerId, providerKind, responseStatus: response.status || '' }));
  }
  for (const prior of input.priorPackages || []) {
    for (const candidate of prior.materials || []) out.push(normalizeCandidate({ ...candidate, priorPackageId: prior.id || prior.packageId || '', requirementId: candidate.requirementId }, { providerId: String(prior.providerId || `prior-package:${prior.id || prior.packageId || 'unknown'}`), providerKind: 'prior-package' }));
  }
  return Object.freeze(out.filter((item) => item.bytes > 0 || item.referenceTarget || item.requirementId));
}

export function resolveRequirementMaterial(requirement = {}, candidates = [], recipient = {}, policy = {}) {
  const target = String(requirement.reference?.target || '');
  const capability = recipientCanResolveReference(recipient, target);
  const relevant = candidates.filter((candidate) => candidateMatchesRequirement(candidate, requirement));
  const withBytes = relevant.filter((candidate) => candidate.bytes > 0 && candidate.sha256);
  const conflicts = withBytes.filter((candidate) => candidate.expectedSha256 && candidate.expectedSha256 !== candidate.sha256);
  if (conflicts.length) return resolution('integrity-conflict', requirement, relevant, null, capability, 'Resolved bytes contradict declared expected integrity authority.');
  const digests = [...new Set(withBytes.map((candidate) => candidate.sha256))];
  if (digests.length > 1) return resolution('ambiguous', requirement, relevant, null, capability, 'Multiple provider/material candidates carry distinct exact bytes and no selection authority is supplied.');
  const exactBound = withBytes.filter((candidate) => candidateBoundToRequirement(candidate, requirement));
  if (withBytes.length && !exactBound.length && target) return resolution('unresolved', requirement, relevant, null, capability, 'Resolved bytes cannot be bound back to the requested exact material reference.');
  const distinctExactCandidates = distinctCandidateAuthorities(exactBound);
  if (distinctExactCandidates.length > 1) return resolution('ambiguous', requirement, relevant, null, capability, 'Multiple distinct provider/material candidates are bound to the same exact requested representation, but no provider-selection authority exists. Byte equality does not authorize choosing provider provenance by array order.');
  if (capability && policy.preferReferenceWhenResolvable !== false && target) return resolution('reference-sufficient', requirement, relevant, null, capability, 'Recipient capability can resolve the exact declared material reference without embedding bytes.');
  if (exactBound.length) {
    const selected = exactBound[0];
    return resolution('materialized', requirement, relevant, selected, capability, 'Exact bytes are available and bound to the requested representation.');
  }
  if (capability && target) return resolution('reference-sufficient', requirement, relevant, null, capability, 'Recipient capability can resolve the exact declared material reference.');
  return resolution('unresolved', requirement, relevant, null, capability, target ? 'Exact required material is not currently resolvable or materialized.' : 'No exact Material Reference or explicitly bound local material is available.');
}

export function recipientCanResolveReference(recipient = {}, target = '') {
  if (!target) return false;
  const exactTargets = new Set([
    ...(recipient.referenceTargets || []),
    ...(recipient.capabilities?.referenceTargets || []),
    ...(recipient.resolvableReferences || [])
  ].map(String));
  return exactTargets.has(String(target));
}

function normalizeCandidate(value = {}, provider = {}) {
  const data = packageFileBytes(value);
  const suppliedSha = String(value.sha256 || value.integrity?.sha256 || '').toLowerCase();
  const computedSha = data.byteLength ? sha256Hex(data) : '';
  return deepFreeze({
    schema: PORTABLE_HANDOFF_MATERIAL_CANDIDATE_SCHEMA_ID,
    id: String(value.id || value.representationId || ''),
    requirementId: String(value.requirementId || ''),
    referenceTarget: String(value.referenceTarget || value.reference || value.source?.reference || value.source?.permalink || ''),
    path: String(value.path || ''),
    packagePath: String(value.packagePath || ''),
    workspaceId: String(value.workspaceId || ''),
    bytes: data.byteLength,
    sha256: computedSha || suppliedSha,
    expectedSha256: String(value.expectedSha256 || value.authority?.sha256 || '').toLowerCase(),
    data,
    mediaType: String(value.mediaType || value.type || 'application/octet-stream'),
    provider: Object.freeze({ id: String(provider.providerId || ''), kind: String(provider.providerKind || ''), responseStatus: String(provider.responseStatus || ''), priorPackageId: String(value.priorPackageId || '') }),
    provenance: Object.freeze(serializable(value.provenance || value.source || {})),
    authority: Object.freeze(serializable(value.authority || {}))
  });
}


function distinctCandidateAuthorities(candidates = []) {
  const byIdentity = new Map();
  for (const candidate of candidates) {
    const identity = candidateAuthorityIdentity(candidate);
    if (!byIdentity.has(identity)) byIdentity.set(identity, candidate);
  }
  return [...byIdentity.values()];
}

function candidateAuthorityIdentity(candidate = {}) {
  return JSON.stringify(sortJson({
    id: String(candidate.id || ''),
    path: String(candidate.path || ''),
    referenceTarget: String(candidate.referenceTarget || ''),
    provider: candidate.provider || {},
    provenance: candidate.provenance || {},
    authority: candidate.authority || {}
  }));
}

function sortJson(value) {
  if (Array.isArray(value)) return value.map(sortJson);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])]));
}

function candidateMatchesRequirement(candidate, requirement) {
  if (candidate.requirementId && candidate.requirementId === requirement.id) return true;
  const target = String(requirement.reference?.target || '');
  return Boolean(target && candidate.referenceTarget === target);
}
function candidateBoundToRequirement(candidate, requirement) {
  const target = String(requirement.reference?.target || '');
  if (!target) return Boolean(candidate.requirementId === requirement.id && candidate.authority?.localIdentityQualified === true);
  return candidate.referenceTarget === target;
}
function resolution(disposition, requirement, candidates, selected, capability, reason) {
  return deepFreeze({ disposition, requirementId: requirement.id, requirementName: String(requirement.name || ''), classification: requirement.classification, referenceTarget: String(requirement.reference?.target || ''), recipientReferenceCapability: Boolean(capability), selectedMaterial: selected, candidates: Object.freeze(candidates), reason });
}
function serializable(value = {}) { const out = {}; for (const [key, item] of Object.entries(value || {})) if (typeof item !== 'function' && typeof item !== 'undefined') out[key] = item; return out; }
function deepFreeze(value) { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value; for (const child of Object.values(value)) deepFreeze(child); return Object.freeze(value); }
