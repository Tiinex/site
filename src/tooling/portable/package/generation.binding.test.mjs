import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { compilePortableSchemaContractChain } from '../schema/contract.compile.js';
import { compilePortableSemanticPackage } from './semantic.package.js';
import { qualifyPortableExplicitGenerationBinding } from './generation.binding.js';

const schemaFixture = async (name) => readFile(new URL(`../schema/fixtures/${name}`, import.meta.url), 'utf8');
const packageFixture = async (name) => readFile(new URL(`./fixtures/${name}`, import.meta.url), 'utf8');

const rootOrdinary = await schemaFixture('tiinex.root.v1.ordinary-target.contract-fixture.md');
const schemaContract = await schemaFixture('tiinex.schema.contract.v1.repeated-record.contract-fixture.md');
const generationSchema = await packageFixture('tiinex.schema.generation.v1.generation-binding.contract-fixture.md');
const generationAuthority = await packageFixture('reference-relation-generation-authority.trace.md');
const rootMachine = await schemaFixture('tiinex.root.v1.machine-shape.contract-fixture.md');
const transitionSchema = await schemaFixture('tiinex.transition.definition.v1.field-domain.contract-fixture.md');
const packageRoot = await packageFixture('tiinex.root.v1.package-authority.contract-fixture.md');
const semanticPackageSchema = await packageFixture('tiinex.semantic.package.v1.contract-fixture.md');
const companionSchema = await packageFixture('tiinex.schema.transition.companion.v1.contract-fixture.md');
const packageTransitionSchema = await packageFixture('tiinex.transition.definition.v1.package-contract-fixture.md');

const generationContract = compilePortableSchemaContractChain([rootOrdinary, schemaContract, generationSchema]);
const transitionContract = compilePortableSchemaContractChain([rootMachine, transitionSchema]);
const packageContracts = Object.freeze({
  semanticPackage: compilePortableSchemaContractChain([packageRoot, semanticPackageSchema]),
  schemaTransitionCompanion: compilePortableSchemaContractChain([packageRoot, companionSchema]),
  transitionDefinition: compilePortableSchemaContractChain([packageRoot, packageTransitionSchema])
});

assert.equal(generationContract.schemaId, 'tiinex.schema.generation.v1');
assert.equal(generationContract.lineageQualification.state, 'valid');
assert.equal(generationContract.lineageQualification.complete, true);

// Unique relative authority: exact Markdown shape + exact supplied target + valid generation authority.
let materials = [
  mat('pkg', 'pkg/package.trace.md', packageManifest()),
  mat('tx', 'pkg/reference-transition.trace.md', transitionArtifact('[Reference generation](reference-generation.trace.md)')),
  mat('generation', 'pkg/reference-generation.trace.md', generationAuthority, {}, source('generation-source'))
];
let packageCompilation = compilePackage('pkg', materials);
assert.equal(packageCompilation.status, 'valid');
let result = qualify({ materials, packageGraph: packageCompilation.packageGraph });
assert.equal(result.qualification, 'qualified');
assert.equal(result.authority.authoritySchemaId, 'tiinex.schema.generation.v1');
assert.equal(result.authority.generationTargetSchema, 'tiinex.relation.v1');
assert.equal(result.authority.targetOutput, 'full Relation artifact draft');
assert.deepEqual(result.authority.requiredInputs.map((item) => item.name), ['Subject Binding', 'Predicate Identifier', 'Predicate Meaning', 'Object Binding', 'Directionality']);
assert.deepEqual(result.authority.generationSteps.map((item) => item.fields['Step Order']), ['10', '20', '30', '40']);
assert.equal(result.authority.outputBoundary['Output Kind'], 'filled-draft');
assert.equal(result.authority.interpretationLimits['Does Not Mean'].includes('Tooling authorizes Reference execution'), true);
assert.deepEqual(result.authority.selectedRepresentation.source, source('generation-source'));
assert.equal(result.resolution.packageQualification, 'resolved');
assert.equal(result.boundary.networkFetch, false);
assert.equal(result.boundary.repositoryFallback, false);
assert.equal(result.boundary.siteRegistryFallback, false);
assert.equal(result.boundary.creationAuthorized, false);
assert.equal(Object.isFrozen(result), true);
assert.equal(Object.isFrozen(result.authority), true);

// Exact supplied absolute/source-qualified authority resolves only through an explicit alias.
const absoluteGeneration = 'https://authority.example.test/reference-generation.trace.md';
materials = [
  mat('tx', 'pkg/reference-transition.trace.md', transitionArtifact(`[Reference generation](${absoluteGeneration})`), {}, source('tx-source')),
  mat('generation', 'authority/reference-generation.trace.md', generationAuthority, { url: absoluteGeneration }, source('absolute-generation-source'))
];
result = qualify({ materials });
assert.equal(result.qualification, 'qualified');
assert.equal(result.resolution.candidates.length, 1);
assert.equal(result.authority.selectedRepresentation.references.includes(absoluteGeneration), true);
assert.equal(result.authority.selectedRepresentation.source.id, 'absolute-generation-source');

// Missing authority: no network/repository fallback.
materials = [mat('tx', 'pkg/reference-transition.trace.md', transitionArtifact('[Missing](https://authority.example.test/missing.trace.md)'))];
result = qualify({ materials });
assert.equal(result.qualification, 'unresolved');
assert.equal(result.authority, null);
assert.equal(result.resolution.candidates.length, 0);
assert.equal(result.boundary.networkFetch, false);
assert.equal(result.boundary.repositoryFallback, false);

// Ambiguous duplicate target preserves candidate evidence but selects no authority.
materials = [
  mat('tx', 'pkg/reference-transition.trace.md', transitionArtifact('[Generation](generation.trace.md)')),
  mat('gen-a', 'pkg/generation.trace.md', generationAuthority, {}, source('a')),
  mat('gen-b', 'pkg/generation.trace.md', generationAuthority, {}, source('b'))
];
result = qualify({ materials });
assert.equal(result.qualification, 'ambiguous');
assert.equal(result.authority, null);
assert.equal(result.resolution.candidates.length, 2);
assert.deepEqual(result.resolution.candidates.map((item) => item.source.id).sort(), ['a', 'b']);

// Malformed/non-Markdown binding fails before material lookup.
materials = [mat('tx', 'pkg/reference-transition.trace.md', transitionArtifact('not-a-reference'))];
result = qualify({ materials });
assert.equal(result.qualification, 'invalid');
assert.equal(result.authority, null);
assert.equal(result.findings.some((item) => item.code === 'portable.generation-binding.reference-shape.invalid'), true);

// Wrong resolved authority schema is fail-closed.
materials = [
  mat('tx', 'pkg/reference-transition.trace.md', transitionArtifact('[Wrong](wrong.trace.md)')),
  mat('wrong', 'pkg/wrong.trace.md', generationAuthority.replace('tiinex.schema.generation.v1', 'tiinex.relation.v1'))
];
result = qualify({ materials });
assert.equal(result.qualification, 'invalid');
assert.equal(result.authority, null);
assert.equal(result.findings.some((item) => item.code === 'portable.generation-binding.authority-schema.invalid'), true);

// Invalid generation artifact: duplicate ordinary scalar authority is structurally invalid.
const invalidGeneration = generationAuthority.replace('- Generation Name: Reference relation draft generation\n', '- Generation Name: Reference relation draft generation\n- Generation Name: Duplicate generation name\n');
materials = [
  mat('tx', 'pkg/reference-transition.trace.md', transitionArtifact('[Invalid](invalid.trace.md)')),
  mat('invalid', 'pkg/invalid.trace.md', invalidGeneration)
];
result = qualify({ materials });
assert.equal(result.qualification, 'invalid');
assert.equal(result.authority, null);
assert.equal(result.findings.some((item) => item.code === 'portable.generation-binding.authority.invalid'), true);

// Scalar syntax classification B: canonical Minimal Example bare scalars are illustrative, not imported as validation authority.
// The current Root ordinary-field owner recognizes list-form scalar occurrences; the resolver must not invent a schema.generation-only parser.
const bareScalarGeneration = generationAuthority
  .replace('- Generation Handle: reference-relation-draft', 'Generation Handle: reference-relation-draft')
  .replace('- Generation Name: Reference relation draft generation', 'Generation Name: Reference relation draft generation')
  .replace('- Generation Kind: artifact-filled', 'Generation Kind: artifact-filled')
  .replace('- Target Schema: tiinex.relation.v1', 'Target Schema: tiinex.relation.v1')
  .replace('- Target Output: full Relation artifact draft', 'Target Output: full Relation artifact draft')
  .replace('- Output Kind: filled-draft', 'Output Kind: filled-draft')
  .replace('- Review State: unreviewed draft', 'Review State: unreviewed draft')
  .replace('- Does Not Mean: Tooling authorizes Reference execution or invents predicate, Parent, placement, provenance, or relation truth.', 'Does Not Mean: Tooling authorizes Reference execution or invents predicate, Parent, placement, provenance, or relation truth.')
  .replace('- Must Not Be Used To Claim: the Relation draft is validated, reviewed, persisted, published, or semantically authorized beyond the supplied Transition and generation authorities.', 'Must Not Be Used To Claim: the Relation draft is validated, reviewed, persisted, published, or semantically authorized beyond the supplied Transition and generation authorities.');
materials = [
  mat('tx', 'pkg/reference-transition.trace.md', transitionArtifact('[Bare](bare.trace.md)')),
  mat('bare', 'pkg/bare.trace.md', bareScalarGeneration)
];
result = qualify({ materials });
assert.equal(result.qualification, 'incomplete');
assert.equal(result.authority, null);
assert.equal(result.findings.some((item) => item.code === 'portable.generation-binding.authority.invalid'), true);

// Target-schema mismatch is explicit and never selected.
const wrongTarget = generationAuthority.replace('- Target Schema: tiinex.relation.v1', '- Target Schema: tiinex.task.v1');
materials = [
  mat('tx', 'pkg/reference-transition.trace.md', transitionArtifact('[Mismatch](mismatch.trace.md)')),
  mat('mismatch', 'pkg/mismatch.trace.md', wrongTarget)
];
result = qualify({ materials });
assert.equal(result.qualification, 'invalid');
assert.equal(result.authority, null);
assert.equal(result.findings.some((item) => item.code === 'portable.generation-binding.target-schema.mismatch'), true);

// Incomplete required generation surfaces remain non-authoritative.
const missingSteps = generationAuthority.replace(/## Generation Steps[\s\S]*?## Output Boundary/, '## Output Boundary');
materials = [
  mat('tx', 'pkg/reference-transition.trace.md', transitionArtifact('[Incomplete](incomplete.trace.md)')),
  mat('incomplete', 'pkg/incomplete.trace.md', missingSteps)
];
result = qualify({ materials });
assert.equal(result.qualification, 'incomplete');
assert.equal(result.authority, null);

// Relative resolution requires usable declaring path context.
materials = [
  mat('tx', '', transitionArtifact('[Generation](generation.trace.md)')),
  mat('generation', 'generation.trace.md', generationAuthority)
];
result = qualify({ materials });
assert.equal(result.qualification, 'unresolved');
assert.equal(result.authority, null);
assert.equal(result.resolution.candidates.length, 0);

// Package-boundary escape is rejected even when a physical target was supplied.
materials = [
  mat('pkg', 'pkg/package.trace.md', packageManifest()),
  mat('tx', 'pkg/reference-transition.trace.md', transitionArtifact('[Escape](../outside-generation.trace.md)')),
  mat('generation', 'outside-generation.trace.md', generationAuthority)
];
packageCompilation = compilePackage('pkg', materials);
assert.equal(packageCompilation.status, 'valid');
result = qualify({ materials, packageGraph: packageCompilation.packageGraph });
assert.equal(result.qualification, 'invalid');
assert.equal(result.authority, null);
assert.equal(result.resolution.escaped, true);

// Relative physical containment into an explicit nested package is not same-package reachability.
materials = [
  mat('pkg', 'pkg/package.trace.md', packageManifest({ included: [{ name: 'nested', reference: '[Nested](nested/package.trace.md)' }] })),
  mat('nested', 'pkg/nested/package.trace.md', packageManifest({ name: 'Nested' })),
  mat('tx', 'pkg/reference-transition.trace.md', transitionArtifact('[Nested generation](nested/generation.trace.md)')),
  mat('generation', 'pkg/nested/generation.trace.md', generationAuthority)
];
packageCompilation = compilePackage('pkg', materials);
assert.equal(packageCompilation.status, 'valid');
result = qualify({ materials, packageGraph: packageCompilation.packageGraph });
assert.equal(result.qualification, 'invalid');
assert.equal(result.authority, null);
assert.equal(result.resolution.candidates.length, 1);

// Explicit included package route permits an exact absolute authority reference.
const includedGenerationUrl = 'https://packages.example.test/nested/reference-generation.trace.md';
materials = [
  mat('pkg', 'pkg/package.trace.md', packageManifest({ included: [{ name: 'nested', reference: '[Nested](nested/package.trace.md)' }] })),
  mat('nested', 'pkg/nested/package.trace.md', packageManifest({ name: 'Nested' })),
  mat('tx', 'pkg/reference-transition.trace.md', transitionArtifact(`[Nested generation](${includedGenerationUrl})`)),
  mat('generation', 'pkg/nested/reference-generation.trace.md', generationAuthority, { url: includedGenerationUrl }, source('included-generation'))
];
packageCompilation = compilePackage('pkg', materials);
assert.equal(packageCompilation.status, 'valid');
result = qualify({ materials, packageGraph: packageCompilation.packageGraph });
assert.equal(result.qualification, 'qualified');
assert.equal(result.resolution.targetPackageKey, 'nested');
assert.equal(result.authority.selectedRepresentation.source.id, 'included-generation');

// Explicit external dependency route likewise permits an exact absolute authority reference.
const externalPackageUrl = 'https://packages.example.test/external/package.trace.md';
const externalGenerationUrl = 'https://packages.example.test/external/reference-generation.trace.md';
materials = [
  mat('pkg', 'pkg/package.trace.md', packageManifest({ external: [{ name: 'external', reference: `[External](${externalPackageUrl})` }] })),
  mat('external', 'external/package.trace.md', packageManifest({ name: 'External' }), { url: externalPackageUrl }),
  mat('tx', 'pkg/reference-transition.trace.md', transitionArtifact(`[External generation](${externalGenerationUrl})`)),
  mat('generation', 'external/reference-generation.trace.md', generationAuthority, { url: externalGenerationUrl }, source('external-generation'))
];
packageCompilation = compilePackage('pkg', materials);
assert.equal(packageCompilation.status, 'valid');
result = qualify({ materials, packageGraph: packageCompilation.packageGraph });
assert.equal(result.qualification, 'qualified');
assert.equal(result.resolution.targetPackageKey, 'external');

// An absolute supplied target in an undeclared package remains evidence, not authority.
const unreachableGenerationUrl = 'https://packages.example.test/unreachable/reference-generation.trace.md';
materials = [
  mat('pkg', 'pkg/package.trace.md', packageManifest()),
  mat('unreachable', 'unreachable/package.trace.md', packageManifest({ name: 'Unreachable' }), { url: 'https://packages.example.test/unreachable/package.trace.md' }),
  mat('tx', 'pkg/reference-transition.trace.md', transitionArtifact(`[Unreachable generation](${unreachableGenerationUrl})`)),
  mat('generation', 'unreachable/reference-generation.trace.md', generationAuthority, { url: unreachableGenerationUrl }, source('unreachable-generation'))
];
packageCompilation = compilePackage('pkg', materials);
assert.equal(packageCompilation.status, 'valid');
result = qualify({ materials, packageGraph: packageCompilation.packageGraph });
assert.equal(result.qualification, 'unresolved');
assert.equal(result.authority, null);
assert.equal(result.resolution.candidates.length, 1);
assert.equal(result.resolution.candidates[0].source.id, 'unreachable-generation');

// Caller/schema expectation contradiction is explicit.
materials = [
  mat('tx', 'pkg/reference-transition.trace.md', transitionArtifact('[Generation](generation.trace.md)', 'tiinex.task.v1')),
  mat('generation', 'pkg/generation.trace.md', generationAuthority)
];
result = qualify({ materials, expectedTargetSchema: 'tiinex.relation.v1' });
assert.equal(result.qualification, 'invalid');
assert.equal(result.findings.some((item) => item.code === 'portable.generation-binding.expected-target-schema.contradiction'), true);

// Existing target-schema path is deliberately outside this new qualifier.
materials = [mat('tx', 'pkg/reference-transition.trace.md', transitionArtifact('target-schema'))];
result = qualify({ materials });
assert.equal(result.qualification, 'invalid');
assert.equal(result.authority, null);
assert.equal(result.findings.some((item) => item.code === 'portable.generation-binding.declaration.not-explicit-reference'), true);

// Synthetic invocation keys are observable and never presented as durable global identity.
materials = [
  { path: 'pkg/reference-transition.trace.md', markdown: transitionArtifact('[Generation](generation.trace.md)') },
  { path: 'pkg/generation.trace.md', markdown: generationAuthority, source: source('synthetic-generation') }
];
result = qualifyPortableExplicitGenerationBinding({
  transitionMaterial: { representationKey: 'supplied-material:0' },
  outputRoleName: 'relation-output',
  expectedTargetSchema: 'tiinex.relation.v1',
  materials,
  transitionContract,
  generationContract
});
assert.equal(result.qualification, 'qualified');
assert.equal(result.authority.selectedRepresentation.representationKeyKind, 'synthetic-invocation');
assert.equal(result.authority.selectedRepresentation.source.id, 'synthetic-generation');

console.log('✓ explicit Generation Binding qualifier resolves exact generation authority, preserves evidence, and fails closed across package/identity/adversarial pressure');

function qualify({ materials, packageGraph = null, expectedTargetSchema = 'tiinex.relation.v1' }) {
  return qualifyPortableExplicitGenerationBinding({
    transitionMaterial: { id: 'tx' },
    outputRoleName: 'relation-output',
    expectedTargetSchema,
    materials,
    transitionContract,
    generationContract,
    packageGraph
  });
}

function compilePackage(selectedManifest, supplied) {
  return compilePortableSemanticPackage({ selectedManifest, materials: supplied, contracts: packageContracts });
}

function mat(id, path, markdown, extra = {}, materialSource = null) {
  return { id, path, markdown, ...extra, ...(materialSource ? { source: materialSource } : {}) };
}

function source(id) {
  return { id, adapterId: 'fixture', sourceKind: 'explicit-test', sourceMode: 'supplied-material' };
}

function artifact(schemaId, title, body) {
  return `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: ${schemaId}\n  - Created At: 2026-08-19 00:00:00\n\n---\n\n# ${title}\n\n${body.trim()}\n`;
}

function transitionArtifact(generationBinding, schemaConstraint = 'tiinex.relation.v1') {
  return artifact('tiinex.transition.definition.v1', 'Reference transition pressure', `
## Output Roles

- relation-output
  - Meaning: durable non-parent relation output
  - Minimum Count: 1
  - Maximum Count: 1
  - Target Kind: artifact
  - Schema Constraint: ${schemaConstraint}
  - Generation Binding: ${generationBinding}
`);
}

function packageManifest(options = {}) {
  const included = options.included ?? [];
  const external = options.external ?? [];
  return artifact('tiinex.semantic.package.v1', options.name || 'Package', `
## Package Identity

- Package Name: ${options.name || 'Package'}
- Purpose: Explicit generation authority pressure fixture

## Package Boundary

- Boundary Root: manifest-directory
- Discovery Policy: recursive-within-boundary
- Nested Package Policy: explicit-only

## Included Packages

${declarationList(included, 'Package Reference')}

## External Package Dependencies

${declarationList(external, 'Package Reference')}

## Schema Resolution Bindings

- none

## Interpretation Limits

- Does Not Mean: package ownership of generation or Transition semantics
- Must Not Be Used To Claim: applicability, creation authorization, execution, placement, or persistence
`);
}

function declarationList(items, field) {
  if (!items.length) return '- none';
  return items.map((item) => `- ${item.name}\n  - ${field}: ${item.reference}`).join('\n');
}
