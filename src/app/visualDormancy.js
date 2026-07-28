const PREVIEW_ID = 'tx-visual-dormancy-preview';
const WORKSPACE_SELECTOR = '.tx-workspace-window';
const MIN_RECORDS_FOR_DESKTOP_DORMANCY = 120;

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
    <p class="tx-visual-dormancy-source">${escapeHtml(summary.source || 'Workspace')}</p>
    <div class="tx-visual-dormancy-meta">
      <span>${escapeHtml(summary.view || 'View')}</span>
      <span>${escapeHtml(counts.join(' · ') || 'Workspace loaded')}</span>
    </div>
  </section>`;
}

export function visualDormancyEligible(summary = {}, viewport = {}) {
  if (!summary.hasMaterial) return { ok: false, reason: 'no-material' };
  const coarse = viewport.coarse === true;
  const narrow = Number(viewport.width || 0) > 0 && Number(viewport.width || 0) <= 900;
  const large = Number(summary.records || 0) >= MIN_RECORDS_FOR_DESKTOP_DORMANCY;
  if (coarse || narrow || large) return { ok: true, reason: large ? 'large-workspace' : 'constrained-viewport' };
  return { ok: false, reason: 'not-constrained' };
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

export function installVisualDormancy({ getSummary, rootSelector = '.tx-react-runtime', restoreDelayMs = 120 } = {}) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return () => {};
  const state = { parked: false, previous: null, restoreTimer: 0, events: [], lastSkip: null, lastPark: null, lastRestore: null };
  const record = (event, detail = {}) => {
    state.events.push(Object.assign({ at: new Date().toISOString(), event }, detail));
    if (state.events.length > 40) state.events.splice(0, state.events.length - 40);
  };
  const root = () => document.querySelector(rootSelector) || document.getElementById('root');
  const workspace = () => root()?.querySelector?.(WORKSPACE_SELECTOR) || null;
  const park = (reason = 'hidden') => {
    const summary = (typeof getSummary === 'function' ? getSummary() : null) || {};
    const eligibility = visualDormancyEligible(summary, viewportSnapshot());
    if (!eligibility.ok) { state.lastSkip = Object.assign({ reason }, eligibility, summary); record('park-skip', state.lastSkip); return false; }
    const target = workspace();
    const parent = root();
    if (!target || !parent) return false;
    const preview = ensurePreview(parent, summary);
    if (state.restoreTimer) window.clearTimeout(state.restoreTimer);
    if (!state.parked) state.previous = { contentVisibility: target.style.contentVisibility || '', contain: target.style.contain || '', containIntrinsicSize: target.style.containIntrinsicSize || '', visibility: target.style.visibility || '', pointerEvents: target.style.pointerEvents || '' };
    target.style.contentVisibility = 'hidden';
    target.style.contain = 'layout paint style';
    target.style.containIntrinsicSize = `${Math.max(520, Math.round(window.innerHeight || 720))}px`;
    target.style.visibility = 'hidden';
    target.style.pointerEvents = 'none';
    if (preview) { preview.hidden = false; preview.setAttribute('aria-hidden', 'false'); }
    document.body.classList.add('tx-visual-dormant');
    state.parked = true;
    state.lastPark = Object.assign({ reason }, summary);
    record('park', state.lastPark);
    return true;
  };
  const restoreNow = (reason = 'visible') => {
    if (!state.parked) return false;
    const target = workspace();
    const previous = state.previous || {};
    if (target) {
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
  const scheduleRestore = (reason = 'visible') => {
    if (state.restoreTimer) window.clearTimeout(state.restoreTimer);
    state.restoreTimer = window.setTimeout(() => { state.restoreTimer = 0; window.requestAnimationFrame?.(() => restoreNow(reason)) || restoreNow(reason); }, restoreDelayMs);
  };
  const onVisibility = () => { if (document.hidden) park('visibility-hidden'); else scheduleRestore('visibility-visible'); };
  const onPageHide = () => park('pagehide');
  const onBlur = () => park('window-blur');
  const onFocus = () => scheduleRestore('window-focus');
  const onInteract = () => { if (state.parked) restoreNow('user-interaction'); };
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pagehide', onPageHide, { passive: true });
  window.addEventListener('blur', onBlur, { passive: true });
  window.addEventListener('focus', onFocus, { passive: true });
  window.addEventListener('pointerdown', onInteract, { passive: true });
  window.addEventListener('keydown', onInteract, { passive: true });
  window.TiinexVisualDormancyReport = () => Object.assign({ schema: 'tiinex.visualDormancy.report.v1', parked: state.parked }, state);
  return () => {
    if (state.restoreTimer) window.clearTimeout(state.restoreTimer);
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('pagehide', onPageHide);
    window.removeEventListener('blur', onBlur);
    window.removeEventListener('focus', onFocus);
    window.removeEventListener('pointerdown', onInteract);
    window.removeEventListener('keydown', onInteract);
    restoreNow('cleanup');
  };
}
