import assert from 'node:assert/strict';
import { RecordActionKind } from '../../actions/record.actions.js';
import { transitionActionId } from '../../transitions/transition.presentation.js';
import { appendTransitionActionsToStaticRow } from './workspace.cardActions.js';
import { actionClassName, recordSchemaBadge, recordSchemaCanOpen, recordSchemaOpenValue } from './workspace.viewFormatting.js';

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

assert.equal(recordSchemaOpenValue({ schemaId: 'tiinex.topic.v1', kind: 'tiinex.evidence.v1' }), 'tiinex.topic.v1', 'schema open value should keep the exact schema id used by schema navigation');
assert.equal(recordSchemaBadge({ schemaId: 'tiinex.topic.v1' }), 'topic', 'schema badge remains compact while click uses exact open value');
assert.equal(recordSchemaCanOpen({ schemaId: 'tiinex.topic.v1' }), true, 'declared schemas are openable reading contracts');
assert.equal(recordSchemaCanOpen({ kind: 'markdown' }), false, 'plain markdown badges are not clickable schema navigation');

const editClass = actionClassName({ id: RecordActionKind.editLocal });
assert(editClass.includes('tx-labeled-action'), 'local draft edit remains a discoverable labeled capability');
const deleteClass = actionClassName({ id: RecordActionKind.deleteLocal });
assert(deleteClass.includes('tx-danger'), 'local draft delete uses danger styling');
assert(deleteClass.includes('tx-delete-local-action'), 'local draft delete has a stable diagnostic class');

console.log('✓ workspace card action ordering tests passed');
