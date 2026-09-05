import { runAudit } from '../../../audit/audit.run.js';
import { portableRuntimeValidationContractForSchema } from '../schema/qualifiedLocalRoot.runtime.js';
import { normalizePortableFinding, portableFinding, summarizePortableFindings } from '../findings.js';
import { qualifyAuditResult } from '../qualification.js';

export const PORTABLE_SHARED_AUDIT_CAPABILITY_SCHEMA_ID = 'tiinex.portable.shared-audit-capability.v1';

export function auditPortableRecord(record = {}, options = {}) {
  const schemaId = String(record.schemaId || record.currentSchemaId || '');
  const runtimeProjection = portableRuntimeValidationContractForSchema(schemaId);
  let result;
  try {
    result = runAudit({
      record,
      markdown: record.markdown,
      validationContractOverride: runtimeProjection.state === 'qualified' ? runtimeProjection.compiledContract : null
    });
  } catch (error) {
    const finding = portableFinding('error', 'portable.audit.exception', error?.message || 'Audit failed.', {
      source: PORTABLE_SHARED_AUDIT_CAPABILITY_SCHEMA_ID,
      ref: record.path || record.id || ''
    });
    result = {
      status: 'invalid-or-incomplete',
      artifact: { schemaId, moduleId: 'tiinex.root.v1', fallbackUsed: true },
      summary: { error: 1, warning: 0, info: 0, preserve: 0 },
      findings: [finding],
      validation: null,
      materialAvailability: record.markdown ? { status: 'available' } : { status: 'pending-unavailable' }
    };
  }
  return sanitizeSharedAudit(result, record, options);
}

export function auditPortableRecords(records = [], options = {}) {
  const audits = Object.freeze((Array.isArray(records) ? records : []).map((record) => auditPortableRecord(record, options)));
  const findings = Object.freeze(audits.flatMap((audit) => audit.findings || []));
  return Object.freeze({
    schema: PORTABLE_SHARED_AUDIT_CAPABILITY_SCHEMA_ID,
    status: summarizePortableFindings(findings).status,
    audits,
    findings,
    findingSummary: summarizePortableFindings(findings),
    boundary: Object.freeze({
      adapterNeutral: true,
      sharedConsumers: Object.freeze(['Viewer', 'CLI', 'LLM', 'VS Code']),
      sourceMutation: false,
      remoteWrite: false,
      findingIdentity: 'artifact path/id + stable finding code + evidence path',
      findingOwnership: 'normalized finding source; presentation adapters do not redefine ownership or severity'
    })
  });
}

function sanitizeSharedAudit(result = {}, record = {}, options = {}) {
  const parsed = result.parsed || null;
  const id = String(record.id || record.path || '');
  const path = String(record.path || '');
  const resolvedSchemaId = String(parsed?.envelope?.current?.schema?.id || result.artifact?.schemaId || record.schemaId || '');
  const moduleId = String(result.resolution?.module?.id || result.artifact?.moduleId || '');
  const findings = Object.freeze((result.findings || []).map((finding) => projectSharedFinding(finding, { id, path, schemaId: resolvedSchemaId, sourceMode: record.sourceMode || '', moduleId })));
  return Object.freeze({
    schema: 'tiinex.portable.shared-audit-record.v1',
    id,
    path,
    title: String(record.title || result.artifact?.title || parsed?.title || path || 'Untitled artifact'),
    status: result.status || '',
    schemaId: resolvedSchemaId,
    resolution: Object.freeze({
      status: result.resolution?.status || '',
      moduleId,
      fallbackUsed: Boolean(result.resolution?.fallbackUsed || result.artifact?.fallbackUsed),
      unresolvedSchemaId: result.resolution?.unresolvedSchemaId || ''
    }),
    artifact: result.artifact || null,
    parsed: parsed ? Object.freeze({
      title: parsed.title,
      hasContinuityContext: parsed.hasContinuityContext,
      hasIntegrity: parsed.hasIntegrity,
      envelope: parsed.envelope,
      body: Object.freeze({ title: parsed.body?.title || '', sections: Object.freeze([...(parsed.body?.sections || [])]) })
    }) : null,
    findings,
    summary: result.summary || null,
    validation: result.validation || null,
    materialAvailability: result.materialAvailability || null,
    qualification: qualifyAuditResult(result),
    capabilityBoundary: Object.freeze({
      sourceMutation: false,
      remoteWrite: false,
      adapterNeutral: true,
      recordIdentity: id || path,
      recordPath: path,
      schemaId: resolvedSchemaId
    }),
    ...(options.includeMarkdown ? { markdown: record.markdown || '' } : {})
  });
}

function projectSharedFinding(finding = {}, artifact = {}) {
  const normalized = normalizePortableFinding(finding, { ref: artifact.path || artifact.id || '' });
  const evidencePath = String(normalized.evidencePath || normalized.ref || '');
  const owner = String(normalized.source || artifact.moduleId || PORTABLE_SHARED_AUDIT_CAPABILITY_SCHEMA_ID);
  return Object.freeze({
    ...normalized,
    findingIdentity: `${artifact.path || artifact.id || '(artifact)'}::${normalized.code || 'portable.finding'}::${evidencePath}`,
    ownership: Object.freeze({ kind: 'implementation-source', owner }),
    artifactBoundary: Object.freeze({
      id: artifact.id || '',
      path: artifact.path || '',
      schemaId: artifact.schemaId || '',
      sourceMode: artifact.sourceMode || ''
    })
  });
}
