import { resolveLineage } from '../lineage/lineage.resolve.js';
import { traverseLoadedLineage } from '../lineage/lineage.traverse.js';

export const WORKSPACE_LINEAGE_VIEW_SCHEMA_ID = 'tiinex.workspace.loadedLineageView.v1';

export function buildWorkspaceLineageView(workspace = {}, input = {}) {
  const records = Array.isArray(input.records) ? input.records : (Array.isArray(workspace.records) ? workspace.records : []);
  const query = String(input.query || '').trim().toLowerCase();
  const resolved = resolveLineage(records, { depth: 'loaded-workspace' });
  const nodesById = new Map(resolved.nodes.map((node) => [node.id, node]));
  const selectedRecordId = String(input.selectedRecordId || '').trim();
  const selectedTraversal = selectedRecordId ? traverseLoadedLineage(records, { resolvedLineage: resolved, startId: selectedRecordId, direction: 'ancestors', maxDepth: 32 }) : null;
  const matchedNodeIds = new Set();

  if (query) {
    for (const node of resolved.nodes) {
      if (nodeMatchesQuery(node, query)) matchedNodeIds.add(node.id);
    }
    // Keep immediate lineage context visible when a match is selected. This avoids
    // turning a filtered Lineage projection into fake missing-parent diagnostics.
    for (const edge of resolved.edges) {
      if (matchedNodeIds.has(edge.from) || matchedNodeIds.has(edge.to)) {
        if (edge.from) matchedNodeIds.add(edge.from);
        if (edge.to) matchedNodeIds.add(edge.to);
      }
    }
  }

  const visibleNodes = query
    ? resolved.nodes.filter((node) => matchedNodeIds.has(node.id))
    : resolved.nodes;
  const visibleNodeIds = new Set(visibleNodes.map((node) => node.id));
  const visibleEdges = resolved.edges.filter((edge) => {
    const fromVisible = !edge.from || visibleNodeIds.has(edge.from);
    const toVisible = !edge.to || visibleNodeIds.has(edge.to);
    return fromVisible && toVisible;
  });
  const visibleFindings = resolved.findings.filter((finding) => !query || !finding.nodeId || visibleNodeIds.has(finding.nodeId));

  return {
    schema: WORKSPACE_LINEAGE_VIEW_SCHEMA_ID,
    workspaceId: workspace.id || '',
    title: `Lineage · ${workspace.title || workspace.name || 'workspace'}`,
    query,
    nodes: visibleNodes.map((node) => presentNode(node)),
    edges: visibleEdges.map((edge) => presentEdge(edge, nodesById)),
    findings: visibleFindings,
    selectedTraversal: selectedTraversal ? presentSelectedTraversal(selectedTraversal, nodesById) : null,
    stats: Object.assign({}, resolved.stats, {
      visibleNodes: visibleNodes.length,
      visibleEdges: visibleEdges.length,
      visibleFindings: visibleFindings.length
    }),
    empty: !visibleNodes.length
  };
}



function presentSelectedTraversal(traversal = {}, nodesById = new Map()) {
  const traversalNodeIds = new Set((traversal.nodes || []).map((node) => node.id));
  return {
    schema: traversal.schema,
    boundary: traversal.boundary,
    direction: traversal.direction,
    maxDepth: traversal.maxDepth,
    startIds: Array.isArray(traversal.startIds) ? traversal.startIds.slice() : [],
    nodes: (traversal.nodes || []).map((node) => {
      const resolvedNode = nodesById.get(node.id) || {};
      return Object.assign({}, node, {
        path: node.path || resolvedNode.path || '',
        sourceLabel: resolvedNode.record?.source?.label || '',
        sourceBacked: Boolean(resolvedNode.record?.source?.adapterId && resolvedNode.record.source.adapterId !== 'local'),
        record: resolvedNode.record || null
      });
    }),
    edges: (traversal.edges || []).map((edge) => presentEdge(edge, nodesById)),
    missingEdges: (traversal.missingEdges || []).map((edge) => presentEdge(edge, nodesById)),
    findings: (traversal.findings || []).slice(),
    selectedFindings: (traversal.findings || []).filter((finding) => !finding.nodeId || traversalNodeIds.has(finding.nodeId)),
    stats: Object.assign({}, traversal.stats || {})
  };
}

function presentNode(node = {}) {
  const record = node.record || {};
  return {
    id: node.id,
    title: node.title || 'Untitled artifact',
    path: node.path || record.path || '',
    schemaId: node.schemaId || record.schemaId || record.kind || '',
    trace: node.trace || '',
    origin: node.origin || '',
    boundary: node.boundary || '',
    sourceLabel: record.source?.label || '',
    sourceBacked: Boolean(record.source?.adapterId && record.source.adapterId !== 'local'),
    hasContinuityContext: Boolean(node.hasContinuityContext),
    hasIntegrity: Boolean(node.hasIntegrity),
    record
  };
}

function presentEdge(edge = {}, nodesById = new Map()) {
  const fromNode = edge.from ? nodesById.get(edge.from) : null;
  const toNode = edge.to ? nodesById.get(edge.to) : null;
  return {
    id: edge.id,
    kind: edge.kind,
    status: edge.status,
    target: edge.target,
    method: edge.method,
    label: edge.label,
    from: edge.from,
    to: edge.to,
    fromTitle: fromNode?.title || (edge.from ? edge.from : 'Missing target'),
    toTitle: toNode?.title || edge.to || 'Unknown artifact',
    fromPath: fromNode?.path || '',
    toPath: toNode?.path || ''
  };
}

function nodeMatchesQuery(node = {}, query = '') {
  const record = node.record || {};
  return [
    node.title,
    node.path,
    node.schemaId,
    node.trace,
    node.origin,
    node.boundary,
    record.summary,
    record.kind,
    record.source?.label
  ].some((value) => String(value || '').toLowerCase().includes(query));
}
