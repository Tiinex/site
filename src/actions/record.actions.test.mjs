import assert from 'assert';
import {
  actionAvailabilityForRecord,
  actionIsRenderable,
  createRecordActionResult,
  isRemovableLocalDraftRecord,
  presentRecordActions,
  RECORD_ACTIONS_CONTRACT_ID,
  RECORD_ACTION_RESULT_SCHEMA_ID,
  RecordActionKind,
  sourceHrefForRecord
} from './record.actions.js';

const localRecord = { id: 'local-1', title: 'Local', path: 'local.md', markdown: '# Local\n\nText', source: { adapterId: 'local', sourceKind: 'local.session' } };
const localActions = presentRecordActions(localRecord);
assert(localActions.every((action) => action.contract === RECORD_ACTIONS_CONTRACT_ID), 'actions must carry contract id');
assert(localActions.some((action) => action.id === RecordActionKind.open), 'local record must expose open action');
assert(localActions.some((action) => action.id === RecordActionKind.share), 'local record must expose share action');
assert(localActions.some((action) => action.id === RecordActionKind.markdown && action.label === 'Show markdown'), 'local record must expose old-like Show markdown dialog action');
assert(!localActions.some((action) => action.id === RecordActionKind.lineage), 'card itself owns Lineage focus; no separate Lineage button should crowd cards');
assert(!localActions.some((action) => action.id === RecordActionKind.continue), 'local records without a concrete schema transition must not expose Continue');
assert(!localActions.some((action) => action.id === RecordActionKind.reference), 'local records without a declared schema reference transition must not expose evidence preservation');
assert(!localActions.some((action) => action.id === RecordActionKind.source), 'local record must not expose source action');
assert(!localActions.some((action) => action.id === RecordActionKind.deleteLocal), 'manual local files are not treated as unpublished transition drafts');
assert(!sourceHrefForRecord(localRecord), 'local record must not create external source href');
const localContinue = createRecordActionResult(localRecord, RecordActionKind.continue);
assert(localContinue.schema === RECORD_ACTION_RESULT_SCHEMA_ID, 'legacy continue capsule remains available behind explicit transition code paths');
assert(localContinue.text.includes('Boundary: browser-local session material'), 'continue result must preserve local boundary');
const localReference = createRecordActionResult(localRecord, RecordActionKind.reference);
assert.equal(localReference.intent, 'preserve-evidence-from-selected-record', 'reference-labeled implementation must disclose evidence preservation semantics');
assert(localReference.text.includes('Record ID: local-1'), 'evidence preservation result must contain stable record id');
assert(localReference.text.includes('not the PoC cross-artifact Reference relation'), 'evidence preservation must not claim old Reference semantics');
const localAvailability = actionAvailabilityForRecord(localRecord);
assert.equal(localAvailability.continue.enabled, false, 'Continue availability must be schema/capability gated');
assert.equal(localAvailability.reference.enabled, false, 'Reference/preserve availability must be schema/capability gated');


const unpinnedGithubRecord = {
  id: 'source:github:tiinex/docs:.topics/README.md',
  title: 'Unpinned Source',
  path: '.topics/README.md',
  source: { adapterId: 'github', repo: 'Tiinex/docs', ref: '' }
};
assert(!sourceHrefForRecord(unpinnedGithubRecord), 'github source href must not guess a default branch when ref is unpinned');

const githubRecord = {
  id: 'source:github:tiinex/docs:.topics/README.md',
  title: 'Readme',
  path: '.topics/README.md',
  markdown: '# Readme',
  source: { adapterId: 'github', repo: 'Tiinex/docs', ref: 'master' }
};
const href = sourceHrefForRecord(githubRecord);
assert(href === 'https://github.com/Tiinex/docs/blob/master/.topics/README.md', 'github record source href must be deterministic');
const githubActions = presentRecordActions(githubRecord);
assert(githubActions.some((action) => action.id === RecordActionKind.source && action.href === href && action.label === 'Open source'), 'github record must expose Open source action with href');
assert(githubActions.every(actionIsRenderable), 'all presented actions must be renderable, not decorative no-ops');

const issueBackedRecord = {
  id: 'source:github:tiinex/docs:https://github.com/Tiinex/docs/issues/9#issuecomment-1',
  title: 'Issue-backed',
  path: '.topics/.github/.issues/tiinex-docs-issue-9/comment-001-recovered.trace.md',
  source: { adapterId: 'github', repo: 'Tiinex/docs', ref: 'master' },
  sourceTarget: { inputTarget: 'https://github.com/Tiinex/docs/issues/9#issuecomment-1' },
  recoveredFromUrl: 'https://github.com/Tiinex/docs/issues/9#issuecomment-1'
};
assert.equal(sourceHrefForRecord(issueBackedRecord), 'https://github.com/Tiinex/docs/issues/9#issuecomment-1', 'issue-backed records should open their GitHub issue/comment source instead of synthetic repo path');
const rawParentRecord = {
  id: 'source:github:tiinex/docs:.topics/odysseus/001-1.trace.md',
  title: 'Parent file',
  path: '.topics/odysseus/001-1.trace.md',
  source: { adapterId: 'github', repo: 'Tiinex/docs', ref: 'master' },
  sourceTarget: { rawUrl: 'https://raw.githubusercontent.com/Tiinex/docs/master/.topics/odysseus/001-1.trace.md' }
};
assert.equal(sourceHrefForRecord(rawParentRecord), 'https://github.com/Tiinex/docs/blob/master/.topics/odysseus/001-1.trace.md', 'raw source-backed parent files should expose a browser GitHub source URL');

const recoveredParentWithoutRef = {
  id: 'source:github:tiinex/docs:recovered-parent',
  title: 'Recovered parent',
  path: '.topics/.github/tiinex/docs/.issues/10/issue-root-recovered-parent.trace.md',
  source: { adapterId: 'github', repo: 'Tiinex/docs', ref: '' },
  sourceTarget: { rawUrl: 'https://raw.githubusercontent.com/Tiinex/docs/f8b37239f17bc48180cfc8f93f812c6ffc6edc1f/.topics/odysseus/001-1-1.trace.md' }
};
assert.equal(sourceHrefForRecord(recoveredParentWithoutRef), 'https://github.com/Tiinex/docs/blob/f8b37239f17bc48180cfc8f93f812c6ffc6edc1f/.topics/odysseus/001-1-1.trace.md', 'recovered source files should expose Open source from raw URL even when route shell has no ref');

const syntheticIssueOnlyRecord = {
  id: 'source:github:tiinex/docs:synthetic-only',
  title: 'Synthetic only',
  path: '.topics/.github/tiinex/docs/.issues/9/issue-snapshot.trace.md',
  source: { adapterId: 'github', repo: 'Tiinex/docs', ref: '' }
};
assert.equal(sourceHrefForRecord(syntheticIssueOnlyRecord), '', 'synthetic issue display paths must not be treated as GitHub blob source URLs');


const workspaceRecord = {
  id: 'source:github:tiinex/site:.topics/docs.workspace.md',
  title: 'Documentation',
  path: '.topics/docs.workspace.md',
  markdown: `# Documentation\n\n## Workspace Entrypoints\n`,
  currentSchemaId: 'tiinex.workspace.v1',
  source: { adapterId: 'github', repo: 'Tiinex/site', ref: 'master' }
};
const workspaceActions = presentRecordActions(workspaceRecord);
assert(workspaceActions.some((action) => action.id === RecordActionKind.workspaceOpen && action.label === 'Open'), 'source-backed .workspace.md records must expose Open workspace');
assert(workspaceActions.some((action) => action.id === RecordActionKind.workspaceMerge && action.label === 'Merge'), 'source-backed .workspace.md records must expose Merge workspace');
assert(workspaceActions.every(actionIsRenderable), 'workspace record actions must be renderable');


const topicRecord = {
  id: 'topic-1',
  title: 'News',
  path: '.topics/news.trace.md',
  markdown: '# News\n\nTopic material.',
  schemaId: 'tiinex.topic.v1',
  kind: 'tiinex.topic.v1',
  sourceMode: 'source-backed',
  source: { adapterId: 'github', repo: 'Tiinex/docs', ref: 'master' }
};
const topicAvailability = actionAvailabilityForRecord(topicRecord);
assert.equal(topicAvailability.continue.enabled, true, 'Topic companion transition should make Continue semantically available');
assert.equal(topicAvailability.reference.enabled, false, 'Topic has no Reference transition in the first slice');
const topicActions = presentRecordActions(topicRecord);
assert(topicActions.some((action) => action.id === RecordActionKind.continue), 'semantic Continue action remains available behind transition presentation');
const localTaskDraft = { id: 'draft-1', title: 'Task draft', path: '.topics/news/001-1-task.trace.md', status: 'local', sourceMode: 'local-transition', source: { adapterId: 'local', kind: 'local-session' } };
assert.equal(isRemovableLocalDraftRecord(localTaskDraft), true, 'browser-local transition drafts can be removed from the session');
const localTaskActions = presentRecordActions(localTaskDraft);
assert(localTaskActions.some((action) => action.id === RecordActionKind.deleteLocal && action.icon === 'delete'), 'local transition drafts expose Delete local draft');
assert(localTaskActions.every(actionIsRenderable), 'delete-local action must be renderable');

const importedPackageRecord = {
  id: 'package:local:.topics/imported.trace.md',
  title: 'Imported package artifact',
  path: '.topics/imported.trace.md',
  sourceMode: 'package-import',
  packageImport: true,
  source: { adapterId: 'export-package', kind: 'local-session', sourceKind: 'export.package.import', sourceBacked: false }
};
assert.equal(sourceHrefForRecord(importedPackageRecord), '', 'package-imported local material must not expose guessed source href');
assert.equal(isRemovableLocalDraftRecord(importedPackageRecord), true, 'browser-local package imports can be removed from the current workspace');
const importedActions = presentRecordActions(importedPackageRecord);
assert(importedActions.some((action) => action.id === RecordActionKind.deleteLocal && action.label === 'Remove imported local copy'), 'imported local material exposes a removal affordance with non-source wording');
assert(!importedActions.some((action) => action.id === RecordActionKind.source), 'imported local material must not expose Open source');

assert.equal(isRemovableLocalDraftRecord(topicRecord), false, 'source-backed records cannot be deleted through local draft removal');
assert(!presentRecordActions(topicRecord).some((action) => action.id === RecordActionKind.deleteLocal), 'source-backed topic must not expose local delete');

const githubAvailability = actionAvailabilityForRecord(githubRecord);
assert.equal(githubAvailability.continue.enabled, false, 'source-backed records still need a concrete schema transition before Continue is rendered');
assert.equal(githubAvailability.reference.enabled, false, 'source-backed records still need a concrete schema transition before preserve/reference is rendered');
const githubReference = createRecordActionResult(githubRecord, RecordActionKind.reference);
assert(githubReference.text.includes('source-backed github material'), 'github evidence preservation result must preserve source-backed boundary when invoked by explicit transition code');

console.log('✓ record action tests passed');
