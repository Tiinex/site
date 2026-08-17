import { transitionActionsForRecord } from './transition.presentation.js';
import { prepareCanonicalTransitionProductActions } from './transition.productPreparation.js';

export const CANONICAL_TRANSITION_PRODUCT_ACTION_KIND = 'canonical-transition-product';
export const LEGACY_CANONICAL_PRESENTATION_COMPATIBILITY = Object.freeze({
  'tiinex.site.topic-to-task.v1': 'topic.continue.task'
});

export function transitionProductActionsForRecord(record = {}, options = {}) {
  const schemaCache = Array.isArray(options.schemaCache) ? options.schemaCache : [];
  const bundledDefinitions = Array.isArray(options.bundledDefinitions) ? options.bundledDefinitions : [];
  const preparation = prepareCanonicalTransitionProductActions({ currentRecord: record, workspaceRecords: options.workspaceRecords || [], workspaceId: options.workspaceId || '', schemaCache, bundledDefinitions });
  const canonical = (preparation.actions || []).filter((action) => action.productCapable).map((action) => Object.freeze({ ...action, kind: CANONICAL_TRANSITION_PRODUCT_ACTION_KIND, transitionProductPreparationState: preparation.state }));
  const suppressedLegacyDefinitionIds = new Set(canonical.map(exactBundledCompatibilityDefinitionId).filter(Boolean));
  const legacy = transitionActionsForRecord(record, options).filter((action) => !suppressedLegacyDefinitionIds.has(action.definitionId));
  return Object.freeze([...canonical, ...legacy]);
}
export function isCanonicalTransitionProductAction(action = {}) { return action?.kind === CANONICAL_TRANSITION_PRODUCT_ACTION_KIND; }

function exactBundledCompatibilityDefinitionId(action = {}) {
  const source = action.definition?.source || {};
  return action.canonicalIdentifier === 'tiinex.site.topic-to-task.v1'
    && source.sourceMode === 'bundled-canonical-transition-definition'
    && source.sourceArtifactPath === 'src/transitions/definitions/topic-to-task-transition-definition.trace.md'
    ? LEGACY_CANONICAL_PRESENTATION_COMPATIBILITY[action.canonicalIdentifier] : '';
}
