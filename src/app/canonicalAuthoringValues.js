export function canonicalAuthoringSubmissionValues(action = {}, inputValues = {}) {
  const fixedInputs = action?.authoring?.fixedInputs || {};
  return Object.freeze({ ...(inputValues || {}), ...fixedInputs });
}
