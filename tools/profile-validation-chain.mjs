#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { splitValidationChain, validationChainId } from './run-validation-chain.mjs';

const PROFILE_CHECKPOINT_SCHEMA = 'tiinex.site.validation-chain-profile-checkpoint.v1';

export function profileValidationChain({
  scriptName = 'validate',
  script = '',
  from = 1,
  through = Infinity,
  batchSize = Infinity,
  resumeState = null,
  execute = defaultExecute,
  onCheckpoint = () => {},
  nowNs = () => process.hrtime.bigint()
} = {}) {
  const commands = splitValidationChain(script);
  const chainId = validationChainId(scriptName, script);
  if (resumeState && resumeState.chainId !== chainId) throw new Error('validation-chain-profile.checkpoint.stale');

  const configuredStart = Math.max(1, Number(resumeState?.startStep || from || 1));
  const resumeFrom = resumeState ? Math.max(configuredStart, Number(resumeState.lastProfiledStep || configuredStart - 1) + 1) : configuredStart;
  const requestedThrough = Math.min(commands.length, Number.isFinite(Number(through)) ? Number(through) : commands.length);
  const normalizedBatchSize = Number.isFinite(Number(batchSize)) && Number(batchSize) > 0 ? Math.floor(Number(batchSize)) : Infinity;
  const last = Math.min(requestedThrough, Number.isFinite(normalizedBatchSize) ? resumeFrom + normalizedBatchSize - 1 : requestedThrough);
  const priorProfiledSteps = Math.max(0, Number(resumeState?.cumulativeProfiledSteps || 0));
  const priorElapsedMs = Math.max(0, Number(resumeState?.cumulativeElapsedMs || 0));
  const priorFailures = Math.max(0, Number(resumeState?.cumulativeFailures || 0));
  const priorFailureSteps = Array.isArray(resumeState?.failureSteps) ? resumeState.failureSteps.map(Number).filter(Number.isInteger) : [];

  if (resumeState?.status === 'completed' && resumeFrom > commands.length) {
    return Object.freeze({
      schema: 'tiinex.site.validation-chain-profile.v1',
      scriptName,
      chainId,
      status: priorFailures ? 'profiled-with-failures' : 'profiled-clean',
      configuredSteps: commands.length,
      fromStep: configuredStart,
      throughStep: commands.length,
      profiledSteps: 0,
      failures: 0,
      totalElapsedMs: 0,
      cumulativeProfiledSteps: priorProfiledSteps,
      cumulativeFailures: priorFailures,
      cumulativeElapsedMs: priorElapsedMs,
      nextFromStep: 0,
      remainingSteps: 0,
      checkpointComplete: true,
      reusedCompletedCheckpoint: true,
      results: Object.freeze([])
    });
  }

  const results = [];
  const runStartedAt = nowNs();
  let cumulativeElapsedMs = priorElapsedMs;
  let cumulativeProfiledSteps = priorProfiledSteps;
  let cumulativeFailures = priorFailures;
  const failureSteps = [...priorFailureSteps];
  let lastProfiledStep = Math.max(configuredStart - 1, Number(resumeState?.lastProfiledStep || configuredStart - 1));

  if (resumeFrom <= last) {
    onCheckpoint(profileCheckpoint({
      chainId, scriptName, commands, startStep: configuredStart, lastProfiledStep,
      currentStep: resumeFrom, cumulativeProfiledSteps, cumulativeElapsedMs, cumulativeFailures, failureSteps, status: 'running'
    }));
  }

  for (let stepNumber = resumeFrom; stepNumber <= last; stepNumber += 1) {
    const command = commands[stepNumber - 1];
    onCheckpoint(profileCheckpoint({
      chainId, scriptName, commands, startStep: configuredStart, lastProfiledStep,
      currentStep: stepNumber, cumulativeProfiledSteps, cumulativeElapsedMs, cumulativeFailures, failureSteps, status: 'running'
    }));
    const stepStartedAt = nowNs();
    const child = execute(command, stepNumber);
    const elapsedMs = toMs(nowNs() - stepStartedAt);
    const exitCode = normalizeProfileExitCode(child);
    const result = Object.freeze({
      stepNumber,
      command,
      elapsedMs,
      exitCode,
      ...(exitCode === 0 ? {} : { failureOutput: tail(`${String(child?.stdout || '')}\n${String(child?.stderr || '')}`.trim(), 4000) })
    });
    results.push(result);
    lastProfiledStep = stepNumber;
    cumulativeProfiledSteps += 1;
    cumulativeElapsedMs = roundMs(cumulativeElapsedMs + elapsedMs);
    if (exitCode !== 0) {
      cumulativeFailures += 1;
      failureSteps.push(stepNumber);
    }
    const complete = lastProfiledStep >= commands.length;
    const currentStep = complete ? 0 : lastProfiledStep + 1;
    onCheckpoint(profileCheckpoint({
      chainId, scriptName, commands, startStep: configuredStart, lastProfiledStep,
      currentStep, cumulativeProfiledSteps, cumulativeElapsedMs, cumulativeFailures, failureSteps,
      status: complete ? 'completed' : 'partial', lastResult: result
    }));
  }

  const batchElapsedMs = toMs(nowNs() - runStartedAt);
  const currentFailures = results.filter((item) => item.exitCode !== 0).length;
  const nextFromStep = lastProfiledStep < commands.length ? lastProfiledStep + 1 : 0;
  return Object.freeze({
    schema: 'tiinex.site.validation-chain-profile.v1',
    scriptName,
    chainId,
    status: currentFailures ? 'profiled-with-failures' : 'profiled-clean',
    configuredSteps: commands.length,
    fromStep: resumeFrom,
    throughStep: Math.max(resumeFrom - 1, last),
    profiledSteps: results.length,
    failures: currentFailures,
    totalElapsedMs: batchElapsedMs,
    cumulativeProfiledSteps,
    cumulativeFailures,
    cumulativeElapsedMs,
    nextFromStep,
    remainingSteps: Math.max(0, commands.length - lastProfiledStep),
    checkpointComplete: nextFromStep === 0,
    reusedCompletedCheckpoint: false,
    results: Object.freeze(results)
  });
}

function profileCheckpoint({ chainId, scriptName, commands, startStep, lastProfiledStep, currentStep, cumulativeProfiledSteps, cumulativeElapsedMs, cumulativeFailures, failureSteps, status, lastResult = null }) {
  return Object.freeze({
    schema: PROFILE_CHECKPOINT_SCHEMA,
    chainId,
    scriptName,
    configuredSteps: commands.length,
    startStep,
    status,
    lastProfiledStep,
    currentStep,
    cumulativeProfiledSteps,
    cumulativeElapsedMs: roundMs(cumulativeElapsedMs),
    cumulativeFailures,
    failureSteps: Object.freeze([...new Set(failureSteps)].sort((a, b) => a - b)),
    lastResult
  });
}

export function writeValidationProfileCheckpoint(path, value) {
  const absolute = resolve(path);
  mkdirSync(dirname(absolute), { recursive: true });
  const temporary = `${absolute}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  renameSync(temporary, absolute);
}

function defaultExecute(command) { return spawnSync(command, { shell: true, encoding: 'utf8', stdio: 'pipe' }); }
function normalizeProfileExitCode(child) {
  if (Number.isInteger(child?.status)) return child.status;
  if (child?.error?.code === 'ETIMEDOUT') return 124;
  return 1;
}
function tail(value, size) { return value.length > size ? value.slice(-size) : value; }
function toMs(ns) { return roundMs(Number(ns) / 1_000_000); }
function roundMs(value) { return Math.round(Number(value) * 1000) / 1000; }

function parseArgs(argv) {
  const out = { scriptName: 'validate', from: null, through: Infinity, batchSize: Infinity, checkpoint: '', resume: false, json: false, help: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--script') out.scriptName = argv[++index];
    else if (arg === '--from') out.from = Number(argv[++index]);
    else if (arg === '--through') out.through = Number(argv[++index]);
    else if (arg === '--batch-size') out.batchSize = Number(argv[++index]);
    else if (arg === '--checkpoint') out.checkpoint = argv[++index];
    else if (arg === '--resume') out.resume = true;
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
      console.log('Usage: node tools/profile-validation-chain.mjs [--script validate] [--from N] [--through N] [--batch-size N] [--checkpoint file.json] [--resume] [--json]');
      process.exit(0);
    }
    const pkg = JSON.parse(readFileSync(resolve('package.json'), 'utf8'));
    const script = String(pkg.scripts?.[args.scriptName] || '');
    if (!script) throw new Error(`package script not found: ${args.scriptName}`);
    const checkpointPath = args.checkpoint ? resolve(args.checkpoint) : '';
    const resumeState = args.resume && checkpointPath && existsSync(checkpointPath) ? JSON.parse(readFileSync(checkpointPath, 'utf8')) : null;
    const startStep = args.from ?? Number(resumeState?.startStep || 1);
    const report = profileValidationChain({
      scriptName: args.scriptName,
      script,
      from: startStep,
      through: args.through,
      batchSize: args.batchSize,
      resumeState,
      onCheckpoint: checkpointPath ? (value) => writeValidationProfileCheckpoint(checkpointPath, value) : () => {}
    });
    if (args.json) console.log(JSON.stringify(report, null, 2));
    else {
      console.log(`Validation profile ${args.scriptName}: ${report.profiledSteps} step(s), ${report.totalElapsedMs.toFixed(3)} ms, failures=${report.failures}, next=${report.nextFromStep || 'done'}`);
      for (const item of report.results) console.log(`${item.exitCode === 0 ? 'PASS' : 'FAIL'} ${item.stepNumber}/${report.configuredSteps} ${item.elapsedMs.toFixed(3)} ms ${item.command}`);
      if (checkpointPath) console.log(`Checkpoint: ${checkpointPath}; cumulative=${report.cumulativeProfiledSteps}/${report.configuredSteps}; cumulative failures=${report.cumulativeFailures}`);
    }
    process.exit(0);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
