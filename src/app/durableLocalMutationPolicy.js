import { isolatedDurableLocalAuthority } from './persistenceOwnership.js';

export const DurableLocalMutationOperation = Object.freeze({
  localMaterialIntake: 'local-material-intake',
  localWorkspaceEntrypointIntake: 'local-workspace-entrypoint-intake',
  localDraftCreate: 'local-draft-create',
  localDraftDelete: 'local-draft-delete'
});

const GUARDED_OPERATIONS = new Set(Object.values(DurableLocalMutationOperation));

export function durableLocalMutationDecision(ownership = null, operation = '') {
  const normalizedOperation = String(operation || '');
  if (!isolatedDurableLocalAuthority(ownership) || !GUARDED_OPERATIONS.has(normalizedOperation)) return Object.freeze({ ok: true, operation: normalizedOperation });
  return Object.freeze({
    ok: false,
    error: 'local-durable-change.unavailable-in-isolated-shared-view',
    operation: normalizedOperation,
    notice: 'Local files and drafts cannot be added or changed while this shared view is isolated from your saved local recovery. Return to your local start before making browser-local changes.'
  });
}
