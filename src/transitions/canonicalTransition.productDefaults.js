import rootMarkdown from './canonical-schema-cache/d69b8ff55a56b8cb9282b8684db6a938a4435b94/tiinex.root.v1.schema.md?raw';
import transitionDefinitionMarkdown from './canonical-schema-cache/d69b8ff55a56b8cb9282b8684db6a938a4435b94/tiinex.transition.definition.v1.schema.md?raw';
import taskMarkdown from './canonical-schema-cache/d69b8ff55a56b8cb9282b8684db6a938a4435b94/tiinex.task.v1.schema.md?raw';
import topicToTaskMarkdown from './definitions/topic-to-task-transition-definition.trace.md?raw';
import { CANONICAL_TRANSITION_SCHEMA_CACHE_COMMIT, CANONICAL_TRANSITION_SCHEMA_CACHE_MANIFEST } from './canonicalTransition.schemaCache.js';

const bySchema = Object.fromEntries(CANONICAL_TRANSITION_SCHEMA_CACHE_MANIFEST.map((item) => [item.schemaId, item]));
export const BUNDLED_CANONICAL_TRANSITION_SCHEMA_CACHE = Object.freeze([
  cacheEntry('tiinex.root.v1', rootMarkdown),
  cacheEntry('tiinex.transition.definition.v1', transitionDefinitionMarkdown),
  cacheEntry('tiinex.task.v1', taskMarkdown)
]);
export const BUNDLED_CANONICAL_TRANSITION_DEFINITIONS = Object.freeze([
  Object.freeze({
    id: 'bundled-transition:topic-to-task:v1',
    title: 'Topic to Task',
    path: 'src/transitions/definitions/topic-to-task-transition-definition.trace.md',
    markdown: topicToTaskMarkdown,
    schemaId: 'tiinex.transition.definition.v1',
    sourceMode: 'bundled-canonical-transition-definition',
    source: Object.freeze({ id: 'tiinex-site-bundle', adapterId: 'static', sourceKind: 'bundled-canonical' })
  })
]);
function cacheEntry(schemaId, markdown) {
  const expected = bySchema[schemaId];
  return Object.freeze({ ...expected, markdown, sourceQualification: 'source-qualified-cache', cacheCommit: CANONICAL_TRANSITION_SCHEMA_CACHE_COMMIT });
}
