import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createPersistenceOwnershipPolicy, PersistenceRouteOwner } from '../app/persistenceOwnership.js';
import { executeCanonicalTransitionLocalCreate } from '../app/canonicalTransitionLocalCreateCommand.js';
import { runLocalDraftUpdateCommand } from '../app/localDraftMutationCommand.js';
import { canDiscardLocalDraft, canEditLocalDraft } from '../artifacts/artifact.localDraft.js';
import { canonicalC14nV2SelfState } from '../integrity/integrity.c14nV2.js';
import { readCanonicalTaskAuthoringValues, renderCanonicalTaskEditMarkdown } from '../schemas/core/task/tiinex.task.v1.authoring.js';
import { CANONICAL_TRANSITION_SCHEMA_CACHE_MANIFEST } from '../transitions/canonicalTransition.schemaCache.js';
import { prepareCanonicalTransitionProductActions, prepareCanonicalTransitionWorkspaceActions } from '../transitions/transition.productPreparation.js';
import '../workspaces/workspace.route.js';
import '../workspaces/workspace.persistenceRecovery.js';
import '../workspaces/workspace.persistenceRouteCache.js';
import '../workspaces/workspace.persistencePresentation.js';
import '../workspaces/workspace.persistenceClear.js';
import '../workspaces/workspace.persistence.js';
import '../workspaces/workspace.lifecycle.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;
const persistence = globalThis.TiinexWorkspacePersistence;
const ownership = createPersistenceOwnershipPolicy(PersistenceRouteOwner.semanticState);
const cachePaths = Object.freeze({
  'tiinex.root.v1': 'src/transitions/canonical-schema-cache/d69b8ff55a56b8cb9282b8684db6a938a4435b94/tiinex.root.v1.schema.md',
  'tiinex.transition.definition.v1': 'src/transitions/canonical-schema-cache/d69b8ff55a56b8cb9282b8684db6a938a4435b94/tiinex.transition.definition.v1.schema.md',
  'tiinex.task.v1': 'src/schemas/core/task/tiinex.task.v1.schema.md',
  'tiinex.topic.v1': 'src/transitions/canonical-schema-cache/52ecdea0a75893882ce282214d155f70e1309c2a/tiinex.topic.v1.schema.md',
  'tiinex.interpretation.v1': 'src/schemas/core/interpretation/tiinex.interpretation.v1.schema.md',
  'tiinex.relation.v1': 'src/transitions/canonical-schema-cache/053d46ce082d4ec261b82abc44ecca403d61e240/tiinex.relation.v1.schema.md',
  'tiinex.schema.contract.v1': 'src/transitions/canonical-schema-cache/053d46ce082d4ec261b82abc44ecca403d61e240/tiinex.schema.contract.v1.schema.md',
  'tiinex.schema.generation.v1': 'src/transitions/canonical-schema-cache/053d46ce082d4ec261b82abc44ecca403d61e240/tiinex.schema.generation.v1.schema.md'
});
const schemaCache = CANONICAL_TRANSITION_SCHEMA_CACHE_MANIFEST.map((item) => ({ ...item, markdown: fs.readFileSync(cachePaths[item.schemaId], 'utf8'), sourceQualification: 'source-qualified-cache' }));
const taskContinuation = bundled('src/schemas/core/task/.transitions/topic-to-task-transition-definition.trace.md', 'Topic to Task', 'compiled-semantic-package-qualified');
const useAs = bundled('src/schemas/core/interpretation/.transitions/evidence-to-interpretation-transition-definition.trace.md', 'Evidence to Interpretation', 'site-local-definition-source-qualified');
const createTopic = bundled('src/schemas/core/topic/.transitions/create-topic-transition-definition.trace.md', 'Create standalone Topic', 'site-local-definition-source-qualified');
const createTask = bundled('src/schemas/core/task/.transitions/create-task-transition-definition.trace.md', 'Create standalone Task', 'site-local-definition-source-qualified');
const definitions = Object.freeze([taskContinuation, useAs, createTopic, createTask]);

// Workspace-level registry: zero-input definitions become product actions without a selected artifact.
const workspacePrepared = prepareCanonicalTransitionWorkspaceActions({ workspaceId: 'w', schemaCache, bundledDefinitions: definitions });
assert.equal(workspacePrepared.state, 'prepared');
const qualifiedRoot = workspacePrepared.actions.filter((action) => action.productCapable);
assert.deepEqual(qualifiedRoot.map((action) => action.canonicalIdentifier).sort(), ['tiinex.site.create-task.v1', 'tiinex.site.create-topic.v1']);
for (const action of qualifiedRoot) {
  assert.equal(action.productScope, 'workspace');
  assert.equal(action.continuityMode, 'root');
  assert.equal(action.availability.inputRoles.length, 0);
  assert.equal(action.availability.context.assignment, 'none');
  assert.equal(action.resultSemantics.parentEffects.length, 0);
  assert.equal(action.resultSemantics.relationEffects.length, 0);
  assert.equal(action.resultSemantics.outputRoles.length, 1);
  assert.equal(action.resultSemantics.outputRoles[0].generationBinding, 'target-schema');
}

const taskAction = qualifiedRoot.find((action) => action.canonicalIdentifier === 'tiinex.site.create-task.v1');
const topicAction = qualifiedRoot.find((action) => action.canonicalIdentifier === 'tiinex.site.create-topic.v1');
assert.deepEqual(taskAction.authoring.requiredInputs, ['Summary', 'Objective', 'Done Criteria', 'Scope', 'Dependencies']);
assert.deepEqual(topicAction.authoring.requiredInputs, ['Summary', 'Current Read', 'Design Direction', 'Next Artifacts']);

const empty = appState([]);
const rootTask = execute(empty, taskAction, { Summary: 'Standalone Task', Objective: 'Do the bounded thing', 'Done Criteria': 'It is complete', Scope: 'Local only', Dependencies: 'None' }, '2026-08-19T06:00:00.000Z');
assert.equal(rootTask.ok, true, rootTask.notice);
assert.equal(rootTask.continuityMode, 'root');
assert.equal(rootTask.bindingPlan.qualification, 'qualified');
assert.equal((rootTask.bindingPlan.roleBindings || rootTask.bindingPlan.bindings || []).length, 0);
assert.equal(rootTask.v423.qualification, 'qualified');
assert.equal(rootTask.record.schemaId, 'tiinex.task.v1');
assert.equal(rootTask.record.parentSchemaId || '', '');
assert.equal(rootTask.record.trace || '', '');
assert.equal(rootTask.record.origin || '', '');
assert.equal(rootTask.record.source?.adapterId, 'local');
assert.equal(rootTask.record.source?.repository, undefined);
assert.equal(rootTask.record.sourceTarget, undefined);
assert.match(rootTask.record.path, /^\.topics\/standalone-task--task(?:-\d+)?\.trace\.md$/);
assert.equal(canonicalC14nV2SelfState(rootTask.record.markdown).state, 'verified');
assert.equal(canEditLocalDraft(rootTask.record), true, 'standalone canonical Task keeps the qualified Task edit owner');
assert.equal(canDiscardLocalDraft(rootTask.record), true);

const rootTopic = execute(empty, topicAction, { Summary: 'Standalone Topic', 'Current Read': 'Current state', 'Design Direction': 'Move here', 'Next Artifacts': 'One task' }, '2026-08-19T06:01:00.000Z');
assert.equal(rootTopic.ok, true, rootTopic.notice);
assert.equal(rootTopic.record.schemaId, 'tiinex.topic.v1');
assert.equal(rootTopic.record.parentSchemaId || '', '');
assert.equal(rootTopic.record.source?.adapterId, 'local');
assert.equal(rootTopic.record.sourceTarget, undefined);
assert.match(rootTopic.record.path, /^\.topics\/standalone-topic--topic(?:-\d+)?\.trace\.md$/);
assert.equal(canonicalC14nV2SelfState(rootTopic.record.markdown).state, 'verified');
assert.equal(canEditLocalDraft(rootTopic.record), false, 'Topic edit is not invented merely because standalone Topic creation exists');
assert.equal(canDiscardLocalDraft(rootTopic.record), true);

// Same-title root creation receives deterministic collision-safe local identity.
const duplicateTask = execute(rootTask.state, taskAction, { Summary: 'Standalone Task', Objective: 'Second', 'Done Criteria': 'Second done', Scope: 'Local only', Dependencies: 'None' }, '2026-08-19T06:02:00.000Z');
assert.equal(duplicateTask.ok, true);
assert.notEqual(duplicateTask.record.path, rootTask.record.path);
assert.notEqual(duplicateTask.record.id, rootTask.record.id);
assert.equal(duplicateTask.workspace.records.filter((record) => record.schemaId === 'tiinex.task.v1').length, 2);

// Persistence/reopen retains exact local root artifact without inventing source/Parent truth.
const env = memoryEnv();
persistence.writeState(rootTopic.state, { storage: env.storage, location: env.location, history: env.history, mode: 'replace' });
const reopened = persistence.readInitialState({ storage: env.storage, location: env.location });
const reopenedTopic = reopened.workspaces[0].records.find((record) => record.id === rootTopic.record.id);
assert(reopenedTopic);
assert.equal(reopenedTopic.schemaId, 'tiinex.topic.v1');
assert.equal(reopenedTopic.parentSchemaId || '', '');
assert.equal(reopenedTopic.source?.adapterId, 'local');
assert.equal(reopenedTopic.sourceTarget, undefined);

// Root-created Task can use the pre-existing schema-aware Edit owner without identity/continuity drift.
const taskProjection = readCanonicalTaskAuthoringValues(rootTask.record.markdown);
assert.equal(taskProjection.qualified, true);
const editedMarkdown = renderCanonicalTaskEditMarkdown(rootTask.record.markdown, { ...taskProjection.values, Summary: 'Standalone Task Edited', Objective: 'Updated objective' });
assert.equal(editedMarkdown.state, 'rendered');
const editedTask = runLocalDraftUpdateCommand({ lifecycle, state: rootTask.state, workspaceId: 'w', recordId: rootTask.record.id, candidate: { ...rootTask.record, markdown: editedMarkdown.markdown }, persistenceOwnership: ownership });
assert.equal(editedTask.ok, true, editedTask.notice);
assert.equal(editedTask.record.id, rootTask.record.id);
assert.equal(editedTask.record.path, rootTask.record.path);
assert.equal(editedTask.record.parentSchemaId || '', '');
assert.equal(editedTask.record.title, 'Standalone Task Edited');
assert.equal(canonicalC14nV2SelfState(editedTask.record.markdown).state, 'verified');

// Output-schema authority is capability-local: stale Topic authority disables Topic only.
const staleTopicCache = schemaCache.map((item) => item.schemaId === 'tiinex.topic.v1' ? { ...item, markdown: `${item.markdown}\n` } : item);
const stalePrepared = prepareCanonicalTransitionWorkspaceActions({ workspaceId: 'w', schemaCache: staleTopicCache, bundledDefinitions: definitions });
const staleTask = stalePrepared.actions.find((action) => action.canonicalIdentifier === 'tiinex.site.create-task.v1');
const staleTopic = stalePrepared.actions.find((action) => action.canonicalIdentifier === 'tiinex.site.create-topic.v1');
assert.equal(staleTask?.productCapable, true);
assert.equal(staleTopic?.productCapable, false);
assert.ok(staleTopic?.capability?.reasons?.includes('creation-authority-unavailable'));

// Existing selected-artifact capabilities remain selected-artifact-only.
const topicParent = localRecord('topic-parent', 'tiinex.topic.v1', 'Parent Topic', '.topics/parent-topic.trace.md');
const contextual = prepareCanonicalTransitionProductActions({ currentRecord: topicParent, workspaceRecords: [topicParent], workspaceId: 'w', schemaCache, bundledDefinitions: definitions });
assert.equal(contextual.actions.some((action) => action.canonicalIdentifier === 'tiinex.site.topic-to-task.v1' && action.productCapable), true);
assert.equal(contextual.actions.some((action) => action.canonicalIdentifier === 'tiinex.site.create-task.v1' && action.productCapable), false, 'root Create does not leak into per-record action surfaces');

// Product surface derives type choice from canonical workspace actions; no per-schema controller branches.
const appSource = fs.readFileSync('src/app/TiinexApp.jsx', 'utf8');
const dialogSource = fs.readFileSync('src/schemas/workspace/workspace.canonicalTaskDialog.views.jsx', 'utf8');
assert(appSource.includes('transitionProductActionsForWorkspace'));
assert(appSource.includes("onOpenCreateArtifact={() => openWorkspaceDialog('create-artifact', workspace.id)}"));
assert(appSource.includes('<WorkspaceCanonicalCreateDialog'));
const workspaceViewSource = fs.readFileSync('src/schemas/workspace/workspace.views.jsx', 'utf8');
assert(workspaceViewSource.includes('aria-label="Create artifact"'));
assert(workspaceViewSource.includes('onOpenCreateArtifact'));
assert(appSource.includes("setDialog('create-workspace')"), 'global Create workspace path remains available');
assert.equal(appSource.includes("canonicalIdentifier === 'tiinex.site.create-task.v1'"), false);
assert.equal(appSource.includes("canonicalIdentifier === 'tiinex.site.create-topic.v1'"), false);
assert(dialogSource.includes('qualifiedActions.map'));
assert(dialogSource.includes('action?.authoring?.requiredInputs'));
assert(dialogSource.includes("action?.continuityMode === 'root'"));
assert.equal(dialogSource.includes("schemaId === 'tiinex.task.v1'"), false, 'root chooser has no Task-specific UI branch');
assert.equal(dialogSource.includes("schemaId === 'tiinex.topic.v1'"), false, 'root chooser has no Topic-specific UI branch');

console.log('post-v432 M0-D standalone Create closure: PASS');

function bundled(path, title, sourceQualification) {
  return Object.freeze({ path, title, markdown: fs.readFileSync(path, 'utf8'), sourceQualification, sourceMode: 'bundled-canonical-transition-definition', source: Object.freeze({ id: `site:${path}`, adapterId: 'static', sourceKind: 'bundled-canonical', sourceMode: 'bundled-canonical-transition-definition', sourceArtifactPath: path }) });
}
function execute(state, action, values, iso) {
  return executeCanonicalTransitionLocalCreate({ lifecycle, state, workspaceId: 'w', currentRecordId: '', definitionKey: action.definitionKey, values, schemaCache, bundledDefinitions: definitions, persistenceOwnership: ownership, now: new Date(iso), clock: () => iso });
}
function appState(records) { return { version: 1, activeWorkspaceId: 'w', view: { universe: 'column', workspaceVerse: 'feed', reader: 'scan', query: '' }, workspaces: [{ id: 'w', name: 'Workspace', title: 'Workspace', createdAt: '2026-08-19T00:00:00.000Z', kind: 'workspace', source: { id: 'local', adapterId: 'local', kind: 'local-session' }, sources: [], sourceOrder: [], records, assets: [], importLog: [], mode: 'feed' }], audit: null }; }
function localRecord(id, schemaId, title, path) { return { id, workspaceId: 'w', title, schemaId, kind: schemaId, path, sourceMode: 'local', source: { id: 'local', adapterId: 'local', kind: 'local-session' }, markdown: `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: ${schemaId}\n  - Created At: 2026-08-19 00:00:00\n  - Summary: ${title}\n\n---\n\n# ${title}\n\nReadable artifact.\n` }; }
function memoryEnv() { const map = new Map(); const location = { pathname: '/index.html', search: '', hash: '' }; const history = { replaceState: (_a,_b,url) => { location.hash = url.includes('#') ? `#${url.split('#').pop()}` : ''; }, pushState: (_a,_b,url) => { location.hash = url.includes('#') ? `#${url.split('#').pop()}` : ''; } }; const storage = { getItem: (key) => map.get(key) || null, setItem: (key,value) => map.set(key,String(value)), removeItem: (key) => map.delete(key) }; return { map, location, history, storage }; }
