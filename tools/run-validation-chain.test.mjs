#!/usr/bin/env node
import assert from 'node:assert/strict';
import { runValidationChain, splitValidationChain, validationChainId } from './run-validation-chain.mjs';

const script = 'node one.mjs && node two.mjs && node three.mjs';
assert.deepEqual(splitValidationChain(script), ['node one.mjs', 'node two.mjs', 'node three.mjs']);
assert.equal(validationChainId('validate', script).length, 64);

let tick = 0n;
const checkpoints = [];
const first = runValidationChain({
  script,
  through: 2,
  execute: () => ({ status: 0 }),
  onCheckpoint: (value) => checkpoints.push(value),
  nowNs: () => { tick += 1_000_000n; return tick; }
});
assert.equal(first.status, 'passed');
assert.deepEqual(first.results.map((item) => item.stepNumber), [1, 2]);
assert.equal(checkpoints.at(-1).lastCompletedStep, 2);

const resumedCalls = [];
const resumed = runValidationChain({
  script,
  resumeState: checkpoints.at(-1),
  execute: (command) => { resumedCalls.push(command); return { status: 0 }; }
});
assert.equal(resumed.status, 'passed');
assert.deepEqual(resumedCalls, ['node three.mjs']);

const failedCheckpoints = [];
const failed = runValidationChain({
  script,
  execute: (command) => ({ status: command.includes('two') ? 7 : 0 }),
  onCheckpoint: (value) => failedCheckpoints.push(value)
});
assert.equal(failed.status, 'failed');
assert.equal(failed.executedSteps, 2);
assert.equal(failedCheckpoints.at(-1).lastCompletedStep, 1);
assert.equal(failedCheckpoints.at(-1).failedStep, 2);

assert.throws(() => runValidationChain({ script, resumeState: { chainId: 'stale', lastCompletedStep: 1 } }), /checkpoint\.stale/);
console.log('✓ validation chain runner checkpoints completed steps and resumes without replay');
