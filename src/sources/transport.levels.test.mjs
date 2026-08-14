import assert from 'node:assert/strict';
import { normalizeTransportLevel, resolveTransportPlan, transportLevelsAtOrBelow } from './transport.levels.js';

assert.equal(normalizeTransportLevel('tl2'), 'TL2');
assert.deepEqual(transportLevelsAtOrBelow('TL2'), ['TL0', 'TL1', 'TL2']);

const githubRead = resolveTransportPlan({ transportLevels: { 'read-known': 'TL1', 'list-scope': 'TL2', write: 'TL0' } }, 'read-known');
assert.equal(githubRead.schema, 'tiinex.transport.operationPlan.v1');
assert.equal(githubRead.selectedLevel, 'TL1');
assert.deepEqual(githubRead.fallbackLevels, ['TL0']);
assert.equal(githubRead.credentialMaterialIncluded, false);

const capped = resolveTransportPlan({ transportLevels: { write: 'TL0' } }, 'write', { requestedLevel: 'TL3' });
assert.equal(capped.selectedLevel, 'TL0', 'transport must not silently upgrade above configured level');

const auth = resolveTransportPlan({ transportLevels: { write: 'TL3' }, authProvider: 'github-sso' }, 'write');
assert.equal(auth.selectedLevel, 'TL3');
assert.equal(auth.authRequired, true);
assert.equal(auth.authProvider, 'github-sso');
assert.equal(auth.status, 'ready');

const unsafe = resolveTransportPlan({ transportLevels: { write: 'TL3' }, token: 'secret' }, 'write');
assert.equal(unsafe.status, 'blocked');
assert.equal(unsafe.credentialMaterialIncluded, true, 'source config must not carry credential material');

console.log('✓ transport level tests passed');
