import { useMemo } from 'react';
import { canonicalReferenceTargetOptions } from './canonicalReferenceTargets.js';

export function useCanonicalReferenceSelectionOptions({ state, actionRecord = null, recordAction = null, actionWorkspace = null } = {}) {
  return useMemo(() => (actionRecord && recordAction?.action?.referenceCapability?.state === 'qualified'
    ? canonicalReferenceTargetOptions({ state, subjectWorkspaceId: actionWorkspace?.id || '', subjectRecord: actionRecord, targetSchemaId: recordAction.action.referenceCapability.targetSchemaId })
    : null), [state, actionRecord, actionWorkspace, recordAction]);
}
