import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { createGithubIssueSnapshotRecords } from '../adapters/github/github.issueSnapshot.js';
import { executeCanonicalTransitionLocalCreate } from '../app/canonicalTransitionLocalCreateCommand.js';
import { buildLineageSourceRecoveryPlan } from '../app/lineageSourceRecovery.js';
import { createPersistenceOwnershipPolicy, PersistenceRouteOwner } from '../app/persistenceOwnership.js';
import { CANONICAL_TRANSITION_SCHEMA_CACHE_MANIFEST } from '../transitions/canonicalTransition.schemaCache.js';
import { CANONICAL_TOPIC_TO_TASK_BUNDLED_SOURCE_ID } from '../transitions/canonicalTransition.semanticPackage.js';
import { allocateContinuationPath } from '../transitions/record.transitions.js';
import { transitionProductActionsForRecord } from '../transitions/transition.productPresentation.js';
import { resolveLineage } from '../lineage/lineage.resolve.js';
import { buildWorkspaceLineageView } from '../workspaces/workspace.lineageView.js';
import { buildWorkspacePathTree } from '../workspaces/workspace.pathTree.js';
import '../workspaces/workspace.lifecycle.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;
assert.ok(lifecycle?.addWorkspaceRecord);
const workspaceId = 'workspace-1';
const cacheCommit = 'd69b8ff55a56b8cb9282b8684db6a938a4435b94';
const cachePaths = {
  'tiinex.root.v1': `src/transitions/canonical-schema-cache/${cacheCommit}/tiinex.root.v1.schema.md`,
  'tiinex.transition.definition.v1': `src/transitions/canonical-schema-cache/${cacheCommit}/tiinex.transition.definition.v1.schema.md`,
  'tiinex.task.v1': 'src/schemas/core/task/tiinex.task.v1.schema.md',
  'tiinex.topic.v1': 'src/transitions/canonical-schema-cache/52ecdea0a75893882ce282214d155f70e1309c2a/tiinex.topic.v1.schema.md',
  'tiinex.interpretation.v1': 'src/schemas/core/interpretation/tiinex.interpretation.v1.schema.md',
  'tiinex.relation.v1': 'src/transitions/canonical-schema-cache/053d46ce082d4ec261b82abc44ecca403d61e240/tiinex.relation.v1.schema.md',
  'tiinex.schema.contract.v1': 'src/transitions/canonical-schema-cache/053d46ce082d4ec261b82abc44ecca403d61e240/tiinex.schema.contract.v1.schema.md',
  'tiinex.schema.generation.v1': 'src/transitions/canonical-schema-cache/053d46ce082d4ec261b82abc44ecca403d61e240/tiinex.schema.generation.v1.schema.md'
};
const schemaCache = CANONICAL_TRANSITION_SCHEMA_CACHE_MANIFEST.map((item) => ({ ...item, markdown: fs.readFileSync(cachePaths[item.schemaId], 'utf8'), sourceQualification: 'source-qualified-cache' }));
const definitionPath = 'src/schemas/core/task/.transitions/topic-to-task-transition-definition.trace.md';
const definitionMarkdown = fs.readFileSync(definitionPath, 'utf8');
const bundledDefinitions = Object.freeze([{ path: definitionPath, title: 'Topic to Task', markdown: definitionMarkdown, sourceQualification: 'compiled-semantic-package-qualified', sourceMode: 'bundled-canonical-transition-definition', source: { id: CANONICAL_TOPIC_TO_TASK_BUNDLED_SOURCE_ID, adapterId: 'static', kind: 'bundled-canonical' } }]);
const values = Object.freeze({ Summary: 'Dark Mode', Objective: 'Keep the canonical dialog coherent.', 'Done Criteria': 'One correctly placed local Task exists.', Scope: 'Canonical browser-local Topic to Task only.', Dependencies: 'One representable Topic.' });

function topicMarkdown(title = 'Topic') {
  return `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.topic.v1\n  - Created At: 2026-08-17 00:00:00\n  - Summary: ${title}\n\n---\n\n# ${title}\n\nReadable Topic material.\n\n# Continuity Integrity\n\n- q-acceptance-fixture-v1\n  - Towards: self\n  - Value: ${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}\n`;
}
function localTopic(path, id = 'local-topic', title = 'Local Topic') {
  return Object.assign(createRecordFromMarkdown(topicMarkdown(title), { path, name: title, sourceMode: 'local' }), { id, workspaceId, title, path, sourceMode: 'local', source: { id: 'local', adapterId: 'local', kind: 'local-session' } });
}
function state(records) {
  return { version: 1, activeWorkspaceId: workspaceId, view: { universe: 'column', workspaceVerse: 'feed', reader: 'scan', query: '' }, workspaces: [{ id: workspaceId, name: 'Q acceptance', title: 'Q acceptance', createdAt: '2026-08-17T22:00:00.000Z', kind: 'workspace', source: { id: 'local', adapterId: 'local', kind: 'local-session' }, sources: [], sourceOrder: [], records, assets: [], importLog: [], mode: 'feed' }], audit: null };
}
function presented(record, records) {
  return transitionProductActionsForRecord(record, { workspaceRecords: records, workspaceId, maxPrimary: 20, schemaCache, bundledDefinitions });
}
function canonicalAction(record, records) { return presented(record, records).find((action) => action.kind === 'canonical-transition-product' && action.canonicalIdentifier === 'tiinex.site.topic-to-task.v1'); }
function createFrom(inputState, recordId, inputValues = values) {
  const workspace = inputState.workspaces.find((item) => item.id === workspaceId);
  const record = workspace.records.find((item) => item.id === recordId);
  const action = canonicalAction(record, workspace.records);
  assert.ok(action?.productCapable, `${recordId}: canonical action must be product-capable`);
  return executeCanonicalTransitionLocalCreate({ lifecycle, state: inputState, workspaceId, currentRecordId: recordId, definitionKey: action.definitionKey, values: inputValues, schemaCache, bundledDefinitions, persistenceOwnership: createPersistenceOwnershipPolicy(PersistenceRouteOwner.semanticState), now: new Date('2026-08-17T22:01:00.000Z'), clock: () => '2026-08-17T22:01:00.000Z' });
}
function issueSnapshotRecord({ kind = 'issue', path, title, url, commentId = '9001' }) {
  const payload = `- Source Artifact Path: ${path}\n\n## Source Markdown\n\n\`\`\`markdown\n${topicMarkdown(title)}\n\`\`\``;
  const snapshot = kind === 'issue'
    ? { url, title: 'Issue container', body: payload, comments: [] }
    : { url: url.split('#')[0], title: 'Issue container', body: 'No embedded artifact in issue body.', comments: [{ id: Number(commentId), html_url: url, body: payload }] };
  const records = createGithubIssueSnapshotRecords(snapshot);
  const record = records.find((item) => item.sourceMode === `github-${kind}-embedded-artifact`);
  assert.ok(record, `${kind}: actual issueSnapshot adapter record`);
  return Object.assign(record, { id: `${kind}-topic`, workspaceId, title });
}
function parentEdge(records, parentId, childId) { return resolveLineage(records).edges.find((edge) => edge.kind === 'parent' && edge.from === parentId && edge.to === childId); }
function treeItemById(tree, id) { const stack = [...tree.folders]; for (const item of tree.items || []) if (item.id === id) return item; while (stack.length) { const node = stack.pop(); for (const item of node.items || []) if (item.id === id) return item; stack.push(...(node.folders || [])); } return null; }

// Strict exact Root + Task projection can express truthful issue/local Parent values; no schema loophole is used.
const strictRoot = schemaCache.find((item) => item.schemaId === 'tiinex.root.v1')?.markdown || '';
assert.ok(strictRoot.includes('### Trace Field'));
assert.ok(strictRoot.includes('Relative Path'));

// Local/session: canonical action, established naming, concrete receipt, deterministic id, tree placement and loaded lineage.
const local = localTopic('.topics/educational/memes/doom/001.trace.md');
assert.deepEqual(canonicalAction(local, [local])?.authoring?.requiredInputs, ['Summary', 'Objective', 'Done Criteria', 'Scope', 'Dependencies']);
assert.equal(presented(local, [local]).some((action) => action.definitionId === 'topic.continue.task'), false);
const localCreated = createFrom(state([local]), local.id);
assert.equal(localCreated.ok, true);
assert.equal(localCreated.record.path, '.topics/educational/memes/doom/001-1-dark-mode.trace.md');
assert.equal(localCreated.concretePath, localCreated.record.path);
assert.equal(localCreated.record.transitionMaterialization?.concretePath, localCreated.record.path);
assert.equal(localCreated.record.id, `local:${workspaceId}:${localCreated.record.path}`);
assert.equal(localCreated.record.trace, '001.trace.md');
assert.equal(localCreated.record.origin, local.path);
assert.equal(localCreated.record.markdown.includes('github.com/'), false, 'local parent must not fabricate remote provenance');
assert.ok(parentEdge(localCreated.workspace.records, local.id, localCreated.record.id), 'local loaded lineage resolves to parent');
const localTree = buildWorkspacePathTree({ records: localCreated.workspace.records, assets: [] });
assert.equal(treeItemById(localTree, localCreated.record.id)?.path, localCreated.record.path, 'tree projection uses concrete canonical path');

// Same parent + same title gets next child ordinal; source-backed occupied sibling also counts as occupied material.
const localSecond = createFrom(localCreated.state, local.id);
assert.equal(localSecond.record.path, '.topics/educational/memes/doom/001-2-dark-mode.trace.md');
const occupiedPath = '.topics/educational/memes/doom/001-1-dark-mode.trace.md';
const occupied = { id: 'occupied-source', title: 'Occupied source record', path: occupiedPath, kind: 'markdown', schemaId: '', sourceMode: 'source-backed', source: { id: 'github:x/y', adapterId: 'github', repo: 'x/y', ref: 'main' }, markdown: '# Occupied' };
const localCollision = createFrom(state([local, occupied]), local.id);
assert.equal(localCollision.record.path, '.topics/educational/memes/doom/001-2-dark-mode.trace.md');
assert.equal(allocateContinuationPath({ parentRecord: { path: '.topics/a/12-01-parent.trace.md' }, targetId: 'tiinex.task.v1', targetLabel: 'Task', title: 'Follow Up' }, { workspaceRecords: [] }).path, '.topics/a/12-01-01-follow-up.trace.md');
assert.equal(allocateContinuationPath({ parentRecord: { path: '.topics/.github/x/y/.issues/3/comment-001-5000000000-recovered-parent.trace.md' }, targetId: 'tiinex.task.v1', targetLabel: 'Task', title: 'Follow Up' }, { workspaceRecords: [] }).path, '.topics/.github/x/y/.issues/3/001-1-follow-up.trace.md');

// Actual issue body adapter record: path is exact embedded identity while Origin remains the issue container URL.
const issueUrl = 'https://github.com/Tiinex/docs/issues/42';
const issue = issueSnapshotRecord({ kind: 'issue', path: '.topics/social/001.trace.md', title: 'Issue Body Topic', url: issueUrl });
const issueAction = canonicalAction(issue, [issue]);
assert.equal(issueAction?.parentRecovery?.representationKind, 'github-issue-embedded');
assert.equal(issueAction?.parentRecovery?.path, issue.path);
assert.equal(issueAction?.parentRecovery?.originTarget, issueUrl);
const issueCreated = createFrom(state([issue]), issue.id);
assert.equal(issueCreated.ok, true);
assert.equal(issueCreated.record.path, '.topics/social/001-1-dark-mode.trace.md');
assert.equal(issueCreated.record.trace, '001.trace.md');
assert.equal(issueCreated.record.origin, issueUrl);
assert.equal(issueCreated.record.markdown.includes('[browse + git]'), false, 'issue Origin must not pretend to be repo-file Git provenance');
assert.ok(parentEdge(issueCreated.workspace.records, issue.id, issueCreated.record.id), 'issue loaded lineage resolves exact embedded parent');
assert.equal(issueCreated.taskQualification?.findings?.length, 0, 'truthful issue Parent satisfies exact canonical Task chain');

// Actual issue comment adapter record: comment URL is retained as Origin while Trace identifies the embedded artifact path.
const commentUrl = 'https://github.com/Tiinex/docs/issues/42#issuecomment-9001';
const comment = issueSnapshotRecord({ kind: 'comment', path: '.topics/social/comment-001-parent.trace.md', title: 'Issue Comment Topic', url: commentUrl, commentId: '9001' });
const commentAction = canonicalAction(comment, [comment]);
assert.equal(commentAction?.parentRecovery?.representationKind, 'github-comment-embedded');
const commentCreated = createFrom(state([comment]), comment.id);
assert.equal(commentCreated.ok, true);
assert.equal(commentCreated.record.path, '.topics/social/001-1-dark-mode.trace.md');
assert.equal(commentCreated.record.origin, commentUrl);
assert.ok(parentEdge(commentCreated.workspace.records, comment.id, commentCreated.record.id));

// Shared issue container cannot collapse multiple embedded artifacts: same Origin, distinct recovered paths/Trace identities.
const multiUrl = 'https://github.com/Tiinex/docs/issues/43';
const multi = createGithubIssueSnapshotRecords({ url: multiUrl, title: 'Multi artifact issue', body: `\`\`\`markdown\n${topicMarkdown('First Embedded Topic')}\n\`\`\`\n\n\`\`\`markdown\n${topicMarkdown('Second Embedded Topic')}\n\`\`\``, comments: [] })
  .filter((item) => item.sourceMode === 'github-issue-embedded-artifact')
  .map((item, index) => Object.assign(item, { id: `multi-${index + 1}`, workspaceId }));
assert.ok(multi.length >= 2);
assert.equal(multi[0].sourceTarget.inputTarget, multi[1].sourceTarget.inputTarget);
assert.notEqual(multi[0].path, multi[1].path, 'container URL is not exact embedded artifact identity');
const multiActions = multi.map((record) => canonicalAction(record, multi));
assert.equal(multiActions.every((action) => action?.productCapable), true);
assert.equal(new Set(multiActions.map((action) => action.parentRecovery.path)).size, multi.length);
assert.equal(new Set(multiActions.map((action) => action.parentRecovery.originTarget)).size, 1);

// When issue parent is not loaded, existing Origin recovery consumes the issue URL and the Trace path remains the artifact selector.
const issueChildOnlyWorkspace = { id: workspaceId, records: [issueCreated.record], sources: [], sourceOrder: [] };
const missingIssueView = buildWorkspaceLineageView(issueChildOnlyWorkspace, { records: issueChildOnlyWorkspace.records, query: '', selectedRecordId: issueCreated.record.id });
const recoveryPlan = buildLineageSourceRecoveryPlan(issueChildOnlyWorkspace, missingIssueView);
assert.equal(recoveryPlan.length, 1);
assert.deepEqual(recoveryPlan[0].issueUrls, [issueUrl]);
assert.equal(recoveryPlan[0].targets[0].target, '001.trace.md');

// Pathless/unrecoverable local Topic stays fail-closed and legacy compatibility does not mask active canonical authority.
const pathless = localTopic('', 'pathless-topic', 'Pathless Topic');
pathless.path = '';
const pathlessActions = presented(pathless, [pathless]);
assert.equal(pathlessActions.some((action) => action.kind === 'canonical-transition-product'), false);
assert.equal(pathlessActions.some((action) => action.definitionId === 'topic.continue.task'), false);

// Canonical dialog uses the established textarea styling hook; no raw browser-default textarea remains in the dialog source.
const dialogSource = fs.readFileSync('src/schemas/workspace/workspace.canonicalTaskDialog.views.jsx', 'utf8');
const fieldSource = fs.readFileSync('src/ui/primitives/Field.jsx', 'utf8');
const styleSource = fs.readFileSync('src/styles/app.css', 'utf8');
assert.ok(dialogSource.includes('TextareaField'));
assert.equal(dialogSource.includes('<textarea'), false);
assert.ok(fieldSource.includes('className="tx-textarea-field"'));
assert.ok(styleSource.includes('.tx-textarea-field textarea'));
assert.ok(styleSource.includes('background: rgba(0,0,0,0.22)'));
assert.ok(styleSource.includes('.tx-textarea-field textarea:focus'));

console.log('post-v426 Q acceptance discovery-consolidated canonical placement/theme/source-neutrality closure: PASS');
