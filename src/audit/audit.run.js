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
  const schemaId = parsed.envelope.current.schema.id || record?.schemaId || record?.kind || '';
  const resolution = resolveSchemaModule({ schemaId });
  const validator = typeof resolution.module?.validate === 'function' ? resolution.module.validate : rootValidate;
  const findings = validator(parsed).map(normalizeAuditFinding);
  if (resolution.fallbackUsed) findings.push(rootFallbackFinding(schemaId));
  else if (validator === rootValidate && resolution.module?.id !== 'tiinex.root.v1') {
    findings.push({ severity: 'warning', code: 'audit.validator.unavailable', message: `${resolution.module?.id || schemaId || 'schema'} has no schema-specific validator; root validation was used.`, source: 'tiinex.audit.v1' });
  }
  const normalized = normalizeArtifact(parsed, resolution, findings);
  return {
    status: findings.some((finding) => finding.severity === 'error') ? 'invalid-or-incomplete' : resolution.fallbackUsed ? 'degraded' : 'readable',
    parsed,
    resolution,
    artifact: normalized,
    findings,
    summary: summarizeFindings(findings),
    materialAvailability: availability
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
    materialAvailability: availability
  };
}

function normalizeAuditFinding(finding = {}) {
  return {
    severity: finding.severity || 'info',
    code: finding.code || 'audit.finding',
    message: finding.message || 'Audit finding.',
    source: finding.source || 'tiinex.audit.v1'
  };
}
