import { runAudit } from '../audit/audit.run.js';
import { buildSourceBoundaryReport, isSourceBacked } from '../diagnostics/sourceBoundary.report.js';

export const PUBLICATION_PREFLIGHT_SCHEMA_ID = 'tiinex.publication.preflight.v1';

export function buildPublicationPreflight(workspace = {}, input = {}) {
  const records = Array.isArray(input.records) ? input.records : (Array.isArray(workspace.records) ? workspace.records : []);
  const assets = Array.isArray(input.assets) ? input.assets : (Array.isArray(workspace.assets) ? workspace.assets : []);
  const workspaceCandidates = Array.isArray(input.workspaceCandidates) ? input.workspaceCandidates : (Array.isArray(workspace.workspaceMergeCandidates) ? workspace.workspaceMergeCandidates : []);
  const boundary = buildSourceBoundaryReport(workspace, { records, assets });
  const findings = [...(boundary.findings || []).map((finding) => Object.assign({ source: 'source-boundary' }, finding))];
  const publishable = [];
  const blockedRecords = [];
  const sourceReferences = [];

  for (const record of records) {
    const sourceBacked = isSourceBacked(record.source);
    if (sourceBacked) {
      sourceReferences.push(sourceReferenceForRecord(record, findings));
      continue;
    }
    const assessment = assessLocalPublishCandidate(record);
    if (assessment.publishable) publishable.push(assessment.record);
    else blockedRecords.push(assessment.record);
    findings.push(...assessment.findings);
  }

  for (const asset of assets) assessAssetForPublication(asset, findings);
  for (const candidate of workspaceCandidates) {
    findings.push(finding('info', 'publication.workspace-candidate.reference-only', 'Workspace candidate requires explicit Open/Merge before publication; it is not treated as a leaf.', { path: candidate.path || '', workspaceCandidateId: candidate.id || '' }));
  }

  if (!publishable.length) {
    findings.push(finding('warning', 'publication.no-local-draft-candidates', 'No local draft leaves are currently ready for publication. Source-backed material remains reference-only.', { workspaceId: workspace.id || '' }));
  }

  const errors = findings.filter((item) => item.severity === 'error').length;
  const warnings = findings.filter((item) => item.severity === 'warning').length;
  const status = errors ? 'blocked' : warnings ? 'degraded' : 'ready';

  return Object.freeze({
    schema: PUBLICATION_PREFLIGHT_SCHEMA_ID,
    workspaceId: workspace.id || '',
    title: `Publication preflight · ${workspace.title || workspace.name || 'workspace'}`,
    status,
    boundary: 'Preflight only. No commit, issue, upload, or remote mutation is performed; local drafts stay local until an explicit publication action exists.',
    counts: Object.freeze({
      records: records.length,
      publishableLocalDrafts: publishable.length,
      blockedLocalDrafts: blockedRecords.length,
      sourceReferences: sourceReferences.length,
      assets: assets.length,
      workspaceCandidates: workspaceCandidates.length,
      errors,
      warnings,
      findings: findings.length
    }),
    publishableLocalDrafts: Object.freeze(publishable),
    blockedLocalDrafts: Object.freeze(blockedRecords),
    sourceReferences: Object.freeze(sourceReferences),
    sourceBoundary: boundary,
    findings: Object.freeze(findings)
  });
}

function assessLocalPublishCandidate(record = {}) {
  const findings = [];
  const id = record.id || record.path || record.title || 'record';
  const markdown = String(record.markdown || '').trim();
  if (!markdown) {
    findings.push(finding('error', 'publication.local-record.no-markdown', 'Local draft has no Markdown body to publish.', { recordId: id, path: record.path || '' }));
    return { publishable: false, record: candidateSummary(record, 'blocked', 'no-markdown'), findings };
  }
  let audit;
  try {
    audit = runAudit({ markdown });
  } catch (error) {
    findings.push(finding('error', 'publication.local-record.audit-exception', error?.message || 'Local draft audit failed.', { recordId: id, path: record.path || '' }));
    return { publishable: false, record: candidateSummary(record, 'blocked', 'audit-exception'), findings };
  }
  const missing = requiredEnvelopeFields(markdown);
  for (const field of missing) {
    findings.push(finding('error', `publication.local-record.missing-${field.code}`, `Local draft is missing ${field.label}.`, { recordId: id, path: record.path || '' }));
  }
  const auditErrors = Number(audit.summary?.error || 0);
  const auditWarnings = Number(audit.summary?.warning || 0);
  if (auditErrors) {
    findings.push(finding('error', 'publication.local-record.audit-errors', `Local draft has ${auditErrors} audit error${auditErrors === 1 ? '' : 's'}.`, { recordId: id, path: record.path || '' }));
  } else if (auditWarnings) {
    findings.push(finding('warning', 'publication.local-record.audit-warnings', `Local draft has ${auditWarnings} audit warning${auditWarnings === 1 ? '' : 's'}.`, { recordId: id, path: record.path || '' }));
  }
  const publishable = !missing.length && !auditErrors;
  return {
    publishable,
    record: candidateSummary(record, publishable ? 'ready' : 'blocked', publishable ? 'schema-envelope-ready' : 'audit-or-envelope-failed', audit),
    findings
  };
}

function requiredEnvelopeFields(markdown = '') {
  const text = String(markdown || '');
  const fields = [
    ['envelope-schema', 'Envelope Schema', /Envelope Schema\s*:/i],
    ['current-schema', 'Current Schema', /Current Schema\s*:/i],
    ['current-created-at', 'Current Created At', /-\s*Current[\s\S]*?Created At\s*:/i],
    ['continuity-integrity', 'Continuity Integrity', /Continuity Integrity/i]
  ];
  return fields.filter(([, , pattern]) => !pattern.test(text)).map(([code, label]) => ({ code, label }));
}

function assessAssetForPublication(asset = {}, findings = []) {
  if (asset.previewState === 'omitted-large' || asset.cacheState === 'preview-truncated-for-session-cache') {
    findings.push(finding('warning', 'publication.asset.metadata-only', 'Asset content/preview is not fully available in session cache; package/export must mark it unavailable or require source file selection.', { assetId: asset.id || asset.path || '', path: asset.path || '' }));
  }
}

function sourceReferenceForRecord(record = {}, findings = []) {
  const source = record.source || {};
  const ref = String(source.ref || source.config?.ref || source.resolvedRef || source.commit || '').trim();
  const repo = String(source.repo || source.config?.repo || '').trim();
  const path = String(record.path || '').trim();
  const id = record.id || path || record.title || 'record';
  if (source.adapterId === 'github') {
    if (!repo) findings.push(finding('error', 'publication.source-reference.repo-missing', 'GitHub source reference is missing repo.', { recordId: id, path }));
    if (!ref) findings.push(finding('warning', 'publication.source-reference.ref-unpinned', 'GitHub source reference has no pinned ref; re-ingest can degrade or drift.', { recordId: id, path, repo }));
    if (!path) findings.push(finding('error', 'publication.source-reference.path-missing', 'GitHub source reference is missing path.', { recordId: id, repo }));
  }
  return Object.freeze({
    id,
    title: record.title || 'Source-backed artifact',
    path,
    adapterId: source.adapterId || '',
    repo,
    ref,
    status: repo && path && ref ? 'pinned-reference' : 'degraded-reference',
    writePolicy: 'reference-only; do not publish over source-backed input without explicit derived local draft'
  });
}

function candidateSummary(record = {}, status = 'unknown', reason = '', audit = null) {
  return Object.freeze({
    id: record.id || record.path || record.title || '',
    title: record.title || 'Untitled artifact',
    path: record.path || '',
    status,
    reason,
    schemaId: audit?.artifact?.schemaId || record.schemaId || record.kind || '',
    auditStatus: audit?.status || '',
    sourceMode: record.sourceMode || ''
  });
}

function finding(severity, code, message, extra = {}) {
  return Object.freeze(Object.assign({ severity, code, message }, extra));
}
