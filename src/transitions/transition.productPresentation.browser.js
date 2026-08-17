import { transitionProductActionsForRecord as transitionProductActionsForRecordPure, isCanonicalTransitionProductAction, CANONICAL_TRANSITION_PRODUCT_ACTION_KIND, LEGACY_CANONICAL_PRESENTATION_COMPATIBILITY } from './transition.productPresentation.js';
import { BUNDLED_CANONICAL_TRANSITION_DEFINITIONS, BUNDLED_CANONICAL_TRANSITION_SCHEMA_CACHE } from './canonicalTransition.productDefaults.js';

export { isCanonicalTransitionProductAction, CANONICAL_TRANSITION_PRODUCT_ACTION_KIND, LEGACY_CANONICAL_PRESENTATION_COMPATIBILITY };
export function transitionProductActionsForRecord(record = {}, options = {}) {
  return transitionProductActionsForRecordPure(record, {
    ...options,
    schemaCache: options.schemaCache || BUNDLED_CANONICAL_TRANSITION_SCHEMA_CACHE,
    bundledDefinitions: options.bundledDefinitions || BUNDLED_CANONICAL_TRANSITION_DEFINITIONS
  });
}
