import React from 'react';
import { schemaRegistry } from '../schemas/registry.js';
import { Button } from '../ui/primitives/Button.jsx';
import { Badge } from '../ui/primitives/Badge.jsx';
import { Modal } from '../ui/primitives/Modal.jsx';
import { runtime } from './runtimeState.js';

const LOGO_SRC = `${import.meta.env.BASE_URL}assets/tiinex-logo-white-transparent.png`;

export function GlobalDock({ hasWorkspace, workspaceCount, pagerVisible, onPreviousWorkspace, onNextWorkspace, onCreate, onHome, onShare, onHelp, onMultiverse }) {
  const showPager = Boolean(hasWorkspace && pagerVisible);
  return (
    <nav
      className={`tx-top-dock tx-dock-shell-row ${showPager ? 'tx-top-dock-paged' : 'tx-top-dock-fit'}`}
      aria-label="Global actions"
      data-workspace-count={workspaceCount}
      data-overflow-pager={showPager ? 'visible' : 'hidden'}
    >
      {showPager ? <Button shape="round" icon="previous" className="tx-dock-pager-button" aria-label="Previous workspace" onClick={onPreviousWorkspace} /> : null}
      <span className="tx-dock-core tx-centered-dock-core tx-content-fit-dock">
        <span className="tx-dock-side tx-dock-left">
          <Button icon="multiverse" variant="nav" className="tx-dock-icon-button" aria-label="Change multiverse" title="Change multiverse" onClick={onMultiverse} />
          <Button icon="create" variant="primary" className="tx-dock-action-button tx-dock-create-button" onClick={onCreate}>Create</Button>
        </span>
        <button className="tx-logo-command tx-logo-home tx-dock-logo-large" data-home type="button" onClick={onHome} aria-label="Tiinex home">
          <img src={LOGO_SRC} alt="" />
        </button>
        <span className="tx-dock-side tx-dock-right">
          <Button icon="shareNodes" variant="nav" className="tx-dock-action-button tx-dock-share-button" onClick={onShare}>Share session</Button>
          <Button icon="help" variant="nav" className="tx-dock-icon-button" aria-label="Help" onClick={onHelp} />
        </span>
      </span>
      {showPager ? <Button shape="round" icon="next" className="tx-dock-pager-button" aria-label="Next workspace" onClick={onNextWorkspace} /> : null}
    </nav>
  );
}

export function EmptyStage({ workspaceConfig }) {
  const subtitle = runtime().config?.emptyStageSubtitle?.(workspaceConfig, 0) || 'Every handoff starts somewhere';
  return (
    <section className="tx-empty-stage tx-old-empty-stage tx-uc001-empty-start" aria-label="No workspace loaded">
      <p>{subtitle}</p>
    </section>
  );
}

export function HelpDialog({ workspaceConfig, onDismiss }) {
  const help = workspaceConfig?.help || [];
  return (
    <Modal title="Help" onDismiss={onDismiss}>
      <div className="tx-help-stack">
        {help.length ? help.map((item) => (
          <details key={item.question} open={item.question === 'What is this view?'}>
            <summary>{item.question}</summary>
            <p>{item.body}</p>
          </details>
        )) : <p className="tx-muted">No workspace help is configured.</p>}
        <div className="tx-schema-origin-note">
          <Badge>canonical-core: Tiinex/docs</Badge>
          <Badge>viewer-extension: Tiinex/site</Badge>
          <Badge>{schemaRegistry.modules.length} schema modules</Badge>
        </div>
      </div>
    </Modal>
  );
}
