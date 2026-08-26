import { portableOperationResult as operationResult } from '../operation.result.js';
import { searchPortableLineage as searchPortableLineageIndex } from './lineage.search.js';
import { inspectPortableLineageIntegrity } from './lineage.integrity.plan.js';
import { applyPortableLineageIntegrityRepair } from './lineage.integrity.apply.js';
import { buildPortableLineageIntegrityRepairProjection } from './lineage.integrity.projection.js';

export function planPortableLineageIntegrity(input = {}, options = {}) {
  const inspection = inspectPortableLineageIntegrity(input, options);
  return operationResult('lineage-integrity-plan', { status: inspection.status, inspection, repairPlan: inspection.repairPlan, findings: inspection.findings || [] });
}

export function applyPortableLineageIntegrity(input = {}, options = {}) {
  const application = applyPortableLineageIntegrityRepair(input, options);
  return operationResult('lineage-integrity-apply', { status: application.status, application, changeset: application.changeset, receipts: application.receipts, humanReceipt: application.humanReceipt, boundary: application.boundary, findings: application.findings || [] });
}

export function projectPortableLineageIntegrityRepair(input = {}, options = {}) {
  const projection = buildPortableLineageIntegrityRepairProjection(input, options);
  return operationResult('lineage-integrity-project', { status: projection.status, projection, repairPlan: projection.preparedRepairPlan, boundary: projection.boundary, findings: projection.findings || [] });
}

export function searchPortableLineage(input = {}, options = {}) {
  const search = searchPortableLineageIndex(input, options);
  return operationResult('search-lineage', { boundary: search.boundary, query: search.query, filters: search.filters, scope: search.scope, matches: search.matches, page: search.page, facets: search.facets, findings: search.findings || [] });
}

export const portableLineageOperationDescriptors = Object.freeze([
  Object.freeze({ name: 'lineage-integrity-plan', description: 'Inspect loaded Parent/self/Parent-target integrity and produce a read-only cascade-aware repair plan without mutating lineage or publication state.', safety: 'planning-only-read-only', inputSchema: 'tiinex.portable.lineage-integrity-plan.request.v1', handler: planPortableLineageIntegrity }),
  Object.freeze({ name: 'lineage-integrity-project', description: 'Project shared lineage repair opportunities, compact human guidance, prepared local-only plan steps, capability boundaries, and export readiness without Viewer/VS Code policy forks or remote writes.', safety: 'planning-only-read-only', inputSchema: 'tiinex.portable.lineage-integrity-projection.request.v1', sourceMutation: false, remoteWrite: false, handler: projectPortableLineageIntegrityRepair }),
  Object.freeze({ name: 'lineage-integrity-apply', description: 'Apply one explicit lineage-integrity repair plan to local material under per-artifact approval, structure-preservation, cascade, semantic-disposition, and no-remote-write gates.', safety: 'local-result-no-source-mutation', inputSchema: 'tiinex.portable.lineage-integrity-apply.request.v1', sourceMutation: false, remoteWrite: false, handler: applyPortableLineageIntegrity }),
  Object.freeze({ name: 'search-lineage', description: 'Search and filter loaded lineage by text, schema, source mode, relation role, integrity, continuity, qualification, findings, path, and traversal scope.', safety: 'read-only', inputSchema: 'tiinex.portable.lineage-search.request.v1', handler: searchPortableLineage })
]);
