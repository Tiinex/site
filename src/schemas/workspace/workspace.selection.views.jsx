import React from 'react';
import { Button } from '../../ui/primitives/Button.jsx';

export function WorkspaceSelectionSurface({ session = null, onCancel }) {
  return (
    <section className="tx-workspace-selection-surface tx-workspace-selection-banner" data-selection-role={session?.role || ''} aria-label={session?.title || 'Workspace selection'}>
      <div>
        <strong>{session?.title || 'Choose in workspace'}</strong>
        <p>{session?.guidance || 'Choose one caller-qualified candidate from the workspace surface. Existing workspace context remains visible while selection is active.'}</p>
      </div>
      <Button type="button" variant="ghost" icon="close" onClick={onCancel}>Cancel selection</Button>
    </section>
  );
}
