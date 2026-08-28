import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  legacyArtifactFixturePath,
  readLegacyArtifactFixtureSync
} from './legacyArtifactFixtures.mjs';

const logical = '.topics/development/handoff/tooling/001-v480-tooling-workflow-schema-enablement-handoff.trace.md';
const physical = legacyArtifactFixturePath(logical);
const fixtureRoot = resolve(dirname(fileURLToPath(import.meta.url)), 'legacy-artifacts');
assert.equal(resolve(physical).startsWith(`${fixtureRoot}/`), true);
assert.equal(physical.endsWith('.trace.fixture.txt'), true);
assert.equal(readLegacyArtifactFixtureSync(logical), readFileSync(physical, 'utf8'));

assert.throws(() => legacyArtifactFixturePath('.topics/current/not-legacy.trace.md'), /must start with/);
assert.throws(() => legacyArtifactFixturePath('.topics/development/../escape.trace.md'), /unsafe legacy fixture path/);
assert.throws(() => legacyArtifactFixturePath('.topics/development/not-a-trace.txt'), /must end with \.trace\.md/);

console.log('legacyArtifactFixtures.test.mjs: ok');
