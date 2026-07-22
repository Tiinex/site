import assert from 'assert';
import {
  actionIsRenderable,
  createRecordActionResult,
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
assert(localActions.some((action) => action.id === RecordActionKind.lineage && action.label === 'Lineage'), 'local record must expose separate lineage action');
assert(localActions.some((action) => action.id === RecordActionKind.continue), 'local record must expose continue action when material exists');
assert(localActions.some((action) => action.id === RecordActionKind.reference && action.label === 'Preserve evidence'), 'local record must expose evidence preservation action without claiming PoC Reference parity');
assert(!localActions.some((action) => action.id === RecordActionKind.source), 'local record must not expose source action');
assert(!sourceHrefForRecord(localRecord), 'local record must not create external source href');
const localContinue = createRecordActionResult(localRecord, RecordActionKind.continue);
assert(localContinue.schema === RECORD_ACTION_RESULT_SCHEMA_ID, 'continue must return concrete action result');
assert(localContinue.text.includes('Boundary: browser-local session material'), 'continue result must preserve local boundary');
const localReference = createRecordActionResult(localRecord, RecordActionKind.reference);
assert.equal(localReference.intent, 'preserve-evidence-from-selected-record', 'reference-labeled implementation must disclose evidence preservation semantics');
assert(localReference.text.includes('Record ID: local-1'), 'evidence preservation result must contain stable record id');
assert(localReference.text.includes('not the PoC cross-artifact Reference relation'), 'evidence preservation must not claim old Reference semantics');


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
assert(githubActions.some((action) => action.id === RecordActionKind.source && action.href === href), 'github record must expose source action with href');
assert(githubActions.every(actionIsRenderable), 'all presented actions must be renderable, not decorative no-ops');
const githubReference = createRecordActionResult(githubRecord, RecordActionKind.reference);
assert(githubReference.text.includes('source-backed github material'), 'github evidence preservation result must preserve source-backed boundary');

console.log('✓ record action tests passed');
