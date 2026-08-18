import React, { useState } from 'react';
import { Button } from '../../ui/primitives/Button.jsx';
import { Modal } from '../../ui/primitives/Modal.jsx';
import { TextareaField, TextField } from '../../ui/primitives/Field.jsx';

const FIELDS = Object.freeze([
  ['Summary', 'Task title', false],
  ['Objective', 'Objective', true],
  ['Done Criteria', 'Done Criteria', true],
  ['Scope', 'Scope', true],
  ['Dependencies', 'Dependencies', true]
]);

export function CanonicalTaskCreateDialog({ record, action, onDismiss, onCreate }) {
  const [values, setValues] = useState(() => Object.fromEntries(FIELDS.map(([name]) => [name, ''])));
  const [error, setError] = useState('');
  const required = new Set(action?.authoring?.requiredInputs || []);
  function set(name, value) { setValues((current) => ({ ...current, [name]: value })); }
  async function submit(event) {
    event.preventDefault();
    const missing = [...required].find((name) => values[name] === undefined || String(values[name]).trim() === '');
    if (missing) return setError(`${missing} is required.`);
    setError('');
    const result = await onCreate?.(record, action, values);
    if (result?.ok === false) setError(result.notice || 'Task could not be created.');
  }
  return (
    <Modal title={action?.label || 'Create task'} onDismiss={onDismiss} initialFocus="canonicalTaskSummary">
      <form className="tx-form" onSubmit={submit} data-form="canonical-task-create-form">
        {FIELDS.map(([name, label, multiline], index) => multiline
          ? <TextareaField key={name} id={`canonicalTask-${index}`} label={label} value={values[name]} onChange={(value) => set(name, value)} required={required.has(name)} rows={3} />
          : <TextField key={name} id="canonicalTaskSummary" label={label} value={values[name]} onChange={(value) => set(name, value)} required={required.has(name)} autoFocus />)}
        <p className="tx-muted">Creates one browser-local Task at the established continuation path beneath {record?.title || 'the selected Topic'}. No remote write is performed.</p>
        {error ? <p className="tx-form-error" role="alert">{error}</p> : null}
        <div className="tx-dialog-actions">
          <Button type="button" variant="ghost" onClick={onDismiss}>Cancel</Button>
          <Button type="submit" variant="primary" icon="create">Create local task</Button>
        </div>
      </form>
    </Modal>
  );
}
