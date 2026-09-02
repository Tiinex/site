import { canonicalProductState } from './productStateBoundary.js';
import { persistenceWriteEnvForOwnership } from './persistenceOwnership.js';

export function createStatePersistenceScheduler(win = globalThis, options = {}) {
  const state = {
    timer: null,
    idle: null,
    pending: null,
    writes: 0,
    deferred: 0,
    flushed: 0,
    lastReason: ''
  };

  const clearTimer = () => {
    if (state.timer && win?.clearTimeout) win.clearTimeout(state.timer);
    state.timer = null;
  };
  const clearIdle = () => {
    if (state.idle && typeof win?.cancelIdleCallback === 'function') win.cancelIdleCallback(state.idle);
    state.idle = null;
  };
  const clearScheduled = () => { clearTimer(); clearIdle(); };

  function writeNow(entry, reason = 'write') {
    if (!entry?.state?.workspaces?.length) return null;
    state.writes += 1;
    state.lastReason = reason;
    entry.runtime?.().persistence?.writeState?.(entry.state, persistenceWriteEnvForOwnership(options.persistenceOwnership, { mode: entry.mode || 'replace', ...(entry.writeEnv || {}) }));
    return entry.state;
  }

  function flush(reason = 'flush') {
    const entry = state.pending;
    state.pending = null;
    clearScheduled();
    if (!entry) return null;
    state.flushed += 1;
    return writeNow(entry, reason);
  }

  function schedule(entry = {}, options = {}) {
    if (!entry?.state?.workspaces?.length) return null;
    state.pending = entry;
    state.deferred += 1;
    state.lastReason = options.reason || 'deferred';
    clearScheduled();
    const delayMs = Math.max(0, Number(options.delayMs ?? 180));
    const idleTimeout = Math.max(0, Number(options.idleTimeout ?? 1600));
    const run = () => {
      state.timer = null;
      const idleRun = () => {
        state.idle = null;
        flush(options.reason || 'idle');
      };
      if (typeof win?.requestIdleCallback === 'function') state.idle = win.requestIdleCallback(idleRun, { timeout: idleTimeout });
      else state.timer = win?.setTimeout?.(idleRun, Math.max(60, Math.min(450, idleTimeout))) || null;
    };
    state.timer = win?.setTimeout?.(run, delayMs) || null;
    return entry.state;
  }

  function cancel() {
    state.pending = null;
    clearScheduled();
  }

  function report() {
    return {
      pending: Boolean(state.pending),
      writes: state.writes,
      deferred: state.deferred,
      flushed: state.flushed,
      lastReason: state.lastReason
    };
  }

  return { schedule, flush, cancel, report };
}


export function commitStateWithPersistence({ nextState, mode = 'push', options = {}, sourceState = {}, preserveCapturedViewScroll, latestStateRef, setState, runtime, scheduler, persistenceOwnership } = {}) {
  const withScroll = preserveCapturedViewScroll?.(nextState, sourceState) || nextState;
  const persistence = runtime?.().persistence || {};
  const canonicalState = canonicalProductState(withScroll, persistence, 'commit');
  if (latestStateRef) latestStateRef.current = canonicalState;
  setState?.(canonicalState);
  const persistenceEnv = persistenceWriteEnvForOwnership(persistenceOwnership, { mode, preserveUrl: Boolean(options.preserveUrl) });
  if (!canonicalState?.workspaces?.length) {
    scheduler?.cancel?.();
    if (options.allowEmptySemanticState) persistence.writeState?.(canonicalState, persistenceEnv);
    else persistence.clearState?.(persistenceEnv);
    return canonicalState;
  }
  if (options.deferPersistence) {
    scheduler?.schedule?.({
      state: canonicalState,
      mode,
      runtime,
      // View/presentation changes must not repeatedly serialize multi-repository
      // material or rewrite durable local recovery. The latest full material
      // checkpoint remains authoritative until a material mutation commits.
      writeEnv: {
        durableLocalPolicy: 'preserve-existing',
        sessionCachePolicy: 'preserve-existing',
        routeMaterialPolicy: 'omit'
      }
    }, {
      reason: options.persistenceReason || 'view-state',
      delayMs: options.persistenceDelayMs,
      idleTimeout: options.persistenceIdleTimeout
    });
    return canonicalState;
  }
  scheduler?.cancel?.();
  persistence.writeState?.(canonicalState, persistenceEnv);
  return canonicalState;
}
