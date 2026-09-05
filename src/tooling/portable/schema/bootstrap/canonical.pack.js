import { fileURLToPath } from 'node:url';

export const PORTABLE_CANONICAL_BOOTSTRAP_DOCS_COMMIT = '3988951208eb9a8926e84ab42625d4b42fa00c2d';
export const PORTABLE_CANONICAL_BOOTSTRAP_ROOT = fileURLToPath(new URL(`./docs-${PORTABLE_CANONICAL_BOOTSTRAP_DOCS_COMMIT}/`, import.meta.url));

export const portableCanonicalBootstrapRuntime = Object.freeze({
  defaultSchemaMaterialPaths: Object.freeze([PORTABLE_CANONICAL_BOOTSTRAP_ROOT]),
  defaultSchemaSource: Object.freeze({
    repository: 'Tiinex/docs',
    commit: PORTABLE_CANONICAL_BOOTSTRAP_DOCS_COMMIT,
    sourcePathPrefix: '.topics/.schemas'
  }),
  defaultSchemaProviderSource: Object.freeze({
    id: 'tiinex-docs',
    repository: 'Tiinex/docs',
    ref: 'master',
    source: 'canonical-bootstrap-runtime-profile'
  }),
  defaultCarrierProfile: Object.freeze({
    id: 'tiinex-foundation',
    requiredMajorWorkspaceIds: Object.freeze(['business', 'docs', 'site']),
    source: 'canonical-bootstrap-runtime-profile'
  })
});
