#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  tiinexBuildIdentity,
  TIINEX_PUBLIC_BUILD_SOURCE,
  TIINEX_RUNTIME_ID,
  TIINEX_SITE_CHECKPOINT,
  TIINEX_SITE_TITLE,
  TIINEX_SITE_VERSION
} from '../src/build.identity.js';
import { pocParityLedger } from '../src/parity/poc.parityLedger.js';

const root = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const failures = [];
function path(...parts) { return join(root, ...parts); }
function read(file) { return readFileSync(path(file), 'utf8'); }
function fail(message) { failures.push(String(message)); }
function contains(file, needle, label = `${file} missing ${needle}`) {
  if (!read(file).includes(needle)) fail(label);
}

const pkg = JSON.parse(read('package.json'));
if (pkg.version !== TIINEX_SITE_VERSION) fail(`package version ${pkg.version} != build identity ${TIINEX_SITE_VERSION}`);
if (!String(pkg.version || '').endsWith(`-${TIINEX_SITE_CHECKPOINT}`)) fail('package version must end with checkpoint suffix');
if (!String(pkg.description || '').includes(TIINEX_SITE_TITLE)) fail('package description must mention site title/checkpoint');
if (pkg.packageManager !== 'npm@10.9.2') fail('packageManager must pin npm@10.9.2');

contains('README.md', TIINEX_SITE_TITLE, 'README title must match build identity');
contains('README.md', TIINEX_SITE_CHECKPOINT, 'README must mention checkpoint');
contains('VALIDATION_NOTES.md', `Validation Notes ${TIINEX_SITE_CHECKPOINT}`, 'VALIDATION_NOTES title must match checkpoint');
contains('index.html', TIINEX_RUNTIME_ID, 'index runtime meta must match build identity runtime');
contains('src/main.jsx', 'tiinexBuildIdentity', 'React entry must publish build identity');
contains('tools/build-public.mjs', 'TIINEX_PUBLIC_BUILD_SOURCE', 'public build must use build identity source constant');


const runtimeIdentity = tiinexBuildIdentity();
if (runtimeIdentity.siteVersion !== TIINEX_SITE_VERSION) fail('tiinexBuildIdentity siteVersion must match build identity');
if (runtimeIdentity.runtimeId !== TIINEX_RUNTIME_ID) fail('tiinexBuildIdentity runtimeId must match build identity');

if (pocParityLedger.checkpoint !== TIINEX_SITE_CHECKPOINT) fail(`parity ledger checkpoint ${pocParityLedger.checkpoint} != ${TIINEX_SITE_CHECKPOINT}`);
if (existsSync(path('yarn.lock'))) fail('yarn.lock must not exist when npm/package-lock is the repository package-manager truth');
if (!existsSync(path('package-lock.json'))) fail('package-lock.json missing for npm ci release gate');

if (failures.length) {
  console.error(failures.map((f) => `- ${f}`).join('\n'));
  process.exit(1);
}
console.log(`✓ checkpoint identity ${TIINEX_SITE_VERSION} is consistent`);
