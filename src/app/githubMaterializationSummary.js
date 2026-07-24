export function summarizeGithubMaterialization(sourceLabel, out = {}) {
  const okCount = Number(out.okCount || 0);
  const failCount = Number(out.failCount || 0);
  const warnings = Array.isArray(out.warnings) ? out.warnings : [];
  const errors = Array.isArray(out.errors) ? out.errors : [];
  const firstWarning = warnings[0];
  const firstError = errors[0];
  if (okCount > 0 && failCount === 0) {
    return `Loaded ${okCount} source file${okCount === 1 ? '' : 's'}${warnings.length ? `; ${warnings.length} warning${warnings.length === 1 ? '' : 's'}` : ''}${githubSurfaceSummary(out) ? ` · ${githubSurfaceSummary(out)}` : ''}.`;
  }
  if (okCount > 0) {
    return `Loaded ${okCount} source file${okCount === 1 ? '' : 's'}; ${failCount} failed/deferred${githubSurfaceSummary(out) ? ` · ${githubSurfaceSummary(out)}` : ''}.`;
  }
  if (firstWarning?.message) return `${sourceLabel} source registered. ${firstWarning.message}`;
  if (firstError?.error) return `${sourceLabel} source registered; source loading failed: ${firstError.error}.`;
  return `${sourceLabel} source registered; no source files loaded.`;
}

export function githubSurfaceSummary(out = {}) {
  const surfaces = out.diagnostics?.surfaces || {};
  const parts = [];
  const repo = surfaces.repoFiles || {};
  const explicit = surfaces.explicitFiles || {};
  const issues = surfaces.issueSnapshots || {};
  if (repo.requested) parts.push(`Repo files: ${Number(repo.loaded || 0)} loaded${repo.discovered != null ? ` / ${Number(repo.discovered || 0)} discovered` : ''}`);
  if (explicit.requested) parts.push(`Explicit files: ${Number(explicit.loaded || 0)} loaded${explicit.requestedCount != null ? ` / ${Number(explicit.requestedCount || 0)} requested` : ''}`);
  if (issues.requested) {
    const issueState = Number(issues.loaded || 0) > 0
      ? `${Number(issues.loaded || 0)} loaded`
      : issues.deferred || issues.unavailable
        ? 'deferred in browser runtime'
        : `${Number(issues.targets || 0)} targets`;
    parts.push(`Issue snapshots: ${issueState}`);
  }
  return parts.join(' · ');
}

export function summarizeGithubAdapterResult(out = {}) {
  const warnings = Array.isArray(out.warnings) ? out.warnings : [];
  const errors = Array.isArray(out.errors) ? out.errors : [];
  return {
    schema: 'tiinex.workspace.import.result.v1',
    ok: Number(out.okCount || 0) > 0 || warnings.length > 0,
    message: `GitHub source materialization: ${Number(out.okCount || 0)} loaded · ${warnings.length} warning${warnings.length === 1 ? '' : 's'} · ${errors.length} error${errors.length === 1 ? '' : 's'}${githubSurfaceSummary(out) ? ` · ${githubSurfaceSummary(out)}` : ''}.`,
    counts: {
      records: Number(out.okCount || 0),
      assets: 0,
      workspaceEntries: 0,
      warnings: warnings.length,
      errors: errors.length,
      previewOmitted: 0
    },
    warnings,
    errors,
    diagnostics: Object.assign({ adapterId: 'github' }, out.diagnostics || {})
  };
}

export function normalizeRepository(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    const url = new URL(raw);
    const parts = url.pathname.replace(/^\/+|\.git$/g, '').split('/').filter(Boolean);
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : raw;
  } catch {
    return raw.replace(/^github\.com\//i, '').replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '').replace(/^\/+|\/+$/g, '');
  }
}
