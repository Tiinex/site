export const interpretationCapabilities = Object.freeze({
  canCreateArtifact: true,
  canBeParent: true,
  canRenderFallback: false,
  supportedSurfaces: Object.freeze(['feed', 'tree', 'detail', 'lineage', 'preview', 'share']),
  boundaries: Object.freeze([
    'interpretation-does-not-mutate-source',
    'interpretation-does-not-prove-target-role',
    'browser-local-draft-interpretation'
  ])
});
