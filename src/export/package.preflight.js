import { buildPublicationPreflight } from '../publication/publication.preflight.js';
import { buildReingestPlan } from '../reingest/reingest.plan.js';
import { buildWorkspaceGovernanceSummary, governanceFindingForBoundary } from '../governance/governance.boundary.js';
import { buildSourceBoundaryReport, isSourceBacked } from '../diagnostics/sourceBoundary.report.js';

export const EXPORT_PACKAGE_PREFLIGHT_SCHEMA_ID = 'tiinex.export.package.preflight.v1';

export function buildExportPackagePreflight(workspace = {}, input = {}) {
  const records = Array.isArray(input.records) ? input.records : (Array.isArray(workspace.records) ? workspace.records : []);
  const assets = Array.isArray(input.assets) ? input.assets : (Array.isArray(workspace.assets) ? workspace.assets : []);
  const workspaceCandidates = Array.isArray(input.workspaceCandidates) ? input.workspaceCandidates : (Array.isArray(workspace.workspaceMergeCandidates) ? workspace.workspaceMergeCandidates : []);
  const sourceBoundary = input.sourceBoundary || buildSourceBoundaryReport(workspace, { records, assets });
  const publicationPreflight = input.publicationPreflight || buildPublicationPreflight(workspace, { records, assets, workspaceCandidates });
  const reingestPlan = input.reingestPlan || buildReingestPlan(workspace, { records, assets, workspaceCandidates, sourceBoundary, publicationPreflight });
  const governanceBoundary = input.governanceBoundary || buildWorkspaceGovernanceSummary(workspace, { records, assets });
  const findings = [];

  for (const finding of sourceBoundary.findings || []) {
    if (finding.severity === 'error' || finding.code?.includes('provenance-leak')) findings.push(normalizeFinding('source-boundary', finding));
  }
  for (const finding of publicationPreflight.findings || []) {
    if (finding.severity === 'error' || finding.code?.includes('asset.metadata-only') || finding.code?.includes('workspace-candidate') || finding.code?.includes('source-reference.ref-unpinned')) {
      findings.push(normalizeFinding('publication-preflight', finding));
    }
  }
  for (const finding of reingestPlan.findings || []) {
    if (finding.severity === 'error' || finding.code?.includes('metadata-only') || finding.code?.includes('workspace-candidate') || finding.code?.includes('ref-unpinned')) {
      findings.push(normalizeFinding('reingest-plan', finding));
    }
  }
  for (const boundary of governanceBoundary.sources || []) {
    const boundaryFinding = governanceFindingForBoundary(boundary);
    if (boundaryFinding) findings.push(normalizeFinding('governance-boundary', boundaryFinding));
  }

  const localDraftEntries = (publicationPreflight.publishableLocalDrafts || []).map((record) => localDraftEntry(record));
  const blockedLocalEntries = (publicationPreflight.blockedLocalDrafts || []).map((record) => blockedLocalEntry(record, findings));
  const sourceReferenceEntries = (publicationPreflight.sourceReferences || []).map((reference) => sourceReferenceEntry(reference, findings));
  const assetEntries = assets.map((asset) => assetEntry(asset, findings));
  const workspaceCandidateEntries = workspaceCandidates.map((candidate) => workspaceCandidateEntry(candidate, findings));

  if (!localDraftEntries.length && !sourceReferenceEntries.length && !assetEntries.length && !workspaceCandidateEntries.length) {
    findings.push(finding('warning', 'export.package.empty', 'No loaded material is available for export/package preflight.', { workspaceId: workspace.id || '' }));
  }

  const dedupedFindings = prioritizeFindings(dedupeFindings(findings));
  const counts = {
    records: records.length,
    packageEntries: localDraftEntries.length + sourceReferenceEntries.length + assetEntries.length + workspaceCandidateEntries.length,
    localDraftEntries: localDraftEntries.length,
    blockedLocalEntries: blockedLocalEntries.length,
    sourceReferenceEntries: sourceReferenceEntries.length,
    pinnedSourceReferences: sourceReferenceEntries.filter((entry) => entry.status === 'pinned-reference').length,
    degradedSourceReferences: sourceReferenceEntries.filter((entry) => entry.status !== 'pinned-reference').length,
    assetEntries: assetEntries.length,
    metadataOnlyAssets: assetEntries.filter((entry) => entry.status === 'metadata-only').length,
    workspaceCandidateEntries: workspaceCandidateEntries.length,
    errors: dedupedFindings.filter((item) => item.severity === 'error').length,
    warnings: dedupedFindings.filter((item) => item.severity === 'warning').length,
    info: dedupedFindings.filter((item) => item.severity === 'info').length,
    findings: dedupedFindings.length
  };
  const status = counts.errors || counts.blockedLocalEntries ? 'blocked' : (counts.warnings || counts.metadataOnlyAssets || counts.degradedSourceReferences || counts.workspaceCandidateEntries ? 'degraded' : 'ready');

  return Object.freeze({
    schema: EXPORT_PACKAGE_PREFLIGHT_SCHEMA_ID,
    workspaceId: workspace.id || '',
    title: `Export package preflight · ${workspace.title || workspace.name || 'workspace'}`,
    status,
    boundary: 'Preflight only. It plans a bounded package without creating a zip, mutating sources, or converting local/session material into GitHub provenance.',
    entryPolicy: 'Embed validated local draft Markdown; preserve source-backed material as explicit source references; keep local assets as assets, never fake leaves.',
    counts: Object.freeze(counts),
    governanceBoundary,
    localDraftEntries: Object.freeze(localDraftEntries),
    blockedLocalEntries: Object.freeze(blockedLocalEntries),
    sourceReferenceEntries: Object.freeze(sourceReferenceEntries),
    assetEntries: Object.freeze(assetEntries),
    workspaceCandidateEntries: Object.freeze(workspaceCandidateEntries),
    findings: Object.freeze(dedupedFindings)
  });
}

function localDraftEntry(record = {}) {
  return Object.freeze({
    id: record.id || record.path || record.title || '',
    title: record.title || 'Local draft',
    path: record.path || '',
    kind: 'artifact-markdown',
    status: 'ready',
    mode: 'embed-local-draft-markdown',
    boundary: 'Package may embed this validated local draft. It remains a local draft until explicit publication assigns a durable source.'
  });
}

function blockedLocalEntry(record = {}, findings = []) {
  const id = record.id || record.path || record.title || '';
  findings.push(finding('error', 'export.package.local-entry.blocked', 'Local record is not package-ready; it needs a readable Markdown envelope or an explicit preservation/export policy.', { recordId: id, path: record.path || '' }));
  return Object.freeze({
    id,
    title: record.title || 'Blocked local record',
    path: record.path || '',
    kind: 'local-record',
    status: 'blocked',
    reason: record.reason || record.status || 'not-package-ready',
    boundary: 'Blocked local/session material must not be silently packaged as a valid Tiinex leaf.'
  });
}

function sourceReferenceEntry(reference = {}, findings = []) {
  if (reference.status !== 'pinned-reference') {
    findings.push(finding('warning', 'export.package.source-reference.degraded', 'Source-backed material can be packaged only as a degraded source reference until repo/ref/path are explicit.', { recordId: reference.id || '', path: reference.path || '', repo: reference.repo || '' }));
  }
  return Object.freeze({
    id: reference.id || reference.path || reference.title || '',
    title: reference.title || 'Source reference',
    path: reference.path || '',
    kind: 'source-reference',
    adapterId: reference.adapterId || '',
    repo: reference.repo || '',
    ref: reference.ref || '',
    status: reference.status || 'degraded-reference',
    mode: 'preserve-source-reference',
    boundary: 'Package stores a reference to source-backed input; it does not republish or embed it as a new local draft.'
  });
}

function assetEntry(asset = {}, findings = []) {
  const id = asset.id || asset.path || asset.name || '';
  const hasContent = Boolean(asset.content || asset.dataUrl || asset.text || asset.bytes);
  const metadataOnly = asset.previewState === 'omitted-large' || asset.cacheState === 'preview-truncated-for-session-cache' || !hasContent;
  if (metadataOnly) {
    findings.push(finding('warning', 'export.package.asset.metadata-only', 'Asset has no full content in the loaded session; package must mark it metadata-only or require reselection.', { assetId: id, path: asset.path || '' }));
  }
  return Object.freeze({
    id,
    title: asset.name || asset.path || 'Asset',
    path: asset.path || '',
    kind: 'asset',
    mediaType: asset.type || asset.mimeType || '',
    status: metadataOnly ? 'metadata-only' : 'content-available',
    mode: metadataOnly ? 'asset-metadata-entry' : 'asset-content-entry',
    boundary: asset.source?.boundary || 'Asset boundary follows its intake source; assets are not fake leaves.'
  });
}

function workspaceCandidateEntry(candidate = {}, findings = []) {
  const id = candidate.id || candidate.path || '';
  findings.push(finding('info', 'export.package.workspace-candidate.open-merge-required', 'Workspace candidate is context material; it must be explicitly opened or merged before it becomes package entrypoint context.', { workspaceCandidateId: id, path: candidate.path || '' }));
  return Object.freeze({
    id,
    title: candidate.title || candidate.path || 'Workspace candidate',
    path: candidate.path || '',
    kind: 'workspace-candidate',
    status: 'open-or-merge-required',
    mode: 'context-candidate-reference',
    boundary: 'Workspace candidate is not packaged as a leaf without explicit open/merge.'
  });
}

function normalizeFinding(source, item = {}) {
  return finding(item.severity || 'info', item.code || 'finding', item.message || String(item.code || 'Finding'), Object.assign({ source }, item.recordId ? { recordId: item.recordId } : {}, item.assetId ? { assetId: item.assetId } : {}, item.workspaceCandidateId ? { workspaceCandidateId: item.workspaceCandidateId } : {}, item.path ? { path: item.path } : {}, item.repo ? { repo: item.repo } : {}));
}

function prioritizeFindings(items = []) {
  return items.slice().sort((a, b) => {
    const aOwn = String(a.code || '').startsWith('export.package') ? 0 : 1;
    const bOwn = String(b.code || '').startsWith('export.package') ? 0 : 1;
    if (aOwn !== bOwn) return aOwn - bOwn;
    const rank = { error: 0, warning: 1, info: 2 };
    return (rank[a.severity] ?? 3) - (rank[b.severity] ?? 3);
  });
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
