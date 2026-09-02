import assert from 'node:assert/strict';
import { playthingsLeafIdleState, playthingsPlayheadTime } from './playthings.clock.js';

const event = { at: '2026-09-02 12:00:00' };
const historical = playthingsPlayheadTime({ phase: 'playing', atNow: false, currentEvent: event, nowMs: Date.parse('2026-09-10T00:00:00Z') });
assert.equal(historical.mode, 'historical');
assert.equal(historical.ms, Date.parse('2026-09-02T12:00:00Z'), 'playback time follows the current artifact event, not wall-clock time');
const pausedAtNow = playthingsPlayheadTime({ phase: 'paused', atNow: true, currentEvent: event, nowMs: Date.parse('2026-09-10T00:00:00Z') });
assert.equal(pausedAtNow.mode, 'historical', 'paused playback remains at the historical playhead even when the cursor is at the end');
const live = playthingsPlayheadTime({ phase: 'settled', atNow: true, currentEvent: event, nowMs: Date.parse('2026-09-10T00:00:00Z') });
assert.equal(live.mode, 'live');
assert.equal(live.ms, Date.parse('2026-09-10T00:00:00Z'));

const born = '2026-09-01 00:00:00';
assert.equal(playthingsLeafIdleState(born, Date.parse('2026-09-03T23:59:00Z')).state, 'normal');
assert.equal(playthingsLeafIdleState(born, Date.parse('2026-09-05T00:00:00Z')).state, 'long-idle');
assert.equal(playthingsLeafIdleState(born, Date.parse('2026-09-08T00:00:00Z')).state, 'long-idle');
assert.equal(playthingsLeafIdleState(born, Date.parse('2026-09-08T00:00:01Z')).state, 'resting');
console.log('✓ Playthings relative clock and idle thresholds passed');
