import rootMarkdown from './canonical-schema-cache/d69b8ff55a56b8cb9282b8684db6a938a4435b94/tiinex.root.v1.schema.md?raw';
import transitionDefinitionMarkdown from './canonical-schema-cache/d69b8ff55a56b8cb9282b8684db6a938a4435b94/tiinex.transition.definition.v1.schema.md?raw';
import semanticPackageMarkdown from './canonical-schema-cache/053d46ce082d4ec261b82abc44ecca403d61e240/tiinex.semantic.package.v1.schema.md?raw';
import schemaTransitionCompanionMarkdown from './canonical-schema-cache/053d46ce082d4ec261b82abc44ecca403d61e240/tiinex.schema.transition.companion.v1.schema.md?raw';

export const CANONICAL_TRANSITION_PACKAGE_CONTRACT_SOURCES = Object.freeze({
  root: source('tiinex.root.v1', 'd69b8ff55a56b8cb9282b8684db6a938a4435b94', '.topics/.schemas/tiinex.root.v1.schema.md', '7078e4832872be0df0df4ee944ee1bcd1d886f12', '79843e23d6e4142d3c1c3281457ec18fcee8104297f4e6d98096c3b04809a28c'),
  semanticPackage: source('tiinex.semantic.package.v1', '053d46ce082d4ec261b82abc44ecca403d61e240', '.topics/.schemas/package/semantic/tiinex.semantic.package.v1.schema.md', '5686051540603e05d483dc527af27b8e69ffee36', '5a457d9a7a4f6b9281819d2c1e1bc80e7d4f3ea15069285399fce4f7a28c1502'),
  schemaTransitionCompanion: source('tiinex.schema.transition.companion.v1', '053d46ce082d4ec261b82abc44ecca403d61e240', '.topics/.schemas/schema/transition/companion/tiinex.schema.transition.companion.v1.schema.md', '1b45d674c3f8b553b9a26f2e9983d2ccf4197cca', 'f78dbf800c3080d6f0ab5832a31e793278ba723796996aae57a6a82a4a5c8f4a'),
  transitionDefinition: source('tiinex.transition.definition.v1', 'd69b8ff55a56b8cb9282b8684db6a938a4435b94', '.topics/.schemas/transition/definition/tiinex.transition.definition.v1.schema.md', '548dac027abcc4fddf918e294a80b5aca1603c46', '4be6d46edcdaf48c2ea6bca6fb3c5760959ed61e6d3849bd13bb8bbb117c0ce5')
});

export const BUNDLED_CANONICAL_TRANSITION_PACKAGE_CONTRACTS = Object.freeze({
  root: rootMarkdown,
  semanticPackage: semanticPackageMarkdown,
  schemaTransitionCompanion: schemaTransitionCompanionMarkdown,
  transitionDefinition: transitionDefinitionMarkdown
});

function source(schemaId, commit, path, gitBlob, sha256) {
  return Object.freeze({ schemaId, repository: 'Tiinex/docs', commit, path, gitBlob, sha256, sourceQualification: 'source-qualified-canonical-snapshot' });
}
