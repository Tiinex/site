import { useMemo } from 'react';
import { workspacePlacementOptions } from './workspacePlacementOptions.js';

export function useCanonicalPlacementSelectionOptions({ state, actionRecord = null, recordAction = null, actionWorkspace = null, dialog = '', dialogWorkspace = null } = {}) {
  const authoringActive = Boolean(actionRecord && recordAction?.action?.kind === 'canonical-transition-product' && recordAction?.action?.referenceCapability?.state !== 'qualified');
  const action = useMemo(() => authoringActive && actionWorkspace?.id ? workspacePlacementOptions(state, actionWorkspace.id) : null, [authoringActive, state, actionWorkspace?.id]);
  const dialogOptions = useMemo(() => dialog === 'create-artifact' && dialogWorkspace?.id ? workspacePlacementOptions(state, dialogWorkspace.id) : null, [dialog, state, dialogWorkspace?.id]);
  return Object.freeze({ action, dialog: dialogOptions });
}
