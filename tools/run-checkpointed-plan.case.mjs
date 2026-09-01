import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { runCheckpointedPlan } from './run-checkpointed-plan.mjs';

const root = mkdtempSync(join(tmpdir(), 'tiinex-checkpointed-plan-'));
const checkpointDir = join(root, 'checkpoint');
const steps = [
  { id: 'audit', command: 'synthetic-audit', args: ['--summary'] },
  { id: 'manufacture', command: 'synthetic-manufacture', args: ['--output', 'carrier.zip'] },
  { id: 'qualify-return', command: 'synthetic-qualify', args: ['carrier.zip'] }
];
const calls = [];
let manufactureAttempts = 0;
const first = await runCheckpointedPlan({
  cwd: root,
  steps,
  checkpointDir,
  heartbeatMs: 0,
  runStep: async (input) => {
    calls.push(input.label);
    if (input.label === 'manufacture') manufactureAttempts += 1;
    return {
      status: input.label === 'manufacture' ? 'failed' : 'completed',
      exitCode: input.label === 'manufacture' ? 1 : 0,
      elapsedMs: 5,
      stdoutTail: input.label === 'manufacture' ? '' : 'ok',
      stderrTail: input.label === 'manufacture' ? 'synthetic failure' : ''
    };
  }
});
assert.equal(first.status, 'failed');
assert.equal(first.executedSteps, 2);
assert.deepEqual(calls, ['audit', 'manufacture']);
let checkpoint = JSON.parse(readFileSync(join(checkpointDir, 'plan.json'), 'utf8'));
assert.equal(checkpoint.lastCompletedStep, 1);
assert.equal(checkpoint.failedStep, 2);

const secondCalls = [];
const second = await runCheckpointedPlan({
  cwd: root,
  steps,
  checkpointDir,
  resume: true,
  heartbeatMs: 0,
  runStep: async (input) => {
    secondCalls.push(input.label);
    return { status: 'completed', exitCode: 0, elapsedMs: 4, stdoutTail: 'resumed', stderrTail: '' };
  }
});
assert.equal(second.status, 'completed');
assert.equal(second.reusedCompletedSteps, 1);
assert.equal(second.executedSteps, 2);
assert.deepEqual(secondCalls, ['manufacture', 'qualify-return']);
checkpoint = JSON.parse(readFileSync(join(checkpointDir, 'plan.json'), 'utf8'));
assert.equal(checkpoint.status, 'completed');
assert.equal(checkpoint.lastCompletedStep, 3);

let unexpected = 0;
const third = await runCheckpointedPlan({
  cwd: root,
  steps,
  checkpointDir,
  resume: true,
  runStep: async () => { unexpected += 1; return { status: 'completed', exitCode: 0 }; }
});
assert.equal(third.reusedCompletedCheckpoint, true);
assert.equal(third.executedSteps, 0);
assert.equal(unexpected, 0);

await assert.rejects(
  () => runCheckpointedPlan({ cwd: root, steps: [...steps, { id: 'extra', command: 'changed' }], checkpointDir, resume: true, runStep: async () => ({ status: 'completed', exitCode: 0 }) }),
  /checkpoint\.stale/
);

console.log('✓ checkpointed plan resumes exact ordered steps without replaying completed closure work');

const cliRoot = mkdtempSync(join(tmpdir(), 'tiinex-checkpointed-plan-cli-'));
const cliPlanPath = join(cliRoot, 'plan.json');
const cliCheckpointDir = join(cliRoot, 'checkpoint');
const cliMarker = join(cliRoot, 'marker.txt');
writeFileSync(cliPlanPath, `${JSON.stringify({ steps: [
  { id: 'first', command: process.execPath, args: ['-e', `require('node:fs').appendFileSync(${JSON.stringify(cliMarker)}, 'first\\n')`] },
  { id: 'second', command: process.execPath, args: ['-e', `require('node:fs').appendFileSync(${JSON.stringify(cliMarker)}, 'second\\n')`] }
] }, null, 2)}\n`, 'utf8');
const cliPath = resolve('tools/run-checkpointed-plan.mjs');
const cliFirst = spawnSync(process.execPath, [cliPath, '--plan', cliPlanPath, '--checkpoint-dir', cliCheckpointDir, '--json'], { cwd: process.cwd(), encoding: 'utf8' });
assert.equal(cliFirst.status, 0, cliFirst.stderr);
const cliFirstReport = JSON.parse(cliFirst.stdout);
assert.equal(cliFirstReport.status, 'completed');
assert.equal(cliFirstReport.executedSteps, 2);
assert.equal(readFileSync(cliMarker, 'utf8'), 'first\nsecond\n');
const cliResume = spawnSync(process.execPath, [cliPath, '--plan', cliPlanPath, '--checkpoint-dir', cliCheckpointDir, '--resume', '--json'], { cwd: process.cwd(), encoding: 'utf8' });
assert.equal(cliResume.status, 0, cliResume.stderr);
const cliResumeReport = JSON.parse(cliResume.stdout);
assert.equal(cliResumeReport.reusedCompletedCheckpoint, true);
assert.equal(cliResumeReport.executedSteps, 0);
assert.equal(readFileSync(cliMarker, 'utf8'), 'first\nsecond\n');

