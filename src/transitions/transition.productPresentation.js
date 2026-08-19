import { transitionActionsForRecord } from './transition.presentation.js';
import { prepareCanonicalTransitionProductActions, prepareCanonicalTransitionProductContext, prepareCanonicalTransitionWorkspaceActions } from './transition.productPreparation.js';
import { CANONICAL_TOPIC_TO_TASK_BUNDLED_SOURCE_ID } from './canonicalTransition.semanticPackage.js';

export const CANONICAL_TRANSITION_PRODUCT_ACTION_KIND = 'canonical-transition-product';
export const LEGACY_CANONICAL_PRESENTATION_COMPATIBILITY = Object.freeze({
  'tiinex.site.topic-to-task.v1': 'topic.continue.task'
});

export function transitionProductActionsForRecord(record = {}, options = {}) {
  const schemaCache = Array.isArray(options.schemaCache) ? options.schemaCache : [];
  const bundledDefinitions = Array.isArray(options.bundledDefinitions) ? options.bundledDefinitions : [];
  const workspaceRecords = options.workspaceRecords || [];
  const referenceRecords = options.referenceRecords || workspaceRecords;
  const preparation = prepareCanonicalTransitionProductActions({ currentRecord: record, workspaceRecords, referenceRecords, workspaceId: options.workspaceId || '', schemaCache, bundledDefinitions, productContext: options.productContext || null });
  const preparedActions = preparation.actions || [];
  const canonical = preparedActions.filter((action) => action.productCapable).map((action) => Object.freeze({ ...action, kind: CANONICAL_TRANSITION_PRODUCT_ACTION_KIND, transitionProductPreparationState: preparation.state }));
  const suppressedLegacyDefinitionIds = new Set(preparedActions.map(exactBundledCompatibilityDefinitionId).filter(Boolean));
  const legacy = transitionActionsForRecord(record, options).filter((action) => !suppressedLegacyDefinitionIds.has(action.definitionId));
  return Object.freeze([...canonical, ...legacy]);
}


export function transitionProductActionsForWorkspace(options = {}) {
  const schemaCache = Array.isArray(options.schemaCache) ? options.schemaCache : [];
  const bundledDefinitions = Array.isArray(options.bundledDefinitions) ? options.bundledDefinitions : [];
  const preparation = prepareCanonicalTransitionWorkspaceActions({
    workspaceId: options.workspaceId || '',
    schemaCache,
    bundledDefinitions
  });
  return Object.freeze((preparation.actions || []).map((action) => Object.freeze({
    ...action,
    kind: CANONICAL_TRANSITION_PRODUCT_ACTION_KIND,
    transitionProductPreparationState: preparation.state
  })));
}

export function transitionProductContextForWorkspace(options = {}) {
  return prepareCanonicalTransitionProductContext({
    workspaceRecords: Array.isArray(options.workspaceRecords) ? options.workspaceRecords : [],
    referenceRecords: Array.isArray(options.referenceRecords) ? options.referenceRecords : (Array.isArray(options.workspaceRecords) ? options.workspaceRecords : []),
    schemaCache: Array.isArray(options.schemaCache) ? options.schemaCache : [],
    bundledDefinitions: Array.isArray(options.bundledDefinitions) ? options.bundledDefinitions : []
  });
}
export function isCanonicalTransitionProductAction(action = {}) { return action?.kind === CANONICAL_TRANSITION_PRODUCT_ACTION_KIND; }

function exactBundledCompatibilityDefinitionId(action = {}) {
  const source = action.definition?.source || {};
  return action.canonicalIdentifier === 'tiinex.site.topic-to-task.v1'
    && source.sourceMode === 'bundled-canonical-transition-definition'
    && source.sourceId === CANONICAL_TOPIC_TO_TASK_BUNDLED_SOURCE_ID
    ? LEGACY_CANONICAL_PRESENTATION_COMPATIBILITY[action.canonicalIdentifier] : '';
}
