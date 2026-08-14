export function workspaceEmptyStateCopy({ filtered = false, hasMaterial = false, query = '', summary = null, progress = null } = {}) {
  const latest = summary?.latestImport || null;
  const hasActiveProgress = Boolean(progress?.active);
  const hasDeferredSourceReceipt = Boolean(!hasMaterial && latest && (latest.message || latest.warnings?.length || latest.errors?.length));
  const message = filtered
    ? 'No nodes match this view.'
    : hasMaterial
      ? 'No artifacts match this view.'
      : hasActiveProgress
        ? 'Loading workspace material…'
        : hasDeferredSourceReceipt
          ? 'No readable material was produced.'
          : 'No material yet.';
  const hint = filtered && query
    ? `Search filter: ${query}`
    : hasActiveProgress
      ? String(progress.label || 'Source loading is running for this workspace.').slice(0, 260)
      : hasDeferredSourceReceipt
        ? String(latest.message || 'The source boundary is registered, but the selected reader did not produce records.').slice(0, 260)
        : '';
  const firstWarning = hasDeferredSourceReceipt && latest.warnings?.length ? latest.warnings[0] : null;
  const firstError = hasDeferredSourceReceipt && latest.errors?.length ? latest.errors[0] : null;
  return Object.freeze({ message, hint, firstWarning, firstError, hasActiveProgress, hasDeferredSourceReceipt });
}
