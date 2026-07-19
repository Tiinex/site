#!/usr/bin/env node
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url)).replace(/[\/]$/, '');
const failures = [];
const tmp = mkdtempSync(join(tmpdir(), 'tiinex-public-'));
const out = join(tmp, 'site');
function fail(msg) { failures.push(msg); }
function read(p) { return readFileSync(p, 'utf8'); }
try {
  const build = spawnSync(process.execPath, ['tools/build-public.mjs', '--out', out], { cwd: root, encoding: 'utf8' });
  if (build.status !== 0) fail(build.stderr || build.stdout);
  for (const required of [
    'index.html', 'src/main.js', 'src/ui/icon.paths.js', 'src/workspaces/workspace.config.js', 'src/workspaces/workspace.lifecycle.js', 'src/workspaces/workspace.route.js', 'src/workspaces/workspace.persistence.js',
    '.topics/.workspaces/viewer.workspace.md', 'docs/architecture/uc001-workspace-lifecycle.md', 'README.md', 'llms.txt', 'tiinex.build.json', 'tiinex.bundle.css', 'tiinex.bundle.js', '.nojekyll'
  ]) if (!existsSync(join(out, required))) fail(`Missing public output: ${required}`);
  for (const forbidden of ['.old', '.git', 'node_modules', '.site-publish', 'desktop.ini', 'src/adapters/leaflet', 'src/verses/map']) {
    if (existsSync(join(out, forbidden))) fail(`Public output must not contain ${forbidden}`);
  }
  const html = existsSync(join(out, 'index.html')) ? read(join(out, 'index.html')) : '';
  if (html.includes('app.js')) fail('Fresh public index must not reference legacy app.js');
  if (!html.includes('./tiinex.bundle.js')) fail('Fresh public index must load bundled tiinex.bundle.js');
  if (!html.includes('./tiinex.bundle.css')) fail('Fresh public index must load bundled tiinex.bundle.css');
  if (html.includes('type="module"') || html.includes("type='module'")) fail('Fresh public index must be file-local safe and not use ES module startup');
  const runtime = existsSync(join(out, 'tiinex.bundle.js')) ? read(join(out, 'tiinex.bundle.js')) : '';
  for (const needle of [
    'TiinexIconPaths', 'TiinexWorkspaceConfig', 'TiinexWorkspaceLifecycle', 'TiinexWorkspaceRoute', 'TiinexWorkspacePersistence', 'HASH_PREFIX', 'STORAGE_KEY',
    'tx-empty-stage', 'tx-uc001-empty-stage-parity', 'tx-shell-config-grounded', 'tx-shell-route-grounded', 'data-home', 'data-create-workspace', 'create-workspace-form', 'data-confirm-close',
    'does not delete source files', 'no GitHub guess', 'tx-workspace-window', 'tx-source-strip',
    'tx-mode-strip', 'tx-primary-stage', 'Lineage root reached.', 'tx-shell-command-portable', 'tx-svg-icon'
  ]) if (!runtime.includes(needle)) fail(`Fresh public runtime missing ${needle}`);
  if (runtime.includes('renderMapVerse') || runtime.includes('data-verse="map"')) fail('Map must stay frozen in public runtime');
  const identityPath = join(out, 'tiinex.build.json');
  if (existsSync(identityPath)) {
    const identity = JSON.parse(read(identityPath));
    if (identity.type !== 'tiinex.public.build.identity.v1') fail('Missing public build identity type');
    if (identity.publicRuntime !== 'bundled-css-and-js') fail('Public build identity must disclose bundled runtime');
    if (!String(identity.source || '').includes('v111')) fail('Public build identity should disclose v111 source shell');
  }
  if (failures.length) {
    console.error(failures.map((f) => `- ${f}`).join('\n'));
    process.exit(1);
  }
  console.log('✓ public build is fresh-shell clean');
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
