#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export { FOCUSED_TOOLING_STEPS as TOOLING_ITERATION_STEPS } from './validation-profile.contract.mjs';
import { FOCUSED_TOOLING_STEPS } from './validation-profile.contract.mjs';


export function runToolingIterationGate({ cwd = process.cwd(), steps = FOCUSED_TOOLING_STEPS, spawn = spawnSync } = {}) {
  const startedAt = process.hrtime.bigint();
  const results = [];
  let status = 'passed';
  for (const step of steps) {
    const stepStartedAt = process.hrtime.bigint();
    const child = spawn(step.command, [...step.args], { cwd, encoding: 'utf8', stdio: 'pipe' });
    const elapsedMs = toMs(process.hrtime.bigint() - stepStartedAt);
    const result = Object.freeze({
      id: step.id,
      command: [step.command, ...step.args].join(' '),
      elapsedMs,
      exitCode: Number.isInteger(child.status) ? child.status : 1,
      stdout: String(child.stdout || '').trim(),
      stderr: String(child.stderr || '').trim()
    });
    results.push(result);
    if (result.exitCode !== 0) {
      status = 'failed';
      break;
    }
  }
  return Object.freeze({
    schema: 'tiinex.site.tooling-iteration-gate.v1',
    status,
    totalElapsedMs: toMs(process.hrtime.bigint() - startedAt),
    executedSteps: results.length,
    configuredSteps: steps.length,
    fullValidationRequiredForClosure: true,
    results: Object.freeze(results)
  });
}

function toMs(nanoseconds) { return Math.round((Number(nanoseconds) / 1_000_000) * 1000) / 1000; }

function parseArgs(argv) {
  return Object.freeze({ json: argv.includes('--json'), help: argv.includes('--help') || argv.includes('-h') });
}

function printHuman(report) {
  console.log(`Tooling iteration gate: ${report.status} (${report.totalElapsedMs.toFixed(3)} ms)`);
  for (const result of report.results) {
    console.log(`${result.exitCode === 0 ? 'PASS' : 'FAIL'} ${result.id.padEnd(24)} ${result.elapsedMs.toFixed(3)} ms  ${result.command}`);
    if (result.exitCode !== 0 && result.stderr) console.log(result.stderr);
  }
  console.log('Full repository validation remains required for final closure.');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log('Usage: node tools/run-tooling-iteration-gate.mjs [--json]');
    process.exit(0);
  }
  const report = runToolingIterationGate();
  if (args.json) console.log(JSON.stringify(report, null, 2));
  else printHuman(report);
  process.exit(report.status === 'passed' ? 0 : 1);
}
