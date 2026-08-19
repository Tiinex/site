import { immutableInvocationValue } from './transition.invocationBindingPacket.js';
const freeze = Object.freeze;
export function planGenerationInputs(outputRole, creation = {}, entries = []) {
  const required = new Set(creation.requiredInputs || []), optional = new Set(creation.optionalInputs || []), tooling = new Set(creation.toolingConfigurationFields || []);
  const declared = new Set([...required, ...optional]), plans = [];
  let state = 'resolved', reasonCode = '';
  for (const name of declared) {
    const matches = entries.filter((entry) => entry.name === name);
    let inputState = 'resolved', reason = '';
    if (matches.length > 1) { inputState = 'invalid'; reason = 'duplicate-generation-input'; }
    else if (!matches.length || !matches[0].hasValue) { inputState = required.has(name) ? 'incomplete' : 'optional-unbound'; reason = required.has(name) ? 'required-generation-input-missing' : 'optional-generation-input-unbound'; }
    state = stronger(state, inputState);
    if (!reasonCode && ['invalid', 'unresolved', 'incomplete'].includes(inputState)) reasonCode = reason;
    plans.push(freeze({ name, required: required.has(name), state: inputState, reason, value: matches[0]?.hasValue ? immutableInvocationValue(matches[0].value) : undefined }));
  }
  const unclaimed = entries.filter((entry) => !declared.has(entry.name)).map((entry) => freeze({ name: entry.name, hasValue: entry.hasValue, value: entry.hasValue ? immutableInvocationValue(entry.value) : undefined, category: tooling.has(entry.name) ? 'tooling-configuration' : 'unclaimed-extra' }));
  return freeze({ state, reason: reasonCode, plans: freeze(plans), unclaimed: freeze(unclaimed), outputRole });
}
function stronger(left, right) { const normalize = (s) => ['resolved', 'optional-unbound'].includes(s) ? 'qualified' : s; const order = ['invalid','unresolved','incomplete','qualified']; const a=normalize(left), b=normalize(right); return order.indexOf(a) <= order.indexOf(b) ? (a === 'qualified' ? 'resolved' : a) : (b === 'qualified' ? 'resolved' : b); }
