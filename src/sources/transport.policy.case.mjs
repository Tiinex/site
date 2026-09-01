import assert from 'node:assert/strict';
import { authorizeSourceTransport, buildSourceTransportPolicy, summarizeSourceTransportOutcomes } from './transport.policy.js';

const policy = buildSourceTransportPolicy({ maxRequestsPerOperation: 2, now: '2026-07-21T10:00:00.000Z' });
assert.equal(policy.schema, 'tiinex.sourceTransport.policy.v1');
assert.equal(policy.maxRequestsPerOperation, 2);
assert(policy.boundary.includes('does not infer provenance'));

const allowed = authorizeSourceTransport({ kind: 'github.raw', sourceId: 'gh', adapterId: 'github', requestedRequests: 2 }, policy);
assert.equal(allowed.allowed, true);
assert.equal(allowed.status, 'allowed');

const overBudget = authorizeSourceTransport({ kind: 'github.raw', sourceId: 'gh', adapterId: 'github', requestedRequests: 3 }, policy);
assert.equal(overBudget.allowed, false);
assert.equal(overBudget.status, 'blocked');
assert.equal(overBudget.findings[0].code, 'transport.policy.request-budget-exceeded');
assert.equal(overBudget.findings[0].retryable, false);

const cooldown = authorizeSourceTransport(
  { kind: 'github.discovery', sourceId: 'gh', adapterId: 'github', requestedRequests: 1 },
  { cooldownUntil: '2026-07-21T11:00:00.000Z', now: '2026-07-21T10:00:00.000Z' }
);
assert.equal(cooldown.allowed, false);
assert.equal(cooldown.findings[0].code, 'transport.policy.cooldown-active');
assert.equal(cooldown.findings[0].retryable, true);

const offline = authorizeSourceTransport({ requestedRequests: 1 }, { offline: true });
assert.equal(offline.allowed, false);
assert.equal(offline.findings[0].code, 'transport.policy.offline');

const summary = summarizeSourceTransportOutcomes([allowed, overBudget, cooldown]);
assert.equal(summary.schema, 'tiinex.sourceTransport.policy.summary.v1');
assert.equal(summary.status, 'degraded');
assert.equal(summary.counts.operations, 3);
assert.equal(summary.counts.allowed, 1);
assert.equal(summary.counts.blocked, 2);
assert.equal(summary.counts.retryable, 1);

console.log('source transport policy: ok');
