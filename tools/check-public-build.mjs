#!/usr/bin/env node
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const failures = [];
const tmp = mkdtempSync(join(tmpdir(), 'tiinex-public-'));
const out = join(tmp, 'site');
function read(p) { return readFileSync(p, 'utf8'); }
function fail(msg) { failures.push(String(msg || 'public check failed')); }
function findFiles(dir) {
  if (!existsSync(dir)) return [];
  let outFiles = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) outFiles = outFiles.concat(findFiles(p));
    else outFiles.push(p);
  }
  return outFiles;
}
try {
  const build = spawnSync(process.execPath, ['tools/build-public.mjs', '--out', out], { cwd: root, encoding: 'utf8' });
  if (build.status !== 0) fail(build.stderr || build.stdout);
  for (const required of ['index.html', 'assets', 'assets/tiinex-logo-white-transparent.png', '.topics/.workspaces/viewer.workspace.md', 'docs/architecture/uc001-workspace-lifecycle.md', 'README.md', 'LICENSE', 'NOTICE', 'llms.txt', 'tiinex.build.json', '.nojekyll']) {
    if (!existsSync(join(out, required))) fail(`Missing public output: ${required}`);
  }
  for (const forbidden of ['.old', '.git', 'node_modules', '.site-publish', 'desktop.ini', 'src/adapters/leaflet', 'src/verses/map']) {
    if (existsSync(join(out, forbidden))) fail(`Public output must not contain ${forbidden}`);
  }
  const html = existsSync(join(out, 'index.html')) ? read(join(out, 'index.html')) : '';
  if (html.includes('app.js')) fail('Public index must not reference legacy app.js');
  if (!html.includes('type="module"')) fail('Public index must load module bundle');
  const jsFiles = findFiles(join(out, 'assets')).filter((file) => file.endsWith('.js'));
  if (!jsFiles.length) fail('No bundled JS assets emitted');
  const runtime = jsFiles.map(read).join('\n');
  for (const needle of [
    'react-v176-semantic-action-label-truth', 'UC-001-empty-create-local-workspace', 'No nodes match this view', 'Workspace name is required',
    'no source files or GitHub provenance inferred', 'workspace-source-strip', 'tx-react-runtime', 'FontAwesomeIcon'
  ]) if (!runtime.includes(needle)) fail(`Public React runtime missing ${needle}`);
  if (runtime.includes('Create your first workspace') || runtime.includes('data-verse="map"')) fail('Public runtime contains deferred/onboarding UI');
  const identity = existsSync(join(out, 'tiinex.build.json')) ? JSON.parse(read(join(out, 'tiinex.build.json'))) : {};
  if (identity.type !== 'tiinex.public.build.identity.v1') fail('Missing public build identity type');
  if (identity.publicRuntime !== 'vite-react-bundle') fail('Public build identity must disclose Vite React runtime');
  if (!String(identity.source || '').includes('v176')) fail('Public build identity should disclose v176 source shell');
  if (failures.length) {
    console.error(failures.map((f) => `- ${f}`).join('\n'));
    process.exit(1);
  }
  console.log('✓ public build is React UC-001 clean');
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
