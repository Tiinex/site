import React, { useEffect, useMemo, useState } from 'react';
import { Badge } from '../../ui/primitives/Badge.jsx';
import { Button } from '../../ui/primitives/Button.jsx';
import { Modal } from '../../ui/primitives/Modal.jsx';

export const CANONICAL_REFERENCE_SELECTION_ROLE = 'reference-target';

export function CanonicalReferenceDialog({ record, action, workspaceId = '', targets = [], selectionSession = null, selectionResult = null, onBeginSelection, onSelectionConsumed, onDismiss, onCreate }) {
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const ownerKey = useMemo(() => `reference:${String(action?.definitionKey || action?.id || '')}:${String(workspaceId)}:${String(record?.id || '')}`, [action?.definitionKey, action?.id, workspaceId, record?.id]);
  const enabled = useMemo(() => (Array.isArray(targets) ? targets : []).filter((item) => item?.enabled), [targets]);
  useEffect(() => {
    if (selectionResult?.ok && selectionResult.ownerKey === ownerKey && selectionResult.role === CANONICAL_REFERENCE_SELECTION_ROLE) {
      setSelected(selectionResult.candidate); setError(''); onSelectionConsumed?.(selectionResult.sessionId);
    }
  }, [selectionResult, ownerKey, onSelectionConsumed]);
  if (selectionSession?.ok && selectionSession.ownerKey === ownerKey) return null;
  function beginSelection() {
    if (!enabled.length) return setError('No qualified Reference target is currently available.');
    const started = onBeginSelection?.({
      role: CANONICAL_REFERENCE_SELECTION_ROLE,
      ownerKey,
      originWorkspaceId: workspaceId,
      title: 'Choose Reference target',
      guidance: 'Choose one qualified Task in the visible workspace surface. Reference remains a typed non-parent relation; Parent and provenance do not change.',
      presentation: { verse: 'feed' },
      candidates: enabled
    });
    if (started?.ok === false) setError(started.notice || 'Reference target selection could not start.');
  }
  async function submit(event) {
    event.preventDefault();
    if (!selected) return setError('Choose one qualified Reference target.');
    setError('');
    const result = await onCreate?.(record, action, selected);
    if (result?.ok === false) setError(result.notice || 'Reference Relation could not be created.');
  }
  return (
    <Modal title={action?.label || 'Reference'} onDismiss={onDismiss} className="tx-dialog-reference-review">
      <form className="tx-form" onSubmit={submit} data-form="canonical-reference-form">
        <p className="tx-muted">Create one browser-local Relation artifact from <strong>{record?.title || 'the selected Topic'}</strong> to a distinct qualified Task. Target selection happens in the workspace surface so spatial/source context remains visible.</p>
        <div className="tx-dialog-actions tx-reference-picker-actions">
          <Button type="button" variant="primary" icon="reference" onClick={beginSelection}>{selected ? 'Change target in workspace' : 'Choose target in workspace'}</Button>
        </div>
        {selected ? (
          <div className="tx-record-action-result" data-reference-review="true">
            <div className="tx-card-badges"><Badge>Relation</Badge><Badge>non-parent</Badge><Badge>local draft</Badge></div>
            <p><strong>Subject:</strong> {record?.title || record?.path || 'Topic'}</p>
            <p><strong>Target:</strong> {selected.title || selected.path || 'Task'}</p>
            {selected.path ? <p><strong>Target path:</strong> <code>{selected.path}</code></p> : null}
            <p className="tx-muted">The Relation preserves subject/object identity and explicit non-Parent meaning. Neither participant is mutated and no truth, evidence, authority, dependency, or Parent ancestry is implied.</p>
          </div>
        ) : <p className="tx-muted">No target selected yet.</p>}
        {error ? <p className="tx-form-error" role="alert">{error}</p> : null}
        <div className="tx-dialog-actions">
          <Button type="button" variant="ghost" onClick={onDismiss}>Cancel</Button>
          <Button type="submit" variant="primary" icon="reference" disabled={!selected}>Create local Relation</Button>
        </div>
      </form>
    </Modal>
  );
}
