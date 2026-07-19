#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url)).replace(/[\/]$/, '');
const outArg = process.argv.indexOf('--out');
const out = outArg === -1 ? join(root, '.site-publish') : process.argv[outArg + 1];
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
mkdirSync(out, { recursive: true });
for (const entry of ['index.html', 'README.md', 'llms.txt', 'favicon.ico', 'robots.txt', 'public', 'src', 'docs']) copy(entry);
writeFileSync(join(out, '.nojekyll'), '', 'utf8');
writeFileSync(join(out, 'tiinex.build.json'), JSON.stringify({
  type: 'tiinex.public.build.identity.v1',
  version: 1,
  builtAt: new Date().toISOString(),
  source: 'v92-source-shell',
  releaseCacheKey: `v92-${Date.now()}`
}, null, 2) + '\n', 'utf8');
console.log(`Built public shell to ${out}`);
