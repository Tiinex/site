#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const lock = JSON.parse(readFileSync(join(root, 'package-lock.json'), 'utf8'));
const packages = lock.packages || {};
const failures = [];

function fail(message) { failures.push(String(message)); }
function entry(path) { return packages[path]; }
function hasOptional(parentPath, dependencyName, expectedVersion) {
  const parent = entry(parentPath);
  const actual = parent?.optionalDependencies?.[dependencyName];
  if (actual !== expectedVersion) {
    fail(`${parentPath} optionalDependencies.${dependencyName} must be ${expectedVersion}; got ${actual || 'missing'}`);
  }
}
function requirePackage(path, { version, os, cpu, libc }) {
  const pkg = entry(path);
  if (!pkg) {
    fail(`${path} missing from package-lock.json`);
    return;
  }
  if (pkg.version !== version) fail(`${path} version ${pkg.version} != ${version}`);
  if (!pkg.resolved) fail(`${path} missing resolved tarball URL`);
  if (!pkg.integrity) fail(`${path} missing integrity hash`);
  if (pkg.optional !== true) fail(`${path} must be optional: true`);
  for (const value of os || []) if (!pkg.os?.includes(value)) fail(`${path} missing os ${value}`);
  for (const value of cpu || []) if (!pkg.cpu?.includes(value)) fail(`${path} missing cpu ${value}`);
  for (const value of libc || []) if (!pkg.libc?.includes(value)) fail(`${path} missing libc ${value}`);
}

const required = [
  {
    parent: ['node_modules/rolldown', '@rolldown/binding-linux-x64-gnu', '1.1.5'],
    path: 'node_modules/@rolldown/binding-linux-x64-gnu',
    shape: { version: '1.1.5', os: ['linux'], cpu: ['x64'], libc: ['glibc'] }
  },
  {
    parent: ['node_modules/rolldown', '@rolldown/binding-win32-x64-msvc', '1.1.5'],
    path: 'node_modules/@rolldown/binding-win32-x64-msvc',
    shape: { version: '1.1.5', os: ['win32'], cpu: ['x64'] }
  },
  {
    parent: ['node_modules/lightningcss', 'lightningcss-linux-x64-gnu', '1.32.0'],
    path: 'node_modules/lightningcss-linux-x64-gnu',
    shape: { version: '1.32.0', os: ['linux'], cpu: ['x64'], libc: ['glibc'] }
  },
  {
    parent: ['node_modules/lightningcss', 'lightningcss-win32-x64-msvc', '1.32.0'],
    path: 'node_modules/lightningcss-win32-x64-msvc',
    shape: { version: '1.32.0', os: ['win32'], cpu: ['x64'] }
  },
  {
    parent: ['node_modules/typescript', '@typescript/typescript-linux-x64', '7.0.2'],
    path: 'node_modules/@typescript/typescript-linux-x64',
    shape: { version: '7.0.2', os: ['linux'], cpu: ['x64'] }
  },
  {
    parent: ['node_modules/typescript', '@typescript/typescript-win32-x64', '7.0.2'],
    path: 'node_modules/@typescript/typescript-win32-x64',
    shape: { version: '7.0.2', os: ['win32'], cpu: ['x64'] }
  }
];

for (const item of required) {
  hasOptional(...item.parent);
  requirePackage(item.path, item.shape);
}

if (failures.length) {
  console.error(failures.map((f) => `- ${f}`).join('\n'));
  process.exit(1);
}
console.log('✓ package-lock includes Linux and Windows native optional dependency entries');
