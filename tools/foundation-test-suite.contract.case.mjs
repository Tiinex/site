#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { FOUNDATION_TEST_GROUPS, FOUNDATION_TEST_SUITES, foundationSuiteSummary } from './foundation-test-suite.contract.mjs';

const root = process.cwd();
const allCases = FOUNDATION_TEST_SUITES.all;
assert.equal(new Set(allCases).size, allCases.length, 'permanent suite cases must be uniquely owned');
for (const file of allCases) assert(statSync(join(root, file)).isFile(), `suite case missing:${file}`);

const testEntrypoints = walk(root)
  .map((file) => relative(root, file).replaceAll('\\', '/'))
  .filter((file) => file.endsWith('.test.mjs'))
  .sort();
assert.deepEqual(testEntrypoints, ['tools/foundation-acceptance.test.mjs'], 'standalone test-file growth is not the default Foundation testing model');

const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
assert.equal(packageJson.scripts?.test, 'node tools/foundation-acceptance.test.mjs', 'generic npm test must remain bounded to permanent Foundation acceptance');
assert.equal(packageJson.scripts?.['validate:integration'], 'node tools/run-validation-profile.mjs --profile integration', 'integration must remain an explicit escalation command');
assert.equal(packageJson.scripts?.['validate:closure'], 'node tools/run-validation-profile.mjs --profile closure', 'closure must remain an explicit escalation command');
assert(String(packageJson.scripts?.validate || '').includes('node tools/foundation-acceptance.test.mjs'), 'strict aggregate validate must use the permanent acceptance entrypoint');
assert(!String(packageJson.scripts?.validate || '').match(/src\/.+\.test\.mjs/), 'strict aggregate validate must not enumerate historical test files');

const strategy = readFileSync(join(root, 'docs/architecture/foundation-test-strategy.md'), 'utf8');
assert(strategy.includes('Cold recipients and ordinary developers start with the narrowest command that matches the work'), 'durable strategy must direct cold recipients to narrow-first validation');
assert(strategy.includes('`npm test` runs the permanent Foundation component/use-case acceptance entrypoint'), 'durable strategy must describe bounded npm test semantics');
assert(strategy.includes('`npm run validate:integration` is an explicit repository-integration escalation'), 'durable strategy must keep integration explicit');
assert(strategy.includes('`npm run validate:closure` is an explicit closure boundary'), 'durable strategy must keep closure explicit');

const summary = foundationSuiteSummary();
assert.equal(summary.standaloneTestEntrypoints, 1);
assert.equal(summary.permanentCases, allCases.length);
assert.equal(Object.values(FOUNDATION_TEST_GROUPS).reduce((count, cases) => count + cases.length, 0), allCases.length);

console.log(`✓ Foundation test-suite contract: 1 permanent entrypoint, ${allCases.length} suite-owned cases, no historical test-file enumeration`);

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (['.git', 'node_modules', '.site-publish', '.tiinex'].includes(name)) continue;
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) out.push(...walk(path));
    else if (stat.isFile()) out.push(path);
  }
  return out;
}
