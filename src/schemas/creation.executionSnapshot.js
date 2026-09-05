import { canonicalRootCreatedAt } from './creation.rootMetadata.js';

export const CREATION_EXECUTION_SNAPSHOT_SCHEMA_ID = 'tiinex.site.creation-execution-snapshot.v1';

export function snapshotOrdinaryCreationExecutionInput(contract = {}, input = {}, options = {}) {
  if (declaredParentInput(input?.parentRecord)) throw new Error('creation-root-parent-not-authorized');
  const creation = contract?.creation || {};
  const declaredLabels = uniqueExactLabels([...(creation.requiredInputs || []), ...(creation.optionalInputs || [])]);
  const bindings = new Map((creation.inputBindings || []).map((item) => [String(item?.input || ''), item]));
  const effective = exactDeclaredValues(input, declaredLabels, bindings);
  const createdAt = canonicalRootCreatedAt(hasCreatedAt(input) ? input.createdAt : (typeof options.now === 'function' ? options.now() : new Date()));
  const authorityValues = freezeCreationMap(effective);
  const authority = Object.freeze({
    schema: CREATION_EXECUTION_SNAPSHOT_SCHEMA_ID,
    values: authorityValues,
    createdAt,
    declaredLabels: Object.freeze(declaredLabels.slice())
  });
  const executionValues = freezeCreationMap(effective);
  const executionInputs = freezeCreationMap(effective);
  const implementationInput = Object.freeze({
    values: executionValues,
    inputs: executionInputs,
    createdAt,
    ...(input.title !== undefined ? { title: scalar(input.title) } : {}),
    ...(input.summary !== undefined ? { summary: scalar(input.summary) } : {}),
    ...(input.authors !== undefined ? { authors: scalar(input.authors) } : {}),
    ...(input.why !== undefined ? { why: scalar(input.why) } : {}),
    ...(input.status !== undefined ? { status: scalar(input.status) } : {}),
    ...(input.bodyMarkdown !== undefined ? { bodyMarkdown: scalar(input.bodyMarkdown) } : {})
  });
  return Object.freeze({ authority, implementationInput });
}

function exactDeclaredValues(input = {}, labels = [], bindings = new Map()) {
  const values = objectMap(input?.values);
  const inputs = objectMap(input?.inputs);
  const out = {};
  for (const label of labels) {
    const binding = bindings.get(label) || null;
    if (Object.prototype.hasOwnProperty.call(values, label)) out[label] = snapshotCreationValue(values[label], binding);
    else if (Object.prototype.hasOwnProperty.call(inputs, label)) out[label] = snapshotCreationValue(inputs[label], binding);
  }
  return out;
}
function snapshotCreationValue(value, binding = null) {
  const kind = String(binding?.kind || '');
  if (kind === 'ordinary-group') return freezeStructuredObject(value, binding?.input || 'value');
  if (kind === 'named-declaration-section') {
    if (typeof value === 'string') return scalar(value);
    if (!Array.isArray(value)) throw new Error(`creation-declaration-list-required:${binding?.input || 'value'}`);
    return Object.freeze(value.map((entry) => freezeStructuredObject(entry, binding?.input || 'value')));
  }
  return scalar(value);
}
function freezeStructuredObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`creation-structured-object-required:${label}`);
  return deepFreezeJson(value);
}
function deepFreezeJson(value) {
  if (!value || typeof value !== 'object') return scalar(value);
  if (Array.isArray(value)) return Object.freeze(value.map(deepFreezeJson));
  const out = {};
  for (const [key, item] of Object.entries(value)) out[key] = deepFreezeJson(item);
  return Object.freeze(out);
}
function uniqueExactLabels(values = []) {
  const out = [];
  for (const value of values) {
    const label = String(value || '');
    if (label && !out.includes(label)) out.push(label);
  }
  return out;
}
function objectMap(value) { return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
function freezeCreationMap(value = {}) { return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, deepFreezeJson(item)]))); }
function scalar(value) { return typeof value === 'string' ? value : String(value ?? ''); }
function hasCreatedAt(input = {}) { return input.createdAt !== undefined && input.createdAt !== null && String(input.createdAt) !== ''; }
function declaredParentInput(record = {}) { return Boolean(record && (record.id || record.path || record.schemaId || record.currentSchemaId || record.continuationTrace)); }
