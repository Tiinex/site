#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const failures = [];

function makeContext(hash = '') {
  const storage = new Map();
  const rootElement = {
    _html: '',
    set innerHTML(value) { this._html = String(value); },
    get innerHTML() { return this._html; },
    querySelectorAll() { return []; },
    querySelector() { return null; }
  };
  const context = {
    console,
    Buffer,
    btoa: (value) => Buffer.from(String(value), 'utf8').toString('base64'),
    atob: (value) => Buffer.from(String(value), 'base64').toString('utf8'),
    document: { getElementById: (id) => (id === 'root' ? rootElement : null) },
    localStorage: {
      getItem: (key) => storage.has(key) ? storage.get(key) : null,
      setItem: (key, value) => storage.set(key, String(value)),
      removeItem: (key) => storage.delete(key)
    },
    location: { pathname: '/index.html', search: '', hash },
    history: { replaceState: (_state, _title, url) => { context.location.hash = String(url).split('#')[1] ? `#${String(url).split('#')[1]}` : ''; }, pushState: (_state, _title, url) => { context.location.hash = String(url).split('#')[1] ? `#${String(url).split('#')[1]}` : ''; } }, addEventListener: () => {}
  };
  context.window = context;
  context.globalThis = context;
  return { context, rootElement };
}

function runScript(context, relativePath) {
  const source = readFileSync(join(root, relativePath), 'utf8');
  vm.runInNewContext(source, context, { filename: relativePath });
}

function runStartup(hash = '') {
  const { context, rootElement } = makeContext(hash);
  runScript(context, 'src/ui/icon.paths.js');
  runScript(context, 'src/workspaces/workspace.config.js');
  runScript(context, 'src/workspaces/workspace.lifecycle.js');
  runScript(context, 'src/workspaces/workspace.route.js');
  runScript(context, 'src/workspaces/workspace.persistence.js');
  runScript(context, 'src/ui/dialog.presenter.js');
  runScript(context, 'src/main.js');
  return rootElement.innerHTML;
}

try {
  const html = runStartup();
  if (!html.includes('tx-empty-stage')) failures.push('empty startup did not render quiet empty stage');
  if (!html.includes('Every handoff starts somewhere')) failures.push('empty startup did not render .workspace.md configured subtitle');
  if (!html.includes('tx-centered-dock-core')) failures.push('empty startup did not render centered dock');
  if (!html.includes('data-multiverse')) failures.push('empty startup did not render real multiverse control');
  if (!html.includes('data-create-workspace')) failures.push('empty startup did not keep dock create affordance');
  if (!html.includes('data-home')) failures.push('empty startup did not keep centered logo home affordance');
} catch (error) {
  failures.push(`fresh startup threw: ${error.stack || error.message}`);
}

try {
  const html = runStartup('#state=not-compatible-with-this-runtime');
  if (!html.includes('tx-empty-stage')) failures.push('invalid/legacy hash should degrade to quiet empty stage');
} catch (error) {
  failures.push(`legacy/invalid hash startup threw: ${error.stack || error.message}`);
}

const main = readFileSync(join(root, 'src/main.js'), 'utf8');
if (!main.includes('window.TiinexIconPaths')) failures.push('main must read icon paths from the UI vocabulary module');
if (!main.includes('window.TiinexWorkspaceConfig')) failures.push('main must read empty-stage config from the workspace config parser');
if (!main.includes('workspaceConfig.help')) failures.push('main must expose parsed workspace help');
if (!main.includes('TiinexWorkspaceRoute')) failures.push('main must use route normalization module');

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}
console.log('✓ runtime startup smoke passed');
