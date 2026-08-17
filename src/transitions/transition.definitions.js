import { companionForRecord } from '../schemas/companion.js';
import {
  LEGACY_TRANSITION_SHORTHAND_CONTRACT_ID,
  LEGACY_TRANSITION_INTENTS,
  LEGACY_TRANSITION_PRESENTATION_VARIANTS,
  LEGACY_TRANSITION_ICON_TOKENS,
  normalizeLegacyTransitionDefinition,
  validateLegacyTransitionDefinitions
} from './transition.legacyShorthand.js';

// Backward-compatible exports for the frozen v404 consumer API. The emitted
// objects are explicitly site-local legacy shorthand, not canonical S1
// tiinex.transition.definition.v1 instances.
export const TRANSITION_DEFINITION_CONTRACT_ID = LEGACY_TRANSITION_SHORTHAND_CONTRACT_ID;
export const TRANSITION_INTENTS = LEGACY_TRANSITION_INTENTS;
export const TRANSITION_PRESENTATION_VARIANTS = LEGACY_TRANSITION_PRESENTATION_VARIANTS;
export const TRANSITION_ICON_TOKENS = LEGACY_TRANSITION_ICON_TOKENS;

export function transitionDefinitionsForRecord(record = {}, options = {}) {
  const companion = companionForRecord(record);
  return transitionDefinitionsForSchemaModule(companion, options).filter((definition) => transitionAvailableForRecord(definition, record));
}

export function transitionDefinitionsForSchemaModule(module = {}, options = {}) {
  const raw = typeof module?.transitions === 'function' ? module.transitions(options) : module?.transitions;
  const items = Array.isArray(raw) ? raw : Object.values(raw || {});
  return items
    .map((item) => normalizeLegacyTransitionDefinition(item, module))
    .filter((definition) => definition.status === 'active')
    .sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id));
}

export const normalizeTransitionDefinition = normalizeLegacyTransitionDefinition;
export const validateTransitionDefinitions = validateLegacyTransitionDefinitions;

function transitionAvailableForRecord(definition = {}, record = {}) {
  const sourceMode = String(record.sourceMode || '').trim();
  const sourceBacked = sourceMode === 'source-backed' || record.source?.adapterId === 'github';
  const sourceModes = definition.availability?.sourceModes || [];
  if (!sourceModes.length) return true;
  return sourceModes.some((mode) => {
    if (mode === 'source-backed') return sourceBacked;
    if (mode === 'local-*') return sourceMode.startsWith('local') || record.source?.adapterId === 'local';
    return mode === sourceMode;
  });
}
