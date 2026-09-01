#!/usr/bin/env node
import assert from 'node:assert/strict';
import {
  classifyStaticFindings,
  parseRawStaticFindings,
  runRegressionAwareStaticValidation
} from './validate-static-regression-aware.mjs';

const baseline = {
  schema: 'tiinex.site.static-validation-baseline.v1',
  version: 1,
  sourceCheckpoint: 'test',
  boundary: 'test boundary',
  rules: [
    {
      id: 'doc',
      disposition: 'duplicate-coverage-unresolved-debt',
      baselineFindings: ['docs/architecture/uc001-workspace-lifecycle.md missing']
    },
    {
      id: 'size',
      disposition: 'still-current-regression-guard-with-inherited-debt',
      thresholdBytes: 24000,
      inheritedFiles: [{ path: 'src/old.js', bytes: 30000 }]
    }
  ]
};

assert.deepEqual(
  parseRawStaticFindings({ stderr: '- one\nnoise\n- two\n' }),
  ['one', 'two']
);

const inherited = classifyStaticFindings({
  findings: [
    'docs/architecture/uc001-workspace-lifecycle.md missing',
    'source file too large for v119 discipline: src/old.js'
  ],
  baseline,
  statFile(path) { assert.equal(path, 'src/old.js'); return 30000; }
});
assert.equal(inherited.inheritedUnresolved.length, 2);
assert.equal(inherited.introducedRegressions.length, 0);
assert.equal(inherited.resolvedInherited.length, 0);

const growth = classifyStaticFindings({
  findings: ['source file too large for v119 discipline: src/old.js'],
  baseline,
  statFile() { return 30001; }
});
assert.equal(growth.inheritedUnresolved.length, 1);
assert.equal(growth.introducedRegressions.length, 1);
assert.equal(growth.introducedRegressions[0].state, 'introduced-growth-over-baseline');
assert.equal(growth.resolvedInherited.length, 1, 'missing architecture debt is separately visible as resolved');

const newOversize = classifyStaticFindings({
  findings: ['source file too large for v119 discipline: src/new.js'],
  baseline,
  statFile() { return 25000; }
});
assert.equal(newOversize.introducedRegressions.length, 1);
assert.equal(newOversize.introducedRegressions[0].state, 'introduced-new-oversize');

const unknown = classifyStaticFindings({ findings: ['unexpected static failure'], baseline, statFile() { return 0; } });
assert.equal(unknown.introducedRegressions.length, 1);
assert.equal(unknown.introducedRegressions[0].ruleId, 'unclassified-static-finding');

const clean = classifyStaticFindings({ findings: [], baseline, statFile() { return 0; } });
assert.equal(clean.inheritedUnresolved.length, 0);
assert.equal(clean.introducedRegressions.length, 0);
assert.equal(clean.resolvedInherited.length, 2);

const diagnostic = runRegressionAwareStaticValidation({
  baselinePath: new URL('./static-validation.baseline.json', import.meta.url).pathname,
  executeRaw() {
    return {
      exitCode: 1,
      stdout: '',
      stderr: '- docs/architecture/uc001-workspace-lifecycle.md missing\n'
    };
  },
  statFile() { return 0; },
  mode: 'diagnostic'
});
assert.equal(diagnostic.receipt.status, 'inherited-debt-only');
assert.equal(diagnostic.exitCode, 0, 'diagnostic mode continues across exact inherited debt');

const closure = runRegressionAwareStaticValidation({
  baselinePath: new URL('./static-validation.baseline.json', import.meta.url).pathname,
  executeRaw() {
    return {
      exitCode: 1,
      stdout: '',
      stderr: '- docs/architecture/uc001-workspace-lifecycle.md missing\n'
    };
  },
  statFile() { return 0; },
  mode: 'closure'
});
assert.equal(closure.exitCode, 1, 'closure mode keeps unresolved inherited debt blocking');

console.log('✓ static regression baseline separates inherited debt from introduced regressions without weakening closure');
