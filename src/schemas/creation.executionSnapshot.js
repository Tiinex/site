import { canonicalRootCreatedAt } from './creation.rootMetadata.js';

export const CREATION_EXECUTION_SNAPSHOT_SCHEMA_ID = 'tiinex.site.creation-execution-snapshot.v1';

export function snapshotOrdinaryCreationExecutionInput(contract = {}, input = {}, options = {}) {
  if (declaredParentInput(input?.parentRecord)) throw new Error('creation-root-parent-not-authorized');
  const creation = contract?.creation || {};
  const declaredLabels = uniqueExactLabels([...(creation.requiredInputs || []), ...(creation.optionalInputs || [])]);
  const effective = exactDeclaredValues(input, declaredLabels);
  const createdAt = canonicalRootCreatedAt(hasCreatedAt(input) ? input.createdAt : (typeof options.now === 'function' ? options.now() : new Date()));
  const authorityValues = freezeScalarMap(effective);
  const authority = Object.freeze({
    schema: CREATION_EXECUTION_SNAPSHOT_SCHEMA_ID,
    values: authorityValues,
    createdAt,
    declaredLabels: Object.freeze(declaredLabels.slice())
  });
  const executionValues = freezeScalarMap(effective);
  const executionInputs = freezeScalarMap(effective);
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

function exactDeclaredValues(input = {}, labels = []) {
  const values = objectMap(input?.values);
  const inputs = objectMap(input?.inputs);
  const out = {};
  for (const label of labels) {
    if (Object.prototype.hasOwnProperty.call(values, label)) out[label] = scalar(values[label]);
    else if (Object.prototype.hasOwnProperty.call(inputs, label)) out[label] = scalar(inputs[label]);
  }
  return out;
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
function freezeScalarMap(value = {}) { return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, scalar(item)]))); }
function scalar(value) { return typeof value === 'string' ? value : String(value ?? ''); }
function hasCreatedAt(input = {}) { return input.createdAt !== undefined && input.createdAt !== null && String(input.createdAt) !== ''; }
function declaredParentInput(record = {}) { return Boolean(record && (record.id || record.path || record.schemaId || record.currentSchemaId || record.continuationTrace)); }
