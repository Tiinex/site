import taskMarkdown from '../schemas/core/task/tiinex.task.v1.schema.md?raw';
import topicMarkdown from '../schemas/core/topic/tiinex.topic.v1.schema.md?raw';
import taskPackageMarkdown from '../schemas/core/task/task-semantic-package.trace.md?raw';
import taskCompanionMarkdown from '../schemas/core/task/tiinex.task.v1-transitions.trace.md?raw';
import topicPackageMarkdown from '../schemas/core/topic/topic-semantic-package.trace.md?raw';
import topicCompanionMarkdown from '../schemas/core/topic/tiinex.topic.v1-transitions.trace.md?raw';
import topicToTaskMarkdown from '../schemas/core/task/.transitions/topic-to-task-transition-definition.trace.md?raw';
import { CANONICAL_TRANSITION_SCHEMA_CACHE_COMMIT, CANONICAL_TRANSITION_SCHEMA_CACHE_MANIFEST } from './canonicalTransition.schemaCache.js';
import { compileCanonicalTransitionSemanticPackage } from './canonicalTransition.semanticPackage.js';
import { BUNDLED_CANONICAL_TRANSITION_PACKAGE_CONTRACTS } from './canonicalTransition.packageContracts.js';

const bySchema = Object.fromEntries(CANONICAL_TRANSITION_SCHEMA_CACHE_MANIFEST.map((item) => [item.schemaId, item]));
export const BUNDLED_CANONICAL_TRANSITION_SCHEMA_CACHE = Object.freeze([
  cacheEntry('tiinex.root.v1', BUNDLED_CANONICAL_TRANSITION_PACKAGE_CONTRACTS.root),
  cacheEntry('tiinex.transition.definition.v1', BUNDLED_CANONICAL_TRANSITION_PACKAGE_CONTRACTS.transitionDefinition),
  cacheEntry('tiinex.task.v1', taskMarkdown)
]);
export const BUNDLED_CANONICAL_TRANSITION_SEMANTIC_PACKAGE = compileCanonicalTransitionSemanticPackage({
  contracts: BUNDLED_CANONICAL_TRANSITION_PACKAGE_CONTRACTS,
  materials: {
    taskPackage: taskPackageMarkdown,
    taskSchema: taskMarkdown,
    taskCompanion: taskCompanionMarkdown,
    transition: topicToTaskMarkdown,
    topicPackage: topicPackageMarkdown,
    topicSchema: topicMarkdown,
    topicCompanion: topicCompanionMarkdown
  }
});
export const BUNDLED_CANONICAL_TRANSITION_DEFINITIONS = BUNDLED_CANONICAL_TRANSITION_SEMANTIC_PACKAGE.compilation.status === 'valid'
  ? BUNDLED_CANONICAL_TRANSITION_SEMANTIC_PACKAGE.definitions
  : Object.freeze([]);

function cacheEntry(schemaId, markdown) {
  const expected = bySchema[schemaId];
  return Object.freeze({ ...expected, markdown, sourceQualification: 'source-qualified-cache', cacheCommit: CANONICAL_TRANSITION_SCHEMA_CACHE_COMMIT });
}
