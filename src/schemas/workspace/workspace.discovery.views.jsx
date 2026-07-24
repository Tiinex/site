import React from 'react';
import { AssetCard, RecordCard, WorkspaceCandidateCard } from './workspace.cards.views.jsx';

export function DiscoveryRecordList({ workspaceCandidates = [], records = [], assets = [], auditById = new Map(), onOpenWorkspaceCandidate, onMergeWorkspaceCandidate, onOpenRecord, onFocusRecordLineage, onShareRecord, onRecordAction, onOpenAsset }) {
  return (
    <div className="tx-discovery-record-list tx-unified-record-list" aria-label="Discovery artifacts">
      {workspaceCandidates.map((candidate) => <WorkspaceCandidateCard key={candidate.id || candidate.path} candidate={candidate} onOpenWorkspaceCandidate={onOpenWorkspaceCandidate} onMergeWorkspaceCandidate={onMergeWorkspaceCandidate} />)}
      {records.map((record) => <RecordCard key={record.id} record={record} auditItem={auditById.get(record.id)} onOpenRecord={onOpenRecord} onFocusRecordLineage={onFocusRecordLineage} onShareRecord={onShareRecord} onRecordAction={onRecordAction} />)}
      {assets.map((asset) => <AssetCard key={asset.id || asset.path} asset={asset} onOpenAsset={onOpenAsset} />)}
    </div>
  );
}
