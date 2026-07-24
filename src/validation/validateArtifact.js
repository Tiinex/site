import { parseArtifactMarkdown } from '../artifacts/artifact.parse.js';
import { normalizeArtifact } from '../artifacts/artifact.normalize.js';
import { resolveSchemaModule } from '../schemas/resolver.js';
import { rootValidate, rootFallbackFinding } from '../schemas/tiinex.root.v1.validate.js';
import { validateIntegrity } from '../integrity/integrity.validate.js';
import { normalizeFindings, normalizeFinding } from './findings.js';

export const ARTIFACT_VALIDATION_PIPELINE_ID = 'tiinex.artifact.validation.pipeline.v1';

export function validateArtifact(input = {}, options = {}) {
  const parsed = input.parsed || parseArtifactMarkdown(String(input.markdown || input.record?.markdown || ''));
  const schemaId = parsed?.envelope?.current?.schema?.id || input.schemaId || input.record?.schemaId || input.record?.kind || '';
  const resolution = input.resolution || resolveSchemaModule({ schemaId, checksum: input.checksum });
  const rootFindings = normalizeFindings(rootValidate(parsed), { schemaId: 'tiinex.root.v1', qualification: 'root' });
  const integrityFindings = normalizeFindings(validateIntegrity(parsed, options.integrity), { schemaId: 'tiinex.root.v1', qualification: 'integrity' });
  const childValidation = runExactSchemaValidator({ parsed, schemaId, resolution });
  const childFindings = childValidation.findings;
  const fallbackFindings = fallbackFindingsFor({ schemaId, resolution, childFindings, childValidatorRan: childValidation.ran });
  const findings = [...rootFindings, ...integrityFindings, ...childFindings, ...fallbackFindings];
  const validation = validationTruthFor({ parsed, schemaId, resolution, childFindings, childValidatorRan: childValidation.ran });
  return Object.freeze({
    schema: ARTIFACT_VALIDATION_PIPELINE_ID,
    parsed,
    schemaId,
    resolution,
    artifact: normalizeArtifact(parsed, resolution, findings),
    findings: Object.freeze(findings),
    validation
  });
}

function runExactSchemaValidator({ parsed, schemaId, resolution }) {
  const moduleId = resolution?.module?.id || '';
  const validator = resolution?.module?.validate;
  const exactRoot = !resolution?.fallbackUsed && (moduleId === 'tiinex.root.v1' || schemaId === 'tiinex.root.v1');
  if (exactRoot || resolution?.fallbackUsed || typeof validator !== 'function') return { ran: false, findings: [] };
  return { ran: true, findings: normalizeFindings(validator(parsed), { schemaId: moduleId || schemaId, qualification: 'schema-specific' }) };
}

function fallbackFindingsFor({ schemaId, resolution, childFindings = [], childValidatorRan = false }) {
  const moduleId = resolution?.module?.id || '';
  const exactRoot = !resolution?.fallbackUsed && (moduleId === 'tiinex.root.v1' || schemaId === 'tiinex.root.v1');
  if (resolution?.fallbackUsed) return [normalizeFinding(rootFallbackFinding(schemaId), { schemaId: 'tiinex.root.v1', qualification: 'fallback' }), normalizeFinding({ severity: 'warning', code: 'audit.validator.unavailable', message: `${schemaId || 'schema'} has no exact schema-specific validator; Root v1 validation was run instead.`, source: 'tiinex.audit.v1', qualification: 'validator-unavailable' })];
  if (!exactRoot && !childValidatorRan) return [normalizeFinding({ severity: 'warning', code: 'audit.validator.unavailable', message: `${moduleId || schemaId || 'schema'} has no schema-specific validator; Root v1 validation was run instead.`, source: 'tiinex.audit.v1', qualification: 'validator-unavailable' })];
  return [];
}

export function validationTruthFor({ parsed = null, schemaId = '', resolution = {}, childFindings = [], childValidatorRan = childFindings.length > 0, availability = { available: true }, supporting = false } = {}) {
  const moduleId = resolution?.module?.id || '';
  const schemaVersion = versionFromSchemaId(schemaId || moduleId);
  const rootValidationVersion = 'tiinex.root.v1';
  const integrityMethodVersions = integrityVersionsFor(parsed);
  if (!availability?.available) return { state: 'not-run-body-unavailable', coverage: 'body-unavailable', rootValidator: 'not-run', childValidator: 'skipped', rootValidationVersion, childValidationVersion: schemaVersion, integrityMethodVersions };
  if (supporting) return { state: 'not-applicable-supporting', coverage: 'supporting-material', rootValidator: 'not-applicable', childValidator: 'not-applicable', rootValidationVersion, childValidationVersion: '', integrityMethodVersions };
  const fallbackUsed = Boolean(resolution?.fallbackUsed);
  const exactRoot = !fallbackUsed && (moduleId === 'tiinex.root.v1' || schemaId === 'tiinex.root.v1');
  const exactChildValidatorRan = !fallbackUsed && childValidatorRan && moduleId && moduleId !== 'tiinex.root.v1';
  const childValidatorUnavailable = Boolean(schemaId) && !exactRoot && !exactChildValidatorRan;
  if (exactChildValidatorRan) return { state: 'exact-schema-validated', coverage: 'exact-companion', rootValidator: 'run', childValidator: 'run', rootValidationVersion, childValidationVersion: schemaVersion || moduleId, integrityMethodVersions };
  if (exactRoot) return { state: 'root-validated', coverage: 'root-exact', rootValidator: 'run', childValidator: 'not-applicable', rootValidationVersion, childValidationVersion: '', integrityMethodVersions };
  if (childValidatorUnavailable) return { state: 'root-only-child-validator-unavailable', coverage: fallbackUsed ? 'root-fallback' : 'root-only', rootValidator: 'run', childValidator: 'unavailable', rootValidationVersion, childValidationVersion: schemaVersion || schemaId, integrityMethodVersions };
  return { state: 'validation-unknown', coverage: 'unknown', rootValidator: parsed ? 'run' : 'not-run', childValidator: 'unknown', rootValidationVersion, childValidationVersion: schemaVersion, integrityMethodVersions };
}

function versionFromSchemaId(value = '') {
  const text = String(value || '');
  const match = text.match(/\.v(\d+)(?:\.|$)/);
  return match ? `v${match[1]}` : '';
}
function integrityVersionsFor(parsed = null) {
  const methods = Array.isArray(parsed?.integrity?.methods) ? parsed.integrity.methods : [];
  return [...new Set(methods.map((method) => {
    const text = String(method || '');
    const match = text.match(/c14n-v(\d+)/i) || text.match(/-v(\d+)(?:\b|$)/i);
    return match ? `v${match[1]}` : '';
  }).filter(Boolean))];
}
