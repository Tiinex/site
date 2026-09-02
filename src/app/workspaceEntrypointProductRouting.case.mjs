import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('./TiinexApp.jsx', import.meta.url), 'utf8');
const localIntake = readFileSync(new URL('./useLocalMaterialIntake.js', import.meta.url), 'utf8');
const handoff = readFileSync(new URL('./handoffPackageImportCommand.js', import.meta.url), 'utf8');
const recipientHandoff = readFileSync(new URL('./handoffPackageRecipientV2.js', import.meta.url), 'utf8');
const workspaceViews = readFileSync(new URL('../schemas/workspace/workspace.views.jsx', import.meta.url), 'utf8');
const addViews = readFileSync(new URL('../schemas/workspace/workspace.add.views.jsx', import.meta.url), 'utf8');
const cards = readFileSync(new URL('../schemas/workspace/workspace.cards.views.jsx', import.meta.url), 'utf8');

assert(app.includes("dropScope: 'global'"), 'page/global drop must explicitly opt out of hidden active-workspace targeting');
assert(app.includes("playthingsExperiment ? 'playthings-global-drop' : 'stage-drop'"), 'Playthings drop must use the same explicit global intake boundary');
assert(localIntake.includes("options.dropScope === 'global' ? ''"), 'global drop must not inherit the currently active workspace id');
assert(handoff.includes('tryReadRecipientFacingV2'), 'Handoff intake must delegate recipient-v2 handling instead of absorbing it into the legacy command');
assert(recipientHandoff.includes('inspectRecipientFacingV2Topology'), 'Handoff drop must reuse Tooling recipient-v2 qualification instead of inferring package workspaces');
assert(recipientHandoff.includes('matchRecipientWorkspace'), 'qualified Handoff workspaces must reconcile independently against already-open workspaces');
assert.equal(app.includes("Playthings is read-only. Exit the experiment to add material."), false, 'Playthings must accept global material drops without exiting the world');
assert.equal(app.includes('handleGlobalWorkspaceDrop(event.dataTransfer'), false, 'page drop must not use the legacy active/open-merge workspace-entrypoint path');
assert.equal(app.includes('addTiinexAppConfig'), false, 'workspace-local Add must not own app/config lifecycle');
assert.equal(addViews.includes('Tiinex app config'), false, 'Tiinex app config must not appear in Add-to-workspace');
assert(workspaceViews.includes('event.stopPropagation(); if (event.dataTransfer) onDropFiles?.'), 'drop onto a concrete workspace must remain scoped material intake and must not bubble into page/global intake');
assert.equal(cards.includes('Source/local states are roles'), false, 'primary cards must not explain internal role architecture');

console.log('✓ global/scoped material drop routing guards passed');
