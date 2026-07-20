#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const failures = [];
const app = readFileSync(join(root, 'src/app/TiinexApp.jsx'), 'utf8');
const workspaceViews = readFileSync(join(root, 'src/schemas/workspace/workspace.views.jsx'), 'utf8') + '\n' + readFileSync(join(root, 'src/schemas/workspace/workspace.add.views.jsx'), 'utf8');
const workspaceModule = readFileSync(join(root, 'src/schemas/workspace/workspace.schema.js'), 'utf8');
const workspaceI18n = readFileSync(join(root, 'src/schemas/workspace/workspace.i18n.js'), 'utf8');
const lifecycle = readFileSync(join(root, 'src/workspaces/workspace.lifecycle.js'), 'utf8');
const persistence = readFileSync(join(root, 'src/workspaces/workspace.persistence.js'), 'utf8');
const config = readFileSync(join(root, 'src/workspaces/workspace.config.js'), 'utf8');
const uiSource = `${app}\n${workspaceViews}\n${workspaceModule}\n${workspaceI18n}\n${lifecycle}`;
function expect(text, needle, label) { if (!text.includes(needle)) failures.push(label); }
function reject(text, needle, label) { if (text.includes(needle)) failures.push(label); }

expect(config, 'Every handoff starts somewhere', 'empty start copy must come from .workspace.md config');
expect(lifecycle, 'workspace.name.required', 'workspace name validation must remain lifecycle-owned');
expect(lifecycle, 'SESSION_SOURCE_KIND', 'local/session source kind must remain explicit');
expect(lifecycle, 'no source files or GitHub provenance inferred', 'local workspace must not guess GitHub provenance');
expect(persistence, 'readInitialState', 'hash restore must be persistence-owned');
expect(persistence, 'readStoredState', 'localStorage must remain cache/mirror, not clean-url bootstrap');
expect(app, 'persistence?.readInitialState', 'React app must restore from hash');
expect(app, 'persistence?.clearState', 'closing last workspace must clean URL/storage state');
expect(uiSource, 'createWorkspace(name)', 'create dialog must use lifecycle createWorkspace');
expect(uiSource, 'Workspace name is required.', 'create dialog must expose required name validation');
expect(uiSource, 'Clean start restored.', 'close last workspace must restore clean start');
expect(uiSource, 'no source files or GitHub provenance inferred', 'React created workspace must disclose local/session boundary');
expect(uiSource, 'No nodes match this view.', 'created empty workspace must match old no-node behavior');
expect(app, 'href="https://github.com/Tiinex"', 'footer must be visible and linkable before workspace creation');
expect(uiSource, 'data-flow="old-like-add-menu"', 'old-like Add flow must be owned by workspace schema companions');
expect(uiSource, 'closeWorkspaceSource', 'explicit source close must use lifecycle');
expect(workspaceModule, "id: 'tiinex.workspace.v1'", 'workspace schema companion module must be registered near schema');
expect(uiSource, 'count <= 1', 'pager arrows must only render for multiple workspaces');
expect(uiSource, 'shouldPageWorkspaces', 'pager arrows must be viewport-size gated');
reject(app, 'localStorage.getItem', 'React app must not bootstrap directly from stale localStorage');
reject(uiSource, 'Create your first workspace', 'UC-001 must not use onboarding-card copy');
reject(uiSource, 'actionButton', 'React UC-001 must not depend on legacy actionButton renderer');

if (failures.length) {
  console.error(failures.map((f) => `- ${f}`).join('\n'));
  process.exit(1);
}
console.log('✓ React UC-001 create/restore/close guards passed');
