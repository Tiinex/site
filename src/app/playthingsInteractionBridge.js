import { transitionProductActionsForRecord } from '../transitions/transition.productPresentation.browser.js';
import { workspaceById } from './workspaceScopedInteraction.js';

export function playthingsTransitionOptionsFor(state = {}, recordId = '', workspaceId = '', referenceRecords = []) {
  const workspace = workspaceById(state, workspaceId || state.activeWorkspaceId);
  const record = workspace?.records?.find((entry) => entry.id === recordId);
  if (!workspace || !record) return [];
  return transitionProductActionsForRecord(record, { workspaceId: workspace.id, workspaceRecords: workspace.records || [], referenceRecords })
    .filter((action) => action?.productCapable === true && action?.enabled !== false);
}

export function playthingsTransitionTargetFor(state = {}, recordId = '', workspaceId = '') {
  const workspace = workspaceById(state, workspaceId || state.activeWorkspaceId);
  return Object.freeze({ workspace, record: workspace?.records?.find((entry) => entry.id === recordId) || null });
}
