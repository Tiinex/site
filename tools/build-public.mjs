#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
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
for (const entry of ['index.html', 'README.md', 'llms.txt', 'favicon.ico', 'robots.txt', 'public', 'src', 'docs', '.topics']) copy(entry);

const cssInputs = ['src/styles/tokens.css', 'src/styles/theme.css', 'src/styles/responsive.css', 'src/styles/app.css'];
const jsInputs = ['src/ui/icon.paths.js', 'src/workspaces/workspace.config.js', 'src/workspaces/workspace.lifecycle.js', 'src/workspaces/workspace.route.js', 'src/workspaces/workspace.persistence.js', 'src/ui/dialog.presenter.js', 'src/main.js'];
const bundleCss = cssInputs.map((file) => `/* ${file} */\n${readFileSync(path(file), 'utf8')}`).join('\n\n');
const bundleJs = jsInputs.map((file) => `/* ${file} */\n${readFileSync(path(file), 'utf8')}`).join('\n\n');
writeFileSync(join(out, 'tiinex.bundle.css'), bundleCss, 'utf8');
writeFileSync(join(out, 'tiinex.bundle.js'), `/* bundled by tools/build-public.mjs; source remains in src/ for auditability */\n${bundleJs}`, 'utf8');

let html = readFileSync(join(out, 'index.html'), 'utf8');
html = html
  .replace(/\s*<link rel="stylesheet" href="\.\/src\/styles\/(?:tokens|theme|responsive|app)\.css">/g, '')
  .replace('</head>', '  <link rel="stylesheet" href="./tiinex.bundle.css">\n</head>')
  .replace(/\s*<script src="\.\/src\/ui\/icon\.paths\.js"><\/script>/g, '')
  .replace(/\s*<script src="\.\/src\/workspaces\/workspace\.(?:config|lifecycle|route|persistence)\.js"><\/script>/g, '')
  .replace(/\s*<script src="\.\/src\/ui\/dialog\.presenter\.js"><\/script>/g, '')
  .replace('<script src="./src/main.js"></script>', '<script src="./tiinex.bundle.js"></script>');
writeFileSync(join(out, 'index.html'), html, 'utf8');

writeFileSync(join(out, '.nojekyll'), '', 'utf8');
writeFileSync(join(out, 'tiinex.build.json'), JSON.stringify({
  type: 'tiinex.public.build.identity.v1',
  version: 1,
  builtAt: new Date().toISOString(),
  source: 'v112-source-shell',
  publicRuntime: 'bundled-css-and-js',
  releaseCacheKey: `v112-${Date.now()}`
}, null, 2) + '\n', 'utf8');
console.log(`Built bundled public shell to ${out}`);
