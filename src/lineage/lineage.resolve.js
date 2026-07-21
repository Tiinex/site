import { createLineageEdge, createLineageFinding, createLineageNode, LINEAGE_VIEW_MODEL_SCHEMA_ID, LineageEdgeKind, LineageResolutionStatus } from './lineage.model.js';

export function resolveLineage(artifacts = [], options = {}) {
  const records = Array.isArray(artifacts) ? artifacts : [];
  const nodes = records.map((record, index) => createLineageNode(record, index));
  const index = buildLineageIndex(nodes);
  const edges = [];
  const findings = [];

  for (const node of nodes) {
    const targets = declaredTargetsFor(node);
    if (!targets.length) {
      findings.push(createLineageFinding('lineage.root', 'No declared parent trace/origin; artifact is treated as a lineage root in the loaded set.', 'info', { nodeId: node.id }));
      continue;
    }

    const traceTarget = targets.find((target) => target.kind === LineageEdgeKind.parent);
    const originTarget = targets.find((target) => target.kind === LineageEdgeKind.origin);
    const parentMatch = traceTarget ? resolveTarget(traceTarget.value, index) : null;
    const originMatch = originTarget ? resolveTarget(originTarget.value, index) : null;

    if (parentMatch) {
      edges.push(createLineageEdge(parentMatch.id, node.id, LineageEdgeKind.parent, {
        target: traceTarget.value,
        method: parentMatch.method,
        label: 'declared parent trace'
      }));
      if (originTarget && originMatch && originMatch.id !== parentMatch.id) {
        edges.push(createLineageEdge(originMatch.id, node.id, LineageEdgeKind.origin, {
          target: originTarget.value,
          method: originMatch.method,
          label: 'origin recovery hint'
        }));
      } else if (originTarget && !originMatch) {
        findings.push(createLineageFinding('lineage.origin.unresolved', 'Origin is declared but not present in the loaded material.', 'info', { nodeId: node.id, target: originTarget.value }));
      }
      continue;
    }

    if (traceTarget) {
      edges.push(createLineageEdge('', node.id, LineageEdgeKind.parent, {
        status: LineageResolutionStatus.missing,
        target: traceTarget.value,
        method: 'unresolved-trace',
        label: 'missing parent trace'
      }));
      findings.push(createLineageFinding('lineage.parent.missing', 'Parent Trace is declared but the target is not loaded.', 'warning', { nodeId: node.id, target: traceTarget.value }));
    }

    if (originTarget && originMatch) {
      edges.push(createLineageEdge(originMatch.id, node.id, LineageEdgeKind.origin, {
        target: originTarget.value,
        method: originMatch.method,
        label: 'origin fallback edge',
        status: traceTarget ? LineageResolutionStatus.degraded : LineageResolutionStatus.resolved
      }));
      if (traceTarget) {
        findings.push(createLineageFinding('lineage.parent.originFallback', 'Parent Trace is missing from loaded material; Origin resolved as recovery context only.', 'info', { nodeId: node.id, target: originTarget.value }));
      }
      continue;
    }

    if (originTarget) {
      findings.push(createLineageFinding('lineage.origin.unresolved', 'Origin is declared but not present in the loaded material.', traceTarget ? 'info' : 'warning', { nodeId: node.id, target: originTarget.value }));
    }
  }

  return {
    schema: LINEAGE_VIEW_MODEL_SCHEMA_ID,
    nodes,
    artifacts: records,
    edges,
    findings,
    stats: {
      nodes: nodes.length,
      edges: edges.filter((edge) => edge.status !== LineageResolutionStatus.missing).length,
      missingEdges: edges.filter((edge) => edge.status === LineageResolutionStatus.missing).length,
      roots: findings.filter((finding) => finding.code === 'lineage.root').length,
      warnings: findings.filter((finding) => finding.severity === 'warning' || finding.severity === 'error').length
    },
    options: { depth: options.depth || 'loaded' }
  };
}

function declaredTargetsFor(node = {}) {
  const targets = [];
  if (node.trace) targets.push({ kind: LineageEdgeKind.parent, value: node.trace });
  if (node.origin) targets.push({ kind: LineageEdgeKind.origin, value: node.origin });
  return targets;
}

function buildLineageIndex(nodes = []) {
  const index = { byId: new Map(), byRecordTrace: new Map(), byPath: new Map(), bySourcePath: new Map() };
  for (const node of nodes) {
    const id = canonicalToken(node.id);
    if (id) {
      index.byId.set(id, node);
      index.byRecordTrace.set(`record:${id}`, node);
    }
    const path = canonicalPath(node.path);
    if (path) index.byPath.set(path, node);
    const sourcePath = canonicalPath(node.record?.source?.path || node.record?.sourcePath || '');
    if (sourcePath) index.bySourcePath.set(sourcePath, node);
  }
  return index;
}

function resolveTarget(target, index) {
  const raw = String(target || '').trim();
  if (!raw) return null;
  const token = canonicalToken(raw);
  const path = canonicalPath(raw);
  const candidates = [
    ['record-trace', index.byRecordTrace.get(token)],
    ['id', index.byId.get(token)],
    ['path', index.byPath.get(path)],
    ['source-path', index.bySourcePath.get(path)],
    ['path-suffix', findPathSuffixMatch(path, index.byPath)],
    ['source-path-suffix', findPathSuffixMatch(path, index.bySourcePath)]
  ];
  for (const [method, node] of candidates) {
    if (node) return Object.assign({ method }, node);
  }
  return null;
}

function findPathSuffixMatch(targetPath, pathIndex = new Map()) {
  const path = canonicalPath(targetPath);
  if (!path || !path.includes('/')) return null;
  let best = null;
  for (const [candidatePath, node] of pathIndex.entries()) {
    if (!candidatePath || path === candidatePath) continue;
    if (path.endsWith(`/${candidatePath}`) || path.endsWith(candidatePath)) {
      if (!best || candidatePath.length > best.path.length) best = { path: candidatePath, node };
    }
  }
  return best?.node || null;
}

function canonicalToken(value = '') {
  return String(value || '').trim().replace(/^record:/i, 'record:').replace(/\s+/g, '');
}

function canonicalPath(value = '') {
  let raw = String(value || '').trim();
  if (!raw) return '';
  raw = raw.replace(/^record:/i, '');
  try {
    const url = new URL(raw);
    raw = url.pathname.replace(/^\/+/, '');
  } catch (e) {
    // raw is not a URL
  }
  const out = [];
  for (const part of raw.replace(/\\/g, '/').split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') out.pop();
    else out.push(part);
  }
  return out.join('/');
}
