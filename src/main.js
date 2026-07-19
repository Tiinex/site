(() => {
  'use strict';

  const lifecycle = window.TiinexWorkspaceLifecycle;
  const persistence = window.TiinexWorkspacePersistence;
  const root = document.getElementById('root');
  const VERSION_LABEL = 'v109 workspace config';
  const workspaceConfig = window.TiinexWorkspaceConfig?.createDefaultWorkspaceConfig?.() || { emptyStage: { subtitles: ['Everything starts from somewhere.'] }, viewerIdentity: { browserTitle: 'Tiinex' }, help: [] };
  const iconPaths = window.TiinexIconPaths || {};
  if (workspaceConfig.viewerIdentity?.browserTitle && document?.title !== undefined) document.title = workspaceConfig.viewerIdentity.browserTitle;
  if (!root || !lifecycle || !persistence) return;

  let state = hydrateState();
  let dialog = null;
  let notice = '';

  render();

  function hydrateState() {
    const restored = persistence.readInitialState() || lifecycle.makeEmptyAppState();
    const base = lifecycle.cloneState(restored);
    base.workspaces = Array.isArray(base.workspaces) ? base.workspaces : [];
    base.activeWorkspaceId = base.workspaces.some((item) => item.id === base.activeWorkspaceId)
      ? base.activeWorkspaceId
      : (base.workspaces[0]?.id || '');
    base.view = Object.assign({ universe: 'column', workspaceVerse: 'feed', reader: 'scan', query: '' }, base.view || {});
    return base;
  }

  function commit(next) {
    state = lifecycle.cloneState(next);
    if (state.workspaces?.length) persistence.writeState(state);
    else persistence.clearState?.();
    render();
  }

  function render() {
    const active = lifecycle.activeWorkspace(state);
    root.innerHTML = renderApp(active);
    bindEvents();
  }

  function bindEvents() {
    root.querySelectorAll('[data-create-workspace]').forEach((button) => button.addEventListener('click', () => openDialog('create-workspace')));
    root.querySelectorAll('[data-close-workspace]').forEach((button) => button.addEventListener('click', () => openCloseDialog(button.getAttribute('data-close-workspace'))));
    root.querySelectorAll('[data-multiverse]').forEach((button) => button.addEventListener('click', () => openDialog('multiverse')));
    root.querySelectorAll('[data-help]').forEach((button) => button.addEventListener('click', () => openDialog('help')));
    root.querySelectorAll('[data-share]').forEach((button) => button.addEventListener('click', () => openDialog('share')));
    root.querySelectorAll('[data-copy-share]').forEach((button) => button.addEventListener('click', () => copyShareUrl(button.getAttribute('data-copy-share'))));
    root.querySelectorAll('[data-verse]').forEach((button) => button.addEventListener('click', () => commit(lifecycle.setWorkspaceVerse(state, button.getAttribute('data-verse')))));
    const search = root.querySelector('#workspace-search');
    if (search) search.addEventListener('input', () => {
      const next = lifecycle.cloneState(state);
      next.view.query = search.value;
      commit(next);
    });
    const createForm = root.querySelector('#create-workspace-form');
    if (createForm) createForm.addEventListener('submit', (event) => submitCreateWorkspace(event, createForm));
    root.querySelectorAll('[data-dialog-close]').forEach((button) => button.addEventListener('click', () => { dialog = null; notice = ''; render(); }));
    root.querySelectorAll('[data-confirm-close]').forEach((button) => button.addEventListener('click', () => {
      const result = lifecycle.closeWorkspace(state, button.getAttribute('data-confirm-close'));
      dialog = null;
      commit(result.state);
    }));
  }

  function submitCreateWorkspace(event, createForm) {
    event.preventDefault();
    const input = createForm.querySelector('[name="workspaceName"]');
    const result = lifecycle.createWorkspace(state, { name: input?.value || '' });
    if (!result.ok && result.error === 'workspace.name.required') {
      createForm.querySelector('[data-form-error]').textContent = 'Workspace name is required.';
      input?.focus();
      return;
    }
    dialog = null;
    commit(result.state);
  }

  function openDialog(type) {
    dialog = { type };
    render();
    if (type === 'create-workspace') root.querySelector('[name="workspaceName"]')?.focus();
  }

  function openCloseDialog(workspaceId) {
    const workspace = state.workspaces.find((item) => item.id === workspaceId);
    dialog = { type: 'close-workspace', workspace };
    render();
  }

  function copyShareUrl(url) {
    const value = url || cleanShareUrl();
    notice = 'Copy this URL from the field if clipboard access is blocked.';
    try {
      const copy = navigator?.clipboard?.writeText?.(value);
      if (copy?.then) copy.then(() => { notice = 'Clean link copied.'; render(); }).catch(() => render());
      else render();
    } catch (_) { render(); }
  }

  function renderApp(active) {
    const mode = state.view.workspaceVerse === 'tree' ? 'LINEAGE MODE' : 'DISCOVERY MODE';
    const emptyClass = active ? '' : ' tx-empty-stage-mode';
    return `
      <main class="tx-app tx-shell-visual-continuity tx-shell-pattern-parity tx-shell-legibility-corrected tx-shell-height-continuity tx-shell-scroll-owned tx-shell-column-fit tx-shell-icon-polish tx-shell-command-portable tx-shell-config-grounded tx-uc001-shell tx-uc001-empty-stage-parity${emptyClass}" data-uc="UC-001-empty-create-restore-close">
        ${renderGlobalDock(Boolean(active))}
        ${active ? `
        <section class="tx-workspace-window tx-focused-main-window tx-uc001-window" aria-label="Tiinex workspace window">
          ${renderWindowHeader(active)}
          ${renderSourceStrip(active)}
          ${renderModeStrip(mode)}
          <div class="tx-primary-stage tx-column-primary-stage">${renderWorkspace(active)}</div>
        </section>
        <footer class="tx-footer">Powered by <strong>Tiinex</strong></footer>` : `${renderEmptyStage()}<footer class="tx-footer tx-empty-footer">Powered by <strong>Tiinex</strong></footer>`}
        ${dialog ? renderDialog() : ''}
      </main>`;
  }

  function renderGlobalDock(hasWorkspace) {
    return `
      <nav class="tx-legacy-global-dock ${hasWorkspace ? 'tx-active-global-dock' : 'tx-empty-global-dock'}" aria-label="Global actions">
        ${hasWorkspace ? `<button class="tx-nav-button tx-round-nav" type="button" title="Previous">${icon('previous')}</button>` : ''}
        <span class="tx-dock-core tx-centered-dock-core">
          <span class="tx-dock-left"><button class="tx-nav-button tx-multiverse-switch" type="button" data-multiverse title="Change multiverse" aria-label="Change multiverse">${icon('multiverse')}</button></span>
          <span class="tx-logo-orb" aria-label="Tiinex"><img src="./public/assets/tiinex-logo-white-transparent.png" alt=""></span>
          <span class="tx-dock-right">
            <button class="tx-nav-button tx-primary-orb" type="button" data-create-workspace title="Create workspace">${icon('create')}<strong>Create</strong></button>
            <button class="tx-nav-button tx-share-action" type="button" data-share title="Share">${icon('share')}<strong>Share</strong></button>
            <button class="tx-nav-button" type="button" data-help title="Help" aria-label="Help">${icon('help')}</button>
          </span>
        </span>
        ${hasWorkspace ? `<button class="tx-nav-button tx-round-nav" type="button" title="Next">${icon('next')}</button>` : ''}
      </nav>`;
  }

  function renderWindowHeader(active) {
    return `<header class="tx-window-titlebar"><div class="tx-window-identity"><strong>Tiinex</strong><span class="tx-badge tx-badge-soft">${VERSION_LABEL}</span></div><div class="tx-window-stats tx-badges">${badge('file-local')}${badge('column')}${active ? badge('session workspace') : badge('empty')}<button class="tx-icon-button" type="button" title="Display">${icon('display')}</button><button class="tx-icon-button" type="button" title="Audit disabled until workspace has material">${icon('audit')}</button><button class="tx-icon-button" type="button" title="Expand">${icon('external')}</button>${active ? `<button class="tx-icon-button" type="button" data-close-workspace="${escapeHtml(active.id)}" title="Close workspace">${icon('close')}</button>` : ''}</div></header>`;
  }

  function renderSourceStrip(active) {
    return `<div class="tx-source-strip tx-legacy-source-strip" aria-label="Source row"><div class="tx-source-primary"><span class="tx-source-dot"></span>${active ? `<button class="tx-chip" type="button">${escapeHtml(active.name)}</button><button class="tx-chip" type="button">local/session</button><span class="tx-muted">no GitHub guess</span>` : `<button class="tx-chip" type="button">No workspace</button><span class="tx-muted">create local workspace to begin</span>`}</div><div class="tx-source-tools"><button class="tx-icon-button" type="button" title="Column view">${icon('display')}</button><button class="tx-icon-button" type="button" title="Source boundary">${icon('source')}</button></div></div>`;
  }

  function renderModeStrip(mode) {
    return `<div class="tx-mode-strip tx-legacy-main-mode" aria-label="Mode controls"><div id="main-mode-name" class="tx-mode-name">${mode}</div><div class="tx-segment" aria-label="Workspace verse"><button class="tx-button ${state.view.workspaceVerse === 'feed' ? 'tx-active' : ''}" data-verse="feed" type="button">Feed</button><button class="tx-button ${state.view.workspaceVerse === 'tree' ? 'tx-active' : ''}" data-verse="tree" type="button">Tree</button></div><input id="workspace-search" class="tx-search-input" type="search" value="${escapeHtml(state.view.query || '')}" placeholder="Search title/schema/source…" aria-label="Search loaded artifacts"></div>`;
  }

  function renderEmptyStage() {
    const subtitle = window.TiinexWorkspaceConfig?.emptyStageSubtitle?.(workspaceConfig) || 'Everything starts from somewhere.';
    return `<section class="tx-empty-stage tx-old-empty-stage tx-uc001-empty-start" aria-label="No workspace loaded" title="Use Create to start a local workspace"><p>${escapeHtml(subtitle)}</p></section>`;
  }

  function renderWorkspace(workspace) {
    const isTree = state.view.workspaceVerse === 'tree';
    const records = (workspace.records || []).filter(recordMatchesQuery);
    return `<section class="tx-column-feed tx-uc001-created-workspace" data-workspace-id="${escapeHtml(workspace.id)}"><div class="tx-reader-state">${badge(state.view.workspaceVerse)}${badge(`${records.length} shown`)}${badge('local/session')}${badge('no github guess')}</div>${records.length ? records.map(renderRecordCard).join('') : renderWorkspaceEmptyState(workspace)}${isTree ? renderLineageRootTrailingCard() : ''}</section>`;
  }

  function renderWorkspaceEmptyState(workspace) {
    return `<article class="tx-artifact-card tx-legacy-artifact-card tx-workspace-empty-card"><div class="tx-legacy-card-badges">${badge('empty')}${badge('workspace')}${badge('local/session')}</div><header class="tx-legacy-card-body"><h3>${escapeHtml(workspace.name)}</h3><p>No artifacts loaded yet. Next step: add local markdown or create a continuation leaf.</p></header><footer class="tx-artifact-actions tx-legacy-action-row">${actionButton('load', 'Add material', true)}${actionButton('lineage', 'Continue', true)}${actionButton('open', 'Open', true)}</footer></article>`;
  }

  function renderRecordCard(record) {
    return `<article class="tx-artifact-card tx-legacy-artifact-card"><div class="tx-legacy-card-badges">${badge(record.status || 'open')}${badge(record.kind || 'artifact')}${badge(record.createdAt || 'local')}</div><header class="tx-legacy-card-body"><h3>${escapeHtml(record.title || 'Untitled')}</h3><p>${escapeHtml(record.summary || '')}</p></header><footer class="tx-artifact-actions tx-legacy-action-row">${actionButton('preview', 'Preview')}${actionButton('open', 'Open', true)}${actionButton('merge', 'Merge', true)}</footer></article>`;
  }

  function renderLineageRootTrailingCard() { return `<article class="tx-lineage-terminal tx-lineage-root-card"><span>${icon('audit')}</span><p>Lineage root reached.</p></article>`; }

  function renderDialog() {
    if (dialog.type === 'close-workspace') return renderCloseDialog(dialog.workspace);
    if (dialog.type === 'multiverse') return renderMultiverseDialog();
    if (dialog.type === 'help') return renderHelpDialog();
    if (dialog.type === 'share') return renderShareDialog();
    return renderCreateDialog();
  }

  function renderCreateDialog() {
    return `<div class="tx-dialog-backdrop" role="presentation"><section class="tx-dialog tx-workspace-create-dialog" role="dialog" aria-modal="true" aria-labelledby="create-workspace-title"><button class="tx-dialog-close" type="button" data-dialog-close aria-label="Close">${icon('close')}</button><div class="tx-mini-label">Workspace</div><h2 id="create-workspace-title">Create workspace</h2><p class="tx-muted">Name a local workspace. Add sources and files after it opens.</p><form id="create-workspace-form"><label class="tx-field"><span>Workspace name</span><input name="workspaceName" autocomplete="off" maxlength="72" required placeholder="Example: Documentation"></label><div class="tx-badges">${badge('local/session')}${badge('no GitHub guess')}${badge('hash + storage restore')}</div><p class="tx-form-error" data-form-error aria-live="polite"></p><button class="tx-button tx-primary tx-dialog-primary" type="submit">${icon('create')} Create workspace</button></form></section></div>`;
  }

  function renderCloseDialog(workspace) {
    return `<div class="tx-dialog-backdrop" role="presentation"><section class="tx-dialog tx-workspace-close-dialog" role="dialog" aria-modal="true" aria-labelledby="close-workspace-title"><button class="tx-dialog-close" type="button" data-dialog-close aria-label="Close">${icon('close')}</button><div class="tx-mini-label">Close</div><h2 id="close-workspace-title">Close workspace?</h2><p>This closes <strong>${escapeHtml(workspace?.name || 'this workspace')}</strong> from the current browser session. It does not delete source files, GitHub material, or local downloads.</p><div class="tx-dialog-actions"><button class="tx-button" type="button" data-dialog-close>Cancel</button><button class="tx-button tx-danger" type="button" data-confirm-close="${escapeHtml(workspace?.id || '')}">Close workspace</button></div></section></div>`;
  }

  function renderMultiverseDialog() {
    return `<div class="tx-dialog-backdrop" role="presentation"><section class="tx-dialog" role="dialog" aria-modal="true" aria-labelledby="multiverse-title"><button class="tx-dialog-close" type="button" data-dialog-close aria-label="Close">${icon('close')}</button><div class="tx-mini-label">Multiverse</div><h2 id="multiverse-title">Column multiverse</h2><p>Column is the only active universe while UC-001 is being proven. Additional verses stay unavailable until this happy path is stable.</p><div class="tx-badges">${badge('Column active')}${badge(`${state.workspaces.length} workspace${state.workspaces.length === 1 ? '' : 's'}`)}${badge('Map/Atlas frozen')}</div></section></div>`;
  }

  function renderHelpDialog() {
    const help = workspaceConfig.help || [];
    const items = help.slice(0, 4).map((item) => `<details class="tx-help-item"><summary>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.body)}</p></details>`).join('');
    return `<div class="tx-dialog-backdrop" role="presentation"><section class="tx-dialog" role="dialog" aria-modal="true" aria-labelledby="help-title"><button class="tx-dialog-close" type="button" data-dialog-close aria-label="Close">${icon('close')}</button><div class="tx-mini-label">Help</div><h2 id="help-title">Workspace help</h2>${items || '<p>No help entries configured.</p>'}</section></div>`;
  }

  function renderShareDialog() {
    const url = cleanShareUrl();
    return `<div class="tx-dialog-backdrop" role="presentation"><section class="tx-dialog" role="dialog" aria-modal="true" aria-labelledby="share-title"><button class="tx-dialog-close" type="button" data-dialog-close aria-label="Close">${icon('close')}</button><div class="tx-mini-label">Share</div><h2 id="share-title">Share current view</h2><p>Hash state carries the current local view. Empty start keeps a clean URL.</p><label class="tx-field"><span>URL</span><input readonly value="${escapeHtml(url)}"></label>${notice ? `<p class="tx-form-note">${escapeHtml(notice)}</p>` : ''}<button class="tx-button tx-primary tx-dialog-primary" type="button" data-copy-share="${escapeHtml(url)}">${icon('share')} Copy clean link</button></section></div>`;
  }

  function cleanShareUrl() {
    if (!state.workspaces?.length) return `${location.origin || ''}${location.pathname || ''}${location.search || ''}`;
    return location.href || '';
  }

  function recordMatchesQuery(record) {
    const query = String(state.view.query || '').toLowerCase().trim();
    if (!query) return true;
    return `${record.title || ''} ${record.summary || ''} ${record.kind || ''}`.toLowerCase().includes(query);
  }

  function actionButton(iconName, label, labeled = false) { return `<button class="tx-action-button ${labeled ? 'tx-labeled-action' : ''}" type="button" title="${escapeHtml(label)}">${icon(iconName)}${labeled ? `<strong>${escapeHtml(label)}</strong>` : ''}</button>`; }
  function icon(name) { return `<svg class="tx-svg-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${iconPaths[name] || iconPaths.preview}</svg>`; }
  function badge(text) { return `<span class="tx-badge">${escapeHtml(text)}</span>`; }
  function escapeHtml(value) { return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;'); }
})();
