import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {
  defaultFirstPartyRoots,
  parseHarnessArgs,
  resolveFirstPartyRootInputs,
  resolveNpmInvocation,
  rewriteTemporarySitePackage,
  validateNodeEngines,
  validatePackageSet,
} from '../tools/local-source-browser-harness.mjs';

const sitePackage = {
  name: 'tiinex-site',
  dependencies: {
    '@tiinex/core': '0.1.1',
    '@tiinex/app': '0.1.1',
    '@tiinex/verse-playthings': '0.1.0',
    react: '19.2.7',
  },
  engines: { node: '>=22.14' },
};
const corePackage = { name: '@tiinex/core', version: '0.1.1', engines: { node: '>=22.14' } };
const appPackage = { name: '@tiinex/app', version: '0.1.1', dependencies: { '@tiinex/core': '0.1.1' }, engines: { node: '>=22.14' } };
const playthingsPackage = { name: '@tiinex/verse-playthings', version: '0.1.0', engines: { node: '>=22.16.0' } };

test('local-source harness accepts explicit roots and preserves caller-controlled paths', () => {
  assert.deepEqual(parseHarnessArgs(['--core', '../core', '--app', '../app', '--playthings', '../verse-playthings', '--browser', '/opt/chrome', '--keep-temp', '--offline']), {
    core: '../core',
    app: '../app',
    playthings: '../verse-playthings',
    browser: '/opt/chrome',
    'keep-temp': true,
    offline: true,
  });
});

test('standard Windows checkout defaults resolve sibling repositories and preserve path spaces', () => {
  const siteRoot = 'C:\\Users\\Sigma\\Tiinex Workspaces\\site';
  assert.deepEqual(defaultFirstPartyRoots(siteRoot, path.win32), {
    core: 'C:\\Users\\Sigma\\Tiinex Workspaces\\core',
    app: 'C:\\Users\\Sigma\\Tiinex Workspaces\\app',
    playthings: 'C:\\Users\\Sigma\\Tiinex Workspaces\\verse-playthings',
  });
});

test('explicit roots beat environment roots, which beat standard sibling defaults', () => {
  const siteRoot = 'C:\\Users\\Sigma\\Tiinex Workspaces\\site';
  assert.deepEqual(resolveFirstPartyRootInputs({
    siteRoot,
    pathApi: path.win32,
    args: { core: 'D:\\Exact Core' },
    env: {
      TIINEX_CORE_ROOT: 'D:\\Ignored Core',
      TIINEX_APP_ROOT: 'D:\\App Override',
    },
  }), {
    core: 'D:\\Exact Core',
    app: 'D:\\App Override',
    playthings: 'C:\\Users\\Sigma\\Tiinex Workspaces\\verse-playthings',
  });
});

test('local-source harness fails closed on first-party package version mismatch', () => {
  assert.throws(() => validatePackageSet({
    sitePackage,
    corePackage: { ...corePackage, version: '0.1.0' },
    appPackage,
    playthingsPackage,
  }), /Expected @tiinex\/core 0\.1\.1, found 0\.1\.0/);
});

test('local-source harness validates exact carried first-party package identities and versions', () => {
  assert.deepEqual(validatePackageSet({ sitePackage, corePackage, appPackage, playthingsPackage }).expected, {
    core: '0.1.1',
    app: '0.1.1',
    playthings: '0.1.0',
  });
});

test('temporary Site descriptor rewrites only first-party dependency locations', () => {
  const rewritten = rewriteTemporarySitePackage(sitePackage, {
    core: '/tmp/packs/core.tgz',
    app: '/tmp/packs/app.tgz',
    playthings: '/tmp/packs/playthings.tgz',
  });
  assert.equal(rewritten.dependencies.react, '19.2.7');
  assert.equal(rewritten.dependencies['@tiinex/core'], `file:${path.resolve('/tmp/packs/core.tgz')}`);
  assert.equal(rewritten.dependencies['@tiinex/app'], `file:${path.resolve('/tmp/packs/app.tgz')}`);
  assert.equal(rewritten.dependencies['@tiinex/verse-playthings'], `file:${path.resolve('/tmp/packs/playthings.tgz')}`);
  assert.equal(sitePackage.dependencies['@tiinex/core'], '0.1.1');
});

test('local-source harness enforces the strictest carried Node engine minimum', () => {
  assert.doesNotThrow(() => validateNodeEngines({ site: sitePackage, core: corePackage, app: appPackage, playthings: playthingsPackage }, 'v22.16.0'));
  assert.throws(() => validateNodeEngines({ site: sitePackage, core: corePackage, app: appPackage, playthings: playthingsPackage }, 'v22.15.0'), /does not satisfy playthings engine/);
});

test('Windows npm invocation runs npm_execpath through the current Node executable instead of spawning the npm.cmd shim', () => {
  const nodeExecutable = 'C:\\Program Files\\nodejs\\node.exe';
  const npmExecPath = 'C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js';
  assert.deepEqual(resolveNpmInvocation({
    platform: 'win32',
    nodeExecutable,
    env: { npm_execpath: npmExecPath },
  }), {
    command: nodeExecutable,
    argsPrefix: [npmExecPath],
    strategy: 'npm-execpath-via-current-node',
    npmExecPath,
  });
});

test('Windows direct Node invocation fails closed when npm_execpath is unavailable and points to the supported npm-script front door', () => {
  assert.throws(
    () => resolveNpmInvocation({ platform: 'win32', nodeExecutable: 'C:\\node.exe', env: {} }),
    (error) => {
      assert.equal(error.stage, 'host-toolchain');
      assert.match(error.message, /Launch the harness through the supported npm script/);
      assert.equal(error.details.frontDoor, 'npm run test:browser:local-source');
      return true;
    },
  );
});
