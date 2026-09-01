export function requirementsFromBinding(binding = {}) {
  return {
    handoff: binding.handoff?.handoff || {},
    required: (binding.handoff?.required || []).map(bindingRequirementAsRequirement),
    reference: (binding.handoff?.reference || []).map(bindingRequirementAsRequirement),
    endpointRoles: (binding.handoff?.endpointRoles || []).map(bindingRequirementAsRequirement),
    participantRoles: (binding.handoff?.participantRoles || []).map(bindingRequirementAsRequirement),
    dependencies: (binding.handoff?.dependencies || []).map(bindingRequirementAsRequirement)
  };
}

function bindingRequirementAsRequirement(entry = {}) {
  return {
    id: String(entry.requirementId || ''),
    classification: String(entry.classification || ''),
    reference: { target: String(entry.referenceTarget || ''), exactTargetDeclared: Boolean(entry.exactTargetDeclared) }
  };
}

export function recipientFromSuppliedBinding(binding = {}) {
  return { referenceTargets: (binding.recipientResolution || []).filter((entry) => entry.resolvable).map((entry) => String(entry.referenceTarget || '')).filter(Boolean) };
}

export function qualification(findings, mode, supplied, current, parallelInputsPresented) {
  return deepFreeze({
    state: findings.length ? 'invalid' : 'qualified',
    mode,
    parallelInputsPresented,
    findings: Object.freeze([...new Set(findings)]),
    suppliedKey: String(supplied?.key || ''),
    currentKey: String(current?.key || '')
  });
}

export function hasOwnUsable(value, key) {
  return Object.prototype.hasOwnProperty.call(value || {}, key) && value[key] !== null && typeof value[key] !== 'undefined';
}

export function stableJson(value) { return JSON.stringify(sortJson(serializable(value))); }
export function serializable(value) {
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
export function sortJson(value) {
  if (Array.isArray(value)) return value.map(sortJson);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])]));
}
export function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}
