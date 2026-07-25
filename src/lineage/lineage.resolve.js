import { createLineageEdge, createLineageFinding, createLineageNode, LINEAGE_VIEW_MODEL_SCHEMA_ID, LineageEdgeKind, LineageResolutionStatus } from './lineage.model.js';
import { issueLocalPathKeysForNode, issueLocalPathMatches } from './lineage.githubIssueLocal.js';
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
    const parentMatch = traceTarget ? resolveTarget(traceTarget.value, index, node) : null;
    const originMatch = originTarget ? resolveTarget(originTarget.value, index, node) : null;
    if (parentMatch?.selfReference) {
      findings.push(createLineageFinding('lineage.parent.selfReference', 'Declared Parent Trace resolves to the declaring artifact itself; no parent edge was created.', 'warning', { nodeId: node.id, target: traceTarget.value }));
      if (originMatch?.ambiguous) {
        findings.push(createLineageFinding('lineage.target.ambiguous', 'Declared Origin matches multiple loaded targets; no recovery edge was created.', 'warning', { nodeId: node.id, target: originTarget.value, candidates: originMatch.candidates.map((candidate) => candidate.id).join(', ') }));
      } else if (originMatch?.blocked) {
        findings.push(createLineageFinding(originMatch.code || 'lineage.target.outOfBoundary', originMatch.message || 'Declared Origin resolves outside this source boundary; no edge was created.', 'warning', { nodeId: node.id, target: originTarget.value }));
      } else if (originTarget && originMatch && originMatch.id !== node.id) {
        edges.push(createLineageEdge(originMatch.id, node.id, LineageEdgeKind.origin, {
          target: originTarget.value,
          method: originMatch.method,
          label: 'origin recovery hint',
          status: LineageResolutionStatus.degraded
        }));
        findings.push(createLineageFinding('lineage.parent.selfReferenceOriginFallback', 'Parent Trace resolved to self; Origin resolved as recovery context only.', 'info', { nodeId: node.id, target: originTarget.value }));
      } else if (originTarget && !originMatch) {
        findings.push(createLineageFinding('lineage.origin.unresolved', 'Origin is declared but not present in the loaded material.', 'info', { nodeId: node.id, target: originTarget.value }));
      }
      continue;
    }
    if (parentMatch?.blocked) {
      findings.push(createLineageFinding(parentMatch.code || 'lineage.target.outOfBoundary', parentMatch.message || 'Declared lineage target resolves outside this source boundary; no edge was created.', 'warning', { nodeId: node.id, target: traceTarget.value }));
      if (originMatch?.ambiguous) {
        findings.push(createLineageFinding('lineage.target.ambiguous', 'Declared Origin matches multiple loaded targets; no recovery edge was created.', 'warning', { nodeId: node.id, target: originTarget.value, candidates: originMatch.candidates.map((candidate) => candidate.id).join(', ') }));
      } else if (originTarget && originMatch && !originMatch.blocked) {
        edges.push(createLineageEdge(originMatch.id, node.id, LineageEdgeKind.origin, {
          target: originTarget.value,
          method: originMatch.method,
          label: 'origin fallback edge',
          status: LineageResolutionStatus.degraded
        }));
        findings.push(createLineageFinding('lineage.parent.boundaryBlocked', 'Parent Trace was outside this source boundary; Origin resolved as recovery context only.', 'info', { nodeId: node.id, target: originTarget.value }));
      } else if (originMatch?.blocked) {
        findings.push(createLineageFinding(originMatch.code || 'lineage.target.outOfBoundary', originMatch.message || 'Declared Origin resolves outside this source boundary; no edge was created.', 'warning', { nodeId: node.id, target: originTarget.value }));
      } else if (originTarget) {
        findings.push(createLineageFinding('lineage.origin.unresolved', 'Origin is declared but not present in the loaded material.', 'info', { nodeId: node.id, target: originTarget.value }));
      }
      continue;
    }
    if (parentMatch?.ambiguous) {
      findings.push(createLineageFinding('lineage.target.ambiguous', 'Declared Parent Trace matches multiple loaded targets; no edge was created.', 'warning', { nodeId: node.id, target: traceTarget.value, candidates: parentMatch.candidates.map((candidate) => candidate.id).join(', ') }));
      if (originMatch?.ambiguous) {
        findings.push(createLineageFinding('lineage.target.ambiguous', 'Declared Origin matches multiple loaded targets; no recovery edge was created.', 'warning', { nodeId: node.id, target: originTarget.value, candidates: originMatch.candidates.map((candidate) => candidate.id).join(', ') }));
      } else if (originMatch?.blocked) {
        findings.push(createLineageFinding(originMatch.code || 'lineage.target.outOfBoundary', originMatch.message || 'Declared Origin resolves outside this source boundary; no edge was created.', 'warning', { nodeId: node.id, target: originTarget.value }));
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
      } else if (originMatch?.blocked) {
        findings.push(createLineageFinding(originMatch.code || 'lineage.target.outOfBoundary', originMatch.message || 'Declared Origin resolves outside this source boundary; no edge was created.', 'warning', { nodeId: node.id, target: originTarget.value }));
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
    if (originMatch?.blocked) {
      findings.push(createLineageFinding(originMatch.code || 'lineage.target.outOfBoundary', originMatch.message || 'Declared Origin resolves outside this source boundary; no edge was created.', 'warning', { nodeId: node.id, target: originTarget.value }));
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
  const index = { byId: new Map(), byRecordTrace: new Map(), byPath: new Map(), bySourcePath: new Map(), byProvenance: new Map(), byIssueLocalPath: new Map() };
  for (const node of nodes) {
    const id = canonicalToken(node.id);
    if (id) {
      addIndexed(index.byId, id, node);
      addIndexed(index.byRecordTrace, `record:${id}`, node);
    }
    const path = canonicalPath(node.path);
    if (path) addIndexed(index.byPath, path, node);
    for (const sourcePath of sourcePathsForNode(node)) addIndexed(index.bySourcePath, sourcePath, node);
    for (const target of provenanceTargetsForNode(node)) addIndexed(index.byProvenance, target, node);
    for (const issueLocalPath of issueLocalPathKeysForNode(node)) addIndexed(index.byIssueLocalPath, issueLocalPath, node);
  }
  return index;
}
function sourcePathsForNode(node = {}) {
  const record = node.record || {};
  const values = [record.source?.path, record.sourcePath, record.sourceTarget?.sourceArtifactPath, record.snapshot?.sourceArtifactPath].map(canonicalPath).filter(Boolean);
  return Array.from(new Set(values));
}
function provenanceTargetsForNode(node = {}) {
  const record = node.record || {};
  const snapshot = record.snapshot || {};
  const sourceTarget = record.sourceTarget || {};
  const target = snapshot.target || {};
  const values = [
    record.recoveredFromUrl,
    record.sourceOrigin,
    record.rawUrl,
    record.browseUrl,
    sourceTarget.inputTarget,
    sourceTarget.rawUrl,
    sourceTarget.browseUrl,
    snapshot.sourceUrl,
    target.canonicalUrl,
    target.html_url,
    target.url
  ];
  return Array.from(new Set(values.flatMap(provenanceTargetKeysForValue).filter(Boolean)));
}
function firstNonEmpty(...items) { return items.map((item) => String(item || '').trim()).find(Boolean) || ''; }
function addIndexed(map, key, node) {
  if (!key || !node) return;
  const existing = map.get(key);
  if (!existing) map.set(key, [node]);
  else existing.push(node);
}
function resolveTarget(target, index, declaringNode = null) {
  const raw = String(target || '').trim();
  if (!raw) return null;
  for (const targetKey of provenanceTargetKeysForValue(raw)) {
    const resolved = resolveCandidateNodes(index.byProvenance.get(targetKey) || [], 'provenance-target', declaringNode);
    if (resolved) return resolved;
  }
  const token = canonicalToken(raw);
  const directTokenCandidates = [
    ['record-trace', index.byRecordTrace.get(token)],
    ['id', index.byId.get(token)]
  ];
  for (const [method, nodes] of directTokenCandidates) {
    const resolved = resolveCandidateNodes(nodes || [], method, declaringNode);
    if (resolved) return resolved;
  }
  const path = canonicalPath(raw);
  const urlSourceKey = sourceKeyFromTarget(raw);
  const declaringConstraint = sourceConstraintFromNode(declaringNode);
  const relative = relativeCandidatePath(raw, declaringNode);
  const simpleRelative = isSimpleRelativeReference(raw);
  const dotRelative = isDotRelativeReference(raw);
  if ((simpleRelative || dotRelative) && relative) {
    if (relative.blocked) return relative;
    const contextual = exactPathMatches(relative.path, index, declaringConstraint, true);
    const resolved = resolveCandidateNodes(contextual, relative.method, declaringNode);
    if (resolved) return resolved;
    const issueLocal = issueLocalPathMatches(raw, index, declaringNode);
    const resolvedIssueLocal = resolveCandidateNodes(issueLocal, 'issue-local-relative-path', declaringNode);
    if (resolvedIssueLocal) return resolvedIssueLocal;
    return null;
  }
  const pathConstraint = urlSourceKey ? sourceConstraintFromTarget(urlSourceKey) : declaringConstraint;
  const exact = exactPathMatches(path, index, pathConstraint, Boolean(pathConstraint.hasConstraint));
  const resolvedExact = resolveCandidateNodes(exact, 'path', declaringNode);
  if (resolvedExact) return resolvedExact;
  if (dotRelative && relative) {
    if (relative.blocked) return relative;
    const contextual = exactPathMatches(relative.path, index, declaringConstraint, true);
    const resolved = resolveCandidateNodes(contextual, relative.method, declaringNode);
    if (resolved) return resolved;
    return null;
  }
  const suffixConstraint = urlSourceKey ? sourceConstraintFromTarget(urlSourceKey) : declaringConstraint;
  const suffixCandidates = [
    ['path-suffix', findPathSuffixMatches(path, index.byPath, suffixConstraint, Boolean(urlSourceKey))],
    ['source-path-suffix', findPathSuffixMatches(path, index.bySourcePath, suffixConstraint, Boolean(urlSourceKey))]
  ];
  for (const [method, nodes] of suffixCandidates) {
    const resolved = resolveCandidateNodes(nodes || [], method, declaringNode);
    if (resolved) return resolved;
  }
  return null;
}
function resolveCandidateNodes(nodes = [], method = 'unknown', declaringNode = null) {
  const unique = uniqueNodes(nodes || []);
  if (!unique.length) return null;
  const withoutSelf = unique.filter((candidate) => !sameLineageNode(candidate, declaringNode));
  if (!withoutSelf.length) return { selfReference: true, method, candidates: unique };
  if (withoutSelf.length === 1) return Object.assign({ method }, withoutSelf[0]);
  return { ambiguous: true, method, candidates: withoutSelf };
}
function sameLineageNode(candidate = {}, declaringNode = null) {
  if (!candidate || !declaringNode) return false;
  const candidateId = String(candidate.id || '').trim();
  const declaringId = String(declaringNode.id || '').trim();
  if (candidateId && declaringId) return candidateId === declaringId;
  const candidatePath = canonicalPath(candidate.path || candidate.record?.path || '');
  const declaringPath = canonicalPath(declaringNode.path || declaringNode.record?.path || '');
  return Boolean(candidatePath && declaringPath && candidatePath === declaringPath);
}
function exactPathMatches(path, index, constraint = {}, strictSource = false) {
  const source = [];
  source.push(...(index.byPath.get(canonicalPath(path)) || []));
  source.push(...(index.bySourcePath.get(canonicalPath(path)) || []));
  const filtered = filterBySource(source, constraint, strictSource);
  return uniqueNodes(filtered);
}
function relativeCandidatePath(rawTarget, declaringNode = null) {
  const raw = String(rawTarget || '').trim();
  const declaringPath = canonicalPath(firstNonEmpty(declaringNode?.record?.sourceTarget?.sourceArtifactPath, declaringNode?.record?.snapshot?.sourceArtifactPath, declaringNode?.path, declaringNode?.record?.path));
  const dir = dirname(declaringPath);
  const targetPath = canonicalPath(raw);
  if (!targetPath) return null;
  const candidate = normalizeJoinedPath(dir, raw);
  return { path: candidate, method: dir ? 'relative-path' : 'relative-root-path' };
}
function isSimpleRelativeReference(value = '') {
  const raw = String(value || '').trim();
  if (!raw || isUrlLike(raw) || /^record:/i.test(raw)) return false;
  const path = canonicalPath(raw);
  return Boolean(path && !path.includes('/'));
}
function isDotRelativeReference(value = '') {
  const raw = String(value || '').trim();
  return /^\.\.?(?:\/|$)/.test(raw.replace(/\\/g, '/'));
}
function isUrlLike(value = '') {
  return /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(String(value || '').trim());
}
function dirname(path = '') {
  const clean = canonicalPath(path);
  const parts = clean.split('/').filter(Boolean);
  parts.pop();
  return parts.join('/');
}
function normalizeJoinedPath(base = '', target = '') {
  const text = String(target || '').replace(/\\/g, '/');
  const raw = text.startsWith('/') ? text : [base, text].filter(Boolean).join('/');
  return canonicalPath(raw);
}
function findPathSuffixMatches(targetPath, pathIndex = new Map(), constraint = {}, strictSource = false) {
  const path = canonicalPath(targetPath);
  if (!path || !path.includes('/')) return [];
  let bestLength = -1;
  let matches = [];
  for (const [candidatePath, nodes] of pathIndex.entries()) {
    if (!candidatePath || path === candidatePath) continue;
    if (path.endsWith(`/${candidatePath}`) || path.endsWith(candidatePath)) {
      const filtered = filterBySource(nodes, constraint, strictSource);
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
function filterBySource(nodes = [], constraint = {}, strictSource = false) {
  const items = Array.isArray(nodes) ? nodes : [];
  if (!constraint?.hasConstraint) return items;
  const filtered = items.filter((node) => nodeMatchesSourceConstraint(node, constraint));
  if (filtered.length) return filtered;
  if (strictSource && items.length && items.every((node) => !sourceConstraintFromNode(node).hasConstraint)) return items;
  return [];
}
function nodeMatchesSourceConstraint(node = {}, constraint = {}) {
  const candidate = sourceConstraintFromNode(node);
  if (constraint.sourceId && candidate.sourceId && constraint.sourceId !== candidate.sourceId) return false;
  if (constraint.adapterId && candidate.adapterId && constraint.adapterId !== candidate.adapterId) return false;
  if (constraint.repo && candidate.repo !== constraint.repo) return false;
  if (constraint.ref && candidate.ref && constraint.ref !== candidate.ref) return false;
  if (constraint.repo && !candidate.repo) return false;
  if (constraint.adapterId && !candidate.adapterId) return false;
  return true;
}
function sourceConstraintFromNode(node = {}) {
  const source = node?.record?.source || {};
  const adapterId = String(source.adapterId || '').trim().toLowerCase();
  const sourceId = String(source.id || '').trim();
  if (adapterId === 'local' || sourceId === 'local' || source.kind === 'local-session') {
    return { hasConstraint: false, sourceId: '', repo: '', ref: '', adapterId: '' };
  }
  const repo = normalizeRepoKey(source.repo || source.repository || source.config?.repo || '');
  const ref = normalizeRef(source.ref || source.config?.ref || '');
  return {
    hasConstraint: Boolean(sourceId || repo || adapterId),
    sourceId,
    repo,
    ref,
    adapterId
  };
}
function sourceConstraintFromTarget(repo = '') {
  const key = normalizeRepoKey(repo);
  return { hasConstraint: Boolean(key), repo: key, sourceId: '', ref: '', adapterId: 'github' };
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
function provenanceTargetKeysForValue(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return [];
  const keys = [];
  const add = (item = '') => {
    const clean = String(item || '').trim().toLowerCase();
    if (clean && !keys.includes(clean)) keys.push(clean);
  };
  add(`raw:${raw}`);
  const commentId = raw.match(/(?:issuecomment-|issues\/comments\/)(\d+)/i)?.[1] || '';
  if (commentId) add(`github-comment:${commentId}`);
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    const parts = url.pathname.split('/').filter(Boolean);
    const hash = url.hash || '';
    if ((host === 'github.com' || host.endsWith('.github.com')) && parts.length >= 4 && parts[2] === 'issues') {
      const repo = normalizeRepoKey(`${parts[0]}/${parts[1]}`);
      const number = String(parts[3] || '').trim();
      if (repo && number) {
        add(`github-issue:${repo}#${number}`);
        if (hash) add(`github-issue:${repo}#${number}${hash.toLowerCase()}`);
      }
    }
    if (host === 'api.github.com' && parts.length >= 5 && parts[0] === 'repos' && parts[3] === 'issues') {
      const repo = normalizeRepoKey(`${parts[1]}/${parts[2]}`);
      const number = String(parts[4] || '').trim();
      if (repo && number) add(`github-issue:${repo}#${number}`);
    }
  } catch (error) {
  }
  return keys;
}
function sourceKeyFromTarget(value = '') {
  try {
    const url = new URL(String(value || ''));
    const parts = url.pathname.split('/').filter(Boolean);
    if (url.hostname === 'raw.githubusercontent.com' && parts.length >= 2) return normalizeRepoKey(`${parts[0]}/${parts[1]}`);
    if (url.hostname.endsWith('github.com') && parts.length >= 2) return normalizeRepoKey(`${parts[0]}/${parts[1]}`);
  } catch (error) {
  }
  return '';
}
function normalizeRepoKey(value = '') {
  const parts = String(value || '').trim().toLowerCase().split('/').filter(Boolean);
  return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : '';
}
function normalizeRef(value = '') {
  return String(value || '').trim().toLowerCase();
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
