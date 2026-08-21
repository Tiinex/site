import { useState } from 'react';
import { createWorkspaceSelectionSession, workspaceSelectionResult } from './workspaceSelectionSession.js';

export function useWorkspaceSelectionProductController({ setNotice = () => {}, captureOriginContext = null, restoreOriginContext = null } = {}) {
  const [session, setSession] = useState(null);
  const [result, setResult] = useState(null);
  function begin(input = {}) {
    const created = createWorkspaceSelectionSession({ ...input, originContext: input.originContext ?? captureOriginContext?.(input) ?? null });
    if (!created.ok) { setNotice('Workspace selection could not start.'); return created; }
    setResult(null); setSession(created); setNotice(created.title); return created;
  }
  function choose(candidate = {}) {
    const selected = workspaceSelectionResult(session, candidate);
    if (!selected.ok) { setNotice('That candidate is not qualified for this selection.'); return selected; }
    const completed = session; setSession(null); restoreOriginContext?.(completed?.originContext, { reason: 'choose', session: completed, result: selected }); setResult(selected); setNotice('Selection applied to the pending draft.'); return selected;
  }
  function cancel() { const completed = session; setSession(null); restoreOriginContext?.(completed?.originContext, { reason: 'cancel', session: completed }); setNotice('Selection cancelled; draft preserved.'); }
  function consume(sessionId = '') { setResult((current) => current?.sessionId === sessionId ? null : current); }
  function reset() { const completed = session; setSession(null); setResult(null); if (completed) restoreOriginContext?.(completed.originContext, { reason: 'reset', session: completed }); }
  return Object.freeze({ session, result, begin, choose, cancel, consume, reset });
}
