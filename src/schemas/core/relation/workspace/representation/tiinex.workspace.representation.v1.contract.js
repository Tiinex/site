export const WORKSPACE_REPRESENTATION_REQUIRED_SECTIONS = Object.freeze([
  'Representation Binding',
  'Representation Correlation',
  'Provider Qualification',
  'Relation Boundary',
  'Interpretation Limits'
]);

export const WORKSPACE_REPRESENTATION_SCOPE_FIELDS = Object.freeze([
  'Scope Basis',
  'Included Entry Authority',
  'Omitted Entry Meaning',
  'Source Membership Claim',
  'Recovery Closure Boundary'
]);

export const WORKSPACE_REPRESENTATION_REQUIRED_FIELDS = Object.freeze({
  'Representation Binding': Object.freeze(['Workspace Artifact', 'Representation Payload', 'Representation Kind', 'Coverage', 'Binding State']),
  'Representation Correlation': Object.freeze(['Workspace Tree Root', 'Workspace Artifact Inner Path', 'Archive Entry Root', 'Path Mapping', 'Collision Policy', 'Decoder Requirement']),
  'Provider Qualification': Object.freeze(['Activation Rule', 'Payload Integrity Requirement', 'Coverage Requirement', 'Staleness Rule', 'Selection Rule', 'Multi-Workspace Isolation']),
  'Relation Boundary': Object.freeze(['Parent Boundary', 'Workspace Identity Boundary', 'Payload Identity Boundary', 'Transport Boundary', 'Outer Integrity Boundary']),
  'Interpretation Limits': Object.freeze(['Does Not Prove', 'Must Not Be Used As'])
});

export const WORKSPACE_REPRESENTATION_FIXED_VALUES = Object.freeze({
  'Representation Kind': Object.freeze(['exact-workspace-byte-tree-archive', 'exact-bounded-workspace-byte-tree-archive']),
  Coverage: Object.freeze(['complete', 'bounded', 'partial', 'unknown']),
  'Binding State': Object.freeze(['verified', 'declared', 'stale', 'unresolved']),
  'Scope Basis': Object.freeze(['exact-representation-entry-set']),
  'Included Entry Authority': Object.freeze(['qualified-decoded-entry-set']),
  'Omitted Entry Meaning': Object.freeze(['outside-representation-not-absent-from-workspace']),
  'Source Membership Claim': Object.freeze(['represented-entries-are-workspace-relative-source-bytes']),
  'Recovery Closure Boundary': Object.freeze(['separate-qualified-closure']),
  'Path Mapping': Object.freeze(['identity-relative-paths', 'manifest']),
  'Collision Policy': Object.freeze(['reject-ambiguous-or-unsafe-paths']),
  'Activation Rule': Object.freeze(['verified-complete-only', 'verified-bounded-only']),
  'Payload Integrity Requirement': Object.freeze(['verified-exact-payload-bytes']),
  'Coverage Requirement': Object.freeze(['complete', 'bounded']),
  'Staleness Rule': Object.freeze(['requalify-on-binding-relevant-change']),
  'Selection Rule': Object.freeze(['exactly-one-binding-per-workspace', 'explicit-binding-per-bounded-scope']),
  'Multi-Workspace Isolation': Object.freeze(['independent-binding-closure'])
});

export const WORKSPACE_REPRESENTATION_READY_CONTRACTS = Object.freeze({
  complete: Object.freeze({
    representationKind: 'exact-workspace-byte-tree-archive',
    activationRule: 'verified-complete-only',
    coverageRequirement: 'complete',
    selectionRule: 'exactly-one-binding-per-workspace'
  }),
  bounded: Object.freeze({
    representationKind: 'exact-bounded-workspace-byte-tree-archive',
    activationRule: 'verified-bounded-only',
    coverageRequirement: 'bounded',
    selectionRule: 'explicit-binding-per-bounded-scope'
  })
});
