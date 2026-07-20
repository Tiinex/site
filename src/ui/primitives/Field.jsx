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
