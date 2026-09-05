import React, { useMemo, useState } from 'react';
import { playthingsLineageNodesNewestFirst } from './playthings.lineage.js';

export function PlaythingsLineageDialog({ snapshot = null, onClose, onLocateArtifact, onOpenRecord, onOpenViewerLineage }) {
  const traversal = snapshot?.selectedTraversal || null;
  const [selectedId, setSelectedId] = useState(() => String(snapshot?.selectedRecordId || traversal?.startIds?.[0] || ''));
  const nodes = useMemo(() => playthingsLineageNodesNewestFirst(traversal), [traversal]);
  const selected = nodes.find((node) => String(node.id) === selectedId) || nodes[nodes.length - 1] || null;
  if (!snapshot) return null;
  const status = traversal?.status || {};
  return <div className="tx-playthings-lineage-dialog-backdrop" role="presentation" onPointerDown={(event) => { if (event.target === event.currentTarget) onClose?.(); }} onWheel={(event) => event.stopPropagation()}>
    <section className="tx-playthings-lineage-dialog" role="dialog" aria-modal="true" aria-label={`Lineage Verse for ${snapshot.selectedTitle || 'artifact'}`} onPointerDown={(event) => event.stopPropagation()}>
      <header>
        <div><small>LINEAGE VERSE · LOADED TIINEX LINEAGE</small><strong>{snapshot.selectedTitle || 'Selected lineage'}</strong><span>{snapshot.workspaceTitle || snapshot.workspaceId || 'workspace'} · {status.label || 'loaded path'}</span></div>
        <button type="button" onClick={onClose} aria-label="Close Lineage Verse">×</button>
      </header>
      <div className="tx-playthings-lineage-dialog-body">
        <div className="tx-playthings-lineage-chain" aria-label="Selected Parent lineage">
          {nodes.length ? nodes.map((node, index) => <React.Fragment key={node.id}>
            {index ? <div className={`tx-playthings-lineage-connector is-${edgeStatusBetween(nodes[index - 1], node, traversal?.edges)}`}><span>Parent</span></div> : null}
            <button type="button" className={`tx-playthings-lineage-card ${String(node.id) === String(selected?.id) ? 'is-selected' : ''} ${node.root ? 'is-root' : ''}`} onClick={() => setSelectedId(String(node.id))}>
              <span className="glyph">{node.root ? '◆' : node.schemaId?.includes('schema') ? '▧' : '◇'}</span>
              <span className="copy"><strong>{node.title || 'Untitled artifact'}</strong><small>{node.schemaId || 'unknown schema'}</small><em>{node.path || node.sourceLabel || ''}</em></span>
              <span className="depth">{node.root ? 'ROOT' : `D${node.depth || 0}`}</span>
            </button>
          </React.Fragment>) : <p className="tx-playthings-lineage-empty">No loaded lineage nodes are available for this artifact.</p>}
        </div>
        <aside className="tx-playthings-lineage-inspector">
          {selected ? <>
            <small>SELECTED ARTIFACT</small>
            <h3>{selected.title || 'Untitled artifact'}</h3>
            <code>{selected.schemaId || 'unknown schema'}</code>
            <p>{selected.record?.summary || selected.record?.why || selected.path || 'No summary is available in the loaded material.'}</p>
            <dl><div><dt>Depth</dt><dd>{selected.depth || 0}</dd></div><div><dt>Source</dt><dd>{selected.sourceLabel || selected.sourceBoundary || 'loaded workspace'}</dd></div><div><dt>State</dt><dd>{selected.terminal ? 'terminal' : selected.root ? 'root' : 'lineage artifact'}</dd></div></dl>
            <div className="tx-playthings-lineage-inspector-actions">
              <button type="button" onClick={() => { onLocateArtifact?.(selected.id, snapshot.workspaceId); onClose?.(); }}>Locate in world</button>
              <button type="button" onClick={() => onOpenRecord?.(selected.id, snapshot.workspaceId)}>Artifact Detail</button>
            </div>
          </> : null}
          <div className="tx-playthings-lineage-status"><strong>{status.label || 'Loaded lineage'}</strong><p>{status.message || 'This dialog uses the currently loaded Tiinex Parent lineage and does not infer missing ancestors.'}</p></div>
        </aside>
      </div>
      <footer><span>Close returns to the same Playthings camera, selection and playhead.</span><button type="button" onClick={() => onOpenViewerLineage?.(snapshot.selectedRecordId, snapshot.workspaceId)}>Open full Viewer lineage</button></footer>
    </section>
  </div>;
}

function edgeStatusBetween(parent, child, edges = []) {
  const edge = (edges || []).find((candidate) => (candidate.from === parent.id && candidate.to === child.id) || (candidate.from === child.id && candidate.to === parent.id));
  return edge?.status || 'resolved';
}
