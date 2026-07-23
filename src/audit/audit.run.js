import { parseArtifactMarkdown } from '../artifacts/artifact.parse.js';
import { normalizeArtifact } from '../artifacts/artifact.normalize.js';
import { resolveSchemaModule } from '../schemas/resolver.js';
import { rootValidate, rootFallbackFinding } from '../schemas/root.validate.js';
import { summarizeFindings } from './audit.summary.js';

export function runAudit(scope = {}) {
  const record = scope.record || null;
  const markdown = typeof scope.markdown === 'string' ? scope.markdown : (typeof record?.markdown === 'string' ? record.markdown : '');
  const availability = materialAvailabilityFor(scope, record, markdown);
  if (!availability.available) return unavailableAuditResult(record, availability);

  const parsed = parseArtifactMarkdown(markdown);
  if (isPlainSupportingMarkdown(parsed, record)) return supportingMarkdownAuditResult(record, parsed, availability);

  const schemaId = parsed.envelope.current.schema.id || record?.schemaId || record?.kind || '';
  const resolution = resolveSchemaModule({ schemaId });
  const validator = typeof resolution.module?.validate === 'function' ? resolution.module.validate : rootValidate;
  const findings = validator(parsed).map(normalizeAuditFinding);
  if (resolution.fallbackUsed) {
    findings.push(rootFallbackFinding(schemaId));
    findings.push({ severity: 'warning', code: 'audit.validator.unavailable', message: `${schemaId || 'schema'} has no exact schema-specific validator; Root v1 validation was run instead.`, source: 'tiinex.audit.v1' });
  } else if (validator === rootValidate && resolution.module?.id !== 'tiinex.root.v1') {
    findings.push({ severity: 'warning', code: 'audit.validator.unavailable', message: `${resolution.module?.id || schemaId || 'schema'} has no schema-specific validator; Root v1 validation was run instead.`, source: 'tiinex.audit.v1' });
  }
  const validation = validationTruthFor({ parsed, schemaId, resolution, validator, availability });
  const normalized = normalizeArtifact(parsed, resolution, findings);
  return {
    status: findings.some((finding) => finding.severity === 'error') ? 'invalid-or-incomplete' : resolution.fallbackUsed ? 'degraded' : 'readable',
    parsed,
    resolution,
    artifact: normalized,
    findings,
    summary: summarizeFindings(findings),
    materialAvailability: availability,
    validation
  };
}


function isPlainSupportingMarkdown(parsed = {}, record = {}) {
  const declaredSchema = parsed?.envelope?.current?.schema?.id || record?.schemaId || '';
  const kind = String(record?.kind || '').trim().toLowerCase();
  return !parsed?.hasContinuityContext && !declaredSchema && (!kind || kind === 'markdown');
}

function supportingMarkdownAuditResult(record = {}, parsed = {}, availability = {}) {
  const finding = {
    severity: 'info',
    code: 'audit.markdown.supporting-material',
    message: 'Plain Markdown is retained as supporting local material; it is not classified as an invalid Tiinex leaf.',
    source: 'tiinex.audit.v1'
  };
  return {
    status: 'supporting-material',
    parsed,
    resolution: {
      schemaId: 'markdown',
      module: { id: 'tiinex.markdown.supporting.v1' },
      fallbackUsed: false
    },
    artifact: {
      title: record?.title || parsed?.title || 'Markdown material',
      summary: record?.summary || parsed?.body?.sections?.slice(0, 3).join(' · ') || '',
      schemaId: 'markdown',
      moduleId: 'tiinex.markdown.supporting.v1',
      fallbackUsed: false
    },
    findings: [finding],
    summary: summarizeFindings([finding]),
    materialAvailability: availability,
    validation: validationTruthFor({ parsed, schemaId: 'markdown', resolution: { module: { id: 'tiinex.markdown.supporting.v1' }, fallbackUsed: false }, validator: null, availability, supporting: true })
  };
}

function materialAvailabilityFor(scope = {}, record = {}, markdown = '') {
  const sourceBacked = Boolean(scope.sourceBacked || record?.sourceBacked || (record?.source?.adapterId && record.source.adapterId !== 'local'));
  const cacheState = String(scope.cacheState || record?.cacheState || '').trim();
  const materialAvailability = String(scope.materialAvailability || record?.materialAvailability || '').trim();
  const metadataOnly = cacheState === 'metadata-only' || materialAvailability === 'metadata-only' || materialAvailability === 'unavailable' || materialAvailability === 'material-unavailable';
  if (String(markdown || '').trim()) return { status: 'available', available: true, sourceBacked, cacheState, materialAvailability };
  if (sourceBacked || metadataOnly) return { status: 'pending-unavailable', available: false, sourceBacked, cacheState: cacheState || 'metadata-only', materialAvailability: materialAvailability || 'material-unavailable' };
  return { status: 'empty-invalid', available: true, sourceBacked, cacheState, materialAvailability };
}

function unavailableAuditResult(record = {}, availability = {}) {
  const schemaId = record?.schemaId || record?.kind || '';
  const resolution = resolveSchemaModule({ schemaId });
  const finding = {
    severity: 'info',
    code: 'audit.material.unavailable',
    message: 'Material is metadata-only or not loaded in this session; audit is pending and must not classify it as invalid.',
    source: 'tiinex.audit.v1'
  };
  return {
    status: 'pending-unavailable',
    parsed: null,
    resolution,
    artifact: {
      title: record?.title || 'Unavailable material',
      summary: record?.summary || '',
      schemaId,
      moduleId: resolution.module?.id || 'tiinex.root.v1',
      fallbackUsed: Boolean(resolution.fallbackUsed)
    },
    findings: [finding],
    summary: summarizeFindings([finding]),
    materialAvailability: availability,
    validation: validationTruthFor({ parsed: null, schemaId, resolution, validator: null, availability })
  };
}


function validationTruthFor({ parsed = null, schemaId = '', resolution = {}, validator = null, availability = {}, supporting = false } = {}) {
  const moduleId = resolution?.module?.id || '';
  const schemaVersion = versionFromSchemaId(schemaId || moduleId);
  const rootValidationVersion = 'tiinex.root.v1';
  const integrityMethodVersions = integrityVersionsFor(parsed);
  if (!availability?.available) {
    return {
      state: 'not-run-body-unavailable',
      coverage: 'body-unavailable',
      rootValidator: 'not-run',
      childValidator: 'skipped',
      rootValidationVersion,
      childValidationVersion: schemaVersion,
      integrityMethodVersions
    };
  }
  if (supporting) {
    return {
      state: 'not-applicable-supporting',
      coverage: 'supporting-material',
      rootValidator: 'not-applicable',
      childValidator: 'not-applicable',
      rootValidationVersion,
      childValidationVersion: '',
      integrityMethodVersions
    };
  }
  const fallbackUsed = Boolean(resolution?.fallbackUsed);
  const exactRoot = !fallbackUsed && (moduleId === 'tiinex.root.v1' || schemaId === 'tiinex.root.v1');
  const childValidatorRan = !fallbackUsed && validator && validator !== rootValidate && moduleId && moduleId !== 'tiinex.root.v1';
  const childValidatorUnavailable = Boolean(schemaId) && !exactRoot && !childValidatorRan;
  if (childValidatorRan) {
    return {
      state: 'exact-schema-validated',
      coverage: 'exact-companion',
      rootValidator: 'run',
      childValidator: 'run',
      rootValidationVersion,
      childValidationVersion: schemaVersion || moduleId,
      integrityMethodVersions
    };
  }
  if (exactRoot) {
    return {
      state: 'root-validated',
      coverage: 'root-exact',
      rootValidator: 'run',
      childValidator: 'not-applicable',
      rootValidationVersion,
      childValidationVersion: '',
      integrityMethodVersions
    };
  }
  if (childValidatorUnavailable) {
    return {
      state: 'root-only-child-validator-unavailable',
      coverage: fallbackUsed ? 'root-fallback' : 'root-only',
      rootValidator: 'run',
      childValidator: 'unavailable',
      rootValidationVersion,
      childValidationVersion: schemaVersion || schemaId,
      integrityMethodVersions
    };
  }
  return {
    state: 'validation-unknown',
    coverage: 'unknown',
    rootValidator: parsed ? 'run' : 'not-run',
    childValidator: 'unknown',
    rootValidationVersion,
    childValidationVersion: schemaVersion,
    integrityMethodVersions
  };
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

function normalizeAuditFinding(finding = {}) {
  return {
    severity: finding.severity || 'info',
    code: finding.code || 'audit.finding',
    message: finding.message || 'Audit finding.',
    source: finding.source || 'tiinex.audit.v1'
  };
}
