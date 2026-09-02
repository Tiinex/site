#!/usr/bin/env node
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildValidationProfileContract, validationProfile, validationProfileId } from './validation-profile.contract.mjs';
import { runValidationProfile } from './run-validation-profile.mjs';

const packageScripts = {
  'portable:smoke': 'node smoke-one.mjs && node smoke-two.mjs',
  'ui:shape': 'node ui.mjs',
  typecheck: 'node type.mjs',
  'runtime:smoke': 'node runtime.mjs',
  'usecase:uc001': 'node uc001.mjs',
  'storage:scan': 'node storage.mjs',
  'build:public': 'node deps.mjs && node build.mjs',
  'public:check': 'node public.mjs'
};
const contract = buildValidationProfileContract({ packageScripts });
const smoke = validationProfile(contract, 'smoke');
const focused = validationProfile(contract, 'focused/tooling');
const integration = validationProfile(contract, 'integration');
const closure = validationProfile(contract, 'closure');

assert.equal(smoke.layers.join(','), 'smoke');
assert.equal(focused.layers.join(','), 'smoke,focused/tooling');
assert.equal(integration.layers.join(','), 'smoke,focused/tooling,integration');
assert.equal(closure.layers.join(','), 'smoke,focused/tooling,integration,closure');

assert.equal(smoke.steps.length, 2, 'smoke is one architecture validator plus one use-case suite');
assert.equal(focused.steps.length, 4, 'focused adds one Tooling suite plus the real static diagnostic');
assert.equal(integration.steps.length, 12, 'integration adds seven distinct repository validators plus one remaining acceptance suite');
assert.equal(closure.steps.length, 23, 'closure adds strict static and distinct closure validators without historical test enumeration');

assert.deepEqual(focused.steps.slice(0, smoke.steps.length).map((item) => item.id), smoke.steps.map((item) => item.id), 'focused reuses smoke exactly');
assert.deepEqual(integration.steps.slice(0, focused.steps.length).map((item) => item.id), focused.steps.map((item) => item.id), 'integration reuses focused exactly');
assert.deepEqual(closure.steps.slice(0, integration.steps.length).map((item) => item.id), integration.steps.map((item) => item.id), 'closure reuses integration exactly');

assert(smoke.steps.some((item) => item.args.join(' ') === 'tools/run-foundation-suite.mjs --suite smoke'));
assert(focused.steps.some((item) => item.args.join(' ') === 'tools/run-foundation-suite.mjs --suite focused/tooling'));
assert(integration.steps.some((item) => item.args.join(' ') === 'tools/run-foundation-suite.mjs --suite integration'));
assert(focused.steps.some((item) => item.args[0] === 'tools/validate-static-regression-aware.mjs' && item.args.includes('diagnostic')));
assert(!integration.steps.some((item) => item.args.length === 1 && item.args[0] === 'tools/validate-static.mjs'), 'integration must not stop on inherited strict static debt');
assert(closure.steps.some((item) => item.args.length === 1 && item.args[0] === 'tools/validate-static.mjs'), 'closure keeps strict static truth');
assert(closure.steps.some((item) => item.args.includes('public.mjs')), 'closure includes public-build qualification');
assert(closure.steps.some((item) => item.args.includes('type.mjs')), 'closure includes type qualification');

for (const profile of [smoke, focused, integration, closure]) {
  assert(!profile.steps.some((item) => /\.test\.mjs$/.test(item.args?.[0] || '')), `${profile.name} must not enumerate standalone historical test files`);
}
assert.equal(validationProfileId(smoke), smoke.profileId);
assert.equal(validationProfileId(focused), focused.profileId);
assert.notEqual(smoke.profileId, focused.profileId);
assert.notEqual(focused.profileId, integration.profileId);

const root = mkdtempSync(join(tmpdir(), 'tiinex-validation-profile-'));
const checkpointDir = join(root, 'checkpoint');
let failedOnce = false;
const first = await runValidationProfile({
  cwd: root,
  profileName: 'focused/tooling',
  packageScripts,
  checkpointDir,
  heartbeatMs: 0,
  runStep: async (input) => {
    if (input.label === focused.steps[1].id && !failedOnce) {
      failedOnce = true;
      return { status: 'failed', exitCode: 7, elapsedMs: 3, stdoutTail: '', stderrTail: 'synthetic failure' };
    }
    return { status: 'completed', exitCode: 0, elapsedMs: 2, stdoutTail: 'ok', stderrTail: '' };
  }
});
assert.equal(first.status, 'failed');
assert.equal(first.resume.failedStep, 2);
assert.equal(first.resume.lastCompletedStep, 1);

const resumedCalls = [];
const second = await runValidationProfile({
  cwd: root,
  profileName: 'focused/tooling',
  packageScripts,
  checkpointDir,
  resume: true,
  heartbeatMs: 0,
  runStep: async (input) => {
    resumedCalls.push(input.label);
    return { status: 'completed', exitCode: 0, elapsedMs: 1, stdoutTail: 'ok', stderrTail: '' };
  }
});
assert.equal(second.status, 'passed');
assert.equal(second.reusedCompletedSteps, 1);
assert.equal(resumedCalls[0], focused.steps[1].id);

const integrationCheckpointDir = join(root, 'integration-checkpoint');
const integrationRun = await runValidationProfile({
  cwd: root,
  profileName: 'integration',
  packageScripts,
  checkpointDir: integrationCheckpointDir,
  heartbeatMs: 0,
  runStep: async (input) => ({
    status: 'completed',
    exitCode: 0,
    elapsedMs: 1,
    stdoutTail: input.args?.[0] === 'tools/validate-static-regression-aware.mjs'
      ? 'TIINEX_STATIC_REGRESSION_SUMMARY={"schema":"tiinex.site.static-validation-regression-receipt.v1","status":"inherited-debt-only","baselineId":"test","inheritedUnresolved":7,"introducedRegressions":0,"resolvedInherited":6}\n'
      : 'ok',
    stderrTail: ''
  })
});
assert.equal(integrationRun.status, 'diagnostic-qualified');
assert.equal(integrationRun.staticRegression.inheritedUnresolved, 7);
assert.equal(integrationRun.staticRegression.resolvedInherited, 6);
assert.equal(integrationRun.closureQualified, false);

console.log('✓ validation profiles use the consolidated Foundation suite spine with exact checkpoint and static-debt semantics');
