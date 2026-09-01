#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { foundationSuite, foundationSuiteSummary } from './foundation-test-suite.contract.mjs';

export function runFoundationSuite(name, { cwd = process.cwd(), execute = defaultExecute, nowNs = () => process.hrtime.bigint() } = {}) {
  const cases = foundationSuite(name);
  const startedAt = nowNs();
  const results = [];
  for (const file of cases) {
    const caseStartedAt = nowNs();
    const child = execute(file, cwd);
    const elapsedMs = toMs(nowNs() - caseStartedAt);
    const exitCode = Number.isInteger(child?.status) ? child.status : 1;
    const output = `${String(child?.stdout || '')}\n${String(child?.stderr || '')}`.trim();
    results.push(Object.freeze({
      file,
      elapsedMs,
      exitCode,
      ...(exitCode === 0 ? {} : { failureOutput: tail(output, 6000) })
    }));
    if (exitCode !== 0) break;
  }
  const failures = results.filter((item) => item.exitCode !== 0).length;
  return Object.freeze({
    schema: 'tiinex.site.foundation-test-suite.receipt.v1',
    status: failures ? 'failed' : 'passed',
    suite: String(name),
    plannedCases: cases.length,
    executedCases: results.length,
    failures,
    totalElapsedMs: toMs(nowNs() - startedAt),
    results: Object.freeze(results)
  });
}

function defaultExecute(file, cwd) {
  return spawnSync(process.execPath, [file], { cwd, encoding: 'utf8', stdio: 'pipe' });
}
function toMs(ns) { return Math.round((Number(ns) / 1_000_000) * 1000) / 1000; }
function tail(value, size) { return value.length > size ? value.slice(-size) : value; }

function parseArgs(argv) {
  let suite = '';
  let json = false;
  let inspect = false;
  let help = false;
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--suite') suite = String(argv[++i] || '');
    else if (arg === '--json') json = true;
    else if (arg === '--inspect') inspect = true;
    else if (arg === '--help' || arg === '-h') help = true;
    else throw new Error(`foundation-test-suite.arg.unknown:${arg}`);
  }
  return { suite, json, inspect, help };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.suite) {
    console.log('Usage: node tools/run-foundation-suite.mjs --suite smoke|focused/tooling|integration|all [--inspect] [--json]');
    process.exit(args.help ? 0 : 1);
  }
  if (args.inspect) {
    const cases = foundationSuite(args.suite);
    console.log(JSON.stringify({ ...foundationSuiteSummary(), selectedSuite: args.suite, selectedCases: cases }, null, 2));
    process.exit(0);
  }
  const result = runFoundationSuite(args.suite);
  if (args.json) console.log(JSON.stringify(result, null, 2));
  else {
    console.log(`Foundation suite ${result.suite}: ${result.status}; ${result.executedCases}/${result.plannedCases} cases; ${result.totalElapsedMs.toFixed(3)} ms`);
    for (const item of result.results) {
      console.log(`${item.exitCode === 0 ? 'PASS' : 'FAIL'} ${item.elapsedMs.toFixed(3).padStart(10)} ms ${item.file}`);
      if (item.failureOutput) console.error(item.failureOutput);
    }
  }
  process.exit(result.status === 'passed' ? 0 : 1);
}
