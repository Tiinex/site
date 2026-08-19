import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createStartupOwnershipGate, runOwnedWorkspaceStartupTransition } from '../app/startupOwnership.js';
import { startupPresentationFor } from '../app/startupPresentation.js';

const app = readFileSync(new URL('../app/TiinexApp.jsx', import.meta.url), 'utf8');
const view = readFileSync(new URL('../app/startupPresentation.views.jsx', import.meta.url), 'utf8');
const empty = readFileSync(new URL('../app/appShell.views.jsx', import.meta.url), 'utf8');

assert(app.includes("startupPresentationFor({ startupPhase, state })"), 'TiinexApp must derive startup presentation from existing startup phase + owned runtime state');
assert(app.includes("return <StartupStage presentation={startupPresentation}"), 'resolving phase must render startup presentation instead of null');
assert(!view.includes('EmptyStage'), 'resolving presentation must not render genuine EmptyStage');
assert(view.includes('role="status"') && view.includes('aria-live="polite"'), 'startup feedback must be calm accessible status, not a technical action panel');
assert(!view.includes('<Button') && !view.includes('onClick='), 'startup presentation must not introduce a manual bootstrap action');
assert(empty.includes('aria-label="No workspace loaded"'), 'genuine EmptyStage remains a distinct resolved product state');

const gate = createStartupOwnershipGate();
let state = { activeWorkspaceId: '', workspaces: [] };
let phase = 'resolving';
let release;
const wait = new Promise((resolve) => { release = resolve; });
const stalePending = runOwnedWorkspaceStartupTransition({
  gate,
  setPhase: (next) => { phase = next; },
  transitionOptions: { commit: (next) => { state = next; }, materializeSource: async () => ({ ok: true }) },
  runTransition: async (options) => {
    await wait;
    options.commit({ activeWorkspaceId: 'old', workspaces: [{ id: 'old', discoveryProgress: { active: true, label: 'Opening OLD workspace' }, workspaceBootstrap: { schema: 'tiinex.workspace.bootstrap.v1', workspaceSetSize: 1 } }] });
    return { ok: true };
  }
});

gate.invalidate();
state = { activeWorkspaceId: 'new', workspaces: [{ id: 'new', discoveryProgress: { active: true, label: 'Opening NEW workspace' }, workspaceBootstrap: { schema: 'tiinex.workspace.bootstrap.v1', workspaceSetSize: 1 } }] };
phase = 'resolving';
release();
const stale = await stalePending;
assert.equal(stale.stale, true);
assert.equal(state.activeWorkspaceId, 'new', 'stale startup owner completion must not overwrite newer owned state');
assert.equal(phase, 'resolving', 'stale startup owner completion must not overwrite newer resolving presentation phase');
assert.equal(startupPresentationFor({ startupPhase: phase, state }).message, 'Opening NEW workspace', 'presentation remains derived from the newer owner after stale completion');

console.log('✓ v428 M0-A cold-start product parity correction passed');
