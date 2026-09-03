export const PLAYTHINGS_NAVIGATION_SCHEMA = 'tiinex.playthings.navigation.experimental.v2';

const MAX_ROAD_LEVEL = 10;
const GRASS_TRAVEL_FACTOR = 1.24;
const MAX_ROUTE_ROAD_SEGMENTS = 140;

export function structureFootprintFor(artifact = {}, organizationDepth = 0) {
  if (isOrganizationArtifact(artifact)) {
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

// Presentation-only A* over a sparse visibility graph. Grass is deliberately
// expensive and established traffic progressively cheaper, so useful roads
// become the default without making a road semantic or forcing absurd detours.
// Only route-local road nodes are admitted to each A* search; the old global
// road-node scan grew quadratically with world history and could stall entry.
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
  const corridor = sampledTrafficCorridor(points);
  for (let index = 1; index < corridor.length; index += 1) {
    const a = corridor[index - 1];
    const b = corridor[index];
    if (samePoint(a, b)) continue;
    const key = roadSegmentKey(a, b);
    const prior = roads.get(key) || {
      key,
      a: freezePoint(a),
      b: freezePoint(b),
      count: 0,
      levelFromArtifactKeys: Array(MAX_ROAD_LEVEL).fill(''),
      trailFromArtifactKey: '',
      pathFromArtifactKey: '',
      roadFromArtifactKey: ''
    };
    const next = { ...prior, levelFromArtifactKeys: Array.from(prior.levelFromArtifactKeys || Array(MAX_ROAD_LEVEL).fill('')) };
    next.count = Number(prior.count || 0) + 1;
    const level = roadLevel(next.count);
    if (!next.levelFromArtifactKeys[level - 1]) next.levelFromArtifactKeys[level - 1] = artifactKey;
    // Keep legacy threshold receipts for compatibility with older observation
    // caches while the renderer uses the richer 1..10 level projection.
    if (!next.trailFromArtifactKey && next.count >= 2) next.trailFromArtifactKey = artifactKey;
    if (!next.pathFromArtifactKey && next.count >= 4) next.pathFromArtifactKey = artifactKey;
    if (!next.roadFromArtifactKey && next.count >= 7) next.roadFromArtifactKey = artifactKey;
    roads.set(key, next);
  }
}

function sampledTrafficCorridor(points = []) {
  const out = [];
  for (let index = 1; index < (points || []).length; index += 1) {
    const from = points[index - 1], to = points[index];
    const distance = Math.sqrt(distanceSquared(from, to));
    const steps = Math.max(1, Math.ceil(distance / 24));
    for (let step = index === 1 ? 0 : 1; step <= steps; step += 1) {
      const t = step / steps;
      const point = trafficPoint({ x: Number(from?.x || 0) + (Number(to?.x || 0) - Number(from?.x || 0)) * t, y: Number(from?.y || 0) + (Number(to?.y || 0) - Number(from?.y || 0)) * t });
      if (!out.length || !samePoint(out[out.length - 1], point)) out.push(freezePoint(point));
    }
  }
  return out;
}

export function playthingsVisibleRoads(world, visibleArtifactKeys = new Set()) {
  const qualified = [];
  for (const segment of world?.roadSegments || []) {
    const level = visibleRoadLevel(segment, visibleArtifactKeys);
    if (!level) continue;
    qualified.push({ ...segment, level });
  }
  const endpointCounts = new Map();
  for (const segment of qualified) {
    for (const point of [segment.a, segment.b]) {
      const key = pointKey(point);
      endpointCounts.set(key, (endpointCounts.get(key) || 0) + 1);
    }
  }
  return Object.freeze(qualified.map((segment) => {
    const connected = (endpointCounts.get(pointKey(segment.a)) || 0) > 1 || (endpointCounts.get(pointKey(segment.b)) || 0) > 1;
    const kind = !connected ? 'wear' : segment.level <= 2 ? 'trail' : segment.level <= 5 ? 'path' : 'road';
    return Object.freeze({ ...segment, kind, connected });
  }));
}

export function roadLevel(count = 0) {
  return Math.max(0, Math.min(MAX_ROAD_LEVEL, Math.floor(Number(count || 0))));
}

function visibleRoadLevel(segment = {}, visibleArtifactKeys = new Set()) {
  const levels = Array.isArray(segment.levelFromArtifactKeys) ? segment.levelFromArtifactKeys : [];
  for (let index = Math.min(MAX_ROAD_LEVEL, levels.length) - 1; index >= 0; index -= 1) {
    const artifactKey = levels[index];
    if (artifactKey && visibleArtifactKeys.has(artifactKey)) return index + 1;
  }
  // Carried 001-16 road state does not have per-level receipts. Preserve a
  // bounded fallback when older world state is ever supplied directly.
  if (segment.roadFromArtifactKey && visibleArtifactKeys.has(segment.roadFromArtifactKey)) return Math.min(MAX_ROAD_LEVEL, Math.max(7, roadLevel(segment.count)));
  if (segment.pathFromArtifactKey && visibleArtifactKeys.has(segment.pathFromArtifactKey)) return Math.min(5, Math.max(3, roadLevel(segment.count)));
  if (segment.trailFromArtifactKey && visibleArtifactKeys.has(segment.trailFromArtifactKey)) return Math.min(2, Math.max(1, roadLevel(segment.count)));
  return 0;
}

function routeBetween(start, end, structures = [], roads = new Map()) {
  if (!roads.size && lineOfSightClear(start, end, structures)) return [start, end];
  const nodes = [freezePoint(start), freezePoint(end)];
  const relevantStructures = routeRelevantStructures(start, end, structures);
  for (const structure of relevantStructures) {
    const fp = structure.footprint || { halfWidth: 34, halfHeight: 28 };
    const margin = structure.kind === 'plaything-obstacle' ? 10 : 18;
    const dx = Number(fp.halfWidth || 34) + margin;
    const dy = Number(fp.halfHeight || 28) + margin;
    nodes.push(
      freezePoint({ x: structure.point.x - dx, y: structure.point.y - dy }),
      freezePoint({ x: structure.point.x + dx, y: structure.point.y - dy }),
      freezePoint({ x: structure.point.x + dx, y: structure.point.y + dy }),
      freezePoint({ x: structure.point.x - dx, y: structure.point.y + dy })
    );
  }
  for (const road of routeRelevantRoads(start, end, roads)) {
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
    const candidates = neighborIndexes(unique, current, endIndex);
    for (const next of candidates) {
      if (next === current || !lineOfSightClear(unique[current], unique[next], relevantStructures)) continue;
      const distance = Math.sqrt(distanceSquared(unique[current], unique[next]));
      const road = roads.get(roadSegmentKey(unique[current], unique[next]));
      const factor = road ? roadTravelFactor(road.count) : GRASS_TRAVEL_FACTOR;
      const tentative = (g.get(current) ?? Number.POSITIVE_INFINITY) + distance * factor;
      if (tentative >= (g.get(next) ?? Number.POSITIVE_INFINITY)) continue;
      came.set(next, current);
      g.set(next, tentative);
      f.set(next, tentative + routeHeuristic(unique[next], unique[endIndex]));
      open.add(next);
    }
  }
  return [start, end];
}

function routeRelevantStructures(start, end, structures = []) {
  const direct = Math.sqrt(distanceSquared(start, end));
  const margin = Math.max(110, Math.min(320, direct * 0.38));
  return (structures || []).filter((structure) => pointNearRouteBox(structure.point, start, end, margin));
}

function routeRelevantRoads(start, end, roads = new Map()) {
  const direct = Math.sqrt(distanceSquared(start, end));
  const margin = Math.max(190, Math.min(520, direct * 0.58));
  const candidates = [];
  for (const road of roads.values()) {
    const midpoint = { x: (Number(road.a?.x || 0) + Number(road.b?.x || 0)) / 2, y: (Number(road.a?.y || 0) + Number(road.b?.y || 0)) / 2 };
    const nearEndpoint = Math.min(distanceSquared(road.a, start), distanceSquared(road.b, start), distanceSquared(road.a, end), distanceSquared(road.b, end)) < 180 * 180;
    if (!nearEndpoint && !pointNearRouteBox(midpoint, start, end, margin)) continue;
    candidates.push({ road, score: pointSegmentDistanceSquared(midpoint, start, end) - roadLevel(road.count) * 180 });
  }
  candidates.sort((a, b) => a.score - b.score || String(a.road.key).localeCompare(String(b.road.key)));
  return candidates.slice(0, MAX_ROUTE_ROAD_SEGMENTS).map((entry) => entry.road);
}

function neighborIndexes(nodes, current, endIndex) {
  const point = nodes[current];
  const candidates = [];
  for (let index = 0; index < nodes.length; index += 1) {
    if (index === current) continue;
    candidates.push({ index, distance: distanceSquared(point, nodes[index]) });
  }
  candidates.sort((a, b) => a.distance - b.distance || a.index - b.index);
  const nearest = candidates.slice(0, 24).map((entry) => entry.index);
  if (!nearest.includes(endIndex)) nearest.push(endIndex);
  return nearest;
}

function pointNearRouteBox(point, start, end, margin) {
  const minX = Math.min(start.x, end.x) - margin, maxX = Math.max(start.x, end.x) + margin;
  const minY = Math.min(start.y, end.y) - margin, maxY = Math.max(start.y, end.y) + margin;
  return Number(point?.x || 0) >= minX && Number(point?.x || 0) <= maxX && Number(point?.y || 0) >= minY && Number(point?.y || 0) <= maxY;
}

function pointSegmentDistanceSquared(point, a, b) {
  const abx = Number(b?.x || 0) - Number(a?.x || 0), aby = Number(b?.y || 0) - Number(a?.y || 0);
  const apx = Number(point?.x || 0) - Number(a?.x || 0), apy = Number(point?.y || 0) - Number(a?.y || 0);
  const denom = abx * abx + aby * aby;
  const t = denom ? Math.max(0, Math.min(1, (apx * abx + apy * aby) / denom)) : 0;
  const x = Number(a?.x || 0) + abx * t, y = Number(a?.y || 0) + aby * t;
  return distanceSquared(point, { x, y });
}

function reconstructRoute(nodes, came, current) {
  const route = [nodes[current]];
  while (came.has(current)) { current = came.get(current); route.push(nodes[current]); }
  return route.reverse();
}
function lineOfSightClear(a, b, structures = []) { return !(structures || []).some((structure) => segmentIntersectsFootprint(a, b, structure)); }
function segmentIntersectsFootprint(a, b, structure) {
  const fp = structure?.footprint || { halfWidth: 34, halfHeight: 28 };
  const margin = structure?.kind === 'plaything-obstacle' ? 4 : 12;
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
function pointKey(point) { const snapped = trafficPoint(point); return `${snapped.x}:${snapped.y}`; }
function roadSegmentKey(a, b) {
  const left = trafficPoint(a), right = trafficPoint(b);
  const ak = `${left.x}:${left.y}`, bk = `${right.x}:${right.y}`;
  return ak < bk ? `${ak}|${bk}` : `${bk}|${ak}`;
}
function roadTravelFactor(count = 0) {
  const level = roadLevel(count);
  if (!level) return GRASS_TRAVEL_FACTOR;
  const base = Math.max(.38, .9 - (level - 1) * .058);
  // A very heavily used one-cell corridor becomes slightly less attractive,
  // allowing nearby equal-cost lanes/junctions to emerge instead of collapsing
  // every future journey onto one mathematical line.
  const capacity = Math.min(.14, Math.max(0, Number(count || 0) - 18) * .008);
  return base + capacity;
}
function routeHeuristic(a, b) { return Math.sqrt(distanceSquared(a, b)) * .38; }
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
