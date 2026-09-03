export const WORKSPACE_RECORD_PRIMARY_INTENT = Object.freeze({
  open: 'open-record',
  select: 'select-candidate',
  unavailable: 'selection-unavailable',
  toggleLineagePreview: 'toggle-lineage-preview'
});

export function workspaceRecordPrimaryIntent({ surface = 'feed', selectionActive = false, selectionCandidate = null } = {}) {
  if (selectionActive) return selectionCandidate ? WORKSPACE_RECORD_PRIMARY_INTENT.select : WORKSPACE_RECORD_PRIMARY_INTENT.unavailable;
  if (String(surface || '') === 'lineage') return WORKSPACE_RECORD_PRIMARY_INTENT.toggleLineagePreview;
  return WORKSPACE_RECORD_PRIMARY_INTENT.open;
}

export function workspaceRecordPrimaryLabel({ intent = WORKSPACE_RECORD_PRIMARY_INTENT.open, title = 'artifact' } = {}) {
  const label = String(title || 'artifact');
  if (intent === WORKSPACE_RECORD_PRIMARY_INTENT.select) return `Select ${label}`;
  if (intent === WORKSPACE_RECORD_PRIMARY_INTENT.unavailable) return `Unavailable for selection ${label}`;
  if (intent === WORKSPACE_RECORD_PRIMARY_INTENT.toggleLineagePreview) return `Toggle read preview for ${label}`;
  return `Open ${label}`;
}
