import React, { useState } from 'react';
import { Badge } from '../../ui/primitives/Badge.jsx';
import { Button } from '../../ui/primitives/Button.jsx';
import { Modal } from '../../ui/primitives/Modal.jsx';
import { createContinuationDraft, listContinuationTargets } from '../../transitions/record.transitions.js';

export function ContinuationDialog({ record, schemaRegistry, transitionDefinition = null, workspaceRecords = [], onDismiss, onCreateTransition }) {
  const transitionTarget = transitionDefinition ? targetFromTransitionDefinition(transitionDefinition) : null;
  const targets = transitionTarget ? [transitionTarget] : listContinuationTargets(schemaRegistry);
  const [selected, setSelected] = useState(targets[0]?.id || 'tiinex.task.v1');
  const [title, setTitle] = useState(`Continue · ${record?.title || 'artifact'}`.slice(0, 96));
  const [summary, setSummary] = useState(`Continuation leaf drafted from ${record?.title || 'this artifact'}.`.slice(0, 280));
  const target = targets.find((item) => item.id === selected) || targets[0] || { id: 'tiinex.task.v1', label: 'Task', summary: 'Task continuation.' };
  const draft = createContinuationDraft(record, target, { title, summary, transitionDefinitionId: transitionDefinition?.id || '', intent: transitionDefinition?.intent || 'continue' }, { existingRecords: workspaceRecords });
  const lockedTarget = Boolean(transitionDefinition);
  const dialogTitle = transitionDefinition?.label || 'Create continuation leaf';
  return (
    <Modal title={dialogTitle} onDismiss={onDismiss} initialFocus="continuationTitle">
      <div className="tx-continuation-dialog tx-continuation-dialog-compact">
        {!lockedTarget && targets.length > 1 ? <ContinuationTargetPicker targets={targets} selected={selected} onSelect={setSelected} /> : null}
        <label className="tx-field"><span>Title</span><input id="continuationTitle" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={96} /></label>
        <label className="tx-field"><span>Summary</span><textarea value={summary} onChange={(event) => setSummary(event.target.value)} rows={3} maxLength={280} /></label>
        <TransitionValidationNotice validation={draft.validation} />
        <details className="tx-continuation-meta">
          <summary>Generated details</summary>
          <div className="tx-card-badges">
            <Badge>{draft.schema}</Badge><Badge>{transitionDefinition?.presentation?.group || 'Continue'}</Badge><Badge>{target.id}</Badge><Badge>{draft.transition.parentBoundary}</Badge>
          </div>
          <p className="tx-muted">Creates a browser-local {target.label} draft from the selected record. Source-backed parent material stays read-only and no source provenance is inferred.</p>
          <details className="tx-continuation-preview"><summary>Preview generated Markdown</summary><pre className="tx-record-markdown-preview">{draft.markdown}</pre></details>
        </details>
        <div className="tx-dialog-actions">
          <Button variant="ghost" onClick={onDismiss}>Cancel</Button>
          <Button variant="primary" icon={transitionDefinition?.presentation?.icon || 'continue'} onClick={() => onCreateTransition?.(record, draft)}>Create local {target.label.toLowerCase()}</Button>
        </div>
      </div>
    </Modal>
  );
}

function ContinuationTargetPicker({ targets = [], selected = '', onSelect }) {
  return (
    <div className="tx-continuation-target-grid" role="listbox" aria-label="Continuation target schema">
      {targets.map((item) => <button key={item.id} type="button" className={`tx-continuation-target ${selected === item.id ? 'tx-active' : ''}`} aria-selected={selected === item.id} onClick={() => onSelect?.(item.id)}><strong>{item.label}</strong><small>{item.summary}</small></button>)}
    </div>
  );
}

export function TransitionValidationNotice({ validation }) {
  if (!validation) return null;
  const severe = (validation.findings || []).filter((finding) => finding.severity === 'error' || finding.severity === 'warning').slice(0, 3);
  if (validation.ok && severe.length === 0) return null;
  return (
    <div className={`tx-transition-validation tx-transition-validation-${validation.status || (validation.ok ? 'valid' : 'invalid')}`}>
      <strong>{validation.ok ? 'Transition conformance passed' : 'Transition conformance needs attention'}</strong>
      <span>{validation.counts?.error || 0} errors · {validation.counts?.warning || 0} warnings · local draft boundary</span>
      {severe.length ? <ul>{severe.map((finding) => <li key={finding.code}>{finding.message}</li>)}</ul> : null}
    </div>
  );
}

function targetFromTransitionDefinition(definition = {}) {
  const resultSchema = definition.resultSchema || 'tiinex.task.v1';
  return {
    id: resultSchema,
    label: definition.shortLabel || labelFromSchemaId(resultSchema),
    summary: definition.label || 'Schema-backed continuation.',
    contract: definition.id || '',
    transitionDefinitionId: definition.id || '',
    intent: definition.intent || 'continue',
    creationContract: `creation:continue-from-record:${resultSchema}`,
    creationStatus: 'implemented',
    boundary: 'Transition definition creates a browser-local draft and does not mutate source material.'
  };
}

function labelFromSchemaId(id = '') {
  const tail = String(id || '').split('.').filter(Boolean).slice(-2, -1)[0] || String(id || 'leaf');
  return tail.charAt(0).toUpperCase() + tail.slice(1);
}
