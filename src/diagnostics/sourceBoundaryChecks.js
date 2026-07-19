export function checkSourceBoundary(source) {
  if (!source) return { ok: true, severity: 'info', code: 'source.draft.default' };
  if (source.kind === 'github-source-backed' && !source.permalink) return { ok: false, severity: 'error', code: 'source.github.missing-permalink' };
  return { ok: true, severity: 'info', code: 'source.boundary.visible' };
}
