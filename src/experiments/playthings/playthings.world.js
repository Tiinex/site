import { planPlaythingsHistory } from './playthings.timeline.js';
import { parsePlaythingsTime, playthingsLeafIdleState } from './playthings.clock.js';
import { footprintObstacle, navigatePlaythingsRoute, playthingsVisibleRoads, polylineDistance, recordRouteTraffic, structureFootprintFor } from './playthings.navigation.js';
import { playthingsOccupiedPoints, playthingsRouteObstacles } from './playthings.worldOccupancy.js';
import { nearestOrganicFreePoint, nearestTrafficAnchor, rootGrowthBase } from './playthings.placement.js';
import { buildPlaythingsLivingProjection, nearestLivingAncestorKey } from './playthings.living.js';

export { playthingsVisibleRoads };

export const PLAYTHINGS_WORLD_SCHEMA = 'tiinex.playthings.world-projection.experimental.v2';
export const PLAYTHINGS_WORLD_WIDTH = 2200;
export const PLAYTHINGS_WORLD_HEIGHT = 1350;

const WORLD_PADDING = 85;
const BLOCK_RADIUS = 34;
const ROOT_GATE_FOOTPRINT = Object.freeze({ halfWidth: 42, halfHeight: 50, radius: 66 });

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
  const living = buildPlaythingsLivingProjection(artifacts, parentEdges);
  const history = planPlaythingsHistory(model);
  const scenePositions = new Map();
  const actorPositions = new Map();
  const activeLeaves = new Set();
  const structures = [];
  const structuresByArtifact = new Map();
  const eventProjection = new Map();
  const restingMigrationsByEvent = new Map();
  const restedLeaves = new Set();
  const restedHabitatByLeaf = new Map();
  const roadSegments = new Map();
  const rootGate = Object.freeze({ kind: 'root-gate', point: freezePoint(worldCenter()), footprint: ROOT_GATE_FOOTPRINT, habitat: false, semanticAuthority: 'none' });
  const rootGateUsedBy = [];

  for (const event of history.events || []) {
    const artifact = byKey.get(event?.artifactKey || '');
    if (!artifact) continue;

    const parentKey = parentByChild.get(artifact.key) || '';
    const livingParentKey = String(event.livingParentKey || living.parentByChild.get(artifact.key) || '');
    let sourceKey = '';
    let sourcePoint = livingParentKey ? actorPositions.get(livingParentKey) || scenePositions.get(livingParentKey) || rootGate.point : null;
    let branchPoint = livingParentKey ? scenePositions.get(livingParentKey) || sourcePoint || rootGate.point : null;
    let blueprintAnchorPoint = null;

    if (event.kind === 'advance') {
      sourceKey = livingParentKey;
      activeLeaves.delete(livingParentKey);
    } else if (event.kind === 'split') {
      sourceKey = currentLeafBelow(livingParentKey, activeLeaves, living.parentByChild, byKey);
      sourcePoint = actorPositions.get(sourceKey) || sourcePoint;
      branchPoint = scenePositions.get(livingParentKey) || actorPositions.get(livingParentKey) || branchPoint;
    } else if (event.kind === 'observe') {
      const ancestorKey = nearestLivingAncestorKey(artifact.key, living.artifactByKey, living.semanticParentByChild);
      const activeAncestorLeaf = ancestorKey ? currentLeafBelow(ancestorKey, activeLeaves, living.parentByChild, byKey) : '';
      blueprintAnchorPoint = actorPositions.get(activeAncestorLeaf) || actorPositions.get(ancestorKey) || scenePositions.get(ancestorKey) || null;
    }

    const sourceLeafPoint = sourceKey ? actorPositions.get(sourceKey) || sourcePoint || null : null;
    const sourceRestingHabitatKey = sourceKey ? restedHabitatByLeaf.get(sourceKey) || '' : '';
    const sourceRestingHabitat = sourceRestingHabitatKey ? structuresByArtifact.get(sourceRestingHabitatKey) || null : null;
    const eventMs = parsePlaythingsTime(event.at);

    // Idle is presentation-time state. When several already-living leaves cross
    // the resting threshold before the same observed event, they migrate as one
    // concurrent lifecycle batch instead of disappearing into a habitat. Only
    // structures already built at this prefix are eligible.
    const restingMigrations = [];
    for (const leafKey of activeLeaves) {
      if (!leafKey || leafKey === sourceKey || restedLeaves.has(leafKey)) continue;
      const leafArtifact = byKey.get(leafKey);
      const from = actorPositions.get(leafKey);
      if (!leafArtifact || !from) continue;
      const idle = playthingsLeafIdleState(leafArtifact.createdAt, eventMs);
      if (idle.state !== 'resting') continue;
      const habitat = nearestHabitatStructure(from, structures);
      if (!habitat) continue;
      const to = structureDoorPoint(habitat);
      const approach = structureApproachPoint(habitat);
      const route = navigatePlaythingsRoute([from, approach, to], playthingsRouteObstacles(activeLeaves, actorPositions, structures, rootGate, new Set([leafKey])), roadSegments);
      const distance = polylineDistance(route);
      restingMigrations.push(Object.freeze({
        headKey: leafKey,
        artifactKey: leafKey,
        structureArtifactKey: habitat.artifactKey,
        from: freezePoint(from),
        to: freezePoint(to),
        motionPoints: Object.freeze(route.map(freezePoint)),
        durationMs: Math.round(clamp(distance / 0.58, 520, 1500))
      }));
    }
    // The batch is routed against the road state that existed before this
    // lifecycle moment, then all completed routes contribute wear together.
    for (const migration of restingMigrations) {
      restedLeaves.add(migration.headKey);
      restedHabitatByLeaf.set(migration.headKey, migration.structureArtifactKey);
    }
    for (const migration of restingMigrations) recordRouteTraffic(roadSegments, migration.motionPoints, artifact.key);
    restingMigrationsByEvent.set(event.id, Object.freeze(restingMigrations));

    // A lineage that becomes active again wakes from the place where it had
    // previously rested. The semantic leaf never changed; only presentation did.
    if (event.kind !== 'observe' && sourceKey && sourcePoint) {
      const restingHabitatKey = restedHabitatByLeaf.get(sourceKey) || '';
      const habitat = restingHabitatKey ? structuresByArtifact.get(restingHabitatKey) || null : null;
      if (habitat) sourcePoint = structureDoorPoint(habitat);
      else {
        const sourceArtifact = byKey.get(sourceKey);
        const idle = playthingsLeafIdleState(sourceArtifact?.createdAt, eventMs);
        if (idle.state === 'resting') {
          const fallbackHabitat = nearestHabitatStructure(sourcePoint, structures);
          if (fallbackHabitat) sourcePoint = structureDoorPoint(fallbackHabitat);
        }
      }
      restedLeaves.delete(sourceKey);
      restedHabitatByLeaf.delete(sourceKey);
    }

    const seed = artifact.presentationSeed || artifact.key;
    const persistent = !artifact.isSchemaArtifact && artifact.persistenceKind === 'structure';
    const organizationDepth = persistent && isOrganizationArtifact(artifact) ? organizationLineageDepth(artifact.key, byKey, parentByChild) : 0;
    const plannedFootprint = persistent ? structureFootprintFor(artifact, organizationDepth) : null;
    const excludedSource = ['advance','split'].includes(event.kind) && sourceKey ? new Set([sourceKey]) : null;
    const occupied = [...playthingsOccupiedPoints(activeLeaves, actorPositions, structures, excludedSource), footprintObstacle(rootGate.point, rootGate.footprint)];
    const lineagePlace = nearestAncestorStructure(parentKey, structuresByArtifact, parentByChild);
    const base = event.kind === 'observe'
      ? blueprintAnchorPoint || lineagePlace?.point || rootGate.point
      : event.kind === 'spawn'
        ? rootGrowthBase(seed, occupied)
        : branchPoint || sourcePoint || rootGate.point;
    const trafficAnchor = event.kind === 'observe' ? null : nearestTrafficAnchor(base, roadSegments);
    const scenePoint = nearestOrganicFreePoint(base, `${event.kind}:${seed}`, occupied, {
      minimumRadius: event.kind === 'spawn' ? 22 : event.kind === 'observe' ? 20 : 36,
      candidateRadius: Number(plannedFootprint?.radius || 0),
      placeAnchor: lineagePlace?.point || null,
      placeWeight: lineagePlace ? 0.58 : 0,
      trafficAnchor,
      trafficWeight: trafficAnchor ? (event.kind === 'spawn' ? 0.2 : 0.18) : 0
    });
    const actorPoint = persistent
      ? nearestOrganicFreePoint(scenePoint, `stand:${seed}`, [...occupied, footprintObstacle(scenePoint, plannedFootprint)], { minimumRadius: Math.max(42, Number(plannedFootprint?.radius || 0) + 18), maximumShell: 5, placeAnchor: scenePoint, placeWeight: 0.528 })
      : scenePoint;

    let arrivalSource = event.kind === 'spawn' ? rootGate.point : sourcePoint;
    let arrivalReason = event.kind === 'spawn' ? 'root-gate' : event.kind;
    if (event.kind === 'spawn') rootGateUsedBy.push(artifact.key);
    if (artifact.arrivalKind === 'organization-receiver') {
      const organization = nearestOrganizationStructure(scenePoint, structures);
      if (organization) {
        arrivalSource = structureSpawnPoint(organization, actorPositions, activeLeaves, structures, seed);
        arrivalReason = 'organization-receiver';
      }
    }

    scenePositions.set(artifact.key, freezePoint(scenePoint));
    if (!artifact.isSchemaArtifact) {
      actorPositions.set(artifact.key, freezePoint(actorPoint));
      activeLeaves.add(artifact.key);
    }

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
        footprint: Object.freeze(plannedFootprint),
        spawnCapability: artifact.spawnCapability || '',
        habitat: artifact.spawnCapability === 'habitat' || artifact.spawnCapability === 'organization' || isOrganizationArtifact(artifact) || artifact.isWorkspaceArtifact
      });
      structures.push(structure);
      structuresByArtifact.set(artifact.key, structure);
    }

    const rawMotionPoints = event.kind === 'observe'
      ? [scenePoint]
      : event.kind === 'spawn'
        ? uniquePoints([arrivalSource, actorPoint])
        : event.kind === 'split'
          ? uniquePoints([arrivalSource, branchPoint])
          : uniquePoints([arrivalSource, actorPoint]);
    const routeStructures = structure ? structures.filter((candidate) => candidate.artifactKey !== structure.artifactKey) : structures;
    const routeObstacles = playthingsRouteObstacles(activeLeaves, actorPositions, routeStructures, rootGate, new Set([artifact.key, sourceKey].filter(Boolean)));
    const motionPoints = event.kind === 'observe' ? rawMotionPoints : navigatePlaythingsRoute(rawMotionPoints, routeObstacles, roadSegments);
    if (!artifact.isSchemaArtifact && motionPoints.length > 1) recordRouteTraffic(roadSegments, motionPoints, artifact.key);

    let fork = null;
    if (event.kind === 'split' && branchPoint && sourceKey) {
      const approachStart = arrivalSource || sourceLeafPoint || branchPoint;
      const approach = navigatePlaythingsRoute(uniquePoints([approachStart, branchPoint]), routeObstacles, roadSegments);
      const continuationTarget = sourceLeafPoint || approachStart || branchPoint;
      const sleepHabitat = sourceRestingHabitat || nearestHabitatStructure(continuationTarget, structures);
      const sleepTarget = sleepHabitat ? structureDoorPoint(sleepHabitat) : continuationTarget;
      const sleepApproach = sleepHabitat ? structureApproachPoint(sleepHabitat) : sleepTarget;
      const sleepRoute = navigatePlaythingsRoute(uniquePoints([branchPoint, sleepApproach, sleepTarget]), routeObstacles, roadSegments);
      const continuationRoute = navigatePlaythingsRoute(uniquePoints([branchPoint, continuationTarget]), routeObstacles, roadSegments);
      const siblingRoute = navigatePlaythingsRoute(uniquePoints([branchPoint, actorPoint]), routeObstacles, roadSegments);
      // All three fan-out routes are one presentation event. The sleep-return
      // route never changes occupancy; resting counts are derived from the real
      // living leaf state after the event, not from this choreography echo.
      fork = Object.freeze({
        branchPoint: freezePoint(branchPoint),
        sourceArtifactKey: sourceKey,
        sourceRestingHabitatKey: sleepHabitat?.artifactKey || '',
        approachPoints: Object.freeze(approach.map(freezePoint)),
        arms: Object.freeze([
          Object.freeze({ kind: 'sleep-return', artifactKey: sourceKey, points: Object.freeze(sleepRoute.map(freezePoint)) }),
          Object.freeze({ kind: 'continuation', artifactKey: sourceKey, points: Object.freeze(continuationRoute.map(freezePoint)) }),
          Object.freeze({ kind: 'sibling', artifactKey: artifact.key, points: Object.freeze(siblingRoute.map(freezePoint)) })
        ])
      });
      for (const arm of fork.arms) if (arm.points.length > 1) recordRouteTraffic(roadSegments, arm.points, artifact.key);
    }

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
      placementReason: event.kind === 'observe' ? (lineagePlace ? `blueprint-near-place:${lineagePlace.artifactKey}` : 'blueprint-root-gate') : lineagePlace ? `near-place:${lineagePlace.artifactKey}` : event.kind === 'spawn' ? 'root-gate-growth' : 'nearest-free-from-lineage',
      visualSeed: lineagePresentationSeed(artifact.key, byKey, parentByChild),
      persistent,
      structure,
      fork
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
    restingMigrationsByEvent,
    roadSegments: Object.freeze(Array.from(roadSegments.values()).map((segment) => Object.freeze({ ...segment }))),
    rootGate: Object.freeze({ ...rootGate, usedByArtifactKeys: Object.freeze(rootGateUsedBy.slice()) }),
    semanticAuthority: 'none'
  });
}

export function playthingsRestingAssignment(world, artifact, point, playheadMs, visibleArtifactKeys = null) {
  const idle = playthingsLeafIdleState(artifact?.createdAt, playheadMs);
  if (idle.state !== 'resting') return Object.freeze({ ...idle, structure: null, point: point ? freezePoint(point) : null });
  const structures = (world?.structures || []).filter((structure) => !visibleArtifactKeys || visibleArtifactKeys.has(structure.artifactKey));
  const structure = nearestHabitatStructure(point, structures);
  return Object.freeze({ ...idle, structure, point: structure ? freezePoint(structureDoorPoint(structure)) : point ? freezePoint(point) : null });
}

export function playthingsVisibleWorldBounds(world, artifactKeys = new Set(), actorKeys = [], activeProjection = null) {
  const points = [];
  if (world?.rootGate?.usedByArtifactKeys?.some((key) => !artifactKeys.size || artifactKeys.has(key))) points.push(world.rootGate.point);
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
    marks.push(Object.freeze({ x: 48 + x * 120 + (seed % 49), y: 40 + y * 105 + ((seed >>> 6) % 43), kind: seed % 17 === 0 ? 'flower' : seed % 13 === 0 ? 'bush' : seed % 5 === 0 ? 'stone' : seed % 3 === 0 ? 'tuft-wide' : 'tuft' }));
  }
  return Object.freeze(marks);
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
  const blocked = playthingsOccupiedPoints(activeLeaves, actorPositions, structures);
  return nearestOrganicFreePoint(structureDoorPoint(structure), `spawn:${structure.artifactKey}:${seed}`, blocked, { minimumRadius: 32, maximumShell: 4, placeAnchor: structure.point, placeWeight: 0.52 });
}
function structureDoorPoint(structure) { const halfHeight = Number(structure?.footprint?.halfHeight || (structure.kind === 'workspace' ? 28 : 34)); return { x: structure.point.x, y: structure.point.y + halfHeight + 8 }; }
function structureApproachPoint(structure) { const door = structureDoorPoint(structure); return { x: door.x, y: door.y + 64 }; }
function motionPath(points = []) { const clean = uniquePoints((points || []).filter(Boolean)); return clean.map((point, index) => `${index ? 'L' : 'M'} ${round(point.x)} ${round(point.y)}`).join(' '); }
function uniquePoints(points = []) { const out = []; const seen = new Set(); for (const point of points) { if (!point) continue; const key = `${round(point.x)}:${round(point.y)}`; if (seen.has(key)) continue; seen.add(key); out.push({ x: Number(point.x), y: Number(point.y) }); } return out; }
function worldCenter() { return { x: PLAYTHINGS_WORLD_WIDTH / 2, y: PLAYTHINGS_WORLD_HEIGHT / 2 }; }
function clampPoint(point) { return { x: clamp(Number(point.x || 0), WORLD_PADDING, PLAYTHINGS_WORLD_WIDTH - WORLD_PADDING), y: clamp(Number(point.y || 0), WORLD_PADDING, PLAYTHINGS_WORLD_HEIGHT - WORLD_PADDING) }; }
function inBounds(point) { return point.x >= WORLD_PADDING && point.x <= PLAYTHINGS_WORLD_WIDTH - WORLD_PADDING && point.y >= WORLD_PADDING && point.y <= PLAYTHINGS_WORLD_HEIGHT - WORLD_PADDING; }
function isFree(point, blocked, candidateRadius = 0) { return !(blocked || []).some((other) => { const required = BLOCK_RADIUS + Number(candidateRadius || 0) + Number(other?.radius || 0); return distanceSquared(point, other) < required * required; }); }
function worldEdgePenalty(point) { const edge = Math.min(point.x, point.y, PLAYTHINGS_WORLD_WIDTH - point.x, PLAYTHINGS_WORLD_HEIGHT - point.y); return edge < 150 ? (150 - edge) * 0.55 : 0; }
function distanceSquared(a, b) { const dx = Number(a?.x || 0) - Number(b?.x || 0); const dy = Number(a?.y || 0) - Number(b?.y || 0); return dx * dx + dy * dy; }
function freezePoint(point) { return Object.freeze({ x: round(point.x), y: round(point.y) }); }
function round(value) { return Math.round(Number(value || 0) * 100) / 100; }
function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
function compareArtifacts(left = {}, right = {}) { const leftTime = sortableDate(left.createdAt); const rightTime = sortableDate(right.createdAt); if (leftTime !== rightTime) return leftTime - rightTime; return String(left.key || '').localeCompare(String(right.key || '')); }
function sortableDate(value) { const raw = String(value || '').trim(); if (!raw) return Number.MAX_SAFE_INTEGER; const stamp = Date.parse(raw.includes('T') ? raw : raw.replace(' ', 'T') + 'Z'); return Number.isFinite(stamp) ? stamp : Number.MAX_SAFE_INTEGER; }

function hashInteger(value) { let hash = 2166136261; for (const char of String(value || '')) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); } return hash >>> 0; }
