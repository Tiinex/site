import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { canonicalC14nV2SelfState } from '../integrity/integrity.c14nV2.js';
import { createPersistenceOwnershipPolicy, PersistenceRouteOwner } from '../app/persistenceOwnership.js';
import { executeCanonicalReferenceLocalCreate } from '../app/canonicalReferenceLocalCreateCommand.js';
import { canonicalReferenceTargetOptions } from '../app/canonicalReferenceTargets.js';
import { runLocalDraftDiscardCommand } from '../app/localDraftMutationCommand.js';
import { canDiscardLocalDraft, canEditLocalDraft } from '../artifacts/artifact.localDraft.js';
import { resolveSchemaModule } from '../schemas/registry.js';
import { parseArtifactMarkdown } from '../artifacts/artifact.parse.js';
import { CANONICAL_TRANSITION_SCHEMA_CACHE_MANIFEST, gitBlobSha1 } from '../transitions/canonicalTransition.schemaCache.js';
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
const refCommit = '053d46ce082d4ec261b82abc44ecca403d61e240';
const cachePaths = Object.freeze({
  'tiinex.root.v1': 'src/transitions/canonical-schema-cache/d69b8ff55a56b8cb9282b8684db6a938a4435b94/tiinex.root.v1.schema.md',
  'tiinex.transition.definition.v1': 'src/transitions/canonical-schema-cache/d69b8ff55a56b8cb9282b8684db6a938a4435b94/tiinex.transition.definition.v1.schema.md',
  'tiinex.task.v1': 'src/schemas/core/task/tiinex.task.v1.schema.md',
  'tiinex.topic.v1': 'src/transitions/canonical-schema-cache/52ecdea0a75893882ce282214d155f70e1309c2a/tiinex.topic.v1.schema.md',
  'tiinex.interpretation.v1': 'src/schemas/core/interpretation/tiinex.interpretation.v1.schema.md',
  'tiinex.relation.v1': `src/transitions/canonical-schema-cache/${refCommit}/tiinex.relation.v1.schema.md`,
  'tiinex.schema.contract.v1': `src/transitions/canonical-schema-cache/${refCommit}/tiinex.schema.contract.v1.schema.md`,
  'tiinex.schema.generation.v1': `src/transitions/canonical-schema-cache/${refCommit}/tiinex.schema.generation.v1.schema.md`
});
const schemaCache = Object.freeze(CANONICAL_TRANSITION_SCHEMA_CACHE_MANIFEST.map((item) => {
  const markdown = fs.readFileSync(cachePaths[item.schemaId], 'utf8');
  assert.equal(gitBlobSha1(markdown), item.gitBlob, `${item.schemaId}: exact canonical cache bytes`);
  return Object.freeze({ ...item, markdown, sourceQualification: 'source-qualified-cache' });
}));

const referencePath = 'src/schemas/core/relation/.transitions/topic-references-task-transition-definition.trace.md';
const generationPath = 'src/schemas/core/relation/.generation/reference-relation-generation-authority.trace.md';
const generationReference = `site-local:${generationPath}`;
const referenceDefinition = bundled(referencePath, 'Topic references Task', {
  generationMaterials: [Object.freeze({ id: 'site-generation:reference-relation', path: generationPath, url: generationReference, reference: generationReference, markdown: fs.readFileSync(generationPath, 'utf8'), source: Object.freeze({ id: 'site-generation:reference-relation', adapterId: 'static', sourceKind: 'bundled-canonical', sourceMode: 'site-local-generation-authority', sourceArtifactPath: generationPath }) })]
});
const taskContinuation = bundled('src/schemas/core/task/.transitions/topic-to-task-transition-definition.trace.md', 'Topic to Task');
const useAs = bundled('src/schemas/core/interpretation/.transitions/evidence-to-interpretation-transition-definition.trace.md', 'Evidence to Interpretation');
const rootTopic = bundled('src/schemas/core/topic/.transitions/create-topic-transition-definition.trace.md', 'Create Topic');
const rootTask = bundled('src/schemas/core/task/.transitions/create-task-transition-definition.trace.md', 'Create Task');
const definitions = Object.freeze([taskContinuation, useAs, referenceDefinition, rootTopic, rootTask]);

// Exact canonical + Site-local authority chain.
assert.equal(resolveSchemaModule({ schemaId: 'tiinex.relation.v1' }).id, 'tiinex.relation.v1');
assert(referenceDefinition.markdown.includes('Canonical Identifier: tiinex.site.topic-references-task.v1'));
assert(referenceDefinition.markdown.includes('Predicate Identifier: topic-references-task'));
assert(referenceDefinition.markdown.includes('Parent Effects\n\n- none'));
assert(referenceDefinition.markdown.includes(`Generation Binding: [Reference Relation Generation](${generationReference})`));
assert(referenceDefinition.generationMaterials[0].markdown.includes('Current Schema: tiinex.schema.generation.v1'));
assert(referenceDefinition.generationMaterials[0].markdown.includes('Target Schema: tiinex.relation.v1'));
const transitionAuthorityIntegrity = canonicalC14nV2SelfState(referenceDefinition.markdown);
const generationAuthorityIntegrity = canonicalC14nV2SelfState(referenceDefinition.generationMaterials[0].markdown);
assert.equal(transitionAuthorityIntegrity.state, 'verified', 'defining Transition has exact Root-qualified representation integrity');
assert.equal(generationAuthorityIntegrity.state, 'verified', 'Generation authority has exact Root-qualified representation integrity');

const topic = localRecord({ id: 'topic-a', workspaceId: 'w-a', schemaId: 'tiinex.topic.v1', title: 'Topic A', path: '.topics/topic-a.trace.md' });
const task = localRecord({ id: 'task-a', workspaceId: 'w-a', schemaId: 'tiinex.task.v1', title: 'Task A', path: '.topics/task-a.trace.md' });
const base = appState([{ id: 'w-a', records: [topic, task] }]);
const prepared = prepareCanonicalTransitionProductActions({ currentRecord: topic, workspaceRecords: [topic, task], referenceRecords: [topic, task], workspaceId: 'w-a', schemaCache, bundledDefinitions: definitions });
const reference = prepared.actions.find((item) => item.canonicalIdentifier === 'tiinex.site.topic-references-task.v1');
const continueAction = prepared.actions.find((item) => item.canonicalIdentifier === 'tiinex.site.topic-to-task.v1');
assert.equal(reference?.productCapable, true, 'Reference is discoverable only after exact participant + generation qualification');
assert.equal(reference.referenceCapability?.state, 'qualified');
assert.equal(reference.explicitGenerationQualification?.qualification, 'qualified');
assert.equal(reference.explicitGenerationQualification?.authority?.generationTargetSchema, 'tiinex.relation.v1');
assert.equal(reference.explicitGenerationQualification?.authority?.boundary?.relationMaterialized, false, 'Tooling seam remains read-only qualification only');
assert.equal(continueAction?.productCapable, true, 'target-schema Topic→Task path remains qualified beside explicit-generation Reference');
assert.equal(continueAction?.resultSemantics?.outputRoles?.[0]?.generationBinding, 'target-schema');

// Missing/invalid explicit authority fails locally without disabling target-schema sibling.
const missingGeneration = Object.freeze({ ...referenceDefinition, generationMaterials: Object.freeze([]) });
const missingPrepared = prepareCanonicalTransitionProductActions({ currentRecord: topic, workspaceRecords: [topic, task], referenceRecords: [topic, task], workspaceId: 'w-a', schemaCache, bundledDefinitions: [taskContinuation, missingGeneration] });
assert.equal(missingPrepared.actions.find((item) => item.canonicalIdentifier === 'tiinex.site.topic-references-task.v1')?.productCapable, false);
assert.equal(missingPrepared.actions.find((item) => item.canonicalIdentifier === 'tiinex.site.topic-to-task.v1')?.productCapable, true);
const corruptGeneration = Object.freeze({ ...referenceDefinition, generationMaterials: Object.freeze(referenceDefinition.generationMaterials.map((item) => Object.freeze({ ...item, markdown: `${item.markdown}\n- corrupt: yes` }))) });
const corruptPrepared = prepareCanonicalTransitionProductActions({ currentRecord: topic, workspaceRecords: [topic, task], referenceRecords: [topic, task], workspaceId: 'w-a', schemaCache, bundledDefinitions: [taskContinuation, corruptGeneration] });
assert.equal(corruptPrepared.actions.find((item) => item.canonicalIdentifier === 'tiinex.site.topic-references-task.v1')?.productCapable, false, 'invalid explicit authority fails closed');
const corruptTransition = Object.freeze({ ...referenceDefinition, markdown: `${referenceDefinition.markdown}
corrupt same-path transition bytes` });
const corruptTransitionPrepared = prepareCanonicalTransitionProductActions({ currentRecord: topic, workspaceRecords: [topic, task], referenceRecords: [topic, task], workspaceId: 'w-a', schemaCache, bundledDefinitions: [taskContinuation, corruptTransition] });
assert.equal(corruptTransitionPrepared.actions.find((item) => item.canonicalIdentifier === 'tiinex.site.topic-references-task.v1')?.productCapable, false, 'same Transition path with invalid exact representation integrity fails closed');
assert.equal(corruptTransitionPrepared.actions.find((item) => item.canonicalIdentifier === 'tiinex.site.topic-to-task.v1')?.productCapable, true, 'authority-integrity failure stays local to bounded Reference');

// Same-workspace local Reference creates one root Relation, mutates neither participant, and preserves predicate authority durably.
const options = canonicalReferenceTargetOptions({ state: base, subjectWorkspaceId: 'w-a', subjectRecord: topic, targetSchemaId: 'tiinex.task.v1' });
assert.equal(options.qualifiedOptions.length, 1);
assert.equal(options.qualifiedOptions[0].qualification.kind, 'local-path');
const beforeTopic = JSON.stringify(topic), beforeTask = JSON.stringify(task);
const created = executeReference(base, topic, options.qualifiedOptions[0], '2026-08-19T08:00:00.000Z');
assert.equal(created.ok, true, created.notice);
assert.equal(JSON.stringify(created.state.workspaces[0].records.find((item) => item.id === topic.id)), beforeTopic);
assert.equal(JSON.stringify(created.state.workspaces[0].records.find((item) => item.id === task.id)), beforeTask);
assert.equal(created.record.schemaId, 'tiinex.relation.v1');
assert.equal(created.record.parentSchemaId || '', '', 'Reference subject/object do not become Parent');
assert.equal(created.record.trace || '', '');
assert.equal(created.record.origin || '', '');
assert.equal(created.record.source?.adapterId, 'local');
assert.equal(created.record.source?.repository, undefined);
assert.equal(created.record.sourceTarget, undefined);
assert.equal(canonicalC14nV2SelfState(created.record.markdown).state, 'verified');
for (const needle of [
  '- Relation Type: topic reference to task',
  '- Relation Direction: Topic subject -> referenced Task',
  '- Relation Scope: artifact-level',
  '- Target: .topics/task-a.trace.md',
  '- Predicate Identifier: topic-references-task',
  '- Predicate Meaning: Topic records a durable non-parent reference to the selected Task.',
  '- Subject: .topics/topic-a.trace.md',
  '- Object: .topics/task-a.trace.md',
  '- Directionality: directed',
  `- Defining Transition: site-local:${referencePath}`,
  '- Defining Transition Representation Method: sha256-base64url-c14n-v2',
  `- Defining Transition Representation Value: ${transitionAuthorityIntegrity.declaredValue}`,
  `- Generation Authority: ${generationReference}`,
  '- Generation Authority Representation Method: sha256-base64url-c14n-v2',
  `- Generation Authority Representation Value: ${generationAuthorityIntegrity.declaredValue}`,
  'not the Tiinex continuity Parent'
]) assert(created.record.markdown.includes(needle), `Relation keeps durable ${needle}`);
const relationModule = resolveSchemaModule({ schemaId: 'tiinex.relation.v1' });
const relationFindings = relationModule.validate(parseArtifactMarkdown(created.record.markdown));
assert.equal(relationFindings.some((item) => item.severity === 'error'), false, 'created Relation passes exact Site Relation validator');
assert.equal(canDiscardLocalDraft(created.record), true);
assert.equal(canEditLocalDraft(created.record), false, 'Relation Edit is not implied by creation capability');
const discarded = runLocalDraftDiscardCommand({ lifecycle, state: created.state, workspaceId: 'w-a', recordId: created.record.id, persistenceOwnership: ownership });
assert.equal(discarded.ok, true, discarded.notice);

// Persistence/reopen preserves the local Relation representation without source promotion.
const env = memoryEnv();
persistence.writeState(created.state, { storage: env.storage, location: env.location, history: env.history, mode: 'replace' });
const reopened = persistence.readInitialState({ storage: env.storage, location: env.location });
const reopenedRelation = reopened.workspaces[0].records.find((item) => item.id === created.record.id);
assert(reopenedRelation);
assert.equal(reopenedRelation.schemaId, 'tiinex.relation.v1');
assert.equal(reopenedRelation.source?.adapterId, 'local');
assert.equal(canonicalC14nV2SelfState(reopenedRelation.markdown).state, 'verified');
assert(reopenedRelation.markdown.includes(`- Defining Transition Representation Value: ${transitionAuthorityIntegrity.declaredValue}`));
assert(reopenedRelation.markdown.includes(`- Generation Authority Representation Value: ${generationAuthorityIntegrity.declaredValue}`));
const bytesOnlyReingest = createRecordFromMarkdown(reopenedRelation.markdown, { path: reopenedRelation.path, name: reopenedRelation.title || 'Relation', sourceMode: 'local-reingest' });
assert.equal(bytesOnlyReingest.transitionMaterialization, undefined, 'predicate authority bytes do not require hidden transitionMaterialization metadata');
assert(bytesOnlyReingest.markdown.includes(`- Defining Transition Representation Value: ${transitionAuthorityIntegrity.declaredValue}`));
assert(bytesOnlyReingest.markdown.includes(`- Generation Authority Representation Value: ${generationAuthorityIntegrity.declaredValue}`));

// Cross-workspace browser-local identity is deliberately narrower than PoC and fails closed.
const localOther = localRecord({ id: 'task-local-other', workspaceId: 'w-b', schemaId: 'tiinex.task.v1', title: 'Other local Task', path: '.topics/task-other.trace.md' });
const crossLocalState = appState([{ id: 'w-a', records: [topic] }, { id: 'w-b', records: [localOther] }]);
const crossLocal = canonicalReferenceTargetOptions({ state: crossLocalState, subjectWorkspaceId: 'w-a', subjectRecord: topic, targetSchemaId: 'tiinex.task.v1' });
assert.equal(crossLocal.options[0].enabled, false);
assert.equal(crossLocal.options[0].qualification.reason, 'cross-workspace-local-identity-not-portable');

// Exact source-backed identity qualifies across loaded workspaces and remains stable through workspace reorder.
const webUrl = 'https://example.test/tasks/task-source.trace.md?rev=42';
const webTask = sourceRecord({ id: 'task-web', workspaceId: 'w-b', schemaId: 'tiinex.task.v1', title: 'Source Task', path: 'task-source.trace.md', url: webUrl });
const crossSourceState = appState([{ id: 'w-a', records: [topic] }, { id: 'w-b', records: [webTask] }]);
const sourceOptions = canonicalReferenceTargetOptions({ state: crossSourceState, subjectWorkspaceId: 'w-a', subjectRecord: topic, targetSchemaId: 'tiinex.task.v1' });
assert.equal(sourceOptions.qualifiedOptions.length, 1);
assert.equal(sourceOptions.qualifiedOptions[0].qualification.global, true);
assert.equal(sourceOptions.qualifiedOptions[0].qualification.durableTarget, webUrl);
const reordered = canonicalReferenceTargetOptions({ state: { ...crossSourceState, workspaces: [...crossSourceState.workspaces].reverse() }, subjectWorkspaceId: 'w-a', subjectRecord: topic, targetSchemaId: 'tiinex.task.v1' });
assert.equal(reordered.qualifiedOptions[0].participantId, sourceOptions.qualifiedOptions[0].participantId);
assert.equal(reordered.qualifiedOptions[0].qualification.durableTarget, webUrl);
const sourceCreated = executeReference(crossSourceState, topic, sourceOptions.qualifiedOptions[0], '2026-08-19T08:30:00.000Z');
assert.equal(sourceCreated.ok, true, sourceCreated.notice);
assert(sourceCreated.record.markdown.includes(`- Object: ${webUrl}`));
assert(sourceCreated.record.markdown.includes(`- Target: ${webUrl}`));
assert.equal(sourceCreated.record.source?.adapterId, 'local');
assert.equal(sourceCreated.state.workspaces.find((w) => w.id === 'w-b').records.find((r) => r.id === webTask.id).sourceTarget.inputTarget, webUrl);

// Missing target after later reopen does not erase the durable relation meaning or trigger discovery.
const withoutTargetWorkspace = { ...sourceCreated.state, workspaces: sourceCreated.state.workspaces.filter((w) => w.id !== 'w-b') };
const envMissing = memoryEnv();
persistence.writeState(withoutTargetWorkspace, { storage: envMissing.storage, location: envMissing.location, history: envMissing.history, mode: 'replace' });
const reopenedMissing = persistence.readInitialState({ storage: envMissing.storage, location: envMissing.location });
const durableWithoutTarget = reopenedMissing.workspaces[0].records.find((item) => item.id === sourceCreated.record.id);
assert(durableWithoutTarget);
assert(durableWithoutTarget.markdown.includes(`- Object: ${webUrl}`));

// Weak/ambiguous local path target cannot be presented as qualified.
const weakA = localRecord({ id: 'weak-a', workspaceId: 'w-a', schemaId: 'tiinex.task.v1', title: 'Weak A', path: '.topics/collision.trace.md' });
const weakB = localRecord({ id: 'weak-b', workspaceId: 'w-a', schemaId: 'tiinex.task.v1', title: 'Weak B', path: '.topics/collision.trace.md' });
const weakState = appState([{ id: 'w-a', records: [topic, weakA, weakB] }]);
const weakOptions = canonicalReferenceTargetOptions({ state: weakState, subjectWorkspaceId: 'w-a', subjectRecord: topic, targetSchemaId: 'tiinex.task.v1' });
assert.equal(weakOptions.qualifiedOptions.length, 0);
assert(weakOptions.options.every((item) => item.qualification.state !== 'qualified'));

// Reference is bounded; Use-as and root Create remain separate canonical capabilities.
const evidence = localRecord({ id: 'evidence', workspaceId: 'w-a', schemaId: 'tiinex.evidence.v1', title: 'Evidence', path: '.topics/evidence.trace.md' });
const evidencePrepared = prepareCanonicalTransitionProductActions({ currentRecord: evidence, workspaceRecords: [evidence], workspaceId: 'w-a', schemaCache, bundledDefinitions: definitions });
assert.equal(evidencePrepared.actions.find((item) => item.canonicalIdentifier === 'tiinex.site.evidence-to-interpretation.v1')?.productCapable, true);
assert.equal(evidencePrepared.actions.some((item) => item.canonicalIdentifier === 'tiinex.site.topic-references-task.v1' && item.productCapable), false, 'Reference is not universal');
const workspaceActions = prepareCanonicalTransitionWorkspaceActions({ workspaceId: 'w-a', schemaCache, bundledDefinitions: definitions });
assert.deepEqual(workspaceActions.actions.filter((a) => a.productCapable).map((a) => a.canonicalIdentifier).sort(), ['tiinex.site.create-task.v1', 'tiinex.site.create-topic.v1']);

// UI ownership: one capability-driven target/review dialog, no RecordCard label switchboard.
const dialogSource = fs.readFileSync('src/schemas/workspace/workspace.canonicalReferenceDialog.views.jsx', 'utf8');
const recordDialogs = fs.readFileSync('src/schemas/workspace/workspace.recordDialogs.views.jsx', 'utf8');
const cards = fs.readFileSync('src/schemas/workspace/workspace.cards.views.jsx', 'utf8');
assert(dialogSource.includes('Search loaded qualified Tasks'));
assert(dialogSource.includes('non-parent'));
assert(recordDialogs.includes("action?.referenceCapability?.state === 'qualified'"));
assert.equal(cards.includes("label === 'Reference'"), false);
assert.equal(cards.includes("schemaId === 'tiinex.relation.v1'"), false);

console.log('post-v434 M0-D durable Reference integration closure: PASS');

function bundled(path, title, extra = {}) {
  return Object.freeze({ id: `bundled:${path}`, path, title, markdown: fs.readFileSync(path, 'utf8'), sourceQualification: 'site-local-definition-source-qualified', sourceMode: 'bundled-canonical-transition-definition', source: Object.freeze({ id: `site:${path}`, adapterId: 'static', sourceKind: 'bundled-canonical', sourceMode: 'bundled-canonical-transition-definition', sourceArtifactPath: path }), ...extra });
}
function artifactMarkdown(schemaId, title) { return `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: ${schemaId}\n  - Created At: 2026-08-19 00:00:00\n  - Summary: ${title}\n\n---\n\n# ${title}\n\nReadable loaded artifact.\n`; }
function localRecord({ id, workspaceId, schemaId, title, path }) { return Object.assign(createRecordFromMarkdown(artifactMarkdown(schemaId, title), { path, name: title, sourceMode: 'local' }), { id, workspaceId, title, schemaId, kind: schemaId, path, sourceMode: 'local', source: { id: 'local', adapterId: 'local', kind: 'local-session' } }); }
function sourceRecord({ id, workspaceId, schemaId, title, path, url }) { return Object.assign(createRecordFromMarkdown(artifactMarkdown(schemaId, title), { path, name: title, sourceMode: 'source-backed' }), { id, workspaceId, title, schemaId, kind: schemaId, path, sourceMode: 'source-backed', source: { id: `web:${id}`, adapterId: 'web', sourceKind: 'web.markdown', url }, sourceTarget: { targetKind: 'web.markdown', inputTarget: url, rawUrl: url } }); }
function appState(workspaces) { return { version: 1, activeWorkspaceId: workspaces[0]?.id || '', view: { universe: 'column', workspaceVerse: 'feed', reader: 'scan', query: '' }, workspaces: workspaces.map(({ id, records }) => ({ id, name: id, title: id, createdAt: '2026-08-19T00:00:00.000Z', kind: 'workspace', source: { id: 'local', adapterId: 'local', kind: 'local-session' }, sources: [], sourceOrder: [], records, assets: [], importLog: [], mode: 'feed' })), audit: null }; }
function executeReference(state, subject, option, iso) { return executeCanonicalReferenceLocalCreate({ lifecycle, state, workspaceId: subject.workspaceId, currentRecordId: subject.id, targetWorkspaceId: option.workspaceId, targetRecordId: option.id, definitionKey: referenceKey(state, subject), schemaCache, bundledDefinitions: definitions, persistenceOwnership: ownership, now: new Date(iso), clock: () => iso }); }
function referenceKey(state, subject) { const workspace = state.workspaces.find((w) => w.id === subject.workspaceId); const referenceRecords = state.workspaces.flatMap((w) => w.records.map((r) => Object.freeze({ ...r, workspaceIds: [...new Set([...(r.workspaceIds || []), w.id])] }))); const prep = prepareCanonicalTransitionProductActions({ currentRecord: subject, workspaceRecords: workspace.records, referenceRecords, workspaceId: workspace.id, schemaCache, bundledDefinitions: definitions }); return prep.actions.find((a) => a.canonicalIdentifier === 'tiinex.site.topic-references-task.v1')?.definitionKey || ''; }
function memoryEnv() { const map = new Map(); const location = { pathname: '/index.html', search: '', hash: '' }; const history = { replaceState: (_a, _b, url) => { location.hash = url.includes('#') ? `#${url.split('#').pop()}` : ''; }, pushState: (_a, _b, url) => { location.hash = url.includes('#') ? `#${url.split('#').pop()}` : ''; } }; const storage = { getItem: (key) => map.get(key) || null, setItem: (key, value) => map.set(key, String(value)), removeItem: (key) => map.delete(key) }; return { storage, location, history, map }; }
