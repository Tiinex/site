import { footprintObstacle } from './playthings.navigation.js';

export function playthingsRouteObstacles(activeLeaves, actorPositions, structures = [], rootGate = null, excludedLeaves = null) {
  const obstacles = [...(structures || [])];
  if (rootGate?.point) obstacles.push(rootGate);
  for (const key of activeLeaves || []) {
    if (!key || excludedLeaves?.has(key)) continue;
    const point = actorPositions.get(key);
    if (!point) continue;
    obstacles.push({ artifactKey: `plaything:${key}`, kind: 'plaything-obstacle', point, footprint: { halfWidth: 13, halfHeight: 17, radius: 22 }, habitat: false, presentationOnly: true });
  }
  return obstacles;
}

export function playthingsOccupiedPoints(activeLeaves, actorPositions, structures, excludedLeaves = null) {
  const points = [];
  for (const key of activeLeaves || []) {
    if (excludedLeaves?.has(key)) continue;
    const point = actorPositions.get(key);
    if (point) points.push(point);
  }
  for (const structure of structures || []) if (structure?.point) points.push(footprintObstacle(structure.point, structure.footprint));
  return points;
}
