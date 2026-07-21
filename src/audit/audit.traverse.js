import { traverseLoadedLineage } from '../lineage/lineage.traverse.js';
import { runAudit } from './audit.run.js';
import { auditReport } from './audit.report.js';

export const AUDIT_TRAVERSAL_SCOPE_SCHEMA_ID = 'tiinex.audit.traversal.scope.v1';

export function buildLoadedAuditTraversalScope(records = [], options = {}) {
  const traversal = options.traversal || traverseLoadedLineage(records, {
    startIds: options.startIds || options.startId || options.selectedId,
    direction: options.direction || 'ancestors',
    maxDepth: options.maxDepth ?? options.depth ?? 3,
    resolvedLineage: options.resolvedLineage
  });
  const recordById = new Map((Array.isArray(records) ? records : []).map((record) => [record.id || record.path || record.title || '', record]));
  const audited = [];
  const findings = [...(traversal.findings || [])];

  for (const node of traversal.nodes || []) {
    const record = recordById.get(node.id);
    if (!record) {
      findings.push(finding('warning', 'audit.traversal.record.missing', 'Traversal node has no loaded record; audit cannot run for it.', { nodeId: node.id }));
      continue;
    }
    const result = safeRunAudit(record);
    audited.push(Object.freeze({
      id: node.id,
      title: record.title || node.title || 'Untitled artifact',
      path: record.path || node.path || '',
      depth: node.depth,
      role: node.role,
      status: result.report.status,
      schemaId: result.report.schemaId || record.kind || '',
      fallbackUsed: Boolean(result.report.fallbackUsed),
      summary: result.report.summary || {},
      findings: Object.freeze(result.report.findings || [])
    }));
  }

  for (const edge of traversal.missingEdges || []) {
    findings.push(finding('warning', 'audit.traversal.unavailableTarget', 'Declared lineage target is unavailable in loaded material and was not audited.', { nodeId: edge.to, target: edge.target }));
  }

  const counts = summarizeAudited(audited, findings, traversal);
  return Object.freeze({
    schema: AUDIT_TRAVERSAL_SCOPE_SCHEMA_ID,
    boundary: 'loaded-only audit traversal; no remote fetch; validates only loaded nodes in traversal scope',
    traversal,
    audited: Object.freeze(audited),
    findings: Object.freeze(dedupeFindings(findings)),
    counts,
    status: counts.errors ? 'invalid-or-incomplete' : counts.warnings || counts.unavailableTargets ? 'degraded' : 'readable'
  });
}

function safeRunAudit(record = {}) {
  try {
    const result = runAudit({ markdown: record.markdown || '' });
    return { result, report: auditReport(result) };
  } catch (error) {
    const report = {
      status: 'invalid-or-incomplete',
      schemaId: record.kind || record.schemaId || '',
      moduleId: 'tiinex.root.v1',
      fallbackUsed: true,
      summary: { error: 1, warning: 0, info: 0, preserve: 0 },
      findings: [finding('error', 'audit.traversal.exception', error?.message || 'Audit traversal failed.', { nodeId: record.id || '' })]
    };
    return { result: null, report };
  }
}

function summarizeAudited(audited = [], findings = [], traversal = {}) {
  const counts = {
    visitedNodes: traversal.stats?.visitedNodes || 0,
    auditedNodes: audited.length,
    missingEdges: traversal.stats?.missingEdges || 0,
    unavailableTargets: (traversal.missingEdges || []).length,
    readable: 0,
    degraded: 0,
    invalid: 0,
    fallbackUsed: 0,
    errors: 0,
    warnings: 0,
    infos: 0,
    traversalFindings: findings.length
  };
  for (const item of audited) {
    if (item.status === 'readable') counts.readable += 1;
    else if (item.status === 'degraded') counts.degraded += 1;
    else counts.invalid += 1;
    if (item.fallbackUsed) counts.fallbackUsed += 1;
    counts.errors += Number(item.summary?.error || 0);
    counts.warnings += Number(item.summary?.warning || 0);
    counts.infos += Number(item.summary?.info || 0);
  }
  counts.warnings += findings.filter((item) => item.severity === 'warning').length;
  counts.errors += findings.filter((item) => item.severity === 'error').length;
  counts.infos += findings.filter((item) => item.severity === 'info').length;
  return Object.freeze(counts);
}

function dedupeFindings(findings = []) {
  const seen = new Set();
  return findings.filter((entry) => {
    const key = `${entry.source || ''}:${entry.code || ''}:${entry.nodeId || ''}:${entry.target || ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function finding(severity, code, message, extra = {}) { return Object.freeze(Object.assign({ severity, code, message, source: AUDIT_TRAVERSAL_SCOPE_SCHEMA_ID }, extra)); }
