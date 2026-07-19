(function attachDialogPresenter(global) {
  'use strict';

  function renderAddMaterialDialog(workspace, ctx) {
    return `<div class="tx-dialog-backdrop" role="presentation"><section class="tx-dialog tx-workspace-action-dialog" role="dialog" aria-modal="true" aria-labelledby="add-material-title"><button class="tx-dialog-close" type="button" data-dialog-close aria-label="Close">${ctx.icon('close')}</button><div class="tx-mini-label">Local material</div><h2 id="add-material-title">Add material</h2><p>Add browser-local material to <strong>${ctx.escapeHtml(workspace?.name || 'this workspace')}</strong>. It stays local/session and does not infer GitHub provenance.</p><form id="add-material-form" data-workspace-id="${ctx.escapeHtml(workspace?.id || '')}"><label class="tx-field"><span>Title</span><input name="recordTitle" autocomplete="off" maxlength="96" required placeholder="Example: First note"></label><label class="tx-field"><span>Summary</span><textarea name="recordSummary" rows="4" maxlength="280" placeholder="Paste or summarize the local material here."></textarea></label><div class="tx-badges">${ctx.badge('local/session')}${ctx.badge('no GitHub guess')}${ctx.badge('hash route')}</div><p class="tx-form-error" data-form-error aria-live="polite"></p><button class="tx-button tx-primary tx-dialog-primary" type="submit">${ctx.icon('load')} Add material</button></form></section></div>`;
  }

  function renderContinueDialog(workspace, ctx) {
    const title = `${workspace?.name || 'Workspace'} continuation`;
    return `<div class="tx-dialog-backdrop" role="presentation"><section class="tx-dialog tx-workspace-action-dialog" role="dialog" aria-modal="true" aria-labelledby="continue-title"><button class="tx-dialog-close" type="button" data-dialog-close aria-label="Close">${ctx.icon('close')}</button><div class="tx-mini-label">Continue</div><h2 id="continue-title">Create continuation leaf</h2><p>Create a browser-local continuation placeholder from <strong>${ctx.escapeHtml(workspace?.name || 'this workspace')}</strong>. Source boundaries remain local until material is explicitly exported or published.</p><form id="continue-form" data-workspace-id="${ctx.escapeHtml(workspace?.id || '')}"><label class="tx-field"><span>Title</span><input name="recordTitle" autocomplete="off" maxlength="96" required value="${ctx.escapeHtml(title)}"></label><label class="tx-field"><span>Summary</span><textarea name="recordSummary" rows="4" maxlength="280">Continuation leaf drafted in Tiinex Viewer.</textarea></label><div class="tx-badges">${ctx.badge('draft')}${ctx.badge('child of workspace')}${ctx.badge('local/session')}</div><p class="tx-form-error" data-form-error aria-live="polite"></p><button class="tx-button tx-primary tx-dialog-primary" type="submit">${ctx.icon('lineage')} Create continuation</button></form></section></div>`;
  }

  function renderOpenWorkspaceDialog(workspace, ctx) {
    const count = Array.isArray(workspace?.records) ? workspace.records.length : 0;
    return `<div class="tx-dialog-backdrop" role="presentation"><section class="tx-dialog" role="dialog" aria-modal="true" aria-labelledby="open-workspace-title"><button class="tx-dialog-close" type="button" data-dialog-close aria-label="Close">${ctx.icon('close')}</button><div class="tx-mini-label">Workspace</div><h2 id="open-workspace-title">${ctx.escapeHtml(workspace?.name || 'Workspace')}</h2><p>This opens the active local/session workspace summary without changing source truth.</p><div class="tx-action-summary"><div><span>Records</span><strong>${count}</strong></div><div><span>Source</span><strong>local/session</strong></div><div><span>GitHub</span><strong>not guessed</strong></div></div></section></div>`;
  }

  function renderCommandInfoDialog(command, ctx) {
    return `<div class="tx-dialog-backdrop" role="presentation"><section class="tx-dialog" role="dialog" aria-modal="true" aria-labelledby="command-info-title"><button class="tx-dialog-close" type="button" data-dialog-close aria-label="Close">${ctx.icon('close')}</button><div class="tx-mini-label">Command</div><h2 id="command-info-title">${ctx.escapeHtml(command.action || 'Command')}</h2><p>This command is route-aware but waits for the next use-case before it mutates source material.</p><div class="tx-badges">${ctx.badge('not source destructive')}${ctx.badge('CLI-portable command')}</div></section></div>`;
  }

  global.TiinexDialogPresenter = { renderAddMaterialDialog, renderContinueDialog, renderOpenWorkspaceDialog, renderCommandInfoDialog };
})(typeof window !== 'undefined' ? window : globalThis);
