import { hasConcreteInvocationValue, immutableInvocationValue } from './transition.invocationBindingPacket.js';

const freeze = Object.freeze;
const NONE = freeze([]);

export function planExplicitGeneration({ role = {}, declared = '', generationInputs = [], explicitAuthorities = [] } = {}) {
  const targetSchema = token(role.schemaConstraint);
  if (!targetSchema || role.schemaConstraintQualification !== 'resolved') return generationPlan(declared, 'unresolved', 'explicit-generation-target-schema-unresolved');
  if (explicitAuthorities.length > 1) return generationPlan(declared, 'invalid', 'duplicate-explicit-generation-authority-entry');
  if (!explicitAuthorities.length) return generationPlan(declared, 'unresolved', 'explicit-generation-authority-missing');
  const qualification = explicitAuthorities[0]?.qualification || {};
  const state = token(qualification.qualification);
  if (state !== 'qualified') {
    const mapped = state === 'invalid' || state === 'ambiguous' ? 'invalid' : state === 'incomplete' ? 'incomplete' : 'unresolved';
    return generationPlan(declared, mapped, `explicit-generation-authority-${state || 'unresolved'}`);
  }
  if (token(qualification.outputRoleName) !== token(role.name)) return generationPlan(declared, 'invalid', 'explicit-generation-output-role-mismatch');
  if (token(qualification.declaredBinding) !== declared) return generationPlan(declared, 'invalid', 'explicit-generation-binding-mismatch');
  if (token(qualification.expectedTargetSchema) !== targetSchema) return generationPlan(declared, 'invalid', 'explicit-generation-expected-target-schema-mismatch');
  if (token(qualification.authority?.generationTargetSchema) !== targetSchema) return generationPlan(declared, 'invalid', 'explicit-generation-authority-target-schema-mismatch');
  if (token(qualification.authority?.authoritySchemaId) !== 'tiinex.schema.generation.v1') return generationPlan(declared, 'invalid', 'explicit-generation-authority-schema-mismatch');
  if (qualification.resolution?.qualification !== 'resolved' || (qualification.resolution?.candidates || []).length !== 1) return generationPlan(declared, 'invalid', 'explicit-generation-resolution-not-exact');
  const selected = qualification.authority?.selectedRepresentation || null;
  const resolved = qualification.resolution.candidates[0] || null;
  if (!selected || stableJson(selected) !== stableJson(resolved)) return generationPlan(declared, 'invalid', 'explicit-generation-authority-source-mismatch');
  if (!qualification.declaringRepresentation?.representationKey || !qualification.declaringRepresentation?.path) return generationPlan(declared, 'invalid', 'explicit-generation-declaring-source-unresolved');
  const requiredInputs = freeze((qualification.authority?.requiredInputs || []).map((item) => token(item?.name)).filter(Boolean));
  if (!requiredInputs.length) return generationPlan(declared, 'incomplete', 'explicit-generation-required-input-surface-missing');
  const inputs = planInputs(requiredInputs, generationInputs);
  return freeze({
    declared, authority: 'explicit-reference', reference: declared, state: inputs.state, reason: inputs.reason,
    compiledSchemaId: targetSchema, lineageQualification: null, requiredInputs, optionalInputs: NONE, requiredSections: NONE,
    toolingConfigurationFields: NONE, creationGroups: NONE, inputPlans: inputs.plans, unclaimedInputs: inputs.unclaimed,
    explicitQualification: freeze({ qualification: state, declaringRepresentation: qualification.declaringRepresentation, selectedRepresentation: selected, generationIdentity: qualification.authority?.generationIdentity || null, targetOutput: qualification.authority?.targetOutput || '', outputBoundary: qualification.authority?.outputBoundary || null, interpretationLimits: qualification.authority?.interpretationLimits || null, generationSteps: qualification.authority?.generationSteps || NONE }),
    draftRendered: false, executable: false
  });
}

function planInputs(requiredInputs, entries) {
  const required = new Set(requiredInputs);
  const plans = [];
  let state = 'resolved', reason = '';
  for (const name of required) {
    const matches = entries.filter((entry) => entry.name === name);
    let inputState = 'resolved', inputReason = '';
    if (matches.length > 1) { inputState = 'invalid'; inputReason = 'duplicate-generation-input'; }
    else if (!matches.length || !hasConcreteInvocationValue(matches[0])) { inputState = 'incomplete'; inputReason = 'required-generation-input-missing'; }
    state = stronger(state, inputState);
    if (!reason && inputState !== 'resolved') reason = inputReason;
    plans.push(freeze({ name, required: true, state: inputState, reason: inputReason, value: matches[0] && hasConcreteInvocationValue(matches[0]) ? immutableInvocationValue(matches[0].value) : undefined }));
  }
  const unclaimed = entries.filter((entry) => !required.has(entry.name)).map((entry) => freeze({ name: entry.name, hasValue: hasConcreteInvocationValue(entry), value: hasConcreteInvocationValue(entry) ? immutableInvocationValue(entry.value) : undefined, category: 'unclaimed-extra' }));
  return freeze({ state, reason, plans: freeze(plans), unclaimed: freeze(unclaimed) });
}
function generationPlan(declared, state, reason) { return freeze({ declared, authority: 'explicit-reference', reference: declared, state, reason, compiledSchemaId: '', lineageQualification: null, requiredInputs: NONE, optionalInputs: NONE, requiredSections: NONE, toolingConfigurationFields: NONE, creationGroups: NONE, inputPlans: NONE, unclaimedInputs: NONE, draftRendered: false, executable: false }); }
function stronger(a, b) { const order = ['invalid', 'unresolved', 'incomplete', 'resolved']; return order.indexOf(a) <= order.indexOf(b) ? a : b; }
function stableJson(value) { return JSON.stringify(value ?? null); }
function token(value = '') { return String(value || '').trim(); }
