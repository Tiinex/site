import { createLineageEdge, createLineageFinding, createLineageNode, LINEAGE_VIEW_MODEL_SCHEMA_ID, LineageEdgeKind, LineageResolutionStatus } from './lineage.model.js';
import { issueLocalPathKeysForNode, issueLocalPathMatches } from './lineage.githubIssueLocal.js';
import { lineageBasePathForNode } from './lineage.pathBasis.js';
import { preferredLineageMaterialCandidates } from './lineage.materialPreference.js';
import { canonicalIntegrityValue, parentIntegrityValuesForTarget, selfIntegrityValuesForNode, verifiedIntegrityMatch, withParentIntegrityStatus } from './lineage.integrity.js';
import { canonicalPath, canonicalToken, githubRepoRelativePathFromUrl, provenanceTargetKeysForValue, sourceKeyFromTarget } from './lineage.targetKeys.js';
import { declaredParentBindingTargetValuesForNode, isSyntheticPublicationLineageNode } from './lineage.parentBinding.js';
import { exactPathMatches, findPathSuffixMatches, sourceConstraintFromNode, sourceConstraintFromTarget } from './lineage.sourceScope.js';
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
    const parentMatch = traceTarget ? resolveTarget(traceTarget.value, index, node, { expectedIntegrityValues: traceTarget.integrityValues, targetKind: LineageEdgeKind.parent }) : null;
    const originMatch = originTarget ? resolveTarget(originTarget.value, index, node, { targetKind: LineageEdgeKind.origin }) : null;
    if (parentMatch?.selfReference) {
      findings.push(createLineageFinding('lineage.parent.selfReference', 'Declared Parent Trace resolves to the declaring artifact itself; no parent edge was created.', 'warning', { nodeId: node.id, target: traceTarget.value }));
      if (originMatch?.ambiguous) {
        findings.push(createLineageFinding('lineage.target.ambiguous', 'Origin ambiguous; no edge created.', 'warning', { nodeId: node.id, target: originTarget.value, candidates: originMatch.candidates.map((candidate) => candidate.id).join(', ') }));
      } else if (originMatch?.blocked) {
        findings.push(createLineageFinding(originMatch.code || 'lineage.target.outOfBoundary', originMatch.message || 'Declared Origin is outside boundary; no edge was created.', 'warning', { nodeId: node.id, target: originTarget.value }));
      } else if (originTarget && originMatch && originMatch.id !== node.id) {
        edges.push(createLineageEdge(originMatch.id, node.id, LineageEdgeKind.origin, {
          target: originTarget.value,
          method: originMatch.method,
          label: 'origin recovery hint',
          status: LineageResolutionStatus.degraded
        }));
        findings.push(createLineageFinding('lineage.parent.selfReferenceOriginFallback', 'Parent Trace resolved to self; Origin resolved as recovery context only.', 'info', { nodeId: node.id, target: originTarget.value }));
      } else if (originTarget && !originMatch) {
        findings.push(createLineageFinding('lineage.origin.unresolved', 'Origin not present in loaded material.', 'info', { nodeId: node.id, target: originTarget.value }));
      }
      continue;
    }
    if (parentMatch?.blocked) {
      findings.push(createLineageFinding(parentMatch.code || 'lineage.target.outOfBoundary', parentMatch.message || 'Lineage target outside boundary; no edge created.', 'warning', { nodeId: node.id, target: traceTarget.value }));
      if (originMatch?.ambiguous) {
        findings.push(createLineageFinding('lineage.target.ambiguous', 'Origin ambiguous; no edge created.', 'warning', { nodeId: node.id, target: originTarget.value, candidates: originMatch.candidates.map((candidate) => candidate.id).join(', ') }));
      } else if (originTarget && originMatch && !originMatch.blocked) {
        edges.push(createLineageEdge(originMatch.id, node.id, LineageEdgeKind.origin, {
          target: originTarget.value,
          method: originMatch.method,
          label: 'origin fallback edge',
          status: LineageResolutionStatus.degraded
        }));
        findings.push(createLineageFinding('lineage.parent.boundaryBlocked', 'Parent Trace was outside boundary; Origin is recovery context.', 'info', { nodeId: node.id, target: originTarget.value }));
      } else if (originMatch?.blocked) {
        findings.push(createLineageFinding(originMatch.code || 'lineage.target.outOfBoundary', originMatch.message || 'Declared Origin is outside boundary; no edge was created.', 'warning', { nodeId: node.id, target: originTarget.value }));
      } else if (originTarget) {
        findings.push(createLineageFinding('lineage.origin.unresolved', 'Origin not present in loaded material.', 'info', { nodeId: node.id, target: originTarget.value }));
      }
      continue;
    }
    if (parentMatch?.ambiguous) {
      findings.push(createLineageFinding('lineage.target.ambiguous', 'Parent Trace ambiguous; no edge created.', 'warning', { nodeId: node.id, target: traceTarget.value, candidates: parentMatch.candidates.map((candidate) => candidate.id).join(', ') }));
      if (originMatch?.ambiguous) {
        findings.push(createLineageFinding('lineage.target.ambiguous', 'Origin ambiguous; no edge created.', 'warning', { nodeId: node.id, target: originTarget.value, candidates: originMatch.candidates.map((candidate) => candidate.id).join(', ') }));
      } else if (originMatch?.blocked) {
        findings.push(createLineageFinding(originMatch.code || 'lineage.target.outOfBoundary', originMatch.message || 'Declared Origin is outside boundary; no edge was created.', 'warning', { nodeId: node.id, target: originTarget.value }));
      } else if (originTarget && !originMatch) {
        findings.push(createLineageFinding('lineage.origin.unresolved', 'Origin not present in loaded material.', 'info', { nodeId: node.id, target: originTarget.value }));
      }
      continue;
    }
    if (parentMatch) {
      edges.push(createLineageEdge(parentMatch.id, node.id, LineageEdgeKind.parent, {
        target: traceTarget.value,
        method: parentMatch.method,
        label: 'declared parent trace',
        status: parentMatch.status || LineageResolutionStatus.resolved,
        diagnostics: parentMatch.diagnostics || []
      }));
      if (parentMatch.status === LineageResolutionStatus.mismatch) {
        findings.push(createLineageFinding('lineage.parent.integrityMismatch', 'Declared parent was found by stable identity, but its loaded integrity value does not match the child declaration.', 'error', { nodeId: node.id, target: traceTarget.value }));
      } else if (parentMatch.status === LineageResolutionStatus.probable) {
        findings.push(createLineageFinding('lineage.parent.probable', 'Declared parent was found by stable identity, but no loaded self-integrity value was available to verify the edge.', 'info', { nodeId: node.id, target: traceTarget.value }));
      }
      if (originMatch?.ambiguous) {
        findings.push(createLineageFinding('lineage.target.ambiguous', 'Origin ambiguous; no edge created.', 'warning', { nodeId: node.id, target: originTarget.value, candidates: originMatch.candidates.map((candidate) => candidate.id).join(', ') }));
      } else if (originMatch?.blocked) {
        findings.push(createLineageFinding(originMatch.code || 'lineage.target.outOfBoundary', originMatch.message || 'Declared Origin is outside boundary; no edge was created.', 'warning', { nodeId: node.id, target: originTarget.value }));
      } else if (originTarget && originMatch && originMatch.id !== parentMatch.id) {
        edges.push(createLineageEdge(originMatch.id, node.id, LineageEdgeKind.origin, {
          target: originTarget.value,
          method: originMatch.method,
          label: 'origin recovery hint'
        }));
      } else if (originTarget && !originMatch) {
        findings.push(createLineageFinding('lineage.origin.unresolved', 'Origin not present in loaded material.', 'info', { nodeId: node.id, target: originTarget.value }));
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
      findings.push(createLineageFinding('lineage.parent.missing', 'Parent Trace target not loaded.', 'warning', { nodeId: node.id, target: traceTarget.value }));
    }
    if (originMatch?.ambiguous) {
      findings.push(createLineageFinding('lineage.target.ambiguous', 'Origin ambiguous; no edge created.', 'warning', { nodeId: node.id, target: originTarget.value, candidates: originMatch.candidates.map((candidate) => candidate.id).join(', ') }));
      continue;
    }
    if (originMatch?.blocked) {
      findings.push(createLineageFinding(originMatch.code || 'lineage.target.outOfBoundary', originMatch.message || 'Declared Origin is outside boundary; no edge was created.', 'warning', { nodeId: node.id, target: originTarget.value }));
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
        findings.push(createLineageFinding('lineage.parent.originFallback', 'Parent Trace is missing; Origin is recovery context.', 'info', { nodeId: node.id, target: originTarget.value }));
      }
      continue;
    }
    if (originTarget) {
      findings.push(createLineageFinding('lineage.origin.unresolved', 'Origin not present in loaded material.', traceTarget ? 'info' : 'warning', { nodeId: node.id, target: originTarget.value }));
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
  if (node.trace) targets.push({ kind: LineageEdgeKind.parent, value: node.trace, integrityValues: parentIntegrityValuesForTarget(node, node.trace) });
  if (node.origin) targets.push({ kind: LineageEdgeKind.origin, value: node.origin });
  return targets;
}
function buildLineageIndex(nodes = []) {
  const index = { byId: new Map(), byRecordTrace: new Map(), byPath: new Map(), bySourcePath: new Map(), byProvenance: new Map(), byIssueLocalPath: new Map(), bySelfIntegrity: new Map() };
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
    for (const hash of selfIntegrityValuesForNode(node)) addIndexed(index.bySelfIntegrity, hash, node);
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
function addIndexed(map, key, node) {
  if (!key || !node) return;
  const existing = map.get(key);
  if (!existing) map.set(key, [node]);
  else existing.push(node);
}
function resolveTarget(target, index, declaringNode = null, options = {}) {
  const raw = String(target || '').trim();
  if (!raw) return null;

  const expectedIntegrityValues = Array.isArray(options.expectedIntegrityValues) ? options.expectedIntegrityValues.map(canonicalIntegrityValue).filter(Boolean) : [];
  if (expectedIntegrityValues.length) {
    const integrityMatch = resolveIntegrityTarget(expectedIntegrityValues, index, declaringNode);
    if (integrityMatch) return integrityMatch;
  }

  const token = canonicalToken(raw);
  const path = canonicalPath(raw);
  const urlFilePath = githubRepoRelativePathFromUrl(raw);
  const urlSourceKey = sourceKeyFromTarget(raw);
  const declaringConstraint = sourceConstraintFromNode(declaringNode);
  const relative = relativeCandidatePath(raw, declaringNode);
  const simpleRelative = isSimpleRelativeReference(raw);
  const dotRelative = isDotRelativeReference(raw);
  const urlLike = isUrlLike(raw);
  const recordToken = /^record:/i.test(raw);
  const finalize = (match) => withParentIntegrityStatus(match, expectedIntegrityValues);

  const resolveDirectToken = () => {
    const directTokenCandidates = [
      ['record-trace', index.byRecordTrace.get(token)],
      ['id', index.byId.get(token)]
    ];
    for (const [method, nodes] of directTokenCandidates) {
      const resolved = resolveCandidateNodes(nodes || [], method, declaringNode);
      if (resolved) return finalize(resolved);
    }
    return null;
  };

  const resolveProvenanceTarget = () => {
    for (const targetKey of provenanceTargetKeysForValue(raw)) {
      const resolved = resolveCandidateNodes(index.byProvenance.get(targetKey) || [], 'provenance-target', declaringNode);
      if (resolved) return finalize(resolved);
    }
    return null;
  };

  const resolveDeclaredParentBinding = () => {
    if (options.targetKind !== LineageEdgeKind.parent) return null;
    for (const binding of declaredParentBindingTargetValuesForNode(declaringNode, raw)) {
      if (binding.isGitHubIssueTarget) {
        for (const targetKey of provenanceTargetKeysForValue(binding.raw)) {
          const resolved = resolveCandidateNodes(index.byProvenance.get(targetKey) || [], 'declared-parent-provenance', declaringNode);
          if (resolved) return finalize(resolved);
        }
        continue;
      }
      const sourceKey = sourceKeyFromTarget(binding.raw);
      const constraint = sourceKey ? sourceConstraintFromTarget(sourceKey) : declaringConstraint;
      const exact = exactPathMatches(binding.filePath, index, constraint, Boolean(constraint.hasConstraint));
      const resolvedExact = resolveCandidateNodes(exact, 'declared-parent-path', declaringNode);
      if (resolvedExact) return finalize(resolvedExact);
      if (canonicalPath(binding.filePath).includes('/')) {
        const suffix = [
          ...findPathSuffixMatches(binding.filePath, index.byPath, constraint, Boolean(constraint.hasConstraint)),
          ...findPathSuffixMatches(binding.filePath, index.bySourcePath, constraint, Boolean(constraint.hasConstraint))
        ];
        const resolvedSuffix = resolveCandidateNodes(suffix, 'declared-parent-path-suffix', declaringNode);
        if (resolvedSuffix) return finalize(resolvedSuffix);
      }
    }
    return null;
  };

  if (recordToken) return finalize(resolveDirectToken());

  if ((simpleRelative || dotRelative) && relative) {
    if (relative.blocked) return relative;
    const contextual = exactPathMatches(relative.path, index, declaringConstraint, true);
    const resolved = resolveCandidateNodes(contextual, relative.method, declaringNode);
    if (resolved) return finalize(resolved);
    const issueLocal = issueLocalPathMatches(raw, index, declaringNode);
    const resolvedIssueLocal = resolveCandidateNodes(issueLocal, 'issue-local-relative-path', declaringNode);
    if (resolvedIssueLocal) return finalize(resolvedIssueLocal);
    const declaredParent = resolveDeclaredParentBinding();
    if (declaredParent) return declaredParent;
    if (dotRelative && isSyntheticPublicationLineageNode(declaringNode) && path.includes('/')) {
      const suffix = [
        ...findPathSuffixMatches(path, index.byPath, declaringConstraint, Boolean(declaringConstraint.hasConstraint)),
        ...findPathSuffixMatches(path, index.bySourcePath, declaringConstraint, Boolean(declaringConstraint.hasConstraint))
      ];
      const resolvedSuffix = resolveCandidateNodes(suffix, 'synthetic-parent-path-suffix', declaringNode);
      if (resolvedSuffix) return finalize(resolvedSuffix);
    }
    return null;
  }

  if (urlLike && !urlFilePath) {
    const provenance = resolveProvenanceTarget();
    if (provenance) return finalize(provenance);
  }

  const declaredParent = resolveDeclaredParentBinding();
  if (declaredParent) return declaredParent;

  const direct = resolveDirectToken();
  if (direct) return finalize(direct);

  const pathConstraint = urlSourceKey ? sourceConstraintFromTarget(urlSourceKey) : declaringConstraint;
  const exact = exactPathMatches(path, index, pathConstraint, Boolean(pathConstraint.hasConstraint));
  const resolvedExact = resolveCandidateNodes(exact, 'path', declaringNode);
  if (resolvedExact) return finalize(resolvedExact);

  const suffixConstraint = urlSourceKey ? sourceConstraintFromTarget(urlSourceKey) : declaringConstraint;
  const suffixCandidates = [
    ['path-suffix', findPathSuffixMatches(path, index.byPath, suffixConstraint, Boolean(urlSourceKey))],
    ['source-path-suffix', findPathSuffixMatches(path, index.bySourcePath, suffixConstraint, Boolean(urlSourceKey))]
  ];
  for (const [method, nodes] of suffixCandidates) {
    const resolved = resolveCandidateNodes(nodes || [], method, declaringNode);
    if (resolved) return finalize(resolved);
  }

  if (urlLike) return finalize(resolveProvenanceTarget());
  return null;
}

function resolveIntegrityTarget(expectedIntegrityValues = [], index = {}, declaringNode = null) {
  const nodes = [];
  for (const value of expectedIntegrityValues.map(canonicalIntegrityValue).filter(Boolean)) {
    nodes.push(...(index.bySelfIntegrity?.get(value) || []));
  }
  const resolved = resolveCandidateNodes(nodes, 'integrity-self-hash', declaringNode);
  if (!resolved || resolved.ambiguous || resolved.selfReference || resolved.blocked) return resolved;
  return verifiedIntegrityMatch(resolved);
}

function resolveCandidateNodes(nodes = [], method = 'unknown', declaringNode = null) {
  const unique = uniqueNodes(nodes || []);
  if (!unique.length) return null;
  const withoutSelf = unique.filter((candidate) => !sameLineageNode(candidate, declaringNode));
  if (!withoutSelf.length) return { selfReference: true, method, candidates: unique };
  const preferred = preferredLineageMaterialCandidates(withoutSelf, method);
  if (preferred.length === 1) return Object.assign({ method }, preferred[0]);
  if (withoutSelf.length === 1) return Object.assign({ method }, withoutSelf[0]);
  return { ambiguous: true, method, candidates: preferred.length ? preferred : withoutSelf };
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

function relativeCandidatePath(rawTarget, declaringNode = null) {
  const raw = String(rawTarget || '').trim();
  const declaringPath = canonicalPath(lineageBasePathForNode(declaringNode));
  const targetPath = canonicalPath(raw);
  if (!targetPath) return null;
  const dir = dirname(declaringPath);
  return { path: normalizeJoinedPath(dir, raw), method: dir ? 'relative-path' : 'relative-root-path' };
}
function isSimpleRelativeReference(value = '') {
  const raw = String(value || '').trim();
  const path = canonicalPath(raw);
  return Boolean(raw && path && !path.includes('/') && !isUrlLike(raw) && !/^record:/i.test(raw));
}
function isDotRelativeReference(value = '') { return /^\.\.?(?:\/|$)/.test(String(value || '').replace(/\\/g, '/').trim()); }
function isUrlLike(value = '') { return /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(String(value || '').trim()); }
function dirname(path = '') { const parts = canonicalPath(path).split('/').filter(Boolean); parts.pop(); return parts.join('/'); }
function normalizeJoinedPath(base = '', target = '') { const text = String(target || '').replace(/\\/g, '/'); return canonicalPath(text.startsWith('/') ? text : [base, text].filter(Boolean).join('/')); }

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
