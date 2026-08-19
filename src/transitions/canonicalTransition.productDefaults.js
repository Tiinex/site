import taskMarkdown from '../schemas/core/task/tiinex.task.v1.schema.md?raw';
import topicMarkdown from '../schemas/core/topic/tiinex.topic.v1.schema.md?raw';
import topicCanonicalMarkdown from './canonical-schema-cache/52ecdea0a75893882ce282214d155f70e1309c2a/tiinex.topic.v1.schema.md?raw';
import taskPackageMarkdown from '../schemas/core/task/task-semantic-package.trace.md?raw';
import taskCompanionMarkdown from '../schemas/core/task/tiinex.task.v1-transitions.trace.md?raw';
import topicPackageMarkdown from '../schemas/core/topic/topic-semantic-package.trace.md?raw';
import topicCompanionMarkdown from '../schemas/core/topic/tiinex.topic.v1-transitions.trace.md?raw';
import topicToTaskMarkdown from '../schemas/core/task/.transitions/topic-to-task-transition-definition.trace.md?raw';
import interpretationMarkdown from '../schemas/core/interpretation/tiinex.interpretation.v1.schema.md?raw';
import evidenceToInterpretationMarkdown from '../schemas/core/interpretation/.transitions/evidence-to-interpretation-transition-definition.trace.md?raw';
import createTopicMarkdown from '../schemas/core/topic/.transitions/create-topic-transition-definition.trace.md?raw';
import createTaskMarkdown from '../schemas/core/task/.transitions/create-task-transition-definition.trace.md?raw';
import relationMarkdown from './canonical-schema-cache/053d46ce082d4ec261b82abc44ecca403d61e240/tiinex.relation.v1.schema.md?raw';
import schemaContractMarkdown from './canonical-schema-cache/053d46ce082d4ec261b82abc44ecca403d61e240/tiinex.schema.contract.v1.schema.md?raw';
import schemaGenerationMarkdown from './canonical-schema-cache/053d46ce082d4ec261b82abc44ecca403d61e240/tiinex.schema.generation.v1.schema.md?raw';
import topicReferencesTaskMarkdown from '../schemas/core/relation/.transitions/topic-references-task-transition-definition.trace.md?raw';
import referenceRelationGenerationMarkdown from '../schemas/core/relation/.generation/reference-relation-generation-authority.trace.md?raw';
import { CANONICAL_TRANSITION_SCHEMA_CACHE_COMMIT, CANONICAL_TRANSITION_SCHEMA_CACHE_MANIFEST } from './canonicalTransition.schemaCache.js';
import { compileCanonicalTransitionSemanticPackage } from './canonicalTransition.semanticPackage.js';
import { BUNDLED_CANONICAL_TRANSITION_PACKAGE_CONTRACTS } from './canonicalTransition.packageContracts.js';

const bySchema = Object.fromEntries(CANONICAL_TRANSITION_SCHEMA_CACHE_MANIFEST.map((item) => [item.schemaId, item]));
export const BUNDLED_CANONICAL_TRANSITION_SCHEMA_CACHE = Object.freeze([
  cacheEntry('tiinex.root.v1', BUNDLED_CANONICAL_TRANSITION_PACKAGE_CONTRACTS.root),
  cacheEntry('tiinex.transition.definition.v1', BUNDLED_CANONICAL_TRANSITION_PACKAGE_CONTRACTS.transitionDefinition),
  cacheEntry('tiinex.task.v1', taskMarkdown),
  cacheEntry('tiinex.topic.v1', topicCanonicalMarkdown),
  cacheEntry('tiinex.interpretation.v1', interpretationMarkdown),
  cacheEntry('tiinex.relation.v1', relationMarkdown),
  cacheEntry('tiinex.schema.contract.v1', schemaContractMarkdown),
  cacheEntry('tiinex.schema.generation.v1', schemaGenerationMarkdown)
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
const semanticPackageDefinitions = BUNDLED_CANONICAL_TRANSITION_SEMANTIC_PACKAGE.compilation.status === 'valid'
  ? BUNDLED_CANONICAL_TRANSITION_SEMANTIC_PACKAGE.definitions
  : Object.freeze([]);
function siteLocalDefinition(id, title, path, markdown, extra = {}) {
  return Object.freeze({
    id: `bundled-transition:${id}`,
    title,
    path,
    markdown,
    schemaId: 'tiinex.transition.definition.v1',
    sourceMode: 'bundled-canonical-transition-definition',
    sourceQualification: 'site-local-definition-source-qualified',
    source: Object.freeze({ id: `tiinex-site-local-transition:${id}`, adapterId: 'static', sourceKind: 'bundled-canonical', sourceMode: 'bundled-canonical-transition-definition', sourceArtifactPath: path }),
    ...extra
  });
}
const siteLocalUseAsDefinition = siteLocalDefinition(
  'evidence-to-interpretation:v1',
  'Evidence to Interpretation',
  'src/schemas/core/interpretation/.transitions/evidence-to-interpretation-transition-definition.trace.md',
  evidenceToInterpretationMarkdown
);
const siteLocalCreateTopicDefinition = siteLocalDefinition(
  'create-topic:v1',
  'Create standalone Topic',
  'src/schemas/core/topic/.transitions/create-topic-transition-definition.trace.md',
  createTopicMarkdown
);
const REFERENCE_GENERATION_REFERENCE = 'site-local:src/schemas/core/relation/.generation/reference-relation-generation-authority.trace.md';
const siteLocalReferenceDefinition = siteLocalDefinition(
  'topic-references-task:v1',
  'Topic references Task',
  'src/schemas/core/relation/.transitions/topic-references-task-transition-definition.trace.md',
  topicReferencesTaskMarkdown,
  Object.freeze({ generationMaterials: Object.freeze([Object.freeze({
    id: 'tiinex-site-local-generation:topic-task-reference:v1',
    path: 'src/schemas/core/relation/.generation/reference-relation-generation-authority.trace.md',
    url: REFERENCE_GENERATION_REFERENCE,
    reference: REFERENCE_GENERATION_REFERENCE,
    markdown: referenceRelationGenerationMarkdown,
    source: Object.freeze({ id: 'tiinex-site-local-generation:topic-task-reference:v1', adapterId: 'static', sourceKind: 'bundled-canonical', sourceMode: 'site-local-generation-authority', sourceArtifactPath: 'src/schemas/core/relation/.generation/reference-relation-generation-authority.trace.md' })
  })]) })
);
const siteLocalCreateTaskDefinition = siteLocalDefinition(
  'create-task:v1',
  'Create standalone Task',
  'src/schemas/core/task/.transitions/create-task-transition-definition.trace.md',
  createTaskMarkdown
);
export const BUNDLED_CANONICAL_TRANSITION_DEFINITIONS = Object.freeze([
  ...semanticPackageDefinitions,
  siteLocalUseAsDefinition,
  siteLocalReferenceDefinition,
  siteLocalCreateTopicDefinition,
  siteLocalCreateTaskDefinition
]);

function cacheEntry(schemaId, markdown) {
  const expected = bySchema[schemaId];
  return Object.freeze({ ...expected, markdown, sourceQualification: 'source-qualified-cache', cacheCommit: expected?.commit || CANONICAL_TRANSITION_SCHEMA_CACHE_COMMIT });
}
