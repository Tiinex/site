import assert from 'node:assert/strict';
import { planPlaythingsEventMotion, pointOnPolyline, samplePlaythingsEventMotion } from './playthings.motion.js';

const projection = { motionPoints: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }] };
const event = { id: 'artifact:a', kind: 'split', interactionKind: 'work' };
const plan = planPlaythingsEventMotion(event, projection, { eventCount: 20 });
assert.equal(plan.totalMs > 0, true);
assert.equal(plan.travelMs > 0, true);
assert.deepEqual(pointOnPolyline(projection.motionPoints, 0), { x: 0, y: 0 });
assert.deepEqual(pointOnPolyline(projection.motionPoints, 1), { x: 100, y: 100 });
const duringTravel = samplePlaythingsEventMotion(plan, plan.anticipateMs + plan.travelMs / 2);
assert.equal(duringTravel.moving, true);
assert.equal(duringTravel.position.x >= 0 && duringTravel.position.x <= 100, true);
assert.equal(duringTravel.position.y >= 0 && duringTravel.position.y <= 100, true);
const interacting = samplePlaythingsEventMotion(plan, plan.anticipateMs + plan.travelMs + plan.interactionMs / 2);
assert.equal(interacting.phase, 'interact');
assert.equal(interacting.sceneOpacity > 0, true);
assert.equal(samplePlaythingsEventMotion(plan, plan.totalMs).done, true);
console.log('✓ Playthings continuous motion planning and sampling passed');

const forkProjection = {
  motionPoints: [{ x: 80, y: 0 }, { x: 0, y: 0 }],
  fork: {
    branchPoint: { x: 0, y: 0 },
    approachPoints: [{ x: 80, y: 0 }, { x: 0, y: 0 }],
    arms: [
      { kind: 'sleep-return', artifactKey: 'old', points: [{ x: 0, y: 0 }, { x: -70, y: 10 }] },
      { kind: 'continuation', artifactKey: 'old', points: [{ x: 0, y: 0 }, { x: 80, y: 0 }] },
      { kind: 'sibling', artifactKey: 'new', points: [{ x: 0, y: 0 }, { x: 35, y: 75 }] }
    ]
  }
};
const forkPlan = planPlaythingsEventMotion(event, forkProjection, { eventCount: 20 });
assert.ok(forkPlan.forkBeatMs > 0 && forkPlan.forkTravelMs > 0, 'fork choreography includes a shared split beat and concurrent fan-out phase');
const atFork = samplePlaythingsEventMotion(forkPlan, forkPlan.anticipateMs + forkPlan.travelMs + forkPlan.forkBeatMs / 2);
assert.equal(atFork.phase, 'fork');
assert.equal(atFork.forkActors.length, 3);
assert.ok(atFork.forkActors.every((actor) => actor.position.x === 0 && actor.position.y === 0), 'all three Playthings overlap at the actual fork before departing');
const duringFork = samplePlaythingsEventMotion(forkPlan, forkPlan.anticipateMs + forkPlan.travelMs + forkPlan.forkBeatMs + forkPlan.forkTravelMs / 2);
assert.equal(duringFork.phase, 'fork-travel');
assert.equal(duringFork.forkActors.length, 3);
assert.ok(new Set(duringFork.forkActors.map((actor) => `${Math.round(actor.position.x)}:${Math.round(actor.position.y)}`)).size >= 2, 'three fork actors depart concurrently along their independent trajectories');
