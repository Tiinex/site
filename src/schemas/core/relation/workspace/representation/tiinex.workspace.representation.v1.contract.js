export const WORKSPACE_REPRESENTATION_REQUIRED_SECTIONS = Object.freeze([
  'Representation Binding',
  'Representation Correlation',
  'Provider Qualification',
  'Relation Boundary',
  'Interpretation Limits'
]);

export const WORKSPACE_REPRESENTATION_REQUIRED_FIELDS = Object.freeze({
  'Representation Binding': Object.freeze(['Workspace Artifact', 'Representation Payload', 'Representation Kind', 'Coverage', 'Binding State']),
  'Representation Correlation': Object.freeze(['Workspace Tree Root', 'Workspace Artifact Inner Path', 'Archive Entry Root', 'Path Mapping', 'Collision Policy', 'Decoder Requirement']),
  'Provider Qualification': Object.freeze(['Activation Rule', 'Payload Integrity Requirement', 'Coverage Requirement', 'Staleness Rule', 'Selection Rule', 'Multi-Workspace Isolation']),
  'Relation Boundary': Object.freeze(['Parent Boundary', 'Workspace Identity Boundary', 'Payload Identity Boundary', 'Transport Boundary', 'Outer Integrity Boundary']),
  'Interpretation Limits': Object.freeze(['Does Not Prove', 'Must Not Be Used As'])
});

export const WORKSPACE_REPRESENTATION_FIXED_VALUES = Object.freeze({
  'Representation Kind': Object.freeze(['exact-workspace-byte-tree-archive']),
  Coverage: Object.freeze(['complete', 'partial', 'unknown']),
  'Binding State': Object.freeze(['verified', 'declared', 'stale', 'unresolved']),
  'Path Mapping': Object.freeze(['identity-relative-paths', 'manifest']),
  'Collision Policy': Object.freeze(['reject-ambiguous-or-unsafe-paths']),
  'Activation Rule': Object.freeze(['verified-complete-only']),
  'Payload Integrity Requirement': Object.freeze(['verified-exact-payload-bytes']),
  'Coverage Requirement': Object.freeze(['complete']),
  'Staleness Rule': Object.freeze(['requalify-on-binding-relevant-change']),
  'Selection Rule': Object.freeze(['exactly-one-binding-per-workspace']),
  'Multi-Workspace Isolation': Object.freeze(['independent-binding-closure'])
});
