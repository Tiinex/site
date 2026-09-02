import { planPlaythingsHistory } from './playthings.timeline.js';
import { playthingsSeedAngle, playthingsSeedUnit } from './playthings.seed.js';
import { parsePlaythingsTime, playthingsLeafIdleState } from './playthings.clock.js';

export const PLAYTHINGS_WORLD_SCHEMA = 'tiinex.playthings.world-projection.experimental.v2';
export const PLAYTHINGS_WORLD_WIDTH = 2200;
export const PLAYTHINGS_WORLD_HEIGHT = 1350;

const WORLD_PADDING = 85;
const BLOCK_RADIUS = 34;
const ORGANIC_STEP = 38;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/**
 * Presentation-only deterministic geography.
 *
 * Placement is generated event-by-event from the prefix that existed at that
 * point in observed history. There is no repo island or final-graph layout.
 * Same prefix + same checksums => same presentation. New suffix history cannot
 * reshuffle already-generated scenes.
 */
export function generatePlaythingsWorld(model = {}) {
  const artifacts = Array.isArray(model.artifacts) ? model.artifacts : [];
  const byKey = new Map(artifacts.map((artifact) => [artifact.key, artifact]));
  const parentEdges = (model.edges || []).filter((edge) => edge.kind === 'parent' && byKey.has(edge.from) && byKey.has(edge.to));
  const parentByChild = new Map(parentEdges.map((edge) => [edge.to, edge.from]));
  const history = planPlaythingsHistory(model);
  const scenePositions = new Map();
  const actorPositions = new Map();
  const activeLeaves = new Set();
  const structures = [];
  const structuresByArtifact = new Map();
  const eventProjection = new Map();

  for (const event of history.events || []) {
    const artifact = byKey.get(event?.artifactKey || '');
    if (!artifact) continue;

    const parentKey = parentByChild.get(artifact.key) || '';
    let sourceKey = '';
    let sourcePoint = parentKey ? actorPositions.get(parentKey) || scenePositions.get(parentKey) || worldCenter() : null;
    let branchPoint = parentKey ? scenePositions.get(parentKey) || sourcePoint || worldCenter() : null;

    if (event.kind === 'advance') {
      sourceKey = parentKey;
      activeLeaves.delete(parentKey);
    } else if (event.kind === 'split') {
      sourceKey = currentLeafBelow(parentKey, activeLeaves, parentByChild, byKey);
      sourcePoint = actorPositions.get(sourceKey) || sourcePoint;
      branchPoint = scenePositions.get(parentKey) || actorPositions.get(parentKey) || branchPoint;
    }

    // A leaf that had been idle >7 relative days at the next observed event is
    // presented as waking from the nearest already-built habitat. This changes
    // presentation only; lineage identity remains the same.
    if (sourceKey && sourcePoint) {
      const sourceArtifact = byKey.get(sourceKey);
      const eventMs = parsePlaythingsTime(event.at);
      const idle = playthingsLeafIdleState(sourceArtifact?.createdAt, eventMs);
      if (idle.state === 'resting') {
        const habitat = nearestHabitatStructure(sourcePoint, structures);
        if (habitat) sourcePoint = structureDoorPoint(habitat);
      }
    }

    const seed = artifact.presentationSeed || artifact.key;
    const excludedSource = event.kind === 'advance' && sourceKey ? new Set([sourceKey]) : null;
    const occupied = occupiedPoints(activeLeaves, actorPositions, structures, excludedSource);
    const lineagePlace = nearestAncestorStructure(parentKey, structuresByArtifact, parentByChild);
    const base = event.kind === 'spawn' ? worldCenter() : branchPoint || sourcePoint || worldCenter();
    const scenePoint = nearestOrganicFreePoint(base, `${event.kind}:${seed}`, occupied, {
      minimumRadius: event.kind === 'spawn' ? 0 : 36,
      placeAnchor: lineagePlace?.point || null,
      placeWeight: lineagePlace ? 0.22 : 0
    });

    const persistent = artifact.persistenceKind === 'structure';
    const organizationDepth = persistent && isOrganizationArtifact(artifact) ? organizationLineageDepth(artifact.key, byKey, parentByChild) : 0;
    const actorPoint = persistent
      ? nearestOrganicFreePoint(scenePoint, `stand:${seed}`, [...occupied, scenePoint], { minimumRadius: 42, maximumShell: 4, placeAnchor: scenePoint, placeWeight: 0.35 })
      : scenePoint;

    let arrivalSource = sourcePoint;
    let arrivalReason = event.kind;
    if (artifact.arrivalKind === 'organization-receiver') {
      const organization = nearestOrganizationStructure(scenePoint, structures);
      if (organization) {
        arrivalSource = structureSpawnPoint(organization, actorPositions, activeLeaves, structures, seed);
        arrivalReason = 'organization-receiver';
      }
    }

    scenePositions.set(artifact.key, freezePoint(scenePoint));
    actorPositions.set(artifact.key, freezePoint(actorPoint));
    activeLeaves.add(artifact.key);

    let structure = null;
    if (persistent) {
      structure = Object.freeze({
        artifactKey: artifact.key,
        repo: artifact.repo || '',
        schemaId: artifact.schemaId || '',
        presentationSchemaId: artifact.presentationSchemaId || '',
        kind: isOrganizationArtifact(artifact) ? 'organization' : artifact.isWorkspaceArtifact || artifact.visualKind === 'workspace-place' ? 'workspace' : artifact.visualKind || 'structure',
        organizationDepth,
        clusterSize: artifact.workspaceClusterSize || 1,
        point: freezePoint(scenePoint),
        spawnCapability: artifact.spawnCapability || '',
        habitat: artifact.spawnCapability === 'habitat' || artifact.spawnCapability === 'organization' || isOrganizationArtifact(artifact) || artifact.isWorkspaceArtifact
      });
      structures.push(structure);
      structuresByArtifact.set(artifact.key, structure);
    }

    const motionPoints = event.kind === 'spawn'
      ? [actorPoint]
      : event.kind === 'split'
        ? uniquePoints([arrivalSource, branchPoint, actorPoint])
        : uniquePoints([arrivalSource, actorPoint]);

    eventProjection.set(event.id, Object.freeze({
      eventId: event.id,
      artifactKey: artifact.key,
      sourceKey,
      sourcePoint: arrivalSource ? freezePoint(arrivalSource) : null,
      branchPoint: branchPoint ? freezePoint(branchPoint) : null,
      scenePoint: freezePoint(scenePoint),
      actorPoint: freezePoint(actorPoint),
      motionPoints: Object.freeze(motionPoints.map(freezePoint)),
      motionPath: motionPath(motionPoints),
      arrivalReason,
      placementReason: lineagePlace ? `near-place:${lineagePlace.artifactKey}` : event.kind === 'spawn' ? 'root-growth' : 'nearest-free-from-lineage',
      visualSeed: lineagePresentationSeed(artifact.key, byKey, parentByChild),
      persistent,
      structure
    }));
  }

  return Object.freeze({
    schema: PLAYTHINGS_WORLD_SCHEMA,
    width: PLAYTHINGS_WORLD_WIDTH,
    height: PLAYTHINGS_WORLD_HEIGHT,
    scenePositions,
    actorPositions,
    livingLeafKeys: Object.freeze(Array.from(activeLeaves).sort()),
    structures: Object.freeze(structures.slice()),
    structuresByArtifact,
    eventProjection,
    semanticAuthority: 'none'
  });
}

export function playthingsRestingAssignment(world, artifact, point, playheadMs) {
  const idle = playthingsLeafIdleState(artifact?.createdAt, playheadMs);
  if (idle.state !== 'resting') return Object.freeze({ ...idle, structure: null, point: point ? freezePoint(point) : null });
  const structure = nearestHabitatStructure(point, world?.structures || []);
  return Object.freeze({ ...idle, structure, point: structure ? freezePoint(structureDoorPoint(structure)) : point ? freezePoint(point) : null });
}

export function playthingsVisibleWorldBounds(world, artifactKeys = new Set(), actorKeys = [], activeProjection = null) {
  const points = [];
  for (const structure of world?.structures || []) if (!artifactKeys.size || artifactKeys.has(structure.artifactKey)) points.push(structure.point);
  for (const key of actorKeys || []) { const point = world?.actorPositions?.get(key); if (point) points.push(point); }
  for (const point of activeProjection?.motionPoints || []) points.push(point);
  if (!points.length) return Object.freeze({ x: 0, y: 0, width: world?.width || 1, height: world?.height || 1 });
  const xs = points.map((point) => Number(point.x || 0));
  const ys = points.map((point) => Number(point.y || 0));
  const pad = 115;
  const minX = clamp(Math.min(...xs) - pad, 0, world.width);
  const minY = clamp(Math.min(...ys) - pad, 0, world.height);
  const maxX = clamp(Math.max(...xs) + pad, 0, world.width);
  const maxY = clamp(Math.max(...ys) + pad, 0, world.height);
  return Object.freeze({ x: minX, y: minY, width: Math.max(180, maxX - minX), height: Math.max(140, maxY - minY) });
}

export function playthingsMotionPath(points = []) { return motionPath(points); }

export function playthingsTerrainMarks(width = PLAYTHINGS_WORLD_WIDTH, height = PLAYTHINGS_WORLD_HEIGHT) {
  const marks = [];
  const columns = Math.max(1, Math.floor(width / 120));
  const rows = Math.max(1, Math.floor(height / 105));
  for (let y = 0; y < rows; y += 1) for (let x = 0; x < columns; x += 1) {
    const seed = hashInteger(`terrain:${x}:${y}`);
    if (seed % 4 === 0) continue;
    marks.push(Object.freeze({ x: 48 + x * 120 + (seed % 49), y: 40 + y * 105 + ((seed >>> 6) % 43), kind: seed % 5 === 0 ? 'stone' : seed % 3 === 0 ? 'tuft-wide' : 'tuft' }));
  }
  return Object.freeze(marks);
}

function occupiedPoints(activeLeaves, actorPositions, structures, excludedLeaves = null) {
  const points = [];
  for (const key of activeLeaves || []) { if (excludedLeaves?.has(key)) continue; const point = actorPositions.get(key); if (point) points.push(point); }
  for (const structure of structures || []) if (structure?.point) points.push(structure.point);
  return points;
}

function nearestOrganicFreePoint(baseInput, seed, blocked = [], options = {}) {
  const base = clampPoint(baseInput || worldCenter());
  const minimumRadius = Math.max(0, Number(options.minimumRadius ?? 0));
  const maximumShell = Math.max(1, Number(options.maximumShell ?? 22));
  const placeAnchor = options.placeAnchor ? clampPoint(options.placeAnchor) : null;
  const placeWeight = Math.max(0, Number(options.placeWeight || 0));
  const start = playthingsSeedAngle(seed, 'organic-frontier-angle');

  if (minimumRadius === 0 && isFree(base, blocked)) return freezePoint(base);

  for (let shell = 1; shell <= maximumShell; shell += 1) {
    const radiusBase = minimumRadius + shell * ORGANIC_STEP;
    const candidates = [];
    const count = 10 + Math.min(8, shell);
    for (let index = 0; index < count; index += 1) {
      const jitter = (playthingsSeedUnit(seed, `organic-jitter:${shell}:${index}`) - 0.5) * 0.52;
      const angle = start + index * GOLDEN_ANGLE + jitter;
      const radialJitter = (playthingsSeedUnit(seed, `organic-radius:${shell}:${index}`) - 0.5) * ORGANIC_STEP * 0.72;
      const radius = Math.max(minimumRadius, radiusBase + radialJitter);
      const point = clampPoint({ x: base.x + Math.cos(angle) * radius, y: base.y + Math.sin(angle) * radius });
      if (!inBounds(point) || !isFree(point, blocked)) continue;
      const baseCost = Math.sqrt(distanceSquared(base, point));
      const placeCost = placeAnchor ? Math.sqrt(distanceSquared(placeAnchor, point)) * placeWeight : 0;
      const edgeCost = worldEdgePenalty(point);
      const tie = playthingsSeedUnit(seed, `organic-tie:${round(point.x)}:${round(point.y)}`) * 5;
      candidates.push({ point, score: baseCost + placeCost + edgeCost + tie });
    }
    candidates.sort((a, b) => a.score - b.score || a.point.y - b.point.y || a.point.x - b.point.x);
    if (candidates[0]) return freezePoint(candidates[0].point);
  }
  return freezePoint(base);
}

function currentLeafBelow(parentKey, activeLeaves, parentByChild, byKey) {
  const candidates = Array.from(activeLeaves || []).filter((leafKey) => isDescendantOf(leafKey, parentKey, parentByChild));
  candidates.sort((left, right) => compareArtifacts(byKey.get(left), byKey.get(right)) || String(left).localeCompare(String(right)));
  return candidates[0] || '';
}
function isDescendantOf(candidateKey, ancestorKey, parentByChild) {
  if (!candidateKey || !ancestorKey) return false;
  let cursor = candidateKey; const seen = new Set();
  while (cursor && !seen.has(cursor)) { seen.add(cursor); if (cursor === ancestorKey) return true; cursor = parentByChild.get(cursor) || ''; }
  return false;
}
function lineagePresentationSeed(key, byKey, parentByChild) {
  let cursor = key; let root = key; const seen = new Set();
  while (cursor && !seen.has(cursor)) { seen.add(cursor); root = cursor; cursor = parentByChild.get(cursor) || ''; }
  const artifact = byKey.get(root) || byKey.get(key) || {};
  return artifact.presentationSeed || root || key;
}
function organizationLineageDepth(key, byKey, parentByChild) {
  let depth = 0; let cursor = parentByChild.get(key) || ''; const seen = new Set();
  while (cursor && !seen.has(cursor)) { seen.add(cursor); const artifact = byKey.get(cursor); if (!isOrganizationArtifact(artifact)) break; depth += 1; cursor = parentByChild.get(cursor) || ''; }
  return depth;
}
function isOrganizationArtifact(artifact = {}) { return artifact.presentationSchemaId === 'tiinex.party.organization.v1' || artifact.schemaId === 'tiinex.party.organization.v1'; }
function nearestOrganizationStructure(point, structures = []) { return nearestStructure(point, structures.filter((structure) => structure.spawnCapability === 'organization' || structure.kind === 'organization')); }
function nearestHabitatStructure(point, structures = []) { return nearestStructure(point, structures.filter((structure) => structure.habitat)); }
function nearestStructure(point, structures = []) { return structures.map((structure) => ({ structure, distance: distanceSquared(point || worldCenter(), structure.point) })).sort((a, b) => a.distance - b.distance || String(a.structure.artifactKey).localeCompare(String(b.structure.artifactKey)))[0]?.structure || null; }
function nearestAncestorStructure(parentKey, structuresByArtifact, parentByChild) {
  let cursor = parentKey; const seen = new Set();
  while (cursor && !seen.has(cursor)) { seen.add(cursor); const structure = structuresByArtifact.get(cursor); if (structure) return structure; cursor = parentByChild.get(cursor) || ''; }
  return null;
}
function structureSpawnPoint(structure, actorPositions, activeLeaves, structures, seed) {
  const blocked = occupiedPoints(activeLeaves, actorPositions, structures);
  return nearestOrganicFreePoint(structureDoorPoint(structure), `spawn:${structure.artifactKey}:${seed}`, blocked, { minimumRadius: 32, maximumShell: 4, placeAnchor: structure.point, placeWeight: 0.4 });
}
function structureDoorPoint(structure) { return { x: structure.point.x, y: structure.point.y + (structure.kind === 'workspace' ? 30 : 34) }; }
function motionPath(points = []) { const clean = uniquePoints((points || []).filter(Boolean)); return clean.map((point, index) => `${index ? 'L' : 'M'} ${round(point.x)} ${round(point.y)}`).join(' '); }
function uniquePoints(points = []) { const out = []; const seen = new Set(); for (const point of points) { if (!point) continue; const key = `${round(point.x)}:${round(point.y)}`; if (seen.has(key)) continue; seen.add(key); out.push({ x: Number(point.x), y: Number(point.y) }); } return out; }
function worldCenter() { return { x: PLAYTHINGS_WORLD_WIDTH / 2, y: PLAYTHINGS_WORLD_HEIGHT / 2 }; }
function clampPoint(point) { return { x: clamp(Number(point.x || 0), WORLD_PADDING, PLAYTHINGS_WORLD_WIDTH - WORLD_PADDING), y: clamp(Number(point.y || 0), WORLD_PADDING, PLAYTHINGS_WORLD_HEIGHT - WORLD_PADDING) }; }
function inBounds(point) { return point.x >= WORLD_PADDING && point.x <= PLAYTHINGS_WORLD_WIDTH - WORLD_PADDING && point.y >= WORLD_PADDING && point.y <= PLAYTHINGS_WORLD_HEIGHT - WORLD_PADDING; }
function isFree(point, blocked) { return !(blocked || []).some((other) => distanceSquared(point, other) < BLOCK_RADIUS * BLOCK_RADIUS); }
function worldEdgePenalty(point) { const edge = Math.min(point.x, point.y, PLAYTHINGS_WORLD_WIDTH - point.x, PLAYTHINGS_WORLD_HEIGHT - point.y); return edge < 150 ? (150 - edge) * 0.55 : 0; }
function distanceSquared(a, b) { const dx = Number(a?.x || 0) - Number(b?.x || 0); const dy = Number(a?.y || 0) - Number(b?.y || 0); return dx * dx + dy * dy; }
function freezePoint(point) { return Object.freeze({ x: round(point.x), y: round(point.y) }); }
function round(value) { return Math.round(Number(value || 0) * 100) / 100; }
function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
function compareArtifacts(left = {}, right = {}) { const leftTime = sortableDate(left.createdAt); const rightTime = sortableDate(right.createdAt); if (leftTime !== rightTime) return leftTime - rightTime; return String(left.key || '').localeCompare(String(right.key || '')); }
function sortableDate(value) { const raw = String(value || '').trim(); if (!raw) return Number.MAX_SAFE_INTEGER; const stamp = Date.parse(raw.includes('T') ? raw : raw.replace(' ', 'T') + 'Z'); return Number.isFinite(stamp) ? stamp : Number.MAX_SAFE_INTEGER; }
function hashInteger(value) { let hash = 2166136261; for (const char of String(value || '')) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); } return hash >>> 0; }
