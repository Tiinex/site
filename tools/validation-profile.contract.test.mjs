#!/usr/bin/env node
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildValidationProfileContract, validationProfile, validationProfileId } from './validation-profile.contract.mjs';
import { runValidationProfile } from './run-validation-profile.mjs';

const packageScripts = {
  validate: 'node one.mjs && node two.mjs',
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
const focused = validationProfile(contract, 'focused/tooling');
const integration = validationProfile(contract, 'integration');
const closure = validationProfile(contract, 'closure');

assert.equal(focused.layers.join(','), 'focused/tooling');
assert.deepEqual(integration.steps.slice(0, focused.steps.length).map((item) => item.id), focused.steps.map((item) => item.id), 'integration must reuse the exact focused definition');
assert.deepEqual(closure.steps.slice(0, integration.steps.length).map((item) => item.id), integration.steps.map((item) => item.id), 'closure must reuse the exact integration composition');
assert(closure.steps.some((item) => item.args.includes('public.mjs')), 'closure must include public-build qualification');
assert(closure.steps.some((item) => item.args.includes('type.mjs')), 'closure must include type qualification');
assert.equal(validationProfileId(focused), focused.profileId, 'profile identity must be stable');
assert.notEqual(focused.profileId, integration.profileId, 'profile identity must change when composition changes');

const root = mkdtempSync(join(tmpdir(), 'tiinex-validation-profile-'));
const checkpointDir = join(root, 'checkpoint');
let failedOnce = false;
const calls = [];
const first = await runValidationProfile({
  cwd: root,
  profileName: 'focused/tooling',
  packageScripts,
  checkpointDir,
  heartbeatMs: 0,
  runStep: async (input) => {
    calls.push(input.label);
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
assert.equal(first.executedSteps, 2);

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
assert.equal(second.reusedCompletedSteps, 1, 'resume must preserve completed prefix');
assert.equal(resumedCalls[0], focused.steps[1].id, 'resume must restart from failed step, not replay the completed prefix');

const completedReuse = await runValidationProfile({
  cwd: root,
  profileName: 'focused/tooling',
  packageScripts,
  checkpointDir,
  resume: true,
  heartbeatMs: 0,
  runStep: async () => { throw new Error('completed profile must not re-execute'); }
});
assert.equal(completedReuse.status, 'passed');
assert.equal(completedReuse.executedSteps, 0);
assert.equal(completedReuse.reusedCompletedCheckpoint, true);
assert.equal(completedReuse.reusedCompletedSteps, focused.steps.length);

console.log('✓ validation profiles compose focused→integration→closure and preserve exact checkpoint failure/resume identity');
