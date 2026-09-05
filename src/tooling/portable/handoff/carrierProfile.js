export const HANDOFF_CARRIER_PROFILE_SCHEMA_ID = 'tiinex.portable.handoff-carrier-profile.v1';

export function normalizeHandoffCarrierProfile(value = null, options = {}) {
  const raw = value && typeof value === 'object' ? value : {};
  const id = String(raw.id || raw.profileId || raw.name || '').trim();
  const requiredMajorWorkspaceIds = normalizeWorkspaceIds(
    raw.requiredMajorWorkspaceIds
      || raw.requiredWorkspaceIds
      || raw.majorRequiredWorkspaceIds
      || []
  );
  const source = String(raw.source || options.source || '').trim();
  const state = id ? 'qualified' : 'unresolved';
  return Object.freeze({
    schema: HANDOFF_CARRIER_PROFILE_SCHEMA_ID,
    state,
    id,
    requiredMajorWorkspaceIds,
    source,
    boundary: 'Carrier profile data is explicit project/operator/package policy. Workspace identifiers have no universal meaning in generic Handoff mechanics.'
  });
}

export function handoffCarrierProfileFromPackageContract(contract = {}) {
  return normalizeHandoffCarrierProfile({
    id: contract.carrierProfileId || '',
    requiredMajorWorkspaceIds: contract.requiredMajorWorkspaceIds || [],
    source: contract.carrierProfileId ? 'declared-package-contract' : ''
  });
}

export function normalizeWorkspaceIds(value = []) {
  if (!Array.isArray(value) && String(value || '').trim().toLowerCase() === 'none') return Object.freeze([]);
  const list = Array.isArray(value)
    ? value
    : String(value || '').split(',');
  const seen = new Set();
  const out = [];
  for (const entry of list) {
    const id = normalizeWorkspaceId(entry);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return Object.freeze(out);
}

function normalizeWorkspaceId(value = '') {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
