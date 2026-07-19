#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url)).replace(/[\/]$/, '');
const failures = [];
function path(...parts) { return join(root, ...parts); }
function walk(dir) {
  if (!existsSync(dir)) return [];
  let out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.site-publish', '.git'].includes(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) out = out.concat(walk(p));
    else out.push(p);
  }
  return out;
}
function has(file, needle, label) {
  if (!readFileSync(path(file), 'utf8').includes(needle)) failures.push(label || `${file} missing ${needle}`);
}

if (!existsSync(path('.old', 'app.js'))) failures.push('.old/app.js legacy reference missing');
if (!existsSync(path('.topics', '.workspaces', 'viewer.workspace.md'))) failures.push('root .topics/.workspaces/viewer.workspace.md config missing');
if (!readFileSync(path('.gitignore'), 'utf8').includes('.old/')) failures.push('.old/ must be ignored');
const index = readFileSync(path('index.html'), 'utf8');
if (index.includes('./app.js')) failures.push('index.html must not load legacy app.js');
if (index.includes('type="module"') || index.includes("type='module'")) failures.push('index.html must remain file-local safe and not use ES module startup');
if (!index.includes('./src/ui/icon.paths.js') || !index.includes('./src/workspaces/workspace.config.js') || !index.includes('./src/workspaces/workspace.lifecycle.js') || !index.includes('./src/workspaces/workspace.route.js') || !index.includes('./src/workspaces/workspace.persistence.js') || !index.includes('./src/ui/dialog.presenter.js') || !index.includes('./src/main.js')) failures.push('index.html must load UC-001 scripts in order');

const main = readFileSync(path('src/main.js'), 'utf8');
if (/^\s*import\s/m.test(main) || /^\s*export\s/m.test(main)) failures.push('src/main.js must remain file-local safe with no import/export startup');
if (main.split('\n').length > 420) failures.push('src/main.js exceeds v111 size ceiling; extract more code before continuing');

for (const required of [
  'src/ui/icon.paths.js',
  'src/ui/icon.paths.test.mjs',
  'src/ui/dialog.presenter.js',
  'src/workspaces/workspace.config.js',
  'src/workspaces/workspace.config.test.mjs',
  'src/workspaces/workspace.lifecycle.js',
  'src/workspaces/workspace.route.js',
  'src/workspaces/workspace.persistence.js',
  'src/workspaces/workspace.route.test.mjs',
  'src/workspaces/workspace.lifecycle.test.mjs',
  'src/workspaces/workspace.persistence.test.mjs',
  'src/commands/command.vocabulary.js',
  'docs/architecture/action-command-portability.md',
  'docs/architecture/legacy-behavior-reference.md',
  'docs/architecture/scroll-ownership.md',
  'docs/architecture/uc001-workspace-lifecycle.md'
]) if (!existsSync(path(required))) failures.push(`${required} missing`);

has('src/ui/icon.paths.js', 'TiinexIconPaths', 'icon vocabulary must be isolated from main');
has('src/workspaces/workspace.config.js', 'parseWorkspaceConfig', 'workspace config parser must own .workspace.md parsing');
has('src/workspaces/workspace.config.js', 'Every handoff starts somewhere', 'empty stage text must come from workspace config data');
has('src/workspaces/workspace.config.js', 'workspaceEntrypoints', 'workspace config parser must parse entrypoints');
has('src/workspaces/workspace.config.js', 'repositoryMirrors', 'workspace config parser must parse mirrors');
has('src/workspaces/workspace.config.js', 'repositoryTransports', 'workspace config parser must parse transports');
has('src/workspaces/workspace.config.js', 'parseHelp', 'workspace config parser must parse help entries');
has('src/workspaces/workspace.config.js', 'schemaOrigins', 'workspace config parser must parse schema origins');
has('src/workspaces/workspace.route.js', 'makeRouteState', 'workspace route module must own compact route state');
has('src/workspaces/workspace.route.js', 'normalizeRouteState', 'workspace route module must own route restoration');
has('src/schemas/README.md', 'not the only allowed origin', 'schema README must avoid Tiinex/docs lock-in');
has('src/schemas/origins.js', 'schemaOriginsFromWorkspaceConfig', 'schema origin module missing');
has('src/workspaces/workspace.lifecycle.js', 'createWorkspace', 'workspace lifecycle must own creation');
has('src/workspaces/workspace.lifecycle.js', 'closeWorkspace', 'workspace lifecycle must own closing');
has('src/workspaces/workspace.persistence.js', 'HASH_PREFIX', 'workspace persistence must own hash state');
has('src/workspaces/workspace.persistence.js', 'STORAGE_KEY', 'workspace persistence must own local storage key');
has('src/main.js', 'tx-empty-stage', 'main must render quiet empty workspace stage');
has('src/main.js', 'TiinexWorkspaceConfig', 'main must use workspace config for empty stage');
has('src/main.js', 'tx-multiverse-switch', 'main must expose multiverse switch left of logo');
has('src/main.js', 'tx-shell-config-grounded', 'main must opt into workspace config grounded shell');
has('src/main.js', 'tx-shell-route-grounded', 'main must opt into route-grounded shell');
has('src/main.js', 'data-home', 'logo must be a route-home command');
has('src/main.js', 'data-help', 'global help control must have runtime behavior');
has('src/main.js', 'data-share', 'global share control must have runtime behavior');
has('src/main.js', 'data-multiverse', 'multiverse control must have runtime behavior');
has('src/main.js', 'data-create-workspace', 'main must expose create workspace command');
has('src/main.js', 'data-confirm-close', 'main must expose non-destructive close confirmation');
has('src/main.js', 'no GitHub guess', 'main must disclose no source guessing');
has('src/main.js', 'Lineage root reached.', 'tree mode must retain lineage root trailing card');

if (existsSync(path('src/adapters/leaflet'))) failures.push('Leaflet must not live under adapters');
if (existsSync(path('src/verses/map'))) failures.push('Map verse stays frozen until Column happy path is stable');
for (const file of walk(root)) {
  const rel = relative(root, file).replace(/\\/g, '/');
  if (/desktop\.ini$/i.test(rel)) failures.push(`desktop.ini forbidden: ${rel}`);
  if (!rel.startsWith('.old/') && /leaflet\.boundary\.js$/.test(rel)) failures.push(`stale Leaflet boundary forbidden: ${rel}`);
  if (rel.startsWith('src/') && rel.endsWith('.js') && statSync(file).size > 24_000) failures.push(`source file too large for v109 discipline: ${rel}`);
  if (rel.startsWith('src/') && /from ['"]\.\.\/\.old/.test(readFileSync(file, 'utf8'))) failures.push(`src must not import .old: ${rel}`);
}

if (failures.length) {
  console.error(failures.map((f) => `- ${f}`).join('\n'));
  process.exit(1);
}
console.log('✓ static source guards passed');
