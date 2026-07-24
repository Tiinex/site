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

  for (const method of methods) {
    if (/c14n-v2/i.test(method)) {
      findings.push(info('integrity.c14n-v2.detected', 'c14n-v2 integrity method is declared; byte verification is delegated to the integrity engine when canonical bytes are available.'));
      continue;
    }
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
  return methods.map((method) => String(method || '').trim()).filter(Boolean);
}

function warning(code, message) { return { severity: 'warning', code, message, source: INTEGRITY_VALIDATION_ENGINE_ID }; }
function info(code, message) { return { severity: 'info', code, message, source: INTEGRITY_VALIDATION_ENGINE_ID }; }
