import { buildPublicationPreflight } from '../publication/publication.preflight.js';
import { buildSourceBoundaryReport, isSourceBacked } from '../diagnostics/sourceBoundary.report.js';
import { projectPackageSourceReference } from '../export/package.sourceReference.js';

export const REINGEST_PLAN_SCHEMA_ID = 'tiinex.reingest.plan.v1';

export function buildReingestPlan(workspace = {}, input = {}) {
  const records = Array.isArray(input.records) ? input.records : (Array.isArray(workspace.records) ? workspace.records : []);
  const assets = Array.isArray(input.assets) ? input.assets : (Array.isArray(workspace.assets) ? workspace.assets : []);
  const workspaceCandidates = Array.isArray(input.workspaceCandidates) ? input.workspaceCandidates : (Array.isArray(workspace.workspaceMergeCandidates) ? workspace.workspaceMergeCandidates : []);
  const sourceBoundary = input.sourceBoundary || buildSourceBoundaryReport(workspace, { records, assets });
  const publicationPreflight = input.publicationPreflight || buildPublicationPreflight(workspace, { records, assets, workspaceCandidates });
  const findings = [];
  const sourceTargets = records.filter((record) => isSourceBacked(record.source)).map((record) => sourceTargetForRecord(record, findings));
  const localDraftTargets = (publicationPreflight.publishableLocalDrafts || []).map((record) => localDraftTarget(record));
  const blockedLocalTargets = (publicationPreflight.blockedLocalDrafts || []).map((record) => blockedLocalTarget(record));
  const assetTargets = assets.map((asset) => assetTarget(asset, findings));
  const workspaceCandidateTargets = workspaceCandidates.map((candidate) => workspaceCandidateTarget(candidate, findings));

  for (const finding of sourceBoundary.findings || []) {
    if (finding.severity === 'error' || finding.code?.includes('ref.unpinned') || finding.code?.includes('path.missing') || finding.code?.includes('repo.missing')) {
      findings.push(normalizeFinding('source-boundary', finding));
    }
  }
  for (const finding of publicationPreflight.findings || []) {
    if (finding.severity === 'error' || finding.code?.includes('ref-unpinned') || finding.code?.includes('asset.metadata-only') || finding.code?.includes('workspace-candidate')) {
      findings.push(normalizeFinding('publication-preflight', finding));
    }
  }

  const dedupedFindings = dedupeFindings(findings);
  const counts = {
    records: records.length,
    sourceTargets: sourceTargets.length,
    pinnedSourceTargets: sourceTargets.filter((target) => target.status === 'pinned').length,
    exactSourceTargets: sourceTargets.filter((target) => target.status === 'exact').length,
    degradedSourceTargets: sourceTargets.filter((target) => target.status === 'degraded').length,
    localDraftTargets: localDraftTargets.length,
    blockedLocalTargets: blockedLocalTargets.length,
    assets: assetTargets.length,
    metadataOnlyAssets: assetTargets.filter((target) => target.status !== 'content-available').length,
    workspaceCandidates: workspaceCandidateTargets.length,
    errors: dedupedFindings.filter((finding) => finding.severity === 'error').length,
    warnings: dedupedFindings.filter((finding) => finding.severity === 'warning').length,
    findings: dedupedFindings.length
  };
  const status = counts.errors ? 'blocked' : counts.warnings || counts.degradedSourceTargets || counts.metadataOnlyAssets || counts.workspaceCandidates || counts.blockedLocalTargets ? 'degraded' : 'ready';

  return Object.freeze({
    schema: REINGEST_PLAN_SCHEMA_ID,
    workspaceId: workspace.id || '',
    title: `Re-ingest plan · ${workspace.title || workspace.name || 'workspace'}`,
    status,
    boundary: 'Plan only. Re-ingest may read declared source-backed material and replay local drafts after explicit publication/export; it never guesses missing GitHub provenance.',
    counts: Object.freeze(counts),
    sourceTargets: Object.freeze(sourceTargets),
    localDraftTargets: Object.freeze(localDraftTargets),
    blockedLocalTargets: Object.freeze(blockedLocalTargets),
    assetTargets: Object.freeze(assetTargets),
    workspaceCandidateTargets: Object.freeze(workspaceCandidateTargets),
    findings: Object.freeze(dedupedFindings)
  });
}

function sourceTargetForRecord(record = {}, findings = []) {
  const target = projectPackageSourceReference(record);
  const id = record.id || target.path || record.path || record.title || 'record';
  if (target.adapterId === 'github') {
    if (!target.repo) findings.push(finding('error', 'reingest.github.repo-missing', 'GitHub re-ingest target is missing repo.', { recordId: id, path: target.path }));
    if (!target.path && !target.inputTarget) findings.push(finding('error', 'reingest.github.path-missing', 'GitHub re-ingest target is missing exact source artifact target.', { recordId: id, repo: target.repo }));
    if (!target.materializedCommit) findings.push(finding('warning', 'reingest.github.ref-unpinned', 'GitHub re-ingest target lacks exact materialized commit authority; branch/tag refs remain mutable or unqualified.', { recordId: id, repo: target.repo, path: target.path, configuredRef: target.configuredRef }));
  }
  return Object.freeze({
    id,
    title: record.title || 'Source-backed artifact',
    adapterId: target.adapterId,
    repo: target.repo,
    ref: target.ref,
    path: target.path,
    target,
    status: target.status === 'pinned-reference' ? 'pinned' : target.status === 'exact-target-reference' ? 'exact' : 'degraded',
    mode: 'read-existing-source',
    boundary: 'Source-backed material remains reference-only; exact source-target authority is preserved and never inferred from workspace presentation paths.'
  });
}

function localDraftTarget(record = {}) {
  return Object.freeze({
    id: record.id || record.path || record.title || '',
    title: record.title || 'Local draft',
    path: record.path || '',
    schemaId: record.schemaId || '',
    status: 'awaiting-publication-or-export',
    mode: 'local-draft-result',
    boundary: 'Local draft can only be re-ingested after explicit publication/export assigns a portable source or package target.'
  });
}

function blockedLocalTarget(record = {}) {
  return Object.freeze({
    id: record.id || record.path || record.title || '',
    title: record.title || 'Blocked local material',
    path: record.path || '',
    status: 'blocked',
    reason: record.reason || record.status || 'not-publication-ready',
    mode: 'local-session-only',
    boundary: 'Blocked local material stays local/session and must not be treated as source-backed.'
  });
}

function assetTarget(asset = {}, findings = []) {
  const id = asset.id || asset.path || asset.name || 'asset';
  const metadataOnly = asset.previewState === 'omitted-large' || asset.cacheState === 'preview-truncated-for-session-cache' || (!asset.content && !asset.dataUrl && !asset.text);
  if (metadataOnly) findings.push(finding('warning', 'reingest.asset.metadata-only', 'Asset does not have full content available for re-ingest; keep as metadata-only or require local reselection.', { assetId: id, path: asset.path || '' }));
  return Object.freeze({
    id,
    name: asset.name || asset.path || 'asset',
    path: asset.path || '',
    mediaType: asset.type || asset.mimeType || '',
    status: metadataOnly ? 'metadata-only' : 'content-available',
    boundary: asset.source?.boundary || 'Asset boundary follows its intake source; local assets are not source-backed leaves.'
  });
}

function workspaceCandidateTarget(candidate = {}, findings = []) {
  findings.push(finding('info', 'reingest.workspace-candidate.explicit-open-merge-required', 'Workspace candidate must be explicitly opened or merged before it participates in re-ingest.', { workspaceCandidateId: candidate.id || '', path: candidate.path || '' }));
  return Object.freeze({
    id: candidate.id || candidate.path || '',
    title: candidate.title || candidate.path || 'Workspace candidate',
    path: candidate.path || '',
    status: 'open-or-merge-required',
    boundary: 'Workspace files are context candidates, not leaves to publish or re-ingest as artifacts.'
  });
}

function normalizeFinding(source, item = {}) {
  return finding(item.severity || 'info', item.code || 'finding', item.message || String(item.code || 'Finding'), Object.assign({ source }, item.recordId ? { recordId: item.recordId } : {}, item.path ? { path: item.path } : {}, item.repo ? { repo: item.repo } : {}));
}

function dedupeFindings(items = []) {
  const seen = new Set();
  const deduped = [];
  for (const item of items) {
    const key = [item.severity, item.code, item.recordId || item.assetId || item.workspaceCandidateId || '', item.path || '', item.repo || ''].join('\u0000');
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(item);
  }
  return deduped;
}

function finding(severity, code, message, extra = {}) {
  return Object.freeze(Object.assign({ severity, code, message }, extra));
}

function explicitRepo(source = {}) {
  return String(source.repo || source.repository || source.config?.repo || '').trim();
}

function explicitRef(source = {}) {
  return String(source.ref || source.config?.ref || source.resolvedRef || source.commit || '').trim();
}
