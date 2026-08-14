import React from 'react';
import { Button } from '../../ui/primitives/Button.jsx';
import { Modal } from '../../ui/primitives/Modal.jsx';

export function WorkspaceEntrypointChoiceDialog({ entries = [], onResolve, onDismiss }) {
  const first = entries[0]?.title || entries[0]?.path || 'workspace';
  const more = Math.max(0, entries.length - 1);
  return (
    <Modal title="How should Tiinex use this workspace?" onDismiss={onDismiss} className="tx-workspace-entrypoint-choice-modal">
      <div className="tx-workspace-entrypoint-choice-copy">
        <p className="tx-kicker">Workspace entrypoint</p>
        <p>{more ? `${first} + ${more} more` : first}</p>
        <p>Choose how this workspace entrypoint should affect the current workspace set.</p>
      </div>
      <div className="tx-workspace-entrypoint-choice-actions">
        <Button variant="primary" icon="workspace" onClick={() => onResolve?.('open')}>
          Open
        </Button>
        <Button icon="continue" onClick={() => onResolve?.('merge')}>
          Merge
        </Button>
      </div>
      <div className="tx-dialog-actions">
        <Button variant="subtle" onClick={onDismiss}>Cancel</Button>
      </div>
    </Modal>
  );
}
