#!/usr/bin/env node
import assert from 'node:assert/strict';
import { runToolingIterationGate } from './run-tooling-iteration-gate.mjs';

const steps = [
  { id: 'one', command: 'node', args: ['one.mjs'] },
  { id: 'two', command: 'node', args: ['two.mjs'] },
  { id: 'three', command: 'node', args: ['three.mjs'] }
];
const calls = [];
const passing = runToolingIterationGate({ steps, spawn(command, args) { calls.push([command, ...args]); return { status: 0, stdout: 'ok', stderr: '' }; } });
assert.equal(passing.status, 'passed');
assert.equal(passing.executedSteps, 3);
assert.equal(passing.configuredSteps, 3);
assert.equal(passing.fullValidationRequiredForClosure, true);
assert.deepEqual(calls, [['node', 'one.mjs'], ['node', 'two.mjs'], ['node', 'three.mjs']]);

const failedCalls = [];
const failing = runToolingIterationGate({ steps, spawn(command, args) {
  failedCalls.push([command, ...args]);
  return { status: args[0] === 'two.mjs' ? 2 : 0, stdout: '', stderr: args[0] === 'two.mjs' ? 'boom' : '' };
} });
assert.equal(failing.status, 'failed');
assert.equal(failing.executedSteps, 2);
assert.equal(failing.results[1].exitCode, 2);
assert.equal(failing.results[1].stderr, 'boom');
assert.deepEqual(failedCalls, [['node', 'one.mjs'], ['node', 'two.mjs']]);

console.log('✓ tooling iteration gate reports per-step timing and stops on first failure');
