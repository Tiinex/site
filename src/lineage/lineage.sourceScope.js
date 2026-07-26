import { canonicalPath, normalizeRef, normalizeRepoKey } from './lineage.targetKeys.js';

export function exactPathMatches(path, index, constraint = {}, strictSource = false) {
  const source = [
    ...(index.byPath.get(canonicalPath(path)) || []),
    ...(index.bySourcePath.get(canonicalPath(path)) || [])
  ];
  return uniqueNodes(filterBySource(source, constraint, strictSource));
}

export function findPathSuffixMatches(targetPath, pathIndex = new Map(), constraint = {}, strictSource = false) {
  const path = canonicalPath(targetPath);
  if (!path || !path.includes('/')) return [];
  let bestLength = -1;
  let matches = [];
  for (const [candidatePath, nodes] of pathIndex.entries()) {
    if (!candidatePath || path === candidatePath) continue;
    if (!(path.endsWith(`/${candidatePath}`) || path.endsWith(candidatePath) || candidatePath.endsWith(`/${path}`) || candidatePath.endsWith(path))) continue;
    const filtered = filterBySource(nodes, constraint, strictSource);
    if (!filtered.length) continue;
    if (candidatePath.length > bestLength) {
      bestLength = candidatePath.length;
      matches = filtered.slice();
    } else if (candidatePath.length === bestLength) matches.push(...filtered);
  }
  return uniqueNodes(matches);
}

export function sourceConstraintFromNode(node = {}) {
  const source = node?.record?.source || {};
  const adapterId = String(source.adapterId || '').trim().toLowerCase();
  const sourceId = String(source.id || '').trim();
  if (adapterId === 'local' || sourceId === 'local' || source.kind === 'local-session') return { hasConstraint: false, sourceId: '', repo: '', ref: '', adapterId: '' };
  const repo = normalizeRepoKey(source.repo || source.repository || source.config?.repo || '');
  const ref = normalizeRef(source.ref || source.config?.ref || '');
  return { hasConstraint: Boolean(sourceId || repo || adapterId), sourceId, repo, ref, adapterId };
}

export function sourceConstraintFromTarget(repo = '') {
  const key = normalizeRepoKey(repo);
  return { hasConstraint: Boolean(key), repo: key, sourceId: '', ref: '', adapterId: 'github' };
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
