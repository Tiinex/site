import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { compileCanonicalTransitionSemanticPackage, CANONICAL_TOPIC_TO_TASK_BUNDLED_SOURCE_ID, CANONICAL_TOPIC_TO_TASK_REPRESENTATION_KEY, CANONICAL_TRANSITION_TASK_PACKAGE_KEY, CANONICAL_TRANSITION_TOPIC_PACKAGE_KEY } from '../transitions/canonicalTransition.semanticPackage.js';
import { CANONICAL_TRANSITION_SCHEMA_CACHE_MANIFEST, gitBlobSha1 } from '../transitions/canonicalTransition.schemaCache.js';
import { parsePortableSchemaDocument } from '../tooling/portable/schema/schema.contract.js';
import { compilePortableSchemaContractChain } from '../tooling/portable/schema/contract.compile.js';
import { validatePortableContractInstance } from '../tooling/portable/schema/contract.validate.js';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { prepareCanonicalTransitionProductActions } from '../transitions/transition.productPreparation.js';
import { executeCanonicalTransitionLocalCreate } from '../app/canonicalTransitionLocalCreateCommand.js';
import { runGithubSourceOperation } from '../app/githubSourceOperation.js';
import { transitionProductActionsForRecord } from '../transitions/transition.productPresentation.js';
import { createPersistenceOwnershipPolicy, PersistenceRouteOwner } from '../app/persistenceOwnership.js';
import { canonicalC14nV2SelfState } from '../integrity/integrity.c14nV2.js';
import '../workspaces/workspace.lifecycle.js';

const read = (path) => fs.readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
const exists = (path) => fs.existsSync(new URL(`../../${path}`, import.meta.url));
const oldDefinitionPath = 'src/transitions/definitions/topic-to-task-transition-definition.trace.md';
const oldTaskCachePath = 'src/transitions/canonical-schema-cache/d69b8ff55a56b8cb9282b8684db6a938a4435b94/tiinex.task.v1.schema.md';
const transitionPath = 'src/schemas/core/task/.transitions/topic-to-task-transition-definition.trace.md';
const taskSchemaPath = 'src/schemas/core/task/tiinex.task.v1.schema.md';
const topicSchemaPath = 'src/schemas/core/topic/tiinex.topic.v1.schema.md';
const taskPackagePath = 'src/schemas/core/task/task-semantic-package.trace.md';
const topicPackagePath = 'src/schemas/core/topic/topic-semantic-package.trace.md';
const taskCompanionPath = 'src/schemas/core/task/tiinex.task.v1-transitions.trace.md';
const topicCompanionPath = 'src/schemas/core/topic/tiinex.topic.v1-transitions.trace.md';
const rootContractPath = 'src/transitions/canonical-schema-cache/d69b8ff55a56b8cb9282b8684db6a938a4435b94/tiinex.root.v1.schema.md';
const transitionContractPath = 'src/transitions/canonical-schema-cache/d69b8ff55a56b8cb9282b8684db6a938a4435b94/tiinex.transition.definition.v1.schema.md';
const semanticPackageContractPath = 'src/transitions/canonical-schema-cache/053d46ce082d4ec261b82abc44ecca403d61e240/tiinex.semantic.package.v1.schema.md';
const companionContractPath = 'src/transitions/canonical-schema-cache/053d46ce082d4ec261b82abc44ecca403d61e240/tiinex.schema.transition.companion.v1.schema.md';
const packageInput = () => ({
  contracts: {
    root: read(rootContractPath),
    semanticPackage: read(semanticPackageContractPath),
    schemaTransitionCompanion: read(companionContractPath),
    transitionDefinition: read(transitionContractPath)
  },
  materials: {
    taskPackage: read(taskPackagePath), taskSchema: read(taskSchemaPath), taskCompanion: read(taskCompanionPath), transition: read(transitionPath),
    topicPackage: read(topicPackagePath), topicSchema: read(topicSchemaPath), topicCompanion: read(topicCompanionPath)
  }
});

// Production contract authority is exact canonical material, never Tooling pressure fixtures.
assert.equal(sha256(read(semanticPackageContractPath)), '5a457d9a7a4f6b9281819d2c1e1bc80e7d4f3ea15069285399fce4f7a28c1502');
assert.equal(gitBlobSha1(read(semanticPackageContractPath)), '5686051540603e05d483dc527af27b8e69ffee36');
assert.equal(sha256(read(companionContractPath)), 'f78dbf800c3080d6f0ab5832a31e793278ba723796996aae57a6a82a4a5c8f4a');
assert.equal(gitBlobSha1(read(companionContractPath)), '1b45d674c3f8b553b9a26f2e9983d2ccf4197cca');
const defaultsSource = read('src/transitions/canonicalTransition.productDefaults.js');
const contractSeamSource = read('src/transitions/canonicalTransition.packageContracts.js');
assert.equal(defaultsSource.includes('/package/fixtures/'), false, 'browser product defaults must not consume Tooling pressure fixtures');
assert.equal(contractSeamSource.includes('/package/fixtures/'), false, 'canonical contract seam must not consume Tooling pressure fixtures');

// Full canonical Root + descendant contracts require finalized Continuity Integrity.
const rootContract = read(rootContractPath);
const packageContract = compilePortableSchemaContractChain([rootContract, read(semanticPackageContractPath)]);
const companionContract = compilePortableSchemaContractChain([rootContract, read(companionContractPath)]);
for (const [path, contract] of [
  [taskPackagePath, packageContract],
  [topicPackagePath, packageContract],
  [taskCompanionPath, companionContract],
  [topicCompanionPath, companionContract]
]) {
  const markdown = read(path);
  assert.equal(validatePortableContractInstance({ markdown, compiledContract: contract }).status, 'valid', `${path} validates against full canonical Root + descendant contract`);
  assert.match(markdown, /^# Continuity Integrity$/m, `${path} carries inherited Root Continuity Integrity`);
  assert.equal(c14nV2SelfSealValid(markdown), true, `${path} carries a real c14n-v2 self seal`);
}
assert.equal(validatePortableContractInstance({ markdown: withoutIntegrity(read(taskPackagePath)), compiledContract: packageContract }).status, 'incomplete', 'removing package integrity fails full canonical-chain validation');
assert.equal(validatePortableContractInstance({ markdown: withoutIntegrity(read(taskCompanionPath)), compiledContract: companionContract }).status, 'incomplete', 'removing companion integrity fails full canonical-chain validation');

// Exact Task schema materialization authority and duplicate removal.
const taskMarkdown = read(taskSchemaPath);
assert.equal(gitBlobSha1(taskMarkdown), 'e4d545ad45382a150351ead587339d8b43cc0fb2');
assert.equal(CANONICAL_TRANSITION_SCHEMA_CACHE_MANIFEST.find((item) => item.schemaId === 'tiinex.task.v1')?.path, '.topics/.schemas/core/task/tiinex.task.v1.schema.md');
const taskDoc = parsePortableSchemaDocument(taskMarkdown);
assert.equal(taskDoc.schemaId, 'tiinex.task.v1');
assert.equal(taskDoc.validation.groups.length, 6);
assert.equal(taskDoc.creation.groups.length, 2);
assert.equal(exists(oldTaskCachePath), false, 'old duplicate canonical Task cache path must be absent');
assert.equal(exists(oldDefinitionPath), false, 'old application-local Transition Definition path must be absent');
assert.equal(exists(transitionPath), true, 'Task-local canonical Transition representation must exist');

const output = compileCanonicalTransitionSemanticPackage(packageInput());
assert.equal(output.compilation.status, 'valid');
assert.equal(output.compilation.packageGraph.nodes.length, 2);
assert.deepEqual(output.compilation.packageGraph.nodes.map((node) => node.manifestKey), [CANONICAL_TRANSITION_TASK_PACKAGE_KEY, CANONICAL_TRANSITION_TOPIC_PACKAGE_KEY]);
assert.equal(output.compilation.findings.some((finding) => finding.code === 'portable.semantic-package.cycle.observed'), true, 'explicit package cycle remains observable and terminates');
assert.equal(output.compilation.transitionRegistry.length, 1, 'exactly one Topic→Task representation is in the compiled registry');
const transition = output.compilation.transitionRegistry[0];
assert.equal(transition.representationKey, CANONICAL_TOPIC_TO_TASK_REPRESENTATION_KEY);
assert.equal(transition.path, transitionPath);
assert.equal(transition.canonicalIdentifier, 'tiinex.site.topic-to-task.v1');
assert.equal(transition.representationQualification, 'valid');
assert.equal(transition.discoveryProvenance.length > 0, true);
assert.equal(transition.attachmentProvenance.length, 2, 'Task and Topic companions retain explicit attachment provenance without duplicating the Transition');

for (const packageKey of [CANONICAL_TRANSITION_TASK_PACKAGE_KEY, CANONICAL_TRANSITION_TOPIC_PACKAGE_KEY]) {
  for (const schemaId of ['tiinex.task.v1', 'tiinex.topic.v1']) {
    const resolution = output.compilation.schemaResolutions.find((item) => item.packageKey === packageKey && item.schemaId === schemaId);
    assert.equal(resolution?.qualification, 'resolved', `${packageKey} resolves ${schemaId} through declared package authority`);
  }
}
const taskCompanion = output.compilation.companions.find((item) => item.representationKey === 'site-companion:task');
const topicCompanion = output.compilation.companions.find((item) => item.representationKey === 'site-companion:topic');
assert.equal(taskCompanion?.status, 'valid');
assert.equal(taskCompanion?.schemaBinding?.path, taskSchemaPath);
assert.equal(taskCompanion?.attachmentSet?.attachments?.[0]?.referenceQualification, 'resolved');
assert.equal(taskCompanion?.attachmentSet?.attachments?.[0]?.participation?.qualification, 'consistent');
assert.equal(topicCompanion?.status, 'valid');
assert.equal(topicCompanion?.schemaBinding?.path, topicSchemaPath);
assert.equal(topicCompanion?.attachmentSet?.attachments?.[0]?.referenceTarget.startsWith('site-local:'), true, 'Topic reverse attachment uses explicit cross-package route, not relative escape');
assert.equal(topicCompanion?.attachmentSet?.attachments?.[0]?.participation?.qualification, 'consistent');
assert.equal(output.compilation.findings.some((finding) => String(finding.code).includes('boundary.invalid') || String(finding.code).includes('reference.invalid')), false, 'no relative cross-package escape is accepted');

assert.equal(output.definitions.length, 1);
assert.equal(output.definitions[0].path, transitionPath);
assert.equal(output.definitions[0].sourceQualification, 'compiled-semantic-package-qualified');
assert.equal(output.definitions[0].source.id, CANONICAL_TOPIC_TO_TASK_BUNDLED_SOURCE_ID);
assert.equal(output.definitions[0].source.semanticPackageRepresentationKey, CANONICAL_TOPIC_TO_TASK_REPRESENTATION_KEY);
assert.equal(output.definitions[0].source.packageDiscoveryProvenance.length > 0, true);
assert.equal(output.definitions[0].source.packageAttachmentProvenance.length, 2);


// Actual Site product path consumes the compiled package definition, not a hard-coded definition directory.
const cacheCommit = 'd69b8ff55a56b8cb9282b8684db6a938a4435b94';
const cacheMarkdown = Object.freeze({
  'tiinex.root.v1': read(`src/transitions/canonical-schema-cache/${cacheCommit}/tiinex.root.v1.schema.md`),
  'tiinex.transition.definition.v1': read(`src/transitions/canonical-schema-cache/${cacheCommit}/tiinex.transition.definition.v1.schema.md`),
  'tiinex.task.v1': taskMarkdown
});
const schemaCache = CANONICAL_TRANSITION_SCHEMA_CACHE_MANIFEST.map((item) => ({ ...item, markdown: cacheMarkdown[item.schemaId], sourceQualification: 'source-qualified-cache' }));
const topicMarkdown = `# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.topic.v1
  - Created At: 2026-08-17 00:00:00
  - Summary: Package-locality source Topic

---

# Package-locality source Topic

Readable source.
`;
const topicRecord = Object.assign(createRecordFromMarkdown(topicMarkdown, { path: '.topics/package-locality.trace.md', name: 'Package-locality source Topic', sourceMode: 'source-backed' }), {
  id: 'package-locality-topic', workspaceId: 'workspace-1', title: 'Package-locality source Topic', schemaId: 'tiinex.topic.v1', path: '.topics/package-locality.trace.md', sourceMode: 'source-backed',
  source: { id: 'github:Tiinex/docs', kind: 'github-tree', adapterId: 'github', repository: 'Tiinex/docs', repo: 'Tiinex/docs', ref: '1111111111111111111111111111111111111111', rootPath: '' },
  sourceTarget: { sourceArtifactPath: '.topics/package-locality.trace.md', inputTarget: '.topics/package-locality.trace.md' }
});
const prepared = prepareCanonicalTransitionProductActions({ currentRecord: topicRecord, workspaceRecords: [topicRecord], workspaceId: 'workspace-1', schemaCache, bundledDefinitions: output.definitions });
const productAction = prepared.actions.find((action) => action.canonicalIdentifier === 'tiinex.site.topic-to-task.v1');
assert.equal(productAction?.productCapable, true, 'compiled package registry definition reaches the unchanged v424 product capability');
assert.equal(productAction?.definition?.source?.sourceId, CANONICAL_TOPIC_TO_TASK_BUNDLED_SOURCE_ID, 'Site read model preserves exact bundled representation source identity');
const state = { version: 1, activeWorkspaceId: 'workspace-1', view: { universe: 'column', workspaceVerse: 'feed', reader: 'scan', query: '' }, workspaces: [{ id: 'workspace-1', name: 'Package locality', title: 'Package locality', createdAt: '2026-08-17T00:00:00.000Z', kind: 'workspace', source: { id: 'local', adapterId: 'local', kind: 'local-session' }, sources: [], sourceOrder: [], records: [topicRecord], assets: [], importLog: [], mode: 'feed' }], audit: null };
let mutations = 0;
const baseLifecycle = globalThis.TiinexWorkspaceLifecycle;
const lifecycle = Object.freeze({ ...baseLifecycle, addWorkspaceRecord(...args) { mutations += 1; return baseLifecycle.addWorkspaceRecord(...args); } });
const created = executeCanonicalTransitionLocalCreate({
  lifecycle, state, workspaceId: 'workspace-1', currentRecordId: topicRecord.id, definitionKey: productAction.definitionKey,
  values: { Summary: 'Compiled registry Task', Objective: 'Prove Site consumes semantic-package registry truth.', 'Done Criteria': 'Exactly one local Task exists.', Scope: 'v426 package locality only.', Dependencies: 'One source-backed Topic.' },
  schemaCache, bundledDefinitions: output.definitions, persistenceOwnership: createPersistenceOwnershipPolicy(PersistenceRouteOwner.semanticState), now: new Date('2026-08-17T00:01:00.000Z'), clock: () => '2026-08-17T00:01:00.000Z'
});
assert.equal(created.ok, true);
assert.equal(mutations, 1, 'compiled package registry product path materializes exactly one Task');
assert.equal(created.bindingPlan?.qualification, 'qualified');
assert.equal(created.v423?.qualification, 'qualified');
assert.equal(created.record?.schemaId, 'tiinex.task.v1');
assert.equal(created.record?.path, '.topics/compiled-registry-task--task.trace.md');
assert.equal(created.concretePath, created.record.path);
assert.equal(created.state.workspaces[0].records.find((record) => record.id === topicRecord.id)?.markdown, topicRecord.markdown, 'source Topic remains unchanged');

// Q-fail closure: ordinary blank/default GitHub ref must preserve exact materialized commit authority and select the canonical browser product path.
const qCommit = 'dddddddddddddddddddddddddddddddddddddddd';
const qTopicPath = '.topics/q-browser-topic.trace.md';
const qRepoApi = 'https://api.github.com/repos/Tiinex/docs';
const qCommitApi = 'https://api.github.com/repos/Tiinex/docs/commits/main';
const qTreeApi = `https://api.github.com/repos/Tiinex/docs/git/trees/${qCommit}?recursive=1`;
const qRaw = `https://raw.githubusercontent.com/tiinex/docs/${qCommit}/${qTopicPath}`;
const qFetch = async (url) => {
  const payload = url === qRepoApi ? { default_branch: 'main' }
    : url === qCommitApi ? { sha: qCommit }
    : url === qTreeApi ? { truncated: false, tree: [{ type: 'blob', path: qTopicPath }] }
    : null;
  const text = url === qRaw ? topicMarkdown.replace(/Package-locality source Topic/g, 'Q browser Topic') : '';
  if (!payload && !text) return response({}, '', { ok: false, status: 404, statusText: 'Not Found' });
  return response(payload || null, text);
};
const qWorkspace = globalThis.TiinexWorkspaceLifecycle.createWorkspace(globalThis.TiinexWorkspaceLifecycle.makeEmptyAppState(), { name: 'Q browser path' }, { clock: () => '2026-08-17T18:00:00.000Z' });
const qSource = await runGithubSourceOperation({
  input: { repository: 'Tiinex/docs', ref: '', rootPath: '.topics', repoDiscovery: true, transportRefreshTier: 'direct', resetSourceCache: false, allowSourceCache: false },
  state: qWorkspace.state,
  active: qWorkspace.workspace,
  runtimeApi: { lifecycle: globalThis.TiinexWorkspaceLifecycle },
  workspaceConfig: {},
  setNotice() {}, setDialog() {}, setGithubRequestPending() {}, commit() {},
  getLatestState: () => qWorkspace.state,
  fetchImpl: qFetch
});
assert.equal(qSource.ok, true, qSource.error);
const qState = qSource.state;
const qWs = qState.workspaces.find((workspace) => workspace.id === qWorkspace.workspace.id);
const qConfiguredSource = qWs.sources.find((source) => source.id === qSource.sourceId);
assert.equal(qConfiguredSource?.ref, 'main', 'default branch remains configured source ref truth');
assert.equal(qConfiguredSource?.requestedRef, '', 'blank requested ref remains distinct from resolved default branch');
assert.equal(qConfiguredSource?.materializedCommit, qCommit, 'configured source preserves immutable materialization receipt');
const qTopic = qWs.records.find((record) => record.title === 'Q browser Topic');
assert.ok(qTopic, 'ordinary GitHub source operation materializes the Topic record');
assert.equal(qTopic.source?.ref, 'main');
assert.equal(qTopic.source?.materializedCommit, qCommit);
assert.equal(qTopic.sourceTarget?.materializedCommit, qCommit, 'record representation owns exact immutable commit provenance');
assert.equal(qTopic.sourceTarget?.rawUrl, qRaw, 'record bytes were loaded from the exact commit-pinned raw target');
const qActions = transitionProductActionsForRecord(qTopic, { workspaceRecords: qWs.records, workspaceId: qWs.id, schemaCache, bundledDefinitions: output.definitions, maxPrimary: 10 });
const qCanonical = qActions.find((action) => action.kind === 'canonical-transition-product');
assert.equal(qCanonical?.productCapable, true, 'ordinary default-ref source reaches canonical product capability');
assert.deepEqual(qCanonical?.authoring?.requiredInputs, ['Summary', 'Objective', 'Done Criteria', 'Scope', 'Dependencies']);
assert.equal(qActions.some((action) => action.definitionId === 'topic.continue.task'), false, 'legacy continuation cannot mask or replace active packaged Topic→Task authority');
const qBefore = qTopic.markdown;
const qCreated = executeCanonicalTransitionLocalCreate({
  lifecycle: globalThis.TiinexWorkspaceLifecycle, state: qState, workspaceId: qWs.id, currentRecordId: qTopic.id, definitionKey: qCanonical.definitionKey,
  values: { Summary: 'Q canonical Task', Objective: 'Exercise ordinary browser source provenance.', 'Done Criteria': 'Canonical dialog path creates one Task.', Scope: 'v426 Q-fail closure.', Dependencies: 'One source-backed Topic.' },
  schemaCache, bundledDefinitions: output.definitions, persistenceOwnership: createPersistenceOwnershipPolicy(PersistenceRouteOwner.semanticState), now: new Date('2026-08-17T18:01:00.000Z'), clock: () => '2026-08-17T18:01:00.000Z'
});
assert.equal(qCreated.ok, true);
assert.equal(qCreated.bindingPlan?.qualification, 'qualified');
assert.equal(qCreated.v423?.qualification, 'qualified');
assert.equal(qCreated.record?.schemaId, 'tiinex.task.v1');
assert.ok((qCreated.record?.markdown || '').includes(`/blob/${qCommit}/${qTopicPath}`), 'Task Parent provenance uses exact commit-pinned permalink');
assert.equal(qCreated.state.workspaces.find((workspace) => workspace.id === qWs.id)?.records.find((record) => record.id === qTopic.id)?.markdown, qBefore, 'ordinary source Topic remains byte-unchanged after canonical Task creation');
const dialogSource = read('src/schemas/workspace/workspace.recordDialogs.views.jsx');
assert.ok(dialogSource.indexOf('isCanonicalTransitionProductAction(action)') < dialogSource.indexOf('isTransitionAction(action)'), 'RecordActionDialog routes canonical product actions before legacy continuation actions');
console.log('post-v426 Q-fail canonical Topic→Task ordinary GitHub browser path closure: PASS');

// Deterministic compiled truth for the same explicit material graph.
const second = compileCanonicalTransitionSemanticPackage(packageInput());
assert.deepEqual(second.compilation.packageGraph, output.compilation.packageGraph);
assert.deepEqual(second.compilation.schemaResolutions, output.compilation.schemaResolutions);
assert.deepEqual(second.compilation.transitionRegistry, output.compilation.transitionRegistry);


function response(json = null, text = '', options = {}) {
  const body = text || (json ? JSON.stringify(json) : '');
  const make = () => ({
    ok: options.ok !== false,
    status: options.status || (options.ok === false ? 500 : 200),
    statusText: options.statusText || (options.ok === false ? 'Error' : 'OK'),
    transportTier: 'direct',
    json: async () => json || JSON.parse(body || '{}'),
    text: async () => body,
    clone: () => make()
  });
  return make();
}


function sha256(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}
function withoutIntegrity(markdown) {
  const marker = String(markdown || '').search(/^# Continuity Integrity\s*$/m);
  return marker < 0 ? String(markdown || '') : String(markdown || '').slice(0, marker).trimEnd();
}
function c14nV2SelfSealValid(markdown) { return canonicalC14nV2SelfState(markdown).state === 'verified'; }

console.log('post-v425 semantic-package locality + compiled Transition registry integration: PASS');
