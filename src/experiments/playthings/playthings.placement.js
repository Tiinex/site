import { playthingsSeedAngle, playthingsSeedUnit } from './playthings.seed.js';

const WORLD_WIDTH = 2200;
const WORLD_HEIGHT = 1350;
const WORLD_PADDING = 85;
const BLOCK_RADIUS = 34;
const ORGANIC_STEP = 38;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

export function nearestOrganicFreePoint(baseInput, seed, blocked = [], options = {}) {
  const base = clampPoint(baseInput || worldCenter());
  const minimumRadius = Math.max(0, Number(options.minimumRadius ?? 0));
  const maximumShell = Math.max(1, Number(options.maximumShell ?? 22));
  const placeAnchor = options.placeAnchor ? clampPoint(options.placeAnchor) : null;
  const placeWeight = Math.max(0, Number(options.placeWeight || 0));
  const trafficAnchor = options.trafficAnchor ? clampPoint(options.trafficAnchor) : null;
  const trafficWeight = Math.max(0, Number(options.trafficWeight || 0));
  const candidateRadius = Math.max(0, Number(options.candidateRadius || 0));
  const start = playthingsSeedAngle(seed, 'organic-frontier-angle');

  if (minimumRadius === 0 && isFree(base, blocked, candidateRadius)) return freezePoint(base);

  const preferredReach = minimumRadius + ORGANIC_STEP * (0.8 + playthingsSeedUnit(seed, 'organic-preferred-reach') * 2.7);
  const targetSpacing = BLOCK_RADIUS * (1.35 + playthingsSeedUnit(seed, 'organic-spacing') * 0.65);
  const candidates = [];
  const count = 28;
  for (let index = 0; index < count; index += 1) {
    const angleJitter = (playthingsSeedUnit(seed, `organic-jitter:${index}`) - 0.5) * 0.9;
    const angle = start + index * GOLDEN_ANGLE + angleJitter;
    const radialUnit = playthingsSeedUnit(seed, `organic-radius:${index}`);
    const radius = Math.max(minimumRadius, preferredReach * (0.58 + radialUnit * 0.92));
    const point = clampPoint({ x: base.x + Math.cos(angle) * radius, y: base.y + Math.sin(angle) * radius });
    if (!inBounds(point) || !isFree(point, blocked, candidateRadius)) continue;
    const baseDistance = Math.sqrt(distanceSquared(base, point));
    const nearest = nearestBlockedDistance(point, blocked);
    const densityCost = Number.isFinite(nearest) ? Math.abs(nearest - targetSpacing) * 0.48 : 0;
    const reachCost = Math.abs(baseDistance - preferredReach) * 0.42;
    const placeCost = placeAnchor ? Math.sqrt(distanceSquared(placeAnchor, point)) * placeWeight : 0;
    const trafficCost = trafficAnchor ? Math.sqrt(distanceSquared(trafficAnchor, point)) * trafficWeight : 0;
    const edgeCost = worldEdgePenalty(point);
    const tie = playthingsSeedUnit(seed, `organic-tie:${round(point.x)}:${round(point.y)}`) * 7;
    candidates.push({ point, score: baseDistance * 0.22 + reachCost + densityCost + placeCost + trafficCost + edgeCost + tie });
  }
  candidates.sort((a, b) => a.score - b.score || a.point.y - b.point.y || a.point.x - b.point.x);
  if (candidates[0]) return freezePoint(candidates[0].point);

  for (let shell = 1; shell <= maximumShell; shell += 1) {
    const radiusBase = minimumRadius + shell * ORGANIC_STEP;
    const fallback = [];
    const shellCount = 9 + Math.min(7, shell);
    for (let index = 0; index < shellCount; index += 1) {
      const angle = start + index * GOLDEN_ANGLE + (playthingsSeedUnit(seed, `fallback-angle:${shell}:${index}`) - 0.5) * 0.7;
      const radius = radiusBase + (playthingsSeedUnit(seed, `fallback-radius:${shell}:${index}`) - 0.5) * ORGANIC_STEP * 0.9;
      const point = clampPoint({ x: base.x + Math.cos(angle) * radius, y: base.y + Math.sin(angle) * radius });
      if (!inBounds(point) || !isFree(point, blocked, candidateRadius)) continue;
      fallback.push({ point, score: worldEdgePenalty(point) + playthingsSeedUnit(seed, `fallback-tie:${shell}:${index}`) * 8 });
    }
    fallback.sort((a, b) => a.score - b.score || a.point.y - b.point.y || a.point.x - b.point.x);
    if (fallback[0]) return freezePoint(fallback[0].point);
  }
  return freezePoint(base);
}

export function nearestTrafficAnchor(point, roads = new Map()) {
  let best = null, bestDistance = Number.POSITIVE_INFINITY;
  for (const segment of roads.values()) {
    if (Number(segment.count || 0) < 2) continue;
    const midpoint = { x: (Number(segment.a?.x || 0) + Number(segment.b?.x || 0)) / 2, y: (Number(segment.a?.y || 0) + Number(segment.b?.y || 0)) / 2 };
    const distance = distanceSquared(point, midpoint);
    if (distance < bestDistance) { bestDistance = distance; best = midpoint; }
  }
  return best ? freezePoint(best) : null;
}

export function rootGrowthBase(seed, blocked = []) {
  if (!(blocked || []).length) return worldCenter();
  const center = worldCenter();
  const angle = playthingsSeedAngle(seed, 'root-neighbourhood-angle');
  const radius = 70 + playthingsSeedUnit(seed, 'root-neighbourhood-radius') * 310;
  return clampPoint({ x: center.x + Math.cos(angle) * radius, y: center.y + Math.sin(angle) * radius });
}

function nearestBlockedDistance(point, blocked = []) {
  let nearest = Number.POSITIVE_INFINITY;
  for (const other of blocked || []) nearest = Math.min(nearest, Math.max(0, Math.sqrt(distanceSquared(point, other)) - Number(other?.radius || 0)));
  return nearest;
}
function isFree(point, blocked, candidateRadius = 0) { return !(blocked || []).some((other) => distanceSquared(point, other) < Math.pow(BLOCK_RADIUS + candidateRadius + Number(other?.radius || 0), 2)); }
function worldEdgePenalty(point) { const edge = Math.min(point.x, point.y, WORLD_WIDTH - point.x, WORLD_HEIGHT - point.y); return edge < 150 ? (150 - edge) * 0.55 : 0; }
function worldCenter() { return { x: WORLD_WIDTH / 2, y: WORLD_HEIGHT / 2 }; }
function clampPoint(point) { return { x: clamp(Number(point.x || 0), WORLD_PADDING, WORLD_WIDTH - WORLD_PADDING), y: clamp(Number(point.y || 0), WORLD_PADDING, WORLD_HEIGHT - WORLD_PADDING) }; }
function inBounds(point) { return point.x >= WORLD_PADDING && point.x <= WORLD_WIDTH - WORLD_PADDING && point.y >= WORLD_PADDING && point.y <= WORLD_HEIGHT - WORLD_PADDING; }
function distanceSquared(a, b) { const dx = Number(a?.x || 0) - Number(b?.x || 0); const dy = Number(a?.y || 0) - Number(b?.y || 0); return dx * dx + dy * dy; }
function freezePoint(point) { return Object.freeze({ x: round(point.x), y: round(point.y) }); }
function round(value) { return Math.round(Number(value || 0) * 100) / 100; }
function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
