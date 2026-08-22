import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { createPortableLocalDraft } from './draft.create.js';
import { validateArtifact } from '../../../validation/validateArtifact.js';
import { buildArtifactCreationContract } from '../../../schemas/creation.contracts.js';
import { explicitSchemaReferenceAuthority, schemaReferenceAuthoritiesForCreation } from '../../../schemas/creation.schemaReferences.js';
import { defineBundledSchemaSource } from '../../../schemas/schema.source.js';
import { qualifySchemaReferenceMaterialCoherence, renderSchemaReference, schemaReferenceAuthorityFromBinding } from '../../../schemas/schema.reference.js';
import { resolveSchemaModule } from '../../../schemas/resolver.js';

const TOPIC = 'https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/topic/tiinex.topic.v1.schema.md';
const TOPIC_SHA = 'b6fe9893d9ce66734ab249a22796ca77de75f441a4b6eaa3352ad75a1c2405df';
const TOPIC_BLOB = 'c36472b0d20ad97d01cc1ca78a50fc69ce35fdae';
const PRE_LOADED_SHA = 'd5fb337e126a1953967161b240dd18e8395bd9197f1f3c8f1b9b7c5b26ce77d4';
const PRE_LOADED_BLOB = '1032ab61c04163da231b4e3a40e7186c33df9486';
const values = Object.freeze({
  Summary: 'v478 loaded material identity closure',
  'Current Read': 'Creation and reopen consume one truthful Topic authority.',
  'Design Direction': 'Keep external reference, loaded semantic bytes, and resolver material as separate truths.',
  'Next Artifacts': 'Continue only from qualified material evidence.'
});

// Primary pre-mutation oracle modeled from the captured baseline facts: loaded bytes and binding blob metadata disagreed.
const staleBinding = Object.freeze({
  schemaId: 'tiinex.topic.v1', sourceRepository: 'Tiinex/docs', sourceCommit: '52ecdea0a75893882ce282214d155f70e1309c2a',
  sourcePath: '.topics/.schemas/core/topic/tiinex.topic.v1.schema.md', sourceBlobSha: TOPIC_BLOB,
  checksum: Object.freeze({ algorithm: 'sha256', value: PRE_LOADED_SHA }), snapshotCompleteness: 'grounded-contract-excerpt-snapshot'
});
const staleProjection = Object.freeze({
  schema: 'tiinex.site.schema-runtime-projection.v1', generator: 'v478-baseline-oracle', schemaId: 'tiinex.topic.v1',
  sourceChecksum: PRE_LOADED_SHA, sourceBlobSha: PRE_LOADED_BLOB, sourceBytes: 5901, bindingChecksum: PRE_LOADED_SHA,
  validationContract: null, creation: Object.freeze({ groupNames: Object.freeze([]), requiredInputs: Object.freeze([]), optionalInputs: Object.freeze([]), requiredSections: Object.freeze([]), toolingConfigurationFields: Object.freeze([]), inputBindings: Object.freeze([]), requiredShape: Object.freeze([]) })
});
const staleSourceQualification = defineBundledSchemaSource(staleBinding, staleProjection, { assetUrl: 'fixture:v478-preloaded-topic' }).qualify();
assert.equal(staleSourceQualification.state, 'qualified', 'loaded semantic material remains usable even when external binding metadata is stale');
assert.equal(staleSourceQualification.materialIdentity.sha256, PRE_LOADED_SHA);
assert.equal(staleSourceQualification.materialIdentity.sourceBlobSha, PRE_LOADED_BLOB, 'loaded material identity must come from actual loaded bytes/projection, never copied binding sourceBlobSha');
assert.equal(staleSourceQualification.bindingMaterialCoherence.state, 'unavailable');
const staleFallback = schemaReferenceAuthorityFromBinding('tiinex.topic.v1', staleBinding, staleSourceQualification.authority, staleSourceQualification);
assert.equal(staleFallback.materialBoundTarget, false);
const preFalsePassAttempt = explicitSchemaReferenceAuthority({
  schemaId: 'tiinex.topic.v1', preferredTarget: TOPIC, exactTargets: [TOPIC], resolutionState: 'qualified',
  resolutionEvidence: { gitBlobSha: TOPIC_BLOB }
}, staleFallback);
assert.equal(preFalsePassAttempt.preferredTarget, TOPIC, 'external reference identity survives failed qualification');
assert.equal(qualifySchemaReferenceMaterialCoherence(preFalsePassAttempt).state, 'unavailable', 'flat stale binding blob metadata is not resolver/material proof');

// Topic migration: bundled bytes are byte-exact to the independently verified current 053d representation.
const bundledTopic = fs.readFileSync(new URL('../../../schemas/core/topic/tiinex.topic.v1.schema.md', import.meta.url));
const canonicalCache = fs.readFileSync(new URL('../../../transitions/canonical-schema-cache/52ecdea0a75893882ce282214d155f70e1309c2a/tiinex.topic.v1.schema.md', import.meta.url));
const sha256 = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
const gitBlob = (bytes) => crypto.createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${bytes.length}\0`), bytes])).digest('hex');
assert.deepEqual(bundledTopic, canonicalCache, 'Site bundled Topic must be byte-exact to the cached canonical blob independently verified at docs@053d');
assert.equal(sha256(bundledTopic), TOPIC_SHA);
assert.equal(gitBlob(bundledTopic), TOPIC_BLOB);
const topicModule = resolveSchemaModule({ schemaId: 'tiinex.topic.v1' }).module;
const topicSource = topicModule.schemaSource.qualify();
assert.equal(topicSource.materialIdentity.sha256, TOPIC_SHA);
assert.equal(topicSource.materialIdentity.sourceBlobSha, TOPIC_BLOB);
assert.equal(topicSource.bindingMaterialCoherence.state, 'qualified');
assert.equal(topicModule.binding.sourceCommit, '053d46ce082d4ec261b82abc44ecca403d61e240');
assert.equal(topicModule.binding.snapshotCompleteness, 'exact-canonical-docs-snapshot');
const topicRefs = schemaReferenceAuthoritiesForCreation(topicModule);
assert.equal(topicRefs.current.preferredTarget, TOPIC);
assert.equal(topicRefs.current.materialBoundTarget, true);
assert.equal(topicRefs.current.resolutionState, 'qualified');

// Exact current Topic root both creates and reopens against the same ordinary validation authority.
const created = createPortableLocalDraft({ schemaId: 'tiinex.topic.v1', path: '.topics/v478-topic-root.trace.md', values, createdAt: '2026-08-21 23:30:00' });
assert.equal(created.status, 'created-clean');
assert.equal(created.qualification.exactCreateToolingApplied, true);
assert.equal(created.qualification.exactRuntimeValidation, true);
assert(created.draft.markdown.includes(`  - Current Schema: [tiinex.topic.v1](${TOPIC})`));
const reopened = validateArtifact({ markdown: created.draft.markdown, path: created.draft.path });
assert.equal(reopened.findings.some((finding) => finding.code === 'schema.reference.unqualified'), false, JSON.stringify(reopened.findings));
assert.equal(reopened.findings.some((finding) => finding.severity === 'error'), false, JSON.stringify(reopened.findings));
assert.equal(reopened.validation.semanticContract.state, 'valid');

// A different immutable reference qualifies only through explicit resolver material proof and is never rewritten.
const alternate = 'https://mirror.example.test/immutable/topic-053d.schema.md';
const equivalent = createPortableLocalDraft({
  schemaId: 'tiinex.topic.v1', path: '.topics/v478-topic-alternate.trace.md', values, createdAt: '2026-08-21 23:31:00',
  schemaReferences: { current: {
    schemaId: 'tiinex.topic.v1', preferredTarget: alternate, exactTargets: [alternate], resolutionState: 'qualified',
    resolutionEvidence: { state: 'qualified', target: alternate, kind: 'resolver-material', materialIdentity: { state: 'qualified', sha256: TOPIC_SHA, gitBlobSha: TOPIC_BLOB, bytes: bundledTopic.length } }
  } }
});
assert.equal(equivalent.status, 'created-clean');
assert(equivalent.draft.markdown.includes(`  - Current Schema: [tiinex.topic.v1](${alternate})`));
assert.equal(equivalent.draft.markdown.includes(TOPIC), false, 'resolver material may qualify the caller reference but must not replace it with registered target identity');

const mismatch = buildArtifactCreationContract({ schemaId: 'tiinex.topic.v1', schemaReferences: { current: {
  schemaId: 'tiinex.topic.v1', preferredTarget: 'https://mirror.example.test/wrong-topic.schema.md', exactTargets: ['https://mirror.example.test/wrong-topic.schema.md'], resolutionState: 'qualified',
  resolutionEvidence: { state: 'qualified', target: 'https://mirror.example.test/wrong-topic.schema.md', materialIdentity: { state: 'qualified', sha256: '0'.repeat(64), gitBlobSha: '1'.repeat(40), bytes: bundledTopic.length } }
} } });
assert.equal(qualifySchemaReferenceMaterialCoherence(mismatch.schemaReferences.current).state, 'unavailable');

const unresolvedTarget = 'https://mirror.example.test/unresolved-topic.schema.md';
const unresolved = buildArtifactCreationContract({ schemaId: 'tiinex.topic.v1', schemaReferences: { current: {
  schemaId: 'tiinex.topic.v1', preferredTarget: unresolvedTarget, exactTargets: [unresolvedTarget], resolutionState: 'unresolved'
} } });
assert.equal(unresolved.schemaReferences.current.preferredTarget, unresolvedTarget);
assert.equal(qualifySchemaReferenceMaterialCoherence(unresolved.schemaReferences.current).state, 'unavailable');
const unresolvedCreate = createPortableLocalDraft({ schemaId: 'tiinex.topic.v1', path: '.topics/v478-topic-unresolved.trace.md', values, createdAt: '2026-08-21 23:32:00', schemaReferences: { current: unresolved.schemaReferences.current } });
assert.equal(unresolvedCreate.status, 'blocked');
assert.equal(unresolvedCreate.draft, null);

// v480 explicitly migrates Evidence to its verified e713 exact-canonical representation; the v478 rule still applies, now positively because loaded bytes prove the binding.
const evidenceModule = resolveSchemaModule({ schemaId: 'tiinex.evidence.v1' }).module;
const evidenceSource = evidenceModule.schemaSource.qualify();
assert.equal(evidenceSource.bindingMaterialCoherence.state, 'qualified');
assert.equal(evidenceSource.materialIdentity.sourceBlobSha, '430367bb717d93e396a50c993dc011f8d129bf54');
const evidenceRefs = schemaReferenceAuthoritiesForCreation(evidenceModule);
assert.equal(evidenceRefs.current.materialBoundTarget, true);
assert.equal(evidenceRefs.current.resolutionState, 'qualified');

// Provider-neutral schema-id-only material remains valid without any external target.
const customSemantic = Object.freeze({ state: 'qualified', materialIdentity: Object.freeze({ state: 'qualified', schemaId: 'vendor.custom.v1', sha256: 'a'.repeat(64), sourceBlobSha: 'b'.repeat(40), bytes: 123 }), bindingMaterialCoherence: Object.freeze({ state: 'unavailable' }) });
const customAuthority = schemaReferenceAuthorityFromBinding('vendor.custom.v1', { schemaId: 'vendor.custom.v1' }, null, customSemantic);
assert.equal(customAuthority.targetAuthority, 'schema-id-only');
assert.equal(customAuthority.preferredTarget, '');
assert.equal(renderSchemaReference(customAuthority), 'vendor.custom.v1');
assert.equal(qualifySchemaReferenceMaterialCoherence(customAuthority).state, 'qualified');

const taskValues = Object.freeze({ Summary: 'Task exact preserved', Objective: 'Preserve Task authoring.', 'Done Criteria': 'Task stays exact.', Scope: 'v478 regression only.', Dependencies: 'Qualified Task authority.' });
const task = createPortableLocalDraft({ schemaId: 'tiinex.task.v1', path: '.topics/v478-task-root.trace.md', values: taskValues, createdAt: '2026-08-21 23:33:00' });
assert.equal(task.status, 'created-clean');
assert.equal(task.qualification.exactRuntimeValidation, true);

console.log('✓ v478 schema source loaded-material identity/reference coherence: stale binding metadata cannot prove bytes, Topic 053d create+reopen agrees, resolver-equivalent references qualify without rewrite, unresolved/mismatch fail closed, schema-id-only remains provider-neutral');
