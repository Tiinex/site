import { compilePortableSchemaContractChain } from '../tooling/portable/schema/contract.compile.js';
import { compilePortableSemanticPackage } from '../tooling/portable/package/semantic.package.js';

export const CANONICAL_TRANSITION_TASK_PACKAGE_KEY = 'site-package:task';
export const CANONICAL_TRANSITION_TOPIC_PACKAGE_KEY = 'site-package:topic';
export const CANONICAL_TOPIC_TO_TASK_REPRESENTATION_KEY = 'site-transition:topic-to-task:v1';
export const CANONICAL_TOPIC_TO_TASK_BUNDLED_SOURCE_ID = 'tiinex-site-semantic-package:site-transition:topic-to-task:v1';
const SITE_SEMANTIC_PACKAGE_SOURCE_ID = 'tiinex-site-semantic-package';
export const CANONICAL_TOPIC_TO_TASK_BUNDLED_SOURCE_MODE = 'bundled-canonical-transition-definition';

const SITE_LOCAL = 'site-local:';
const paths = Object.freeze({
  taskPackage: 'src/schemas/core/task/task-semantic-package.trace.md',
  taskSchema: 'src/schemas/core/task/tiinex.task.v1.schema.md',
  taskCompanion: 'src/schemas/core/task/tiinex.task.v1-transitions.trace.md',
  transition: 'src/schemas/core/task/.transitions/topic-to-task-transition-definition.trace.md',
  topicPackage: 'src/schemas/core/topic/topic-semantic-package.trace.md',
  topicSchema: 'src/schemas/core/topic/tiinex.topic.v1.schema.md',
  topicCompanion: 'src/schemas/core/topic/tiinex.topic.v1-transitions.trace.md'
});

export const CANONICAL_TRANSITION_SEMANTIC_PACKAGE_PATHS = paths;

export function compileCanonicalTransitionSemanticPackage(input = {}) {
  const contracts = compileContracts(input.contracts || {});
  const materials = canonicalPackageMaterials(input.materials || {});
  const compilation = compilePortableSemanticPackage({
    selectedManifest: CANONICAL_TRANSITION_TASK_PACKAGE_KEY,
    materials,
    contracts,
    resolvers: input.resolvers || buildPackageSchemaResolvers(input.contracts?.root, input.materials || {})
  });
  const byKey = new Map(materials.map((material) => [material.id, material]));
  const definitions = (compilation.transitionRegistry || [])
    .filter((entry) => entry.representationQualification === 'valid')
    .map((entry) => definitionFromCompiledEntry(entry, byKey.get(entry.representationKey)))
    .filter(Boolean);
  return Object.freeze({
    compilation,
    definitions: Object.freeze(definitions),
    materials: Object.freeze(materials.map((material) => Object.freeze({
      representationKey: material.id,
      path: material.path,
      reference: material.reference || '',
      source: material.source
    })))
  });
}

function buildPackageSchemaResolvers(rootMarkdown = '', materials = {}) {
  const schemaAuthorities = {};
  for (const markdown of [materials.topicSchema, materials.taskSchema]) {
    const compiled = compilePortableSchemaContractChain([String(rootMarkdown || ''), String(markdown || '')]);
    if (compiled.lineageQualification?.state !== 'valid' || compiled.lineageQualification?.complete !== true || !compiled.schemaId) continue;
    const generation = (compiled.creation?.groups || []).length > 0;
    const fileNaming = (compiled.validation?.groups || []).some((group) => group.name === 'File Naming');
    schemaAuthorities[compiled.schemaId] = Object.freeze({ targetKind: 'artifact', generation, fileNaming, sourceQualification: 'compiled-package-schema-authority' });
  }
  return Object.freeze({ schemaAuthorities: Object.freeze(schemaAuthorities) });
}

function compileContracts(input = {}) {
  const root = String(input.root || '');
  return Object.freeze({
    semanticPackage: compilePortableSchemaContractChain([root, String(input.semanticPackage || '')]),
    schemaTransitionCompanion: compilePortableSchemaContractChain([root, String(input.schemaTransitionCompanion || '')]),
    transitionDefinition: compilePortableSchemaContractChain([root, String(input.transitionDefinition || '')])
  });
}

function canonicalPackageMaterials(input = {}) {
  return [
    material(CANONICAL_TRANSITION_TASK_PACKAGE_KEY, paths.taskPackage, input.taskPackage, paths.taskPackage),
    material('site-schema:task', paths.taskSchema, input.taskSchema, paths.taskSchema, sourceIdentity('tiinex.task.v1')),
    material('site-companion:task', paths.taskCompanion, input.taskCompanion),
    material(CANONICAL_TOPIC_TO_TASK_REPRESENTATION_KEY, paths.transition, input.transition, paths.transition, transitionSource()),
    material(CANONICAL_TRANSITION_TOPIC_PACKAGE_KEY, paths.topicPackage, input.topicPackage, paths.topicPackage),
    material('site-schema:topic', paths.topicSchema, input.topicSchema, paths.topicSchema),
    material('site-companion:topic', paths.topicCompanion, input.topicCompanion)
  ];
}

function material(id, path, markdown, aliasPath = '', source = null) {
  const actualSource = source || Object.freeze({
    id: SITE_SEMANTIC_PACKAGE_SOURCE_ID,
    adapterId: 'static',
    sourceKind: 'bundled-canonical',
    sourceMode: 'semantic-package-locality'
  });
  return Object.freeze({
    id,
    path,
    markdown: String(markdown || ''),
    reference: aliasPath ? `${SITE_LOCAL}${aliasPath}` : '',
    source: actualSource
  });
}

function sourceIdentity(schemaId) {
  return Object.freeze({
    id: SITE_SEMANTIC_PACKAGE_SOURCE_ID,
    adapterId: 'static',
    sourceKind: 'bundled-canonical',
    sourceMode: 'semantic-package-locality',
    schemaId,
    repository: 'Tiinex/docs',
    commit: 'd69b8ff55a56b8cb9282b8684db6a938a4435b94',
    sourceArtifactPath: '.topics/.schemas/core/task/tiinex.task.v1.schema.md',
    gitBlob: 'e4d545ad45382a150351ead587339d8b43cc0fb2'
  });
}

function transitionSource() {
  return Object.freeze({
    id: CANONICAL_TOPIC_TO_TASK_BUNDLED_SOURCE_ID,
    adapterId: 'static',
    sourceKind: 'bundled-canonical',
    sourceMode: CANONICAL_TOPIC_TO_TASK_BUNDLED_SOURCE_MODE,
    semanticPackageRepresentationKey: CANONICAL_TOPIC_TO_TASK_REPRESENTATION_KEY,
    semanticPackageManifestKey: CANONICAL_TRANSITION_TASK_PACKAGE_KEY
  });
}

function definitionFromCompiledEntry(entry = {}, material = null) {
  if (!material) return null;
  const source = Object.freeze({
    ...(material.source || {}),
    sourceArtifactPath: entry.path,
    semanticPackageRepresentationKey: entry.representationKey,
    semanticPackageManifestKey: CANONICAL_TRANSITION_TASK_PACKAGE_KEY,
    packageDiscoveryProvenance: Object.freeze([...(entry.discoveryProvenance || [])]),
    packageAttachmentProvenance: Object.freeze([...(entry.attachmentProvenance || [])])
  });
  return Object.freeze({
    id: `bundled-transition:${entry.representationKey}`,
    title: String(entry.transitionIdentity?.Name || material.title || 'Transition'),
    path: entry.path,
    markdown: material.markdown,
    schemaId: 'tiinex.transition.definition.v1',
    sourceMode: CANONICAL_TOPIC_TO_TASK_BUNDLED_SOURCE_MODE,
    sourceQualification: 'compiled-semantic-package-qualified',
    semanticPackageRepresentationKey: entry.representationKey,
    semanticPackageManifestKey: CANONICAL_TRANSITION_TASK_PACKAGE_KEY,
    source
  });
}
