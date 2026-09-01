import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runCheckpointedCommand } from './run-checkpointed-command.mjs';

const root = mkdtempSync(join(tmpdir(), 'tiinex-checkpointed-command-'));
const checkpoint = join(root, 'run.json');
let executions = 0;

const first = await runCheckpointedCommand({
  cwd: root,
  command: 'synthetic-command',
  args: ['alpha'],
  checkpointPath: checkpoint,
  heartbeatMs: 5,
  execute: async () => {
    executions += 1;
    const running = JSON.parse(readFileSync(checkpoint, 'utf8'));
    assert.equal(running.status, 'running');
    assert.equal(running.attempt, 1);
    await new Promise((resolve) => setTimeout(resolve, 18));
    const heartbeat = JSON.parse(readFileSync(checkpoint, 'utf8'));
    assert.equal(heartbeat.status, 'running');
    assert.ok(heartbeat.heartbeatCount >= 1);
    return { exitCode: 0, signal: '', timedOut: false, stdoutTail: 'ok', stderrTail: '' };
  }
});
assert.equal(first.status, 'completed');
assert.equal(first.exitCode, 0);
assert.equal(executions, 1);
const completed = JSON.parse(readFileSync(checkpoint, 'utf8'));
assert.equal(completed.status, 'completed');
assert.equal(completed.stdoutTail, 'ok');

const resumedCompleted = await runCheckpointedCommand({
  cwd: root,
  command: 'synthetic-command',
  args: ['alpha'],
  checkpointPath: checkpoint,
  resume: true,
  execute: async () => { executions += 1; return { exitCode: 0 }; }
});
assert.equal(resumedCompleted.reusedCompletedCheckpoint, true);
assert.equal(executions, 1);

await assert.rejects(
  () => runCheckpointedCommand({ cwd: root, command: 'different-command', checkpointPath: checkpoint, resume: true, execute: async () => ({ exitCode: 0 }) }),
  /checkpoint\.stale/
);

const interruptedCheckpoint = join(root, 'interrupted.json');
let interruptedExecutions = 0;
const seed = await runCheckpointedCommand({
  cwd: root,
  command: 'restartable-command',
  checkpointPath: interruptedCheckpoint,
  execute: async () => ({ exitCode: 1, signal: 'SIGTERM', timedOut: false, stdoutTail: '', stderrTail: 'interrupted' })
});
assert.equal(seed.status, 'failed');
const resumed = await runCheckpointedCommand({
  cwd: root,
  command: 'restartable-command',
  checkpointPath: interruptedCheckpoint,
  resume: true,
  execute: async () => { interruptedExecutions += 1; return { exitCode: 0, signal: '', timedOut: false, stdoutTail: 'resumed', stderrTail: '' }; }
});
assert.equal(resumed.status, 'completed');
assert.equal(resumed.attempt, 2);
assert.equal(interruptedExecutions, 1);

console.log('✓ checkpointed command writes durable running/heartbeat/completion receipts and resumes only exact operations');
