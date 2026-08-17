import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { createPersistenceOwnershipPolicy, PersistenceRouteOwner } from '../app/persistenceOwnership.js';
import { executeCanonicalTransitionLocalCreate } from '../app/canonicalTransitionLocalCreateCommand.js';
import {
  CANONICAL_TRANSITION_SCHEMA_CACHE_MANIFEST,
  qualifyCanonicalTransitionSchemaCache
} from '../transitions/canonicalTransition.schemaCache.js';
import { prepareCanonicalTransitionProductActions } from '../transitions/transition.productPreparation.js';
import { transitionProductActionsForRecord } from '../transitions/transition.productPresentation.js';
import '../workspaces/workspace.lifecycle.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;
assert.ok(lifecycle?.addWorkspaceRecord, 'workspace lifecycle must be available');

const cacheCommit = 'd69b8ff55a56b8cb9282b8684db6a938a4435b94';
const cacheRoot = new URL(`../transitions/canonical-schema-cache/${cacheCommit}/`, import.meta.url);
const cacheFileBySchema = Object.freeze({
  'tiinex.root.v1': 'tiinex.root.v1.schema.md',
  'tiinex.transition.definition.v1': 'tiinex.transition.definition.v1.schema.md',
  'tiinex.task.v1': 'tiinex.task.v1.schema.md'
});
const schemaCache = CANONICAL_TRANSITION_SCHEMA_CACHE_MANIFEST.map((item) => ({
  ...item,
  markdown: fs.readFileSync(new URL(cacheFileBySchema[item.schemaId], cacheRoot), 'utf8'),
  sourceQualification: 'source-qualified-cache'
}));
const canonicalDefinitionMarkdown = fs.readFileSync(new URL('../transitions/definitions/topic-to-task-transition-definition.trace.md', import.meta.url), 'utf8');
const bundledDefinitions = Object.freeze([{ path: 'src/transitions/definitions/topic-to-task-transition-definition.trace.md', title: 'Topic to Task', markdown: canonicalDefinitionMarkdown, sourceQualification: 'bundled-canonical' }]);
const fullValues = Object.freeze({
  Summary: 'Canonical task',
  Objective: 'Deliver the first canonical product vertical slice.',
  'Done Criteria': 'Exactly one qualified local Task exists.',
  Scope: 'Browser-local canonical Topic to Task creation only.',
  Dependencies: 'One recoverable source-backed Topic.'
});
const fixedRef = '1111111111111111111111111111111111111111';

function participantMarkdown(schemaId = 'tiinex.topic.v1', title = 'Source Topic') {
  return `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: ${schemaId}\n  - Created At: 2026-08-16 00:00:00\n  - Summary: ${title}\n\n---\n\n# ${title}\n\nReadable participant.\n\n# Continuity Integrity\n\n- product-fixture-v1\n  - Towards: self\n  - Value: ${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}\n`;
}
function sourceBackedRecord({ id = 'topic-1', title = 'Source Topic', schemaId = 'tiinex.topic.v1', path = '.topics/source-topic.trace.md', ref = fixedRef, repository = 'Tiinex/docs', workspaceId = 'workspace-1' } = {}) {
  return Object.assign(createRecordFromMarkdown(participantMarkdown(schemaId, title), { path, name: title, sourceMode: 'source-backed' }), {
    id, workspaceId, title, kind: schemaId, schemaId, path, sourceMode: 'source-backed',
    source: { id: `github:${repository}`, kind: 'github-tree', adapterId: 'github', repository, repo: repository, ref, rootPath: '' },
    sourceTarget: { sourceArtifactPath: path, inputTarget: path }
  });
}
function localRecord({ id = 'topic-local', title = 'Local Topic', schemaId = 'tiinex.topic.v1', workspaceId = 'workspace-1' } = {}) {
  const path = `.topics/${id}.trace.md`;
  return Object.assign(createRecordFromMarkdown(participantMarkdown(schemaId, title), { path, name: title, sourceMode: 'local' }), {
    id, workspaceId, title, kind: schemaId, schemaId, path, sourceMode: 'local', source: { id: 'local', adapterId: 'local', kind: 'local-session' }
  });
}
function definitionRecord(markdown = canonicalDefinitionMarkdown, id = 'workspace-definition') {
  return Object.assign(createRecordFromMarkdown(markdown, { path: `.topics/transitions/${id}.trace.md`, name: 'Topic to Task', sourceMode: 'local' }), { id, workspaceId: 'workspace-1', source: { id: 'local', adapterId: 'local', kind: 'local-session' } });
}
function appState(records, workspaceId = 'workspace-1') {
  return {
    version: 1,
    activeWorkspaceId: workspaceId,
    view: { universe: 'column', workspaceVerse: 'feed', reader: 'scan', query: '' },
    workspaces: [{ id: workspaceId, name: 'Product', title: 'Product', createdAt: '2026-08-17T01:00:00.000Z', kind: 'workspace', source: { id: 'local', adapterId: 'local', kind: 'local-session' }, sources: [], sourceOrder: [], records, assets: [], importLog: [], mode: 'feed' }],
    audit: null
  };
}
function prep(currentRecord, records, overrides = {}) {
  return prepareCanonicalTransitionProductActions({ currentRecord, workspaceRecords: records, workspaceId: overrides.workspaceId === undefined ? 'workspace-1' : overrides.workspaceId, schemaCache: overrides.schemaCache || schemaCache, bundledDefinitions: overrides.bundledDefinitions === undefined ? bundledDefinitions : overrides.bundledDefinitions });
}
function capableAction(preparation) { return (preparation.actions || []).find((action) => action.canonicalIdentifier === 'tiinex.site.topic-to-task.v1'); }
function countingLifecycle() {
  let adds = 0;
  return {
    lifecycle: Object.freeze({ ...lifecycle, addWorkspaceRecord(...args) { adds += 1; return lifecycle.addWorkspaceRecord(...args); } }),
    count: () => adds
  };
}
function execute({ state, currentRecordId, definitionKey, values = fullValues, cache = schemaCache, definitions = bundledDefinitions, workspaceId = 'workspace-1' }) {
  const counter = countingLifecycle();
  const result = executeCanonicalTransitionLocalCreate({
    lifecycle: counter.lifecycle,
    state,
    workspaceId,
    currentRecordId,
    definitionKey,
    values,
    schemaCache: cache,
    bundledDefinitions: definitions,
    persistenceOwnership: createPersistenceOwnershipPolicy(PersistenceRouteOwner.semanticState),
    now: new Date('2026-08-17T01:23:45.000Z'),
    clock: () => '2026-08-17T01:23:45.000Z'
  });
  return { result, adds: counter.count() };
}
function legacyFallback(record, records, options = {}) {
  return transitionProductActionsForRecord(record, { workspaceRecords: records, workspaceId: 'workspace-1', maxPrimary: 10, schemaCache: options.schemaCache || schemaCache, bundledDefinitions: options.bundledDefinitions === undefined ? bundledDefinitions : options.bundledDefinitions });
}

// A/B. Exact bundled canonical definition qualifies, and current Topic is the explicit current participant even with another suitable Topic loaded.
const sourceTopic = sourceBackedRecord();
const unrelatedTopic = sourceBackedRecord({ id: 'topic-2', title: 'Unrelated Topic', path: '.topics/unrelated-topic.trace.md' });
const records = [sourceTopic, unrelatedTopic];
const prepared = prep(sourceTopic, records);
const action = capableAction(prepared);
assert.equal(prepared.state, 'prepared');
assert.equal(action?.definition?.artifact?.schemaId, 'tiinex.transition.definition.v1');
assert.equal(action?.definition?.canonicalReadQualified, true);
assert.equal(action?.definition?.contractValidation?.status, 'valid');
assert.equal(action?.definition?.artifact?.schemaId === 'tiinex.site.transition.legacy-shorthand.v1', false);
assert.equal(action?.availability?.availability, 'available');
assert.equal(action?.availability?.context?.assignment, 'unique');
assert.equal(action?.currentParticipant?.identity?.id, prepared.currentParticipant?.identity?.id);
assert.equal(action?.productCapable, true);
assert.deepEqual(action?.authoring?.requiredInputs, ['Summary', 'Objective', 'Done Criteria', 'Scope', 'Dependencies']);
assert.deepEqual(action?.authoring?.toolingConfigurationFields, ['version', 'createTitle', 'summaryPrompt', 'summaryPlaceholder', 'whyPrompt', 'whyPlaceholder']);
assert.equal(action?.authoring?.requiredInputs.includes('createTitle'), false, 'tooling configuration must not become authoring input');
assert.equal(action?.parentRecovery?.state, 'qualified');
assert.match(action.parentRecovery.permalink, /\/blob\/1111111111111111111111111111111111111111\/\.topics\/source-topic\.trace\.md$/);

// Workspace-loaded canonical Transition Definitions are eligible without the bundled default being present.
const loadedDefinition = definitionRecord();
const loadedPrepared = prep(sourceTopic, [sourceTopic, loadedDefinition], { bundledDefinitions: [] });
assert.equal(capableAction(loadedPrepared)?.productCapable, true);
assert.equal(capableAction(loadedPrepared)?.definition?.canonicalReadQualified, true);

// C/H/I/L. Complete fresh invocation crosses the bounded local mutation boundary exactly once.
const successState = appState(records);
const beforeSource = JSON.stringify(sourceTopic);
const success = execute({ state: successState, currentRecordId: sourceTopic.id, definitionKey: action.definitionKey });
assert.equal(success.result.ok, true);
assert.equal(success.adds, 1);
assert.equal(success.result.bindingPlan?.qualification, 'qualified');
assert.equal(success.result.v423?.qualification, 'qualified');
assert.equal(success.result.taskQualification?.state, 'qualified');
assert.equal(success.result.taskQualification?.projection?.validation?.findings?.filter((finding) => finding.severity === 'error').length, 0);
assert.equal(success.result.record?.kind, 'tiinex.task.v1');
assert.equal(success.result.record?.schemaId, 'tiinex.task.v1');
assert.equal(success.result.record?.sourceMode, 'local-transition-canonical');
assert.equal(success.result.record?.status, 'local');
assert.equal(success.result.record?.path, '');
assert.equal(success.result.record?.source?.adapterId, 'local');
assert.equal(success.result.record?.source?.repository, undefined);
assert.equal(success.result.record?.source?.ref, undefined);
assert.equal(success.result.remoteWrite, false);
assert.equal(success.result.sourceMutation, false);
assert.equal(success.result.concretePath, null);
assert.equal(success.result.relationMaterialization, false);
assert.equal((success.result.workspace?.records || []).filter((record) => record.schemaId === 'tiinex.task.v1' || record.kind === 'tiinex.task.v1').length, 1);
assert.equal(JSON.stringify(success.result.workspace.records.find((record) => record.id === sourceTopic.id)), beforeSource);
for (const [heading, value] of [['Objective', fullValues.Objective], ['Done Criteria', fullValues['Done Criteria']], ['Scope', fullValues.Scope], ['Dependencies', fullValues.Dependencies]]) {
  assert.ok(success.result.record.markdown.includes(`## ${heading}\n\n${value}`));
}
assert.ok(success.result.record.markdown.includes(`# ${fullValues.Summary}`));
assert.ok(success.result.record.markdown.includes(`- Trace: ${action.parentRecovery.trace}`));
assert.ok(success.result.record.markdown.includes(`- Origin: ${action.parentRecovery.origin}`));
assert.ok(!success.result.record.markdown.includes('## Next Step'));
assert.ok(!success.result.record.markdown.includes('Draft Local Integrity'));

// D. Missing one required Task generation value makes v423 incomplete and produces zero mutations.
const incompleteValues = { ...fullValues }; delete incompleteValues.Dependencies;
const incomplete = execute({ state: successState, currentRecordId: sourceTopic.id, definitionKey: action.definitionKey, values: incompleteValues });
assert.equal(incomplete.result.ok, false);
assert.equal(incomplete.result.v423?.qualification, 'incomplete');
assert.equal(incomplete.adds, 0);

// E. Wrong current schema cannot expose the canonical Topic→Task product capability.
const wrongCurrent = sourceBackedRecord({ id: 'wrong', title: 'Task-like current', schemaId: 'tiinex.task.v1', path: '.topics/wrong.trace.md' });
const wrongPrepared = prep(wrongCurrent, [wrongCurrent]);
assert.notEqual(capableAction(wrongPrepared)?.productCapable, true);
const wrongCommand = execute({ state: appState([wrongCurrent]), currentRecordId: wrongCurrent.id, definitionKey: 'tiinex.site.topic-to-task.v1' });
assert.equal(wrongCommand.result.ok, false);
assert.equal(wrongCommand.adds, 0);

// F. Contradictory observations for one participant identity fail closed; no unrelated record is auto-selected.
const conflictObservation = sourceBackedRecord({ id: 'conflict-task-observation', title: 'Conflicting observation', schemaId: 'tiinex.task.v1', path: sourceTopic.path });
const ambiguousPrepared = prep(sourceTopic, [sourceTopic, conflictObservation]);
assert.notEqual(capableAction(ambiguousPrepared)?.productCapable, true);
const ambiguous = execute({ state: appState([sourceTopic, conflictObservation]), currentRecordId: sourceTopic.id, definitionKey: capableAction(ambiguousPrepared)?.definitionKey || action.definitionKey });
assert.equal(ambiguous.result.ok, false);
assert.equal(ambiguous.adds, 0);

// G. Parent recovery is mandatory; a local Topic does not silently lose Parent to become executable.
const localTopic = localRecord();
const localPrepared = prep(localTopic, [localTopic]);
const localAction = capableAction(localPrepared);
assert.equal(localAction?.parentRecovery?.state, 'unavailable');
assert.equal(localAction?.productCapable, false);
const noParent = execute({ state: appState([localTopic]), currentRecordId: localTopic.id, definitionKey: localAction?.definitionKey || action.definitionKey });
assert.equal(noParent.result.ok, false);
assert.equal(noParent.adds, 0);
assert.match(noParent.result.notice, /cannot be referenced safely/i);

// J. Cache identity is a hard product gate: stale or missing bytes never become canonical authority.
const staleCache = schemaCache.map((item) => item.schemaId === 'tiinex.task.v1' ? { ...item, markdown: `${item.markdown}\n` } : item);
assert.equal(qualifyCanonicalTransitionSchemaCache(staleCache).sourceQualified, false);
const stalePrepared = prep(sourceTopic, [sourceTopic], { schemaCache: staleCache });
assert.equal(stalePrepared.state, 'schema-cache-unqualified');
assert.equal(stalePrepared.actions.length, 0);
const missingCache = schemaCache.filter((item) => item.schemaId !== 'tiinex.task.v1');
assert.equal(prep(sourceTopic, [sourceTopic], { schemaCache: missingCache }).state, 'schema-cache-unqualified');

// K/M. Malformed canonical authority stays malformed; legacy remains only compatibility presentation truth.
const malformedDefinition = canonicalDefinitionMarkdown.replace('Effect: create-new', 'Effect: cretae-new');
const malformedDefinitions = [{ ...bundledDefinitions[0], markdown: malformedDefinition }];
const malformedPrepared = prep(sourceTopic, [sourceTopic], { bundledDefinitions: malformedDefinitions });
const malformedAction = capableAction(malformedPrepared);
assert.notEqual(malformedAction?.definition?.canonicalReadQualified, true);
assert.notEqual(malformedAction?.productCapable, true);
const malformedPresented = legacyFallback(sourceTopic, [sourceTopic], { bundledDefinitions: malformedDefinitions });
assert.equal(malformedPresented.some((item) => item.kind === 'canonical-transition-product'), false);
assert.equal(malformedPresented.some((item) => item.definitionId === 'topic.continue.task'), true, 'legacy compatibility may remain only as legacy fallback');
const noDefinitionPresented = legacyFallback(sourceTopic, [sourceTopic], { bundledDefinitions: [] });
assert.equal(noDefinitionPresented.some((item) => item.definitionId === 'topic.continue.task'), true);
const canonicalPresented = legacyFallback(sourceTopic, [sourceTopic]);
assert.equal(canonicalPresented.filter((item) => item.kind === 'canonical-transition-product').length, 1);
assert.equal(canonicalPresented.some((item) => item.definitionId === 'topic.continue.task'), false, 'canonical product capability suppresses the exact legacy compatibility action only');

// Missing destination/workspace and malformed Parent source metadata both produce zero mutations.
const missingWorkspace = execute({ state: successState, currentRecordId: sourceTopic.id, definitionKey: action.definitionKey, workspaceId: 'missing-workspace' });
assert.equal(missingWorkspace.result.ok, false);
assert.equal(missingWorkspace.adds, 0);
const nonPinnedTopic = sourceBackedRecord({ id: 'unpinned', title: 'Unpinned Topic', path: '.topics/unpinned.trace.md', ref: 'main' });
const unpinnedPrepared = prep(nonPinnedTopic, [nonPinnedTopic]);
assert.equal(capableAction(unpinnedPrepared)?.productCapable, false);

// Static architecture/product guards: canonical product slice never invokes legacy materialization/path semantics.
const commandSource = fs.readFileSync(new URL('../app/canonicalTransitionLocalCreateCommand.js', import.meta.url), 'utf8');
const preparationSource = fs.readFileSync(new URL('../transitions/transition.productPreparation.js', import.meta.url), 'utf8');
const presentationSource = fs.readFileSync(new URL('../transitions/transition.productPresentation.js', import.meta.url), 'utf8');
const materializerSource = fs.readFileSync(new URL('../transitions/transition.taskMaterializer.js', import.meta.url), 'utf8');
const dialogSource = fs.readFileSync(new URL('../schemas/workspace/workspace.canonicalTaskDialog.views.jsx', import.meta.url), 'utf8');
for (const forbidden of ['allocateContinuationPath', 'ensureUniqueTransitionPath', 'createContinuationDraft']) assert.equal(commandSource.includes(forbidden), false, `canonical command must not call ${forbidden}`);
assert.ok(commandSource.includes('buildCanonicalTransitionInvocationBindingPlan'));
assert.ok(commandSource.includes('buildCanonicalTransitionOutputMaterializationPlan'));
assert.ok(commandSource.includes('prepareCanonicalTransitionProductActions'));
assert.equal(preparationSource.includes("'tiinex.site.topic-to-task.v1'"), false, 'semantic product capability must not be selected by canonical identifier');
assert.ok(presentationSource.includes("'tiinex.site.topic-to-task.v1': 'topic.continue.task'"), 'legacy suppression bridge must remain explicit presentation policy');
assert.equal(materializerSource.includes('Next Step'), false);
assert.equal(materializerSource.includes('Draft Local Integrity'), false);
for (const field of ['Task title', 'Objective', 'Done Criteria', 'Scope', 'Dependencies']) assert.ok(dialogSource.includes(field), `canonical Task form must present ${field}`);
assert.ok(canonicalDefinitionMarkdown.includes('Canonical Identifier: tiinex.site.topic-to-task.v1'));
assert.equal(canonicalDefinitionMarkdown.includes('tiinex.site.transition.legacy-shorthand.v1'), false);

// Adjacent-state/product sweep: each fail-closed axis yields zero mutations; successful mutation always used fresh v423 truth.
const sweep = [
  ['source-backed/exact/complete/workspace/parent/cache/canonical', () => execute({ state: successState, currentRecordId: sourceTopic.id, definitionKey: action.definitionKey }), true],
  ['local-topic', () => execute({ state: appState([localTopic]), currentRecordId: localTopic.id, definitionKey: localAction?.definitionKey || action.definitionKey }), false],
  ['wrong-schema', () => execute({ state: appState([wrongCurrent]), currentRecordId: wrongCurrent.id, definitionKey: action.definitionKey }), false],
  ['missing-generation-input', () => execute({ state: successState, currentRecordId: sourceTopic.id, definitionKey: action.definitionKey, values: incompleteValues }), false],
  ['missing-destination', () => execute({ state: successState, currentRecordId: sourceTopic.id, definitionKey: action.definitionKey, workspaceId: '' }), false],
  ['unrecoverable-parent', () => execute({ state: appState([nonPinnedTopic]), currentRecordId: nonPinnedTopic.id, definitionKey: action.definitionKey }), false],
  ['wrong-cache-bytes', () => execute({ state: successState, currentRecordId: sourceTopic.id, definitionKey: action.definitionKey, cache: staleCache }), false],
  ['missing-cache', () => execute({ state: successState, currentRecordId: sourceTopic.id, definitionKey: action.definitionKey, cache: missingCache }), false],
  ['malformed-definition', () => execute({ state: successState, currentRecordId: sourceTopic.id, definitionKey: action.definitionKey, definitions: malformedDefinitions }), false],
  ['definition-absent', () => execute({ state: successState, currentRecordId: sourceTopic.id, definitionKey: action.definitionKey, definitions: [] }), false]
];
for (const [name, run, shouldSucceed] of sweep) {
  const outcome = run();
  assert.equal(outcome.result.ok, shouldSucceed, `${name} outcome`);
  assert.equal(outcome.adds, shouldSucceed ? 1 : 0, `${name} mutation count`);
  if (shouldSucceed) {
    assert.equal(outcome.result.v423?.qualification, 'qualified');
    assert.equal(outcome.result.record?.path, '');
  }
}



// Architect v424 product-capability + source-authority closure batch.
function bundled(markdown, path = 'src/transitions/definitions/topic-to-task-transition-definition.trace.md', title = 'Topic to Task') {
  return [{ path, title, markdown, sourceQualification: 'bundled-canonical' }];
}
function actionById(preparation, id) { return (preparation.actions || []).find((candidate) => candidate.canonicalIdentifier === id); }
function mutatedDefinition(id, edits = []) {
  let markdown = canonicalDefinitionMarkdown.replace('Canonical Identifier: tiinex.site.topic-to-task.v1', `Canonical Identifier: ${id}`);
  for (const [from, to] of edits) markdown = markdown.replace(from, to);
  return markdown;
}
function assertNoMutation(outcome, label) {
  assert.equal(outcome.result.ok, false, `${label}: outcome`);
  assert.equal(outcome.adds, 0, `${label}: mutation count`);
}

// A/E. Product authority is anchored to the exact current-assigned Topic Parent role, not product identity.
const signalId = 'tiinex.site.signal-to-task.v1';
const signalDefinitionMarkdown = mutatedDefinition(signalId, [['Schema Constraint: tiinex.topic.v1', 'Schema Constraint: tiinex.signal.v1']]);
const signalRecord = sourceBackedRecord({ id: 'signal-1', title: 'Source Signal', schemaId: 'tiinex.signal.v1', path: '.signals/source-signal.trace.md' });
const signalPrepared = prep(signalRecord, [signalRecord], { bundledDefinitions: bundled(signalDefinitionMarkdown) });
const signalAction = actionById(signalPrepared, signalId);
assert.equal(signalAction?.definition?.canonicalReadQualified, true);
assert.equal(signalAction?.availability?.availability, 'available');
assert.equal(signalAction?.parentRecovery?.state, 'qualified');
assert.equal(signalAction?.parentRecovery?.schemaId, 'tiinex.signal.v1');
assert.equal(signalAction?.productCapable, false);
assert.ok(signalAction?.capability?.reasons?.includes('unsupported-parent-role-capability'));
assert.ok(signalAction?.capability?.reasons?.includes('current-topic-schema-unqualified'));
assertNoMutation(execute({ state: appState([signalRecord]), currentRecordId: signalRecord.id, definitionKey: signalAction.definitionKey, definitions: bundled(signalDefinitionMarkdown) }), 'Signal→Task must not execute as Topic→Task');

const parentOtherRoleId = 'tiinex.site.topic-task-parent-role.v1';
const parentOtherRoleDefinition = mutatedDefinition(parentOtherRoleId, [
  ['\n## Output Roles', '\n- parent-task\n  - Meaning: Different required Parent role.\n  - Minimum Count: 1\n  - Maximum Count: 1\n  - Target Kind: artifact\n  - Schema Constraint: tiinex.task.v1\n  - Acquisition Policy: existing-only\n\n## Output Roles'],
  ['Parent Binding: source-topic', 'Parent Binding: parent-task']
]);
const existingTaskParent = sourceBackedRecord({ id: 'existing-task-parent', title: 'Existing Task Parent', schemaId: 'tiinex.task.v1', path: '.tasks/existing-task.trace.md' });
const parentOtherPrepared = prep(sourceTopic, [sourceTopic, existingTaskParent], { bundledDefinitions: bundled(parentOtherRoleDefinition) });
const parentOtherAction = actionById(parentOtherPrepared, parentOtherRoleId);
assert.equal(parentOtherAction?.definition?.canonicalReadQualified, true);
assert.equal(parentOtherAction?.availability?.context?.assignment, 'unique');
assert.equal(parentOtherAction?.productCapable, false);
assert.ok(parentOtherAction?.capability?.reasons?.includes('parent-role-not-current-artifact-role'));
assertNoMutation(execute({ state: appState([sourceTopic, existingTaskParent]), currentRecordId: sourceTopic.id, definitionKey: parentOtherAction.definitionKey, definitions: bundled(parentOtherRoleDefinition) }), 'Parent role must be current-assigned role');

const unsupportedShapeCases = [
  ['parent-target-kind', mutatedDefinition('tiinex.site.topic-parent-kind.v1', [['  - Target Kind: artifact\n  - Schema Constraint: tiinex.topic.v1', '  - Target Kind: non-artifact']])],
  ['parent-cardinality', mutatedDefinition('tiinex.site.topic-parent-cardinality.v1', [['  - Minimum Count: 1\n  - Maximum Count: 1\n  - Target Kind: artifact\n  - Schema Constraint: tiinex.topic.v1', '  - Minimum Count: 0\n  - Maximum Count: 1\n  - Target Kind: artifact\n  - Schema Constraint: tiinex.topic.v1']])],
  ['parent-acquisition', mutatedDefinition('tiinex.site.topic-parent-acquisition.v1', [['  - Acquisition Policy: existing-only', '  - Acquisition Policy: existing-or-create']])],
  ['output-cardinality', mutatedDefinition('tiinex.site.topic-output-cardinality.v1', [['- task\n  - Meaning: Task created by the invocation.\n  - Minimum Count: 1\n  - Maximum Count: 1', '- task\n  - Meaning: Task created by the invocation.\n  - Minimum Count: 0\n  - Maximum Count: 1']])],
  ['lifecycle-revise', mutatedDefinition('tiinex.site.topic-lifecycle-revise.v1', [['  - Effect: create-new\n  - Logical Continuity: new-subject\n  - Required Materialization Operation: create', '  - Effect: revise-current\n  - Logical Continuity: preserve-subject\n  - Required Materialization Operation: revise']])],
  ['placement-override', mutatedDefinition('tiinex.site.topic-placement-override.v1', [['  - Explicit Override Allowed: no', '  - Explicit Override Allowed: yes']])]
];
for (const [label, markdown] of unsupportedShapeCases) {
  const id = markdown.match(/Canonical Identifier: ([^\n]+)/)?.[1];
  const p = prep(sourceTopic, [sourceTopic], { bundledDefinitions: bundled(markdown) });
  const a = actionById(p, id);
  assert.notEqual(a?.productCapable, true, `${label}: capability unavailable`);
  const key = a?.definitionKey || action.definitionKey;
  assertNoMutation(execute({ state: appState([sourceTopic]), currentRecordId: sourceTopic.id, definitionKey: key, definitions: bundled(markdown) }), label);
}

const missingParentRoleDefinition = mutatedDefinition('tiinex.site.topic-parent-missing.v1', [['Parent Binding: source-topic', 'Parent Binding: missing-role']]);
const missingParentRolePrepared = prep(sourceTopic, [sourceTopic], { bundledDefinitions: bundled(missingParentRoleDefinition) });
const missingParentRoleAction = actionById(missingParentRolePrepared, 'tiinex.site.topic-parent-missing.v1');
assert.notEqual(missingParentRoleAction?.productCapable, true);
assertNoMutation(execute({ state: appState([sourceTopic]), currentRecordId: sourceTopic.id, definitionKey: missingParentRoleAction?.definitionKey || action.definitionKey, definitions: bundled(missingParentRoleDefinition) }), 'missing Parent role');

const wrongOutputSchemaDefinition = mutatedDefinition('tiinex.site.topic-output-schema.v1', [['  - Schema Constraint: tiinex.task.v1\n  - Generation Binding: target-schema', '  - Schema Constraint: tiinex.topic.v1\n  - Generation Binding: target-schema']]);
const wrongOutputSchemaPrepared = prep(sourceTopic, [sourceTopic], { bundledDefinitions: bundled(wrongOutputSchemaDefinition) });
const wrongOutputSchemaAction = actionById(wrongOutputSchemaPrepared, 'tiinex.site.topic-output-schema.v1');
assert.notEqual(wrongOutputSchemaAction?.productCapable, true);
assertNoMutation(execute({ state: appState([sourceTopic]), currentRecordId: sourceTopic.id, definitionKey: wrongOutputSchemaAction?.definitionKey || action.definitionKey, definitions: bundled(wrongOutputSchemaDefinition) }), 'wrong output schema');

const noMaterializationDefinition = mutatedDefinition('tiinex.site.topic-placement-none.v1', [['  - Placement Intent: new-materialization', '  - Placement Intent: no-materialization']]);
const noMaterializationPrepared = prep(sourceTopic, [sourceTopic], { bundledDefinitions: bundled(noMaterializationDefinition) });
const noMaterializationAction = actionById(noMaterializationPrepared, 'tiinex.site.topic-placement-none.v1');
assert.notEqual(noMaterializationAction?.productCapable, true);
assertNoMutation(execute({ state: appState([sourceTopic]), currentRecordId: sourceTopic.id, definitionKey: noMaterializationAction?.definitionKey || action.definitionKey, definitions: bundled(noMaterializationDefinition) }), 'unsupported placement intent');

const relationDefinition = mutatedDefinition('tiinex.site.topic-relation.v1', [[
  '## Relation Effects\n\n- none',
  '## Relation Effects\n\n- task-derived-from-topic\n  - Effect: declare\n  - Subject Binding: task\n  - Predicate Identifier: derived-from\n  - Predicate Meaning: Task is derived from Topic.\n  - Object Binding: source-topic\n  - Directionality: directed\n  - Member Mapping: pairwise'
]]);
const relationPrepared = prep(sourceTopic, [sourceTopic], { bundledDefinitions: bundled(relationDefinition) });
const relationAction = actionById(relationPrepared, 'tiinex.site.topic-relation.v1');
assert.equal(relationAction?.definition?.canonicalReadQualified, true);
assert.equal(relationAction?.productCapable, false);
assert.ok(relationAction?.capability?.reasons?.includes('relation-effects-not-supported'));
assertNoMutation(execute({ state: appState([sourceTopic]), currentRecordId: sourceTopic.id, definitionKey: relationAction.definitionKey, definitions: bundled(relationDefinition) }), 'relation effect unsupported');

// B. GitHub Parent authority must come from an explicit GitHub-backed source, not repo-shaped fields.
const repoShapedLocal = Object.assign({}, localRecord({ id: 'repo-shaped-local' }), {
  source: { id: 'local', adapterId: 'local', kind: 'local-session', repository: 'Tiinex/docs', repo: 'Tiinex/docs', ref: fixedRef },
  sourceTarget: { sourceArtifactPath: '.topics/fake.trace.md', inputTarget: '.topics/fake.trace.md' }
});
const repoShapedLocalPrepared = prep(repoShapedLocal, [repoShapedLocal]);
const repoShapedLocalAction = capableAction(repoShapedLocalPrepared);
assert.equal(repoShapedLocalAction?.parentRecovery?.state, 'unavailable');
assert.equal(repoShapedLocalAction?.productCapable, false);
assertNoMutation(execute({ state: appState([repoShapedLocal]), currentRecordId: repoShapedLocal.id, definitionKey: repoShapedLocalAction?.definitionKey || action.definitionKey }), 'repo-shaped local source');

const staticShaped = Object.assign({}, sourceBackedRecord({ id: 'static-shaped', path: '.topics/static.trace.md' }), {
  sourceMode: 'static-bootstrap',
  source: { id: 'static', adapterId: 'static', kind: 'static-bootstrap', repository: 'Tiinex/docs', repo: 'Tiinex/docs', ref: fixedRef }
});
const staticPrepared = prep(staticShaped, [staticShaped]);
assert.equal(capableAction(staticPrepared)?.parentRecovery?.state, 'unavailable');
assert.equal(capableAction(staticPrepared)?.productCapable, false);

const githubLocalMode = Object.assign({}, sourceBackedRecord({ id: 'github-local-mode', path: '.topics/github-local.trace.md' }), { sourceMode: 'local-session' });
const githubLocalPrepared = prep(githubLocalMode, [githubLocalMode]);
assert.equal(capableAction(githubLocalPrepared)?.parentRecovery?.state, 'unavailable');
assert.equal(capableAction(githubLocalPrepared)?.productCapable, false);

// C/E. Canonical Identifier is local semantic truth, never global definition identity.
const duplicateDefinition = definitionRecord(canonicalDefinitionMarkdown, 'workspace-duplicate-definition');
const duplicatePrepared = prep(sourceTopic, [sourceTopic, duplicateDefinition]);
const duplicateActions = duplicatePrepared.actions.filter((candidate) => candidate.canonicalIdentifier === 'tiinex.site.topic-to-task.v1');
assert.equal(duplicateActions.length, 2);
assert.equal(new Set(duplicateActions.map((candidate) => candidate.definitionKey)).size, 2, 'execution keys must remain registry-specific');
assert.equal(duplicateActions.every((candidate) => candidate.productCapable === true), true, 'same local Canonical Identifier must not globally conflict');
assert.equal(duplicateActions.every((candidate) => candidate.identityConflict === null), true);
assert.equal(duplicatePrepared.identityConflicts.length, 0);
for (const candidate of duplicateActions) {
  const outcome = execute({ state: appState([sourceTopic, duplicateDefinition]), currentRecordId: sourceTopic.id, definitionKey: candidate.definitionKey });
  assert.equal(outcome.result.ok, true, 'each registry-specific same-id key remains executable');
  assert.equal(outcome.adds, 1);
}
assertNoMutation(execute({ state: appState([sourceTopic, duplicateDefinition]), currentRecordId: sourceTopic.id, definitionKey: 'tiinex.site.topic-to-task.v1' }), 'legacy canonical-id lookup must not select first definition');

const divergentSameIdMarkdown = canonicalDefinitionMarkdown.replace('Human Label: Create task', 'Human Label: Create a divergent task');
const divergentSameId = definitionRecord(divergentSameIdMarkdown, 'workspace-divergent-same-id');
const divergentPrepared = prep(sourceTopic, [sourceTopic, divergentSameId]);
const divergentActions = divergentPrepared.actions.filter((candidate) => candidate.canonicalIdentifier === 'tiinex.site.topic-to-task.v1');
assert.equal(divergentActions.length, 2);
assert.equal(divergentActions.every((candidate) => candidate.definition?.canonicalReadQualified === true), true);
assert.equal(divergentActions.every((candidate) => candidate.productCapable === true), true);
assert.equal(divergentPrepared.identityConflicts.length, 0);
const divergentWorkspaceAction = divergentActions.find((candidate) => candidate.definition.source?.sourceMode !== 'bundled-canonical-transition-definition');
const divergentExecution = execute({ state: appState([sourceTopic, divergentSameId]), currentRecordId: sourceTopic.id, definitionKey: divergentWorkspaceAction.definitionKey });
assert.equal(divergentExecution.result.ok, true);
assert.equal(divergentExecution.adds, 1);

const uniqueWorkspaceId = 'tiinex.site.topic-to-task.workspace.v1';
const uniqueWorkspaceMarkdown = mutatedDefinition(uniqueWorkspaceId, [['Human Label: Create task', 'Human Label: Create workspace-qualified task']]);
const uniqueWorkspaceDefinition = definitionRecord(uniqueWorkspaceMarkdown, 'workspace-unique-definition');
const uniquePrepared = prep(sourceTopic, [sourceTopic, uniqueWorkspaceDefinition]);
const uniqueCanonicalActions = uniquePrepared.actions.filter((candidate) => candidate.productCapable);
assert.equal(uniqueCanonicalActions.length, 2, 'unique canonical identities with supported semantic shape remain eligible');
assert.equal(new Set(uniqueCanonicalActions.map((candidate) => candidate.definitionKey)).size, 2);
const uniqueWorkspaceAction = actionById(uniquePrepared, uniqueWorkspaceId);
const uniqueExecution = execute({ state: appState([sourceTopic, uniqueWorkspaceDefinition]), currentRecordId: sourceTopic.id, definitionKey: uniqueWorkspaceAction.definitionKey });
assert.equal(uniqueExecution.result.ok, true);
assert.equal(uniqueExecution.adds, 1);

const malformedWorkspaceDefinition = definitionRecord(canonicalDefinitionMarkdown.replace('Effect: create-new', 'Effect: cretae-new'), 'workspace-malformed-definition');
const malformedPlusValid = prep(sourceTopic, [sourceTopic, malformedWorkspaceDefinition]);
assert.equal(capableAction(malformedPlusValid)?.productCapable, true, 'malformed same-id observation is not a qualified identity competitor');
assert.equal(malformedPlusValid.identityConflicts.length, 0);

// D. Parent reference construction is Markdown-Link-safe before capability exposure.
for (const [label, sourcePath, expectedFragment] of [
  ['space', '.topics/space topic.trace.md', 'space%20topic.trace.md'],
  ['close-paren', '.topics/foo)bar.trace.md', 'foo%29bar.trace.md'],
  ['non-ascii', '.topics/räksmörgås.trace.md', 'r%C3%A4ksm%C3%B6rg%C3%A5s.trace.md']
]) {
  const unusual = sourceBackedRecord({ id: `path-${label}`, title: `Path ${label}`, path: sourcePath });
  const unusualPrepared = prep(unusual, [unusual]);
  const unusualAction = capableAction(unusualPrepared);
  assert.equal(unusualAction?.parentRecovery?.state, 'qualified', `${label}: parent qualified`);
  assert.equal(unusualAction?.productCapable, true, `${label}: capability exposed only with safe target`);
  assert.ok(unusualAction.parentRecovery.permalink.includes(expectedFragment), `${label}: encoded path`);
  assert.equal(/[)\s]/.test(unusualAction.parentRecovery.permalink), false, `${label}: Markdown target lexical safety`);
  assert.equal(unusualAction.parentRecovery.path, sourcePath, `${label}: original repo-relative path preserved`);
  const unusualOutcome = execute({ state: appState([unusual]), currentRecordId: unusual.id, definitionKey: unusualAction.definitionKey });
  assert.equal(unusualOutcome.result.ok, true, `${label}: valid unusual path creates after safe encoding`);
  assert.equal(unusualOutcome.adds, 1, `${label}: exactly one mutation`);
}


// Mandatory closure sweep: source/current/path/definition/role failures are fail-closed with zero lifecycle mutation.
const closureSweep = [
  ['topic-github-ordinary', sourceTopic, bundledDefinitions, action.definitionKey, true],
  ['signal-github', signalRecord, bundled(signalDefinitionMarkdown), signalAction.definitionKey, false],
  ['task-github', wrongCurrent, bundledDefinitions, action.definitionKey, false],
  ['topic-local-shaped', repoShapedLocal, bundledDefinitions, repoShapedLocalAction?.definitionKey || action.definitionKey, false],
  ['topic-static-shaped', staticShaped, bundledDefinitions, capableAction(staticPrepared)?.definitionKey || action.definitionKey, false],
  ['topic-github-local-mode', githubLocalMode, bundledDefinitions, capableAction(githubLocalPrepared)?.definitionKey || action.definitionKey, false],
  ['duplicate-definition', sourceTopic, bundledDefinitions, duplicateActions[0].definitionKey, true, [duplicateDefinition]],
  ['divergent-same-id', sourceTopic, bundledDefinitions, divergentActions[0].definitionKey, true, [divergentSameId]],
  ['parent-other-role', sourceTopic, bundled(parentOtherRoleDefinition), parentOtherAction.definitionKey, false, [existingTaskParent]]
];
for (const [label, current, definitions, key, shouldSucceed, extraRecords = []] of closureSweep) {
  const outcome = execute({ state: appState([current, ...extraRecords]), currentRecordId: current.id, definitionKey: key, definitions });
  assert.equal(outcome.result.ok, shouldSucceed, `${label}: closure outcome`);
  assert.equal(outcome.adds, shouldSucceed ? 1 : 0, `${label}: closure mutation count`);
}

console.log('post-v424 product capability/source authority/definition identity/path closure sweep: PASS');


// Architect final v424 exact product-shape + scoped-definition-identity source closure.
function expectUnsupportedProduct({ label, markdown, current = sourceTopic, extraRecords = [], id = null }) {
  const canonicalId = id || markdown.match(/Canonical Identifier: ([^\n]+)/)?.[1];
  const preparedCase = prep(current, [current, ...extraRecords], { bundledDefinitions: bundled(markdown) });
  const caseAction = actionById(preparedCase, canonicalId);
  assert.ok(caseAction, `${label}: action observable`);
  assert.notEqual(caseAction.productCapable, true, `${label}: product capability unavailable`);
  const outcome = execute({ state: appState([current, ...extraRecords]), currentRecordId: current.id, definitionKey: caseAction.definitionKey, definitions: bundled(markdown) });
  assertNoMutation(outcome, label);
  return { prepared: preparedCase, action: caseAction, outcome };
}

// A/C. The local mechanism owns one exact lifecycle shape; explicit incompatible truth is never erased by 1x1 convenience.
const preserveSubjectDefinition = mutatedDefinition('tiinex.site.topic-preserve-subject.v1', [['Logical Continuity: new-subject', 'Logical Continuity: preserve-subject']]);
const preserveSubjectCase = expectUnsupportedProduct({ label: 'create-new + preserve-subject', markdown: preserveSubjectDefinition });
assert.equal(preserveSubjectCase.action.definition.canonicalReadQualified, true);
assert.equal(preserveSubjectCase.action.resultSemantics.qualification, 'qualified');
assert.ok(preserveSubjectCase.action.capability.reasons.includes('unsupported-lifecycle-capability'));

const resultBindingDefinition = mutatedDefinition('tiinex.site.topic-result-binding.v1', [[
  '  - Target Binding: task\n  - Effect: create-new',
  '  - Target Binding: task\n  - Result Binding: source-topic\n  - Effect: create-new'
]]);
const resultBindingCase = expectUnsupportedProduct({ label: 'lifecycle Result Binding present', markdown: resultBindingDefinition });
assert.ok(resultBindingCase.action.capability.reasons.includes('unsupported-lifecycle-capability'));

const lifecycleCustomMappingDefinition = mutatedDefinition('tiinex.site.topic-lifecycle-custom-map.v1', [[
  '  - Required Materialization Operation: create',
  '  - Required Materialization Operation: create\n  - Member Mapping: custom\n  - Mapping Meaning: Caller-defined custom mapping.'
]]);
const lifecycleCustomCase = expectUnsupportedProduct({ label: 'lifecycle custom mapping', markdown: lifecycleCustomMappingDefinition });
assert.ok(lifecycleCustomCase.action.capability.reasons.includes('unsupported-lifecycle-capability'));

const parentCustomMappingDefinition = mutatedDefinition('tiinex.site.topic-parent-custom-map.v1', [[
  '  - Parent Binding: source-topic\n  - Effect: set',
  '  - Parent Binding: source-topic\n  - Effect: set\n  - Member Mapping: custom\n  - Mapping Meaning: Caller-defined Parent mapping.'
]]);
const parentCustomCase = expectUnsupportedProduct({ label: 'Parent custom mapping', markdown: parentCustomMappingDefinition });
assert.ok(parentCustomCase.action.capability.reasons.includes('unsupported-parent-capability'));

const preserveWhyDefinition = mutatedDefinition('tiinex.site.topic-preserve-why.v1', [[
  '  - Required Materialization Operation: create',
  '  - Required Materialization Operation: create\n  - Preserve Why: yes'
]]);
const preserveWhyCase = expectUnsupportedProduct({ label: 'Preserve Why yes without preservation mechanism', markdown: preserveWhyDefinition });
assert.ok(preserveWhyCase.action.capability.reasons.includes('unsupported-lifecycle-capability'));

// Explicit single mapping is proven equivalent for this exact 1x1 local mechanism.
const lifecycleSingleMapping = mutatedDefinition('tiinex.site.topic-lifecycle-single-map.v1', [[
  '  - Required Materialization Operation: create',
  '  - Required Materialization Operation: create\n  - Member Mapping: single'
]]);
const lifecycleSinglePrepared = prep(sourceTopic, [sourceTopic], { bundledDefinitions: bundled(lifecycleSingleMapping) });
const lifecycleSingleAction = actionById(lifecycleSinglePrepared, 'tiinex.site.topic-lifecycle-single-map.v1');
assert.equal(lifecycleSingleAction?.productCapable, true);
const lifecycleSingleExecution = execute({ state: appState([sourceTopic]), currentRecordId: sourceTopic.id, definitionKey: lifecycleSingleAction.definitionKey, definitions: bundled(lifecycleSingleMapping) });
assert.equal(lifecycleSingleExecution.result.ok, true);
assert.equal(lifecycleSingleExecution.adds, 1);

const parentSingleMapping = mutatedDefinition('tiinex.site.topic-parent-single-map.v1', [[
  '  - Parent Binding: source-topic\n  - Effect: set',
  '  - Parent Binding: source-topic\n  - Effect: set\n  - Member Mapping: single'
]]);
const parentSinglePrepared = prep(sourceTopic, [sourceTopic], { bundledDefinitions: bundled(parentSingleMapping) });
const parentSingleAction = actionById(parentSinglePrepared, 'tiinex.site.topic-parent-single-map.v1');
assert.equal(parentSingleAction?.productCapable, true);
const parentSingleExecution = execute({ state: appState([sourceTopic]), currentRecordId: sourceTopic.id, definitionKey: parentSingleAction.definitionKey, definitions: bundled(parentSingleMapping) });
assert.equal(parentSingleExecution.result.ok, true);
assert.equal(parentSingleExecution.adds, 1);

// B. v424 packet/materializer owns exactly one Topic input and one Task output.
const extraInputDefinition = mutatedDefinition('tiinex.site.topic-extra-input.v1', [[
  '\n## Output Roles',
  '\n- supporting-task\n  - Meaning: Additional required Task participant.\n  - Minimum Count: 1\n  - Maximum Count: 1\n  - Target Kind: artifact\n  - Schema Constraint: tiinex.task.v1\n  - Acquisition Policy: existing-only\n\n## Output Roles'
]]);
const supportingTask = sourceBackedRecord({ id: 'supporting-task', title: 'Supporting Task', schemaId: 'tiinex.task.v1', path: '.tasks/supporting-task.trace.md' });
const extraInputPrepared = prep(sourceTopic, [sourceTopic, supportingTask], { bundledDefinitions: bundled(extraInputDefinition) });
const extraInputAction = actionById(extraInputPrepared, 'tiinex.site.topic-extra-input.v1');
assert.equal(extraInputAction?.availability?.availability, 'available');
assert.equal(extraInputAction?.productCapable, false);
assert.ok(extraInputAction?.capability?.reasons?.includes('unsupported-input-role-arity'));
assertNoMutation(execute({ state: appState([sourceTopic, supportingTask]), currentRecordId: sourceTopic.id, definitionKey: extraInputAction.definitionKey, definitions: bundled(extraInputDefinition) }), 'additional required input role');

const extraOutputDefinition = mutatedDefinition('tiinex.site.topic-extra-output.v1', [
  ['\n## Lifecycle And Continuity Effects', '\n- second-task\n  - Meaning: Second Task output.\n  - Minimum Count: 1\n  - Maximum Count: 1\n  - Target Kind: artifact\n  - Schema Constraint: tiinex.task.v1\n  - Generation Binding: target-schema\n\n## Lifecycle And Continuity Effects'],
  ['  - Target Binding: task\n  - Effect: create-new', '  - Target Binding: task\n  - Result Binding: second-task\n  - Effect: create-new']
]);
const extraOutputPrepared = prep(sourceTopic, [sourceTopic], { bundledDefinitions: bundled(extraOutputDefinition) });
const extraOutputAction = actionById(extraOutputPrepared, 'tiinex.site.topic-extra-output.v1');
assert.equal(extraOutputAction?.definition?.canonicalReadQualified, true);
assert.equal(extraOutputAction?.productCapable, false);
assert.ok(extraOutputAction?.capability?.reasons?.includes('unsupported-output-role-arity'));
assertNoMutation(execute({ state: appState([sourceTopic]), currentRecordId: sourceTopic.id, definitionKey: extraOutputAction.definitionKey, definitions: bundled(extraOutputDefinition) }), 'additional Output Role');

// D. Repo-relative Parent path bytes are preserved; Markdown target encoding is a separate projection.
for (const [label, sourcePath, expectedFragment] of [
  ['internal-space-final', '.topics/internal space.trace.md', 'internal%20space.trace.md'],
  ['leading-space', ' .topics/leading.trace.md', '%20.topics/leading.trace.md'],
  ['trailing-space', '.topics/trailing.trace.md ', 'trailing.trace.md%20'],
  ['close-paren-final', '.topics/final)path.trace.md', 'final%29path.trace.md'],
  ['non-ascii-final', '.topics/åäö.trace.md', '%C3%A5%C3%A4%C3%B6.trace.md']
]) {
  const pathRecord = sourceBackedRecord({ id: `final-${label}`, title: `Final ${label}`, path: sourcePath });
  const pathPrepared = prep(pathRecord, [pathRecord]);
  const pathAction = capableAction(pathPrepared);
  assert.equal(pathAction?.parentRecovery?.state, 'qualified', `${label}: Parent recovery qualified`);
  assert.equal(pathAction?.parentRecovery?.path, sourcePath, `${label}: exact repo-relative path bytes preserved`);
  assert.ok(pathAction?.parentRecovery?.permalink.includes(expectedFragment), `${label}: encoded target`);
  assert.equal(/[)\s]/.test(pathAction.parentRecovery.permalink), false, `${label}: Markdown target lexical safety`);
  assert.equal(pathAction?.productCapable, true, `${label}: product-capable after safe projection`);
  const pathOutcome = execute({ state: appState([pathRecord]), currentRecordId: pathRecord.id, definitionKey: pathAction.definitionKey });
  assert.equal(pathOutcome.result.ok, true, `${label}: command succeeds`);
  assert.equal(pathOutcome.adds, 1, `${label}: exactly one mutation`);
}

// E/F. Canonical Identifier remains local; legacy bridge belongs only to the exact Site-bundled product definition.
const workspaceSameIdOnlyPresented = legacyFallback(sourceTopic, [sourceTopic, duplicateDefinition], { bundledDefinitions: [] });
assert.equal(workspaceSameIdOnlyPresented.filter((item) => item.kind === 'canonical-transition-product').length, 1);
assert.equal(workspaceSameIdOnlyPresented.some((item) => item.definitionId === 'topic.continue.task'), true, 'workspace same-ID definition alone must not suppress legacy compatibility');

const malformedBundledPlusWorkspacePresented = legacyFallback(sourceTopic, [sourceTopic, duplicateDefinition], { bundledDefinitions: malformedDefinitions });
assert.equal(malformedBundledPlusWorkspacePresented.filter((item) => item.kind === 'canonical-transition-product').length, 1, 'workspace canonical product remains independently eligible');
assert.equal(malformedBundledPlusWorkspacePresented.some((item) => item.definitionId === 'topic.continue.task'), true, 'unavailable bundled definition cannot be replaced by same-string workspace provenance');

const bundledPlusWorkspacePresented = legacyFallback(sourceTopic, [sourceTopic, duplicateDefinition]);
assert.equal(bundledPlusWorkspacePresented.filter((item) => item.kind === 'canonical-transition-product').length, 2);
assert.equal(bundledPlusWorkspacePresented.some((item) => item.definitionId === 'topic.continue.task'), false, 'exact product-capable bundled definition owns the migration suppression');

const workspaceUniqueOnlyPresented = legacyFallback(sourceTopic, [sourceTopic, uniqueWorkspaceDefinition], { bundledDefinitions: [] });
assert.equal(workspaceUniqueOnlyPresented.some((item) => item.kind === 'canonical-transition-product'), true);
assert.equal(workspaceUniqueOnlyPresented.some((item) => item.definitionId === 'topic.continue.task'), true, 'unrelated canonical product does not suppress legacy bridge');

assert.equal(preparationSource.includes('canonicalIdentifierConflicts'), false, 'Site must not promote local Canonical Identifier into global definition identity');
assert.ok(presentationSource.includes('bundled-canonical-transition-definition'), 'legacy bridge must be scoped to bundled provenance');
assert.ok(presentationSource.includes('src/transitions/definitions/topic-to-task-transition-definition.trace.md'), 'legacy bridge must name the exact bundled product definition source');

// Mandatory final product-shape sweep: every unsupported axis stays pre-capability and zero-mutation.
const finalShapeSweep = [
  ['lifecycle-preserve-subject', preserveSubjectCase.action, preserveSubjectDefinition, [sourceTopic]],
  ['lifecycle-result-binding', resultBindingCase.action, resultBindingDefinition, [sourceTopic]],
  ['lifecycle-custom-mapping', lifecycleCustomCase.action, lifecycleCustomMappingDefinition, [sourceTopic]],
  ['parent-custom-mapping', parentCustomCase.action, parentCustomMappingDefinition, [sourceTopic]],
  ['preserve-why', preserveWhyCase.action, preserveWhyDefinition, [sourceTopic]],
  ['extra-input', extraInputAction, extraInputDefinition, [sourceTopic, supportingTask]],
  ['extra-output', extraOutputAction, extraOutputDefinition, [sourceTopic]]
];
for (const [label, candidate, markdown, sweepRecords] of finalShapeSweep) {
  assert.notEqual(candidate?.productCapable, true, `${label}: capability unavailable`);
  const outcome = execute({ state: appState(sweepRecords), currentRecordId: sourceTopic.id, definitionKey: candidate.definitionKey, definitions: bundled(markdown) });
  assertNoMutation(outcome, `${label}: final shape sweep`);
}

console.log('post-v424 exact product-shape/scoped-definition-identity final source closure: PASS');

// Cross-axis sweep: arity, lifecycle/mapping, path and definition identity remain monotonic together.
const extraInputSingleMap = extraInputDefinition
  .replace('Canonical Identifier: tiinex.site.topic-extra-input.v1', 'Canonical Identifier: tiinex.site.topic-extra-input-single.v1')
  .replace('  - Required Materialization Operation: create', '  - Required Materialization Operation: create\n  - Member Mapping: single');
const extraInputSinglePrepared = prep(sourceTopic, [sourceTopic, supportingTask], { bundledDefinitions: bundled(extraInputSingleMap) });
const extraInputSingleAction = actionById(extraInputSinglePrepared, 'tiinex.site.topic-extra-input-single.v1');
assert.equal(extraInputSingleAction?.productCapable, false);
assert.ok(extraInputSingleAction?.capability?.reasons?.includes('unsupported-input-role-arity'));
assertNoMutation(execute({ state: appState([sourceTopic, supportingTask]), currentRecordId: sourceTopic.id, definitionKey: extraInputSingleAction.definitionKey, definitions: bundled(extraInputSingleMap) }), 'two inputs + single mapping');

const extraOutputParentSingle = extraOutputDefinition
  .replace('Canonical Identifier: tiinex.site.topic-extra-output.v1', 'Canonical Identifier: tiinex.site.topic-extra-output-parent-single.v1')
  .replace('  - Parent Binding: source-topic\n  - Effect: set', '  - Parent Binding: source-topic\n  - Effect: set\n  - Member Mapping: single');
const extraOutputParentSinglePrepared = prep(sourceTopic, [sourceTopic], { bundledDefinitions: bundled(extraOutputParentSingle) });
const extraOutputParentSingleAction = actionById(extraOutputParentSinglePrepared, 'tiinex.site.topic-extra-output-parent-single.v1');
assert.equal(extraOutputParentSingleAction?.productCapable, false);
assert.ok(extraOutputParentSingleAction?.capability?.reasons?.includes('unsupported-output-role-arity'));
assertNoMutation(execute({ state: appState([sourceTopic]), currentRecordId: sourceTopic.id, definitionKey: extraOutputParentSingleAction.definitionKey, definitions: bundled(extraOutputParentSingle) }), 'two outputs + Parent single mapping');

const sameIdCustomMarkdown = canonicalDefinitionMarkdown.replace(
  '  - Required Materialization Operation: create',
  '  - Required Materialization Operation: create\n  - Member Mapping: custom\n  - Mapping Meaning: Workspace-specific custom mapping.'
);
const sameIdCustomDefinition = definitionRecord(sameIdCustomMarkdown, 'workspace-same-id-custom');
const sameIdCustomPrepared = prep(sourceTopic, [sourceTopic, sameIdCustomDefinition]);
const sameIdCustomActions = sameIdCustomPrepared.actions.filter((candidate) => candidate.canonicalIdentifier === 'tiinex.site.topic-to-task.v1');
assert.equal(sameIdCustomActions.length, 2);
assert.equal(new Set(sameIdCustomActions.map((candidate) => candidate.definitionKey)).size, 2);
const bundledSameIdCustomAction = sameIdCustomActions.find((candidate) => candidate.definition.source?.sourceMode === 'bundled-canonical-transition-definition');
const workspaceSameIdCustomAction = sameIdCustomActions.find((candidate) => candidate.definition.source?.sourceMode !== 'bundled-canonical-transition-definition');
assert.equal(bundledSameIdCustomAction?.productCapable, true);
assert.equal(workspaceSameIdCustomAction?.productCapable, false);
assertNoMutation(execute({ state: appState([sourceTopic, sameIdCustomDefinition]), currentRecordId: sourceTopic.id, definitionKey: workspaceSameIdCustomAction.definitionKey }), 'same-ID workspace custom mapping remains unsupported independently');

const trailingIdentityTopic = sourceBackedRecord({ id: 'trailing-identity-topic', title: 'Trailing Identity Topic', path: '.topics/identity.trace.md ' });
const trailingIdentityPrepared = prep(trailingIdentityTopic, [trailingIdentityTopic, duplicateDefinition]);
const trailingIdentityActions = trailingIdentityPrepared.actions.filter((candidate) => candidate.canonicalIdentifier === 'tiinex.site.topic-to-task.v1');
assert.equal(trailingIdentityActions.length, 2);
assert.equal(trailingIdentityActions.every((candidate) => candidate.productCapable), true);
assert.equal(trailingIdentityActions.every((candidate) => candidate.parentRecovery.path === '.topics/identity.trace.md '), true);
assert.equal(trailingIdentityActions.every((candidate) => candidate.parentRecovery.permalink.endsWith('identity.trace.md%20')), true);
const trailingIdentityExecution = execute({ state: appState([trailingIdentityTopic, duplicateDefinition]), currentRecordId: trailingIdentityTopic.id, definitionKey: trailingIdentityActions[1].definitionKey });
assert.equal(trailingIdentityExecution.result.ok, true);
assert.equal(trailingIdentityExecution.adds, 1);

console.log('post-v424 mandatory final product-shape/identity/path cross sweep: PASS');

// Architect v424 exact local-placement declaration closure.
function placementVariant(id, {
  required = 'yes', destinationKind = '', capabilityRequirement = '', placementIntent = 'new-materialization',
  namingAuthority = 'explicit-binding', namingReference = '', relativeTo = '', relativeMeaning = '', override = 'no'
} = {}) {
  let markdown = mutatedDefinition(id);
  markdown = markdown.replace('  - Required: yes', `  - Required: ${required}`);
  const destinationExtras = [destinationKind && `  - Destination Kind: ${destinationKind}`, capabilityRequirement && `  - Capability Requirement: ${capabilityRequirement}`].filter(Boolean).join('\n');
  if (destinationExtras) markdown = markdown.replace(`  - Required: ${required}`, `  - Required: ${required}\n${destinationExtras}`);
  markdown = markdown.replace('  - Placement Intent: new-materialization', `  - Placement Intent: ${placementIntent}`);
  markdown = markdown.replace('  - Naming Authority: explicit-binding', `  - Naming Authority: ${namingAuthority}`);
  if (namingReference) markdown = markdown.replace(`  - Naming Authority: ${namingAuthority}`, `  - Naming Authority: ${namingAuthority}\n  - Naming Authority Reference: ${namingReference}`);
  if (relativeTo) markdown = markdown.replace('  - Destination Binding: workspace-draft', `  - Destination Binding: workspace-draft\n  - Relative To Binding: ${relativeTo}`);
  if (relativeMeaning) markdown = markdown.replace('  - Placement Intent:', `  - Relative Placement Meaning: ${relativeMeaning}\n  - Placement Intent:`);
  markdown = markdown.replace('  - Explicit Override Allowed: no', `  - Explicit Override Allowed: ${override}`);
  return markdown;
}
function placementClosureCase(label, spec, expectedCapable = false, { assertReadable = false } = {}) {
  const id = `tiinex.site.placement-${label}.v1`;
  const markdown = placementVariant(id, spec);
  const preparedCase = prep(sourceTopic, [sourceTopic], { bundledDefinitions: bundled(markdown) });
  const candidate = actionById(preparedCase, id);
  assert.ok(candidate, `${label}: canonical action remains observable`);
  if (assertReadable) {
    assert.equal(candidate.definition?.canonicalReadQualified, true, `${label}: canonical read remains qualified`);
    assert.equal(candidate.resultSemantics?.qualification, 'qualified', `${label}: result truth remains readable/qualified`);
  }
  assert.equal(candidate.productCapable, expectedCapable, `${label}: bounded placement capability`);
  if (!expectedCapable) {
    assert.ok(candidate.capability?.reasons?.includes('unsupported-placement-capability'), `${label}: exact local placement rejection`);
    assertNoMutation(execute({ state: appState([sourceTopic]), currentRecordId: sourceTopic.id, definitionKey: candidate.definitionKey, definitions: bundled(markdown) }), `${label}: unsupported placement declaration`);
  }
  return { markdown, candidate };
}

// Required focused pressure: explicit destination/placement truth is never silently discarded.
assert.equal(action?.productCapable, true, 'baseline exact destination remains product-capable');
placementClosureCase('destination-kind', { destinationKind: 'github-repository' }, false, { assertReadable: true });
placementClosureCase('capability-requirement', { capabilityRequirement: 'remote-write' }, false, { assertReadable: true });
placementClosureCase('destination-kind-capability', { destinationKind: 'github-repository', capabilityRequirement: 'remote-write' }, false, { assertReadable: true });
placementClosureCase('relative-meaning', { relativeMeaning: 'Place beside the source Topic.' }, false, { assertReadable: true });
placementClosureCase('relative-binding', { relativeTo: 'source-topic' }, false);
placementClosureCase('explicit-naming-reference', { namingReference: '[naming](../naming.md)' }, false, { assertReadable: true });
assert.equal(success.result.bindingPlan?.qualification, 'qualified', 'baseline fresh v422 remains qualified after placement closure');
assert.equal(success.result.v423?.qualification, 'qualified', 'baseline fresh v423 remains qualified after placement closure');
assert.equal(success.adds, 1, 'baseline exact placement still creates exactly one local Task');

// Adjacent declaration sweep 1: Required × Destination Kind × Capability Requirement.
for (const required of ['yes', 'no', 'unknown']) for (const destinationKind of ['', 'arbitrary-kind']) for (const capabilityRequirement of ['', 'arbitrary-capability']) {
  const supported = required === 'yes' && !destinationKind && !capabilityRequirement;
  placementClosureCase(`destination-${required}-${destinationKind ? 'kind' : 'none'}-${capabilityRequirement ? 'cap' : 'none'}`, { required, destinationKind, capabilityRequirement }, supported);
}

// Adjacent declaration sweep 2: Placement Intent × Naming Authority × Naming Authority Reference.
for (const placementIntent of ['new-materialization', 'no-materialization', 'preserve-current']) for (const namingAuthority of ['explicit-binding', 'target-schema', 'external-authority']) for (const namingReference of ['', '[authority](../authority.md)']) {
  const supported = placementIntent === 'new-materialization' && namingAuthority === 'explicit-binding' && !namingReference;
  placementClosureCase(`placement-${placementIntent}-${namingAuthority}-${namingReference ? 'ref' : 'noref'}`, { placementIntent, namingAuthority, namingReference }, supported);
}

// Adjacent declaration sweep 3: Relative To × Relative Meaning × Explicit Override Allowed.
for (const relativeTo of ['', 'source-topic']) for (const relativeMeaning of ['', 'Relative placement declaration.']) for (const override of ['no', 'yes', 'unknown']) {
  const supported = !relativeTo && !relativeMeaning && override === 'no';
  placementClosureCase(`relative-${relativeTo ? 'source' : 'none'}-${relativeMeaning ? 'meaning' : 'none'}-${override}`, { relativeTo, relativeMeaning, override }, supported);
}

console.log('post-v424 exact local-placement declaration closure + adjacent sweep: PASS');
