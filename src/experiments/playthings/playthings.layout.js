export function buildPlaythingsVerseGeography(verse = {}, box = {}) {
  const artifacts = Array.isArray(verse.artifacts) ? verse.artifacts : [];
  const artifactByKey = new Map(artifacts.map((artifact) => [artifact.key, artifact]));
  const childrenByParent = new Map();
  const parentByChild = new Map();
  for (const edge of verse.edges || []) {
    if (edge.kind !== 'parent' || !artifactByKey.has(edge.from) || !artifactByKey.has(edge.to)) continue;
    parentByChild.set(edge.to, edge.from);
    if (!childrenByParent.has(edge.from)) childrenByParent.set(edge.from, []);
    childrenByParent.get(edge.from).push(edge.to);
  }
  for (const children of childrenByParent.values()) children.sort((a, b) => compareArtifactKeys(a, b, artifactByKey));

  let roots = artifacts.filter((artifact) => !parentByChild.has(artifact.key)).map((artifact) => artifact.key);
  if (!roots.length) roots = artifacts.map((artifact) => artifact.key);
  roots.sort((a, b) => compareArtifactKeys(a, b, artifactByKey));

  const depths = new Map();
  const leafOrder = [];
  const visited = new Set();
  function walk(key, depth) {
    if (!key || visited.has(key)) return;
    visited.add(key);
    depths.set(key, depth);
    const children = (childrenByParent.get(key) || []).filter((child) => !visited.has(child));
    if (!children.length) leafOrder.push(key);
    else children.forEach((child) => walk(child, depth + 1));
  }
  roots.forEach((root) => walk(root, 0));
  for (const artifact of artifacts) if (!visited.has(artifact.key)) walk(artifact.key, 0);

  const angleByKey = new Map();
  const start = -Math.PI * 0.12;
  const range = Math.PI * 1.24;
  const leafCount = Math.max(1, leafOrder.length);
  leafOrder.forEach((key, index) => {
    const unit = leafCount === 1 ? 0.5 : index / (leafCount - 1);
    angleByKey.set(key, start + range * unit);
  });
  function resolveAngle(key, resolving = new Set()) {
    if (angleByKey.has(key)) return angleByKey.get(key);
    if (resolving.has(key)) return start + range * 0.5;
    resolving.add(key);
    const children = childrenByParent.get(key) || [];
    const childAngles = children.map((child) => resolveAngle(child, resolving)).filter(Number.isFinite);
    const angle = childAngles.length ? childAngles.reduce((sum, value) => sum + value, 0) / childAngles.length : start + range * 0.5;
    angleByKey.set(key, angle);
    resolving.delete(key);
    return angle;
  }
  artifacts.forEach((artifact) => resolveAngle(artifact.key));

  const maxDepth = Math.max(1, ...Array.from(depths.values()));
  const cx = Number(box.x || 0) + Number(box.w || 1) * 0.5;
  const cy = Number(box.y || 0) + Number(box.h || 1) * 0.53;
  const radiusX = Math.max(40, Number(box.w || 1) * 0.40);
  const radiusY = Math.max(36, Number(box.h || 1) * 0.34);
  const positions = new Map();
  for (const artifact of artifacts) {
    const depth = Number(depths.get(artifact.key) || 0);
    const angle = Number(angleByKey.get(artifact.key) || 0);
    const radial = 0.18 + (depth / Math.max(1, maxDepth)) * 0.74;
    const jitter = ((hashSmall(artifact.key) % 9) - 4) * 0.7;
    positions.set(artifact.key, Object.freeze({
      x: cx + Math.cos(angle) * radiusX * radial + jitter,
      y: cy + Math.sin(angle) * radiusY * radial + jitter * 0.45,
      depth,
      angle
    }));
  }

  return Object.freeze({ positions, parentByChild, childrenByParent, roots: Object.freeze(roots), maxDepth });
}

export function playthingsLineageRoads(verse = {}, geography = {}) {
  const positions = geography.positions instanceof Map ? geography.positions : new Map();
  return (verse.edges || []).filter((edge) => edge.kind === 'parent').map((edge) => {
    const from = positions.get(edge.from);
    const to = positions.get(edge.to);
    if (!from || !to) return null;
    return Object.freeze({ key: edge.key, from, to, path: organicStepPath(from, to) });
  }).filter(Boolean);
}

export function organicStepPath(from, to) {
  const midY = Math.round((from.y + to.y) / 2);
  return `M ${Math.round(from.x)} ${Math.round(from.y)} V ${midY} H ${Math.round(to.x)} V ${Math.round(to.y)}`;
}

function compareArtifactKeys(leftKey, rightKey, byKey) {
  const left = byKey.get(leftKey) || {};
  const right = byKey.get(rightKey) || {};
  const leftTime = sortableDate(left.createdAt);
  const rightTime = sortableDate(right.createdAt);
  if (leftTime !== rightTime) return leftTime - rightTime;
  return String(leftKey).localeCompare(String(rightKey));
}
function sortableDate(value) {
  const raw = String(value || '').trim();
  if (!raw) return Number.MAX_SAFE_INTEGER;
  const stamp = Date.parse(raw.includes('T') ? raw : raw.replace(' ', 'T') + 'Z');
  return Number.isFinite(stamp) ? stamp : Number.MAX_SAFE_INTEGER;
}
function hashSmall(value) { let hash = 2166136261; for (const char of String(value || '')) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); } return hash >>> 0; }
