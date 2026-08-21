import { stateWithWorkspaceViewPatchAndFocus } from './workspaceScopedInteraction.js';

export function canonicalCreationProductSettlementState(result = {}, workspaceId = '', viewportWidth = 0) {
  return stateWithWorkspaceViewPatchAndFocus(result.state || {}, result.workspace?.id || workspaceId, {
    workspaceVerse: 'lineage',
    selectedRecordId: result.record?.id || '',
    lineageQuery: '',
    lineageLoadReport: null,
    lineageAuditReport: null
  }, viewportWidth);
}
