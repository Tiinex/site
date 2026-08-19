import assert from 'node:assert/strict';
import fs from 'node:fs';
import { presentRecordActions, RecordActionKind, actionAvailabilityForRecord, actionIsRenderable } from '../actions/record.actions.js';
import { projectArtifactAuthoringCapability } from '../app/artifactAuthoringCapability.js';

const editableTask = {
  id: 'local-task', title: 'Local task', schemaId: 'tiinex.task.v1', kind: 'tiinex.task.v1', status: 'draft',
  path: '.topics/demo/001-1-local-task.trace.md', sourceMode: 'local-transition-canonical',
  source: { adapterId: 'local', kind: 'local-session' }, markdown: '# local task fixture'
};
const editAction = presentRecordActions(editableTask).find((action) => action.id === RecordActionKind.editLocal);
assert(editAction, 'qualified browser-local Task draft must expose Edit local draft in the product action layer');
assert.equal(editAction.label, 'Edit local draft');
assert.equal(editAction.icon, 'edit');
assert(actionIsRenderable(editAction), 'Edit local draft action must be renderable');

const sourceTask = { ...editableTask, id: 'source-task', sourceMode: 'source-backed', source: { adapterId: 'github', kind: 'github-tree', repo: 'Tiinex/docs', ref: 'main' } };
assert(!presentRecordActions(sourceTask).some((action) => action.id === RecordActionKind.editLocal), 'source-backed Task must not expose local draft edit');

const topic = { id: 'topic', title: 'Topic', schemaId: 'tiinex.topic.v1', kind: 'tiinex.topic.v1', sourceMode: 'source-backed', source: { adapterId: 'github' }, markdown: '# Topic' };
assert.equal(actionAvailabilityForRecord(topic).reference.enabled, false, 'old cross-artifact Reference must remain unclaimed on current Topic product path');
assert.equal(projectArtifactAuthoringCapability(topic).operations.createRoot.available, false, 'standalone/root Create remains explicitly unavailable rather than inferred from PoC breadth');

const dialogSource = fs.readFileSync(new URL('../schemas/workspace/workspace.recordDialogs.views.jsx', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../app/TiinexApp.jsx', import.meta.url), 'utf8');
assert(dialogSource.includes('actionId === RecordActionKind.editLocal'), 'RecordActionDialog must route Edit local draft to a product edit surface');
assert(dialogSource.includes('data-form=\"local-draft-edit-form\"'), 'local draft edit surface must remain a real form, not a dead action');
assert(dialogSource.includes('exact schema validator must accept the edited artifact'), 'edit surface must state its schema-validation boundary');
assert(appSource.includes('runLocalDraftUpdateCommand'), 'TiinexApp must consume the qualified local draft update command');
assert(appSource.includes('onUpdateLocalDraft={updateLocalDraftRecord}'), 'RecordActionDialog must receive the live update command path');
assert(!appSource.includes('record.reference.cross-artifact'), 'Site must not invent a hidden Reference relation implementation during M0-D');

console.log('post-v430 M0-D authoring parity requalification: PASS');
