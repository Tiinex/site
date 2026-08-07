import { companionForRecord } from '../schemas/companion.js';

export const TRANSITION_DEFINITION_CONTRACT_ID = 'tiinex.transition.definition.v1';
export const TRANSITION_INTENTS = Object.freeze({
  continue: 'continue',
  reference: 'reference',
  custom: 'custom'
});
export const TRANSITION_PRESENTATION_VARIANTS = Object.freeze(['icon-only', 'icon-label', 'label-only', 'auto']);
export const TRANSITION_ICON_TOKENS = Object.freeze(['continue', 'reference', 'task', 'decision', 'evidence', 'feedback', 'more']);

export function transitionDefinitionsForRecord(record = {}, options = {}) {
  const companion = companionForRecord(record);
  return transitionDefinitionsForSchemaModule(companion, options).filter((definition) => transitionAvailableForRecord(definition, record));
}

export function transitionDefinitionsForSchemaModule(module = {}, options = {}) {
  const raw = typeof module?.transitions === 'function' ? module.transitions(options) : module?.transitions;
  const items = Array.isArray(raw) ? raw : Object.values(raw || {});
  return items
    .map((item) => normalizeTransitionDefinition(item, module))
    .filter((definition) => definition.status === 'active')
    .sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id));
}

export function normalizeTransitionDefinition(input = {}, module = {}) {
  const fromSchema = String(input.fromSchema || module.id || '').trim();
  const id = String(input.id || '').trim();
  const intent = normalizeIntent(input.intent);
  const resultSchema = String(input.resultSchema || input.toSchema || '').trim();
  const resultKind = String(input.resultKind || '').trim();
  const label = String(input.label || '').trim();
  const shortLabel = String(input.shortLabel || label || '').trim();
  const availability = normalizeAvailability(input.availability);
  const resultBoundary = normalizeResultBoundary(input.resultBoundary);
  const presentation = normalizePresentation(input.presentation, { intent, label, shortLabel });
  const findings = [];

  if (!id) findings.push(error('transition.id.required', 'Transition definition requires an id.'));
  if (!fromSchema) findings.push(error('transition.fromSchema.required', 'Transition definition requires fromSchema.'));
  if (!intent) findings.push(error('transition.intent.required', 'Transition definition requires a supported intent.'));
  if (!resultSchema && !resultKind) findings.push(error('transition.result.required', 'Transition definition requires resultSchema or resultKind.'));
  if (!label) findings.push(error('transition.label.required', 'Transition definition requires a label.'));
  if (!presentation.group) findings.push(error('transition.presentation.group.required', 'Transition presentation requires a group.'));
  if (presentation.variant === 'icon-only' && !presentation.tooltip) findings.push(error('transition.presentation.tooltip.required', 'Icon-only transition actions require tooltip text.'));
  if (presentation.variant === 'icon-only' && !presentation.ariaLabel) findings.push(error('transition.presentation.ariaLabel.required', 'Icon-only transition actions require aria-label text.'));
  if (presentation.icon && !TRANSITION_ICON_TOKENS.includes(presentation.icon)) findings.push(error('transition.presentation.icon.unknown', `Unknown transition icon token: ${presentation.icon}.`));
  if (resultBoundary.remoteWrite !== false) findings.push(error('transition.boundary.remoteWrite.blocked', 'Initial transition definitions must not remote write.'));
  if (resultBoundary.sourceMutation !== 'none') findings.push(error('transition.boundary.sourceMutation.blocked', 'Initial transition definitions must not mutate source material.'));
  if (resultBoundary.mayInheritParentSource !== false) findings.push(error('transition.boundary.sourceInheritance.blocked', 'Transition drafts must not inherit parent source objects.'));

  return Object.freeze({
    schema: TRANSITION_DEFINITION_CONTRACT_ID,
    id,
    fromSchema,
    intent,
    resultSchema,
    resultKind,
    label,
    shortLabel,
    priority: Number.isFinite(Number(input.priority)) ? Number(input.priority) : 0,
    availability,
    resultBoundary,
    presentation,
    status: findings.some((finding) => finding.severity === 'error') ? 'invalid' : 'active',
    findings: Object.freeze(findings)
  });
}

export function validateTransitionDefinitions(definitions = []) {
  const findings = [];
  const seen = new Set();
  for (const definition of Array.isArray(definitions) ? definitions : []) {
    const normalized = definition?.schema === TRANSITION_DEFINITION_CONTRACT_ID ? definition : normalizeTransitionDefinition(definition);
    if (seen.has(normalized.id)) findings.push(error('transition.id.duplicate', `Duplicate transition id: ${normalized.id}.`));
    if (normalized.id) seen.add(normalized.id);
    findings.push(...(normalized.findings || []));
  }
  return Object.freeze({ ok: !findings.some((finding) => finding.severity === 'error'), findings: Object.freeze(findings) });
}

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

function normalizeIntent(value = '') {
  const intent = String(value || '').trim().toLowerCase();
  return Object.values(TRANSITION_INTENTS).includes(intent) ? intent : '';
}

function normalizeAvailability(value = {}) {
  return Object.freeze({
    sourceModes: Object.freeze(normalizeStringList(value.sourceModes)),
    parentKinds: Object.freeze(normalizeStringList(value.parentKinds)),
    requiresEditableParent: Boolean(value.requiresEditableParent)
  });
}

function normalizeResultBoundary(value = {}) {
  return Object.freeze({
    mode: String(value.mode || 'browser-local-draft').trim(),
    sourceMutation: String(value.sourceMutation || 'none').trim(),
    remoteWrite: Boolean(value.remoteWrite),
    mayInheritParentSource: Boolean(value.mayInheritParentSource)
  });
}

function normalizePresentation(value = {}, { intent = '', label = '', shortLabel = '' } = {}) {
  const variant = TRANSITION_PRESENTATION_VARIANTS.includes(value.variant) ? value.variant : 'auto';
  return Object.freeze({
    group: String(value.group || groupFromIntent(intent)).trim(),
    placement: String(value.placement || 'overflow').trim(),
    variant,
    icon: String(value.icon || '').trim(),
    tooltip: String(value.tooltip || '').trim(),
    ariaLabel: String(value.ariaLabel || '').trim(),
    mobileLabel: String(value.mobileLabel || shortLabel || label || '').trim()
  });
}

function groupFromIntent(intent = '') {
  if (intent === TRANSITION_INTENTS.continue) return 'Continue';
  if (intent === TRANSITION_INTENTS.reference) return 'Reference';
  return 'More';
}

function normalizeStringList(value) {
  if (!value) return [];
  return (Array.isArray(value) ? value : [value]).map((item) => String(item || '').trim()).filter(Boolean);
}

function error(code, message) { return Object.freeze({ severity: 'error', code, message, source: TRANSITION_DEFINITION_CONTRACT_ID }); }
