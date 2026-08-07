import assert from 'node:assert/strict';
import { isTransitionAction, transitionActionsForRecord, transitionActionId, TRANSITION_ACTION_PRESENTATION_CONTRACT_ID } from './transition.presentation.js';

const topic = {
  id: 'topic-1',
  title: 'News',
  schemaId: 'tiinex.topic.v1',
  kind: 'tiinex.topic.v1',
  markdown: '# News\n\nTopic material.',
  sourceMode: 'source-backed',
  source: { adapterId: 'github' }
};
const actions = transitionActionsForRecord(topic);
assert.equal(actions.length, 1, 'Topic should expose only the B1 primary transition action');
assert.equal(actions[0].id, transitionActionId('topic.continue.task'));
assert.equal(actions[0].contract, TRANSITION_ACTION_PRESENTATION_CONTRACT_ID);
assert.equal(actions[0].intent, 'continue', 'quick action must preserve Continue intent');
assert.equal(actions[0].group, 'Continue', 'quick action must preserve Continue group');
assert.equal(actions[0].icon, 'task', 'Topic → Task quick action should use task icon token');
assert.equal(actions[0].label, 'Continue · Create task', 'icon-only quick action label/tooltip must disclose intent and result');
assert.equal(actions[0].presentation.variant, 'icon-only');
assert.equal(actions[0].presentation.ariaLabel, 'Continue: Create task');
assert.equal(actions[0].presentation.mobileLabel, 'Create task');
assert.equal(isTransitionAction(actions[0]), true);

const unknown = { id: 'future-1', title: 'Future', schemaId: 'tiinex.future.v1', sourceMode: 'source-backed' };
assert.deepEqual(transitionActionsForRecord(unknown), [], 'unknown schemas must not get decorative transition quick actions');

console.log('✓ transition presentation tests passed');
