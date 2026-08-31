export const INTEGRITY_METHOD_REFERENCE_AUTHORITY_SCHEMA_ID = 'tiinex.site.integrity-method-reference-authority.v1';
export const C14N_V2_METHOD_ID = 'sha256-base64url-c14n-v2';
export const C14N_V2_VALIDATOR_TARGET = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md';
const C14N_V2_PRIOR_EQUIVALENT_TARGET = 'https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.validators/sha256-base64url-c14n-v2.validator.md';

const maintainedC14nV2 = Object.freeze({
  schema: INTEGRITY_METHOD_REFERENCE_AUTHORITY_SCHEMA_ID,
  methodId: C14N_V2_METHOD_ID,
  preferredTarget: C14N_V2_VALIDATOR_TARGET,
  exactTargets: Object.freeze([C14N_V2_VALIDATOR_TARGET, C14N_V2_PRIOR_EQUIVALENT_TARGET]),
  resolutionState: 'qualified',
  resolutionEvidence: Object.freeze({
    sourceRepository: 'Tiinex/docs',
    sourceCommit: '3988951208eb9a8926e84ab42625d4b42fa00c2d',
    sourcePath: '.topics/.validators/sha256-base64url-c14n-v2.validator.md',
    gitBlobSha: '20df4285e96a26ba69e9b8c054688cfdb60492d3'
  })
});

export function integrityMethodReferenceAuthorityForCreation(methodId = C14N_V2_METHOD_ID, explicit = undefined) {
  const id = String(methodId || '').trim();
  const fallback = id === C14N_V2_METHOD_ID ? maintainedC14nV2 : Object.freeze({
    schema: INTEGRITY_METHOD_REFERENCE_AUTHORITY_SCHEMA_ID,
    methodId: id,
    preferredTarget: '',
    exactTargets: Object.freeze([]),
    resolutionState: 'unavailable',
    resolutionEvidence: Object.freeze({})
  });
  if (explicit === undefined || explicit === null) return fallback;
  if (explicit === false) return Object.freeze({ ...fallback, preferredTarget: '', exactTargets: Object.freeze([]), resolutionState: 'unavailable', resolutionEvidence: Object.freeze({}) });
  if (typeof explicit === 'string') return Object.freeze({ ...fallback, preferredTarget: explicit, exactTargets: Object.freeze(explicit ? [explicit] : []), resolutionState: 'unresolved', resolutionEvidence: Object.freeze({}) });
  const target = String(explicit.preferredTarget || explicit.target || '').trim();
  const exactTargets = Object.freeze([...new Set([...(explicit.exactTargets || []), target].map((item) => String(item || '')).filter(Boolean))]);
  return Object.freeze({
    ...fallback,
    methodId: String(explicit.methodId || id),
    preferredTarget: target || exactTargets[0] || '',
    exactTargets,
    resolutionState: String(explicit.resolutionState || explicit.state || (target && fallback.exactTargets.includes(target) ? fallback.resolutionState : 'unresolved')),
    resolutionEvidence: Object.freeze({ ...(target && fallback.exactTargets.includes(target) ? fallback.resolutionEvidence : {}), ...(explicit.resolutionEvidence || explicit.evidence || {}) })
  });
}

export function renderIntegrityMethodReference(authority = {}) {
  const methodId = String(authority?.methodId || '').trim();
  if (!methodId) throw new Error('integrity-method-reference-id-missing');
  const target = authority?.resolutionState === 'qualified' ? String(authority?.preferredTarget || '').trim() : '';
  return target ? `[${methodId}](${target})` : methodId;
}

export function qualifyIntegrityMethodReferenceValue(value = '', authority = {}) {
  const raw = String(value || '').trim();
  const parsed = parseMethodReference(raw);
  const methodId = String(authority?.methodId || '').trim();
  const exactTargets = new Set([...(authority?.exactTargets || [])].map((item) => String(item || '')).filter(Boolean));
  const maintainedAvailable = authority?.resolutionState === 'qualified' && Boolean(authority?.preferredTarget);
  const findings = [];
  if (!methodId || parsed.methodId !== methodId) findings.push(`Integrity method identifier must be exactly ${methodId || '(unavailable)'}.`);
  if (maintainedAvailable) {
    if (parsed.form === 'markdown-link' && !exactTargets.has(parsed.target)) findings.push(`Integrity method target is not the qualified maintained representation for ${methodId}: ${parsed.target || '(empty)'}.`);
  } else if (parsed.form === 'markdown-link' && exactTargets.size && !exactTargets.has(parsed.target)) {
    findings.push(`Integrity method target is not qualified for ${methodId}: ${parsed.target || '(empty)'}.`);
  }
  return Object.freeze({ state: findings.length ? 'unavailable' : 'qualified', observed: parsed, authority, maintainedTargetAvailable: maintainedAvailable, findings: Object.freeze(findings) });
}

function parseMethodReference(value = '') {
  const text = String(value || '').trim();
  const match = text.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
  if (match) return Object.freeze({ raw: text, form: 'markdown-link', methodId: match[1], target: match[2] });
  return Object.freeze({ raw: text, form: text ? 'plain-method-id' : 'empty', methodId: text, target: '' });
}
