import React from 'react';

const LOGO_SRC = `${import.meta.env.BASE_URL}assets/tiinex-logo-white-transparent.png`;

export function StartupStage({ presentation = null, runtimeId = '', sourceBoundary = '' }) {
  if (!presentation) return null;
  return (
    <main
      className="tx-react-runtime tx-uc001-shell tx-startup-resolving-shell"
      data-runtime={runtimeId}
      data-source-boundary={sourceBoundary}
      data-startup-presentation={presentation.kind || 'startup-resolving'}
    >
      <section className="tx-startup-stage" role="status" aria-live="polite" aria-label="Opening Tiinex workspace">
        <img className="tx-startup-logo" src={LOGO_SRC} alt="" />
        <p>{presentation.message || 'Opening workspace'}</p>
        <span className="tx-startup-progress" aria-hidden="true"><i /><i /><i /></span>
      </section>
    </main>
  );
}
