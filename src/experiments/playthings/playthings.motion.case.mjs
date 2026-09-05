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
