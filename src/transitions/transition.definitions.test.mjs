import assert from 'node:assert/strict';
import { schemaRegistry } from '../schemas/registry.js';
import { transitionDefinitionsForRecord, transitionDefinitionsForSchemaModule, validateTransitionDefinitions } from './transition.definitions.js';

const topicModule = schemaRegistry.byId.get('tiinex.topic.v1');
const topicDefinitions = transitionDefinitionsForSchemaModule(topicModule);
assert.equal(topicDefinitions.length, 1, 'Topic should expose one active B1 transition');
const task = topicDefinitions[0];
assert.equal(task.id, 'topic.continue.task');
assert.equal(task.fromSchema, 'tiinex.topic.v1');
assert.equal(task.intent, 'continue', 'Topic → Task must disclose Continue semantics');
assert.equal(task.resultSchema, 'tiinex.task.v1');
assert.equal(task.resultBoundary.mode, 'browser-local-draft');
assert.equal(task.resultBoundary.sourceMutation, 'none');
assert.equal(task.resultBoundary.remoteWrite, false);
assert.equal(task.resultBoundary.mayInheritParentSource, false);
assert.equal(task.presentation.variant, 'icon-only');
assert.equal(task.presentation.icon, 'task');
assert.equal(task.presentation.tooltip, 'Continue · Create task');
assert.equal(task.presentation.ariaLabel, 'Continue: Create task');
assert.equal(task.presentation.mobileLabel, 'Create task');
assert.equal(validateTransitionDefinitions(topicDefinitions).ok, true, 'Topic transition definitions must validate');

const sourceBackedTopic = { id: 'topic-1', title: 'News', schemaId: 'tiinex.topic.v1', sourceMode: 'source-backed', source: { adapterId: 'github' } };
const available = transitionDefinitionsForRecord(sourceBackedTopic);
assert.deepEqual(available.map((definition) => definition.id), ['topic.continue.task'], 'source-backed Topic can offer local/draft Task continuation without source mutation');

const unknown = { id: 'unknown-1', title: 'Unknown', schemaId: 'tiinex.future.v9', sourceMode: 'source-backed' };
assert.deepEqual(transitionDefinitionsForRecord(unknown), [], 'unknown schema fallback must not surface active transition definitions');

console.log('✓ transition definition tests passed');
