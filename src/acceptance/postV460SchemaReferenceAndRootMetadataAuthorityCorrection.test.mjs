import assert from 'node:assert/strict';
import { buildArtifactCreationContract, createArtifactDraftMarkdown, validateArtifactCreationResult } from '../schemas/creation.contracts.js';
import { executeArtifactCreationCapability } from '../schemas/creation.capability.js';
import { genericArtifactCreationImplementation } from '../schemas/creation.renderer.js';
import { qualifySchemaReferenceValue, renderSchemaReference, schemaReferenceAuthorityFromBinding } from '../schemas/schema.reference.js';
import { schemaRegistry } from '../schemas/registry.js';
import { sealC14nV2Self } from '../integrity/integrity.c14nV2.js';

const taskModule = schemaRegistry.modules.find((item) => item.id === 'tiinex.task.v1');
const topicModule = schemaRegistry.modules.find((item) => item.id === 'tiinex.topic.v1');
const task = buildArtifactCreationContract({ schemaId: taskModule.id, module: taskModule });
const topic = buildArtifactCreationContract({ schemaId: topicModule.id, module: topicModule });
const taskValues = { Summary: 'v460 reference truth', Objective: 'objective', 'Done Criteria': 'done', Scope: 'scope', Dependencies: 'deps' };
const topicValues = { Summary: 'v460 topic', 'Current Read': 'read', 'Design Direction': 'direction', 'Next Artifacts': 'next' };
const baseline = createArtifactDraftMarkdown(task, { values: taskValues, createdAt: '2026-08-20T00:00:00Z' });
assert(baseline);

// A — identifier truth and target truth are distinct; plain exact ids remain legal.
const plainEnvelope = reseal(baseline.replace(/^- Envelope Schema:.*$/m, '- Envelope Schema: tiinex.root.v1'));
assert.equal(validate(plainEnvelope, task), true, 'Plain exact Root schema id must qualify');
for (const [label, mutate] of [
  ['wrong Root id plain', (md) => md.replace(/^- Envelope Schema:.*$/m, '- Envelope Schema: tiinex.task.v1')],
  ['wrong Root id link', (md) => md.replace(/^- Envelope Schema:.*$/m, '- Envelope Schema: [tiinex.task.v1](https://example.invalid/task.schema.md)')],
  ['Root exact id unrelated target', (md) => md.replace(/^- Envelope Schema:.*$/m, '- Envelope Schema: [tiinex.root.v1](evil.schema.md)')],
  ['Current exact id unrelated target', (md) => md.replace(/^  - Current Schema:.*$/m, '  - Current Schema: [tiinex.task.v1](evil.schema.md)')],
  ['Current wrong id', (md) => md.replace(/^  - Current Schema:.*$/m, '  - Current Schema: tiinex.topic.v1')]
]) assert.equal(validate(reseal(mutate(baseline)), task), false, label);

const exactRootTarget = task.schemaReferences.envelope.preferredTarget;
assert(exactRootTarget, 'Root binding exposes an exact immutable reference target');
assert.equal(qualifySchemaReferenceValue(`[tiinex.root.v1](${exactRootTarget})`, task.schemaReferences.envelope).state, 'qualified');
assert.equal(qualifySchemaReferenceValue('[tiinex.root.v1](evil.schema.md)', task.schemaReferences.envelope).targetState, 'unqualified');

const topicMarkdown = createArtifactDraftMarkdown(topic, { values: topicValues, createdAt: '2026-08-20T00:00:00Z' });
assert(topic.schemaReferences.current.preferredTarget, 'Topic exact immutable binding target is available');
assert(topicMarkdown.includes(`Current Schema: ${renderSchemaReference(topic.schemaReferences.current)}`), 'qualified exact Current Schema target is preserved');
assert.equal(validate(topicMarkdown, topic), true);

// B — v476 rebinds Task to the proven current Tiinex/docs material; future unqualified origins still remain Plain Schema Id.
assert.equal(task.schemaReferences.current.preferredTarget, 'https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md', 'Task exact creation is now byte-bound to current Tiinex/docs authority');
assert(baseline.includes('  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)'));
assert.equal(baseline.includes('[tiinex.task.v1](tiinex.task.v1.schema.md)'), false);
const futureAuthority = schemaReferenceAuthorityFromBinding('example.future.v1', {
  schemaId: 'example.future.v1',
  sourceRepository: 'Example/schemas',
  sourceCommit: 'viewer-local-or-external',
  sourcePath: 'deep/non-colocated/custom-name.trace.md'
});
assert.equal(futureAuthority.preferredTarget, '');
assert.equal(renderSchemaReference(futureAuthority), 'example.future.v1');
assert.equal(renderSchemaReference(futureAuthority).includes('example.future.v1.schema.md'), false);

// C1 — omitted Created At is bound once before renderer + concrete qualifier consume it.
const omitted = executeArtifactCreationCapability(taskModule, 'create-artifact', task, { values: taskValues });
assert.equal(omitted.state, 'rendered');
assert.equal(omitted.qualification.executionMetadataFidelity.state, 'qualified');
assert.match(omitted.qualification.executionMetadataFidelity.createdAt.expected, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
assert.equal(omitted.qualification.executionMetadataFidelity.createdAt.observed, omitted.qualification.executionMetadataFidelity.createdAt.expected);

// C2 — generic Root Create does not invent target-schema envelope extension vocabulary.
assert.deepEqual(task.requiredEnvelope.currentFields, ['Current Schema', 'Created At', 'Summary']);
assert.equal(/^  - Status:/m.test(baseline), false, 'generic ordinary Create must not serialize undeclared Status');
assert.equal(/^  - Why:/m.test(baseline), false, 'generic ordinary Create must not serialize target envelope extension Why');
assert.equal(validate(baseline, task), true);

// Security/future-origin guard: schema reference authority is data-only and immutable-target-qualified.
const rendererSource = genericArtifactCreationImplementation.execute.toString();
assert.equal(rendererSource.includes('eval('), false);
assert.equal(rendererSource.includes('Function('), false);

console.log('post-v460 schema reference + Root metadata authority correction: PASS');

function validate(markdown, contract) {
  return validateArtifactCreationResult({ schemaId: contract.target.schemaId, status: 'local', sourceMode: 'local-create', markdown }, {}, { contract }).ok;
}
function reseal(markdown) {
  const sealed = sealC14nV2Self(markdown);
  assert.equal(sealed.state, 'sealed');
  return sealed.markdown;
}
