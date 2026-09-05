import { applyArtifactGraphLod, buildArtifactGraph, projectArtifactGraphScope } from './artifactGraph.model.js';

export const ARTIFACT_GRAPH_LAYOUT_SCHEMA = 'tiinex.artifact-graph.layout.v1';

export function prepareArtifactGraphProjection(input = {}) {
  const model = buildArtifactGraph(input.workspaces || []);
  const scoped = projectArtifactGraphScope(model, input);
  const lod = applyArtifactGraphLod(scoped, { maxNodes: input.maxNodes || 200, focusNodeId: scoped.focusNodeId });
  return Object.freeze({ model, graph: lod, layout: deterministicArtifactGraphLayout(lod, input.layout || {}) });
}

export function deterministicArtifactGraphLayout(graph = {}, options = {}) {
  const nodeGapX = Math.max(120, Number(options.nodeGapX || 190));
  const nodeGapY = Math.max(48, Number(options.nodeGapY || 76));
  const bandGap = Math.max(80, Number(options.bandGap || 120));
  const marginX = 80;
  const marginY = 70;
  const positions = {};
  const bands = [];
  let bandTop = marginY;
  let maxDepthOverall = 0;
  const workspaceIds = [...new Set((graph.nodes || []).map((node) => node.workspaceId))].sort();
  const workspaceTitle = new Map((graph.workspaces || []).map((workspace) => [workspace.id, workspace.title || workspace.id]));

  for (const workspaceId of workspaceIds) {
    const nodes = (graph.nodes || []).filter((node) => node.workspaceId === workspaceId);
    const ids = new Set(nodes.map((node) => node.id));
    const internalParentEdges = (graph.edges || []).filter((edge) => edge.kind === 'parent' && edge.from && ids.has(edge.from) && ids.has(edge.to));
    const depth = layeredDepth(nodes, internalParentEdges);
    const layers = new Map();
    for (const node of nodes) {
      const d = depth.get(node.id) || 0;
      if (!layers.has(d)) layers.set(d, []);
      layers.get(d).push(node);
      maxDepthOverall = Math.max(maxDepthOverall, d);
    }
    let maxLayerSize = 1;
    for (const rows of layers.values()) maxLayerSize = Math.max(maxLayerSize, rows.length);
    const bandHeight = Math.max(150, maxLayerSize * nodeGapY + 90);
    for (const [d, rows] of [...layers.entries()].sort((a, b) => a[0] - b[0])) {
      rows.sort((a, b) => Number(b.degree || 0) - Number(a.degree || 0) || String(a.id).localeCompare(String(b.id)));
      rows.forEach((node, index) => {
        positions[node.id] = { x: marginX + d * nodeGapX, y: bandTop + 52 + index * nodeGapY, workspaceId, depth: d, order: index };
      });
    }
    bands.push({ workspaceId, title: workspaceTitle.get(workspaceId) || workspaceId, y: bandTop, height: bandHeight, nodeCount: nodes.length });
    bandTop += bandHeight + bandGap;
  }

  return Object.freeze({
    schema: ARTIFACT_GRAPH_LAYOUT_SCHEMA,
    algorithm: 'deterministic-workspace-layered-v1',
    authority: 'derived-projection-only',
    deterministic: true,
    positions,
    bands,
    width: Math.max(720, marginX * 2 + (maxDepthOverall + 1) * nodeGapX),
    height: Math.max(360, bandTop - bandGap + marginY),
    crossWorkspaceEdgesDoNotChangeBandAuthority: true
  });
}

export function scheduleArtifactGraphProjection(input = {}, options = {}) {
  const win = options.win || globalThis;
  let cancelled = false;
  let idleId = null;
  let timerId = null;
  let worker = null;
  const finish = (projection) => { if (!cancelled) options.onReady?.(projection); };
  const fail = (error) => { if (!cancelled) options.onError?.(error); };
  const runInline = () => {
    if (cancelled) return;
    try { finish(prepareArtifactGraphProjection(input)); }
    catch (error) { fail(error); }
  };
  const scheduleInline = () => {
    if (typeof win?.requestIdleCallback === 'function') idleId = win.requestIdleCallback(runInline, { timeout: Math.max(50, Number(options.timeout || 700)) });
    else timerId = win?.setTimeout?.(runInline, 0) || null;
  };
  const workerFactory = options.workerFactory || defaultGraphWorkerFactory;
  if (options.useWorker !== false) {
    try {
      worker = workerFactory?.(win) || null;
      if (worker) {
        const id = `graph-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        worker.addEventListener('message', (event) => {
          if (event.data?.id !== id) return;
          const response = event.data || {};
          worker?.terminate?.(); worker = null;
          if (response.ok) finish(response.projection);
          else fail(new Error(response.error || 'Graph worker projection failed.'));
        }, { once: true });
        worker.addEventListener('error', () => {
          worker?.terminate?.(); worker = null;
          scheduleInline();
        }, { once: true });
        worker.postMessage({ id, input });
      } else scheduleInline();
    } catch (_) { worker?.terminate?.(); worker = null; scheduleInline(); }
  } else scheduleInline();
  return () => {
    cancelled = true;
    worker?.terminate?.(); worker = null;
    if (idleId !== null && typeof win?.cancelIdleCallback === 'function') win.cancelIdleCallback(idleId);
    if (timerId !== null && typeof win?.clearTimeout === 'function') win.clearTimeout(timerId);
  };
}

function defaultGraphWorkerFactory(win = globalThis) {
  const WorkerCtor = win?.Worker || globalThis.Worker;
  if (typeof WorkerCtor !== 'function') return null;
  return new WorkerCtor(new URL('./artifactGraph.worker.js', import.meta.url), { type: 'module', name: 'tiinex-node-graph-projection' });
}

function layeredDepth(nodes = [], edges = []) {
  const ids = new Set(nodes.map((node) => node.id));
  const incoming = new Map(nodes.map((node) => [node.id, 0]));
  const outgoing = new Map(nodes.map((node) => [node.id, []]));
  for (const edge of edges) {
    if (!ids.has(edge.from) || !ids.has(edge.to)) continue;
    incoming.set(edge.to, incoming.get(edge.to) + 1);
    outgoing.get(edge.from).push(edge.to);
  }
  const depth = new Map(nodes.map((node) => [node.id, 0]));
  const queue = nodes.filter((node) => incoming.get(node.id) === 0).map((node) => node.id).sort();
  const seen = new Set();
  while (queue.length) {
    const id = queue.shift();
    seen.add(id);
    for (const child of (outgoing.get(id) || []).slice().sort()) {
      depth.set(child, Math.max(depth.get(child) || 0, (depth.get(id) || 0) + 1));
      incoming.set(child, incoming.get(child) - 1);
      if (incoming.get(child) === 0) queue.push(child);
    }
    queue.sort();
  }
  for (const node of nodes.slice().sort((a, b) => String(a.id).localeCompare(String(b.id)))) if (!seen.has(node.id)) depth.set(node.id, depth.get(node.id) || 0);
  return depth;
}
