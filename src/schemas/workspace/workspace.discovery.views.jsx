import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AssetCard, MemoRecordCard as RecordCard } from './workspace.cards.views.jsx';
import { discoveryInitialRecordWindowLimitForScroll, discoveryRecordWindowKey, discoveryRenderWindowProfile, discoveryWindowState, DISCOVERY_INITIAL_RECORD_WINDOW } from './workspace.discoveryRenderWindow.js';

export function DiscoveryRecordList({ records = [], assets = [], auditById = new Map(), stageScrollTop = 0, actionStateKey = '', workspaceRecords = [], workspaceId = '', transitionProductContext = null, onOpenRecord, onFocusRecordLineage, onShareRecord, onRecordAction, onOpenSchema, onOpenAsset, readOnly = false }) {
  const resetKey = useMemo(() => discoveryRecordWindowKey(records, assets), [records, assets]);
  const [viewport, setViewport] = useState(() => discoveryViewportSnapshot());
  const profile = useMemo(() => discoveryRenderWindowProfile(viewport), [viewport]);
  const restoreWindowLimit = useMemo(() => discoveryInitialRecordWindowLimitForScroll(stageScrollTop, viewport, profile), [stageScrollTop, viewport, profile]);
  const [visibleRecordLimit, setVisibleRecordLimit] = useState(() => restoreWindowLimit || profile.initial || DISCOVERY_INITIAL_RECORD_WINDOW);
  const sentinelRef = useRef(null);
  const windowState = useMemo(() => discoveryWindowState(records, visibleRecordLimit, profile), [records, visibleRecordLimit, profile]);
  const totalRecords = windowState.total;
  const visibleRecords = windowState.visibleRecords;
  const remainingRecords = windowState.remaining;

  useEffect(() => {
    setVisibleRecordLimit(Math.max(profile.initial || DISCOVERY_INITIAL_RECORD_WINDOW, restoreWindowLimit || 0));
  }, [resetKey, profile.initial, restoreWindowLimit]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const update = () => setViewport(discoveryViewportSnapshot());
    window.addEventListener('resize', update, { passive: true });
    window.visualViewport?.addEventListener?.('resize', update, { passive: true });
    return () => {
      window.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener?.('resize', update);
    };
  }, []);

  useEffect(() => {
    if (!remainingRecords || !sentinelRef.current || typeof IntersectionObserver === 'undefined') return undefined;
    const node = sentinelRef.current;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      setVisibleRecordLimit((limit) => Math.min(totalRecords, limit + windowState.step));
    }, { rootMargin: '540px 0px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, [remainingRecords, totalRecords, windowState.step]);

  return (
    <div className="tx-discovery-record-list tx-unified-record-list" aria-label="Discovery artifacts" data-record-window={visibleRecords.length < totalRecords ? 'partial' : 'complete'}>
      {visibleRecords.map((record) => <RecordCard key={record.id} record={record} auditItem={auditById.get(record.id)} actionStateKey={actionStateKey} workspaceRecords={workspaceRecords} workspaceId={workspaceId} transitionProductContext={transitionProductContext} readOnly={readOnly} onOpenRecord={onOpenRecord} onFocusRecordLineage={onFocusRecordLineage} onShareRecord={onShareRecord} onRecordAction={onRecordAction} onOpenSchema={onOpenSchema} />)}
      {remainingRecords ? (
        <div className="tx-discovery-window-sentinel" ref={sentinelRef} aria-live="polite">
          <span className="tx-discovery-window-summary">Showing {visibleRecords.length} of {totalRecords} matching artifacts. Search and filters already cover all loaded content.</span>
          <button type="button" onClick={() => setVisibleRecordLimit((limit) => Math.min(totalRecords, limit + windowState.step))}>Load more</button>
        </div>
      ) : null}
      {assets.map((asset) => <AssetCard key={asset.id || asset.path} asset={asset} actionStateKey={actionStateKey} onOpenAsset={onOpenAsset} />)}
    </div>
  );
}

function discoveryViewportSnapshot() {
  if (typeof window === 'undefined') return { width: 0, coarse: false };
  let coarse = false;
  try { coarse = Boolean(window.matchMedia?.('(pointer: coarse)')?.matches); } catch (_) {}
  return { width: Math.floor(window.visualViewport?.width || window.innerWidth || 0), height: Math.floor(window.visualViewport?.height || window.innerHeight || 0), coarse };
}
