#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

export const STATIC_REGRESSION_RECEIPT_SCHEMA = 'tiinex.site.static-validation-regression-receipt.v1';
export const STATIC_REGRESSION_MARKER = 'TIINEX_STATIC_REGRESSION_SUMMARY=';

export function loadStaticValidationBaseline(path = resolve('tools/static-validation.baseline.json')) {
  const baseline = JSON.parse(readFileSync(path, 'utf8'));
  const baselineId = createHash('sha256').update(JSON.stringify(baseline)).digest('hex');
  return Object.freeze({ ...baseline, baselineId });
}

export function parseRawStaticFindings({ stdout = '', stderr = '' } = {}) {
  return Object.freeze(`${stderr}\n${stdout}`.split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => line.slice(2)));
}

export function classifyStaticFindings({
  findings = [],
  baseline,
  cwd = process.cwd(),
  statFile = (path) => statSync(resolve(cwd, path)).size
} = {}) {
  if (!baseline) throw new Error('static-validation.baseline.required');
  const exactRules = new Map();
  let sizeRule = null;
  for (const rule of baseline.rules || []) {
    for (const finding of rule.baselineFindings || []) exactRules.set(finding, rule);
    if (Array.isArray(rule.inheritedFiles)) sizeRule = rule;
  }
  const inheritedFiles = new Map((sizeRule?.inheritedFiles || []).map((item) => [item.path, item]));
  const observed = new Set(findings);
  const inheritedUnresolved = [];
  const introducedRegressions = [];
  const resolvedInherited = [];

  for (const finding of findings) {
    const exactRule = exactRules.get(finding);
    if (exactRule) {
      inheritedUnresolved.push(record(finding, exactRule, 'inherited-unresolved'));
      continue;
    }
    const sizeMatch = finding.match(/^source file too large for v119 discipline: (.+)$/);
    if (sizeMatch && sizeRule) {
      const path = sizeMatch[1];
      const inherited = inheritedFiles.get(path);
      const currentBytes = safeStat(statFile, path);
      if (!inherited) {
        introducedRegressions.push(record(finding, sizeRule, 'introduced-new-oversize', { path, currentBytes }));
        continue;
      }
      inheritedUnresolved.push(record(finding, sizeRule, 'inherited-unresolved', {
        path,
        baselineBytes: inherited.bytes,
        currentBytes
      }));
      if (Number.isFinite(currentBytes) && currentBytes > Number(inherited.bytes)) {
        introducedRegressions.push(record(finding, sizeRule, 'introduced-growth-over-baseline', {
          path,
          baselineBytes: inherited.bytes,
          currentBytes,
          growthBytes: currentBytes - Number(inherited.bytes)
        }));
      }
      continue;
    }
    introducedRegressions.push(Object.freeze({
      finding,
      ruleId: 'unclassified-static-finding',
      disposition: 'introduced-regression',
      state: 'introduced-unclassified'
    }));
  }

  for (const [finding, rule] of exactRules) {
    if (!observed.has(finding)) resolvedInherited.push(record(finding, rule, 'resolved-inherited'));
  }
  for (const item of inheritedFiles.values()) {
    const finding = `source file too large for v119 discipline: ${item.path}`;
    if (!observed.has(finding)) resolvedInherited.push(record(finding, sizeRule, 'resolved-inherited', { path: item.path, baselineBytes: item.bytes }));
  }

  return Object.freeze({
    inheritedUnresolved: Object.freeze(inheritedUnresolved),
    introducedRegressions: Object.freeze(introducedRegressions),
    resolvedInherited: Object.freeze(resolvedInherited)
  });
}

export function runRegressionAwareStaticValidation({
  cwd = process.cwd(),
  baselinePath = resolve(cwd, 'tools/static-validation.baseline.json'),
  executeRaw = defaultExecuteRaw,
  statFile,
  mode = 'diagnostic'
} = {}) {
  const baseline = loadStaticValidationBaseline(baselinePath);
  const raw = executeRaw({ cwd });
  const findings = parseRawStaticFindings(raw);
  const classification = classifyStaticFindings({ findings, baseline, cwd, ...(statFile ? { statFile } : {}) });
  const executionFailure = Number(raw.exitCode || 0) !== 0 && findings.length === 0;
  const introducedRegressions = executionFailure
    ? Object.freeze([...classification.introducedRegressions, Object.freeze({
        finding: tail(`${String(raw.stderr || '')}\n${String(raw.stdout || '')}`.trim(), 2000) || 'static validator failed without parseable findings',
        ruleId: 'static-validator-execution',
        disposition: 'introduced-regression',
        state: 'introduced-execution-failure'
      })])
    : classification.introducedRegressions;
  const status = introducedRegressions.length
    ? 'regression-blocked'
    : classification.inheritedUnresolved.length
      ? 'inherited-debt-only'
      : 'clean';
  const receipt = Object.freeze({
    schema: STATIC_REGRESSION_RECEIPT_SCHEMA,
    version: 1,
    mode,
    status,
    baselineId: baseline.baselineId,
    sourceCheckpoint: baseline.sourceCheckpoint,
    rawExitCode: Number(raw.exitCode || 0),
    rawFindings: findings,
    inheritedUnresolved: classification.inheritedUnresolved,
    introducedRegressions,
    resolvedInherited: classification.resolvedInherited,
    counts: Object.freeze({
      raw: findings.length,
      inheritedUnresolved: classification.inheritedUnresolved.length,
      introducedRegressions: introducedRegressions.length,
      resolvedInherited: classification.resolvedInherited.length
    }),
    boundary: baseline.boundary
  });
  const exitCode = mode === 'closure'
    ? (findings.length || introducedRegressions.length || executionFailure ? 1 : 0)
    : (introducedRegressions.length ? 1 : 0);
  return Object.freeze({ receipt, exitCode, raw });
}

function defaultExecuteRaw({ cwd }) {
  const child = spawnSync(process.execPath, ['tools/validate-static.mjs'], { cwd, encoding: 'utf8' });
  return Object.freeze({
    exitCode: Number.isInteger(child.status) ? child.status : 1,
    stdout: String(child.stdout || ''),
    stderr: String(child.stderr || child.error?.message || '')
  });
}

function safeStat(statFile, path) {
  try { return Number(statFile(path)); } catch { return null; }
}
function record(finding, rule, state, extra = {}) {
  return Object.freeze({
    finding,
    ruleId: rule?.id || '',
    disposition: rule?.disposition || '',
    state,
    ...extra
  });
}
function tail(value, size) { return value.length > size ? value.slice(-size) : value; }

function parseArgs(argv) {
  const out = { mode: 'diagnostic', json: false, baselinePath: '' };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--mode') out.mode = argv[++index];
    else if (arg === '--baseline') out.baselinePath = argv[++index];
    else if (arg === '--json') out.json = true;
    else if (arg === '--help' || arg === '-h') out.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!['diagnostic', 'closure'].includes(out.mode)) throw new Error(`static-validation.mode.unsupported:${out.mode}`);
  return out;
}

function printHuman(receipt) {
  console.log(`Static regression diagnostic: ${receipt.status}; inherited=${receipt.counts.inheritedUnresolved}; introduced=${receipt.counts.introducedRegressions}; resolved=${receipt.counts.resolvedInherited}`);
  for (const item of receipt.inheritedUnresolved) console.error(`- INHERITED ${item.finding}`);
  for (const item of receipt.introducedRegressions) console.error(`- REGRESSION ${item.finding}`);
  for (const item of receipt.resolvedInherited) console.log(`- RESOLVED ${item.finding}`);
  console.log(`${STATIC_REGRESSION_MARKER}${JSON.stringify({
    schema: receipt.schema,
    status: receipt.status,
    baselineId: receipt.baselineId,
    inheritedUnresolved: receipt.counts.inheritedUnresolved,
    introducedRegressions: receipt.counts.introducedRegressions,
    resolvedInherited: receipt.counts.resolvedInherited
  })}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) {
      console.log('Usage: node tools/validate-static-regression-aware.mjs [--mode diagnostic|closure] [--baseline <file>] [--json]');
      process.exit(0);
    }
    const result = runRegressionAwareStaticValidation({
      mode: args.mode,
      ...(args.baselinePath ? { baselinePath: resolve(args.baselinePath) } : {})
    });
    if (args.json) console.log(JSON.stringify(result.receipt, null, 2));
    else printHuman(result.receipt);
    process.exit(result.exitCode);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
