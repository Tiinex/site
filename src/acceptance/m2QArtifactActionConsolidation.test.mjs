import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { presentRecordActions, RecordActionKind } from '../actions/record.actions.js';
import { actionClassName } from '../schemas/workspace/workspace.viewFormatting.js';

const source = { adapterId:'github', repo:'Tiinex/docs', ref:'main' };
const ordinary = {
  id:'topic-like', title:'Topic-like', path:'.topics/topic.md', schemaId:'tiinex.unknown.v1', source,
  sourceTarget:{ sourceArtifactPath:'.topics/topic.md' }
};
const workspace = {
  id:'workspace-like', title:'Workspace-like', path:'.topics/workspace.workspace.md', schemaId:'tiinex.workspace.v1', source,
  sourceTarget:{ sourceArtifactPath:'.topics/workspace.workspace.md' }
};

const ordinaryActions = presentRecordActions(ordinary);
const workspaceActions = presentRecordActions(workspace);
const lifecycle = new Set([RecordActionKind.workspaceOpen, RecordActionKind.workspaceMerge]);
const ordinaryIds = ordinaryActions.map((action)=>action.id);
const workspaceGenericIds = workspaceActions.filter((action)=>!lifecycle.has(action.id)).map((action)=>action.id);
assert.deepEqual(workspaceGenericIds, ordinaryIds, 'Workspace Artifact = ordinary artifact actions + workspace lifecycle capabilities');
assert.deepEqual(workspaceActions.slice(-2).map((action)=>action.id), [RecordActionKind.workspaceOpen, RecordActionKind.workspaceMerge], 'Open/Merge are trailing workspace lifecycle capabilities, not a parallel artifact vocabulary');

const ordinarySource = ordinaryActions.find((action)=>action.id===RecordActionKind.source);
const workspaceSource = workspaceActions.find((action)=>action.id===RecordActionKind.source);
assert(ordinarySource && workspaceSource, 'truthful GitHub provenance exposes source action on both artifacts');
assert.equal(actionClassName(workspaceSource), actionClassName(ordinarySource), 'source action styling is generic across artifact types');
assert.equal(actionClassName(workspaceSource).includes('tx-labeled-action'), false, 'Workspace Artifact does not promote source to a special labeled button');
assert(actionClassName(workspaceActions.find((action)=>action.id===RecordActionKind.workspaceOpen)).includes('tx-labeled-action'), 'Open remains a labeled lifecycle affordance');
assert(actionClassName(workspaceActions.find((action)=>action.id===RecordActionKind.workspaceMerge)).includes('tx-labeled-action'), 'Merge remains a labeled lifecycle affordance');

const localWorkspace = presentRecordActions({ id:'local', title:'Local', path:'local.workspace.md', schemaId:'tiinex.workspace.v1', source:{adapterId:'local', kind:'local-session'} });
assert.equal(localWorkspace.some((action)=>action.id===RecordActionKind.source), false, 'local Workspace Artifact does not guess provenance');

const cards = readFileSync(new URL('../schemas/workspace/workspace.cards.views.jsx', import.meta.url), 'utf8');
const button = readFileSync(new URL('../schemas/workspace/workspace.recordActionButton.views.jsx', import.meta.url), 'utf8');
const formatting = readFileSync(new URL('../schemas/workspace/workspace.viewFormatting.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles/app.css', import.meta.url), 'utf8');
assert.equal(cards.includes('tx-workspace-artifact-primary-actions'), false, 'no Workspace-specific primary row remains');
assert.equal(cards.includes('tx-workspace-artifact-secondary-actions'), false, 'no Workspace-specific secondary row remains');
assert.equal(button.includes('workspaceArtifactPrimary'), false, 'RecordActionButton does not branch generic source presentation on Workspace Artifact');
assert.equal(button.includes('tx-workspace-primary-source-action'), false, 'no Workspace-specific Open source class remains');
assert.equal(formatting.includes('workspaceArtifactPrimary'), false, 'generic action class owner has no Workspace source-label exception');
assert.equal(css.includes(':not(.tx-workspace-artifact-record-card) .tx-legacy-action[title="Open source"]'), false, 'generic source CSS no longer excludes Workspace Artifact');
assert.equal(css.includes('.tx-workspace-artifact-primary-actions'), false, 'parallel Workspace Artifact action-row CSS is removed');
assert.equal(css.includes('.tx-workspace-artifact-secondary-actions'), false, 'secondary Workspace Artifact action-row CSS is removed');

console.log('✓ M2 Q Workspace Artifact action-system consolidation tests passed');
