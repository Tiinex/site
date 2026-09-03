export const PLAYTHINGS_NAVIGATION_SCHEMA = 'tiinex.playthings.navigation.experimental.v1';

export function structureFootprintFor(artifact = {}, organizationDepth = 0) {
  if (isOrganizationArtifact(artifact)) {
    // Footprints follow the visible landmark silhouette rather than the old
    // debug rectangle. Castle flags/towers reserve noticeably more space than
    // a Plaything, while deeper settlement forms remain compact.
    const halfWidth = organizationDepth <= 0 ? 52 : organizationDepth === 1 ? 43 : 46;
    const halfHeight = organizationDepth <= 0 ? 60 : organizationDepth === 1 ? 46 : 34;
    return { halfWidth, halfHeight, radius: Math.hypot(halfWidth, halfHeight) };
  }
  if (artifact.isWorkspaceArtifact || artifact.visualKind === 'workspace-place') {
    const cluster = Math.max(1, Math.min(5, Number(artifact.workspaceClusterSize || 1)));
    const halfWidth = 36 + (cluster - 1) * 9;
    const halfHeight = 40 + Math.min(2, cluster - 1) * 7;
    return { halfWidth, halfHeight, radius: Math.hypot(halfWidth, halfHeight) };
  }
  return { halfWidth: 34, halfHeight: 28, radius: 44 };
}

export function footprintObstacle(point, footprint = null) {
  return { x: Number(point?.x || 0), y: Number(point?.y || 0), radius: Number(footprint?.radius || 0), footprint };
}

export function polylineDistance(points = []) {
  let total = 0;
  for (let index = 1; index < points.length; index += 1) total += Math.sqrt(distanceSquared(points[index - 1], points[index]));
  return total;
}

// Presentation-only A* over a sparse visibility graph. Structure corners and
// existing road endpoints are navigation nodes; no visible square nav grid is
// imposed on the earth. Existing worn routes have lower edge cost, so roads are
// preferred only when the saved travel cost beats the detour.
export function navigatePlaythingsRoute(waypoints = [], structures = [], roads = new Map()) {
  const clean = uniquePoints((waypoints || []).filter(Boolean));
  if (clean.length < 2) return clean;
  const route = [];
  for (let index = 1; index < clean.length; index += 1) {
    const segment = routeBetween(clean[index - 1], clean[index], structures, roads);
    if (!route.length) route.push(...segment); else route.push(...segment.slice(1));
  }
  return simplifyCollinear(uniquePoints(route));
}

export function recordRouteTraffic(roads, points = [], artifactKey = '') {
  for (let index = 1; index < points.length; index += 1) {
    const a = trafficPoint(points[index - 1]);
    const b = trafficPoint(points[index]);
    if (samePoint(a, b)) continue;
    const key = roadSegmentKey(a, b);
    const prior = roads.get(key) || { key, a: freezePoint(a), b: freezePoint(b), count: 0, trailFromArtifactKey: '', pathFromArtifactKey: '', roadFromArtifactKey: '' };
    const next = { ...prior, count: prior.count + 1 };
    if (!next.trailFromArtifactKey && next.count >= 3) next.trailFromArtifactKey = artifactKey;
    if (!next.pathFromArtifactKey && next.count >= 6) next.pathFromArtifactKey = artifactKey;
    if (!next.roadFromArtifactKey && next.count >= 12) next.roadFromArtifactKey = artifactKey;
    roads.set(key, next);
  }
}

export function playthingsVisibleRoads(world, visibleArtifactKeys = new Set()) {
  const roads = [];
  for (const segment of world?.roadSegments || []) {
    let kind = '';
    if (segment.roadFromArtifactKey && visibleArtifactKeys.has(segment.roadFromArtifactKey)) kind = 'road';
    else if (segment.pathFromArtifactKey && visibleArtifactKeys.has(segment.pathFromArtifactKey)) kind = 'path';
    else if (segment.trailFromArtifactKey && visibleArtifactKeys.has(segment.trailFromArtifactKey)) kind = 'trail';
    if (kind) roads.push(Object.freeze({ ...segment, kind }));
  }
  return Object.freeze(roads);
}

function routeBetween(start, end, structures = [], roads = new Map()) {
  if (!roads.size && lineOfSightClear(start, end, structures)) return [start, end];
  const nodes = [freezePoint(start), freezePoint(end)];
  for (const structure of structures || []) {
    const fp = structure.footprint || { halfWidth: 34, halfHeight: 28 };
    const margin = 18;
    const dx = Number(fp.halfWidth || 34) + margin;
    const dy = Number(fp.halfHeight || 28) + margin;
    nodes.push(
      freezePoint({ x: structure.point.x - dx, y: structure.point.y - dy }),
      freezePoint({ x: structure.point.x + dx, y: structure.point.y - dy }),
      freezePoint({ x: structure.point.x + dx, y: structure.point.y + dy }),
      freezePoint({ x: structure.point.x - dx, y: structure.point.y + dy })
    );
  }
  for (const road of roads.values()) {
    nodes.push(freezePoint(road.a), freezePoint(road.b));
  }
  const unique = uniquePoints(nodes);
  const startIndex = unique.findIndex((point) => samePoint(point, start));
  const endIndex = unique.findIndex((point) => samePoint(point, end));
  if (startIndex < 0 || endIndex < 0) return [start, end];

  const open = new Set([startIndex]);
  const came = new Map();
  const g = new Map([[startIndex, 0]]);
  const f = new Map([[startIndex, routeHeuristic(unique[startIndex], unique[endIndex])]]);
  while (open.size) {
    let current = -1;
    let currentScore = Number.POSITIVE_INFINITY;
    for (const index of open) {
      const score = f.get(index) ?? Number.POSITIVE_INFINITY;
      if (score < currentScore) { current = index; currentScore = score; }
    }
    if (current === endIndex) return reconstructRoute(unique, came, current);
    open.delete(current);
    for (let next = 0; next < unique.length; next += 1) {
      if (next === current || !lineOfSightClear(unique[current], unique[next], structures)) continue;
      const distance = Math.sqrt(distanceSquared(unique[current], unique[next]));
      const road = roads.get(roadSegmentKey(unique[current], unique[next]));
      const tentative = (g.get(current) ?? Number.POSITIVE_INFINITY) + distance * roadTravelFactor(road?.count || 0);
      if (tentative >= (g.get(next) ?? Number.POSITIVE_INFINITY)) continue;
      came.set(next, current);
      g.set(next, tentative);
      f.set(next, tentative + routeHeuristic(unique[next], unique[endIndex]));
      open.add(next);
    }
  }
  return [start, end];
}

function reconstructRoute(nodes, came, current) {
  const route = [nodes[current]];
  while (came.has(current)) { current = came.get(current); route.push(nodes[current]); }
  return route.reverse();
}
function lineOfSightClear(a, b, structures = []) { return !(structures || []).some((structure) => segmentIntersectsFootprint(a, b, structure)); }
function segmentIntersectsFootprint(a, b, structure) {
  const fp = structure?.footprint || { halfWidth: 34, halfHeight: 28 };
  const margin = 12;
  const minX = structure.point.x - Number(fp.halfWidth || 34) - margin;
  const maxX = structure.point.x + Number(fp.halfWidth || 34) + margin;
  const minY = structure.point.y - Number(fp.halfHeight || 28) - margin;
  const maxY = structure.point.y + Number(fp.halfHeight || 28) + margin;
  if (pointInsideRect(a, minX, minY, maxX, maxY) || pointInsideRect(b, minX, minY, maxX, maxY)) return false;
  const edges = [
    [{ x: minX, y: minY }, { x: maxX, y: minY }], [{ x: maxX, y: minY }, { x: maxX, y: maxY }],
    [{ x: maxX, y: maxY }, { x: minX, y: maxY }], [{ x: minX, y: maxY }, { x: minX, y: minY }]
  ];
  return edges.some(([left, right]) => segmentsIntersect(a, b, left, right));
}
function pointInsideRect(point, minX, minY, maxX, maxY) { return point.x > minX && point.x < maxX && point.y > minY && point.y < maxY; }
function segmentsIntersect(a, b, c, d) {
  const o1 = orientation(a, b, c), o2 = orientation(a, b, d), o3 = orientation(c, d, a), o4 = orientation(c, d, b);
  return o1 * o2 < 0 && o3 * o4 < 0;
}
function orientation(a, b, c) { return Math.sign((b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y)); }
function simplifyCollinear(points = []) {
  if (points.length < 3) return points;
  const out = [points[0]];
  for (let index = 1; index < points.length - 1; index += 1) {
    const a = out[out.length - 1], b = points[index], c = points[index + 1];
    const cross = (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x);
    if (Math.abs(cross) > .01) out.push(b);
  }
  out.push(points[points.length - 1]);
  return out;
}
function trafficPoint(point) { return { x: Math.round(Number(point?.x || 0) / 8) * 8, y: Math.round(Number(point?.y || 0) / 8) * 8 }; }
function roadSegmentKey(a, b) {
  const left = trafficPoint(a), right = trafficPoint(b);
  const ak = `${left.x}:${left.y}`, bk = `${right.x}:${right.y}`;
  return ak < bk ? `${ak}|${bk}` : `${bk}|${ak}`;
}
function roadTravelFactor(count = 0) { return count >= 12 ? .52 : count >= 6 ? .66 : count >= 3 ? .82 : 1; }
function routeHeuristic(a, b) { return Math.sqrt(distanceSquared(a, b)) * .52; }
function isOrganizationArtifact(artifact = {}) { return artifact.presentationSchemaId === 'tiinex.party.organization.v1' || artifact.schemaId === 'tiinex.party.organization.v1'; }
function uniquePoints(points = []) {
  const out = [], seen = new Set();
  for (const point of points) {
    if (!point) continue;
    const frozen = freezePoint(point), key = `${frozen.x}:${frozen.y}`;
    if (seen.has(key)) continue;
    seen.add(key); out.push(frozen);
  }
  return out;
}
function distanceSquared(a, b) { const dx = Number(a?.x || 0) - Number(b?.x || 0), dy = Number(a?.y || 0) - Number(b?.y || 0); return dx * dx + dy * dy; }
function freezePoint(point) { return Object.freeze({ x: round(point?.x), y: round(point?.y) }); }
function round(value) { return Math.round(Number(value || 0) * 100) / 100; }
function samePoint(a, b) { return Math.abs(Number(a?.x) - Number(b?.x)) < .01 && Math.abs(Number(a?.y) - Number(b?.y)) < .01; }
