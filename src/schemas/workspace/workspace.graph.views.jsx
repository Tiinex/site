import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArtifactGraphScope, graphNodeId } from '../../graph/artifactGraph.model.js';
import { scheduleArtifactGraphProjection } from '../../graph/artifactGraph.project.js';

const LOD_LEVELS = [80, 200, 400];

export function WorkspaceGraphState({ workspace, graphWorkspaces = [], query = '', selectedRecordId = '', onOpenRecord, readOnly = false }) {
  const [scope, setScope] = useState(() => selectedRecordId ? ArtifactGraphScope.focus : ArtifactGraphScope.workspace);
  const [lodIndex, setLodIndex] = useState(1);
  const [projection, setProjection] = useState(null);
  const [error, setError] = useState('');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 20, y: 20 });
  const [hovered, setHovered] = useState('');
  const dragRef = useRef(null);
  const workspaceId = String(workspace?.id || '');
  const focusNodeId = selectedRecordId ? graphNodeId(workspaceId, selectedRecordId) : '';
  const effectiveScope = scope === ArtifactGraphScope.focus && !focusNodeId ? ArtifactGraphScope.workspace : scope;
  const workspaces = useMemo(() => {
    if (readOnly) return workspace ? [workspace] : [];
    const rows = (Array.isArray(graphWorkspaces) ? graphWorkspaces : []).filter((item) => item?.id && item.id !== workspaceId);
    return workspace ? [workspace, ...rows] : rows;
  }, [workspace, graphWorkspaces, workspaceId, readOnly]);
  const maxNodes = LOD_LEVELS[lodIndex];

  useEffect(() => {
    setProjection(null);
    setError('');
    return scheduleArtifactGraphProjection({ workspaces, workspaceId, scope: effectiveScope, focusNodeId, query, maxNodes }, {
      win: typeof window !== 'undefined' ? window : globalThis,
      onReady: setProjection,
      onError: (cause) => setError(String(cause?.message || cause || 'Graph projection failed.'))
    });
  }, [workspaces, workspaceId, effectiveScope, focusNodeId, query, maxNodes]);

  const graph = projection?.graph;
  const layout = projection?.layout;
  const visibleIds = useMemo(() => new Set((graph?.nodes || []).map((node) => node.id)), [graph]);
  const hoveredNeighbors = useMemo(() => {
    if (!hovered || !graph) return new Set();
    const out = new Set([hovered]);
    for (const edge of graph.edges || []) if (edge.from === hovered) out.add(edge.to); else if (edge.to === hovered && edge.from) out.add(edge.from);
    return out;
  }, [hovered, graph]);
  const canMulti = !readOnly && workspaces.length > 1;

  function resetView() { setZoom(1); setPan({ x: 20, y: 20 }); }
  function onWheel(event) {
    event.preventDefault();
    const next = Math.max(0.38, Math.min(2.4, zoom * (event.deltaY > 0 ? 0.9 : 1.1)));
    setZoom(next);
  }
  function beginPan(event) {
    if (event.button !== 0 || event.target.closest?.('[data-graph-node="true"]')) return;
    dragRef.current = { x: event.clientX, y: event.clientY, pan };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }
  function movePan(event) {
    const drag = dragRef.current;
    if (!drag) return;
    setPan({ x: drag.pan.x + event.clientX - drag.x, y: drag.pan.y + event.clientY - drag.y });
  }
  function endPan() { dragRef.current = null; }

  return (
    <div className="tx-graph-verse" aria-label="Node Graph Verse">
      <div className="tx-graph-controls" aria-label="Graph projection controls">
        <div className="tx-segment" aria-label="Graph scope">
          <button type="button" className={effectiveScope === ArtifactGraphScope.workspace ? 'tx-active' : ''} onClick={() => setScope(ArtifactGraphScope.workspace)}>Workspace</button>
          <button type="button" disabled={!focusNodeId} className={effectiveScope === ArtifactGraphScope.focus ? 'tx-active' : ''} onClick={() => setScope(ArtifactGraphScope.focus)}>Focus</button>
          <button type="button" className={effectiveScope === ArtifactGraphScope.frontier ? 'tx-active' : ''} onClick={() => setScope(ArtifactGraphScope.frontier)}>Frontier</button>
          <button type="button" disabled={!canMulti} className={effectiveScope === ArtifactGraphScope.multi ? 'tx-active' : ''} onClick={() => setScope(ArtifactGraphScope.multi)}>Multi-Verse</button>
        </div>
        <div className="tx-graph-lod" aria-label="Graph detail level">
          <button type="button" onClick={() => setLodIndex((value) => Math.max(0, value - 1))} disabled={lodIndex === 0} aria-label="Reduce graph detail">−</button>
          <span>LOD {maxNodes}</span>
          <button type="button" onClick={() => setLodIndex((value) => Math.min(LOD_LEVELS.length - 1, value + 1))} disabled={lodIndex === LOD_LEVELS.length - 1} aria-label="Increase graph detail">+</button>
        </div>
        <button type="button" className="tx-graph-reset" onClick={resetView}>Reset view</button>
      </div>
      <div className="tx-graph-receipt" role="status">
        <span>Derived projection only</span>
        {graph ? <span>{graph.nodes.length} nodes · {graph.edges.length} edges</span> : null}
        {graph?.counts?.crossWorkspaceEdges ? <span>{graph.counts.crossWorkspaceEdges} cross-workspace</span> : null}
        {graph?.counts?.unresolvedEdges ? <span>{graph.counts.unresolvedEdges} unresolved</span> : null}
        {graph?.lod?.truncated ? <strong>Truncated · {graph.lod.omittedNodes} nodes / {graph.lod.omittedEdges} edges omitted</strong> : null}
      </div>
      {graph?.note ? <p className="tx-graph-note">{graph.note}</p> : null}
      {error ? <div className="tx-empty-node-state" role="alert"><p>{error}</p></div> : null}
      {!projection && !error ? <div className="tx-graph-loading" role="status">Preparing deterministic graph projection…</div> : null}
      {projection && !graph?.nodes?.length ? <div className="tx-empty-node-state" role="status"><p>No graph nodes match this scope.</p></div> : null}
      {projection && graph?.nodes?.length ? (
        <div className="tx-graph-canvas-shell" onWheel={onWheel} onPointerDown={beginPan} onPointerMove={movePan} onPointerUp={endPan} onPointerCancel={endPan}>
          <svg className="tx-graph-canvas" viewBox={`0 0 ${Math.max(720, layout.width)} ${Math.max(360, layout.height)}`} role="img" aria-label={`${effectiveScope === ArtifactGraphScope.multi ? 'Multi-Verse' : 'Node Graph Verse'} projection`}>
            <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
              {(layout.bands || []).map((band) => <g key={band.workspaceId} className="tx-graph-band"><rect x="16" y={band.y - 22} width={Math.max(680, layout.width - 32)} height={band.height} rx="14" /><text x="34" y={band.y + 6}>{band.title} · {band.nodeCount}</text></g>)}
              <g className="tx-graph-edges">
                {(graph.edges || []).filter((edge) => edge.from && visibleIds.has(edge.from) && visibleIds.has(edge.to)).map((edge) => {
                  const a = layout.positions[edge.from]; const b = layout.positions[edge.to];
                  if (!a || !b) return null;
                  const dim = hovered && !(hoveredNeighbors.has(edge.from) && hoveredNeighbors.has(edge.to));
                  return <line key={edge.id} x1={a.x + 72} y1={a.y} x2={b.x - 72} y2={b.y} className={`${edge.kind === 'origin' ? 'tx-graph-edge-origin' : 'tx-graph-edge-parent'} ${edge.crossWorkspace ? 'tx-graph-edge-cross' : ''} ${dim ? 'tx-graph-dim' : ''}`}><title>{edge.label} · {edge.status}</title></line>;
                })}
              </g>
              <g className="tx-graph-nodes">
                {(graph.nodes || []).map((node) => {
                  const pos = layout.positions[node.id]; if (!pos) return null;
                  const dim = hovered && !hoveredNeighbors.has(node.id);
                  const selected = node.id === focusNodeId;
                  return (
                    <g key={node.id} data-graph-node="true" tabIndex="0" role="button" aria-label={`Open ${node.title}`} transform={`translate(${pos.x - 72} ${pos.y - 25})`} className={`tx-graph-node tx-graph-node-${node.temporalState} tx-graph-node-${node.sourceState} ${node.reductionBoundary ? 'tx-graph-node-reduction' : ''} ${node.resolutionState === 'unresolved' ? 'tx-graph-node-unresolved' : ''} ${selected ? 'tx-graph-node-selected' : ''} ${dim ? 'tx-graph-dim' : ''}`} onMouseEnter={() => setHovered(node.id)} onMouseLeave={() => setHovered('')} onFocus={() => setHovered(node.id)} onBlur={() => setHovered('')} onClick={() => onOpenRecord?.(node.workspaceId, node.recordId)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onOpenRecord?.(node.workspaceId, node.recordId); } }}>
                      <rect width="144" height="50" rx="10" />
                      <text x="10" y="19" className="tx-graph-node-title">{truncate(node.title, 21)}</text>
                      <text x="10" y="37" className="tx-graph-node-meta">{truncate(node.schemaId || node.path || node.recordId, 23)}</text>
                      <title>{node.title}\n{node.path}\n{node.workspaceId} · {node.temporalState} · {node.sourceState}{node.reductionBoundary ? ' · reduction boundary' : ''}{node.resolutionState === 'unresolved' ? ' · unresolved lineage context' : ''}</title>
                    </g>
                  );
                })}
              </g>
            </g>
          </svg>
        </div>
      ) : null}
      <div className="tx-graph-legend" aria-label="Graph legend">
        <span>Parent = solid</span><span>Origin = dashed</span><span>Cross-workspace = emphasized</span><span>Reduced history = double border</span><span>Unresolved = warning border</span><span>Hover = relation neighborhood</span>
      </div>
    </div>
  );
}

function truncate(value = '', max = 24) {
  const raw = String(value || '');
  return raw.length > max ? `${raw.slice(0, Math.max(1, max - 1))}…` : raw;
}
