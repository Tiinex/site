#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TIINEX_RUNTIME_ID } from '../src/build.identity.js';

const root = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const failures = [];
function path(...parts) { return join(root, ...parts); }
function read(file) { return readFileSync(path(file), 'utf8'); }
function has(file, needle, label) { if (!read(file).includes(needle)) failures.push(label || `${file} missing ${needle}`); }
function lacks(file, needle, label) { if (read(file).includes(needle)) failures.push(label || `${file} must not include ${needle}`); }
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

// .old is an optional local behavior reference. A clean checkout must validate without it.
if (existsSync(path('.old')) && !existsSync(path('.old', 'app.js'))) failures.push('.old present but .old/app.js missing');
if (!existsSync(path('.topics', '.workspaces', 'viewer.workspace.md'))) failures.push('root .topics/.workspaces/viewer.workspace.md config missing');
if (!existsSync(path('.topics', '.schemas', 'tiinex.workspace.v1.schema.md'))) failures.push('site-local workspace schema missing');
if (!read('.gitignore').includes('.old/')) failures.push('.old/ must be ignored when present as local behavior reference');

if (existsSync(path('yarn.lock')) && read('yarn.lock').includes('applied-caas-gateway')) failures.push('source yarn.lock must use public registry URLs, not applied-caas-gateway');
if (existsSync(path('yarn.lock'))) failures.push('yarn.lock must not exist when npm/package-lock is the dependency truth');
if (!existsSync(path('package-lock.json'))) failures.push('package-lock.json missing for npm ci');
if (!existsSync(path('public', 'assets', 'tiinex-logo-white-transparent.png'))) failures.push('public/assets/tiinex-logo-white-transparent.png missing');

const index = read('index.html');
const workspaceViewFiles = [
  'src/schemas/workspace/workspace.views.jsx',
  'src/schemas/workspace/workspace.chrome.views.jsx',
  'src/schemas/workspace/workspace.discovery.views.jsx',
  'src/schemas/workspace/workspace.tree.views.jsx',
  'src/schemas/workspace/workspace.audit.views.jsx',
  'src/schemas/workspace/workspace.lineage.views.jsx',
  'src/schemas/workspace/workspace.cards.views.jsx',
  'src/schemas/workspace/workspace.read.views.jsx',
  'src/schemas/workspace/workspace.recordDialogs.views.jsx',
  'src/schemas/workspace/workspace.auditBadge.views.jsx',
  'src/schemas/workspace/workspace.displayOptions.views.jsx',
  'src/schemas/workspace/workspace.viewFormatting.js'
];
const reactAppAndWorkspace = [
  'src/app/TiinexApp.jsx',
  'src/app/appShell.views.jsx',
  'src/app/viewport.js',
  'src/app/runtimeState.js',
  'src/app/viewState.js',
  'src/app/githubMaterializationSummary.js',
  'src/app/workspaceDisplayCounts.js',
  'src/app/recordUi.js',
  'src/schemas/workspace/workspace.add.views.jsx',
  'src/schemas/workspace/workspace.schema.js',
  'src/schemas/workspace/workspace.i18n.js',
  'src/workspaces/workspace.lifecycle.js',
  ...workspaceViewFiles
].map(read).join('\n');
if (index.includes('./app.js')) failures.push('index.html must not load legacy app.js');
if (!index.includes('type="module"') || !index.includes('./src/main.jsx')) failures.push('index.html must load React module entry src/main.jsx');
if (index.includes('./src/main.js"') || index.includes("./src/main.js'")) failures.push('index.html must not load legacy vanilla main.js in React runtime');
if (!index.includes(TIINEX_RUNTIME_ID)) failures.push('index.html must disclose current React runtime identity');
if ((reactAppAndWorkspace + '\n' + read('src/actions/record.actions.js') + '\n' + read('src/artifacts/artifact.record.js')).includes('byte ok')) failures.push('runtime must not claim byte ok without byte/digest verification');

const pkg = JSON.parse(read('package.json'));
for (const dep of ['react', 'react-dom', 'vite', '@vitejs/plugin-react', '@fortawesome/react-fontawesome', '@fortawesome/free-solid-svg-icons']) {
  if (!pkg.dependencies?.[dep] && !pkg.devDependencies?.[dep]) failures.push(`package.json missing ${dep}`);
}
if (!pkg.scripts?.dev?.includes('vite')) failures.push('package.json must expose Vite dev server');
if (!read('README.md').includes('Supported local start')) failures.push('README must document supported local start method');

for (const required of [
  'src/main.jsx',
  'src/app/TiinexApp.jsx',
  'src/ui/primitives/Button.jsx',
  'src/ui/primitives/Icon.jsx',
  'src/ui/primitives/Modal.jsx',
  'src/ui/primitives/Field.jsx',
  'src/ui/primitives/Badge.jsx',
  'src/workspaces/workspace.config.js',
  'src/workspaces/workspace.lifecycle.js',
  'src/workspaces/workspace.route.js',
  'src/workspaces/workspace.persistence.js',
  'src/schemas/registry.js',
  'src/schemas/README.md',
  'src/schemas/origins.js',
  'src/schemas/workspace/workspace.schema.js',
  'src/schemas/workspace/workspace.views.jsx',
  'src/schemas/workspace/workspace.add.views.jsx',
  'docs/architecture/uc001-workspace-lifecycle.md'
]) if (!existsSync(path(required))) failures.push(`${required} missing`);

has('src/main.jsx', 'createRoot', 'React entry must mount with react-dom/client');
has('src/main.jsx', './workspaces/workspace.config.js', 'React entry must load workspace config runtime');
if (!reactAppAndWorkspace.includes('schemaRegistry')) failures.push('React app must stay schema-companion aware');
has('src/app/TiinexApp.jsx', 'readInitialState', 'React app must restore from hash state');
if (!reactAppAndWorkspace.includes('clean-url-does-not-bootstrap-stale-local-storage')) failures.push('React runtime must retain clean URL source-boundary invariant');
if (!reactAppAndWorkspace.includes('No nodes match this view.')) failures.push('UC-001 empty workspace state missing');
if (!reactAppAndWorkspace.includes('no source files or GitHub provenance inferred')) failures.push('local/session workspace boundary missing');
if (!reactAppAndWorkspace.includes('workspace-source-strip')) failures.push('source row must remain available');
if (!reactAppAndWorkspace.includes('count <= 1')) failures.push('pager arrows must only be possible with multiple workspaces');
if (!reactAppAndWorkspace.includes('shouldPageWorkspaces')) failures.push('pager arrows must also be gated by viewport size');
has('src/ui/primitives/Icon.jsx', '@fortawesome/react-fontawesome', 'Icon primitive must use Font Awesome React integration');
has('src/styles/app.css', 'tx-react-runtime', 'React shell CSS missing');
has('src/styles/app.css', '--tx-gap-icon', 'icon/text spacing must be token-owned');
has('src/schemas/README.md', 'not the only allowed origin', 'schema README must avoid Tiinex/docs lock-in');
has('src/schemas/registry.js', 'workspaceSchemaModule', 'workspace schema companion module must be registered');
has('src/schemas/workspace/workspace.schema.js', "id: 'tiinex.workspace.v1'", 'workspace schema module must expose workspace schema id');
has('src/schemas/workspace/workspace.add.views.jsx', 'data-flow="old-like-add-menu"', 'old-like Add flow must live in workspace schema companions');
has('.topics/.schemas/tiinex.workspace.v1.schema.md', '## Schema Origins', 'workspace schema must define schema origins');
has('.topics/.schemas/tiinex.workspace.v1.schema.md', '`Viewer local schemas`', 'workspace schema must support viewer-local schema origin language');

if (reactAppAndWorkspace.includes('Create your first workspace')) failures.push('empty start must not use onboarding-card copy');
if (reactAppAndWorkspace.includes('data-verse="map"')) failures.push('Map must not be a primary workspace verse control in UC-001');
lacks('src/main.jsx', 'app.js', 'React entry must not import legacy app.js');

for (const file of walk(root)) {
  const rel = relative(root, file).replace(/\\/g, '/');
  if (/desktop\.ini$/i.test(rel)) failures.push(`desktop.ini forbidden: ${rel}`);
  if (!rel.startsWith('.old/') && /leaflet\.boundary\.js$/.test(rel)) failures.push(`stale Leaflet boundary forbidden: ${rel}`);
  if (rel.startsWith('src/') && rel.endsWith('.js') && statSync(file).size > 24_000) failures.push(`source file too large for v119 discipline: ${rel}`);
  if (rel.startsWith('src/') && /from ['"]\.\.\/\.old/.test(readFileSync(file, 'utf8'))) failures.push(`src must not import .old: ${rel}`);
}

if (failures.length) {
  console.error(failures.map((f) => `- ${f}`).join('\n'));
  process.exit(1);
}
console.log('✓ static React UC-001 source guards passed');
