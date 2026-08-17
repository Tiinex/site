import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { schemaRegistry } from '../schemas/registry.js';
import {
  transitionDefinitionsForSchemaModule,
  validateTransitionDefinitions,
  TRANSITION_DEFINITION_CONTRACT_ID
} from '../transitions/transition.definitions.js';
import {
  CANONICAL_TRANSITION_DEFINITION_SCHEMA_ID,
  LEGACY_TRANSITION_SHORTHAND_CONTRACT_ID,
  LEGACY_TRANSITION_SHORTHAND_MODEL
} from '../transitions/transition.legacyShorthand.js';
import { transitionActionsForRecord } from '../transitions/transition.presentation.js';

assert.equal(TRANSITION_DEFINITION_CONTRACT_ID, LEGACY_TRANSITION_SHORTHAND_CONTRACT_ID, 'legacy consumer alias must point at explicit site-local shorthand contract');
assert.notEqual(LEGACY_TRANSITION_SHORTHAND_CONTRACT_ID, CANONICAL_TRANSITION_DEFINITION_SCHEMA_ID, 'site-local shorthand must never masquerade as canonical S1 Transition Definition');

const topicModule = schemaRegistry.byId.get('tiinex.topic.v1');
const definitions = transitionDefinitionsForSchemaModule(topicModule);
assert.equal(definitions.length, 1, 'legacy Topic compatibility transition remains available');
assert.equal(definitions[0].schema, LEGACY_TRANSITION_SHORTHAND_CONTRACT_ID, 'normalized compatibility object carries site-local shorthand contract id');
assert.equal(definitions[0].compatibilityModel, LEGACY_TRANSITION_SHORTHAND_MODEL, 'normalized compatibility object exposes explicit legacy model');
assert.equal(definitions[0].id, 'topic.continue.task');
assert.equal(definitions[0].intent, 'continue');
assert.equal(definitions[0].resultSchema, 'tiinex.task.v1');
assert.equal(validateTransitionDefinitions(definitions).ok, true, 'legacy shorthand remains internally valid');

const actions = transitionActionsForRecord({ id: 'topic', schemaId: 'tiinex.topic.v1', sourceMode: 'source-backed', source: { adapterId: 'github' } });
assert.equal(actions.length, 1, 'legacy Topic action behavior remains unchanged');
assert.equal(actions[0].label, 'Continue · Create task');
assert.equal(actions[0].group, 'Continue');
assert.equal(actions[0].icon, 'task');

const definitionsSource = readFileSync(new URL('../transitions/transition.definitions.js', import.meta.url), 'utf8');
const presentationSource = readFileSync(new URL('../transitions/transition.presentation.js', import.meta.url), 'utf8');
const legacySource = readFileSync(new URL('../transitions/transition.legacyShorthand.js', import.meta.url), 'utf8');
assert(!definitionsSource.includes("'tiinex.transition.definition.v1'"), 'record-anchored legacy discovery must not claim the canonical S1 schema id');
assert(!presentationSource.includes("if (value === 'continue')") && !presentationSource.includes("if (value === 'reference')"), 'generic action projection must not own Continue/Reference fallback ontology');
assert(legacySource.includes(CANONICAL_TRANSITION_DEFINITION_SCHEMA_ID), 'legacy compatibility owner documents the canonical id it must not impersonate');
assert(!legacySource.includes('src/tooling/portable') && !definitionsSource.includes('tooling/portable'), 'quarantine must not duplicate or depend on Tooling-owned parser/bootstrap paths');

console.log('✓ post-S1 legacy transition shorthand quarantine tests passed');
