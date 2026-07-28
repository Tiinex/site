import React from 'react';
import { Badge } from '../../ui/primitives/Badge.jsx';
import { Button } from '../../ui/primitives/Button.jsx';
import { Modal } from '../../ui/primitives/Modal.jsx';

export function GovernanceBoundaryDialog({ source, boundary, documents = [], onDismiss }) {
  const status = boundary?.status || 'unknown';
  const repo = boundary?.scope?.repo || source?.repo || source?.config?.repo || source?.label || 'source';
  const docs = Array.isArray(documents) ? documents : [];
  return (
    <Modal title={`Governance · ${source?.label || repo || 'source'}`} onDismiss={onDismiss} className="tx-dialog-governance-boundary">
      <div className="tx-record-detail tx-governance-detail">
        <div className="tx-card-badges">
          <Badge>{status}</Badge>
          {boundary?.policy?.kind ? <Badge>{boundary.policy.kind}</Badge> : null}
          {boundary?.notice?.status === 'found' ? <Badge>{boundary.notice.kind || 'NOTICE'}</Badge> : null}
          <Badge>{repo}</Badge>
        </div>
        <p className="tx-muted">Governance is read from explicit source-root files only. README and validation notes are not license/policy fallback material.</p>
        {boundary?.note ? <p>{boundary.note}</p> : null}
        <dl className="tx-record-meta">
          <div><dt>Scope</dt><dd>{boundary?.scope?.kind || 'source'} · {repo}{boundary?.scope?.ref ? ` @ ${boundary.scope.ref}` : ''}</dd></div>
          {boundary?.policy?.path ? <div><dt>Policy/license</dt><dd>{boundary.policy.path}</dd></div> : null}
          {boundary?.notice?.path ? <div><dt>Notice</dt><dd>{boundary.notice.path}</dd></div> : null}
          <div><dt>Root checked</dt><dd>{boundary?.rootChecked ? 'yes' : 'not in this bounded materialization'}</dd></div>
        </dl>
        {docs.length ? docs.map((doc) => <GovernanceDocument key={doc.kind || doc.path || doc.url} doc={doc} />) : <p className="tx-muted">No readable governance file content is available in this session cache.</p>}
        <div className="tx-dialog-actions"><Button variant="ghost" onClick={onDismiss}>Close</Button></div>
      </div>
    </Modal>
  );
}

function GovernanceDocument({ doc }) {
  return (
    <section className="tx-governance-document">
      <div className="tx-card-badges">
        <Badge>{doc.kind || doc.path || 'governance'}</Badge>
        <Badge>{doc.cacheState || (doc.markdown ? 'cache' : 'metadata-only')}</Badge>
      </div>
      {doc.url ? <p className="tx-muted"><a href={doc.url} target="_blank" rel="noopener noreferrer">Open source file</a></p> : null}
      {doc.markdown ? <pre className="tx-record-markdown-preview tx-full-markdown-preview">{doc.markdown}</pre> : <p className="tx-muted">Content is not available in this route/session cache. Source path and boundary are preserved.</p>}
    </section>
  );
}
