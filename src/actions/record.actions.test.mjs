import assert from 'assert';
import {
  actionAvailabilityForRecord,
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
assert(localActions.some((action) => action.id === RecordActionKind.markdown && action.label === 'Show markdown'), 'local record must expose old-like Show markdown dialog action');
assert(!localActions.some((action) => action.id === RecordActionKind.lineage), 'card itself owns Lineage focus; no separate Lineage button should crowd cards');
assert(!localActions.some((action) => action.id === RecordActionKind.continue), 'local records without a concrete schema transition must not expose Continue');
assert(!localActions.some((action) => action.id === RecordActionKind.reference), 'local records without a declared schema reference transition must not expose evidence preservation');
assert(!localActions.some((action) => action.id === RecordActionKind.source), 'local record must not expose source action');
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
assert(githubActions.some((action) => action.id === RecordActionKind.source && action.href === href), 'github record must expose source action with href');
assert(githubActions.every(actionIsRenderable), 'all presented actions must be renderable, not decorative no-ops');
const githubAvailability = actionAvailabilityForRecord(githubRecord);
assert.equal(githubAvailability.continue.enabled, false, 'source-backed records still need a concrete schema transition before Continue is rendered');
assert.equal(githubAvailability.reference.enabled, false, 'source-backed records still need a concrete schema transition before preserve/reference is rendered');
const githubReference = createRecordActionResult(githubRecord, RecordActionKind.reference);
assert(githubReference.text.includes('source-backed github material'), 'github evidence preservation result must preserve source-backed boundary when invoked by explicit transition code');

console.log('✓ record action tests passed');
