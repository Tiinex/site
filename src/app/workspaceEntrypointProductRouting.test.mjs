import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('./TiinexApp.jsx', import.meta.url), 'utf8');
const workspaceViews = readFileSync(new URL('../schemas/workspace/workspace.views.jsx', import.meta.url), 'utf8');
const addViews = readFileSync(new URL('../schemas/workspace/workspace.add.views.jsx', import.meta.url), 'utf8');
const choiceViews = readFileSync(new URL('../schemas/workspace/workspace.entrypointChoice.views.jsx', import.meta.url), 'utf8');
const cards = readFileSync(new URL('../schemas/workspace/workspace.cards.views.jsx', import.meta.url), 'utf8');

assert(app.includes('useWorkspaceEntrypointIntake'), 'page/global workspace intake must be wired through the workspace-entrypoint lifecycle hook');
assert(app.includes('handleGlobalWorkspaceDrop(event.dataTransfer'), 'page/global drop must route through workspace entrypoint semantics');
assert(app.includes("dialog === 'workspace-entrypoint-choice'"), 'existing workspace set must expose explicit Open/Merge choice for a global workspace entrypoint');
assert.equal(app.includes('addTiinexAppConfig'), false, 'workspace-local Add must not own app/config lifecycle');
assert.equal(addViews.includes('Tiinex app config'), false, 'Tiinex app config must not appear in Add-to-workspace');
assert(workspaceViews.includes('event.stopPropagation(); if (event.dataTransfer) onDropFiles?.'), 'drop onto a concrete workspace must remain scoped material intake and must not bubble into page/global workspace application');
assert(choiceViews.includes('How should Tiinex use this workspace?'), 'global workspace entrypoint choice uses the PoC product question');
assert(/>\s*Open\s*</u.test(choiceViews) && />\s*Merge\s*</u.test(choiceViews), 'global workspace entrypoint choice exposes canonical Open/Merge');
assert.equal(cards.includes('Source/local states are roles'), false, 'primary cards must not explain internal role architecture');

console.log('✓ workspace entrypoint product routing guards passed');
