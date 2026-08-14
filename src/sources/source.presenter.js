(function attachTiinexSourcePresenter(global) {
  'use strict';

  function renderWindowHeader(workspace, ctx) {
    const records = Array.isArray(workspace?.records) ? workspace.records.length : 0;
    const sources = visibleSources(workspace).length;
    const drafts = (workspace?.records || []).filter((record) => record.kind === 'continuation' || record.status === 'draft').length;
    return `<header class="tx-window-titlebar tx-legacy-titlebar tx-v115-workspace-header"><div class="tx-window-identity"><strong>${ctx.escapeHtml(workspace?.name || 'Workspace')}</strong></div><div class="tx-window-stats tx-legacy-counter-bar">${ctx.statPill('database', sources, 'Sources')}${ctx.statPill('file', records, 'Loaded records')}${ctx.statPill('seedling', 0, 'Leaf candidates')}${ctx.statPill('pen', drafts, 'Drafts')}<button class="tx-icon-button tx-old-icon-button" type="button" data-share title="Share workspace">${ctx.icon('shareNodes')}</button><button class="tx-icon-button tx-old-icon-button" type="button" title="Policy / source boundary">${ctx.icon('scale')}</button><button class="tx-icon-button tx-old-icon-button" type="button" data-workspace-action="open" data-workspace-id="${ctx.escapeHtml(workspace.id)}" title="Open workspace summary">${ctx.icon('document')}</button><button class="tx-icon-button tx-old-icon-button tx-download-button" type="button" title="Export/download not available until material exists">${ctx.icon('download')}</button><button class="tx-icon-button tx-old-icon-button tx-add-source-button" type="button" data-workspace-action="add-source" data-workspace-id="${ctx.escapeHtml(workspace.id)}" title="Add material or source">${ctx.icon('create')}</button><button class="tx-icon-button tx-old-icon-button" type="button" title="Expand workspace">${ctx.icon('external')}</button><button class="tx-icon-button tx-old-icon-button" type="button" data-close-workspace="${ctx.escapeHtml(workspace.id)}" title="Close workspace">${ctx.icon('close')}</button></div></header>`;
  }

  function renderSourceStrip(workspace, ctx) {
    const sources = visibleSources(workspace);
    if (!sources.length) return '';
    return `<div class="workspace-source-strip source-strip-stable tx-legacy-source-strip tx-v115-source-strip" aria-label="Workspace sources">${sources.map((source) => renderSourcePill(workspace, source, ctx)).join('')}</div>`;
  }

  function renderProgress(workspace, ctx) {
    const progress = workspace?.discoveryProgress;
    if (!progress?.active) return '';
    const percent = Math.max(0, Math.min(100, Number(progress.percent || 0)));
    return `<div class="loading-progress tx-v115-loading-progress" data-discovery-progress="${ctx.escapeHtml(workspace.id)}" data-progress="${percent}"><div class="progress-head"><span>${ctx.icon('spinner')}<span data-progress-title>${ctx.escapeHtml(progress.label || 'Preparing source')}</span></span><small data-progress-label>${percent}%</small></div><div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}"><span class="progress-fill" data-progress-fill style="width:${percent}%"></span></div></div>`;
  }

  function renderAddSourceDialog(workspace, ctx) {
    const entry = configuredEntrypoint(ctx.workspaceConfig);
    const repo = entry.repository || 'Tiinex/docs';
    return `<div class="tx-dialog-backdrop" role="presentation"><section class="tx-dialog tx-source-dialog" role="dialog" aria-modal="true" aria-labelledby="add-source-title"><button class="tx-dialog-close" type="button" data-dialog-close aria-label="Close">${ctx.icon('close')}</button><div class="tx-mini-label">Source</div><h2 id="add-source-title">Add material or source</h2><p class="tx-muted">Keep local material separate from explicit repository sources. Repository loading is explicit and shown as progress.</p><form id="add-source-form" data-workspace-id="${ctx.escapeHtml(workspace?.id || '')}"><div class="tx-source-choice"><strong>${ctx.escapeHtml(repo)}</strong><span>${ctx.escapeHtml(entry.rootPath || '.topics')} · ${ctx.escapeHtml(entry.ref || 'master')} · Source Pages mirror</span></div><button class="tx-button tx-primary tx-dialog-primary" type="submit">${ctx.icon('github')} Add GitHub source</button></form><div class="tx-dialog-actions tx-source-dialog-actions"><button class="tx-button" type="button" data-workspace-action="add-material" data-workspace-id="${ctx.escapeHtml(workspace?.id || '')}">${ctx.icon('load')} Add local Markdown</button></div></section></div>`;
  }

  function visibleSources(workspace) {
    return (Array.isArray(workspace?.sources) ? workspace.sources : [])
      .map((source) => Object.assign({}, source, { count: Number(source.count || 0) }));
  }

  function renderSourcePill(workspace, source, ctx) {
    const local = source.id === 'local' || source.kind === 'local';
    const originRecovery = source.recoveryOnly === true || source.originReferenceSource === true || source.sourceKind === 'github.origin-reference';
    const iconName = local ? 'folder' : (source.kind && source.kind.includes('github') ? 'github' : 'link');
    const closeTitle = local ? 'Clear local/session material' : originRecovery ? 'Dismiss recovery-only origin' : 'Close this source';
    const closeLabel = local ? 'Clear Local source material from this browser session' : originRecovery ? `Dismiss recovery-only origin ${source.label || source.id}` : `Close source ${source.label || source.id}`;
    const close = source.closeable ? `<button class="source-close-btn" type="button" data-workspace-id="${ctx.escapeHtml(workspace.id)}" data-close-source="${ctx.escapeHtml(source.id)}" title="${ctx.escapeHtml(closeTitle)}" aria-label="${ctx.escapeHtml(closeLabel)}">${ctx.icon('close')}</button>` : '';
    const count = originRecovery ? `${Number(source.originReferenceCount || 0)} refs` : Number(source.count || 0);
    const role = originRecovery ? '<em class="source-role-badge">recovery only</em>' : '';
    return `<span class="workspace-source-pill ${originRecovery ? 'source-origin-recovery' : local ? 'source-local' : 'source-github'}" title="${ctx.escapeHtml(source.boundary || source.label || 'Source')}">${ctx.icon(iconName)}<span>${ctx.escapeHtml(source.label || source.repo || source.id)}</span><small>${ctx.escapeHtml(count)}</small>${role}${close}</span>`;
  }

  function configuredEntrypoint(workspaceConfig) {
    const entry = (workspaceConfig?.workspaceEntrypoints || [])[0] || {};
    return Object.assign({ label: 'Tiinex/docs', repository: 'Tiinex/docs', ref: 'master', rootPath: '.topics' }, entry);
  }

  function configuredMirrorLabel(workspaceConfig, repo) {
    const match = (workspaceConfig?.repositoryMirrors || []).find((mirror) => String(mirror.repository || '').toLowerCase() === String(repo || '').toLowerCase());
    return match ? 'Source Pages mirror' : 'configured mirror';
  }

  global.TiinexSourcePresenter = {
    configuredEntrypoint,
    configuredMirrorLabel,
    renderAddSourceDialog,
    renderProgress,
    renderSourceStrip,
    renderWindowHeader,
    visibleSources
  };
})(typeof window !== 'undefined' ? window : globalThis);
