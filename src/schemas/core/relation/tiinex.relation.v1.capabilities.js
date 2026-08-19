export const relationCapabilities = Object.freeze({
  canCreateArtifact: false,
  canBeParent: true,
  canRenderFallback: false,
  supportedSurfaces: Object.freeze(['feed','tree','detail','lineage','preview','share']),
  boundaries: Object.freeze(['relation-is-not-parent','relation-does-not-prove-truth','reference-relation-created-only-by-qualified-transition'])
});
