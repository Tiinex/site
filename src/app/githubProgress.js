export function shouldCommitGithubProgress(progress = {}, state = {}) {
  const now = Date.now();
  const phase = String(progress.phase || 'source-materialization');
  const label = String(progress.label || '');
  const percent = Number(progress.percent ?? -1);
  const percentDelta = Math.abs(percent - Number(state.percent ?? -1));
  const terminal = progress.active === false || percent >= 100;
  const changedPhase = phase !== state.phase;
  const changedEnough = percent >= 0 && percentDelta >= 5;
  const waited = now - Number(state.at || 0) >= 350;
  if (!terminal && !changedPhase && !changedEnough && !waited) return false;
  state.at = now;
  state.phase = phase;
  state.percent = percent;
  state.label = label;
  return true;
}

export function yieldForVisibleSourceProgress() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve();
    const raf = window.requestAnimationFrame || ((fn) => window.setTimeout(fn, 16));
    raf(() => window.setTimeout(resolve, 0));
  });
}
