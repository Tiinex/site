import assert from 'node:assert/strict';
import fs from 'node:fs';
import { canonicalC14nV2SelfState, sealC14nV2Self, sha256Base64Url } from '../integrity/integrity.c14nV2.js';
import { validateArtifact } from '../validation/validateArtifact.js';
import { taskSchemaModule } from '../schemas/core/task/tiinex.task.v1.schema.js';
import { TASK_CANONICAL_BODY_SECTIONS } from '../schemas/core/task/tiinex.task.v1.contract.js';
import { qualifyCanonicalTaskLocalArtifact, renderCanonicalTaskLocalArtifact } from '../transitions/transition.taskMaterializer.js';
import { runLocalDraftUpdateCommand } from '../app/localDraftMutationCommand.js';
import '../workspaces/workspace.lifecycle.js';

const read = (path) => fs.readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
const rootSchema = read('src/transitions/canonical-schema-cache/d69b8ff55a56b8cb9282b8684db6a938a4435b94/tiinex.root.v1.schema.md');
const taskSchema = read('src/schemas/core/task/tiinex.task.v1.schema.md');
const parent = Object.freeze({
  state: 'qualified', finalized: true, schemaId: 'tiinex.topic.v1',
  trace: '../001.trace.md', origin: 'local:workspace/001.trace.md',
  traceTarget: '../001.trace.md', originTarget: 'local:workspace/001.trace.md'
});
const values = Object.freeze({
  Summary: 'Canonical Task', Objective: 'Do ONE bounded thing.', 'Done Criteria': 'The bounded thing is complete.', Scope: 'Only the local Task slice.', Dependencies: 'One source-backed Topic.'
});
const now = new Date('2026-08-18T08:00:00.000Z');

assert.equal(sha256Base64Url('abc'), 'ungWv48Bz-pBQUDeXa4iI7ADYaOWF3qctBD_YfIAFa0', 'browser-safe SHA-256 base64url implementation matches the standard vector');
assert.equal(canonicalC14nV2SelfState(taskSchema).state, 'verified', 'Site c14n-v2 engine reproduces the source-qualified canonical Task schema self seal');
assert.deepEqual(taskSchemaModule.read.sections, TASK_CANONICAL_BODY_SECTIONS, 'Task read companion exposes the canonical Task sections');
assert.deepEqual(taskSchemaModule.read.sections, ['Objective', 'Done Criteria', 'Scope', 'Dependencies']);

const renderedA = renderCanonicalTaskLocalArtifact({ values, parent, now });
assert.equal(renderedA.state, 'rendered');
assert.match(renderedA.markdown, /- sha256-base64url-c14n-v2\n  - Towards: self\n  - Value: [A-Za-z0-9_-]{43}/);
assert.equal(renderedA.markdown.includes('local-transition-canonical-v1'), false, 'canonical Task no longer claims a non-content-derived self method');
assert.equal(canonicalC14nV2SelfState(renderedA.markdown).state, 'verified');

const validationA = validateArtifact({ markdown: renderedA.markdown });
assert.equal(validationA.validation.state, 'exact-schema-validated');
assert.equal(validationA.validation.coverage, 'compiled-machine-contract+schema-companion');
assert.equal(validationA.findings.some((finding) => finding.code === 'task.nextStep.missing'), false, 'canonical Task has no stale Next Step warning');
assert.equal(validationA.findings.some((finding) => finding.code === 'task.body.canonical'), true, 'canonical Task shape is recognized');
assert.equal(validationA.findings.some((finding) => finding.code === 'integrity.c14n-v2.verified'), true, 'ordinary runtime validation verifies the self digest');
assert.equal(validationA.findings.some((finding) => finding.code === 'integrity.c14n-v2.mismatch'), false);

const qualifiedA = qualifyCanonicalTaskLocalArtifact({ markdown: renderedA.markdown, schemaMaterials: [rootSchema, taskSchema], values, parent, path: '001-canonical-task.trace.md' });
assert.equal(qualifiedA.state, 'qualified', 'canonical materializer qualification requires and accepts a verified self seal');

const valuesB = Object.freeze({ ...values, Objective: 'Do a COMPLETELY DIFFERENT bounded thing.' });
const renderedB = renderCanonicalTaskLocalArtifact({ values: valuesB, parent, now });
assert.equal(renderedB.state, 'rendered');
assert.notEqual(renderedA.integrityValue, renderedB.integrityValue, 'different Task content with identical Parent/timestamp cannot share the same self-integrity value');

const mutatedWithOldSeal = renderedA.markdown.replace(values.Objective, valuesB.Objective);
const mutationValidation = validateArtifact({ markdown: mutatedWithOldSeal });
assert.equal(mutationValidation.findings.some((finding) => finding.code === 'integrity.c14n-v2.mismatch'), true, 'body mutation invalidates the old self seal');
assert.equal(mutationValidation.findings.some((finding) => finding.code === 'integrity.c14n-v2.verified'), false, 'mutated body cannot retain verified integrity');
const mutatedQualification = qualifyCanonicalTaskLocalArtifact({ markdown: mutatedWithOldSeal, schemaMaterials: [rootSchema, taskSchema], values: valuesB, parent, path: '001-mutated.trace.md' });
assert.equal(mutatedQualification.state, 'invalid', 'materializer qualification fails when body values match but self-integrity is stale');

const lifecycle = globalThis.TiinexWorkspaceLifecycle;
const workspaceCreated = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { name: 'Canonical Task Edit' }, { clock: () => '2026-08-18T08:00:00.000Z' });
const canonicalDraft = Object.assign({}, qualifiedA.record, { id: 'canonical-task-edit', sourceMode: 'local-transition-canonical', status: 'local', source: { id: 'local:canonical-task-edit', kind: 'local-session', adapterId: 'local' } });
const canonicalAdded = lifecycle.addWorkspaceRecord(workspaceCreated.state, workspaceCreated.workspace.id, canonicalDraft);
assert.equal(canonicalAdded.ok, true);
const canonicalEdited = runLocalDraftUpdateCommand({ lifecycle, state: canonicalAdded.state, workspaceId: workspaceCreated.workspace.id, recordId: canonicalAdded.record.id, candidate: { markdown: mutatedWithOldSeal } });
assert.equal(canonicalEdited.ok, true, canonicalEdited.notice || canonicalEdited.error);
assert.equal(canonicalEdited.validationQualification, 'exact-current-schema');
assert.equal(canonicalEdited.integrity?.state, 'verified', 'canonical local Edit refreshes and verifies the self seal after body mutation');
assert.equal(canonicalC14nV2SelfState(canonicalEdited.record.markdown).state, 'verified');
assert.equal(canonicalC14nV2SelfState(canonicalEdited.record.markdown).declaredValue, renderedB.integrityValue, 'canonical Edit recomputes the same content-derived seal as fresh rendering of the edited values');
assert.notEqual(canonicalC14nV2SelfState(canonicalEdited.record.markdown).declaredValue, renderedA.integrityValue);
const manualIntegrityEdit = runLocalDraftUpdateCommand({ lifecycle, state: canonicalAdded.state, workspaceId: workspaceCreated.workspace.id, recordId: canonicalAdded.record.id, candidate: { markdown: renderedA.markdown.replace(renderedA.integrityValue, 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA') } });
assert.equal(manualIntegrityEdit.ok, false, 'caller cannot directly rewrite protected canonical integrity value');
assert.equal(manualIntegrityEdit.error, 'record.edit.continuity-shell.changed');

const missingObjective = reseal(renderedA.markdown.replace(`## Objective\n\n${values.Objective}\n\n`, ''));
const missingObjectiveValidation = validateArtifact({ markdown: missingObjective });
assert.equal(missingObjectiveValidation.findings.some((finding) => finding.code === 'task.objective.missing' && finding.severity === 'error'), true, 'missing Objective is an exact Task validation error');
assert.equal(missingObjectiveValidation.findings.some((finding) => finding.code === 'integrity.c14n-v2.verified'), true, 'companion pressure is independent of integrity mismatch');

const missingDoneCriteria = reseal(renderedA.markdown.replace(`## Done Criteria\n\n${values['Done Criteria']}\n\n`, ''));
const missingDoneValidation = validateArtifact({ markdown: missingDoneCriteria });
assert.equal(missingDoneValidation.findings.some((finding) => finding.code === 'task.doneCriteria.missing' && finding.severity === 'error'), true, 'missing Done Criteria is an exact Task validation error');

const legacyUnsigned = `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.task.v1\n  - Created At: 2026-08-18 08:00:00\n  - Summary: Legacy Task\n\n---\n\n# Legacy Task\n\n## Task Draft\n\nOld browser draft.\n\n## Next Step\n\nKeep going.\n\n## Source Boundary\n\nLocal.\n\n## Source Excerpt\n\nOld excerpt.\n\n# Continuity Integrity\n\n- sha256-base64url-c14n-v2\n  - Towards: self\n  - Value: pending\n`;
const legacyTask = sealC14nV2Self(legacyUnsigned).markdown;
const legacyValidation = validateArtifact({ markdown: legacyTask });
assert.equal(legacyValidation.validation.coverage, 'compiled-machine-contract+schema-companion', 'legacy artifact still reaches the exact Task companion because its Current Schema declares Task');
assert.equal(legacyValidation.findings.some((finding) => finding.code === 'task.legacyShape.observed'), true, 'legacy browser-draft shape is explicitly distinguished from current canonical Task shape');
for (const code of ['task.objective.missing', 'task.doneCriteria.missing', 'task.scope.missing', 'task.dependencies.missing']) {
  assert.equal(legacyValidation.findings.some((finding) => finding.code === code && finding.severity === 'error'), true, `legacy shape cannot gain exact current Task authority: ${code}`);
}
assert.equal(legacyValidation.findings.some((finding) => finding.code === 'task.body.canonical'), false);

console.log('post-v426 final Task companion + canonical integrity closure: PASS');

function reseal(markdown) {
  const placeholder = String(markdown).replace(/(^\s+-\s+Value:\s*)\S+(\s*$)/m, '$1pending$2');
  const sealed = sealC14nV2Self(placeholder);
  assert.equal(sealed.state, 'sealed');
  return sealed.markdown;
}
