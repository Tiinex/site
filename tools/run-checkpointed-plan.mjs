#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runCheckpointedCommand } from './run-checkpointed-command.mjs';

const PLAN_SCHEMA = 'tiinex.site.checkpointed-plan.v1';
const PLAN_CHECKPOINT_SCHEMA = 'tiinex.site.checkpointed-plan-checkpoint.v1';
const PLAN_REPORT_SCHEMA = 'tiinex.site.checkpointed-plan-run.v1';

export function checkpointedPlanId({ cwd = process.cwd(), steps = [] } = {}) {
  const normalized = normalizePlan({ cwd, steps });
  return createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
}

export async function runCheckpointedPlan({
  cwd = process.cwd(),
  steps = [],
  checkpointDir,
  resume = false,
  heartbeatMs = 1000,
  timeoutMs = 0,
  captureLimit = 4000,
  runStep = runCheckpointedCommand,
  now = () => new Date(),
  nowNs = () => process.hrtime.bigint()
} = {}) {
  if (!checkpointDir) throw new Error('checkpointed-plan.checkpoint-dir.required');
  const normalized = normalizePlan({ cwd, steps });
  if (!normalized.steps.length) throw new Error('checkpointed-plan.steps.required');
  const planId = checkpointedPlanId(normalized);
  const absoluteCheckpointDir = resolve(checkpointDir);
  const planCheckpointPath = join(absoluteCheckpointDir, 'plan.json');
  const existing = readJson(planCheckpointPath);
  if (existing && existing.planId !== planId) throw new Error('checkpointed-plan.checkpoint.stale');
  if (existing && !resume) throw new Error('checkpointed-plan.checkpoint.exists-use-resume');
  if (existing?.status === 'completed' && resume) {
    return Object.freeze({
      schema: PLAN_REPORT_SCHEMA,
      status: 'completed',
      planId,
      checkpointDir: absoluteCheckpointDir,
      configuredSteps: normalized.steps.length,
      executedSteps: 0,
      reusedCompletedSteps: normalized.steps.length,
      reusedCompletedCheckpoint: true,
      totalElapsedMs: 0,
      results: Object.freeze([])
    });
  }

  const startedNs = nowNs();
  const startedAt = now().toISOString();
  let lastCompletedStep = Math.max(0, Number(existing?.lastCompletedStep || 0));
  const results = [];
  let reusedCompletedSteps = lastCompletedStep;
  writePlanCheckpoint(planCheckpointPath, {
    schema: PLAN_CHECKPOINT_SCHEMA,
    planId,
    status: 'running',
    startedAt: existing?.startedAt || startedAt,
    resumedAt: existing ? startedAt : '',
    configuredSteps: normalized.steps.length,
    lastCompletedStep,
    failedStep: 0,
    currentStep: lastCompletedStep < normalized.steps.length ? lastCompletedStep + 1 : 0
  });

  for (let index = lastCompletedStep; index < normalized.steps.length; index += 1) {
    const step = normalized.steps[index];
    const stepNumber = index + 1;
    const stepCheckpointPath = join(absoluteCheckpointDir, 'steps', `${String(stepNumber).padStart(3, '0')}-${safeId(step.id)}.json`);
    const stepResume = existsSync(stepCheckpointPath);
    writePlanCheckpoint(planCheckpointPath, {
      ...readJson(planCheckpointPath),
      status: 'running',
      currentStep: stepNumber,
      failedStep: 0
    });
    const report = await runStep({
      cwd: step.cwd,
      command: step.command,
      args: step.args,
      label: step.id,
      checkpointPath: stepCheckpointPath,
      resume: stepResume,
      heartbeatMs,
      timeoutMs: Number(step.timeoutMs || timeoutMs || 0),
      captureLimit
    });
    const result = Object.freeze({
      stepNumber,
      id: step.id,
      command: step.command,
      args: Object.freeze([...step.args]),
      status: String(report.status || 'failed'),
      exitCode: Number(report.exitCode || 0),
      elapsedMs: Number(report.elapsedMs || 0),
      reusedCompletedCheckpoint: Boolean(report.reusedCompletedCheckpoint),
      stdoutTail: String(report.stdoutTail || ''),
      stderrTail: String(report.stderrTail || '')
    });
    results.push(result);
    if (report.status !== 'completed') {
      writePlanCheckpoint(planCheckpointPath, {
        ...readJson(planCheckpointPath),
        status: String(report.status || 'failed'),
        currentStep: stepNumber,
        failedStep: stepNumber,
        lastCompletedStep,
        finishedAt: now().toISOString(),
        lastResult: result
      });
      return planReport({ status: String(report.status || 'failed'), planId, checkpointDir: absoluteCheckpointDir, configuredSteps: normalized.steps.length, executedSteps: results.length, reusedCompletedSteps, totalElapsedMs: toMs(nowNs() - startedNs), results });
    }
    lastCompletedStep = stepNumber;
    writePlanCheckpoint(planCheckpointPath, {
      ...readJson(planCheckpointPath),
      status: 'running',
      currentStep: stepNumber < normalized.steps.length ? stepNumber + 1 : 0,
      failedStep: 0,
      lastCompletedStep,
      lastResult: result
    });
  }

  writePlanCheckpoint(planCheckpointPath, {
    ...readJson(planCheckpointPath),
    status: 'completed',
    currentStep: 0,
    failedStep: 0,
    lastCompletedStep: normalized.steps.length,
    finishedAt: now().toISOString()
  });
  return planReport({ status: 'completed', planId, checkpointDir: absoluteCheckpointDir, configuredSteps: normalized.steps.length, executedSteps: results.length, reusedCompletedSteps, totalElapsedMs: toMs(nowNs() - startedNs), results });
}

function normalizePlan({ cwd = process.cwd(), steps = [] } = {}) {
  const base = resolve(cwd);
  const ids = new Set();
  const normalizedSteps = (steps || []).map((raw, index) => {
    const id = String(raw?.id || `step-${index + 1}`).trim();
    const command = String(raw?.command || '').trim();
    if (!id) throw new Error('checkpointed-plan.step.id.required');
    if (ids.has(id)) throw new Error(`checkpointed-plan.step.id.duplicate:${id}`);
    if (!command) throw new Error(`checkpointed-plan.step.command.required:${id}`);
    ids.add(id);
    return Object.freeze({
      id,
      cwd: resolve(base, String(raw?.cwd || '.')),
      command,
      args: Object.freeze((raw?.args || []).map(String)),
      timeoutMs: Math.max(0, Number(raw?.timeoutMs || 0))
    });
  });
  return Object.freeze({ cwd: base, steps: Object.freeze(normalizedSteps) });
}

function planReport(value) {
  return Object.freeze({ schema: PLAN_REPORT_SCHEMA, ...value, results: Object.freeze(value.results || []) });
}

function writePlanCheckpoint(path, value) {
  const absolute = resolve(path);
  mkdirSync(dirname(absolute), { recursive: true });
  const temporary = `${absolute}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  renameSync(temporary, absolute);
}

function readJson(path) {
  return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : null;
}

function safeId(value) {
  return String(value || 'step').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'step';
}
function toMs(nanoseconds) { return Math.round((Number(nanoseconds) / 1_000_000) * 1000) / 1000; }

function parseArgs(argv) {
  const out = { plan: '', checkpointDir: '', resume: false, json: false, cwd: process.cwd(), heartbeatMs: 1000, timeoutMs: 0 };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--plan') out.plan = argv[++index];
    else if (arg === '--checkpoint-dir') out.checkpointDir = argv[++index];
    else if (arg === '--resume') out.resume = true;
    else if (arg === '--json') out.json = true;
    else if (arg === '--cwd') out.cwd = argv[++index];
    else if (arg === '--heartbeat-ms') out.heartbeatMs = Number(argv[++index]);
    else if (arg === '--timeout-ms') out.timeoutMs = Number(argv[++index]);
    else if (arg === '--help' || arg === '-h') out.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return out;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) {
      console.log('Usage: node tools/run-checkpointed-plan.mjs --plan <plan.json> --checkpoint-dir <dir> [--resume] [--cwd <dir>] [--heartbeat-ms 1000] [--timeout-ms N] [--json]');
      process.exit(0);
    }
    if (!options.plan) throw new Error('checkpointed-plan.plan.required');
    const plan = JSON.parse(readFileSync(resolve(options.plan), 'utf8'));
    const report = await runCheckpointedPlan({ ...options, steps: plan.steps || [], checkpointDir: options.checkpointDir });
    if (options.json) console.log(JSON.stringify(report, null, 2));
    else console.log(`Checkpointed plan ${report.status}; executed ${report.executedSteps}/${report.configuredSteps}; reused ${report.reusedCompletedSteps}; ${report.totalElapsedMs.toFixed(3)} ms; checkpoint ${report.checkpointDir}`);
    process.exit(report.status === 'completed' ? 0 : report.status === 'timed-out' ? 124 : 1);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
