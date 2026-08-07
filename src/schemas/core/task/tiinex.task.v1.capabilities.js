export const taskCapabilities = Object.freeze({
  canCreateArtifact: true,
  canBeParent: true,
  canRenderFallback: false,
  supportedSurfaces: ['feed', 'tree', 'detail', 'lineage', 'preview', 'share'],
  boundaries: [
    'browser-local-draft-task',
    'source-backed-parent-read-only',
    'task-draft-does-not-inherit-source-provenance'
  ]
});
