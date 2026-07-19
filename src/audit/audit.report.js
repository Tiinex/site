export function auditReport(result) {
  return {
    type: 'tiinex.web.audit.report.v84',
    status: result.status,
    schemaId: result.artifact.schemaId,
    moduleId: result.artifact.moduleId,
    fallbackUsed: result.artifact.fallbackUsed,
    summary: result.summary,
    findings: result.findings
  };
}
