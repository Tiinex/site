import React from 'react';
import { schemaRegistry } from '../schemas/registry.js';
import { Button } from '../ui/primitives/Button.jsx';
import { Badge } from '../ui/primitives/Badge.jsx';
import { Modal } from '../ui/primitives/Modal.jsx';

const LOGO_SRC = `${import.meta.env.BASE_URL}assets/tiinex-logo-white-transparent.png`;

export function GlobalDock({ hasWorkspace, workspaceCount, pagerVisible, onPreviousWorkspace, onNextWorkspace, onCreate, onHome, onShare, onHelp, onMultiverse }) {
  const showPager = Boolean(hasWorkspace && pagerVisible);
  return (
    <nav
      className="tx-global-dock tx-centered-dock"
      aria-label="Global workspace actions"
      data-workspace-count={workspaceCount}
      data-overflow-pager={showPager ? 'visible' : 'hidden'}
    >
      {showPager ? <Button shape="round" icon="previous" aria-label="Previous workspace" onClick={onPreviousWorkspace} /> : null}
      <div className="tx-centered-dock-core tx-content-fit-dock">
        <div className="tx-dock-left">
          <Button icon="multiverse" variant="nav" aria-label="Change multiverse" title="Change multiverse" onClick={onMultiverse} />
          <Button icon="create" variant="primary" onClick={onCreate}>Create</Button>
        </div>
        <button type="button" className="tx-dock-logo tx-dock-logo-large" aria-label="Go home" onClick={onHome}>
          <img src={LOGO_SRC} alt="" aria-hidden="true" />
        </button>
        <div className="tx-dock-right">
          <Button icon="shareNodes" variant="nav" onClick={onShare}>Share session</Button>
          <Button icon="help" variant="nav" aria-label="Help" onClick={onHelp} />
        </div>
      </div>
      {showPager ? <Button shape="round" icon="next" aria-label="Next workspace" onClick={onNextWorkspace} /> : null}
    </nav>
  );
}

export function EmptyStage({ workspaceConfig }) {
  return (
    <section className="tx-empty-stage tx-old-empty-stage">
      <div className="tx-empty-stage-mark">Tiinex</div>
      <p>{workspaceConfig.emptyCopy}</p>
    </section>
  );
}

export function HelpDialog({ workspaceConfig, onDismiss }) {
  return (
    <Modal title="Help" onDismiss={onDismiss}>
      <div className="tx-help-dialog">
        <p>{workspaceConfig.helpCopy}</p>
        <p>Schema modules: Tiinex/docs canonical core with Tiinex/site viewer extensions.</p>
        <div className="tx-card-badges">
          <Badge>canonical-core: Tiinex/docs</Badge>
          <Badge>viewer-extension: Tiinex/site</Badge>
          <Badge>{schemaRegistry.modules.length} schema modules</Badge>
        </div>
      </div>
    </Modal>
  );
}
