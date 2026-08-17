import { materialIsSchemaDocument } from './material.graph.js';

export const PORTABLE_SEMANTIC_PACKAGE_COMPILATION_SCHEMA_ID = 'tiinex.portable.semantic-package-compilation.v1';
export const SEMANTIC_PACKAGE_SCHEMA_ID = 'tiinex.semantic.package.v1';
export const SCHEMA_TRANSITION_COMPANION_SCHEMA_ID = 'tiinex.schema.transition.companion.v1';
export const TRANSITION_DEFINITION_SCHEMA_ID = 'tiinex.transition.definition.v1';

export function isPackageManifestArtifact(material) {
  return material?.schemaId === SEMANTIC_PACKAGE_SCHEMA_ID && !materialIsSchemaDocument(material);
}

export function isCompanionArtifact(material) {
  return material?.schemaId === SCHEMA_TRANSITION_COMPANION_SCHEMA_ID && !materialIsSchemaDocument(material);
}

export function isTransitionArtifact(material) {
  return material?.schemaId === TRANSITION_DEFINITION_SCHEMA_ID && !materialIsSchemaDocument(material);
}
