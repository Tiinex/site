export const workspaceRepresentationCapabilities = Object.freeze({
  canCreateArtifact: false,
  canBeParent: true,
  canRenderFallback: false,
  supportedSurfaces: Object.freeze(['feed','tree','detail','lineage','preview','share']),
  boundaries: Object.freeze([
    'relation-is-not-parent',
    'workspace-identity-separate-from-payload',
    'external-payload-owns-payload-integrity',
    'complete-and-bounded-provider-activation-remain-distinct',
    'bounded-scope-is-exact-qualified-decoded-entry-set',
    'detached-recovery-is-not-representation-membership'
  ])
});
