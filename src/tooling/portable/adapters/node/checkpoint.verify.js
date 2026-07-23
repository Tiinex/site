import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { access, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { listPortableOperations } from '../../operation.catalog.js';
import {
  PORTABLE_VALIDATION_RECEIPT_SCHEMA_ID,
  describePortableCheckpointGate,
  qualifyPortableCheckpoint
} from '../../conformance/checkpoint.qualification.js';

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_REPO_ROOT = path.resolve(MODULE_DIR, '../../../../..');

export async function runNodePortableCheckpointVerification(options = {}) {
  const repoRoot = path.resolve(options.repoRoot || DEFAULT_REPO_ROOT);
  const profile = options.profile || 'source-clean';
  const gate = describePortableCheckpointGate({ profile });
  const packageJson = JSON.parse(await readFile(path.join(repoRoot, 'package.json'), 'utf8'));
  const workflowText = await readOptional(path.join(repoRoot, '.github/workflows/publish-public.yml'));
  const parityText = await readOptional(path.join(repoRoot, 'src/parity/poc.parityLedger.js'));
  const portableFiles = await collectPortableSourceFiles(repoRoot);
  const portableIdentity = await buildPortableIdentity(repoRoot, portableFiles);
  const lockfiles = await existingPaths(repoRoot, ['package-lock.json', 'npm-shrinkwrap.json', 'yarn.lock', 'pnpm-lock.yaml']);
  const installer = extractInstaller(workflowText);
  const parityCheckpoint = extractParityCheckpoint(parityText);
  const receipts = [];

  for (const descriptor of gate.gates) {
    const receipt = descriptor.id === 'portable-syntax'
      ? await runSyntaxGate(repoRoot, portableFiles, descriptor, options)
      : await runCommandGate(repoRoot, descriptor, options);
    receipts.push(receipt);
    if (options.failFast && receipt.status === 'failed') break;
  }

  const qualification = qualifyPortableCheckpoint({
    profile,
    siteIdentity: {
      name: packageJson.name,
      version: packageJson.version,
      description: packageJson.description,
      commit: options.commit || '',
      sourceCheckpoint: options.sourceCheckpoint || ''
    },
    portableIdentity,
    receipts,
    reproducibility: {
      dependencies: packageJson.dependencies || {},
      lockfiles,
      installer
    },
    continuity: {
      parityCheckpoint,
      expectedVersion: options.expectedVersion || ''
    },
    evidence: options.evidence || []
  });

  const result = Object.freeze({
    schema: 'tiinex.portable.node-checkpoint-verification.v1',
    generatedAt: new Date().toISOString(),
    repoRoot: options.includePaths === true ? repoRoot : '.',
    profile,
    receipts: Object.freeze(receipts),
    qualification
  });
  if (options.output) await writeFile(path.resolve(repoRoot, options.output), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  return result;
}

async function runSyntaxGate(repoRoot, files, descriptor, options) {
  const startedAt = new Date();
  const details = [];
  let failed = false;
  for (const relativePath of files.filter((file) => /\.(?:js|mjs)$/i.test(file))) {
    const result = await runProcess(repoRoot, process.execPath, ['--check', relativePath], options);
    details.push({ path: relativePath, exitCode: result.exitCode, status: result.exitCode === 0 ? 'passed' : 'failed', stderrDigest: digest(result.stderr) });
    if (result.exitCode !== 0) failed = true;
  }
  const finishedAt = new Date();
  return receipt(descriptor, {
    status: failed ? 'failed' : 'passed',
    exitCode: failed ? 1 : 0,
    startedAt,
    finishedAt,
    stdout: `${details.filter((entry) => entry.status === 'passed').length}/${details.length} portable JavaScript sources passed node --check`,
    stderr: '',
    details
  });
}

async function runCommandGate(repoRoot, descriptor, options) {
  const startedAt = new Date();
  if (descriptor.requiresInstalledDependencies && !(await exists(path.join(repoRoot, 'node_modules')))) {
    const canUseNoInstallTsc = descriptor.id === 'typecheck' && await commandAvailable(repoRoot, 'npx', ['--no-install', 'tsc', '--version']);
    if (!canUseNoInstallTsc) {
      const finishedAt = new Date();
      return receipt(descriptor, {
        status: 'blocked',
        exitCode: null,
        reason: 'installed-dependencies-unavailable',
        startedAt,
        finishedAt,
        stdout: '',
        stderr: 'node_modules is unavailable for a dependency-backed checkpoint gate.'
      });
    }
  }
  const parsed = splitCommand(descriptor.command);
  const result = await runProcess(repoRoot, parsed.command, parsed.args, options);
  const finishedAt = new Date();
  return receipt(descriptor, {
    status: result.spawnError ? 'blocked' : result.exitCode === 0 ? 'passed' : 'failed',
    exitCode: result.spawnError ? null : result.exitCode,
    reason: result.spawnError ? 'command-unavailable' : '',
    startedAt,
    finishedAt,
    stdout: result.stdout,
    stderr: result.stderr,
    details: result.spawnError ? { message: result.spawnError.message } : null
  });
}

function receipt(descriptor, input) {
  return Object.freeze({
    schema: PORTABLE_VALIDATION_RECEIPT_SCHEMA_ID,
    gateId: descriptor.id,
    command: descriptor.command,
    status: input.status,
    exitCode: input.exitCode,
    reason: input.reason || '',
    startedAt: input.startedAt.toISOString(),
    finishedAt: input.finishedAt.toISOString(),
    durationMs: input.finishedAt.getTime() - input.startedAt.getTime(),
    stdoutDigest: digest(input.stdout),
    stderrDigest: digest(input.stderr),
    outputSummary: summarizeOutput(input.stdout, input.stderr),
    details: input.details || null,
    environment: Object.freeze({ node: process.version, platform: process.platform, arch: process.arch })
  });
}

async function runProcess(cwd, command, args, options = {}) {
  return await new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let settled = false;
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, CI: process.env.CI || '1', NO_COLOR: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false
    });
    child.stdout.on('data', (chunk) => {
      stdout += String(chunk);
      if (options.echo === true) process.stdout.write(chunk);
    });
    child.stderr.on('data', (chunk) => {
      stderr += String(chunk);
      if (options.echo === true) process.stderr.write(chunk);
    });
    child.on('error', (spawnError) => {
      if (settled) return;
      settled = true;
      resolve({ exitCode: null, stdout, stderr, spawnError });
    });
    child.on('close', (exitCode) => {
      if (settled) return;
      settled = true;
      resolve({ exitCode: typeof exitCode === 'number' ? exitCode : 1, stdout, stderr, spawnError: null });
    });
  });
}

async function buildPortableIdentity(repoRoot, files) {
  const sourceHash = createHash('sha256');
  for (const relativePath of files) {
    sourceHash.update(relativePath);
    sourceHash.update('\0');
    sourceHash.update(await readFile(path.join(repoRoot, relativePath)));
    sourceHash.update('\0');
  }
  const operations = listPortableOperations().operations;
  const operationFingerprint = digest(JSON.stringify(operations));
  const bootstrapPath = 'src/tooling/portable/bootstrap/tiinex.llm.bootstrap.md';
  const bootstrap = await readOptional(path.join(repoRoot, bootstrapPath));
  return Object.freeze({
    sourceFingerprint: `sha256:${sourceHash.digest('hex')}`,
    operationFingerprint,
    operationCount: operations.length,
    sourceFiles: files.length,
    bootstrapFingerprint: bootstrap ? digest(bootstrap) : ''
  });
}

async function collectPortableSourceFiles(repoRoot) {
  const roots = [
    'src/tooling/portable',
    'tools/tiinex-portable.mjs',
    'tools/tiinex-portable-verify.mjs',
    'docs/architecture/portable-tooling-entrypoints.md'
  ];
  const files = [];
  for (const root of roots) {
    const absolute = path.join(repoRoot, root);
    if (!(await exists(absolute))) continue;
    const info = await stat(absolute);
    if (info.isFile()) files.push(root);
    else files.push(...await walkFiles(repoRoot, absolute));
  }
  return [...new Set(files)].sort();
}

async function walkFiles(repoRoot, directory) {
  const out = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) out.push(...await walkFiles(repoRoot, absolute));
    else if (entry.isFile()) out.push(path.relative(repoRoot, absolute).replace(/\\/g, '/'));
  }
  return out;
}

async function existingPaths(repoRoot, names) {
  const out = [];
  for (const name of names) if (await exists(path.join(repoRoot, name))) out.push(name);
  return out;
}

async function exists(target) {
  try { await access(target); return true; }
  catch { return false; }
}

async function readOptional(target) {
  try { return await readFile(target, 'utf8'); }
  catch { return ''; }
}

async function commandAvailable(cwd, command, args) {
  const result = await runProcess(cwd, command, args, {});
  return !result.spawnError && result.exitCode === 0;
}

function extractInstaller(workflow = '') {
  const match = String(workflow || '').match(/run:\s*(npm\s+(?:install|ci)[^\n]*)/i);
  return match?.[1]?.trim() || '';
}

function extractParityCheckpoint(source = '') {
  const match = String(source || '').match(/checkpoint:\s*['"]([^'"]+)['"]/);
  return match?.[1]?.trim() || '';
}

function splitCommand(commandLine = '') {
  const tokens = String(commandLine || '').match(/(?:[^\s"]+|"[^"]*")+/g) || [];
  return { command: tokens.shift() || '', args: tokens.map((token) => token.replace(/^"|"$/g, '')) };
}

function digest(value = '') { return `sha256:${createHash('sha256').update(String(value || '')).digest('hex')}`; }
function summarizeOutput(stdout = '', stderr = '') {
  const text = `${stdout}\n${stderr}`.trim().replace(/\s+/g, ' ');
  return text.length <= 320 ? text : `${text.slice(0, 317)}...`;
}
