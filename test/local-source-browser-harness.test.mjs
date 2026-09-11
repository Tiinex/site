import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {
  parseHarnessArgs,
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
