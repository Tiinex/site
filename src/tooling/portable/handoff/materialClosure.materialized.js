import { packageFileBytes, sha256Hex } from '../../../export/package.bytes.js';

export function qualifyHandoffMaterializedOutput(plan = {}) {
  const findings = [];
  const expected = expectedMaterializedEntries(plan.requirements || {}, findings);
  const supplied = Object.freeze((plan.materialized || []).map((entry) => normalizeCarrier(entry, 'supplied', findings)));
  const expectedByRequirement = indexByRequirement(expected, 'expected', findings);
  const suppliedByRequirement = indexByRequirement(supplied, 'supplied', findings);

  for (const [requirementId, expectedEntries] of expectedByRequirement.entries()) {
    if (expectedEntries.length !== 1) { findings.push('materialized-output-selected-material-ambiguous'); continue; }
    const expectedEntry = expectedEntries[0];
    const suppliedEntries = suppliedByRequirement.get(requirementId) || [];
    if (suppliedEntries.length === 0) {
      findings.push('materialized-output-required-carrier-missing');
      continue;
    }
    if (suppliedEntries.length !== 1) {
      findings.push('materialized-output-required-carrier-ambiguous');
      continue;
    }
    if (!sameCarrierProjection(suppliedEntries[0], expectedEntry)) findings.push('materialized-output-carrier-mismatch');
  }
  for (const requirementId of suppliedByRequirement.keys()) if (!expectedByRequirement.has(requirementId)) findings.push('materialized-output-unbound-carrier');

  return deepFreeze({
    state: findings.length ? 'invalid' : 'qualified',
    findings: Object.freeze([...new Set(findings)]),
    expected: Object.freeze(expected),
    supplied: Object.freeze(supplied.map(carrierProjection))
  });
}

function expectedMaterializedEntries(requirements = {}, findings = []) {
  const out = [];
  for (const item of [...(requirements.required || []), ...(requirements.reference || [])]) {
    if (String(item.disposition || '') !== 'materialized') continue;
    if (!item.selectedMaterial) {
      findings.push('materialized-output-selected-material-missing');
      continue;
    }
    const material = item.selectedMaterial;
    const normalized = normalizeCarrier({
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
    }, 'expected', findings);
    out.push(normalized);
  }
  return Object.freeze(out);
}

function normalizeCarrier(entry = {}, source = 'supplied', findings = []) {
  const data = packageFileBytes(entry);
  const actualBytes = data.byteLength;
  const actualSha256 = actualBytes ? sha256Hex(data) : '';
  const declaredBytes = Number(entry.bytes || 0);
  const declaredSha256 = String(entry.sha256 || '').toLowerCase();
  if (!actualBytes) findings.push(`materialized-output-${source}-carrier-bytes-missing`);
  if (declaredBytes !== actualBytes) findings.push(`materialized-output-${source}-carrier-byte-count-mismatch`);
  if (declaredSha256 !== actualSha256) findings.push(`materialized-output-${source}-carrier-sha256-mismatch`);
  return deepFreeze({
    requirementId: String(entry.requirementId || ''),
    classification: String(entry.classification || ''),
    referenceTarget: String(entry.referenceTarget || ''),
    path: String(entry.path || ''),
    requestedPackagePath: String(entry.requestedPackagePath || entry.packagePath || ''),
    bytes: actualBytes,
    sha256: actualSha256,
    mediaType: String(entry.mediaType || 'application/octet-stream'),
    provider: Object.freeze(serializable(entry.provider || {})),
    provenance: Object.freeze(serializable(entry.provenance || {})),
    authority: Object.freeze(serializable(entry.authority || {})),
    data
  });
}

function indexByRequirement(entries = [], source = 'entry', findings = []) {
  const index = new Map();
  for (const entry of entries) {
    const id = String(entry.requirementId || '');
    if (!id) {
      findings.push(`materialized-output-${source}-requirement-id-missing`);
      continue;
    }
    const current = index.get(id) || [];
    current.push(entry);
    index.set(id, current);
  }
  return index;
}

function sameCarrierProjection(a = {}, b = {}) { return stableJson(carrierProjection(a)) === stableJson(carrierProjection(b)); }

function carrierProjection(entry = {}) {
  return Object.freeze({
    requirementId: String(entry.requirementId || ''),
    classification: String(entry.classification || ''),
    referenceTarget: String(entry.referenceTarget || ''),
    path: String(entry.path || ''),
    requestedPackagePath: String(entry.requestedPackagePath || ''),
    bytes: Number(entry.bytes || 0),
    sha256: String(entry.sha256 || ''),
    mediaType: String(entry.mediaType || ''),
    provider: entry.provider || {},
    provenance: entry.provenance || {},
    authority: entry.authority || {}
  });
}

function serializable(value) {
  if (Array.isArray(value)) return value.map(serializable);
  if (!value || typeof value !== 'object') return value;
  if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return undefined;
  const out = {};
  for (const [key, item] of Object.entries(value)) {
    if (typeof item === 'function' || typeof item === 'undefined') continue;
    const normalized = serializable(item);
    if (typeof normalized !== 'undefined') out[key] = normalized;
  }
  return out;
}
function stableJson(value) { return JSON.stringify(sortJson(serializable(value))); }
function sortJson(value) { if (Array.isArray(value)) return value.map(sortJson); if (!value || typeof value !== 'object') return value; return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])])); }
function deepFreeze(value) { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value; for (const child of Object.values(value)) deepFreeze(child); return Object.freeze(value); }
