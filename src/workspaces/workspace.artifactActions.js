export const WORKSPACE_ARTIFACT_ACTION_CONTRACT_ID = 'tiinex.workspace.artifact.actions.v1';

export function workspaceArtifactActionModel(subject = {}) {
  const title = workspaceArtifactTitle(subject);
  return Object.freeze({
    schema: WORKSPACE_ARTIFACT_ACTION_CONTRACT_ID,
    subjectTitle: title,
    roleLabel: 'workspace artifact',
    roleDescription: 'Workspace entrypoint.',
    open: Object.freeze({
      id: 'workspace.open',
      label: 'Open',
      title: `Open ${title} as the active workspace context.`,
      description: 'Open switches focus to this workspace artifact and applies its own entrypoints without cloning sibling material.'
    }),
    merge: Object.freeze({
      id: 'workspace.merge',
      label: 'Merge',
      title: `Merge ${title} into the current workspace context.`,
      description: 'Merge intentionally brings this workspace context into the current workspace without changing the selected workspace artifact into a duplicate user object.'
    })
  });
}

export function workspaceArtifactBoundaryBadge(subject = {}) {
  const source = subject?.source || {};
  const mode = String(subject?.sourceMode || subject?.status || '').toLowerCase();
  const reconciliation = String(subject?.materialReconciliation?.status || '').toLowerCase();
  if (reconciliation.includes('snapshot') || reconciliation.includes('local') && reconciliation.includes('source')) return 'source + local snapshot';
  if (mode.includes('source-backed') || source.adapterId === 'github' || source.kind === 'github-tree' || source.sourceKind === 'github-tree') return 'source-backed';
  if (subject?.importedFromWorkspaceId || subject?.contextReferenceId) return 'local/session';
  return 'local/session';
}

export function workspaceArtifactRoleBadge() {
  return 'workspace artifact';
}


export function workspaceArtifactTitle(subject = {}) {
  return String(subject?.title || subject?.name || subject?.path || 'workspace artifact').trim() || 'workspace artifact';
}

export function forbiddenPrimaryWorkspaceActionCopy(text = '') {
  const value = String(text || '');
  return [
    'Open as workspace',
    'Merge context',
    'Open as a separate workspace',
    'creates a separate workspace',
    'as a separate workspace',
    'Current workspace remains available',
    'open/merge candidate',
    'Open details'
  ].filter((needle) => value.includes(needle));
}
