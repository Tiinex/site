export function workspaceRecordOpenedNotice(result = {}) {
  const title = result.entry?.title || result.entry?.path || 'workspace artifact';
  const sourceInputs = Array.isArray(result.sourceInputs) ? result.sourceInputs : [];
  const labels = sourceInputs.map((input) => input.label || input.repository).filter(Boolean);
  if (result.openedWorkspaceSet) return `Opened workspace artifact ${title} as the active workspace set${labels.length ? `; source loading queued for ${labels.join(', ')}` : ''}. Previous non-draft workspaces were replaced; unpublished local work was preserved.`;
  return labels.length
    ? `Opened workspace artifact ${title}; source loading queued for ${labels.join(', ')}.`
    : `Opened workspace artifact ${title}.`;
}

export function workspaceRecordMergedNotice(result = {}) {
  const title = result.entry?.title || result.entry?.path || 'workspace artifact';
  const sourceInputs = Array.isArray(result.sourceInputs) ? result.sourceInputs : [];
  if (result.merge) {
    const created = Number(result.merge.createdCount || 0);
    const touched = Array.isArray(result.merge.touchedWorkspaceIds) ? result.merge.touchedWorkspaceIds.length : 0;
    const skipped = Number(result.merge.skippedLoads || 0);
    const bits = [created ? `${created} workspace${created === 1 ? '' : 's'} opened` : '', touched && !created ? `${touched} workspace${touched === 1 ? '' : 's'} refreshed` : '', sourceInputs.length ? `${sourceInputs.length} source load${sourceInputs.length === 1 ? '' : 's'} queued` : '', skipped ? `${skipped} already loaded` : ''].filter(Boolean);
    return `Merged workspace artifact ${title}. ${bits.length ? bits.join(' · ') : 'No additional source loading was needed.'}`;
  }
  return sourceInputs.length
    ? `Merged workspace artifact ${title}; source loading queued.`
    : `Merged workspace artifact ${title}.`;
}

export function appConfigMaterializationNotice(input = {}, materializationLabel = '', baseNotice = '') {
  const plan = String(input.appConfigPlan || '').trim();
  if (!plan) return baseNotice;
  const label = materializationLabel || input.label || input.repository || 'source';
  const planLabel = plan === 'workspace-discovery' ? 'workspace discovery source' : 'workspace entrypoint source';
  return `${label}: ${planLabel} materialized. ${baseNotice}`;
}
