#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const CHECKPOINT_SCHEMA = 'tiinex.site.checkpointed-command.v1';
const REPORT_SCHEMA = 'tiinex.site.checkpointed-command-run.v1';

export function checkpointedOperationId({ cwd = process.cwd(), command = '', args = [] } = {}) {
  const canonical = JSON.stringify({ cwd: resolve(cwd), command: String(command), args: args.map(String) });
  return createHash('sha256').update(canonical).digest('hex');
}

export async function runCheckpointedCommand({
  cwd = process.cwd(),
  command = '',
  args = [],
  label = '',
  checkpointPath,
  resume = false,
  heartbeatMs = 1000,
  timeoutMs = 0,
  captureLimit = 4000,
  execute = defaultExecute,
  now = () => new Date(),
  nowNs = () => process.hrtime.bigint(),
  onChildOutput = () => {}
} = {}) {
  const normalizedCommand = String(command || '').trim();
  if (!normalizedCommand) throw new Error('checkpointed-command.command.required');
  if (!checkpointPath) throw new Error('checkpointed-command.checkpoint.required');
  const normalizedArgs = args.map(String);
  const absoluteCwd = resolve(cwd);
  const absoluteCheckpoint = resolve(checkpointPath);
  const operationId = checkpointedOperationId({ cwd: absoluteCwd, command: normalizedCommand, args: normalizedArgs });
  const existing = readCheckpoint(absoluteCheckpoint);
  if (existing && existing.operationId !== operationId) throw new Error('checkpointed-command.checkpoint.stale');
  if (existing && !resume) throw new Error('checkpointed-command.checkpoint.exists-use-resume');
  if (existing?.status === 'completed' && resume) {
    return Object.freeze({
      schema: REPORT_SCHEMA,
      status: 'completed',
      operationId,
      checkpointPath: absoluteCheckpoint,
      attempt: Number(existing.attempt || 1),
      reusedCompletedCheckpoint: true,
      exitCode: Number(existing.exitCode || 0),
      elapsedMs: Number(existing.elapsedMs || 0)
    });
  }

  const attempt = Number(existing?.attempt || 0) + 1;
  const started = now();
  const startedNs = nowNs();
  let heartbeatCount = 0;
  let state = checkpointValue({
    operationId,
    label,
    cwd: absoluteCwd,
    command: normalizedCommand,
    args: normalizedArgs,
    status: 'running',
    attempt,
    startedAt: started.toISOString(),
    lastHeartbeatAt: started.toISOString(),
    priorStatus: existing?.status || '',
    priorAttempt: Number(existing?.attempt || 0)
  });
  writeCheckpoint(absoluteCheckpoint, state);

  const interval = Math.max(0, Number(heartbeatMs || 0));
  const heartbeat = interval > 0 ? setInterval(() => {
    heartbeatCount += 1;
    state = Object.freeze({ ...state, lastHeartbeatAt: now().toISOString(), heartbeatCount });
    writeCheckpoint(absoluteCheckpoint, state);
  }, interval) : null;
  heartbeat?.unref?.();

  let execution;
  try {
    execution = await execute({
      cwd: absoluteCwd,
      command: normalizedCommand,
      args: normalizedArgs,
      timeoutMs: Math.max(0, Number(timeoutMs || 0)),
      captureLimit: Math.max(0, Number(captureLimit || 0)),
      onChildOutput
    });
  } catch (error) {
    execution = { exitCode: 1, signal: '', timedOut: false, stdoutTail: '', stderrTail: error instanceof Error ? error.message : String(error) };
  } finally {
    if (heartbeat) clearInterval(heartbeat);
  }

  const elapsedMs = toMs(nowNs() - startedNs);
  const exitCode = normalizeExitCode(execution?.exitCode);
  const status = execution?.timedOut ? 'timed-out' : exitCode === 0 ? 'completed' : 'failed';
  const finishedAt = now().toISOString();
  state = checkpointValue({
    operationId,
    label,
    cwd: absoluteCwd,
    command: normalizedCommand,
    args: normalizedArgs,
    status,
    attempt,
    startedAt: started.toISOString(),
    lastHeartbeatAt: finishedAt,
    finishedAt,
    heartbeatCount,
    elapsedMs,
    exitCode,
    signal: String(execution?.signal || ''),
    timedOut: Boolean(execution?.timedOut),
    stdoutTail: String(execution?.stdoutTail || ''),
    stderrTail: String(execution?.stderrTail || ''),
    priorStatus: existing?.status || '',
    priorAttempt: Number(existing?.attempt || 0)
  });
  writeCheckpoint(absoluteCheckpoint, state);

  return Object.freeze({
    schema: REPORT_SCHEMA,
    status,
    operationId,
    checkpointPath: absoluteCheckpoint,
    attempt,
    reusedCompletedCheckpoint: false,
    exitCode,
    signal: state.signal,
    timedOut: state.timedOut,
    elapsedMs,
    heartbeatCount,
    stdoutTail: state.stdoutTail,
    stderrTail: state.stderrTail
  });
}

function checkpointValue(value) {
  return Object.freeze({ schema: CHECKPOINT_SCHEMA, ...value });
}

export function writeCheckpoint(path, value) {
  const absolute = resolve(path);
  mkdirSync(dirname(absolute), { recursive: true });
  const temporary = `${absolute}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  renameSync(temporary, absolute);
}

export function readCheckpoint(path) {
  const absolute = resolve(path);
  return existsSync(absolute) ? JSON.parse(readFileSync(absolute, 'utf8')) : null;
}

async function defaultExecute({ cwd, command, args, timeoutMs, captureLimit, onChildOutput }) {
  return new Promise((resolveExecution, rejectExecution) => {
    const child = spawn(command, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdoutTail = '';
    let stderrTail = '';
    let timedOut = false;
    let forceKill = null;
    const append = (current, chunk) => tail(`${current}${chunk}`, captureLimit);
    child.stdout?.on('data', (chunk) => {
      const text = chunk.toString();
      stdoutTail = append(stdoutTail, text);
      onChildOutput('stdout', text);
    });
    child.stderr?.on('data', (chunk) => {
      const text = chunk.toString();
      stderrTail = append(stderrTail, text);
      onChildOutput('stderr', text);
    });
    child.once('error', rejectExecution);
    const timeout = timeoutMs > 0 ? setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
      forceKill = setTimeout(() => child.kill('SIGKILL'), 2000);
      forceKill.unref?.();
    }, timeoutMs) : null;
    timeout?.unref?.();
    child.once('close', (code, signal) => {
      if (timeout) clearTimeout(timeout);
      if (forceKill) clearTimeout(forceKill);
      resolveExecution({
        exitCode: Number.isInteger(code) ? code : timedOut ? 124 : 1,
        signal: signal || '',
        timedOut,
        stdoutTail,
        stderrTail
      });
    });
  });
}

function tail(value, limit) {
  if (!limit) return '';
  return value.length > limit ? value.slice(-limit) : value;
}
function normalizeExitCode(value) { return Number.isInteger(value) ? value : 1; }
function toMs(nanoseconds) { return Math.round((Number(nanoseconds) / 1_000_000) * 1000) / 1000; }

function parseArgs(argv) {
  const out = { checkpoint: '', label: '', resume: false, heartbeatMs: 1000, timeoutMs: 0, json: false, cwd: process.cwd(), command: '', args: [] };
  const separator = argv.indexOf('--');
  const flags = separator >= 0 ? argv.slice(0, separator) : argv;
  const commandParts = separator >= 0 ? argv.slice(separator + 1) : [];
  for (let index = 0; index < flags.length; index += 1) {
    const arg = flags[index];
    if (arg === '--checkpoint') out.checkpoint = flags[++index];
    else if (arg === '--label') out.label = flags[++index];
    else if (arg === '--resume') out.resume = true;
    else if (arg === '--heartbeat-ms') out.heartbeatMs = Number(flags[++index]);
    else if (arg === '--timeout-ms') out.timeoutMs = Number(flags[++index]);
    else if (arg === '--cwd') out.cwd = flags[++index];
    else if (arg === '--json') out.json = true;
    else if (arg === '--help' || arg === '-h') out.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  out.command = commandParts[0] || '';
  out.args = commandParts.slice(1);
  return out;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) {
      console.log('Usage: node tools/run-checkpointed-command.mjs --checkpoint <file.json> [--label <name>] [--resume] [--heartbeat-ms 1000] [--timeout-ms N] [--cwd <dir>] [--json] -- <command> [args...]');
      process.exit(0);
    }
    const report = await runCheckpointedCommand({
      ...options,
      checkpointPath: options.checkpoint,
      onChildOutput: options.json ? () => {} : (stream, text) => (stream === 'stderr' ? process.stderr : process.stdout).write(text)
    });
    if (options.json) console.log(JSON.stringify(report, null, 2));
    else console.log(`Checkpointed command ${report.status}; attempt ${report.attempt}; ${report.elapsedMs.toFixed(3)} ms; checkpoint ${report.checkpointPath}`);
    process.exit(report.status === 'completed' ? 0 : report.timedOut ? 124 : report.exitCode || 1);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
