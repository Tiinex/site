import React, { useEffect, useRef } from 'react';
import { Button } from './Button.jsx';

export function Modal({ title, children, onDismiss, initialFocus, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const node = initialFocus ? ref.current?.querySelector(`#${CSS.escape(initialFocus)}`) : ref.current?.querySelector('button, input, textarea, select, [tabindex]');
    node?.focus?.();
    const onKey = (event) => {
      if (event.key === 'Escape') onDismiss?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [initialFocus, onDismiss]);

  return (
    <div className="tx-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onDismiss?.(); }}>
      <section className={`tx-dialog ${className}`.trim()} role="dialog" aria-modal="true" aria-labelledby="tx-dialog-title" ref={ref}>
        <header className="tx-dialog-head">
          <h2 id="tx-dialog-title">{title}</h2>
          <Button variant="ghost" icon="close" aria-label="Close dialog" onClick={onDismiss} />
        </header>
        <div className="tx-dialog-body">{children}</div>
      </section>
    </div>
  );
}
