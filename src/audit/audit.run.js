import { parseArtifactMarkdown } from '../artifacts/artifact.parse.js';
import { resolveSchemaModule } from '../schemas/resolver.js';
import { validateArtifact, validationTruthFor } from '../validation/validateArtifact.js';
import { summarizeFindings } from './audit.summary.js';

export function runAudit(scope = {}) {
  const record = scope.record || null;
  const markdown = typeof scope.markdown === 'string' ? scope.markdown : (typeof record?.markdown === 'string' ? record.markdown : '');
  const availability = materialAvailabilityFor(scope, record, markdown);
  if (!availability.available) return unavailableAuditResult(record, availability);

  const parsed = parseArtifactMarkdown(markdown);
  if (isPlainSupportingMarkdown(parsed, record)) return supportingMarkdownAuditResult(record, parsed, availability);

  const schemaId = parsed.envelope.current.schema.id || record?.schemaId || record?.currentSchemaId || '';
  const validationResult = validateArtifact({ parsed, schemaId, record, markdown, schemaReferenceAuthorities: scope.schemaReferenceAuthorities || null, validationContractOverride: scope.validationContractOverride || null });
  const findings = validationResult.findings;
  return {
    status: findings.some((finding) => finding.severity === 'error') ? 'invalid-or-incomplete' : validationResult.resolution.fallbackUsed ? 'degraded' : 'readable',
    parsed,
    resolution: validationResult.resolution,
    artifact: validationResult.artifact,
    findings,
    summary: summarizeFindings(findings),
    materialAvailability: availability,
    contractValidation: validationResult.contractValidation,
    validation: validationResult.validation
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
  const schemaId = record?.schemaId || record?.currentSchemaId || '';
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
