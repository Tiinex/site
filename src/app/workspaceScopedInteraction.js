import { activeWorkspaceViewFor as activeWorkspaceViewForState, stateWithActiveWorkspace, stateWithWorkspacePresentationPruned, stateWithWorkspaceViewPatch, stateWithWorkspaceViewUpdate } from './workspaceMulticolumn.js';
import { stateWithWorkspaceWindowFocus, stateWithWorkspaceWindowPruned } from './workspaceWindow.js';

export function workspaceById(state = {}, workspaceId = '') {
  const id = String(workspaceId || '').trim();
  return (Array.isArray(state.workspaces) ? state.workspaces : []).find((workspace) => workspace.id === id) || null;
}

export function stateWithWorkspaceFocused(state = {}, workspaceId = '', viewportWidth = 0) {
  const id = String(workspaceId || '').trim();
  if (!workspaceById(state, id)) return state;
  const focused = stateWithActiveWorkspace(state, id);
  return stateWithWorkspaceWindowFocus(focused, id, viewportWidth);
}

export function stateWithWorkspaceViewPatchAndFocus(state = {}, workspaceId = '', patch = {}, viewportWidth = 0) {
  const id = String(workspaceId || '').trim();
  const patched = stateWithWorkspaceViewPatch(state, id, patch);
  return stateWithWorkspaceFocused(patched, id, viewportWidth);
}

export function stateWithRecordLineageFocused(state = {}, workspaceId = '', recordId = '', viewportWidth = 0) {
  const id = String(workspaceId || state.activeWorkspaceId || '').trim();
  const selectedRecordId = String(recordId || '').trim();
  if (!id || !selectedRecordId || !workspaceById(state, id)) return state;
  const currentView = activeWorkspaceViewForState(state, id);
  const currentVerse = String(currentView.workspaceVerse || 'feed');
  const existingReturnVerse = String(currentView.lineageReturnVerse || '');
  const lineageReturnVerse = currentVerse === 'tree' || currentVerse === 'feed'
    ? currentVerse
    : existingReturnVerse === 'tree' || existingReturnVerse === 'feed'
      ? existingReturnVerse
      : 'feed';
  return stateWithWorkspaceViewPatchAndFocus(state, id, {
    workspaceVerse: 'lineage',
    lineageReturnVerse,
    selectedRecordId,
    lineageQuery: '',
    expandedLineageRecordIds: [],
    lineageAuditReport: null,
    lineageLoadReport: null
  }, viewportWidth);
}


export function workspaceVerseNavigationPatch(verse = 'feed') {
  const normalizedVerse = verse === 'tree' || verse === 'graph' || verse === 'lineage' ? verse : 'feed';
  if (normalizedVerse === 'lineage') return { workspaceVerse: 'lineage' };
  if (normalizedVerse === 'graph') return { workspaceVerse: 'graph', lineageAuditReport: null };
  return {
    workspaceVerse: normalizedVerse,
    lineageReturnVerse: '',
    selectedRecordId: '',
    expandedLineageRecordIds: [],
    lineageAuditReport: null,
    lineageLoadReport: null
  };
}

export function stateWithWorkspaceViewUpdateAndFocus(state = {}, workspaceId = '', updater = null, viewportWidth = 0) {
  const id = String(workspaceId || '').trim();
  const updated = stateWithWorkspaceViewUpdate(state, id, updater);
  return stateWithWorkspaceFocused(updated, id, viewportWidth);
}

export function stateAfterWorkspaceClosePresentation(state = {}, viewportWidth = 0) {
  return stateWithWorkspaceWindowPruned(stateWithWorkspacePresentationPruned(state), viewportWidth);
}
