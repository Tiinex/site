import assert from 'node:assert/strict';
import { RecordActionKind } from '../../actions/record.actions.js';
import { transitionActionId } from '../../transitions/transition.presentation.js';
import { appendTransitionActionsToStaticRow } from './workspace.cardActions.js';
import { actionClassName } from './workspace.viewFormatting.js';

const staticActions = [
  { id: RecordActionKind.open },
  { id: RecordActionKind.markdown },
  { id: RecordActionKind.source },
  { id: RecordActionKind.share }
];
const transition = { id: transitionActionId('topic.continue.task'), label: 'Continue · Create task' };
const ordered = appendTransitionActionsToStaticRow(staticActions, [transition]);
assert.deepEqual(ordered.map((action) => action.id), [
  RecordActionKind.open,
  RecordActionKind.markdown,
  RecordActionKind.source,
  RecordActionKind.share,
  transitionActionId('topic.continue.task')
], 'schema-owned transition actions must append after stable/static record actions');

const className = actionClassName(transition);
assert(className.includes('tx-action-right'), 'transition actions belong in the right-side action group');
assert(className.includes('tx-transition-action'), 'transition actions carry a distinct class for UI affordance and diagnostics');
assert(!className.includes('tx-labeled-action'), 'B1 transition quick action remains icon-only on desktop');
const deleteClass = actionClassName({ id: RecordActionKind.deleteLocal });
assert(deleteClass.includes('tx-danger'), 'local draft delete uses danger styling');
assert(deleteClass.includes('tx-delete-local-action'), 'local draft delete has a stable diagnostic class');

console.log('✓ workspace card action ordering tests passed');
