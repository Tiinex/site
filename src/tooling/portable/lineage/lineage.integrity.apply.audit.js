import { auditPortableRecords } from '../audit/audit.capability.js';

export function buildLineagePostRepairAudit(records = [], changedRecords = []) {
  const postRepairAudit = auditPortableRecords(records);
  const changedPathSet = new Set(changedRecords.map((record) => normalizePath(record.path || '')));
  const changedAudits = Object.freeze((postRepairAudit.audits || []).filter((audit) => changedPathSet.has(normalizePath(audit.path || ''))));
  const changedFindings = Object.freeze(changedAudits.flatMap((audit) => audit.findings || []));
  return Object.freeze({
    schema: 'tiinex.portable.lineage-integrity-post-repair-audit.v1',
    status: postRepairAudit.status,
    changedRecordStatus: changedRecords.length
      ? (changedFindings.some((finding) => finding.severity === 'error') ? 'blocked' : changedFindings.some((finding) => finding.severity === 'warning') ? 'degraded' : 'clean')
      : 'not-applicable',
    changedAudits,
    changedFindings,
    findingSummary: postRepairAudit.findingSummary,
    capabilityBoundary: postRepairAudit.boundary,
    boundary: 'First-class post-application re-audit through the same shared audit capability used by CLI/LLM and Viewer consumers. Re-audit does not publish or mutate source material.'
  });
}

function normalizePath(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+|\/+$/g, ''); }
