import assert from 'node:assert/strict';
import { validatePortableDraft } from './draft.operations.js';
import { validateArtifact } from '../../../validation/validateArtifact.js';
import { sealC14nV2Self } from '../../../integrity/integrity.c14nV2.js';
import { resolveSchemaModule } from '../../../schemas/resolver.js';
import { portableRuntimeValidationContractForSchema } from '../schema/qualifiedLocalRoot.runtime.js';
import { readLegacyArtifactFixtureSync } from '../fixtures/legacyArtifactFixtures.mjs';

const dogfood = '.topics/development/tooling/dogfood';
const v475Path = `${dogfood}/002-1-v475-canonical-artifact-envelope-reference-integrity-validation.trace.md`;
const v476Path = `${dogfood}/003-1-v476-canonical-authority-binding-integrity-method-lineage-alloca.trace.md`;
const v471Path = `${dogfood}/001-1-site-tooling-v471-portable-lineage-authoring-closure-result.trace.md`;
const v475 = readLegacyArtifactFixtureSync(v475Path);
const v476 = readLegacyArtifactFixtureSync(v476Path);
const v471 = readLegacyArtifactFixtureSync(v471Path);

const taskModule = resolveSchemaModule({ schemaId: 'tiinex.task.v1' }).module;
const compiled = taskModule.schemaSource.qualify().compiledContract.validationContract;
assert.equal(compiled.lineageQualification.state, 'valid');
assert.deepEqual(compiled.lineage, ['tiinex.root.v1', 'tiinex.task.v1']);
assert(compiled.validation.conditionalRequirements.some((item) => item.name === 'Parent Origin' && item.requiredWhen.includes('Parent exists') && item.requiredFields.includes('browse + git')), 'historical published schema-source contract remains unchanged');
const projected = portableRuntimeValidationContractForSchema('tiinex.task.v1');
assert.equal(projected.state, 'qualified');
assert(projected.compiledContract.validation.conditionalRequirements.some((item) => item.name === 'Parent Origin' && item.requiredWhen.includes('Parent exists') && item.requiredFields.length === 0));
assert(!projected.compiledContract.validation.conditionalRequirements.some((item) => item.name === 'Parent Origin' && item.requiredFields.includes('browse + git')));

const localOnly = validatePortableDraft({ markdown: v476, path: v476Path, schemaId: 'tiinex.task.v1' });
assert.equal(localOnly.status, 'clean', 'reopened v476 local continuity must qualify under the corrected local Root runtime projection');
assert.equal(localOnly.audit.validation.readability.state, 'readable');
assert.equal(localOnly.audit.validation.localContinuity.state, 'readable-local-continuity');
assert.equal(localOnly.audit.validation.semanticContract.state, 'valid');
assert.equal(localOnly.audit.validation.integrity.state, 'verified');
assert.equal(localOnly.qualification.exactRuntimeValidation, false);
assert(!localOnly.findings.some((item) => item.code === 'portable.contract.conditional.field.required.missing'), 'local-only relative Parent Origin must not require fabricated publication authority');

const published = validatePortableDraft({ markdown: v475, path: v475Path, schemaId: 'tiinex.task.v1' });
assert.equal(published.status, 'clean', 'published-parent v475 oracle must remain contract-valid');
assert.equal(published.audit.validation.semanticContract.state, 'valid');
assert.equal(published.audit.validation.integrity.state, 'verified');
assert.equal(published.structural.authority, 'qualified-current-root-descendant-compiled-contract');

function validateMutation(name, mutate, code) {
  const changed = mutate(v475);
  const resealed = changed.includes('sha256-base64url-c14n-v2') ? sealC14nV2Self(changed).markdown : changed;
  const result = validateArtifact({ markdown: resealed, validationContractOverride: projected.compiledContract });
  assert(result.findings.some((item) => item.code === code), `${name} must surface ${code}: ${JSON.stringify(result.findings)}`);
  return result;
}

validateMutation('duplicate required relative', (md) => md.replace(
  '    - [relative](002-site-tooling-v475-canonical-artifact-envelope-reference-integrity-validation-closure.trace.md)',
  '    - [relative](002-site-tooling-v475-canonical-artifact-envelope-reference-integrity-validation-closure.trace.md)\n    - [relative](002-site-tooling-v475-canonical-artifact-envelope-reference-integrity-validation-closure.trace.md)'
), 'root.parent.origin.label.duplicate');

const alternateChanged = v475.replace('[relative](', '[archive mirror](');
const alternate = validateArtifact({ markdown: sealC14nV2Self(alternateChanged).markdown, validationContractOverride: projected.compiledContract });
assert(alternate.findings.some((item) => item.code === 'portable.contract.conditional.label.unknown.preserved'));

const browseOnlyChanged = v475.replace(/^    - \[relative\].*\n/m, '');
const browseOnly = validateArtifact({ markdown: sealC14nV2Self(browseOnlyChanged).markdown, validationContractOverride: projected.compiledContract });
assert(!browseOnly.findings.some((item) => item.severity === 'error'), `browse-only external recovery shape must remain structurally valid under Root: ${JSON.stringify(browseOnly.findings)}`);

validateMutation('empty Parent Origin', (md) => md.replace(/^    - \[relative\].*\n/m, '').replace(/^    - \[browse \+ git\].*\n/m, ''), 'root.parent.origin.missing');

validateMutation('record Trace', (md) => md.replace(
  '  - Trace: [002-site-tooling-v475-canonical-artifact-envelope-reference-integrity-validation-closure.trace.md](002-site-tooling-v475-canonical-artifact-envelope-reference-integrity-validation-closure.trace.md)',
  '  - Trace: record:published-parent'
), 'portable.contract.field-shape.no-match');

validateMutation('broken schema target', (md) => md.replace(
  '  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)',
  '  - Current Schema: [tiinex.task.v1](tiinex.task.v1.schema.md)'
), 'schema.reference.locator.unresolved');

validateMutation('plain maintained method id', (md) => md.replace(
  '- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.validators/sha256-base64url-c14n-v2.validator.md)',
  '- sha256-base64url-c14n-v2'
), 'integrity.method-reference.unqualified');

const historical = validatePortableDraft({ markdown: v471, path: v471Path, schemaId: 'tiinex.task.v1' });
assert.equal(historical.status, 'clean', 'v479 canonically repairs the former historical negative fixture in place');
assert.equal(historical.audit.validation.semanticContract.state, 'valid');
assert.equal(historical.audit.validation.integrity.state, 'verified');
assert(historical.findings.some((item) => item.code === 'root.repairs.declared'), 'v479 repair provenance must remain visible while v477 validation semantics stay intact');

const custom = `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: vendor.custom.v1\n  - Created At: 2026-08-21 22:30:00\n\n---\n\n# Custom\n\n## Future Extension\n\n- Unknown Field: preserved\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.validators/sha256-base64url-c14n-v2.validator.md)\n  - Towards: self\n  - Value: \n`;
const customSealed = sealC14nV2Self(custom).markdown;
const customValidation = validateArtifact({ markdown: customSealed });
assert.equal(customValidation.validation.semanticContract.state, 'unavailable', 'custom/provider-neutral schema without qualified compiled contract must remain unavailable, not inherit Task semantics');
assert(customValidation.findings.some((item) => item.code === 'audit.validator.unavailable'));
assert.equal(customValidation.parsed.body.sections.includes('Future Extension'), true, 'unknown custom material remains readable/preserved');

console.log('✓ qualified local Root runtime projection: relative-only local and browse-only versioned Parent recovery are structurally valid, empty recovery fails, and historical published schema-source identity remains unchanged');
