export const INTERPRETATION_REQUIRED_SECTIONS = Object.freeze([
  'Interpretation Source',
  'Interpreted As',
  'Interpretation Basis',
  'Resulting Artifact Boundary',
  'Uncertainty And Review',
  'Interpretation Limits'
]);

export const INTERPRETATION_CREATION_FIELDS = Object.freeze([
  'Source Target',
  'Source Role',
  'Target Role',
  'Interpretation Action',
  'Rationale',
  'Observed Basis',
  'Original Mutation Policy',
  'Result Boundary',
  'Uncertainty',
  'Review Need',
  'Does Not Prove',
  'Must Not Be Treated As'
]);

export const INTERPRETATION_SECTION_FIELDS = Object.freeze([
  Object.freeze(['Interpretation Source', Object.freeze(['Source Target', 'Source Role'])]),
  Object.freeze(['Interpreted As', Object.freeze(['Target Role', 'Interpretation Action'])]),
  Object.freeze(['Interpretation Basis', Object.freeze(['Rationale', 'Observed Basis'])]),
  Object.freeze(['Resulting Artifact Boundary', Object.freeze(['Original Mutation Policy', 'Result Boundary'])]),
  Object.freeze(['Uncertainty And Review', Object.freeze(['Uncertainty', 'Review Need'])]),
  Object.freeze(['Interpretation Limits', Object.freeze(['Does Not Prove', 'Must Not Be Treated As'])])
]);

export const INTERPRETATION_CANONICAL_SOURCE = Object.freeze({
  repository: 'Tiinex/docs',
  commit: '053d46ce082d4ec261b82abc44ecca403d61e240',
  path: '.topics/.schemas/core/interpretation/tiinex.interpretation.v1.schema.md',
  gitBlob: '330d8668e78cd6d164a76093982b02f616fd6ab4',
  sha256: '977a46d67eb4e3e8ce383f7f33efbf10798122cc3f94e5b948c084a9af311017'
});
