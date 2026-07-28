const PREVIEW_ID = 'tx-visual-dormancy-preview';
const WORKSPACE_SELECTOR = '.tx-workspace-window';
const PREVIEW_FIRST_RESTORE_DELAY_MS = 1100;
const RETURN_SETTLE_MS = 0;
const RETURN_SETTLE_ENABLED = false;

export function visualDormancyReturnSettleEnabled() {
  return RETURN_SETTLE_ENABLED;
}

function text(value) {
  return String(value == null ? '' : value).trim();
}

function escapeHtml(value) {
  return text(value).replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
}

export function visualDormancySummary(state = {}) {
  const workspaces = Array.isArray(state.workspaces) ? state.workspaces : [];
  const active = workspaces.find((workspace) => workspace?.id === state.activeWorkspaceId) || workspaces[0] || null;
  const records = Array.isArray(active?.records) ? active.records.length : 0;
  const assets = Array.isArray(active?.assets) ? active.assets.length : 0;
  const sources = Array.isArray(active?.sources) ? active.sources : [];
  const source = sources.find((item) => item?.label || item?.repo || item?.owner) || null;
  const sourceLabel = text(source?.label) || text(source?.repo) || (source?.owner && source?.name ? `${source.owner}/${source.name}` : '') || (sources.length ? `${sources.length} source${sources.length === 1 ? '' : 's'}` : 'No source');
  const verse = text(state.view?.workspaceVerse) || 'feed';
  return {
    title: text(active?.title) || text(active?.name) || text(active?.label) || 'Tiinex workspace',
    source: sourceLabel,
    view: verse === 'tree' ? 'Tree view' : verse === 'lineage' ? 'Lineage view' : verse === 'audit' ? 'Audit view' : 'Feed view',
    records,
    assets,
    sources: sources.length,
    workspaces: workspaces.length,
    hasMaterial: Boolean(records || assets || sources.length)
  };
}

export function visualDormancyPreviewHtml(summary = {}) {
  const counts = [];
  if (summary.records) counts.push(`${summary.records} artifacts`);
  if (summary.assets) counts.push(`${summary.assets} assets`);
  if (summary.sources) counts.push(`${summary.sources} source${summary.sources === 1 ? '' : 's'}`);
  return `<section id="${PREVIEW_ID}" class="tx-visual-dormancy-preview" aria-label="Parked Tiinex workspace preview" aria-hidden="true" hidden>
    <p class="tx-visual-dormancy-kicker">Parked workspace</p>
    <h2>${escapeHtml(summary.title || 'Tiinex workspace')}</h2>
    <div class="tx-visual-dormancy-widget-grid" aria-label="Workspace resume summary">
      <span><strong>View</strong><em>${escapeHtml(summary.view || 'View')}</em></span>
      <span><strong>Material</strong><em>${escapeHtml(counts.join(' · ') || 'Workspace loaded')}</em></span>
      <span><strong>Source</strong><em>${escapeHtml(summary.source || 'Workspace')}</em></span>
    </div>
    <p class="tx-visual-dormancy-resume">Tap, scroll, or press any key to resume the full workspace.</p>
  </section>`;
}

export function visualDormancyEligible(summary = {}, viewport = {}) {
  if (!summary.hasMaterial) return { ok: false, reason: 'no-material' };
  const coarse = viewport.coarse === true;
  // Desktop can be visually narrow in dev tools, side-by-side windows, or screenshots.
  // Treat that as desktop UI, not mobile app-switch parking. Mobile preview is
  // reserved for coarse-pointer surfaces where the browser/app switcher is the real
  // constraint.
  if (coarse) return { ok: true, reason: 'coarse-viewport' };
  return { ok: false, reason: 'fine-pointer-no-preview' };
}

export function visualDormancyRequiresManualRestore(summary = {}, viewport = {}) {
  const eligible = visualDormancyEligible(summary, viewport);
  if (!eligible.ok) return false;
  return viewport.coarse === true;
}

export function visualDormancyRestoreDelay(summary = {}, viewport = {}) {
  const eligible = visualDormancyEligible(summary, viewport);
  if (!eligible.ok) return 0;
  if (visualDormancyRequiresManualRestore(summary, viewport)) return 0;
  return PREVIEW_FIRST_RESTORE_DELAY_MS;
}

function viewportSnapshot() {
  let coarse = false;
  try { coarse = Boolean(window.matchMedia?.('(pointer: coarse)')?.matches); } catch (_) {}
  return { coarse, width: Number(window.innerWidth || 0), height: Number(window.innerHeight || 0) };
}

function ensurePreview(root, summary) {
  if (!root) return null;
  let preview = root.querySelector(`#${PREVIEW_ID}`);
  if (!preview) {
    const wrap = document.createElement('div');
    wrap.innerHTML = visualDormancyPreviewHtml(summary);
    preview = wrap.firstElementChild;
    const workspace = root.querySelector(WORKSPACE_SELECTOR);
    if (workspace?.parentNode) workspace.parentNode.insertBefore(preview, workspace);
    else root.appendChild(preview);
  } else {
    preview.outerHTML = visualDormancyPreviewHtml(summary);
    preview = root.querySelector(`#${PREVIEW_ID}`);
  }
  return preview;
}

export function installVisualDormancy({ getSummary, rootSelector = '.tx-react-runtime', restoreDelayMs = PREVIEW_FIRST_RESTORE_DELAY_MS } = {}) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return () => {};
  const state = {
    parked: false,
    previous: null,
    restoreTimer: 0,
    firstPaintTimer: 0,
    settleTimer: 0,
    events: [],
    lastSkip: null,
    lastPark: null,
    lastRestore: null,
    lastResumePreview: null,
    lastSettle: null
  };
  const record = (event, detail = {}) => {
    state.events.push(Object.assign({ at: new Date().toISOString(), event }, detail));
    if (state.events.length > 40) state.events.splice(0, state.events.length - 40);
  };
  const root = () => document.querySelector(rootSelector) || document.getElementById('root');
  const workspace = () => root()?.querySelector?.(WORKSPACE_SELECTOR) || null;
  const clearRestoreTimers = () => {
    if (state.restoreTimer) window.clearTimeout(state.restoreTimer);
    if (state.firstPaintTimer) window.clearTimeout(state.firstPaintTimer);
    state.restoreTimer = 0;
    state.firstPaintTimer = 0;
  };
  const clearSettleTimer = () => {
    if (state.settleTimer) window.clearTimeout(state.settleTimer);
    state.settleTimer = 0;
  };
  const startReturnSettle = (reason = 'background') => {
    // v286: broad body-level return-settle selectors caused a full style
    // invalidation on mobile/devtools foreground and could be seen in the
    // browser inspector as body.tx-return-settle during interaction. Keep the
    // diagnostic seam, but do not toggle the global class by default.
    const summary = (typeof getSummary === 'function' ? getSummary() : null) || {};
    if (!summary.hasMaterial || !RETURN_SETTLE_ENABLED) {
      state.lastSettle = { reason, phase: 'disabled', records: Number(summary.records || 0), at: new Date().toISOString() };
      record('return-settle-skip', state.lastSettle);
      return false;
    }
    document.body.classList.add('tx-return-settle');
    state.lastSettle = { reason, phase: 'background-ready', records: Number(summary.records || 0), at: new Date().toISOString() };
    record('return-settle-start', state.lastSettle);
    return true;
  };
  const finishReturnSettle = (reason = 'foreground') => {
    if (!RETURN_SETTLE_ENABLED) {
      document.body.classList.remove('tx-return-settle');
      return false;
    }
    if (!document.body.classList.contains('tx-return-settle')) return false;
    clearSettleTimer();
    const done = () => {
      document.body.classList.remove('tx-return-settle');
      state.lastSettle = Object.assign({}, state.lastSettle || {}, { reason, phase: 'restored', restoredAt: new Date().toISOString() });
      record('return-settle-end', state.lastSettle);
    };
    window.requestAnimationFrame?.(() => {
      state.settleTimer = window.setTimeout(done, RETURN_SETTLE_MS);
    }) || (state.settleTimer = window.setTimeout(done, RETURN_SETTLE_MS));
    return true;
  };
  const park = (reason = 'hidden') => {
    const summary = (typeof getSummary === 'function' ? getSummary() : null) || {};
    const viewport = viewportSnapshot();
    const eligibility = visualDormancyEligible(summary, viewport);
    if (!eligibility.ok) { state.lastSkip = Object.assign({ reason }, eligibility, summary); record('park-skip', state.lastSkip); return false; }
    const target = workspace();
    const parent = root();
    if (!target || !parent) return false;
    const preview = ensurePreview(parent, summary);
    clearRestoreTimers();
    if (!state.parked) {
      state.previous = {
        contentVisibility: target.style.contentVisibility || '',
        contain: target.style.contain || '',
        containIntrinsicSize: target.style.containIntrinsicSize || '',
        visibility: target.style.visibility || '',
        pointerEvents: target.style.pointerEvents || '',
        display: target.style.display || ''
      };
    }
    target.style.contentVisibility = 'hidden';
    target.style.contain = 'layout paint style';
    target.style.containIntrinsicSize = `${Math.max(520, Math.round(window.innerHeight || 720))}px`;
    target.style.visibility = 'hidden';
    target.style.pointerEvents = 'none';
    target.style.display = 'none';
    if (preview) { preview.hidden = false; preview.setAttribute('aria-hidden', 'false'); }
    document.body.classList.add('tx-visual-dormant');
    state.parked = true;
    state.lastPark = Object.assign({
      reason,
      restoreDelayMs: visualDormancyRestoreDelay(summary, viewport) || 0,
      manualRestore: visualDormancyRequiresManualRestore(summary, viewport)
    }, summary);
    record('park', state.lastPark);
    return true;
  };
  const restoreNow = (reason = 'visible') => {
    if (!state.parked) return false;
    clearRestoreTimers();
    const target = workspace();
    const previous = state.previous || {};
    if (target) {
      target.style.display = previous.display || '';
      target.style.contentVisibility = previous.contentVisibility || '';
      target.style.contain = previous.contain || '';
      target.style.containIntrinsicSize = previous.containIntrinsicSize || '';
      target.style.visibility = previous.visibility || '';
      target.style.pointerEvents = previous.pointerEvents || '';
    }
    const preview = root()?.querySelector?.(`#${PREVIEW_ID}`);
    if (preview) { preview.hidden = true; preview.setAttribute('aria-hidden', 'true'); }
    document.body.classList.remove('tx-visual-dormant');
    state.parked = false;
    state.previous = null;
    state.lastRestore = { reason, records: (typeof getSummary === 'function' ? getSummary()?.records : 0) || 0 };
    record('restore', state.lastRestore);
    return true;
  };
  const schedulePreviewFirstRestore = (reason = 'visible') => {
    if (!state.parked) return false;
    clearRestoreTimers();
    const summary = (typeof getSummary === 'function' ? getSummary() : null) || {};
    const viewport = viewportSnapshot();
    const manualRestore = visualDormancyRequiresManualRestore(summary, viewport);
    const delay = Number(visualDormancyRestoreDelay(summary, viewport) || restoreDelayMs || PREVIEW_FIRST_RESTORE_DELAY_MS);
    const markPreview = () => {
      state.lastResumePreview = {
        reason,
        delay: manualRestore ? 0 : Math.max(250, delay),
        manualRestore,
        records: Number(summary.records || 0)
      };
      record(manualRestore ? 'resume-preview-manual' : 'resume-preview', state.lastResumePreview);
      if (manualRestore) return;
      state.restoreTimer = window.setTimeout(() => {
        state.restoreTimer = 0;
        window.requestAnimationFrame?.(() => restoreNow(`${reason}:deferred`)) || restoreNow(`${reason}:deferred`);
      }, Math.max(250, delay));
    };
    window.requestAnimationFrame?.(() => window.requestAnimationFrame?.(markPreview) || markPreview()) || markPreview();
    return true;
  };
  const onVisibility = () => { if (document.hidden) { startReturnSettle('visibility-hidden'); park('visibility-hidden'); } else { schedulePreviewFirstRestore('visibility-visible'); finishReturnSettle('visibility-visible'); } };
  const onPageHide = () => { startReturnSettle('pagehide'); park('pagehide'); };
  const onPageShow = () => { schedulePreviewFirstRestore('pageshow'); finishReturnSettle('pageshow'); };
  const onFreeze = () => { startReturnSettle('page-freeze'); park('page-freeze'); };
  const onResume = () => { schedulePreviewFirstRestore('page-resume'); finishReturnSettle('page-resume'); };
  const onBlur = () => { startReturnSettle('window-blur'); park('window-blur'); };
  const onFocus = () => { schedulePreviewFirstRestore('window-focus'); finishReturnSettle('window-focus'); };
  const onInteract = () => { if (state.parked) restoreNow('user-interaction'); };
  document.addEventListener('visibilitychange', onVisibility);
  document.addEventListener('freeze', onFreeze);
  document.addEventListener('resume', onResume);
  window.addEventListener('pagehide', onPageHide, { passive: true });
  window.addEventListener('pageshow', onPageShow, { passive: true });
  window.addEventListener('blur', onBlur, { passive: true });
  window.addEventListener('focus', onFocus, { passive: true });
  window.addEventListener('pointerdown', onInteract, { passive: true });
  window.addEventListener('wheel', onInteract, { passive: true });
  window.addEventListener('keydown', onInteract, { passive: true });
  window.TiinexVisualDormancyReport = () => Object.assign({ schema: 'tiinex.visualDormancy.report.v1', parked: state.parked, returnSettleEnabled: RETURN_SETTLE_ENABLED }, state);
  return () => {
    clearRestoreTimers();
    clearSettleTimer();
    document.body.classList.remove('tx-return-settle');
    document.removeEventListener('visibilitychange', onVisibility);
    document.removeEventListener('freeze', onFreeze);
    document.removeEventListener('resume', onResume);
    window.removeEventListener('pagehide', onPageHide);
    window.removeEventListener('pageshow', onPageShow);
    window.removeEventListener('blur', onBlur);
    window.removeEventListener('focus', onFocus);
    window.removeEventListener('pointerdown', onInteract);
    window.removeEventListener('wheel', onInteract);
    window.removeEventListener('keydown', onInteract);
    restoreNow('cleanup');
  };
}
