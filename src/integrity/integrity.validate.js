import { C14N_V2_METHOD_ID, canonicalC14nV2SelfState } from './integrity.c14nV2.js';
import { integrityMethodReferenceAuthorityForCreation, qualifyIntegrityMethodReferenceValue } from './integrity.methodReference.js';

export const INTEGRITY_VALIDATION_ENGINE_ID = 'tiinex.integrity.validation.v1';

export function validateIntegrity(artifact = {}, options = {}) {
  const findings = [];
  const methods = normalizeMethods(artifact?.integrity?.methods);
  const hasIntegrity = Boolean(artifact?.hasIntegrity);

  if (!hasIntegrity) {
    findings.push(info('integrity.validation.skipped', 'Continuity Integrity footer is missing; integrity engine did not run byte/canonicalization validation.'));
    return findings;
  }

  if (!methods.length) {
    findings.push(info('integrity.method.unspecified', 'Continuity Integrity exists but no machine-verifiable integrity method is declared.'));
    return findings;
  }

  if (methods.includes(C14N_V2_METHOD_ID)) {
    findings.push(info('integrity.c14n-v2.detected', 'c14n-v2 integrity method is declared; the integrity engine evaluates self entries when canonical artifact bytes are available.'));
    const selfEntries = (artifact?.integrity?.entries || []).filter((entry) => entry?.method === C14N_V2_METHOD_ID && entry?.towards === 'self');
    const maintainedAuthority = integrityMethodReferenceAuthorityForCreation(C14N_V2_METHOD_ID);
    for (const entry of (artifact?.integrity?.entries || []).filter((item) => item?.method === C14N_V2_METHOD_ID)) {
      const reference = qualifyIntegrityMethodReferenceValue(entry?.methodRaw || entry?.method || '', maintainedAuthority);
      if (reference.state !== 'qualified') findings.push(error('integrity.method-reference.unqualified', reference.findings.join(' ')));
      else findings.push(info('integrity.method-reference.qualified', 'c14n-v2 integrity method reference matches the qualified maintained validator representation.'));
    }
    if (selfEntries.length) {
      const result = canonicalC14nV2SelfState(artifact.markdown || '');
      if (result.state === 'verified') findings.push(info('integrity.c14n-v2.verified', 'c14n-v2 self-integrity is verified against the current canonical artifact bytes.'));
      else if (result.state === 'mismatch') findings.push(warning('integrity.c14n-v2.mismatch', 'c14n-v2 self-integrity does not match the current canonical artifact bytes.'));
      else findings.push(warning('integrity.c14n-v2.ambiguous', `c14n-v2 self-integrity could not be verified: ${result.reason || result.state}.`));
    }
  }

  for (const method of methods) {
    if (method === C14N_V2_METHOD_ID) continue;
    if (/browser-local-draft|draft local integrity/i.test(method)) {
      findings.push(info('integrity.local-draft.declared', 'Draft/local integrity marker is present; it is a recoverability marker, not a published byte-verification proof.'));
      continue;
    }
    findings.push(info('integrity.method.declared', `Integrity method declared: ${method}.`));
  }
  return findings;
}

function normalizeMethods(methods = []) {
  if (!Array.isArray(methods)) return [];
  return [...new Set(methods.map((method) => String(method || '').trim()).filter(Boolean))];
}

function warning(code, message) { return { severity: 'warning', code, message, source: INTEGRITY_VALIDATION_ENGINE_ID }; }
function info(code, message) { return { severity: 'info', code, message, source: INTEGRITY_VALIDATION_ENGINE_ID }; }
function error(code, message) { return { severity: 'error', code, message, source: INTEGRITY_VALIDATION_ENGINE_ID }; }
