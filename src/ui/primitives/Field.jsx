import React from 'react';

export function TextField({ id, label, value, onChange, error = '', ...props }) {
  return (
    <label className="tx-field" htmlFor={id}>
      <span>{label}</span>
      <input id={id} value={value} onChange={(event) => onChange(event.target.value)} aria-invalid={Boolean(error)} {...props} />
      {error ? <small role="alert">{error}</small> : null}
    </label>
  );
}

export function TextareaField({ id, label, value, onChange, error = '', ...props }) {
  return (
    <label className="tx-textarea-field" htmlFor={id}>
      <span>{label}</span>
      <textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} aria-invalid={Boolean(error)} {...props} />
      {error ? <small role="alert">{error}</small> : null}
    </label>
  );
}
