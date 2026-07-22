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
    selectedTraversal: selectedTraversal ? presentSelectedTraversal(selectedTraversal, nodesById, resolved.findings) : null,
    stats: Object.assign({}, resolved.stats, {
      visibleNodes: visibleNodes.length,
      visibleEdges: visibleEdges.length,
      visibleFindings: visibleFindings.length
    }),
    empty: !visibleNodes.length
  };
}



function presentSelectedTraversal(traversal = {}, nodesById = new Map(), resolvedFindings = []) {
  const traversalNodeIds = new Set((traversal.nodes || []).map((node) => node.id));
  const findingsByNodeId = groupFindingsByNodeId(resolvedFindings);
  const resolvedTraversalFindings = (Array.isArray(resolvedFindings) ? resolvedFindings : []).filter((finding) => finding.nodeId && traversalNodeIds.has(finding.nodeId));
  const terminalNodes = terminalTraversalNodes(traversal);
  const rootNodeIds = new Set(resolvedTraversalFindings.filter((finding) => finding.code === 'lineage.root').map((finding) => finding.nodeId));
  const rootReached = Boolean(!traversal.missingEdges?.length && terminalNodes.some((node) => rootNodeIds.has(node.id)));
  const ambiguous = Boolean(resolvedTraversalFindings.some((finding) => finding.code === 'lineage.target.ambiguous') || (traversal.findings || []).some((finding) => finding.code === 'lineage.target.ambiguous'));
  const hasMissing = Boolean((traversal.missingEdges || []).length || (traversal.findings || []).some((finding) => finding.code === 'lineage.traversal.missingTarget'));
  const secondaryFindings = resolvedTraversalFindings.filter((finding) => finding.code !== 'lineage.root' && finding.code !== 'lineage.parent.missing' && finding.code !== 'lineage.target.ambiguous');
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
        record: resolvedNode.record || null,
        findings: findingsByNodeId.get(node.id) || [],
        terminal: terminalNodes.some((terminal) => terminal.id === node.id),
        root: rootNodeIds.has(node.id)
      });
    }),
    edges: (traversal.edges || []).map((edge) => presentEdge(edge, nodesById)),
    missingEdges: (traversal.missingEdges || []).map((edge) => presentEdge(edge, nodesById)),
    findings: (traversal.findings || []).slice(),
    selectedFindings: (traversal.findings || []).filter((finding) => !finding.nodeId || traversalNodeIds.has(finding.nodeId)),
    resolvedFindings: resolvedTraversalFindings,
    secondaryFindings,
    rootReached,
    ambiguous,
    hasMissing,
    terminalNodeIds: terminalNodes.map((node) => node.id),
    status: traversalStatus({ rootReached, ambiguous, hasMissing, traversal }),
    stats: Object.assign({}, traversal.stats || {}, { rootReached, ambiguous, hasMissing })
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


function groupFindingsByNodeId(findings = []) {
  const map = new Map();
  for (const finding of Array.isArray(findings) ? findings : []) {
    const id = String(finding?.nodeId || '').trim();
    if (!id) continue;
    if (!map.has(id)) map.set(id, []);
    map.get(id).push(finding);
  }
  return map;
}

function terminalTraversalNodes(traversal = {}) {
  const nodes = Array.isArray(traversal.nodes) ? traversal.nodes : [];
  if (!nodes.length) return [];
  const maxDepth = Math.max(...nodes.map((node) => Number(node.depth || 0)));
  return nodes.filter((node) => Number(node.depth || 0) === maxDepth);
}

function traversalStatus({ rootReached = false, ambiguous = false, hasMissing = false, traversal = {} } = {}) {
  if (ambiguous) return { label: 'ambiguous parent', tone: 'mismatch', message: 'Selected lineage has an ambiguous declared target; no guessed edge was created.' };
  if (hasMissing) return { label: 'missing parent', tone: 'mismatch', message: 'Selected lineage stops because a declared parent is not loaded.' };
  if (rootReached) return { label: 'root reached', tone: 'ok', message: 'Selected Parent Trace chain reaches a loaded root.' };
  const nodes = Array.isArray(traversal.nodes) ? traversal.nodes : [];
  if (nodes.length > 1) return { label: 'parent chain loaded', tone: 'ok', message: 'Selected Parent Trace chain is loaded; no missing parent was found.' };
  if (nodes.length === 1) return { label: 'loaded root', tone: 'open', message: 'Selected artifact has no loaded parent trace in this workspace.' };
  return { label: 'selected open', tone: 'open', message: 'No selected lineage traversal is loaded.' };
}
