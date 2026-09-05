export const PLAYTHINGS_MOTION_SCHEMA = 'tiinex.playthings.motion.experimental.v1';

/**
 * Builds a presentation-only motion plan for one observed lineage event.
 * Durations are intentionally physical-ish (distance matters) but bounded so a
 * long history remains watchable. No timing decision changes Tiinex semantics.
 */
export function planPlaythingsEventMotion(event = {}, projection = {}, options = {}) {
  const points = Array.isArray(projection.motionPoints) && projection.motionPoints.length
    ? projection.motionPoints.map(pointCopy)
    : [projection.actorPoint || projection.scenePoint].filter(Boolean).map(pointCopy);
  const eventCount = Math.max(1, Number(options.eventCount || 1));
  const density = clamp(110 / eventCount, 0.55, 1);
  const distance = polylineLength(points);
  const isSpawn = event.kind === 'spawn';
  const isSplit = event.kind === 'split';
  const interactionKind = String(event.interactionKind || 'inspect');

  const anticipateMs = isSpawn ? 80 : Math.round((isSplit ? 190 : 105) * density);
  const travelMs = isSpawn ? 0 : Math.round(clamp(distance / 0.72, 190, 900) * density);
  const interactionBase = ['work', 'build'].includes(interactionKind) ? 500
    : ['receive', 'pass', 'connect'].includes(interactionKind) ? 400
      : ['observe', 'read', 'decide', 'preserve', 'attest'].includes(interactionKind) ? 340
        : 280;
  const interactionMs = Math.round(clamp(interactionBase * density, 190, 520));
  const settleMs = Math.round(clamp(105 * density, 65, 110));
  const totalMs = Math.max(1, anticipateMs + travelMs + interactionMs + settleMs);

  return Object.freeze({
    schema: PLAYTHINGS_MOTION_SCHEMA,
    eventId: event.id || '',
    points: Object.freeze(points.map((point) => Object.freeze(point))),
    distance,
    anticipateMs,
    travelMs,
    interactionMs,
    settleMs,
    totalMs,
    isSpawn,
    isSplit
  });
}

export function samplePlaythingsEventMotion(plan = {}, elapsedInput = 0) {
  const totalMs = Math.max(1, Number(plan.totalMs || 1));
  const elapsedMs = clamp(Number(elapsedInput || 0), 0, totalMs);
  const anticipateEnd = Number(plan.anticipateMs || 0);
  const travelEnd = anticipateEnd + Number(plan.travelMs || 0);
  const interactionEnd = travelEnd + Number(plan.interactionMs || 0);
  const points = Array.isArray(plan.points) ? plan.points : [];
  const start = points[0] || { x: 0, y: 0 };
  const finish = points[points.length - 1] || start;

  let phase = 'settle';
  let phaseProgress = 1;
  let position = finish;
  let moving = false;
  let interactionProgress = 0;

  if (elapsedMs < anticipateEnd) {
    phase = plan.isSpawn ? 'spawn' : plan.isSplit ? 'split' : 'anticipate';
    phaseProgress = unit(elapsedMs, 0, anticipateEnd);
    position = start;
  } else if (elapsedMs < travelEnd && Number(plan.travelMs || 0) > 0) {
    phase = 'travel';
    phaseProgress = unit(elapsedMs, anticipateEnd, travelEnd);
    position = pointOnPolyline(points, smoothstep(phaseProgress));
    moving = true;
  } else if (elapsedMs < interactionEnd) {
    phase = 'interact';
    phaseProgress = unit(elapsedMs, travelEnd, interactionEnd);
    interactionProgress = phaseProgress;
    position = finish;
  } else {
    phase = 'settle';
    phaseProgress = unit(elapsedMs, interactionEnd, totalMs);
    interactionProgress = 1;
    position = finish;
  }

  const tangent = moving ? tangentOnPolyline(points, smoothstep(phaseProgress)) : lastTangent(points);
  const facing = tangent.x < -0.001 ? -1 : 1;
  const walkPhase = moving ? (elapsedMs / 115) * Math.PI * 2 : 0;
  const bob = moving ? -Math.abs(Math.sin(walkPhase)) * 2.2 : 0;
  const lean = moving ? clamp(tangent.x / Math.max(1, Math.hypot(tangent.x, tangent.y)), -1, 1) * 0.06 : 0;
  const spawnScale = plan.isSpawn && phase === 'spawn' ? spawnEase(phaseProgress) : 1;
  const anticipationScaleY = phase === 'anticipate' || phase === 'split' ? 1 - Math.sin(phaseProgress * Math.PI) * 0.09 : 1;
  const anticipationScaleX = phase === 'anticipate' || phase === 'split' ? 1 + Math.sin(phaseProgress * Math.PI) * 0.07 : 1;

  return Object.freeze({
    elapsedMs,
    progress: elapsedMs / totalMs,
    phase,
    phaseProgress,
    position: Object.freeze(pointCopy(position)),
    moving,
    facing,
    bob,
    lean,
    scaleX: facing * spawnScale * anticipationScaleX,
    scaleY: spawnScale * anticipationScaleY,
    interactionProgress,
    sceneOpacity: phase === 'interact' ? scenePulse(phaseProgress) : phase === 'settle' ? 1 - phaseProgress : 0,
    structureProgress: phase === 'interact' || phase === 'settle' ? smoothstep(interactionProgress) : 0,
    splitFlash: plan.isSplit && phase === 'split' ? Math.sin(phaseProgress * Math.PI) : 0,
    dustOpacity: moving ? 0.18 + Math.abs(Math.sin(walkPhase)) * 0.28 : 0,
    done: elapsedMs >= totalMs
  });
}

export function pointOnPolyline(points = [], tInput = 0) {
  if (!points.length) return { x: 0, y: 0 };
  if (points.length === 1) return pointCopy(points[0]);
  const t = clamp(Number(tInput || 0), 0, 1);
  const lengths = segmentLengths(points);
  const total = lengths.reduce((sum, value) => sum + value, 0);
  if (!total) return pointCopy(points[points.length - 1]);
  let remaining = total * t;
  for (let index = 0; index < lengths.length; index += 1) {
    const length = lengths[index];
    if (remaining <= length || index === lengths.length - 1) {
      const local = length ? remaining / length : 1;
      return lerpPoint(points[index], points[index + 1], clamp(local, 0, 1));
    }
    remaining -= length;
  }
  return pointCopy(points[points.length - 1]);
}

function tangentOnPolyline(points = [], tInput = 0) {
  if (points.length < 2) return { x: 1, y: 0 };
  const t = clamp(Number(tInput || 0), 0, 1);
  const lengths = segmentLengths(points);
  const total = lengths.reduce((sum, value) => sum + value, 0);
  if (!total) return lastTangent(points);
  let remaining = total * t;
  for (let index = 0; index < lengths.length; index += 1) {
    const length = lengths[index];
    if (remaining <= length || index === lengths.length - 1) return delta(points[index], points[index + 1]);
    remaining -= length;
  }
  return lastTangent(points);
}

function lastTangent(points = []) {
  return points.length >= 2 ? delta(points[points.length - 2], points[points.length - 1]) : { x: 1, y: 0 };
}
function delta(a, b) { return { x: Number(b?.x || 0) - Number(a?.x || 0), y: Number(b?.y || 0) - Number(a?.y || 0) }; }
function segmentLengths(points = []) { return points.slice(0, -1).map((point, index) => Math.hypot(Number(points[index + 1]?.x || 0) - Number(point?.x || 0), Number(points[index + 1]?.y || 0) - Number(point?.y || 0))); }
function polylineLength(points = []) { return segmentLengths(points).reduce((sum, value) => sum + value, 0); }
function lerpPoint(a, b, t) { return { x: Number(a?.x || 0) + (Number(b?.x || 0) - Number(a?.x || 0)) * t, y: Number(a?.y || 0) + (Number(b?.y || 0) - Number(a?.y || 0)) * t }; }
function pointCopy(point = {}) { return { x: round(point.x), y: round(point.y) }; }
function smoothstep(t) { const x = clamp(t, 0, 1); return x * x * (3 - 2 * x); }
function spawnEase(t) { const x = clamp(t, 0, 1); return x < 0.72 ? 1.12 * Math.sin((x / 0.72) * Math.PI / 2) : 1 + 0.12 * Math.cos(((x - 0.72) / 0.28) * Math.PI / 2); }
function scenePulse(t) { const x = clamp(t, 0, 1); if (x < 0.18) return smoothstep(x / 0.18); if (x > 0.82) return 1 - smoothstep((x - 0.82) / 0.18) * 0.3; return 1; }
function unit(value, start, end) { return end <= start ? 1 : clamp((value - start) / (end - start), 0, 1); }
function round(value) { return Math.round(Number(value || 0) * 1000) / 1000; }
function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
