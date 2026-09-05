import { auditPortableRecord } from '../tooling/portable/audit/audit.capability.js';
import { buildPortableLineageIntegrityRepairProjection } from '../tooling/portable/lineage/lineage.integrity.projection.js';
import { resolveAuditLineage } from '../audit/lineage/auditLineage.resolve.js';
import { schemaReadPresentation } from '../schemas/companion.js';
import { schemaIdForRecord } from '../schemas/schema.identity.js';

export const WORKSPACE_AUDIT_VIEW_SCHEMA_ID = 'tiinex.workspace.loadedAuditView.v1';

export function buildWorkspaceAuditView(workspace = {}, input = {}) {
  const records = Array.isArray(input.records) ? input.records : (Array.isArray(workspace.records) ? workspace.records : []);
  const query = String(input.query || '').trim().toLowerCase();
  const lineage = resolveAuditLineage(records);
  const repair = buildPortableLineageIntegrityRepairProjection({ records });
  const items = records.map((record) => auditRecord(record));
  const visibleItems = query ? items.filter((item) => auditItemMatchesQuery(item, query)) : items;
  const visibleIds = new Set(visibleItems.map((item) => item.id));
  const visibleLineageFindings = (lineage.findings || []).filter((finding) => !query || !finding.nodeId || visibleIds.has(finding.nodeId));
  const counts = summarizeAuditItems(items, lineage.findings || []);
  const visibleCounts = summarizeAuditItems(visibleItems, visibleLineageFindings);

  return {
    schema: WORKSPACE_AUDIT_VIEW_SCHEMA_ID,
    workspaceId: workspace.id || '',
    title: `Audit · ${workspace.title || workspace.name || 'workspace'}`,
    mode: 'loaded-only',
    boundary: 'Loaded material only. Audit validates Tiinex leaf candidates, keeps plain Markdown as supporting material, and reports missing lineage targets without network guesses.',
    query,
    items: visibleItems,
    repair,
    lineage: {
      schema: lineage.schema,
      edges: lineage.edges || [],
      findings: visibleLineageFindings,
      stats: lineage.stats || {}
    },
    counts,
    visibleCounts,
    empty: !visibleItems.length
  };
}

function auditRecord(record = {}) {
  const markdown = typeof record.markdown === 'string' ? record.markdown : '';
  const result = auditPortableRecord(record);
  const read = schemaReadPresentation(record, { compact: true, maxSections: 1 });
  return {
    id: result.id || record.id || record.path || record.title || '',
    title: record.title || result.title || 'Untitled artifact',
    path: record.path || '',
    sourceLabel: record.source?.label || '',
    sourceBacked: Boolean(record.source?.adapterId && record.source.adapterId !== 'local'),
    status: result.status,
    schemaId: result.schemaId || schemaIdForRecord(record),
    moduleId: result.resolution?.moduleId || '',
    fallbackUsed: Boolean(result.resolution?.fallbackUsed || read.fallbackUsed),
    readState: read.readState || (result.resolution?.fallbackUsed ? 'root-fallback' : 'schema-owned'),
    schemaCoverage: read.schemaCoverage || 'missing-schema',
    bodyAvailability: result.materialAvailability?.status === 'pending-unavailable' ? 'unavailable-body' : (read.bodyAvailability || (markdown ? 'available' : 'unavailable-body')),
    validation: result.validation || null,
    validationState: result.validation?.state || 'validation-unknown',
    validationCoverage: result.validation?.coverage || 'unknown',
    childValidator: result.validation?.childValidator || 'unknown',
    rootValidator: result.validation?.rootValidator || 'unknown',
    integrityMethodVersions: result.validation?.integrityMethodVersions || [],
    exactCompanion: Boolean(read.exactCompanion),
    summary: result.summary || {},
    findings: result.findings || [],
    markdownAvailable: Boolean(markdown),
    materialAvailability: result.materialAvailability?.status || (markdown ? 'available' : 'unknown'),
    capabilityBoundary: result.capabilityBoundary || null,
    record
  };
}

function summarizeAuditItems(items = [], lineageFindings = []) {
  const counts = {
    records: items.length,
    readable: 0,
    degraded: 0,
    invalid: 0,
    pending: 0,
    unavailable: 0,
    supporting: 0,
    fallbackUsed: 0,
    schemaOwned: 0,
    rootReadable: 0,
    rootFallback: 0,
    unknownSchema: 0,
    unavailableBody: 0,
    validationComplete: 0,
    validationPartial: 0,
    validationUnavailable: 0,
    validationNotApplicable: 0,
    childValidatorUnavailable: 0,
    integrityV2: 0,
    partialLineage: countPartialLineageNodes(lineageFindings),
    errors: 0,
    warnings: 0,
    infos: 0,
    lineageFindings: lineageFindings.length,
    missingLineage: lineageFindings.filter((finding) => finding.code === 'lineage.parent.missing').length
  };
  for (const item of items) {
    if (item.status === 'readable') counts.readable += 1;
    else if (item.status === 'degraded') counts.degraded += 1;
    else if (item.status === 'pending-unavailable') {
      counts.pending += 1;
      counts.unavailable += 1;
    } else if (item.status === 'supporting-material') counts.supporting += 1;
    else counts.invalid += 1;
    if (item.fallbackUsed) counts.fallbackUsed += 1;
    if (item.readState === 'schema-owned') counts.schemaOwned += 1;
    if (item.readState === 'root-readable') counts.rootReadable += 1;
    if (item.readState === 'root-fallback') counts.rootFallback += 1;
    if (item.schemaCoverage === 'unknown-schema') counts.unknownSchema += 1;
    if (item.bodyAvailability === 'unavailable-body') counts.unavailableBody += 1;
    if (item.validationState === 'exact-schema-validated' || item.validationState === 'root-validated') counts.validationComplete += 1;
    else if (item.validationState === 'root-only-child-validator-unavailable' || item.validationState === 'validation-unknown') counts.validationPartial += 1;
    else if (item.validationState === 'not-run-body-unavailable') counts.validationUnavailable += 1;
    else if (item.validationState === 'not-applicable-supporting') counts.validationNotApplicable += 1;
    if (item.childValidator === 'unavailable') counts.childValidatorUnavailable += 1;
    if ((item.integrityMethodVersions || []).includes('v2')) counts.integrityV2 += 1;
    counts.errors += Number(item.summary?.error || 0);
    counts.warnings += Number(item.summary?.warning || 0);
    counts.infos += Number(item.summary?.info || 0);
  }
  return counts;
}

function countPartialLineageNodes(lineageFindings = []) {
  const ids = new Set();
  for (const finding of Array.isArray(lineageFindings) ? lineageFindings : []) {
    ids.add(finding.nodeId || finding.target || finding.code || 'workspace');
  }
  return ids.size;
}

function auditItemMatchesQuery(item = {}, query = '') {
  return [
    item.title,
    item.path,
    item.schemaId,
    item.moduleId,
    item.status,
    item.readState,
    item.validationState,
    item.validationCoverage,
    item.schemaCoverage,
    item.bodyAvailability,
    item.sourceLabel,
    ...(item.findings || []).flatMap((finding) => [finding.code, finding.message, finding.severity])
  ].some((value) => String(value || '').toLowerCase().includes(query));
}
