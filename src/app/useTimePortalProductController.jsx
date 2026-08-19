import { useState } from 'react';
import { activeWorkspaceViewFor } from './workspaceMulticolumn.js';
import { workspaceById } from './workspaceScopedInteraction.js';
import { resolveTimePortalSnapshot } from './timePortalSnapshotResolution.js';
import { historicalSnapshotReadModelKey, loadTimePortalHistoricalReadModel } from './timePortalHistoricalRead.js';
import { timePortalViewFor, timePortalWithIntent, timePortalWithResolvedSnapshot, timePortalWithoutIntent } from '../workspaces/workspace.timePortal.js';

export function useTimePortalProductController({
  state,
  latestStateRef,
  activeWorkspaceId = '',
  dialogWorkspaceId = '',
  dialog = null,
  commitWorkspaceViewUpdate,
  setNotice,
  setDialog,
  setDialogWorkspaceId,
  setActiveRecordId,
  setActiveAssetId,
  dismissDialog,
  fetchImpl
} = {}) {
  const [historicalReads, setHistoricalReads] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const sourceState = () => latestStateRef?.current || state || {};
  const targetIdFor = (workspaceId = '') => String(workspaceId || dialogWorkspaceId || sourceState().activeWorkspaceId || activeWorkspaceId || '').trim();

  function readFor(workspace, view) {
    const temporal = timePortalViewFor(view || {});
    const key = temporal?.snapshot ? historicalSnapshotReadModelKey(temporal.snapshot) : '';
    const candidate = key && workspace?.id ? historicalReads[workspace.id] : null;
    return candidate?.key === key ? candidate : null;
  }

  function clearHistoricalRead(workspaceId = '') {
    const targetId = targetIdFor(workspaceId);
    if (!targetId) return;
    setHistoricalReads((current) => { const next = Object.assign({}, current); delete next[targetId]; return next; });
  }

  function openResolver(intent = {}, workspaceId = '') {
    const targetId = targetIdFor(workspaceId);
    const currentView = activeWorkspaceViewFor(sourceState(), targetId);
    const existing = timePortalViewFor(currentView);
    commitWorkspaceViewUpdate?.(targetId, (view) => timePortalWithIntent(view, {
      begin: intent.begin,
      end: intent.end,
      sourceId: existing?.sourceId || '',
      snapshotInput: existing?.snapshotInput || ''
    }), 'push');
    setDialogWorkspaceId?.(targetId);
    setError('');
    setDialog?.('time-portal-resolve');
  }

  async function loadSnapshot(workspaceId = '', explicitSnapshot = null, explicitWorkspace = null) {
    const targetId = targetIdFor(workspaceId);
    const currentState = sourceState();
    const workspace = explicitWorkspace || workspaceById(currentState, targetId);
    const temporal = timePortalViewFor(activeWorkspaceViewFor(currentState, targetId));
    const snapshot = explicitSnapshot || temporal?.snapshot || null;
    if (!workspace || !snapshot) { setNotice?.('Resolve an exact source snapshot before historical loading.'); return null; }
    setBusy(true);
    const readModel = await loadTimePortalHistoricalReadModel({ workspace, snapshot, fetchImpl, options: { allowCache: true } });
    setBusy(false);
    setHistoricalReads((current) => Object.assign({}, current, { [targetId]: readModel }));
    if (!readModel?.ok) setNotice?.(readModel?.message || 'Historical snapshot is unavailable. Latest source remains unchanged.');
    else if (readModel.state === 'degraded') setNotice?.('Historical snapshot loaded with transport diagnostics. Latest source remains unchanged.');
    return readModel;
  }

  async function resolveFromDialog({ sourceId = '', snapshotInput = '' } = {}) {
    const currentState = sourceState();
    const targetId = targetIdFor();
    const workspace = workspaceById(currentState, targetId);
    const currentView = activeWorkspaceViewFor(currentState, targetId);
    setBusy(true); setError('');
    const result = await resolveTimePortalSnapshot({ workspace, view: currentView, sourceId, snapshotInput, fetchImpl });
    if (!result?.ok) { setBusy(false); setError(result?.message || 'Could not resolve source snapshot.'); return result; }
    const currentIntent = Object.assign({}, timePortalViewFor(currentView) || {}, { sourceId: result.sourceId, snapshotInput });
    const nextView = timePortalWithResolvedSnapshot(currentView, result.snapshot, currentIntent);
    const safeView = Object.assign({}, nextView, ['feed', 'tree'].includes(nextView.workspaceVerse) ? {} : { workspaceVerse: 'feed' }, { selectedRecordId: '', lineageQuery: '', lineageAuditReport: null, lineageLoadReport: null });
    commitWorkspaceViewUpdate?.(targetId, () => safeView, 'replace');
    setDialog?.(null); setError('');
    const readModel = await loadSnapshot(targetId, result.snapshot, workspace);
    setBusy(false);
    return Object.assign({}, result, { readModel });
  }

  function returnToLatest(workspaceId = '') {
    const targetId = targetIdFor(workspaceId);
    clearHistoricalRead(targetId);
    setActiveRecordId?.(''); setActiveAssetId?.(''); setError('');
    commitWorkspaceViewUpdate?.(targetId, (view) => timePortalWithoutIntent(view), 'push');
    if (dialog === 'time-portal-resolve' || dialog === 'display-options') dismissDialog?.();
  }

  return {
    historicalReads,
    busy,
    error,
    readFor,
    clearHistoricalRead,
    openResolver,
    loadSnapshot,
    resolveFromDialog,
    returnToLatest
  };
}
