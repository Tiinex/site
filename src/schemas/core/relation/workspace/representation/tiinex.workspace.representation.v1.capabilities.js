export const workspaceRepresentationCapabilities = Object.freeze({
  canCreateArtifact: false,
  canBeParent: true,
  canRenderFallback: false,
  supportedSurfaces: Object.freeze(['feed','tree','detail','lineage','preview','share']),
  boundaries: Object.freeze(['relation-is-not-parent','workspace-identity-separate-from-payload','external-payload-owns-payload-integrity','verified-complete-only-provider-activation'])
});
