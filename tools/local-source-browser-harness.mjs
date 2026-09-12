#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const defaultSiteRoot = path.resolve(path.dirname(scriptPath), '..');
const FIRST_PARTY = Object.freeze({
  core: '@tiinex/core',
  app: '@tiinex/app',
  playthings: '@tiinex/verse-playthings',
});
const SOURCE_EXCLUDES = new Set(['.git', '.tiinex', 'node_modules', 'dist']);
const WINDOWS_FRONT_DOOR = 'npm run test:browser:local-source';
const STANDARD_SIBLING_REPOSITORIES = Object.freeze({
  core: 'core',
  app: 'app',
  playthings: 'verse-playthings',
});

class HarnessError extends Error {
  constructor(stage, message, details = {}) {
    super(message);
    this.name = 'HarnessError';
    this.stage = stage;
    this.details = details;
  }
}

export function parseHarnessArgs(argv = []) {
  const values = {};
  const booleans = new Set(['keep-temp', 'offline', 'help']);
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) throw new HarnessError('arguments', `Unexpected positional argument: ${token}`);
    const key = token.slice(2);
    if (booleans.has(key)) {
      values[key] = true;
      continue;
    }
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) throw new HarnessError('arguments', `Missing value for --${key}`);
    values[key] = value;
    index += 1;
  }
  return values;
}

function usage() {
  return `Usage:\n  ${WINDOWS_FRONT_DOOR}\n\nOptional overrides: [--site <root>] [--core <root>] [--app <root>] [--playthings <root>] [--browser <executable>] [--python <executable>] [--evidence-dir <dir>] [--keep-temp] [--offline]\n\nThe supported Windows front door is the npm script above. npm exposes its exact CLI path to that script through npm_execpath; the harness launches that CLI through the already-running Node executable rather than trying to execute the Windows npm.cmd shim with shell-free spawn.\n\nBy default, Core, App and Verse Playthings are resolved from the standard Tiinex sibling checkout layout next to the effective Site root: ../core, ../app and ../verse-playthings. Explicit command-line roots take precedence over TIINEX_*_ROOT environment overrides, which take precedence over those sibling defaults.\n\nThe harness packs exact local @tiinex/core, @tiinex/app and @tiinex/verse-playthings source, rewrites only a disposable Site package.json to consume those tarballs, installs exact declared third-party dependencies, runs Site tests/build, then runs tools/browser-smoke.py.\n`;
}

export function defaultFirstPartyRoots(siteRoot, pathApi = path) {
  const effectiveSiteRoot = pathApi.resolve(siteRoot);
  const parent = pathApi.dirname(effectiveSiteRoot);
  return Object.fromEntries(Object.entries(STANDARD_SIBLING_REPOSITORIES).map(([key, repository]) => [key, pathApi.join(parent, repository)]));
}

export function resolveFirstPartyRootInputs({
  args = {},
  env = process.env,
  siteRoot = defaultSiteRoot,
  pathApi = path,
} = {}) {
  const defaults = defaultFirstPartyRoots(siteRoot, pathApi);
  return {
    core: args.core || env.TIINEX_CORE_ROOT || defaults.core,
    app: args.app || env.TIINEX_APP_ROOT || defaults.app,
    playthings: args.playthings || env.TIINEX_PLAYTHINGS_ROOT || defaults.playthings,
  };
}

export function resolveNpmInvocation({
  platform = process.platform,
  env = process.env,
  nodeExecutable = process.execPath,
} = {}) {
  const npmExecPath = String(env?.npm_execpath || '').trim();
  if (npmExecPath) {
    return {
      command: nodeExecutable,
      argsPrefix: [npmExecPath],
      strategy: 'npm-execpath-via-current-node',
      npmExecPath,
    };
  }
  if (platform === 'win32') {
    throw new HarnessError(
      'host-toolchain',
      'Windows npm invocation metadata is unavailable. Launch the harness through the supported npm script so npm_execpath is provided.',
      {
        platform,
        requiredEnvironment: 'npm_execpath',
        frontDoor: WINDOWS_FRONT_DOOR,
      },
    );
  }
  return {
    command: 'npm',
    argsPrefix: [],
    strategy: 'path-direct-non-windows-fallback',
    npmExecPath: '',
  };
}

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

async function existingDirectory(input, label) {
  if (!input) throw new HarnessError('first-party-validation', `Missing required --${label} root.`);
  const resolved = await realpath(path.resolve(input)).catch(() => '');
  if (!resolved) throw new HarnessError('first-party-validation', `Root does not exist: ${input}`, { label, input });
  const info = await stat(resolved).catch(() => null);
  if (!info?.isDirectory()) throw new HarnessError('first-party-validation', `Root is not a directory: ${resolved}`, { label, resolved });
  return resolved;
}

function exactDependencyVersion(sitePackage, name) {
  const value = sitePackage?.dependencies?.[name];
  if (typeof value !== 'string' || !/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(value)) {
    throw new HarnessError('first-party-validation', `Site dependency ${name} is not an exact version: ${String(value)}`, { name, value });
  }
  return value;
}

export function validatePackageSet({ sitePackage, corePackage, appPackage, playthingsPackage }) {
  if (sitePackage?.name !== 'tiinex-site') {
    throw new HarnessError('first-party-validation', `Expected Site package name tiinex-site, found ${String(sitePackage?.name)}`);
  }
  const expected = {
    core: exactDependencyVersion(sitePackage, FIRST_PARTY.core),
    app: exactDependencyVersion(sitePackage, FIRST_PARTY.app),
    playthings: exactDependencyVersion(sitePackage, FIRST_PARTY.playthings),
  };
  const actual = {
    core: { name: corePackage?.name, version: corePackage?.version },
    app: { name: appPackage?.name, version: appPackage?.version },
    playthings: { name: playthingsPackage?.name, version: playthingsPackage?.version },
  };
  for (const key of Object.keys(FIRST_PARTY)) {
    if (actual[key].name !== FIRST_PARTY[key]) {
      throw new HarnessError('first-party-validation', `Expected ${key} package ${FIRST_PARTY[key]}, found ${String(actual[key].name)}`, { key, expectedName: FIRST_PARTY[key], actual: actual[key] });
    }
    if (actual[key].version !== expected[key]) {
      throw new HarnessError('first-party-validation', `Expected ${FIRST_PARTY[key]} ${expected[key]}, found ${String(actual[key].version)}`, { key, expectedVersion: expected[key], actual: actual[key] });
    }
  }
  if (appPackage?.dependencies?.[FIRST_PARTY.core] !== expected.core) {
    throw new HarnessError('first-party-validation', `App must depend on exact ${FIRST_PARTY.core} ${expected.core}.`, { actual: appPackage?.dependencies?.[FIRST_PARTY.core] });
  }
  return { expected, actual };
}

function minimumNodeVersion(engine) {
  const match = String(engine || '').match(/^>=\s*(\d+)\.(\d+)(?:\.(\d+))?/);
  return match ? match.slice(1).map((part) => Number(part || 0)) : null;
}

function versionTuple(version) {
  const match = String(version || '').replace(/^v/, '').match(/^(\d+)\.(\d+)\.(\d+)/);
  return match ? match.slice(1).map(Number) : null;
}

function compareTuple(left, right) {
  for (let i = 0; i < 3; i += 1) {
    if ((left[i] || 0) !== (right[i] || 0)) return (left[i] || 0) - (right[i] || 0);
  }
  return 0;
}

export function validateNodeEngines(packages, nodeVersion = process.version) {
  const current = versionTuple(nodeVersion);
  if (!current) throw new HarnessError('host-toolchain', `Unrecognized Node version: ${nodeVersion}`);
  for (const [label, pkg] of Object.entries(packages)) {
    const minimum = minimumNodeVersion(pkg?.engines?.node);
    if (minimum && compareTuple(current, minimum) < 0) {
      throw new HarnessError('host-toolchain', `Node ${nodeVersion} does not satisfy ${label} engine ${pkg.engines.node}.`, { label, engine: pkg.engines.node, nodeVersion });
    }
  }
  return { nodeVersion, engines: Object.fromEntries(Object.entries(packages).map(([label, pkg]) => [label, pkg?.engines?.node || ''])) };
}

export function rewriteTemporarySitePackage(sitePackage, tarballs) {
  const next = structuredClone(sitePackage);
  next.dependencies = { ...(next.dependencies || {}) };
  for (const key of Object.keys(FIRST_PARTY)) {
    if (!tarballs[key]) throw new HarnessError('composition', `Missing local tarball for ${key}.`);
    next.dependencies[FIRST_PARTY[key]] = `file:${path.resolve(tarballs[key])}`;
  }
  return next;
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function sanitizeStepName(name) {
  return name.replace(/[^a-z0-9.-]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase();
}

async function writeJson(file, value) {
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function runStep({ index, name, command, args = [], cwd, env, evidenceDir }) {
  const prefix = `${String(index).padStart(2, '0')}-${sanitizeStepName(name)}`;
  const stdoutPath = path.join(evidenceDir, `${prefix}.stdout.log`);
  const stderrPath = path.join(evidenceDir, `${prefix}.stderr.log`);
  const startedAt = new Date().toISOString();
  const started = process.hrtime.bigint();
  const result = spawnSync(command, args, {
    cwd,
    env: { ...process.env, ...env },
    encoding: null,
    maxBuffer: 128 * 1024 * 1024,
  });
  const stdout = Buffer.isBuffer(result.stdout) ? result.stdout : Buffer.from(result.stdout || '');
  const stderr = Buffer.isBuffer(result.stderr) ? result.stderr : Buffer.from(result.stderr || '');
  await writeFile(stdoutPath, stdout);
  await writeFile(stderrPath, stderr);
  const receipt = {
    index,
    name,
    command: [command, ...args],
    cwd,
    startedAt,
    finishedAt: new Date().toISOString(),
    durationMs: Number(process.hrtime.bigint() - started) / 1e6,
    exitCode: result.status,
    signal: result.signal || '',
    error: result.error ? String(result.error.message || result.error) : '',
    stdout: path.basename(stdoutPath),
    stderr: path.basename(stderrPath),
    stdoutSha256: sha256(stdout),
    stderrSha256: sha256(stderr),
  };
  await writeJson(path.join(evidenceDir, `${prefix}.receipt.json`), receipt);
  return { receipt, stdout, stderr };
}

async function runNpmStep({ npmInvocation, args = [], ...step }) {
  return runStep({
    ...step,
    command: npmInvocation.command,
    args: [...npmInvocation.argsPrefix, ...args],
  });
}

function requireStepSuccess(stage, step) {
  if (step.receipt.exitCode !== 0 || step.receipt.error) {
    throw new HarnessError(stage, `${step.receipt.name} failed.`, { receipt: step.receipt });
  }
}

async function packFirstParty({ label, root, packageJson, packsDir, evidenceDir, index, npmInvocation }) {
  const step = await runNpmStep({
    index,
    name: `pack-${label}`,
    npmInvocation,
    args: ['pack', '--json', '--ignore-scripts', '--pack-destination', packsDir],
    cwd: root,
    evidenceDir,
  });
  requireStepSuccess(`pack-${label}`, step);
  let packed;
  try {
    packed = JSON.parse(step.stdout.toString('utf8'))?.[0];
  } catch (error) {
    throw new HarnessError(`pack-${label}`, `npm pack did not return JSON for ${label}.`, { cause: String(error) });
  }
  if (!packed?.filename) throw new HarnessError(`pack-${label}`, `npm pack returned no filename for ${label}.`);
  if (packed.name !== packageJson.name || packed.version !== packageJson.version) {
    throw new HarnessError(`pack-${label}`, `npm pack identity mismatch for ${label}.`, { packed, expected: { name: packageJson.name, version: packageJson.version } });
  }
  const tarball = path.join(packsDir, packed.filename);
  const bytes = await readFile(tarball);
  return {
    label,
    packageName: packageJson.name,
    version: packageJson.version,
    tarball,
    filename: packed.filename,
    bytes: bytes.byteLength,
    sha256: sha256(bytes),
    npmIntegrity: packed.integrity || '',
  };
}

async function copySiteSource(siteRoot, outputRoot) {
  await cp(siteRoot, outputRoot, {
    recursive: true,
    verbatimSymlinks: true,
    filter(source) {
      const relative = path.relative(siteRoot, source);
      if (!relative) return true;
      return !SOURCE_EXCLUDES.has(relative.split(path.sep)[0]);
    },
  });
}

function directThirdPartyVersions(sitePackage, lock) {
  const result = {};
  for (const [name, declared] of Object.entries(sitePackage.dependencies || {})) {
    if (name.startsWith('@tiinex/')) continue;
    result[name] = {
      declared,
      locked: lock?.packages?.[`node_modules/${name}`]?.version || '',
    };
  }
  for (const [name, declared] of Object.entries(sitePackage.devDependencies || {})) {
    result[name] = {
      declared,
      locked: lock?.packages?.[`node_modules/${name}`]?.version || '',
    };
  }
  return result;
}

function verifyDirectThirdPartyVersions(sitePackage, sourceLock, temporaryLock) {
  const source = directThirdPartyVersions(sitePackage, sourceLock);
  const temporary = directThirdPartyVersions(sitePackage, temporaryLock);
  for (const [name, expected] of Object.entries(source)) {
    if (expected.declared !== expected.locked) {
      throw new HarnessError('lock-verification', `Source lock does not pin direct third-party ${name} to declared ${expected.declared}.`, { name, expected });
    }
    if (temporary[name]?.locked !== expected.locked) {
      throw new HarnessError('lock-verification', `Temporary install changed direct third-party ${name}: ${temporary[name]?.locked} != ${expected.locked}.`, { name, source: expected, temporary: temporary[name] });
    }
  }
  return { source, temporary };
}

async function verifyInstalledFirstParty(tempSiteRoot, versions) {
  const installed = {};
  for (const [key, packageName] of Object.entries(FIRST_PARTY)) {
    const packagePath = path.join(tempSiteRoot, 'node_modules', ...packageName.split('/'), 'package.json');
    const pkg = await readJson(packagePath).catch(() => null);
    if (!pkg) throw new HarnessError('install-verification', `Installed package missing: ${packageName}`);
    if (pkg.name !== packageName || pkg.version !== versions[key]) {
      throw new HarnessError('install-verification', `Installed ${packageName} identity/version mismatch.`, { expected: { name: packageName, version: versions[key] }, actual: { name: pkg.name, version: pkg.version } });
    }
    installed[key] = { name: pkg.name, version: pkg.version };
  }
  return installed;
}

function parseBrowserFailure(stderr) {
  const lines = stderr.toString('utf8').split(/\r?\n/).filter(Boolean).reverse();
  for (const line of lines) {
    try {
      const parsed = JSON.parse(line);
      if (parsed?.status === 'failed' && parsed?.failureStage) return parsed;
    } catch {}
  }
  return null;
}

async function criticalSourceState(roots) {
  const state = {};
  for (const [label, root] of Object.entries(roots)) {
    const manifestPath = path.join(root, 'package.json');
    const lockPath = path.join(root, 'package-lock.json');
    const manifest = await readFile(manifestPath);
    const lock = await readFile(lockPath).catch(() => null);
    const nodeModules = await stat(path.join(root, 'node_modules')).then(() => true).catch(() => false);
    state[label] = {
      root,
      packageJsonSha256: sha256(manifest),
      packageLockSha256: lock ? sha256(lock) : '',
      nodeModulesPresent: nodeModules,
    };
  }
  return state;
}

async function main() {
  const args = parseHarnessArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write(usage());
    return;
  }

  let evidenceDir = '';
  let tempRoot = '';
  let result = null;
  let roots = null;
  let sourceStateBefore = null;
  try {
    evidenceDir = args['evidence-dir']
      ? path.resolve(args['evidence-dir'])
      : await mkdtemp(path.join(os.tmpdir(), 'tiinex-site-local-source-evidence-'));
    await mkdir(evidenceDir, { recursive: true });

    const siteRoot = await existingDirectory(args.site || defaultSiteRoot, 'site');
    const firstPartyInputs = resolveFirstPartyRootInputs({ args, env: process.env, siteRoot });
    roots = {
      site: siteRoot,
      core: await existingDirectory(firstPartyInputs.core, 'core'),
      app: await existingDirectory(firstPartyInputs.app, 'app'),
      playthings: await existingDirectory(firstPartyInputs.playthings, 'playthings'),
    };
    if (new Set(Object.values(roots)).size !== Object.keys(roots).length) {
      throw new HarnessError('first-party-validation', 'First-party roots must be distinct.', { roots });
    }

    const packages = {
      site: await readJson(path.join(roots.site, 'package.json')),
      core: await readJson(path.join(roots.core, 'package.json')),
      app: await readJson(path.join(roots.app, 'package.json')),
      playthings: await readJson(path.join(roots.playthings, 'package.json')),
    };
    const packageValidation = validatePackageSet({
      sitePackage: packages.site,
      corePackage: packages.core,
      appPackage: packages.app,
      playthingsPackage: packages.playthings,
    });
    const toolchain = validateNodeEngines(packages);
    const npmInvocation = resolveNpmInvocation();
    const npmVersionStep = await runNpmStep({ index: 1, name: 'npm-version', npmInvocation, args: ['--version'], cwd: roots.site, evidenceDir });
    requireStepSuccess('host-toolchain', npmVersionStep);
    sourceStateBefore = await criticalSourceState(roots);

    tempRoot = await mkdtemp(path.join(os.tmpdir(), 'tiinex-site-local-source-composition-'));
    const packsDir = path.join(tempRoot, 'packs');
    const tempSiteRoot = path.join(tempRoot, 'site');
    await mkdir(packsDir, { recursive: true });

    const corePack = await packFirstParty({ label: 'core', root: roots.core, packageJson: packages.core, packsDir, evidenceDir, index: 2, npmInvocation });
    const appPack = await packFirstParty({ label: 'app', root: roots.app, packageJson: packages.app, packsDir, evidenceDir, index: 3, npmInvocation });
    const playthingsPack = await packFirstParty({ label: 'playthings', root: roots.playthings, packageJson: packages.playthings, packsDir, evidenceDir, index: 4, npmInvocation });
    const packs = { core: corePack, app: appPack, playthings: playthingsPack };
    await writeJson(path.join(evidenceDir, 'first-party-packs.json'), packs);

    await copySiteSource(roots.site, tempSiteRoot);
    const rewritten = rewriteTemporarySitePackage(packages.site, {
      core: corePack.tarball,
      app: appPack.tarball,
      playthings: playthingsPack.tarball,
    });
    await writeJson(path.join(tempSiteRoot, 'package.json'), rewritten);
    await writeJson(path.join(evidenceDir, 'composition.json'), {
      roots,
      packageValidation,
      toolchain,
      npmInvocation: {
        command: npmInvocation.command,
        argsPrefix: npmInvocation.argsPrefix,
        strategy: npmInvocation.strategy,
      },
      npmVersion: npmVersionStep.stdout.toString('utf8').trim(),
      tempSiteRoot,
      offline: Boolean(args.offline),
      rewrittenFirstPartyDependencies: Object.fromEntries(Object.values(FIRST_PARTY).map((name) => [name, rewritten.dependencies[name]])),
    });

    const installArgs = ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--prefer-offline', '--fetch-retries=0', '--fetch-timeout=20000'];
    if (args.offline) installArgs.push('--offline');
    const install = await runNpmStep({
      index: 5,
      name: 'npm-install',
      npmInvocation,
      args: installArgs,
      cwd: tempSiteRoot,
      evidenceDir,
      env: { npm_config_update_notifier: 'false' },
    });
    requireStepSuccess('install', install);

    const sourceLock = await readJson(path.join(roots.site, 'package-lock.json'));
    const temporaryLock = await readJson(path.join(tempSiteRoot, 'package-lock.json'));
    const thirdPartyLockVerification = verifyDirectThirdPartyVersions(packages.site, sourceLock, temporaryLock);
    const installedFirstParty = await verifyInstalledFirstParty(tempSiteRoot, packageValidation.expected);
    await writeJson(path.join(evidenceDir, 'install-verification.json'), { thirdPartyLockVerification, installedFirstParty });

    const siteTest = await runNpmStep({ index: 6, name: 'site-test', npmInvocation, args: ['test'], cwd: tempSiteRoot, evidenceDir });
    requireStepSuccess('site-test', siteTest);
    const siteBuild = await runNpmStep({ index: 7, name: 'site-build', npmInvocation, args: ['run', 'build'], cwd: tempSiteRoot, evidenceDir });
    requireStepSuccess('site-build', siteBuild);

    const python = args.python || process.env.TIINEX_PYTHON || 'python3';
    const browserEnv = {
      TIINEX_BROWSER_SMOKE_VITE_LOG: path.join(evidenceDir, '08-browser-vite.log'),
      ...(args.browser ? { TIINEX_BROWSER_EXECUTABLE: path.resolve(args.browser) } : {}),
    };
    const browserSmoke = await runStep({
      index: 8,
      name: 'browser-smoke',
      command: python,
      args: ['tools/browser-smoke.py'],
      cwd: tempSiteRoot,
      evidenceDir,
      env: browserEnv,
    });
    if (browserSmoke.receipt.exitCode !== 0 || browserSmoke.receipt.error) {
      const browserFailure = parseBrowserFailure(browserSmoke.stderr);
      throw new HarnessError(
        browserFailure ? `browser-smoke:${browserFailure.failureStage}` : 'browser-smoke',
        'Real-browser smoke failed.',
        { receipt: browserSmoke.receipt, browserFailure },
      );
    }

    const sourceStateAfter = await criticalSourceState(roots);
    if (JSON.stringify(sourceStateAfter) !== JSON.stringify(sourceStateBefore)) {
      throw new HarnessError('source-mutation-check', 'Critical source state changed during local-source composition.', { before: sourceStateBefore, after: sourceStateAfter });
    }

    result = {
      status: 'passed',
      realBrowser: true,
      evidenceDir,
      tempRetained: Boolean(args['keep-temp']),
      tempRoot: args['keep-temp'] ? tempRoot : '',
      packages: packageValidation.actual,
      packedSha256: Object.fromEntries(Object.entries(packs).map(([key, value]) => [key, value.sha256])),
      sourceStateUnchanged: true,
      browserResult: browserSmoke.stdout.toString('utf8').trim(),
    };
    await writeJson(path.join(evidenceDir, 'result.json'), result);
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } catch (error) {
    let stage = error instanceof HarnessError ? error.stage : 'unexpected';
    let sourceStateAfter = null;
    let sourceStateUnchanged = null;
    if (roots && sourceStateBefore) {
      sourceStateAfter = await criticalSourceState(roots).catch(() => null);
      sourceStateUnchanged = sourceStateAfter ? JSON.stringify(sourceStateAfter) === JSON.stringify(sourceStateBefore) : null;
      if (sourceStateUnchanged === false) stage = 'source-mutation-check';
    }
    result = {
      status: 'failed',
      failureStage: stage,
      message: String(error?.message || error),
      details: error instanceof HarnessError ? error.details : { stack: error?.stack || '' },
      evidenceDir,
      sourceStateUnchanged,
      ...(sourceStateUnchanged === false ? { sourceStateBefore, sourceStateAfter } : {}),
      tempRetained: Boolean(args?.['keep-temp'] && tempRoot),
      tempRoot: args?.['keep-temp'] ? tempRoot : '',
    };
    if (evidenceDir) await writeJson(path.join(evidenceDir, 'result.json'), result).catch(() => {});
    process.stderr.write(`${JSON.stringify(result, null, 2)}\n`);
    process.exitCode = 1;
  } finally {
    if (tempRoot && !args?.['keep-temp']) await rm(tempRoot, { recursive: true, force: true });
  }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) await main();
