#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const outArg = process.argv.indexOf('--out');
const out = outArg === -1 ? join(root, '.site-publish') : process.argv[outArg + 1];
const viteBin = process.platform === 'win32' ? join(root, 'node_modules/.bin/vite.cmd') : join(root, 'node_modules/.bin/vite');
function path(...parts) { return join(root, ...parts); }
function ensureParent(file) { mkdirSync(dirname(file), { recursive: true }); }
function copy(source, target = source) {
  const from = path(source);
  if (!existsSync(from)) return;
  const to = join(out, target);
  rmSync(to, { recursive: true, force: true });
  ensureParent(to);
  cpSync(from, to, { recursive: true });
}

rmSync(out, { recursive: true, force: true });
const build = spawnSync(viteBin, ['build', '--outDir', out], { cwd: root, encoding: 'utf8', shell: process.platform === 'win32' });
if (build.status !== 0) {
  console.error(build.stdout || '');
  console.error(build.stderr || '');
  process.exit(build.status || 1);
}

for (const entry of ['README.md', 'VALIDATION_NOTES.md', 'LICENSE', 'NOTICE', 'llms.txt', 'favicon.ico', 'robots.txt', 'docs', '.topics']) copy(entry);
writeFileSync(join(out, '.nojekyll'), '', 'utf8');
writeFileSync(join(out, 'tiinex.build.json'), JSON.stringify({
  type: 'tiinex.public.build.identity.v1',
  version: 1,
  builtAt: new Date().toISOString(),
  source: 'v172-audit-support-material-truth',
  publicRuntime: 'vite-react-bundle',
  entry: 'src/main.jsx',
  legacyReference: '.old is optional source-only behavior reference, not public runtime or build input',
  releaseCacheKey: `v172-${Date.now()}`
}, null, 2) + '\n', 'utf8');
console.log(`Built Vite React public shell to ${out}`);
