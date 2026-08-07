import { transitionDefinitionsForRecord } from './transition.definitions.js';

export const TRANSITION_ACTION_PRESENTATION_CONTRACT_ID = 'tiinex.transition.action.presentation.v1';
export const RECORD_TRANSITION_ACTION_PREFIX = 'record.transition';

export function transitionActionsForRecord(record = {}, options = {}) {
  const maxPrimary = Number.isFinite(Number(options.maxPrimary)) ? Math.max(0, Number(options.maxPrimary)) : 1;
  const definitions = transitionDefinitionsForRecord(record, options);
  const primary = definitions.filter((definition) => definition.presentation?.placement === 'primary');
  const grouped = definitions.filter((definition) => definition.presentation?.placement !== 'primary');
  const picked = primary.slice(0, maxPrimary).concat(maxPrimary > primary.length ? grouped.slice(0, maxPrimary - primary.length) : []);
  return picked.map((definition) => transitionActionForDefinition(definition));
}

export function transitionActionForDefinition(definition = {}) {
  const presentation = definition.presentation || {};
  const intentLabel = intentDisplayLabel(definition.intent);
  const label = presentation.tooltip || `${intentLabel} · ${definition.label || definition.shortLabel || definition.id}`;
  return Object.freeze({
    id: transitionActionId(definition.id),
    label,
    shortLabel: definition.shortLabel || definition.label || definition.id,
    icon: presentation.icon || iconForIntent(definition.intent),
    enabled: definition.status === 'active',
    contract: TRANSITION_ACTION_PRESENTATION_CONTRACT_ID,
    capabilityStatus: 'implemented',
    produces: definition.resultSchema || definition.resultKind || '',
    intent: definition.intent || '',
    group: presentation.group || intentLabel,
    definitionId: definition.id || '',
    presentation,
    transitionDefinition: definition
  });
}

export function isTransitionAction(action = {}) {
  return Boolean(action?.transitionDefinition || String(action?.id || '').startsWith(`${RECORD_TRANSITION_ACTION_PREFIX}:`));
}

export function transitionActionId(definitionId = '') {
  return `${RECORD_TRANSITION_ACTION_PREFIX}:${String(definitionId || '').trim()}`;
}

function intentDisplayLabel(intent = '') {
  const value = String(intent || '').trim().toLowerCase();
  if (value === 'continue') return 'Continue';
  if (value === 'reference') return 'Reference';
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Transition';
}

function iconForIntent(intent = '') {
  const value = String(intent || '').trim().toLowerCase();
  if (value === 'reference') return 'reference';
  if (value === 'continue') return 'continue';
  return 'more';
}
