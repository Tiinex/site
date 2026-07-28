import React, { useMemo } from 'react';
import { Badge } from '../../ui/primitives/Badge.jsx';
import { Icon } from '../../ui/primitives/Icon.jsx';
import { buildWorkspacePathTree } from '../../workspaces/workspace.pathTree.js';
import { AuditStatusBadge } from './workspace.auditBadge.views.jsx';
import { recordLifecycleBadge } from './workspace.viewFormatting.js';

export function WorkspaceTreeState({ workspace, query = '', records, assets = [], workspaceCandidates = [], auditById = new Map(), expandedFolders = [], onToggleTreeFolder, onOpenRecord, onFocusRecordLineage, onOpenAsset, onOpenWorkspaceCandidate, onMergeWorkspaceCandidate }) {
  query = String(query || '').trim();
  const rootLabel = `Visible tree · ${workspace.title || workspace.name || 'workspace'}`;
  const tree = useMemo(() => buildWorkspacePathTree({
    records,
    assets,
    workspaceCandidates,
    rootLabel,
    query
  }), [records, assets, workspaceCandidates, rootLabel, query]);
  const expandedSet = useMemo(() => new Set(Array.isArray(expandedFolders) ? expandedFolders : []), [expandedFolders]);
  return (
    <div className="tx-workspace-tree-state tx-path-tree-state" role="tree" aria-label="Workspace path tree">
      <div className="tx-tree-root tx-path-tree-root">
        <span><Icon name="tree" /> {tree.rootLabel}</span>
        <TreeCountBadges counts={tree.counts} />
      </div>
      {tree.folders.map((folder) => (
        <TreeFolder key={folder.path || folder.name} folder={folder} query={query} expandedSet={expandedSet} onToggleFolder={onToggleTreeFolder} auditById={auditById} onOpenRecord={onOpenRecord} onFocusRecordLineage={onFocusRecordLineage} onOpenAsset={onOpenAsset} onOpenWorkspaceCandidate={onOpenWorkspaceCandidate} onMergeWorkspaceCandidate={onMergeWorkspaceCandidate} />
      ))}
      {tree.items.map((item) => (
        <TreeLeafItem key={item.id || item.path} item={item} auditById={auditById} onOpenRecord={onOpenRecord} onFocusRecordLineage={onFocusRecordLineage} onOpenAsset={onOpenAsset} onOpenWorkspaceCandidate={onOpenWorkspaceCandidate} onMergeWorkspaceCandidate={onMergeWorkspaceCandidate} />
      ))}
      {tree.empty ? <p className="tx-tree-empty">No loaded artifacts, assets, or workspace candidates yet. Source and workspace boundaries remain visible.</p> : null}
    </div>
  );
}

function TreeFolder({ folder, query, expandedSet = new Set(), onToggleFolder, auditById = new Map(), onOpenRecord, onFocusRecordLineage, onOpenAsset, onOpenWorkspaceCandidate, onMergeWorkspaceCandidate }) {
  const open = Boolean(query) || expandedSet.has(folder.path || folder.name || '');
  return (
    <details className="tx-tree-folder" open={open} role="group" data-tree-folder-path={folder.path || folder.name || ''} onToggle={(event) => { if (event.currentTarget === event.target && !query) onToggleFolder?.(folder.path || folder.name || '', event.currentTarget.open); }}>
      <summary className="tx-tree-folder-summary" role="treeitem" aria-label={`Folder ${folder.name}`}>
        <span className="tx-tree-folder-name"><Icon name="folderOpen" /> {folder.name}</span>
        <TreeCountBadges counts={folder.counts} />
      </summary>
      <div className="tx-tree-folder-children">
        {folder.folders.map((child) => (
          <TreeFolder key={child.path || child.name} folder={child} query={query} expandedSet={expandedSet} onToggleFolder={onToggleFolder} auditById={auditById} onOpenRecord={onOpenRecord} onFocusRecordLineage={onFocusRecordLineage} onOpenAsset={onOpenAsset} onOpenWorkspaceCandidate={onOpenWorkspaceCandidate} onMergeWorkspaceCandidate={onMergeWorkspaceCandidate} />
        ))}
        {folder.items.map((item) => (
          <TreeLeafItem key={item.id || item.path} item={item} auditById={auditById} onOpenRecord={onOpenRecord} onFocusRecordLineage={onFocusRecordLineage} onOpenAsset={onOpenAsset} onOpenWorkspaceCandidate={onOpenWorkspaceCandidate} onMergeWorkspaceCandidate={onMergeWorkspaceCandidate} />
        ))}
      </div>
    </details>
  );
}

function TreeLeafItem({ item, auditById = new Map(), onOpenRecord, onFocusRecordLineage, onOpenAsset, onOpenWorkspaceCandidate, onMergeWorkspaceCandidate }) {
  if (item.type === 'workspace') {
    return (
      <div className="tx-tree-record-row tx-tree-workspace-candidate-row tx-tree-leaf-row" role="treeitem">
        <button type="button" className="tx-tree-row-main" onClick={() => onOpenWorkspaceCandidate?.(item.source.id || item.source.path)}>
          <span><Icon name="workspace" /> {item.title || item.name || 'Workspace candidate'}</span>
          <Badge>workspace</Badge>
        </button>
        <button type="button" className="tx-tree-row-action" onClick={() => onMergeWorkspaceCandidate?.(item.source.id || item.source.path)}>Merge</button>
      </div>
    );
  }
  if (item.type === 'asset') {
    return (
      <button type="button" className="tx-tree-record-row tx-tree-asset-row tx-tree-leaf-row" role="treeitem" onClick={() => onOpenAsset?.(item.source.id || item.source.path)} title={item.path || ''}>
        <span><Icon name="asset" /> {item.name || item.title || 'Asset'}</span>
        <Badge>{item.source.previewState || item.kind || 'asset'}</Badge>
      </button>
    );
  }
  const auditItem = auditById.get(item.source.id);
  return (
    <div className="tx-tree-record-row tx-tree-leaf-row" role="treeitem" title={item.path || ''}>
      <button type="button" className="tx-tree-row-main" onClick={() => onFocusRecordLineage?.(item.source.id)} aria-label={`Open lineage for ${item.name || item.title || 'artifact'}`}>
        <span><Icon name="open" /> {item.name || item.title || 'Untitled'}</span>
      </button>
      <span className="tx-tree-row-badges">
        <AuditStatusBadge record={item.source} item={auditItem} />
        {recordLifecycleBadge(item.source) ? <Badge title="Lifecycle/publication state">{recordLifecycleBadge(item.source)}</Badge> : null}
        <Badge>{item.source.kind || item.kind || 'artifact'}</Badge>
      </span>
    </div>
  );
}

function TreeCountBadges({ counts = {} }) {
  const records = Number(counts.records || 0);
  const leaves = Number(counts.leaves || 0);
  const supporting = Number(counts.supporting || 0) + Number(counts.schemaDefinitions || 0);
  const assets = Number(counts.assets || 0);
  const candidates = Number(counts.workspaceCandidates || 0);
  return (
    <span className="tx-tree-counts" aria-label={`${records} visible artifacts, ${leaves} visible leaves, ${supporting} visible supporting, ${assets} visible assets, ${candidates} visible workspace candidates`}>
      {records ? <span className="tx-tree-count-chip" title="Visible after Display options/search"><Icon name="manualFiles" />{records}<small>visible artifacts</small></span> : null}
      {leaves ? <span className="tx-tree-count-chip tx-tree-leaf-chip" title="Visible leaf-role artifacts"><Icon name="lineage" />{leaves}<small>visible leaves</small></span> : null}
      {supporting ? <span className="tx-tree-count-chip tx-tree-supporting-chip" title="Supporting/schema docs"><Icon name="open" />{supporting}</span> : null}
      {assets ? <span className="tx-tree-count-chip"><Icon name="asset" />{assets}</span> : null}
      {candidates ? <span className="tx-tree-count-chip"><Icon name="workspace" />{candidates}</span> : null}
    </span>
  );
}
