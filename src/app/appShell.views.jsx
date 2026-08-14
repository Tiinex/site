import React from 'react';
import { Button } from '../ui/primitives/Button.jsx';
import { Modal } from '../ui/primitives/Modal.jsx';
import { runtime } from './runtimeState.js';

const LOGO_SRC = `${import.meta.env.BASE_URL}assets/tiinex-logo-white-transparent.png`;
let emptyStageVisitCursor = 0;

export function GlobalDock({ hasWorkspace, workspaceCount, pagerVisible, previousWorkspaceEnabled = true, nextWorkspaceEnabled = true, onPreviousWorkspace, onNextWorkspace, onCreate, homeHref, onShare, onHelp }) {
  const showPager = Boolean(hasWorkspace && pagerVisible);
  return (
    <nav
      className={`tx-top-dock tx-dock-shell-row ${showPager ? 'tx-top-dock-paged' : 'tx-top-dock-fit'}`}
      aria-label="Global actions"
      data-workspace-count={workspaceCount}
      data-overflow-pager={showPager ? 'visible' : 'hidden'}
    >
      {showPager ? <Button shape="round" icon="previous" className="tx-dock-pager-button" aria-label="Previous workspace" disabled={!previousWorkspaceEnabled} onClick={onPreviousWorkspace} /> : null}
      <span className="tx-dock-core tx-centered-dock-core tx-content-fit-dock tx-poc-brand-first-dock">
        <a className="tx-logo-command tx-logo-home tx-dock-logo-large" data-home href={homeHref || '/'} aria-label="Tiinex home">
          <img src={LOGO_SRC} alt="" />
        </a>
        <span className="tx-dock-side tx-dock-actions tx-dock-right">
          <Button icon="create" variant={hasWorkspace ? 'primary' : 'nav'} className="tx-dock-action-button tx-dock-create-button" onClick={onCreate}>Create</Button>
          <Button icon="shareNodes" variant="nav" className="tx-dock-action-button tx-dock-share-button" onClick={onShare}>Share</Button>
          <Button icon="help" variant="nav" className="tx-dock-icon-button" aria-label="Help" onClick={onHelp} />
        </span>
      </span>
      {showPager ? <Button shape="round" icon="next" className="tx-dock-pager-button" aria-label="Next workspace" disabled={!nextWorkspaceEnabled} onClick={onNextWorkspace} /> : null}
    </nav>
  );
}

export function EmptyStage({ workspaceConfig }) {
  const [subtitleCursor] = React.useState(() => emptyStageVisitCursor++);
  const subtitle = runtime().config?.emptyStageSubtitle?.(workspaceConfig, subtitleCursor) || 'Every handoff starts somewhere';
  return (
    <section className="tx-empty-stage tx-old-empty-stage tx-uc001-empty-start tx-m1-product-empty-stage" aria-label="No workspace loaded">
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
      </div>
    </Modal>
  );
}
