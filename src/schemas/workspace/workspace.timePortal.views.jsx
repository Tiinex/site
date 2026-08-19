import React, { useState } from 'react';
import { Button } from '../../ui/primitives/Button.jsx';
import { Modal } from '../../ui/primitives/Modal.jsx';
import { timePortalIntentLabel } from '../../workspaces/workspace.timePortal.js';

export function TimePortalResolveDialog({ timePortal = null, sources = [], busy = false, error = '', onResolve, onDismiss }) {
  const initialSourceId = String(timePortal?.sourceId || (sources.length === 1 ? sources[0]?.id : '') || '');
  const [sourceId, setSourceId] = useState(initialSourceId);
  const [snapshotInput, setSnapshotInput] = useState(String(timePortal?.snapshotInput || timePortal?.snapshot?.inputTarget || ''));
  function submit(event) {
    event.preventDefault();
    onResolve?.({ sourceId, snapshotInput });
  }
  return (
    <Modal title="Resolve source snapshot" onDismiss={onDismiss} initialFocus="timePortalSnapshotInput" className="tx-dialog-time-portal-resolve">
      <form className="tx-form tx-time-portal-resolve-form" onSubmit={submit}>
        <p><strong>TIME PORTAL</strong></p>
        <p className="tx-muted">Time intent is not a commit selector. Paste an explicit GitHub commit/tree URL, exact SHA, branch, or tag. Named refs resolve once to an immutable commit before review.</p>
        {sources.length > 1 ? (
          <label className="tx-select-field"><span>Configured source</span><select value={sourceId} onChange={(event) => setSourceId(event.target.value)}><option value="">Choose source…</option>{sources.map((source) => <option key={source.id} value={source.id}>{source.label} · {source.repository}</option>)}</select></label>
        ) : sources.length === 1 ? <p className="tx-muted">Source: <strong>{sources[0].label}</strong> · {sources[0].repository}</p> : <p className="tx-muted">No GitHub repository source is configured for this workspace.</p>}
        <label className="tx-field"><span>GitHub snapshot target</span><input id="timePortalSnapshotInput" value={snapshotInput} onChange={(event) => setSnapshotInput(event.target.value)} placeholder="https://github.com/Tiinex/docs/tree/&lt;sha&gt; or explicit ref" autoComplete="off" /></label>
        <p className="tx-muted">Intent: {timePortalIntentLabel(timePortal)}</p>
        {error ? <p role="alert" className="tx-error">{error}</p> : null}
        <div className="tx-dialog-actions"><Button type="button" variant="ghost" onClick={onDismiss}>Cancel</Button><Button type="submit" variant="primary" disabled={busy || !sources.length || !snapshotInput.trim()}>{busy ? 'Resolving…' : 'Resolve source snapshot'}</Button></div>
      </form>
    </Modal>
  );
}

export function TimePortalCompactMarker({ timePortal = null }) {
  const exact = String(timePortal?.snapshot?.materializedCommit || '').trim();
  const exactLabel = exact ? `Historical snapshot ${exact}` : 'Historical snapshot';
  const shortCommit = exact ? exact.slice(0, 10) : 'snapshot';
  return (
    <div className="tx-time-portal-compact-marker" role="status" aria-label={exactLabel} title={exactLabel}>
      <strong>Historical</strong>
      <code>{shortCommit}</code>
    </div>
  );
}

export function TimePortalBanner({ timePortal = null, readModel = null, onLoadSnapshot, onReturnLatest }) {
  if (!timePortal) return null;
  const snapshot = timePortal.snapshot || null;
  const exact = snapshot?.materializedCommit || '';
  const state = snapshot ? (readModel?.state || 'not-loaded') : 'unresolved';
  const title = snapshot ? 'Historical snapshot selected' : 'Time Portal intent unresolved';
  return (
    <section className="tx-time-portal-banner" role="status" aria-label="Time Portal historical review" data-time-portal-state={state}>
      <div><strong>{title}</strong><span>{timePortalIntentLabel(timePortal)}</span></div>
      {snapshot ? <div className="tx-time-portal-identity"><span>Source {snapshot.repository}</span><code title={exact}>{exact}</code><span>{readModel?.cacheState === 'cache' ? 'Loaded from cached snapshot bytes; source was not revalidated this session' : state === 'loaded' ? 'Loaded read-only snapshot' : state === 'degraded' ? 'Historical snapshot loaded with diagnostics' : state === 'unavailable' ? 'Snapshot unavailable' : 'Snapshot bytes not loaded in this session'}</span></div> : <p className="tx-muted">Begin/End expresses review intent only. Resolve an explicit source snapshot before historical material is shown.</p>}
      <div className="tx-time-portal-actions">{snapshot && (!readModel || ['unavailable','failed'].includes(readModel.state)) ? <Button type="button" variant="primary" onClick={onLoadSnapshot}>Load snapshot</Button> : null}<Button type="button" variant="ghost" onClick={onReturnLatest}>Return to latest</Button></div>
    </section>
  );
}
