export function representativeCreationValue(name, index, binding = {}, validationContract = null) {
  const sentinel = `TIINEX_CREATE_INPUT_${index + 1}_${sentinelToken(name)}`;
  if (binding?.kind === 'ordinary-field') return representativeScalarForField(validationContract, binding.group, binding.field || name, sentinel);
  if (binding?.kind === 'ordinary-group') {
    return Object.freeze(Object.fromEntries((binding.requiredFields || []).map((field, fieldIndex) => [field, representativeScalarForField(validationContract, binding.group, field, `${sentinel}_${fieldIndex + 1}`)])));
  }
  if (binding?.kind === 'named-declaration-section') {
    const fields = Object.freeze(Object.fromEntries((binding.requiredFields || []).map((field, fieldIndex) => [field, representativeScalarForField(validationContract, binding.group, field, `${sentinel}_${fieldIndex + 1}`)])));
    return Object.freeze([Object.freeze({ name: `entry-${index + 1}`, fields })]);
  }
  return sentinel;
}

export function qualifyStructuredCreationInputFidelity(requiredInputs = [], inputBindings = [], values = {}, validation = {}) {
  const findings = [];
  for (const name of requiredInputs) {
    const binding = inputBindings.find((item) => String(item?.input || '') === String(name || ''));
    if (!binding || !Object.prototype.hasOwnProperty.call(values, name)) continue;
    if (binding.kind === 'ordinary-field') qualifyOrdinaryField(findings, name, binding, values[name], validation);
    else if (binding.kind === 'ordinary-group') qualifyOrdinaryGroup(findings, name, binding, values[name], validation);
    else if (binding.kind === 'named-declaration-section') qualifyDeclarationSection(findings, name, binding, values[name], validation);
  }
  return findings;
}

function representativeScalarForField(validationContract = null, group = '', field = '', fallback = 'TIINEX_CREATE_VALUE') {
  const contributions = (validationContract?.constraints || []).filter((item) => item?.kind === 'field-domain' && String(item?.targetGroup || item?.sourceGroup || '') === String(group || '') && String(item?.field || '') === String(field || '') && String(item?.authorityQualification || 'valid') === 'valid');
  const closed = contributions.filter((item) => String(item?.domainPolicy || '') === 'closed');
  if (closed.length) {
    const candidateSets = closed.map((item) => [...(item.allowedValues || [])]);
    const shared = (candidateSets[0] || []).find((value) => candidateSets.every((set) => set.includes(value)));
    if (shared !== undefined) return String(shared);
  }
  return String(fallback);
}

function qualifyOrdinaryField(findings, name, binding, expected, validation) {
  const group = (validation.ordinaryGroups || []).find((item) => String(item?.group || '') === String(binding.group || ''));
  const field = (group?.fields || []).find((item) => String(item?.label || '') === String(binding.field || name));
  const occurrences = field?.occurrences || [];
  if (occurrences.length !== 1 || String(occurrences[0]?.value || '') !== String(expected)) findings.push(`Required input ${name} was not preserved exactly in ordinary field ${binding.group}.${binding.field || name}.`);
}

function qualifyOrdinaryGroup(findings, name, binding, expectedValue, validation) {
  const group = (validation.ordinaryGroups || []).find((item) => String(item?.group || '') === String(binding.group || ''));
  const expected = expectedValue && typeof expectedValue === 'object' && !Array.isArray(expectedValue) ? expectedValue : {};
  for (const [fieldName, fieldValue] of Object.entries(expected)) {
    const field = (group?.fields || []).find((item) => String(item?.label || '') === String(fieldName));
    const occurrences = field?.occurrences || [];
    if (occurrences.length !== 1 || String(occurrences[0]?.value || '') !== String(fieldValue)) findings.push(`Required input ${name}.${fieldName} was not preserved exactly in ordinary group ${binding.group}.`);
  }
}

function qualifyDeclarationSection(findings, name, binding, expected, validation) {
  const declaration = (validation.declarations || []).find((item) => String(item?.contract?.group || '') === String(binding.group || ''));
  const section = (declaration?.sections || []).find((item) => String(item?.heading || '').replace(/^##\s+/, '') === String(binding.section || ''));
  if (typeof expected === 'string' && expected === 'none') {
    const entries = section?.entries || [];
    if (!(entries.length === 1 && String(entries[0]?.name || '') === 'none')) findings.push(`Required input ${name} literal none was not preserved exactly in declaration section ${binding.section}.`);
    return;
  }
  if (!Array.isArray(expected)) return;
  const entries = section?.entries || [];
  if (entries.length !== expected.length) { findings.push(`Required input ${name} declaration count was not preserved exactly in ${binding.section}.`); return; }
  for (let index = 0; index < expected.length; index += 1) {
    const expectedEntry = expected[index] || {};
    const observed = entries[index] || {};
    if (String(observed.name || '') !== String(expectedEntry.name || '')) findings.push(`Required input ${name} declaration name at index ${index} was not preserved exactly.`);
    for (const [fieldName, fieldValue] of Object.entries(expectedEntry.fields || {})) if (String(observed.fields?.[fieldName] || '') !== String(fieldValue)) findings.push(`Required input ${name}.${expectedEntry.name || index}.${fieldName} was not preserved exactly.`);
  }
}

function sentinelToken(value = '') { return String(value || '').toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'INPUT'; }
