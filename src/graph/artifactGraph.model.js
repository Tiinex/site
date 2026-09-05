import { resolveLineage } from '../lineage/lineage.resolve.js';
import { LineageEdgeKind, LineageResolutionStatus } from '../lineage/lineage.model.js';
import { canonicalPath, sourceKeyFromTarget } from '../lineage/lineage.targetKeys.js';
import { schemaIdForRecord } from '../schemas/schema.identity.js';

export const ARTIFACT_GRAPH_MODEL_SCHEMA = 'tiinex.artifact-graph.model.v1';
export const ArtifactGraphScope = Object.freeze({ workspace: 'workspace', focus: 'focus', frontier: 'frontier', multi: 'multi' });

export function graphNodeId(workspaceId = '', recordId = '') {
  return `${String(workspaceId || '').trim()}::${String(recordId || '').trim()}`;
}

export function buildArtifactGraph(workspaces = []) {
  const rows = (Array.isArray(workspaces) ? workspaces : []).filter((workspace) => workspace?.id);
  const nodes = [];
  const edges = [];
  const findings = [];
  const workspaceMeta = [];
  const nodeById = new Map();
  const localNodeIdByWorkspace = new Map();

  for (const workspace of rows) {
    const workspaceId = String(workspace.id || '').trim();
    const records = Array.isArray(workspace.records) ? workspace.records : [];
    const lineage = resolveLineage(records, { depth: 'loaded-workspace' });
    const localMap = new Map();
    localNodeIdByWorkspace.set(workspaceId, localMap);
    workspaceMeta.push({
      id: workspaceId,
      title: String(workspace.title || workspace.name || workspaceId),
      historical: Boolean(workspace.historicalReview),
      sourceBoundary: String(workspace.boundary || workspace.workspaceImport?.boundary || '')
    });

    const findingsByNode = new Map();
    for (const finding of lineage.findings || []) {
      const localId = String(finding.nodeId || '').trim();
      if (!findingsByNode.has(localId)) findingsByNode.set(localId, []);
      findingsByNode.get(localId).push(finding);
      findings.push(Object.assign({}, finding, { workspaceId, nodeId: localId ? graphNodeId(workspaceId, localId) : '' }));
    }

    for (const lineageNode of lineage.nodes || []) {
      const record = lineageNode.record || {};
      const localId = String(lineageNode.id || record.id || record.path || '').trim();
      const id = graphNodeId(workspaceId, localId);
      const nodeFindings = findingsByNode.get(localId) || [];
      const node = {
        id,
        recordId: localId,
        workspaceId,
        title: String(lineageNode.title || record.title || record.path || localId || 'Untitled artifact'),
        path: String(record.path || lineageNode.path || ''),
        schemaId: String(schemaIdForRecord(record) || lineageNode.schemaId || ''),
        sourceId: String(record.source?.id || lineageNode.sourceId || ''),
        sourceMode: String(record.sourceMode || lineageNode.sourceMode || ''),
        sourceBoundary: String(record.boundary || record.source?.boundary || lineageNode.boundary || ''),
        temporalState: workspace.historicalReview || record.historicalSnapshot ? 'historical' : 'current',
        sourceState: sourceStateFor(record),
        reductionBoundary: schemaIdForRecord(record) === 'tiinex.reduction.v1',
        resolutionState: resolutionStateFor(nodeFindings),
        findingCount: nodeFindings.filter((finding) => finding.severity !== 'info').length,
        record
      };
      nodes.push(node);
      nodeById.set(id, node);
      localMap.set(localId, id);
    }

    for (const edge of lineage.edges || []) {
      const to = localMap.get(String(edge.to || '')) || '';
      const from = edge.from ? (localMap.get(String(edge.from || '')) || '') : '';
      if (!to) continue;
      edges.push({
        id: `${workspaceId}::${edge.id || `${edge.kind}:${edge.from || 'missing'}->${edge.to || 'missing'}`}`,
        from,
        to,
        kind: edge.kind || LineageEdgeKind.parent,
        status: edge.status || LineageResolutionStatus.resolved,
        target: String(edge.target || ''),
        method: String(edge.method || ''),
        label: String(edge.label || edge.kind || 'relation'),
        workspaceId,
        crossWorkspace: false,
        diagnostics: Array.isArray(edge.diagnostics) ? edge.diagnostics : []
      });
    }
  }

  reconcileExactCrossWorkspaceParents(nodes, edges, findings);
  const degree = graphDegreeIndex(nodes, edges);
  for (const node of nodes) {
    node.degree = degree.get(node.id) || 0;
    delete node.record;
  }

  return Object.freeze({
    schema: ARTIFACT_GRAPH_MODEL_SCHEMA,
    authority: 'artifact identity and declared semantic relations are authoritative; graph coordinates, scope, rank and layout are derived projection only',
    workspaces: workspaceMeta,
    nodes,
    edges,
    findings,
    counts: { workspaces: workspaceMeta.length, nodes: nodes.length, edges: edges.length, unresolvedEdges: edges.filter((edge) => !edge.from).length, crossWorkspaceEdges: edges.filter((edge) => edge.crossWorkspace).length }
  });
}

export function projectArtifactGraphScope(graph = {}, options = {}) {
  const scope = Object.values(ArtifactGraphScope).includes(options.scope) ? options.scope : ArtifactGraphScope.workspace;
  const workspaceId = String(options.workspaceId || graph.workspaces?.[0]?.id || '').trim();
  const focusNodeId = normalizeFocusNodeId(graph, workspaceId, options.focusNodeId || options.selectedRecordId);
  const nodeById = new Map((graph.nodes || []).map((node) => [node.id, node]));
  let selectedIds;

  if (scope === ArtifactGraphScope.multi) selectedIds = new Set((graph.nodes || []).map((node) => node.id));
  else if (scope === ArtifactGraphScope.focus && focusNodeId && nodeById.has(focusNodeId)) selectedIds = graphNeighborhood(graph, focusNodeId, Math.max(1, Number(options.focusRadius || 2)));
  else if (scope === ArtifactGraphScope.frontier) selectedIds = frontierNeighborhood(graph, workspaceId);
  else selectedIds = new Set((graph.nodes || []).filter((node) => node.workspaceId === workspaceId).map((node) => node.id));

  const query = String(options.query || '').trim().toLowerCase();
  if (query) selectedIds = queryNeighborhood(graph, selectedIds, query);

  const nodes = (graph.nodes || []).filter((node) => selectedIds.has(node.id));
  const edges = (graph.edges || []).filter((edge) => selectedIds.has(edge.to) && (!edge.from || selectedIds.has(edge.from)));
  const workspaceIds = new Set(nodes.map((node) => node.workspaceId));
  return Object.freeze({
    schema: 'tiinex.artifact-graph.scope.v1',
    sourceSchema: graph.schema || ARTIFACT_GRAPH_MODEL_SCHEMA,
    authority: graph.authority,
    scope,
    workspaceId,
    focusNodeId,
    query,
    workspaces: (graph.workspaces || []).filter((workspace) => workspaceIds.has(workspace.id)),
    nodes,
    edges,
    findings: (graph.findings || []).filter((finding) => !finding.nodeId || selectedIds.has(finding.nodeId)),
    counts: { nodes: nodes.length, edges: edges.length, unresolvedEdges: edges.filter((edge) => !edge.from).length, crossWorkspaceEdges: edges.filter((edge) => edge.crossWorkspace).length },
    note: scope === ArtifactGraphScope.frontier ? 'Frontier is a derived orientation heuristic over loaded leaves plus one declared-relation neighborhood; it does not declare artifact currentness.' : ''
  });
}

export function applyArtifactGraphLod(graph = {}, options = {}) {
  const maxNodes = Math.max(12, Math.floor(Number(options.maxNodes || 200)));
  const nodes = Array.isArray(graph.nodes) ? graph.nodes : [];
  if (nodes.length <= maxNodes) return Object.freeze(Object.assign({}, graph, { lod: { maxNodes, truncated: false, omittedNodes: 0, omittedEdges: 0, omittedByWorkspace: {} } }));
  const focusNodeId = String(options.focusNodeId || graph.focusNodeId || '');
  const crossEndpoints = new Set((graph.edges || []).filter((edge) => edge.crossWorkspace).flatMap((edge) => [edge.from, edge.to]).filter(Boolean));
  const byWorkspace = new Map();
  for (const node of nodes) {
    if (!byWorkspace.has(node.workspaceId)) byWorkspace.set(node.workspaceId, []);
    byWorkspace.get(node.workspaceId).push(node);
  }
  const score = (node) => (node.id === focusNodeId ? 1000000 : 0)
    + (node.resolutionState !== 'resolved' ? 20000 : 0)
    + (node.reductionBoundary ? 12000 : 0)
    + (crossEndpoints.has(node.id) ? 8000 : 0)
    + Math.min(5000, Number(node.degree || 0) * 200)
    + (node.temporalState === 'current' ? 10 : 0);
  const stableRank = (a, b) => score(b) - score(a) || String(a.id).localeCompare(String(b.id));
  const keep = new Set();
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const adjacency = new Map(nodes.map((node) => [node.id, new Set()]));
  for (const edge of graph.edges || []) {
    if (!edge.from || !edge.to || !adjacency.has(edge.from) || !adjacency.has(edge.to)) continue;
    adjacency.get(edge.from).add(edge.to);
    adjacency.get(edge.to).add(edge.from);
  }
  const workspaceCount = Math.max(1, byWorkspace.size);
  const fairFloor = Math.max(1, Math.min(8, Math.floor(maxNodes / workspaceCount)));
  const orderedWorkspaceIds = [...byWorkspace.keys()].sort((a, b) => String(a).localeCompare(String(b)));

  // Give every visible workspace a deterministic structural seed, then grow a small
  // connected neighborhood around that seed. This keeps truncation useful for
  // orientation instead of selecting globally-ranked but mutually disconnected ties.
  for (const workspaceId of orderedWorkspaceIds) {
    const rows = byWorkspace.get(workspaceId).slice().sort(stableRank);
    const target = Math.min(fairFloor, rows.length, maxNodes - keep.size);
    const queue = [];
    let keptForWorkspace = 0;
    const seedNextComponent = () => {
      const seed = rows.find((node) => !keep.has(node.id));
      if (!seed) return false;
      keep.add(seed.id);
      queue.push(seed.id);
      keptForWorkspace += 1;
      return true;
    };
    if (target > 0) seedNextComponent();
    while (keptForWorkspace < target) {
      if (!queue.length && !seedNextComponent()) break;
      const current = queue.shift();
      const neighbors = [...(adjacency.get(current) || [])]
        .map((id) => nodeById.get(id))
        .filter((node) => node && node.workspaceId === workspaceId && !keep.has(node.id))
        .sort(stableRank);
      for (const neighbor of neighbors) {
        if (keptForWorkspace >= target) break;
        keep.add(neighbor.id);
        queue.push(neighbor.id);
        keptForWorkspace += 1;
      }
    }
    if (keep.size >= maxNodes) break;
  }

  const globallyRanked = nodes.slice().sort(stableRank);
  while (keep.size < maxNodes) {
    const boundary = new Map();
    for (const id of keep) {
      for (const neighborId of adjacency.get(id) || []) {
        if (keep.has(neighborId)) continue;
        const neighbor = nodeById.get(neighborId);
        if (neighbor) boundary.set(neighbor.id, neighbor);
      }
    }
    const next = [...boundary.values()].sort(stableRank)[0]
      || globallyRanked.find((node) => !keep.has(node.id));
    if (!next) break;
    keep.add(next.id);
  }
  const keptNodes = nodes.filter((node) => keep.has(node.id));
  const keptEdges = (graph.edges || []).filter((edge) => keep.has(edge.to) && (!edge.from || keep.has(edge.from)));
  const omittedByWorkspace = {};
  for (const [id, rows] of byWorkspace.entries()) omittedByWorkspace[id] = rows.filter((node) => !keep.has(node.id)).length;
  return Object.freeze(Object.assign({}, graph, {
    nodes: keptNodes,
    edges: keptEdges,
    counts: Object.assign({}, graph.counts || {}, { nodes: keptNodes.length, edges: keptEdges.length, unresolvedEdges: keptEdges.filter((edge) => !edge.from).length, crossWorkspaceEdges: keptEdges.filter((edge) => edge.crossWorkspace).length }),
    lod: { maxNodes, truncated: true, omittedNodes: nodes.length - keptNodes.length, omittedEdges: (graph.edges || []).length - keptEdges.length, omittedByWorkspace }
  }));
}

function resolutionStateFor(findings = []) {
  const codes = (findings || []).map((finding) => String(finding.code || ''));
  if (codes.some((code) => /mismatch|ambiguous|missing|unresolved|outOfBoundary|selfReference/i.test(code))) return 'unresolved';
  return 'resolved';
}

function sourceStateFor(record = {}) {
  const mode = String(record.sourceMode || '').toLowerCase();
  const source = record.source || {};
  if (source.adapterId === 'local' || source.kind === 'local-session' || source.sourceKind === 'local.session' || mode.startsWith('local') || mode.startsWith('package-import') || mode === 'manual-file' || mode === 'manual-folder' || mode === 'archive-local') return 'source-local';
  if (source.id || source.repo || source.repository || mode) return 'source-backed';
  return 'unknown';
}

function exactRecordPaths(node = {}) {
  const record = node.record || {};
  const values = [record.path, record.sourcePath, record.originArtifactPath, record.sourceTarget?.sourceArtifactPath, record.sourceTarget?.path, record.snapshot?.sourceArtifactPath];
  return [...new Set(values.map((value) => canonicalPath(value)).filter(Boolean))];
}

function sourceRepoKeyForNode(node = {}) {
  const record = node.record || {};
  const source = record.source || {};
  const raw = String(source.repo || source.repository || source.repoFullName || '').trim().toLowerCase();
  if (raw.includes('/')) return raw.replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '').split('/').slice(-2).join('/');
  const candidates = [record.path, record.sourcePath, record.sourceTarget?.url, record.sourceTarget?.sourceArtifactUrl].map(sourceKeyFromTarget).filter(Boolean);
  return candidates[0] || '';
}

function reconcileExactCrossWorkspaceParents(nodes = [], edges = [], findings = []) {
  const pathIndex = new Map();
  for (const node of nodes) for (const path of exactRecordPaths(node)) {
    if (!pathIndex.has(path)) pathIndex.set(path, []);
    pathIndex.get(path).push(node);
  }
  for (const edge of edges) {
    if (edge.kind !== LineageEdgeKind.parent || edge.from || !edge.target) continue;
    const targetPath = canonicalPath(edge.target);
    if (!targetPath || /^\.\.?\//.test(String(edge.target || '').trim())) continue;
    const targetRepo = sourceKeyFromTarget(edge.target);
    const candidates = (pathIndex.get(targetPath) || []).filter((node) => node.workspaceId !== edge.workspaceId && (!targetRepo || sourceRepoKeyForNode(node) === targetRepo));
    if (candidates.length !== 1) {
      if (candidates.length > 1) findings.push({ code: 'artifactGraph.crossWorkspaceParent.ambiguous', message: 'Exact declared parent path exists in multiple other workspace boundaries; cross-workspace edge was not projected.', severity: 'warning', nodeId: edge.to, target: edge.target, workspaceId: edge.workspaceId, source: ARTIFACT_GRAPH_MODEL_SCHEMA });
      continue;
    }
    const target = candidates[0];
    edge.from = target.id;
    edge.crossWorkspace = true;
    edge.status = targetRepo ? LineageResolutionStatus.resolved : LineageResolutionStatus.probable;
    edge.method = targetRepo ? 'exact-cross-workspace-source-path' : 'exact-cross-workspace-path';
    edge.label = 'declared parent trace · cross-workspace';
  }
}

function graphDegreeIndex(nodes = [], edges = []) {
  const degree = new Map(nodes.map((node) => [node.id, 0]));
  for (const edge of edges) {
    if (edge.from && degree.has(edge.from)) degree.set(edge.from, degree.get(edge.from) + 1);
    if (edge.to && degree.has(edge.to)) degree.set(edge.to, degree.get(edge.to) + 1);
  }
  return degree;
}

function normalizeFocusNodeId(graph = {}, workspaceId = '', value = '') {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if ((graph.nodes || []).some((node) => node.id === raw)) return raw;
  const composite = graphNodeId(workspaceId, raw);
  return (graph.nodes || []).some((node) => node.id === composite) ? composite : '';
}

function adjacencyFor(graph = {}) {
  const adjacency = new Map((graph.nodes || []).map((node) => [node.id, new Set()]));
  for (const edge of graph.edges || []) {
    if (!edge.from || !edge.to || !adjacency.has(edge.from) || !adjacency.has(edge.to)) continue;
    adjacency.get(edge.from).add(edge.to);
    adjacency.get(edge.to).add(edge.from);
  }
  return adjacency;
}

function graphNeighborhood(graph = {}, startId = '', radius = 2) {
  const adjacency = adjacencyFor(graph);
  const selected = new Set(startId ? [startId] : []);
  let frontier = startId ? [startId] : [];
  for (let depth = 0; depth < radius && frontier.length; depth += 1) {
    const next = [];
    for (const id of frontier) for (const neighbor of adjacency.get(id) || []) if (!selected.has(neighbor)) { selected.add(neighbor); next.push(neighbor); }
    frontier = next;
  }
  return selected;
}

function frontierNeighborhood(graph = {}, workspaceId = '') {
  const workspaceNodes = (graph.nodes || []).filter((node) => node.workspaceId === workspaceId);
  const childCount = new Map(workspaceNodes.map((node) => [node.id, 0]));
  for (const edge of graph.edges || []) if (edge.kind === LineageEdgeKind.parent && edge.from && childCount.has(edge.from) && childCount.has(edge.to)) childCount.set(edge.from, childCount.get(edge.from) + 1);
  const leaves = workspaceNodes.filter((node) => (childCount.get(node.id) || 0) === 0).map((node) => node.id);
  const selected = new Set(leaves);
  const adjacency = adjacencyFor(graph);
  for (const id of leaves) for (const neighbor of adjacency.get(id) || []) selected.add(neighbor);
  return selected;
}

function queryNeighborhood(graph = {}, selectedIds = new Set(), query = '') {
  const matched = new Set((graph.nodes || []).filter((node) => selectedIds.has(node.id) && [node.title, node.path, node.schemaId, node.workspaceId, node.sourceId].some((value) => String(value || '').toLowerCase().includes(query))).map((node) => node.id));
  if (!matched.size) return matched;
  const adjacency = adjacencyFor(graph);
  for (const id of [...matched]) for (const neighbor of adjacency.get(id) || []) if (selectedIds.has(neighbor)) matched.add(neighbor);
  return matched;
}
