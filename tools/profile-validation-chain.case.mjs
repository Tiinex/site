#!/usr/bin/env node
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { profileValidationChain, writeValidationProfileCheckpoint } from './profile-validation-chain.mjs';

let tick = 0n;
const script = 'node one.mjs && node two.mjs && node three.mjs && node four.mjs';
const report = profileValidationChain({
  script,
  from: 2,
  through: 4,
  execute(command) { return { status: command.includes('three') ? 5 : 0, stdout: '', stderr: command.includes('three') ? 'failure' : '' }; },
  nowNs() { tick += 1_000_000n; return tick; }
});
assert.equal(report.configuredSteps, 4);
assert.equal(report.profiledSteps, 3);
assert.equal(report.failures, 1);
assert.deepEqual(report.results.map((item) => item.stepNumber), [2, 3, 4]);
assert.equal(report.results[1].exitCode, 5);
assert.match(report.results[1].failureOutput, /failure/);

const root = mkdtempSync(join(tmpdir(), 'tiinex-validation-profile-'));
const checkpointPath = join(root, 'profile.json');
let checkpoint = null;
let checkpointTick = 0n;
const first = profileValidationChain({
  scriptName: 'validate',
  script,
  batchSize: 2,
  execute(command) { return { status: command.includes('two') ? 3 : 0, stdout: '', stderr: command.includes('two') ? 'two failed' : '' }; },
  onCheckpoint(value) { checkpoint = value; writeValidationProfileCheckpoint(checkpointPath, value); },
  nowNs() { checkpointTick += 1_000_000n; return checkpointTick; }
});
assert.equal(first.profiledSteps, 2);
assert.equal(first.nextFromStep, 3);
assert.equal(first.remainingSteps, 2);
assert.equal(first.cumulativeProfiledSteps, 2);
assert.equal(first.cumulativeFailures, 1);
assert.deepEqual(checkpoint.failureSteps, [2]);
assert.equal(JSON.parse(readFileSync(checkpointPath, 'utf8')).lastProfiledStep, 2);

const secondCalls = [];
const second = profileValidationChain({
  scriptName: 'validate',
  script,
  batchSize: 2,
  resumeState: checkpoint,
  execute(command, step) { secondCalls.push(step); return { status: 0, stdout: '', stderr: '' }; },
  onCheckpoint(value) { checkpoint = value; },
  nowNs() { checkpointTick += 1_000_000n; return checkpointTick; }
});
assert.deepEqual(secondCalls, [3, 4]);
assert.equal(second.checkpointComplete, true);
assert.equal(second.nextFromStep, 0);
assert.equal(second.cumulativeProfiledSteps, 4);
assert.equal(second.cumulativeFailures, 1);
assert.deepEqual(checkpoint.failureSteps, [2]);

const completed = profileValidationChain({ scriptName: 'validate', script, resumeState: checkpoint, execute() { throw new Error('must not execute'); } });
assert.equal(completed.reusedCompletedCheckpoint, true);
assert.equal(completed.profiledSteps, 0);
assert.equal(completed.cumulativeProfiledSteps, 4);

assert.throws(() => profileValidationChain({ scriptName: 'validate', script: `${script} && node changed.mjs`, resumeState: checkpoint }), /checkpoint\.stale/);
console.log('✓ validation-chain profiler supports bounded restartable batches and continues across failures');
