#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export function splitValidationChain(script = '') {
  return String(script || '').split(/\s+&&\s+/).map((item) => item.trim()).filter(Boolean);
}

export function validationChainId(scriptName, script) {
  return createHash('sha256').update(`${scriptName}\n${script}`).digest('hex');
}

export function runValidationChain({
  scriptName = 'validate',
  script = '',
  startAt = 1,
  through = Infinity,
  resumeState = null,
  execute = defaultExecute,
  onCheckpoint = () => {},
  nowNs = () => process.hrtime.bigint()
} = {}) {
  const commands = splitValidationChain(script);
  const chainId = validationChainId(scriptName, script);
  if (resumeState && resumeState.chainId !== chainId) throw new Error('validation-chain.checkpoint.stale');
  const resumeFrom = resumeState ? Number(resumeState.lastCompletedStep || 0) + 1 : 1;
  const firstStep = Math.max(1, Number(startAt || 1), resumeFrom);
  const lastStep = Math.min(commands.length, Number.isFinite(Number(through)) ? Number(through) : commands.length);
  const results = [];
  const runStartedAt = nowNs();
  let status = 'passed';

  for (let stepNumber = firstStep; stepNumber <= lastStep; stepNumber += 1) {
    const command = commands[stepNumber - 1];
    const startedAt = nowNs();
    const execution = execute(command, stepNumber);
    const elapsedMs = toMs(nowNs() - startedAt);
    const exitCode = normalizeExitCode(execution?.status);
    const result = Object.freeze({
      stepNumber,
      command,
      elapsedMs,
      exitCode,
      ...(exitCode === 0 ? {} : { failureOutput: failureOutput(execution) })
    });
    results.push(result);
    if (result.exitCode !== 0) {
      status = 'failed';
      onCheckpoint(checkpointValue({ chainId, scriptName, commands, lastCompletedStep: stepNumber - 1, failedStep: stepNumber, result }));
      break;
    }
    onCheckpoint(checkpointValue({ chainId, scriptName, commands, lastCompletedStep: stepNumber, failedStep: 0, result }));
  }

  return Object.freeze({
    schema: 'tiinex.site.validation-chain-run.v1',
    scriptName,
    chainId,
    status,
    configuredSteps: commands.length,
    requestedStartStep: firstStep,
    requestedThroughStep: lastStep,
    executedSteps: results.length,
    totalElapsedMs: toMs(nowNs() - runStartedAt),
    results: Object.freeze(results)
  });
}

function checkpointValue({ chainId, scriptName, commands, lastCompletedStep, failedStep, result }) {
  return Object.freeze({
    schema: 'tiinex.site.validation-chain-checkpoint.v1',
    chainId,
    scriptName,
    configuredSteps: commands.length,
    lastCompletedStep,
    failedStep,
    lastResult: result || null
  });
}

function defaultExecute(command) { return spawnSync(command, { shell: true, encoding: 'utf8', stdio: 'pipe' }); }
function failureOutput(execution = {}) {
  const combined = `${String(execution.stdout || '')}\n${String(execution.stderr || '')}`.trim();
  return combined.length > 4000 ? combined.slice(-4000) : combined;
}
function normalizeExitCode(status) { return Number.isInteger(status) ? status : 1; }
function toMs(nanoseconds) { return Math.round((Number(nanoseconds) / 1_000_000) * 1000) / 1000; }

export function writeValidationCheckpoint(path, value) {
  const absolute = resolve(path);
  mkdirSync(dirname(absolute), { recursive: true });
  const temporary = `${absolute}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  renameSync(temporary, absolute);
}

function parseArgs(argv) {
  const out = { scriptName: 'validate', checkpoint: '', resume: false, startAt: 1, through: Infinity, json: false, help: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--script') out.scriptName = argv[++index];
    else if (arg === '--checkpoint') out.checkpoint = argv[++index];
    else if (arg === '--resume') out.resume = true;
    else if (arg === '--from') out.startAt = Number(argv[++index]);
    else if (arg === '--through') out.through = Number(argv[++index]);
    else if (arg === '--json') out.json = true;
    else if (arg === '--help' || arg === '-h') out.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (out.resume && !out.checkpoint) throw new Error('--resume requires --checkpoint <path>');
  return out;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) {
      console.log('Usage: node tools/run-validation-chain.mjs [--script validate] [--checkpoint file.json] [--resume] [--from N] [--through N] [--json]');
      process.exit(0);
    }
    const pkg = JSON.parse(readFileSync(resolve('package.json'), 'utf8'));
    const script = String(pkg.scripts?.[args.scriptName] || '');
    if (!script) throw new Error(`package script not found: ${args.scriptName}`);
    const resumeState = args.resume && existsSync(resolve(args.checkpoint)) ? JSON.parse(readFileSync(resolve(args.checkpoint), 'utf8')) : null;
    const report = runValidationChain({
      scriptName: args.scriptName,
      script,
      startAt: args.startAt,
      through: args.through,
      resumeState,
      onCheckpoint: args.checkpoint ? (value) => writeValidationCheckpoint(args.checkpoint, value) : () => {}
    });
    if (args.json) console.log(JSON.stringify(report, null, 2));
    else {
      console.log(`Validation chain ${report.scriptName}: ${report.status}; ${report.executedSteps} step(s) this run; ${report.totalElapsedMs.toFixed(3)} ms`);
      for (const result of report.results) {
        console.log(`${result.exitCode === 0 ? 'PASS' : 'FAIL'} ${result.stepNumber}/${report.configuredSteps} ${result.elapsedMs.toFixed(3)} ms ${result.command}`);
        if (result.failureOutput) console.error(result.failureOutput);
      }
    }
    process.exit(report.status === 'passed' ? 0 : 1);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
