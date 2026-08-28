#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function profileTestFiles(files = [], { cwd = process.cwd(), execute = defaultExecute, nowNs = () => process.hrtime.bigint() } = {}) {
  const results = [];
  const startedAt = nowNs();
  for (const file of files) {
    const stepStartedAt = nowNs();
    const child = execute(file, cwd);
    const elapsedMs = toMs(nowNs() - stepStartedAt);
    const exitCode = Number.isInteger(child?.status) ? child.status : 1;
    results.push(Object.freeze({
      file,
      elapsedMs,
      exitCode,
      ...(exitCode === 0 ? {} : { failureOutput: tail(`${String(child?.stdout || '')}\n${String(child?.stderr || '')}`.trim(), 4000) })
    }));
  }
  const failures = results.filter((item) => item.exitCode !== 0).length;
  return Object.freeze({
    schema: 'tiinex.site.test-file-profile.v1',
    status: failures ? 'profiled-with-failures' : 'profiled-clean',
    totalElapsedMs: toMs(nowNs() - startedAt),
    files: results.length,
    failures,
    results: Object.freeze(results)
  });
}

function defaultExecute(file, cwd) { return spawnSync(process.execPath, [file], { cwd, encoding: 'utf8', stdio: 'pipe' }); }
function tail(value, size) { return value.length > size ? value.slice(-size) : value; }
function toMs(ns) { return Math.round((Number(ns) / 1_000_000) * 1000) / 1000; }

function parseArgs(argv) {
  const files = [];
  let json = false;
  let help = false;
  for (const arg of argv) {
    if (arg === '--json') json = true;
    else if (arg === '--help' || arg === '-h') help = true;
    else files.push(arg);
  }
  return { files, json, help };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.files.length) {
    console.log('Usage: node tools/profile-test-files.mjs <test.mjs> [more-tests...] [--json]');
    process.exit(args.help ? 0 : 1);
  }
  const report = profileTestFiles(args.files);
  if (args.json) console.log(JSON.stringify(report, null, 2));
  else {
    console.log(`Test profile: ${report.status}; ${report.files} files; ${report.totalElapsedMs.toFixed(3)} ms`);
    for (const item of report.results) {
      console.log(`${item.exitCode === 0 ? 'PASS' : 'FAIL'} ${item.elapsedMs.toFixed(3).padStart(10)} ms ${item.file}`);
      if (item.failureOutput) console.error(item.failureOutput);
    }
  }
  process.exit(0);
}
