import React from 'react';
import { Badge } from '../../ui/primitives/Badge.jsx';
import { Icon } from '../../ui/primitives/Icon.jsx';
import { buildWorkspaceLineageView } from '../../workspaces/workspace.lineageView.js';
import { lineageDisplayOptions } from '../../workspaces/workspace.displayOptions.js';
import { displayRecordIncluded } from '../../workspaces/workspace.displayFilters.js';
import { RecordCard } from './workspace.cards.views.jsx';
import { compactPath } from './workspace.viewFormatting.js';

export function WorkspaceLineageState({ workspace, query = '', records = [], selectedRecordId = '', auditById = new Map(), onOpenRecord, onRecordAction, onFocusRecordLineage, onShareRecord, lineageAuditReport = null, lineageLoadReport = null, lineageReady = false, displayOptions = null, expandedRecordIds = [], onToggleLineageCard }) {
  const lineage = buildWorkspaceLineageView(workspace, { records, query, selectedRecordId });
  const selectedFromTraversal = selectedRecordId && lineage.selectedTraversal?.nodes?.length
    ? lineage.selectedTraversal.nodes.find((node) => node.id === selectedRecordId) || lineage.selectedTraversal.nodes[0]
    : null;
  const selectedFromRecords = selectedRecordId ? records.find((record) => record.id === selectedRecordId) : null;
  const selected = selectedFromTraversal || (selectedFromRecords ? { id: selectedFromRecords.id, title: selectedFromRecords.title, path: selectedFromRecords.path, schemaId: selectedFromRecords.schemaId, record: selectedFromRecords } : null);
  const selectedAudit = selected ? auditById.get(selected.id) : null;
  const lineageLoadReady = Boolean(selected && (lineageReady || (lineageLoadReport && String(lineageLoadReport.selectedRecordId || '') === String(selected.id || ''))));
  return (
    <section className="tx-workspace-lineage-state" aria-label="Loaded lineage">
      <header className="tx-lineage-header">
        <div>
          <strong><Icon name="lineage" /> {lineage.title}</strong>
          <small>Artifact chain</small>
        </div>
        {!selected ? (
          <div className="tx-lineage-stats" aria-label="Lineage stats">
            <span><strong>{lineage.stats.visibleNodes}</strong><small>nodes</small></span>
            <span><strong>{lineage.stats.visibleEdges}</strong><small>edges</small></span>
            <span><strong>{lineage.stats.missingEdges || 0}</strong><small>missing</small></span>
            <span><strong>{lineage.stats.visibleFindings}</strong><small>findings</small></span>
          </div>
        ) : null}
      </header>
      {selected ? <>
          <LineageLoadStatus report={lineageLoadReport} selectedRecordId={selected.id} ready={lineageLoadReady} />
          <LineageAuditInlineReport report={lineageAuditReport} selectedRecordId={selected.id} />
          <LineageSelectedSummary node={selected} auditItem={selectedAudit} lineage={lineage} query={query} displayOptions={lineageLoadReady ? displayOptions : null} onOpenRecord={onOpenRecord} onRecordAction={onRecordAction} onShareRecord={onShareRecord} onFocusRecordLineage={onFocusRecordLineage} auditById={auditById} expandedRecordIds={expandedRecordIds} onToggleLineageCard={onToggleLineageCard} />
        </> : null}
      {!selected ? (
        <details className="tx-lineage-workspace-overview" open aria-label="Workspace lineage overview">
          <summary>Diagnostics overview · {lineage.stats.visibleNodes} nodes · {lineage.stats.missingEdges || 0} missing · {lineage.stats.visibleFindings} findings</summary>
          {lineage.findings.length ? (
            <div className="tx-lineage-findings" aria-label="Workspace lineage findings"><strong>Workspace findings</strong>
              {lineage.findings.slice(0, 5).map((finding, index) => (
                <span key={`${finding.code}-${finding.nodeId}-${index}`} className={`tx-lineage-finding tx-${finding.severity || 'info'}`} title={finding.message}>
                  <Icon name={(finding.severity === 'warning' || finding.severity === 'error') ? 'warning' : 'check'} /> {finding.code}
                </span>
              ))}
            </div>
          ) : null}
          {lineage.edges.length ? (
            <div className="tx-lineage-edge-list" role="list" aria-label="Resolved lineage edges">
              {lineage.edges.map((edge) => (
                <LineageEdgeRow key={edge.id} edge={edge} onFocusRecordLineage={onFocusRecordLineage} />
              ))}
            </div>
          ) : null}
          <div className="tx-lineage-node-list" role="list" aria-label="Loaded lineage nodes">
            {lineage.nodes.map((node) => (
              <button key={node.id} type="button" className="tx-lineage-node" onClick={() => onFocusRecordLineage?.(node.id)} title={node.path || ''}>
                <span className="tx-lineage-node-main"><Icon name={node.hasContinuityContext ? 'lineage' : 'open'} /> <strong>{node.title}</strong></span>
                <span className="tx-lineage-node-meta">
                  {node.schemaId ? <Badge>{node.schemaId}</Badge> : <Badge>markdown</Badge>}
                  <Badge>{node.sourceBacked ? 'source-backed' : 'local/session'}</Badge>
                  {node.trace ? <small>Trace: {compactPath(node.trace)}</small> : null}
                  {node.origin ? <small>Origin: {compactPath(node.origin)}</small> : null}
                </span>
              </button>
            ))}
          </div>
        </details>
      ) : null}
      {lineage.empty ? <p className="tx-tree-empty">No loaded lineage nodes match this view.</p> : null}
    </section>
  );
}


function LineageLoadStatus({ report = null, selectedRecordId = '', ready = false }) {
  if (!ready || !report || String(report.selectedRecordId || '') !== String(selectedRecordId || '')) return null;
  const partial = report.state === 'partial';
  const terminalLabel = lineageTerminalLabel(report.terminalState, report.statusLabel);
  return (
    <div className={`tx-lineage-load-status ${partial ? 'tx-lineage-load-partial' : 'tx-lineage-load-complete'}`} role="status" aria-live="polite">
      <Icon name={partial ? 'warning' : 'check'} />
      <strong>{partial ? 'Loaded partial lineage index' : 'Loaded full lineage index'}</strong>
      <span>{Number(report.nodes || 0)} node{Number(report.nodes || 0) === 1 ? '' : 's'}</span>
      {terminalLabel ? <small>{terminalLabel}</small> : null}
      {Number(report.scopeTransitions || 0) ? <small>{Number(report.scopeTransitions || 0)} scope transition{Number(report.scopeTransitions || 0) === 1 ? '' : 's'}</small> : null}
    </div>
  );
}


function LineageAuditInlineReport({ report = null, selectedRecordId = '' }) {
  if (!report || String(report.selectedRecordId || '') !== String(selectedRecordId || '')) return null;
  const counts = report.counts || {};
  const partial = report.state === 'partial';
  const terminalLabel = lineageTerminalLabel(report.terminalState, report.statusLabel);
  const parts = [
    `${Number(counts.ok || 0)} OK`,
    `${Number(counts.mismatch || 0)} mismatch`,
    `${Number(counts.open || 0)} open`,
    `${Number(counts.pending || 0)} pending`
  ];
  return (
    <div className={`tx-lineage-audit-inline ${partial || Number(counts.mismatch || 0) ? 'tx-lineage-audit-inline-warn' : 'tx-lineage-audit-inline-ok'}`} role="status" aria-live="polite">
      <Icon name={partial || Number(counts.mismatch || 0) ? 'warning' : 'check'} />
      <strong>{partial ? 'Lineage audit partial' : 'Lineage audit complete'}</strong>
      <span>{parts.join(' · ')}</span>
      {terminalLabel ? <small>{terminalLabel}</small> : null}
      {Number(report.scopeTransitions || 0) ? <small>{Number(report.scopeTransitions || 0)} scope transition{Number(report.scopeTransitions || 0) === 1 ? '' : 's'}</small> : null}
    </div>
  );
}


function LineageSelectedSummary({ node, auditItem, lineage, query = '', displayOptions = null, onOpenRecord, onRecordAction, onShareRecord, onFocusRecordLineage, auditById = new Map(), expandedRecordIds = [], onToggleLineageCard }) {
  const traversal = lineage.selectedTraversal || null;
  const rawFindings = traversal?.selectedFindings?.length ? traversal.selectedFindings : (lineage.findings || []).filter((finding) => finding.nodeId === node.id);
  const selectedLineage = selectedLineageStatus(node, lineage, traversal);
  const pathNodes = lineageViewerNodes(node, traversal);
  const normalizedOptions = lineageDisplayOptions(displayOptions);
  const normalizedQuery = String(query || '').trim().toLowerCase();
  const visiblePathNodes = pathNodes
    .map((item, index) => ({ item, originalIndex: index }))
    .filter(({ item }) => {
      const record = item.record || (item.id === node.id ? node.record : {}) || {};
      const audit = item.id === node.id ? auditItem : auditById.get(item.id);
      if (!displayRecordIncluded(record, normalizedOptions, audit)) return false;
      return !normalizedQuery || lineageCardMatchesQuery(item, record, normalizedQuery);
    });
  const secondaryFindings = selectedSecondaryFindings(rawFindings, traversal, selectedLineage);
  return (
    <section className="tx-lineage-record-list tx-unified-record-list" aria-label="Lineage artifact chain">
      <ol className="tx-lineage-record-chain" aria-label="Selected artifact and parent chain">
        {visiblePathNodes.map(({ item, originalIndex }, displayIndex) => {
          const record = item.record || (item.id === node.id ? node.record : {}) || {};
          const audit = item.id === node.id ? auditItem : auditById.get(item.id);
          const relation = lineageRelationLabel(item, originalIndex, pathNodes.length);
          return (
            <li key={item.id || originalIndex} className="tx-lineage-record-chain-item">
              {displayIndex > 0 ? <LineageRelationSeparator relation={relation} /> : null}
              <RecordCard
                record={record}
                auditItem={audit}
                context="lineage"
                expanded={expandedRecordIds.includes(record.id)}
                onToggleExpanded={onToggleLineageCard}
                onOpenRecord={onOpenRecord}
                onFocusRecordLineage={onFocusRecordLineage}
                onShareRecord={onShareRecord}
                onRecordAction={onRecordAction}
              />
            </li>
          );
        })}
        {!visiblePathNodes.length ? <li className="tx-lineage-record-chain-empty">No loaded lineage cards match the current search/display filters.</li> : null}
      </ol>
      <LineagePathResult traversal={traversal} status={selectedLineage} />
      {secondaryFindings.length ? (
        <details className="tx-lineage-secondary-diagnostics">
          <summary>Diagnostics · {secondaryFindings.length}</summary>
          <div className="tx-lineage-findings" aria-label="Selected lineage audit details">
            {secondaryFindings.slice(0, 5).map((finding, index) => (
              <span key={`${finding.code}-${finding.nodeId}-${index}`} className={`tx-lineage-finding tx-${finding.severity || 'info'}`} title={finding.message}>
                <Icon name={(finding.severity === 'warning' || finding.severity === 'error') ? 'warning' : 'check'} /> {finding.code}
              </span>
            ))}
          </div>
        </details>
      ) : null}
    </section>
  );
}

function lineageRelationLabel(item = {}, index = 0, total = 0) {
  if (index <= 0) return 'Selected artifact';
  if (item.root || index === total - 1) return 'Root';
  return 'Parent';
}

function LineageRelationSeparator({ relation = 'Parent' }) {
  return <div className="tx-lineage-relation-separator" aria-hidden="true"><span>{relation}</span></div>;
}

function lineageViewerNodes(selectedNode = {}, traversal = null) {
  const nodes = Array.isArray(traversal?.nodes) && traversal.nodes.length ? traversal.nodes : [selectedNode];
  const seen = new Set();
  return nodes.filter((item) => {
    const id = String(item?.id || '').trim();
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function LineagePathResult({ traversal = null, status = {} }) {
  if (!traversal) return null;
  const terminalState = traversal.terminalState || status.terminalState || '';
  const label = lineageTerminalLabel(terminalState, status.label) || status.label || 'Lineage path loaded';
  const partial = traversal.complete === false || status.complete === false;
  const tone = status.tone || (partial ? 'open' : 'ok');
  return (
    <div className={`tx-lineage-terminal-status tx-${tone} ${partial ? 'tx-lineage-terminal-partial' : 'tx-lineage-terminal-complete'}`} title={status.message || ''}>
      <Icon name={partial || tone === 'mismatch' ? 'warning' : 'check'} /> {label}
      {Array.isArray(traversal.scopeTransitions) && traversal.scopeTransitions.length ? <span> · {traversal.scopeTransitions.length} scope transition{traversal.scopeTransitions.length === 1 ? '' : 's'}</span> : null}
    </div>
  );
}

function lineageTerminalLabel(terminalState = '', fallback = '') {
  const state = String(terminalState || '').trim();
  if (state === 'root-reached' || state === 'root-reached-scope-transition') return 'root reached';
  if (state === 'no-parent-declared') return 'no parent declared';
  if (state === 'target-unavailable') return 'target unavailable';
  if (state === 'ambiguous-parent') return 'ambiguous parent';
  if (state === 'integrity-mismatch') return 'integrity mismatch';
  if (state === 'depth-limited') return 'partial lineage · depth limit';
  if (state === 'not-exhausted') return 'partial lineage';
  if (state === 'not-loaded') return 'lineage not loaded';
  return fallback || '';
}

function lineageCardMatchesQuery(item = {}, record = {}, query = '') {
  return [
    item.title,
    item.path,
    item.schemaId,
    item.trace,
    item.origin,
    item.boundary,
    record.title,
    record.summary,
    record.kind,
    record.schemaId,
    record.currentSchemaId,
    record.markdown,
    record.source?.label
  ].some((value) => String(value || '').toLowerCase().includes(query));
}


function selectedLineageStatus(node = {}, lineage = {}, traversal = null) {
  if (traversal?.status) return traversal.status;
  const id = String(node.id || '');
  const traversalMissing = traversal?.missingEdges || [];
  const traversalNodes = traversal?.nodes || [];
  const selectedFindings = (lineage.findings || []).filter((finding) => finding.nodeId === id);
  const selectedEdges = traversal?.edges?.length ? traversal.edges : (lineage.edges || []).filter((edge) => edge.from === id || edge.to === id);
  if (selectedFindings.some((finding) => finding.code === 'lineage.target.ambiguous') || traversalMissing.length) {
    return { label: 'missing parent', tone: 'mismatch', message: 'Selected artifact traversal stops at unresolved or ambiguous lineage. Workspace findings below are separate.' };
  }
  if (selectedFindings.some((finding) => finding.code === 'lineage.root') || (traversalNodes.length === 1 && !selectedEdges.length && !traversalMissing.length)) {
    return { label: 'loaded root', tone: 'open', message: 'Selected artifact has no loaded parent trace in this workspace.' };
  }
  if (selectedEdges.length || traversalNodes.length > 1) {
    return { label: 'parent chain loaded', tone: 'ok', message: 'Selected artifact traversal uses the same resolved workspace graph, shown ancestors-first.' };
  }
  return { label: 'selected open', tone: 'open', message: 'Selected artifact has no resolved lineage finding in the loaded workspace.' };
}

function selectedSecondaryFindings(findings = [], traversal = null, primaryStatus = {}) {
  const hiddenWhenRootReached = new Set(['lineage.root', 'lineage.origin.unresolved']);
  const primaryCodes = new Set(['lineage.root', 'lineage.parent.missing', 'lineage.target.ambiguous', 'lineage.traversal.missingTarget']);
  const source = Array.isArray(findings) ? findings : [];
  const secondary = source.filter((finding) => {
    const code = finding?.code || '';
    if (primaryStatus?.label === 'root reached' && hiddenWhenRootReached.has(code)) return true;
    return !primaryCodes.has(code);
  });
  const traversalSecondary = Array.isArray(traversal?.secondaryFindings) ? traversal.secondaryFindings : [];
  const combined = [...secondary, ...traversalSecondary];
  const seen = new Set();
  return combined.filter((finding) => {
    const key = `${finding?.code || ''}:${finding?.nodeId || ''}:${finding?.target || ''}`;
    if (!finding?.code || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function LineageEdgeRow({ edge, onFocusRecordLineage }) {
  const missing = edge.status === 'missing';
  return (
    <div className={`tx-lineage-edge-row ${missing ? 'tx-lineage-edge-missing' : ''}`} role="listitem">
      <button type="button" disabled={missing || !edge.from} onClick={() => onFocusRecordLineage?.(edge.from)}>
        <span>{edge.fromTitle}</span>
        {edge.fromPath ? <small>{compactPath(edge.fromPath)}</small> : null}
      </button>
      <span className="tx-lineage-edge-connector" title={`${edge.kind} · ${edge.method || edge.status}`}>
        <Icon name={missing ? 'warning' : 'lineage'} /> {edge.kind}
      </span>
      <button type="button" onClick={() => onFocusRecordLineage?.(edge.to)}>
        <span>{edge.toTitle}</span>
        {edge.toPath ? <small>{compactPath(edge.toPath)}</small> : null}
      </button>
      <Badge>{edge.status}</Badge>
    </div>
  );
}
