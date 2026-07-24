export const workspaceCapabilities = Object.freeze({
  surfaces: ['empty-stage', 'workspace-column', 'create-dialog', 'add-dialog', 'source-strip', 'progress-strip'],
  actions: ['create-workspace', 'close-workspace', 'add-manual-files', 'add-manual-folder', 'add-github-source', 'add-explicit-urls', 'close-source', 'set-verse', 'set-query'],
  sourceAccess: ['local-session', 'manual-file-intake', 'manual-folder-intake', 'explicit-url-fetch', 'configured-github-source'],
  boundaries: [
    'clean-url-does-not-bootstrap-stale-local-storage',
    'local-session-does-not-infer-github-provenance',
    'github-source-registration-is-not-proof-preservation-or-loaded-material',
    'unsupported-zip-intake-is-disclosed-not-hidden'
  ],
  fallback: 'root-envelope-display-when-workspace-schema-module-is-unavailable'
});
