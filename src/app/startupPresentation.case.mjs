import assert from 'node:assert/strict';
import { startupPresentationFor } from './startupPresentation.js';

assert.equal(startupPresentationFor({ startupPhase: 'resolved', state: {} }), null, 'normal product stage owns resolved startup');
assert.equal(startupPresentationFor({ startupPhase: 'failed', state: {} }), null, 'existing product failure path owns failed startup');

const clean = startupPresentationFor({ startupPhase: 'resolving', state: { workspaces: [], activeWorkspaceId: '' } });
assert.equal(clean?.message, 'Opening workspace', 'first paint must be truthful without guessing default ownership');
assert.equal(clean?.workspaceCount, 0);

const explicit = startupPresentationFor({ startupPhase: 'resolving', state: {
  activeWorkspaceId: 'workspace:explicit',
  workspaces: [{
    id: 'workspace:explicit',
    name: 'Explicit query workspace',
    discoveryProgress: { active: true, label: 'Opening Explicit query workspace workspace' },
    workspaceBootstrap: { schema: 'tiinex.workspace.bootstrap.v1', startState: 'explicit-runtime-config', workspaceSetSize: 1 }
  }]
} });
assert.equal(explicit?.message, 'Opening Explicit query workspace workspace', 'owned explicit progress may become visible once startup has actually selected it');
assert.equal(explicit?.ownedWorkspaceId, 'workspace:explicit');
assert(!explicit?.message.includes('Tiinex docs'), 'explicit resolving presentation must not visually substitute embedded/default ownership');

const multi = startupPresentationFor({ startupPhase: 'resolving', state: {
  activeWorkspaceId: 'workspace:a',
  workspaces: [
    { id: 'workspace:a', discoveryProgress: { active: true, label: 'Opening A workspace' }, workspaceBootstrap: { schema: 'tiinex.workspace.bootstrap.v1', workspaceSetSize: 2, workspaceSetIndex: 0 } },
    { id: 'workspace:b', discoveryProgress: { active: true, label: 'Opening B workspace' }, workspaceBootstrap: { schema: 'tiinex.workspace.bootstrap.v1', workspaceSetSize: 2, workspaceSetIndex: 1 } }
  ]
} });
assert.equal(multi?.message, 'Opening 2 configured workspaces', 'multi-entrypoint startup must not collapse presentation to one guessed source');
assert.equal(multi?.workspaceCount, 2);

console.log('✓ startup presentation model tests passed');
