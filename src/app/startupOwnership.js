export function createStartupOwnershipGate() {
  let generation = 0;
  return {
    claim() { generation += 1; return generation; },
    invalidate() { generation += 1; return generation; },
    isCurrent(token) { return token === generation; },
    current() { return generation; }
  };
}

export async function runOwnedWorkspaceStartupTransition({
  gate,
  runTransition,
  transitionOptions = {},
  setPhase = null,
  setNotice = null
} = {}) {
  if (!gate || typeof gate.claim !== 'function' || typeof gate.isCurrent !== 'function') {
    throw new Error('startup.ownership-gate-required');
  }
  if (typeof runTransition !== 'function') throw new Error('startup.transition-runner-required');
  const token = gate.claim();
  const isCurrentOwner = () => gate.isCurrent(token);
  setPhase?.('resolving');
  const sourceCommit = transitionOptions.commit;
  const sourceMaterialize = transitionOptions.materializeSource;
  const sourceDiagnostics = transitionOptions.setDiagnostics;
  const result = await runTransition(Object.assign({}, transitionOptions, {
    commit: (...args) => isCurrentOwner() ? sourceCommit?.(...args) : null,
    setDiagnostics: (...args) => isCurrentOwner() ? sourceDiagnostics?.(...args) : null,
    materializeSource: async (input, options = {}) => {
      if (!isCurrentOwner()) return { ok: false, skipped: 'stale-startup-owner' };
      return sourceMaterialize?.(input, Object.assign({}, options, { isCurrentOwner }));
    }
  }));
  if (!isCurrentOwner()) return Object.assign({}, result, { stale: true, ownershipToken: token });
  setPhase?.(result?.ok ? 'resolved' : 'failed');
  if (!result?.ok && result?.message) setNotice?.(result.message);
  return Object.assign({}, result, { stale: false, ownershipToken: token });
}
