import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { parseArtifactMarkdown } from '../artifacts/artifact.parse.js';
import { createPersistenceOwnershipPolicy, PersistenceRouteOwner } from '../app/persistenceOwnership.js';
import { projectArtifactAuthoringCapability } from '../app/artifactAuthoringCapability.js';
import { executeCanonicalTransitionLocalCreate } from '../app/canonicalTransitionLocalCreateCommand.js';
import { runLocalDraftUpdateCommand } from '../app/localDraftMutationCommand.js';
import { canEditLocalDraft, canDiscardLocalDraft } from '../artifacts/artifact.localDraft.js';
import { canonicalC14nV2SelfState } from '../integrity/integrity.c14nV2.js';
import { resolveSchemaModule } from '../schemas/resolver.js';
import { readCanonicalTaskAuthoringValues, renderCanonicalTaskEditMarkdown } from '../schemas/core/task/tiinex.task.v1.authoring.js';
import { INTERPRETATION_CREATION_FIELDS } from '../schemas/core/interpretation/tiinex.interpretation.v1.contract.js';
import { interpretationValidate } from '../schemas/core/interpretation/tiinex.interpretation.v1.validate.js';
import { CANONICAL_TRANSITION_SCHEMA_CACHE_MANIFEST, gitBlobSha1 } from '../transitions/canonicalTransition.schemaCache.js';
import { prepareCanonicalTransitionProductActions } from '../transitions/transition.productPreparation.js';
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
const cacheCommit = 'd69b8ff55a56b8cb9282b8684db6a938a4435b94';
const cachePaths = Object.freeze({
  'tiinex.root.v1': `src/transitions/canonical-schema-cache/${cacheCommit}/tiinex.root.v1.schema.md`,
  'tiinex.transition.definition.v1': `src/transitions/canonical-schema-cache/${cacheCommit}/tiinex.transition.definition.v1.schema.md`,
  'tiinex.task.v1': 'src/schemas/core/task/tiinex.task.v1.schema.md',
  'tiinex.topic.v1': 'src/transitions/canonical-schema-cache/52ecdea0a75893882ce282214d155f70e1309c2a/tiinex.topic.v1.schema.md',
  'tiinex.interpretation.v1': 'src/schemas/core/interpretation/tiinex.interpretation.v1.schema.md',
  'tiinex.relation.v1': 'src/transitions/canonical-schema-cache/053d46ce082d4ec261b82abc44ecca403d61e240/tiinex.relation.v1.schema.md',
  'tiinex.schema.contract.v1': 'src/transitions/canonical-schema-cache/053d46ce082d4ec261b82abc44ecca403d61e240/tiinex.schema.contract.v1.schema.md',
  'tiinex.schema.generation.v1': 'src/transitions/canonical-schema-cache/053d46ce082d4ec261b82abc44ecca403d61e240/tiinex.schema.generation.v1.schema.md'
});
const schemaCache = CANONICAL_TRANSITION_SCHEMA_CACHE_MANIFEST.map((item) => ({ ...item, markdown: fs.readFileSync(cachePaths[item.schemaId], 'utf8'), sourceQualification: 'source-qualified-cache' }));
const taskDefinitionPath = 'src/schemas/core/task/.transitions/topic-to-task-transition-definition.trace.md';
const useAsDefinitionPath = 'src/schemas/core/interpretation/.transitions/evidence-to-interpretation-transition-definition.trace.md';
const taskDefinition = bundled(taskDefinitionPath, 'Topic to Task', 'compiled-semantic-package-qualified');
const useAsDefinition = bundled(useAsDefinitionPath, 'Evidence to Interpretation', 'site-local-definition-source-qualified');
const definitions = Object.freeze([taskDefinition, useAsDefinition]);

// Exact Interpretation schema authority is a byte-qualified canonical docs snapshot.
const interpretationMarkdown = fs.readFileSync(cachePaths['tiinex.interpretation.v1'], 'utf8');
assert.equal(gitBlobSha1(interpretationMarkdown), '330d8668e78cd6d164a76093982b02f616fd6ab4');
assert.equal(createHash('sha256').update(interpretationMarkdown).digest('hex'), '977a46d67eb4e3e8ce383f7f33efbf10798122cc3f94e5b948c084a9af311017');
assert.equal(resolveSchemaModule({ schemaId: 'tiinex.interpretation.v1' }).fallbackUsed, false, 'Interpretation must resolve to an exact Site schema module');

const evidence = localRecord({ id: 'evidence-1', schemaId: 'tiinex.evidence.v1', title: 'Observed product evidence', path: '.topics/evidence/001.trace.md' });
const evidenceState = appState([evidence]);
const preparedEvidence = prepareCanonicalTransitionProductActions({ currentRecord: evidence, workspaceRecords: [evidence], workspaceId: 'w', schemaCache, bundledDefinitions: definitions });
const useAs = preparedEvidence.actions.find((action) => action.canonicalIdentifier === 'tiinex.site.evidence-to-interpretation.v1');
assert.equal(useAs?.productCapable, true, 'exact Evidence participant exposes the bounded canonical Use-as slice');
assert.equal(useAs?.label, 'Use as');
assert.equal(useAs?.icon, 'continue', 'Use-as keeps a truthful generic qualified continuation icon until declarative presentation authority exists');
assert.equal(fs.readFileSync('src/transitions/transition.productPreparation.js','utf8').includes("requiredInputs || []).includes('Interpretation Action')"), false, 'authoring field names are not semantic icon authority');
assert.equal(useAs?.authoring?.schemaId, 'tiinex.interpretation.v1');
assert.deepEqual(useAs?.authoring?.requiredInputs, [...INTERPRETATION_CREATION_FIELDS]);
assert.equal(useAs?.authoring?.fixedInputs?.['Source Target'], evidence.path, 'selected source identity is fixed by the qualified parent/materializer owner');
assert.equal(useAs?.resultSemantics?.relationEffects?.length, 0, 'Use-as is Interpretation creation, not hidden Reference semantics');

const values = Object.freeze({
  'Source Target': 'caller-must-not-override-this',
  'Source Role': 'product evidence',
  'Target Role': 'feedback candidate',
  'Interpretation Action': 'Use as feedback',
  'Rationale': 'The selected evidence may inform a feedback candidate.',
  'Observed Basis': 'The selected Evidence artifact was reviewed in this workspace.',
  'Original Mutation Policy': 'The source Evidence remains unchanged.',
  'Result Boundary': 'One separate browser-local Interpretation only.',
  'Uncertainty': 'The source context may be incomplete.',
  'Review Need': 'Human review before treating this as accepted feedback.',
  'Does Not Prove': 'Correctness, acceptance, or ownership.',
  'Must Not Be Treated As': 'Accepted feedback or source mutation.'
});
const beforeEvidence = JSON.stringify(evidence);
const created = execute(evidenceState, evidence.id, useAs.definitionKey, values, definitions, '2026-08-19T01:02:03.000Z');
assert.equal(created.ok, true, created.notice);
assert.equal(created.record?.schemaId, 'tiinex.interpretation.v1');
assert.equal(created.record?.sourceMode, 'local-transition-canonical');
assert.equal(created.record?.source?.adapterId, 'local');
assert.equal(created.record?.source?.repository, undefined);
assert.equal(created.record?.parentSchemaId, 'tiinex.evidence.v1');
assert.equal(created.record?.markdown.includes(`- Source Target: ${evidence.path}`), true, 'fixed source target survives generation');
assert.equal(created.record?.markdown.includes('caller-must-not-override-this'), false, 'caller cannot override selected source identity');
assert.equal(created.record?.markdown.includes('- Target Role: feedback candidate'), true);
assert.equal(created.record?.markdown.includes('- Result Boundary: One separate browser-local Interpretation only.'), true);
assert.equal(created.record?.markdown.includes('- Does Not Prove: Correctness, acceptance, or ownership.'), true);
assert.equal(canonicalC14nV2SelfState(created.record.markdown).state, 'verified');
const createdInterpretationFindings = interpretationValidate(parseArtifactMarkdown(created.record.markdown));
assert.equal(createdInterpretationFindings.some((finding) => finding.severity === 'error'), false, 'generated Interpretation passes the exact Site schema validator');
assert.equal(createdInterpretationFindings.some((finding) => finding.code === 'interpretation.contract.readable'), true, 'generated Interpretation exposes the complete bounded creation contract');
assert.equal(JSON.stringify(created.workspace.records.find((record) => record.id === evidence.id)), beforeEvidence, 'Use-as must not mutate the source Evidence');
assert.equal(canEditLocalDraft(created.record), false, 'Interpretation edit is not invented merely because it is a local artifact');
assert.equal(canDiscardLocalDraft(created.record), true, 'local Interpretation remains discardable under existing local-draft policy');

// Persistence/reopen preserves the separate local Interpretation without promoting fake source provenance.
const env = memoryEnv();
persistence.writeState(created.state, { storage: env.storage, location: env.location, history: env.history, mode: 'replace' });
const restored = persistence.readInitialState({ storage: env.storage, location: env.location });
const restoredInterpretation = restored?.workspaces?.[0]?.records?.find((record) => record.id === created.record.id);
assert(restoredInterpretation, 'created Interpretation survives durable local persistence/reopen');
assert.equal(restoredInterpretation.schemaId, 'tiinex.interpretation.v1');
assert.equal(restoredInterpretation.source?.adapterId, 'local');
assert.equal(restoredInterpretation.markdown.includes(`- Source Target: ${evidence.path}`), true);

// Availability is definition/applicability-owned, not universal Use-as.
const topic = localRecord({ id: 'topic-1', schemaId: 'tiinex.topic.v1', title: 'Topic', path: '.topics/topic.trace.md' });
const topicPrepared = prepareCanonicalTransitionProductActions({ currentRecord: topic, workspaceRecords: [topic], workspaceId: 'w', schemaCache, bundledDefinitions: definitions });
assert.equal(topicPrepared.actions.some((action) => action.canonicalIdentifier === 'tiinex.site.evidence-to-interpretation.v1' && action.productCapable), false, 'Use-as is not exposed universally');

// Output-schema qualification is capability-local: a bad Interpretation snapshot must not disable Topic→Task.
const staleInterpretationCache = schemaCache.map((item) => item.schemaId === 'tiinex.interpretation.v1' ? { ...item, markdown: `${item.markdown}\n` } : item);
const topicWithStaleInterpretation = prepareCanonicalTransitionProductActions({ currentRecord: topic, workspaceRecords: [topic], workspaceId: 'w', schemaCache: staleInterpretationCache, bundledDefinitions: definitions });
const taskWithStaleInterpretation = topicWithStaleInterpretation.actions.find((action) => action.canonicalIdentifier === 'tiinex.site.topic-to-task.v1');
assert.equal(taskWithStaleInterpretation?.productCapable, true, 'unrelated output-schema cache drift must not disable another qualified capability');
const evidenceWithStaleInterpretation = prepareCanonicalTransitionProductActions({ currentRecord: evidence, workspaceRecords: [evidence], workspaceId: 'w', schemaCache: staleInterpretationCache, bundledDefinitions: definitions });
assert.equal(evidenceWithStaleInterpretation.actions.find((action) => action.canonicalIdentifier === 'tiinex.site.evidence-to-interpretation.v1')?.productCapable, false, 'affected Use-as capability fails closed locally');

// Source-backed Evidence binds exact source identity without turning the local Interpretation into source material.
const webEvidenceUrl = 'https://example.test/evidence/observed.trace.md?rev=1';
const webEvidence = Object.assign(createRecordFromMarkdown(artifactMarkdown('tiinex.evidence.v1', 'Source-backed evidence'), { path: 'observed.trace.md', name: 'Source-backed evidence', sourceMode: 'source-backed' }), {
  id: 'evidence-web-1', workspaceId: 'w', title: 'Source-backed evidence', schemaId: 'tiinex.evidence.v1', kind: 'tiinex.evidence.v1', path: 'observed.trace.md', sourceMode: 'source-backed',
  source: { id: 'web:evidence', adapterId: 'web', sourceKind: 'web.markdown', url: webEvidenceUrl },
  sourceTarget: { targetKind: 'web.markdown', inputTarget: webEvidenceUrl, rawUrl: webEvidenceUrl }
});
const webEvidencePrepared = prepareCanonicalTransitionProductActions({ currentRecord: webEvidence, workspaceRecords: [webEvidence], workspaceId: 'w', schemaCache, bundledDefinitions: definitions });
const webUseAs = webEvidencePrepared.actions.find((action) => action.canonicalIdentifier === 'tiinex.site.evidence-to-interpretation.v1');
assert.equal(webUseAs?.productCapable, true);
assert.equal(webUseAs?.parentRecovery?.representationKind, 'web-markdown');
assert.equal(webUseAs?.authoring?.fixedInputs?.['Source Target'], webEvidenceUrl, 'source-backed Use-as fixes Source Target to exact external artifact identity');
const webEvidenceBefore = JSON.stringify(webEvidence);
const webUseAsCreated = execute(appState([webEvidence]), webEvidence.id, webUseAs.definitionKey, { ...values, 'Source Target': 'https://wrong.example.test/' }, definitions, '2026-08-19T01:30:00.000Z');
assert.equal(webUseAsCreated.ok, true, webUseAsCreated.notice);
assert.equal(webUseAsCreated.record?.source?.adapterId, 'local', 'Use-as output remains a browser-local artifact');
assert.equal(webUseAsCreated.record?.source?.repository, undefined, 'Use-as output does not inherit fake source provenance');
assert.equal(webUseAsCreated.record?.markdown.includes(`- Source Target: ${webEvidenceUrl}`), true);
assert.equal(webUseAsCreated.record?.trace, webEvidenceUrl, 'continuity Parent preserves exact source-backed target identity');
assert.equal(webUseAsCreated.record?.origin, webEvidenceUrl);
assert.equal(JSON.stringify(webUseAsCreated.workspace.records.find((record) => record.id === webEvidence.id)), webEvidenceBefore, 'source-backed Use-as must not mutate the source participant');

// Schema-aware Task Edit projects existing Task contract fields but reuses the established mutation/integrity owner.
const taskValues = Object.freeze({ Summary: 'Editable Task', Objective: 'Before edit', 'Done Criteria': 'Done', Scope: 'Bounded', Dependencies: 'None' });
const topicAction = prepareCanonicalTransitionProductActions({ currentRecord: topic, workspaceRecords: [topic], workspaceId: 'w', schemaCache, bundledDefinitions: definitions }).actions.find((action) => action.canonicalIdentifier === 'tiinex.site.topic-to-task.v1');
const taskCreated = execute(appState([topic]), topic.id, topicAction.definitionKey, taskValues, definitions, '2026-08-19T02:00:00.000Z');
assert.equal(taskCreated.ok, true);
const editProjection = readCanonicalTaskAuthoringValues(taskCreated.record.markdown);
assert.equal(editProjection.qualified, true);
assert.deepEqual(editProjection.requiredInputs, ['Summary', 'Objective', 'Done Criteria', 'Scope', 'Dependencies']);
const editedMarkdown = renderCanonicalTaskEditMarkdown(taskCreated.record.markdown, { ...editProjection.values, Summary: 'Edited Task', Objective: 'After edit' });
assert.equal(editedMarkdown.state, 'rendered');
const edited = runLocalDraftUpdateCommand({ lifecycle, state: taskCreated.state, workspaceId: 'w', recordId: taskCreated.record.id, candidate: { ...taskCreated.record, markdown: editedMarkdown.markdown }, persistenceOwnership: ownership });
assert.equal(edited.ok, true, edited.notice);
assert.equal(edited.record.id, taskCreated.record.id);
assert.equal(edited.record.path, taskCreated.record.path);
assert.equal(edited.record.parentSchemaId, taskCreated.record.parentSchemaId);
assert.equal(edited.record.title, 'Edited Task');
assert.equal(readCanonicalTaskAuthoringValues(edited.record.markdown).values.Objective, 'After edit');
assert.equal(canonicalC14nV2SelfState(edited.record.markdown).state, 'verified', 'existing mutation command refreshes canonical Task self-integrity');

// Reference and broad root Create remain explicit gaps, not fake product actions.
const authoring = projectArtifactAuthoringCapability(topic, { persistenceOwnership: ownership });
assert.equal(authoring.operations.createRoot.available, false, 'Artifact Creation Contract alone must not authorize broad root Create');
assert.equal(resolveSchemaModule({ schemaId: 'tiinex.relation.v1' }).fallbackUsed, false, 'v434 supersedes the historical Relation-module gap with an exact registered module');
// v434 may add a separately qualified bounded Reference definition; v431's original capabilities must remain independently qualified.

// Architecture guard: canonical authoring uses one dynamic dialog and one qualified materializer registry.
const dialogSource = fs.readFileSync('src/schemas/workspace/workspace.canonicalTaskDialog.views.jsx', 'utf8');
const recordDialogSource = fs.readFileSync('src/schemas/workspace/workspace.recordDialogs.views.jsx', 'utf8');
const productSource = fs.readFileSync('src/transitions/transition.productPreparation.js', 'utf8');
const commandSource = fs.readFileSync('src/app/canonicalTransitionLocalCreateCommand.js', 'utf8');
assert(dialogSource.includes('CanonicalAuthoringDialog'));
assert(dialogSource.includes('action?.authoring?.requiredInputs'));
assert.equal(dialogSource.includes('const FIELDS'), false, 'authoring fields are not hardcoded as UI semantic authority');
assert.equal(recordDialogSource.includes('<CanonicalTaskCreateDialog'), false, 'RecordActionDialog has no schema-specific canonical create branch');
assert(commandSource.includes('localArtifactMaterializerForSchema'));
assert.equal(commandSource.includes("output?.schemaConstraint === 'tiinex.task.v1'"), false, 'execution guard does not special-case Task output');
assert.equal(productSource.includes('supportedTopicParentRole'), false);
assert.equal(productSource.includes('supportedTaskOutput'), false);

console.log('post-v431 M0-D canonical authoring parity closure: PASS');

function bundled(path, title, sourceQualification) {
  return Object.freeze({ path, title, markdown: fs.readFileSync(path, 'utf8'), sourceQualification, sourceMode: 'bundled-canonical-transition-definition', source: Object.freeze({ id: `site:${path}`, adapterId: 'static', sourceKind: 'bundled-canonical', sourceMode: 'bundled-canonical-transition-definition', sourceArtifactPath: path }) });
}
function artifactMarkdown(schemaId, title) {
  return `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: ${schemaId}\n  - Created At: 2026-08-19 00:00:00\n  - Summary: ${title}\n\n---\n\n# ${title}\n\nReadable loaded artifact.\n`;
}
function localRecord({ id, schemaId, title, path }) {
  return Object.assign(createRecordFromMarkdown(artifactMarkdown(schemaId, title), { path, name: title, sourceMode: 'local' }), { id, workspaceId: 'w', title, schemaId, kind: schemaId, path, sourceMode: 'local', source: { id: 'local', adapterId: 'local', kind: 'local-session' } });
}
function appState(records) {
  return { version: 1, activeWorkspaceId: 'w', view: { universe: 'column', workspaceVerse: 'feed', reader: 'scan', query: '' }, workspaces: [{ id: 'w', name: 'Workspace', title: 'Workspace', createdAt: '2026-08-19T00:00:00.000Z', kind: 'workspace', source: { id: 'local', adapterId: 'local', kind: 'local-session' }, sources: [], sourceOrder: [], records, assets: [], importLog: [], mode: 'feed' }], audit: null };
}
function execute(state, currentRecordId, definitionKey, values, bundledDefinitions, iso) {
  return executeCanonicalTransitionLocalCreate({ lifecycle, state, workspaceId: 'w', currentRecordId, definitionKey, values, schemaCache, bundledDefinitions, persistenceOwnership: ownership, now: new Date(iso), clock: () => iso });
}
function memoryEnv() {
  const map = new Map();
  const location = { pathname: '/index.html', search: '', hash: '' };
  const history = { replaceState: (_a, _b, url) => { location.hash = url.includes('#') ? `#${url.split('#').pop()}` : ''; }, pushState: (_a, _b, url) => { location.hash = url.includes('#') ? `#${url.split('#').pop()}` : ''; } };
  const storage = { getItem: (key) => map.get(key) || null, setItem: (key, value) => map.set(key, String(value)), removeItem: (key) => map.delete(key) };
  return { storage, location, history, map };
}
