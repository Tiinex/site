#!/usr/bin/env node
import assert from 'node:assert/strict';
import { profileTestFiles } from './profile-test-files.mjs';

let tick = 0n;
const report = profileTestFiles(['a.mjs', 'b.mjs', 'c.mjs'], {
  execute(file) { return file === 'b.mjs' ? { status: 3, stdout: 'x', stderr: 'boom' } : { status: 0, stdout: 'ok', stderr: '' }; },
  nowNs() { tick += 1_000_000n; return tick; }
});
assert.equal(report.status, 'profiled-with-failures');
assert.equal(report.files, 3);
assert.equal(report.failures, 1);
assert.deepEqual(report.results.map((item) => item.elapsedMs), [1, 1, 1]);
assert.equal(report.results[1].exitCode, 3);
assert.match(report.results[1].failureOutput, /boom/);
console.log('✓ test-file profiler records per-file timing and continues across failures');
