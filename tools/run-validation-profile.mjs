#!/usr/bin/env node
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runCheckpointedPlan } from './run-checkpointed-plan.mjs';
import { buildValidationProfileContract, validationProfile } from './validation-profile.contract.mjs';

export const VALIDATION_PROFILE_RUN_SCHEMA = 'tiinex.site.validation-profile-run.v1';

export async function runValidationProfile({
  cwd = process.cwd(),
  profileName = 'focused/tooling',
  packageScripts = null,
  checkpointDir = '',
  resume = false,
  heartbeatMs = 1000,
  timeoutMs = 0,
  captureLimit = 4000,
  runPlan = runCheckpointedPlan,
  runStep,
  now = () => new Date()
} = {}) {
  const absoluteCwd = resolve(cwd);
  const scripts = packageScripts || readPackageScripts(absoluteCwd);
  const contract = buildValidationProfileContract({ packageScripts: scripts });
  const selected = validationProfile(contract, profileName);
  const absoluteCheckpointDir = checkpointDir
    ? resolve(absoluteCwd, checkpointDir)
    : defaultCheckpointDir(absoluteCwd, selected.name, now);
  if (resume && !checkpointDir) throw new Error('validation-profile.resume.checkpoint-dir.required');
  mkdirSync(absoluteCheckpointDir, { recursive: true });
  const prior = readJson(join(absoluteCheckpointDir, 'plan.json'));

  const planReport = await runPlan({
    cwd: absoluteCwd,
    steps: selected.steps,
    checkpointDir: absoluteCheckpointDir,
    resume,
    heartbeatMs,
    timeoutMs,
    captureLimit,
    ...(runStep ? { runStep } : {})
  });
  const checkpoint = readJson(join(absoluteCheckpointDir, 'plan.json'));
  const status = planReport.status === 'completed' ? 'passed' : planReport.status;
  const receipt = Object.freeze({
    schema: VALIDATION_PROFILE_RUN_SCHEMA,
    version: 1,
    status,
    profile: selected.name,
    profileId: selected.profileId,
    purpose: selected.purpose,
    layers: selected.layers,
    configuredSteps: selected.steps.length,
    executedSteps: Number(planReport.executedSteps || 0),
    reusedCompletedSteps: Number(planReport.reusedCompletedSteps || 0),
    reusedCompletedCheckpoint: Boolean(planReport.reusedCompletedCheckpoint),
    totalElapsedMs: Number(planReport.totalElapsedMs || 0),
    checkpointDir: absoluteCheckpointDir,
    planId: String(planReport.planId || checkpoint?.planId || ''),
    resume: Object.freeze({
      requested: Boolean(resume),
      priorState: prior?.status || 'none',
      priorLastCompletedStep: Number(prior?.lastCompletedStep || 0),
      lastCompletedStep: Number(checkpoint?.lastCompletedStep || 0),
      failedStep: Number(checkpoint?.failedStep || 0),
      nextStep: Number(checkpoint?.currentStep || 0)
    }),
    commands: Object.freeze(selected.steps.map((step, index) => Object.freeze({
      stepNumber: index + 1,
      id: step.id,
      origin: step.origin,
      command: step.command,
      args: step.args,
      raw: step.raw
    }))),
    results: Object.freeze((planReport.results || []).map((item) => Object.freeze({ ...item }))),
    fullValidationRequiredForClosure: selected.name !== 'closure',
    closureQualified: selected.name === 'closure' && status === 'passed',
    localTimingBoundary: 'Elapsed values are local child-process/checkpoint orchestration time only. They do not include host/model/client wait outside this process.',
    reuseBoundary: 'Checkpoint reuse proves only that the same normalized plan/command identity completed in this checkpoint lineage. It does not create semantic authority or justify reuse across changed plan identity.'
  });
  writeFileSync(join(absoluteCheckpointDir, 'receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
  return receipt;
}

export function inspectValidationProfile({ cwd = process.cwd(), profileName = 'focused/tooling', packageScripts = null } = {}) {
  const absoluteCwd = resolve(cwd);
  const scripts = packageScripts || readPackageScripts(absoluteCwd);
  const contract = buildValidationProfileContract({ packageScripts: scripts });
  return validationProfile(contract, profileName);
}

function readPackageScripts(cwd) {
  const pkg = JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf8'));
  return pkg.scripts || {};
}

function defaultCheckpointDir(cwd, profileName, now) {
  const stamp = now().toISOString().replace(/[^0-9TZ]/g, '').replace(/Z$/, 'Z');
  const slug = String(profileName || 'profile').replace(/[^a-zA-Z0-9._-]+/g, '-');
  return join(cwd, '.tiinex', 'checkpoints', slug, `${stamp}-${process.pid}-${randomUUID().slice(0, 8)}`);
}

function readJson(path) {
  return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : null;
}

function parseArgs(argv) {
  const out = { profileName: 'focused/tooling', checkpointDir: '', resume: false, inspect: false, json: false, heartbeatMs: 1000, timeoutMs: 0, captureLimit: 4000, help: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--profile') out.profileName = argv[++index];
    else if (arg === '--checkpoint-dir') out.checkpointDir = argv[++index];
    else if (arg === '--resume') out.resume = true;
    else if (arg === '--inspect') out.inspect = true;
    else if (arg === '--json') out.json = true;
    else if (arg === '--heartbeat-ms') out.heartbeatMs = Number(argv[++index]);
    else if (arg === '--timeout-ms') out.timeoutMs = Number(argv[++index]);
    else if (arg === '--capture-limit') out.captureLimit = Number(argv[++index]);
    else if (arg === '--help' || arg === '-h') out.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return out;
}

function printHuman(report) {
  console.log(`Validation profile ${report.profile}: ${report.status}; executed=${report.executedSteps}/${report.configuredSteps}; reused=${report.reusedCompletedSteps}; ${report.totalElapsedMs.toFixed(3)} ms`);
  console.log(`Checkpoint: ${report.checkpointDir}`);
  if (report.resume.failedStep) console.log(`Resume point: step ${report.resume.failedStep} (last completed ${report.resume.lastCompletedStep})`);
  else if (report.resume.nextStep) console.log(`Next step: ${report.resume.nextStep}`);
  if (report.fullValidationRequiredForClosure) console.log('Final closure profile remains required for release qualification.');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) {
      console.log('Usage: node tools/run-validation-profile.mjs [--profile focused/tooling|integration|closure] [--inspect] [--checkpoint-dir <dir> --resume] [--heartbeat-ms N] [--timeout-ms N] [--json]');
      process.exit(0);
    }
    if (args.inspect) {
      const profile = inspectValidationProfile({ profileName: args.profileName });
      console.log(JSON.stringify(profile, null, 2));
      process.exit(0);
    }
    const report = await runValidationProfile(args);
    if (args.json) console.log(JSON.stringify(report, null, 2));
    else printHuman(report);
    process.exit(report.status === 'passed' ? 0 : report.status === 'timed-out' ? 124 : 1);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
