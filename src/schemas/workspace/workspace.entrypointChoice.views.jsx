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
        <p>Choose whether this workspace should replace the current replaceable context or join it.</p>
      </div>
      <div className="tx-workspace-entrypoint-choice-actions" role="group" aria-label="Workspace entrypoint choices">
        <div className="tx-workspace-entrypoint-choice-option">
          <Button variant="primary" icon="workspace" onClick={() => onResolve?.('open')}>Open</Button>
          <small><strong>Use this workspace set.</strong> Replace current source/non-draft workspace context while keeping durable unpublished local work protected.</small>
        </div>
        <div className="tx-workspace-entrypoint-choice-option">
          <Button icon="continue" onClick={() => onResolve?.('merge')}>Merge</Button>
          <small><strong>Keep the current workspace context.</strong> Add or update matching incoming workspaces and sources without intentionally duplicating an already-loaded match.</small>
        </div>
      </div>
      <div className="tx-dialog-actions">
        <Button variant="subtle" onClick={onDismiss}>Cancel</Button>
      </div>
    </Modal>
  );
}
