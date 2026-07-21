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

    if (parentMatch?.ambiguous) {
      findings.push(createLineageFinding('lineage.target.ambiguous', 'Declared Parent Trace matches multiple loaded targets; no edge was created.', 'warning', { nodeId: node.id, target: traceTarget.value, candidates: parentMatch.candidates.map((candidate) => candidate.id).join(', ') }));
      if (originMatch?.ambiguous) {
        findings.push(createLineageFinding('lineage.target.ambiguous', 'Declared Origin matches multiple loaded targets; no recovery edge was created.', 'warning', { nodeId: node.id, target: originTarget.value, candidates: originMatch.candidates.map((candidate) => candidate.id).join(', ') }));
      } else if (originTarget && !originMatch) {
        findings.push(createLineageFinding('lineage.origin.unresolved', 'Origin is declared but not present in the loaded material.', 'info', { nodeId: node.id, target: originTarget.value }));
      }
      continue;
    }

    if (parentMatch) {
      edges.push(createLineageEdge(parentMatch.id, node.id, LineageEdgeKind.parent, {
        target: traceTarget.value,
        method: parentMatch.method,
        label: 'declared parent trace'
      }));
      if (originMatch?.ambiguous) {
        findings.push(createLineageFinding('lineage.target.ambiguous', 'Declared Origin matches multiple loaded targets; no recovery edge was created.', 'warning', { nodeId: node.id, target: originTarget.value, candidates: originMatch.candidates.map((candidate) => candidate.id).join(', ') }));
      } else if (originTarget && originMatch && originMatch.id !== parentMatch.id) {
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

    if (originMatch?.ambiguous) {
      findings.push(createLineageFinding('lineage.target.ambiguous', 'Declared Origin matches multiple loaded targets; no recovery edge was created.', 'warning', { nodeId: node.id, target: originTarget.value, candidates: originMatch.candidates.map((candidate) => candidate.id).join(', ') }));
      continue;
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
      addIndexed(index.byId, id, node);
      addIndexed(index.byRecordTrace, `record:${id}`, node);
    }
    const path = canonicalPath(node.path);
    if (path) addIndexed(index.byPath, path, node);
    const sourcePath = canonicalPath(node.record?.source?.path || node.record?.sourcePath || '');
    if (sourcePath) addIndexed(index.bySourcePath, sourcePath, node);
  }
  return index;
}

function addIndexed(map, key, node) {
  if (!key || !node) return;
  const existing = map.get(key);
  if (!existing) map.set(key, [node]);
  else existing.push(node);
}

function resolveTarget(target, index) {
  const raw = String(target || '').trim();
  if (!raw) return null;
  const token = canonicalToken(raw);
  const path = canonicalPath(raw);
  const sourceKey = sourceKeyFromTarget(raw);
  const candidates = [
    ['record-trace', index.byRecordTrace.get(token)],
    ['id', index.byId.get(token)],
    ['path', filterBySource(index.byPath.get(path), sourceKey)],
    ['source-path', filterBySource(index.bySourcePath.get(path), sourceKey)],
    ['path-suffix', findPathSuffixMatches(path, index.byPath, sourceKey)],
    ['source-path-suffix', findPathSuffixMatches(path, index.bySourcePath, sourceKey)]
  ];
  for (const [method, nodes] of candidates) {
    const unique = uniqueNodes(nodes || []);
    if (unique.length === 1) return Object.assign({ method }, unique[0]);
    if (unique.length > 1) return { ambiguous: true, method, candidates: unique };
  }
  return null;
}

function findPathSuffixMatches(targetPath, pathIndex = new Map(), sourceKey = '') {
  const path = canonicalPath(targetPath);
  if (!path || !path.includes('/')) return [];
  let bestLength = -1;
  let matches = [];
  for (const [candidatePath, nodes] of pathIndex.entries()) {
    if (!candidatePath || path === candidatePath) continue;
    if (path.endsWith(`/${candidatePath}`) || path.endsWith(candidatePath)) {
      const filtered = filterBySource(nodes, sourceKey);
      if (!filtered.length) continue;
      if (candidatePath.length > bestLength) {
        bestLength = candidatePath.length;
        matches = filtered.slice();
      } else if (candidatePath.length === bestLength) {
        matches.push(...filtered);
      }
    }
  }
  return uniqueNodes(matches);
}

function filterBySource(nodes = [], sourceKey = '') {
  const items = Array.isArray(nodes) ? nodes : [];
  if (!sourceKey) return items;
  const filtered = items.filter((node) => sourceKeyFromNode(node) === sourceKey);
  return filtered.length ? filtered : items;
}

function uniqueNodes(nodes = []) {
  const seen = new Set();
  const out = [];
  for (const node of Array.isArray(nodes) ? nodes : []) {
    const key = node?.id || node?.path || JSON.stringify(node || {});
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(node);
  }
  return out;
}

function sourceKeyFromNode(node = {}) {
  const source = node.record?.source || {};
  return normalizeRepoKey(source.repo || source.repository || source.config?.repo || '');
}

function sourceKeyFromTarget(value = '') {
  try {
    const url = new URL(String(value || ''));
    const parts = url.pathname.split('/').filter(Boolean);
    if (url.hostname === 'raw.githubusercontent.com' && parts.length >= 2) return normalizeRepoKey(`${parts[0]}/${parts[1]}`);
    if (url.hostname.endsWith('github.com') && parts.length >= 2) return normalizeRepoKey(`${parts[0]}/${parts[1]}`);
  } catch (error) {
    // not a URL
  }
  return '';
}

function normalizeRepoKey(value = '') {
  const parts = String(value || '').trim().toLowerCase().split('/').filter(Boolean);
  return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : '';
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
