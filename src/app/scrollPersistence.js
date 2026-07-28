export function clearScheduledScrollPersistence(refs = {}, win = globalThis) {
  if (refs.timerRef?.current && win.clearTimeout) win.clearTimeout(refs.timerRef.current);
  refs.timerRef && (refs.timerRef.current = null);
  if (refs.idleRef?.current && typeof win.cancelIdleCallback === 'function') win.cancelIdleCallback(refs.idleRef.current);
  refs.idleRef && (refs.idleRef.current = null);
}

export function persistCapturedScroll({ latestStateRef, state, preserveCapturedViewScroll, runtime, mode = 'replace', options = {}, doc = globalThis.document } = {}) {
  if (!options.force && doc?.visibilityState && doc.visibilityState !== 'visible') return null;
  const base = latestStateRef?.current || state;
  const withScroll = preserveCapturedViewScroll?.(base, base) || base;
  if (withScroll === base) return null;
  if (latestStateRef) latestStateRef.current = withScroll;
  if (options.render === true) options.setState?.(withScroll);
  if (withScroll?.workspaces?.length) runtime?.().persistence?.writeState?.(withScroll, { mode });
  return withScroll;
}

export function scheduleIdleScrollPersist(refs = {}, run = () => {}, win = globalThis, options = {}) {
  clearScheduledScrollPersistence(refs, win);
  const debounceMs = Math.max(0, Number(options.debounceMs ?? 520));
  const idleTimeout = Math.max(0, Number(options.idleTimeout ?? 1400));
  refs.timerRef.current = win.setTimeout?.(() => {
    refs.timerRef.current = null;
    const idleRun = () => { refs.idleRef.current = null; run(); };
    if (typeof win.requestIdleCallback === 'function') refs.idleRef.current = win.requestIdleCallback(idleRun, { timeout: idleTimeout });
    else refs.timerRef.current = win.setTimeout?.(idleRun, 900) || null;
  }, debounceMs) || null;
}
