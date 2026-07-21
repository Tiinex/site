export const LINEAGE_VIEW_MODEL_SCHEMA_ID = 'tiinex.lineage.view.v1';

export const LineageEdgeKind = Object.freeze({
  parent: 'parent',
  origin: 'origin',
  transition: 'transition'
});

export const LineageResolutionStatus = Object.freeze({
  root: 'root',
  resolved: 'resolved',
  missing: 'missing',
  degraded: 'degraded'
});

export function createLineageNode(record = {}, index = 0) {
  return {
    id: record.id || record.path || `lineage-node-${index}`,
    title: record.title || record.path || 'Untitled artifact',
    path: record.path || '',
    schemaId: record.schemaId || record.kind || '',
    sourceId: record.source?.id || '',
    sourceMode: record.sourceMode || '',
    boundary: record.boundary || record.source?.boundary || '',
    trace: record.trace || '',
    origin: record.origin || '',
    parentSchemaId: record.parentSchemaId || '',
    hasContinuityContext: Boolean(record.hasContinuityContext),
    hasIntegrity: Boolean(record.hasIntegrity),
    record
  };
}

export function createLineageEdge(from, to, kind = LineageEdgeKind.parent, input = {}) {
  return {
    id: input.id || `${kind}:${from || 'missing'}->${to || 'missing'}`,
    from: from || '',
    to: to || '',
    kind,
    status: input.status || LineageResolutionStatus.resolved,
    target: input.target || '',
    method: input.method || '',
    label: input.label || kind,
    diagnostics: input.diagnostics || []
  };
}

export function createLineageFinding(code, message, severity = 'warning', input = {}) {
  return {
    code,
    message,
    severity,
    nodeId: input.nodeId || '',
    target: input.target || '',
    source: 'tiinex.lineage.v1'
  };
}
