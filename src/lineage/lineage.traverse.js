import { resolveLineage } from './lineage.resolve.js';

export const LINEAGE_TRAVERSAL_SCHEMA_ID = 'tiinex.lineage.traversal.v1';

export function traverseLoadedLineage(artifacts = [], options = {}) {
  const resolved = options.resolvedLineage || resolveLineage(artifacts, { depth: 'loaded-workspace' });
  const maxDepth = normalizeDepth(options.maxDepth ?? options.depth ?? 3);
  const direction = normalizeDirection(options.direction || 'ancestors');
  const startIds = normalizeStartIds(options.startIds || options.startId || options.selectedId, resolved.nodes);
  const nodeMap = new Map((resolved.nodes || []).map((node) => [node.id, node]));
  const outgoing = new Map();
  const incoming = new Map();
  for (const edge of resolved.edges || []) {
    if (edge.status === 'missing') {
      addEdge(incoming, edge.to, edge);
      continue;
    }
    addEdge(outgoing, edge.from, edge);
    addEdge(incoming, edge.to, edge);
  }

  const visited = new Map();
  const edgeIds = new Set();
  const missingEdges = [];
  const findings = [];
  const queue = [];

  for (const id of startIds) {
    if (!nodeMap.has(id)) {
      findings.push(finding('warning', 'lineage.traversal.start.missing', 'Traversal start node is not loaded.', { nodeId: id }));
      continue;
    }
    visited.set(id, { node: nodeMap.get(id), depth: 0, role: 'start' });
    queue.push({ id, depth: 0 });
  }

  while (queue.length) {
    const item = queue.shift();
    if (item.depth >= maxDepth) continue;
    const edges = edgesForDirection({ incoming, outgoing, id: item.id, direction });
    for (const edge of edges) {
      if (edge.status === 'missing') {
        if (!missingEdges.some((existing) => existing.id === edge.id)) missingEdges.push(edge);
        findings.push(finding('warning', 'lineage.traversal.missingTarget', 'Declared lineage target is not loaded; traversal stops at this boundary.', { nodeId: edge.to, target: edge.target }));
        continue;
      }
      edgeIds.add(edge.id);
      const nextId = edge.from === item.id ? edge.to : edge.from;
      if (!nextId || !nodeMap.has(nextId)) continue;
      const nextDepth = item.depth + 1;
      if (!visited.has(nextId) || nextDepth < visited.get(nextId).depth) {
        visited.set(nextId, { node: nodeMap.get(nextId), depth: nextDepth, role: edge.from === nextId ? 'ancestor' : 'descendant' });
        queue.push({ id: nextId, depth: nextDepth });
      }
    }
  }

  const nodes = Array.from(visited.values()).sort((a, b) => a.depth - b.depth || String(a.node.path || a.node.id).localeCompare(String(b.node.path || b.node.id)));
  const edges = (resolved.edges || []).filter((edge) => edgeIds.has(edge.id));
  if (!nodes.length) findings.push(finding('info', 'lineage.traversal.empty', 'No loaded lineage nodes matched traversal start options.', {}));

  return Object.freeze({
    schema: LINEAGE_TRAVERSAL_SCHEMA_ID,
    boundary: 'loaded-only; no remote fetch; no inferred edges',
    direction,
    maxDepth,
    startIds: Object.freeze(startIds),
    nodes: Object.freeze(nodes.map(({ node, depth, role }) => Object.freeze({ id: node.id, title: node.title, path: node.path, schemaId: node.schemaId, depth, role, trace: node.trace || '', origin: node.origin || '' }))),
    edges: Object.freeze(edges),
    missingEdges: Object.freeze(missingEdges),
    findings: Object.freeze(dedupeFindings(findings)),
    resolvedLineage: resolved,
    stats: Object.freeze({
      loadedNodes: resolved.nodes?.length || 0,
      visitedNodes: nodes.length,
      traversedEdges: edges.length,
      missingEdges: missingEdges.length,
      findings: dedupeFindings(findings).length,
      stoppedAtDepth: nodes.some((entry) => entry.depth >= maxDepth)
    })
  });
}

function edgesForDirection({ incoming, outgoing, id, direction }) {
  if (direction === 'ancestors') return incoming.get(id) || [];
  if (direction === 'descendants') return outgoing.get(id) || [];
  return [...(incoming.get(id) || []), ...(outgoing.get(id) || [])];
}

function normalizeStartIds(value, nodes = []) {
  const values = Array.isArray(value) ? value : [value];
  const out = values.map((item) => String(item || '').trim()).filter(Boolean);
  return out.length ? out : (nodes[0]?.id ? [nodes[0].id] : []);
}

function normalizeDirection(value = '') {
  const text = String(value || '').toLowerCase();
  if (text === 'descendants' || text === 'children') return 'descendants';
  if (text === 'both' || text === 'all') return 'both';
  return 'ancestors';
}

function normalizeDepth(value) {
  const number = Number.parseInt(value, 10);
  if (!Number.isFinite(number)) return 3;
  return Math.max(0, Math.min(32, number));
}

function addEdge(map, key, edge) {
  if (!key) return;
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(edge);
}

function dedupeFindings(findings = []) {
  const seen = new Set();
  return findings.filter((entry) => {
    const key = `${entry.code}:${entry.nodeId || ''}:${entry.target || ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function finding(severity, code, message, extra = {}) { return Object.freeze(Object.assign({ severity, code, message, source: LINEAGE_TRAVERSAL_SCHEMA_ID }, extra)); }
