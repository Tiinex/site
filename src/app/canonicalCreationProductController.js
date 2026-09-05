import { executeCanonicalTransitionLocalCreate } from './canonicalTransitionLocalCreateCommand.js';
import { executeCanonicalReferenceLocalCreate } from './canonicalReferenceLocalCreateCommand.js';
import { executeSchemaFactoryLocalCreate } from './schemaFactoryLocalCreateCommand.js';
import { BUNDLED_CANONICAL_TRANSITION_DEFINITIONS, BUNDLED_CANONICAL_TRANSITION_SCHEMA_CACHE } from '../transitions/canonicalTransition.productDefaults.js';
import { canonicalCreationProductSettlementState } from './canonicalCreationProductSettlement.js';
import { isSchemaFactoryViewerCreateAction } from '../schemas/schema.factory.viewerProjection.js';

export function createCanonicalCreationProductController(input = {}) {
  const executeTransition = input.executeTransitionCommand || executeCanonicalTransitionLocalCreate;
  const executeReference = input.executeReferenceCommand || executeCanonicalReferenceLocalCreate;
  const executeFactory = input.executeFactoryCommand || executeSchemaFactoryLocalCreate;
  const currentState = () => input.getState?.() || {};
  const lifecycle = () => input.getLifecycle?.() || null;
  const persistenceOwnership = () => input.getPersistenceOwnership?.() || null;
  const recordAction = () => input.getRecordAction?.() || null;
  const dialogWorkspaceId = () => String(input.getDialogWorkspaceId?.() || '');

  function settle(result, workspaceId, action = {}) {
    input.resetSelection?.();
    if (action?.productScope === 'workspace') { input.setDialog?.(null); input.setDialogWorkspaceId?.(''); }
    input.setRecordAction?.(null); input.setActiveRecordId?.(''); input.setActiveAssetId?.(''); input.setNotice?.(result.notice);
    input.commitSemanticNavigation?.(canonicalCreationProductSettlementState(result, workspaceId, Number(input.viewportWidth || 0)), 'push');
    return result;
  }

  function createTransitionRecord(parentRecord, action, values, options = {}) {
    const sourceState = currentState();
    const workspaceId = String(options.workspaceId || recordAction()?.workspaceId || dialogWorkspaceId() || sourceState.activeWorkspaceId || '').trim();
    const result = executeTransition({ lifecycle: lifecycle(), state: sourceState, workspaceId, currentRecordId: parentRecord?.id || '', definitionKey: action?.definitionKey || '', values, placementFolder: options.placementFolder || '', schemaCache: BUNDLED_CANONICAL_TRANSITION_SCHEMA_CACHE, bundledDefinitions: BUNDLED_CANONICAL_TRANSITION_DEFINITIONS, persistenceOwnership: persistenceOwnership() });
    if (!result?.ok) { input.setNotice?.(result?.notice || 'Could not create canonical local artifact.'); return result; }
    return settle(result, workspaceId, action);
  }

  function createFactoryRecord(parentRecord, action, values, options = {}) {
    const sourceState = currentState();
    const workspaceId = String(options.workspaceId || dialogWorkspaceId() || sourceState.activeWorkspaceId || '').trim();
    const result = executeFactory({ lifecycle: lifecycle(), state: sourceState, workspaceId, currentRecordId: parentRecord?.id || '', action, values, placementFolder: options.placementFolder || '', persistenceOwnership: persistenceOwnership() });
    if (!result?.ok) { input.setNotice?.(result?.notice || 'Could not create schema-factory local artifact.'); return result; }
    return settle(result, workspaceId, action);
  }

  function createWorkspaceArtifactRecord(parentRecord, action, values, options = {}) {
    return isSchemaFactoryViewerCreateAction(action)
      ? createFactoryRecord(parentRecord, action, values, options)
      : createTransitionRecord(parentRecord, action, values, options);
  }

  function createReferenceRecord(subjectRecord, action, targetOption) {
    const sourceState = currentState();
    const workspaceId = recordAction()?.workspaceId || sourceState.activeWorkspaceId || '';
    const result = executeReference({ lifecycle: lifecycle(), state: sourceState, workspaceId, currentRecordId: subjectRecord?.id || '', targetWorkspaceId: targetOption?.workspaceId || '', targetRecordId: targetOption?.id || '', definitionKey: action?.definitionKey || '', schemaCache: BUNDLED_CANONICAL_TRANSITION_SCHEMA_CACHE, bundledDefinitions: BUNDLED_CANONICAL_TRANSITION_DEFINITIONS, persistenceOwnership: persistenceOwnership() });
    if (!result?.ok) { input.setNotice?.(result?.notice || 'Could not create canonical Reference Relation.'); return result; }
    return settle(result, workspaceId, action);
  }

  return Object.freeze({ createTransitionRecord, createFactoryRecord, createWorkspaceArtifactRecord, createReferenceRecord });
}
