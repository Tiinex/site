const TIME_PORTAL_SCHEMA = 'tiinex.site.workspace.timePortalView.v1';
const EXACT_COMMIT = /^[0-9a-f]{40}$/i;

export function latestTimePortalView() {
  return null;
}

export function normalizeTimePortalView(input = null) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const begin = clean(input.begin);
  const end = clean(input.end);
  const sourceId = clean(input.sourceId);
  const snapshotInput = clean(input.snapshotInput);
  const snapshot = normalizeResolvedSnapshot(input.snapshot);
  if (snapshot) {
    return {
      schema: TIME_PORTAL_SCHEMA,
      mode: 'historical',
      begin,
      end,
      sourceId: snapshot.sourceId || sourceId,
      snapshotInput: snapshotInput || snapshot.inputTarget || snapshot.requestedRef || snapshot.materializedCommit,
      snapshot
    };
  }
  if (!begin && !end && !sourceId && !snapshotInput && input.mode !== 'intent') return null;
  return { schema: TIME_PORTAL_SCHEMA, mode: 'intent', begin, end, sourceId, snapshotInput };
}

export function timePortalViewFor(view = {}) {
  return normalizeTimePortalView(view?.timePortal);
}

export function timePortalIntentFor(view = {}) {
  const current = timePortalViewFor(view);
  return {
    begin: current?.begin || '',
    end: current?.end || '',
    sourceId: current?.sourceId || '',
    snapshotInput: current?.snapshotInput || ''
  };
}

export function timePortalIntentActive(view = {}) {
  return Boolean(timePortalViewFor(view));
}

export function timePortalHistoricalActive(view = {}) {
  return timePortalViewFor(view)?.mode === 'historical';
}

export function timePortalWithIntent(view = {}, intent = {}) {
  const next = Object.assign({}, view || {});
  const normalized = normalizeTimePortalView({
    mode: 'intent',
    begin: intent.begin,
    end: intent.end,
    sourceId: intent.sourceId,
    snapshotInput: intent.snapshotInput
  });
  if (normalized) next.timePortal = normalized;
  else delete next.timePortal;
  return next;
}

export function timePortalWithResolvedSnapshot(view = {}, snapshot = {}, intent = null) {
  const current = intent && typeof intent === 'object' ? intent : timePortalIntentFor(view);
  const next = Object.assign({}, view || {});
  const normalized = normalizeTimePortalView({
    mode: 'historical',
    begin: current.begin,
    end: current.end,
    sourceId: snapshot.sourceId || current.sourceId,
    snapshotInput: current.snapshotInput || snapshot.inputTarget || snapshot.requestedRef || snapshot.materializedCommit,
    snapshot
  });
  if (!normalized?.snapshot) throw new Error('time-portal.snapshot.exact-commit-required');
  next.timePortal = normalized;
  return next;
}

export function timePortalWithoutIntent(view = {}) {
  const next = Object.assign({}, view || {});
  delete next.timePortal;
  return next;
}

export function normalizeResolvedSnapshot(input = null) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const materializedCommit = clean(input.materializedCommit).toLowerCase();
  if (!EXACT_COMMIT.test(materializedCommit)) return null;
  const repository = normalizeRepository(input.repository || input.repo);
  const sourceId = clean(input.sourceId);
  if (!sourceId || !repository) return null;
  return {
    schema: 'tiinex.site.githubHistoricalSnapshot.v1',
    sourceId,
    repository,
    rootPath: clean(input.rootPath),
    requestedRef: clean(input.requestedRef),
    resolvedRef: clean(input.resolvedRef || input.ref || materializedCommit),
    materializedCommit,
    inputTarget: clean(input.inputTarget),
    resolvedBy: clean(input.resolvedBy)
  };
}


export function timePortalReferencesSource(view = {}, sourceId = '') {
  const current = timePortalViewFor(view);
  const id = clean(sourceId);
  return Boolean(current && id && (current.sourceId === id || current.snapshot?.sourceId === id));
}

export function timePortalIntentLabel(input = null) {
  const current = normalizeTimePortalView(input?.timePortal || input);
  if (!current) return 'Latest source';
  const parts = [];
  if (current.begin) parts.push(`Begin ${current.begin}`);
  if (current.end) parts.push(`End ${current.end}`);
  return parts.length ? parts.join(' · ') : 'Explicit snapshot intent';
}

function normalizeRepository(value = '') {
  const raw = clean(value);
  if (!raw) return '';
  try {
    const url = new URL(raw);
    const parts = url.pathname.replace(/^\/+|\.git$/g, '').split('/').filter(Boolean);
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : '';
  } catch {
    const parts = raw.replace(/^github\.com\//i, '').replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '').replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : '';
  }
}

function clean(value) { return String(value || '').trim(); }
