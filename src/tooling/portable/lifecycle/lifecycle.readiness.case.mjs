import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createRecordFromMarkdown } from '../../../artifacts/artifact.record.js';
import { sealC14nV2Self, validatedC14nV2PrimarySelfDigest } from '../../../integrity/integrity.c14nV2.js';
import { C14N_V2_VALIDATOR_TARGET } from '../../../integrity/integrity.methodReference.js';
import { projectPortableLifecycleReadiness } from './lifecycle.readiness.js';
import { runPortableOperation } from '../operation.catalog.js';
import { runPortableCli } from '../adapters/cli/cli.run.js';

const CONTROL = 'fixture/control.trace.md';
const CHILD = 'fixture/child.trace.md';
const RETEST = 'fixture/retest.trace.md';
const CLOSURE = 'fixture/closure.trace.md';
const REDUCTION = 'fixture/reduction.trace.md';
const AUTHORITY = Object.freeze({ criteriaOwner: Object.freeze({ state: 'qualified', role: 'Reviewer', basis: 'qualified fixture criteria-owner authority' }) });

const control = artifactTask(CONTROL, 'Controlling Task');
const child = artifactTask(CHILD, 'Required Child Task', { parent: control });
const retestArtifact = artifactValidation(RETEST);
const closureArtifact = artifactDecision(CLOSURE);
const reductionArtifact = artifactReduction(REDUCTION);
const records = Object.freeze([control.record, child.record, retestArtifact.record, closureArtifact.record, reductionArtifact.record]);

function project(facts = {}, extra = {}) {
  return projectPortableLifecycleReadiness({ records, controllingTask: CONTROL, facts: { authority: AUTHORITY, ...facts }, ...extra });
}
function rep(overrides = {}) {
  return { obligation: CHILD, representative: CHILD, state: 'resolved', currentness: 'current', qualification: 'qualified', retestInputState: 'available', basis: 'qualified current representative fact', ...overrides };
}
function retest(state = 'passed', overrides = {}) {
  return { artifact: RETEST, state, currentness: 'current', qualification: 'qualified', target: CONTROL, criteriaCoverage: 'complete', methodState: 'qualified', authorityRole: 'Reviewer', authorityState: 'qualified', authorityBasis: 'qualified Reviewer authority', basis: 'qualified exact re-test outcome', ...overrides };
}
function closure(overrides = {}) {
  return { artifact: CLOSURE, state: 'closed', explicit: true, currentness: 'current', qualification: 'qualified', target: CONTROL, authorityRole: 'Reviewer', authorityState: 'qualified', authorityBasis: 'qualified Reviewer closure authority', passBasisArtifact: RETEST, basis: 'qualified explicit closure decision', ...overrides };
}

{
  const result = project({ representatives: [rep({ state: 'active' })] });
  assert.equal(result.controllingTask.state, 'qualified');
  assert.equal(result.currentRepresentatives.length, 1, 'qualified direct Task Parent continuity must create the required child obligation');
  assert.equal(result.readiness.state, 'not-ready-for-retest');
  assert(result.blockers.some((item) => item.code === 'required-work-current'));
}
console.log('✓ failed/incomplete criterion expansion plus active required descendant remains not-ready-for-retest');

{
  const result = project({ representatives: [rep()] });
  assert.equal(result.readiness.state, 'ready-for-retest');
  assert.equal(result.retest.state, 'not-observed');
  assert.equal(result.closure.state, 'open');
  assert.equal(result.nextAction.kind, 'invoke-authorized-retest');
}
console.log('✓ child convergence without parent re-test is ready-for-retest, not passed or closed');

{
  const result = project({ representatives: [rep()], retests: [retest('passed')] });
  assert.equal(result.retest.state, 'passed');
  assert.equal(result.closure.state, 'open');
  assert.equal(result.readiness.state, 'ready-for-retest');
  assert.equal(result.nextAction.kind, 'obtain-explicit-authoritative-closure');
}
console.log('✓ authoritative pass remains distinct from explicit closure');

{
  const result = project({ representatives: [rep()], retests: [retest('passed')], closures: [closure()] });
  assert.equal(result.retest.state, 'passed');
  assert.equal(result.closure.state, 'closed');
  assert.equal(result.readiness.state, 'not-applicable');
  assert.equal(result.nextAction.kind, 'none-unless-authoritatively-reopened');
}
console.log('✓ explicit authoritative closure makes readiness not-applicable');

{
  const result = project({ representatives: [rep({ state: 'active' })], retests: [retest('failed')] });
  assert.equal(result.retest.state, 'failed');
  assert.equal(result.closure.state, 'open');
  assert.equal(result.readiness.state, 'not-ready-for-retest');
  assert.equal(result.nextAction.kind, 'address-failed-criteria-with-bounded-work');
}
console.log('✓ failed re-test followed by bounded child work remains not-ready and open');

{
  const missing = project({ representatives: [] });
  assert.equal(missing.readiness.state, 'unresolved');
  assert(missing.missingEvidence.some((item) => item.code === 'current-representative-missing'));
  const ambiguous = project({ representatives: [rep(), rep({ representative: REDUCTION, carryForwardState: 'sufficient', lossState: 'none', validationState: 'qualified' })] });
  assert.equal(ambiguous.readiness.state, 'unresolved');
  assert(ambiguous.ambiguities.some((item) => item.code === 'current-representative-ambiguous'));
}
console.log('✓ missing or ambiguous current representative fails closed as unresolved');

{
  const result = project({ representatives: [rep({ currentness: 'historical', state: 'active', basis: 'qualified historical fact' }), rep({ state: 'resolved' })] });
  assert.equal(result.currentRepresentatives.length, 1);
  assert.equal(result.currentRepresentatives[0].state, 'resolved');
  assert.equal(result.readiness.state, 'ready-for-retest');
}
console.log('✓ qualified current evidence supersedes stale historical nonterminal evidence');

{
  const result = project({ representatives: [rep({ representative: REDUCTION, carryForwardState: 'sufficient', lossState: 'none', validationState: 'qualified' })] });
  assert.equal(result.readiness.state, 'ready-for-retest');
  assert.equal(result.currentRepresentatives[0].reduction.isReduction, true);
  assert.equal(result.currentRepresentatives[0].reduction.completionProof, false);
  assert.equal(result.retest.state, 'not-observed');
  assert.equal(result.closure.state, 'open');
}
console.log('✓ qualified Reduction can preserve re-test inputs but is never completion proof');

{
  const result = project({ representatives: [rep({ representative: REDUCTION, carryForwardState: 'partial', lossState: 'unresolved', validationState: 'qualified' })] });
  assert.equal(result.readiness.state, 'unresolved');
  assert(result.ambiguities.some((item) => item.code === 'reduction-loss-unresolved'));
}
console.log('✓ Reduction with material unresolved loss stays unresolved rather than false-green');

{
  const result = project({ representatives: [rep()], retests: [retest('passed', { authorityRole: 'OtherRole' })] });
  assert.equal(result.retest.state, 'unresolved');
  assert.equal(result.readiness.state, 'unresolved');
  assert(result.ambiguities.some((item) => item.code === 'retest-outcome-unqualified'));
}
console.log('✓ explicit re-test authority mismatch cannot become passed');

{
  const result = project({ representatives: [rep()], retests: [retest('passed', { currentness: 'unresolved' })] });
  assert.equal(result.retest.state, 'unresolved');
  assert.equal(result.readiness.state, 'unresolved');
}
console.log('✓ unresolved re-test currentness remains unresolved');

{
  const operation = await runPortableOperation('project-lifecycle-readiness', { records, controllingTask: CONTROL, facts: { authority: AUTHORITY, representatives: [rep()] } });
  assert.equal(operation.operation, 'project-lifecycle-readiness');
  assert.equal(operation.readiness.state, 'ready-for-retest');
  assert.deepEqual(operation.boundary.sharedConsumers, ['CLI', 'LLM', 'Viewer', 'VS Code']);
  assert.equal(operation.boundary.canonicalSchemaVocabularyChanged, false);
}
console.log('✓ shared operation catalog exposes one adapter-neutral normalized lifecycle projection');

{
  const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-lifecycle-cli-'));
  try {
    await mkdir(path.join(root, 'fixture'), { recursive: true });
    for (const item of [control, child, retestArtifact, closureArtifact, reductionArtifact]) await writeFile(path.join(root, item.path), `${item.markdown}\n`, 'utf8');
    const factsPath = path.join(root, 'facts.json');
    await writeFile(factsPath, `${JSON.stringify({ authority: AUTHORITY, representatives: [rep()] }, null, 2)}\n`, 'utf8');
    const lines = [];
    const io = { log: (value) => lines.push(value), error: (value) => lines.push(value) };
    const code = await runPortableCli(['project-lifecycle-readiness', root, '--controlling-task', CONTROL, '--facts', factsPath], io);
    assert.equal(code, 0, lines.join('\n'));
    const output = JSON.parse(lines.at(-1));
    assert.equal(output.readiness.state, 'ready-for-retest');
    assert.equal(output.retest.state, 'not-observed');
    assert.equal(output.closure.state, 'open');
  } finally { await rm(root, { recursive: true, force: true }); }
}
console.log('✓ CLI consumes the same lifecycle operation result without inventing adapter-local semantics');

function artifactTask(filePath, title, { parent = null } = {}) {
  const parentBlock = parent ? `- Parent\n  - Parent Schema: tiinex.task.v1\n  - Created At: 2026-09-06 00:00:00\n  - Trace: [Parent](${path.basename(parent.path)})\n  - Origin:\n    - [relative](${path.basename(parent.path)})\n` : '';
  const parentIntegrity = parent ? `- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: [Parent](${path.basename(parent.path)})\n  - Value: ${parent.digest}\n\n` : '';
  return artifact(filePath, 'tiinex.task.v1', title, `## Objective\n\nExercise lifecycle readiness semantics.\n\n## Done Criteria\n\n- the exact governing criteria are satisfied only by authorized re-test and closure evidence\n\n## Scope\n\n- synthetic neutral regression\n\n## Dependencies\n\n- none`, parentBlock, parentIntegrity);
}
function artifactValidation(filePath) { return artifact(filePath, 'tiinex.validation.report.v1', 'Validation Report Fixture', `## Report Scope\n\n- Scope: exact controlling Task\n- Targets: fixture/control.trace.md\n\n## Validation Methods\n\n- Methods Used: synthetic exact assertion\n- Method Boundaries: fixture only\n\n## Findings Summary\n\n- Summary: normalized fact supplies outcome semantics\n- Overall State: evidence only without normalized authority fact\n\n## Finding List\n\n- Findings: none\n\n## Run Boundary\n\n- Run Context: permanent component regression\n- What Was Not Checked: external systems\n\n## Interpretation Limits\n\n- Does Not Prove: closure or authority by report existence\n- Must Not Hide: unresolved scope, currentness, criteria, or authority`); }
function artifactDecision(filePath) { return artifact(filePath, 'tiinex.decision.v1', 'Closure Decision Fixture', `## Decision\n\n- State: accepted\n- Subject: exact controlling Task closure\n- Decision: normalized fact may qualify this artifact as explicit closure only with matching authority and pass basis\n\n## Basis\n\n- synthetic exact closure evidence\n\n## Consequences\n\n- no implicit closure from convergence or pass alone`); }
function artifactReduction(filePath) { return artifact(filePath, 'tiinex.reduction.v1', 'Reduction Fixture', `## Source Context\n\n- Source: qualified child-work context\n\n## Carry-Forward State\n\n- normalized fact decides whether required re-test inputs are sufficiently carried\n\n## Loss And Uncertainty\n\n- normalized fact exposes material loss state\n\n## Validation\n\n- reduction existence alone never proves completion`); }
function artifact(filePath, schemaId, title, body, parentBlock = '', parentIntegrity = '') {
  const unsigned = `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n${parentBlock}- Current\n  - Current Schema: ${schemaId}\n  - Created At: 2026-09-06 00:01:00\n  - Authors: Fixture\n  - Why: Exercise adapter-neutral lifecycle readiness semantics.\n  - Summary: ${title}.\n  - Status: local\n\n---\n\n# ${title}\n\n${body}\n\n---\n\n# Continuity Integrity\n\n${parentIntegrity}- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: pending\n`;
  const sealed = sealC14nV2Self(unsigned);
  assert.equal(sealed.state, 'sealed');
  const markdown = sealed.markdown;
  const digest = validatedC14nV2PrimarySelfDigest(markdown);
  assert.equal(digest.state, 'verified');
  const record = Object.freeze({ ...createRecordFromMarkdown(markdown, { path: filePath, sourceMode: 'local-test' }), id: filePath, path: filePath });
  return Object.freeze({ path: filePath, markdown, digest: digest.value, record });
}
