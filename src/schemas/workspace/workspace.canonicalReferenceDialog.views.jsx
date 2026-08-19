import React, { useMemo, useState } from 'react';
import { Badge } from '../../ui/primitives/Badge.jsx';
import { Button } from '../../ui/primitives/Button.jsx';
import { TextField } from '../../ui/primitives/Field.jsx';
import { Modal } from '../../ui/primitives/Modal.jsx';

export function CanonicalReferenceDialog({ record, action, targets = [], onDismiss, onCreate }) {
  const [query, setQuery] = useState('');
  const [selectedKey, setSelectedKey] = useState('');
  const [error, setError] = useState('');
  const enabled = useMemo(() => (Array.isArray(targets) ? targets : []).filter((item) => item?.enabled), [targets]);
  const visible = useMemo(() => {
    const needle = String(query || '').trim().toLowerCase();
    if (!needle) return enabled;
    return enabled.filter((item) => [item.title, item.path, item.schemaId, item.workspaceId, item.qualification?.durableTarget].some((value) => String(value || '').toLowerCase().includes(needle)));
  }, [enabled, query]);
  const selected = enabled.find((item) => targetKey(item) === selectedKey) || null;
  async function submit(event) {
    event.preventDefault();
    if (!selected) return setError('Choose one qualified Reference target.');
    setError('');
    const result = await onCreate?.(record, action, selected);
    if (result?.ok === false) setError(result.notice || 'Reference Relation could not be created.');
  }
  return (
    <Modal title={action?.label || 'Reference'} onDismiss={onDismiss} initialFocus="canonicalReferenceSearch">
      <form className="tx-form" onSubmit={submit} data-form="canonical-reference-form">
        <p className="tx-muted">Create one browser-local Relation artifact from <strong>{record?.title || 'the selected Topic'}</strong> to a distinct qualified Task. This records a typed non-parent binding; neither artifact is mutated and no truth, evidence, authority, dependency, or Parent ancestry is implied.</p>
        <TextField id="canonicalReferenceSearch" label="Find Reference target" value={query} onChange={setQuery} placeholder="Search loaded qualified Tasks" autoFocus />
        <div className="tx-workspace-entrypoint-choice-actions" role="radiogroup" aria-label="Qualified Reference targets">
          {visible.map((item) => {
            const key = targetKey(item), chosen = selectedKey === key;
            return (
              <button key={key} type="button" role="radio" aria-checked={chosen} className={`tx-workspace-entrypoint-choice-option ${chosen ? 'is-selected' : ''}`.trim()} onClick={() => { setSelectedKey(key); setError(''); }}>
                <strong>{item.title || item.path || 'Artifact'}</strong>
                <small>{item.schemaId || 'artifact'} · {item.qualification?.kind || 'qualified identity'}{item.workspaceId ? ` · workspace ${item.workspaceId}` : ''}</small>
              </button>
            );
          })}
          {!visible.length ? <p className="tx-muted">No qualified target matches this search. Local targets must be uniquely identifiable in the subject workspace; source-backed targets may remain qualified across loaded workspaces.</p> : null}
        </div>
        {selected ? (
          <div className="tx-record-action-result" data-reference-review="true">
            <div className="tx-card-badges"><Badge>Relation</Badge><Badge>non-parent</Badge><Badge>local draft</Badge></div>
            <p><strong>Subject:</strong> {record?.title || record?.path || 'Topic'}</p>
            <p><strong>Target:</strong> {selected.title || selected.path || 'Task'}</p>
            <p className="tx-muted">The new Relation will durably preserve the local predicate authority, subject/object identities, directionality, defining Transition, generation authority, and an explicit non-Parent boundary.</p>
          </div>
        ) : null}
        {error ? <p className="tx-form-error" role="alert">{error}</p> : null}
        <div className="tx-dialog-actions">
          <Button type="button" variant="ghost" onClick={onDismiss}>Cancel</Button>
          <Button type="submit" variant="primary" icon="reference" disabled={!selected}>Create local Relation</Button>
        </div>
      </form>
    </Modal>
  );
}

function targetKey(item = {}) { return `${String(item.workspaceId || '')}\0${String(item.id || '')}`; }
