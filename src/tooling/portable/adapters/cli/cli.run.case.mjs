import assert from 'node:assert/strict';
import { access, copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { runPortableCli } from './cli.run.js';
import { acceptGroundHostResult, hostToolProfile } from './cli.ground-recovery.js';
import { runPortableOperation } from '../../operation.catalog.js';
import { materializeHandoffManufactureCliOutput, prepareHandoffManufactureCliCommand } from './cli.handoff-manufacture.js';
import { portableCanonicalBootstrapRuntime } from '../../schema/bootstrap/canonical.pack.js';

{
  const lines = [];
  const io = { log: (value) => lines.push(value), error: (value) => lines.push(value) };
  assert.equal(await runPortableCli(['--help'], io), 0);
  const help = lines.at(-1);
  assert.match(help, /Common path \(same command for humans and LLMs\):/);
  assert.match(help, / ground <handoff-package\.zip> --route <Continue-from>/);
  assert.match(help, / author <workspace-dir>/);
  assert.match(help, / handoff <workspace-dir>/);
  assert.match(help, /Advanced\/internal catalog: .* operations/);
  assert.doesNotMatch(help, /prepare-task|accept-host-receipt|manufacture-handoff-package|build-runtime-package/, 'default help must not eagerly disclose the advanced/internal operation catalog');
}
console.log('✓ CLI default help keeps the common lifecycle visible while advanced operations remain deliberate discovery passed');

{
  for (const surfaceCommand of ['author', 'handoff']) {
    const lines = [];
    const io = { log: (value) => lines.push(value), error: (value) => lines.push(value) };
    assert.equal(await runPortableCli([surfaceCommand, '--help'], io), 0);
    const help = lines.at(-1);
    assert.match(help, new RegExp(`Tiinex portable tooling — ${surfaceCommand}`));
    assert.match(help, new RegExp(` ${surfaceCommand} <workspace-dir>`));
    assert.match(help, /Advanced\/internal catalog: .* operations/);
    if (surfaceCommand === 'handoff') {
      assert.match(help, /exactly one Handoff package plus the adjacent exact routing text/);
      assert.match(help, /fenced code block/);
      assert.match(help, /do not emit canonical Workspace Evidence\/Handoff markdown as additional loose transport files/);
    }
    assert.doesNotMatch(help, /prepare-task|accept-host-receipt|manufacture-handoff-package|build-runtime-package/, `${surfaceCommand} --help must remain command-focused instead of dumping the advanced catalog`);
  }
}
console.log('✓ common subcommand help is focused and preserves deliberate advanced discovery passed');

{
  const evidenceLines = [];
  const evidenceIo = { log: (value) => evidenceLines.push(value), error: (value) => evidenceLines.push(value) };
  assert.equal(await runPortableCli(['author', '--help', '--schema', 'tiinex.evidence.v1'], evidenceIo), 0);
  const evidenceHelp = evidenceLines.at(-1);
  assert.match(evidenceHelp, /Schema body contract — tiinex\.evidence\.v1/);
  assert.match(evidenceHelp, /## Supported Claim Or Question: Supported Claim Or Question, Evidence Role/);
  assert.match(evidenceHelp, /## Interpretation Limits: Does Not Prove, Not Yet Used As, Must Not Be Treated As/);

  const handoffLines = [];
  const handoffIo = { log: (value) => handoffLines.push(value), error: (value) => handoffLines.push(value) };
  assert.equal(await runPortableCli(['author', '--help', '--schema', 'tiinex.handoff.v1'], handoffIo), 0);
  const handoffHelp = handoffLines.at(-1);
  assert.match(handoffHelp, /Schema body contract — tiinex\.handoff\.v1/);
  assert.match(handoffHelp, /## Handoff Parties: Purpose, From, From Kind, To, To Kind/);
  assert.match(handoffHelp, /## Transfers — each Transfers entry: Transfer Kind, Description/);
  assert.match(handoffHelp, /literal `none` is allowed only where the schema contract permits it/);
}
console.log('✓ author focused help exposes schema-qualified body contracts from registered validation authority passed');

const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-cli-turn-binding-'));
try {
  const transaction = path.join(root, 'turn.json');
  const output = path.join(root, 'state.json');
  await writeFile(transaction, `${JSON.stringify({
    sessionId: 'session-cli-binding',
    turn: {
      id: 'dialogue:turn-0001',
      sequence: 1,
      userMessage: 'Exact current user message.',
      messageSha256: 'a'.repeat(64),
      summary: 'Caller supplied a mismatched digest.'
    },
    changes: []
  }, null, 2)}\n`, 'utf8');
  const lines = [];
  const io = { log: (value) => lines.push(value), error: (value) => lines.push(value) };
  const code = await runPortableCli(['process-live-turn', '--turn', transaction, '--output', output], io);
  assert.equal(code, 2);
  const result = JSON.parse(lines.at(-1));
  assert.equal(result.status, 'blocked');
  assert.equal('cliPhaseTiming' in result, false, 'default CLI output must remain unchanged when --phase-timing is absent');
  assert.deepEqual(result.findings.map((entry) => entry.code), ['live-lineage.turn.message-digest-mismatch']);
  await assert.rejects(access(output), /ENOENT/, 'blocked turn binding must not rewrite the persisted state file');
} finally {
  await rm(root, { recursive: true, force: true });
}
console.log('✓ CLI blocks mismatched turn binding without persisting state passed');

{
  const lines = [];
  const io = { log: (value) => lines.push(value), error: (value) => lines.push(value) };
  const code = await runPortableCli(['describe-cold-start-ingress', 'routed-handoff-package', '--phase-timing'], io);
  assert.equal(code, 0);
  const result = JSON.parse(lines.at(-1));
  assert.equal(result.cliPhaseTiming.schema, 'tiinex.portable.cli.phase-timing.v1');
  assert.equal(result.cliPhaseTiming.command, 'describe-cold-start-ingress');
  assert.equal('totalElapsedMs' in result.cliPhaseTiming, false, 'pre-serialization elapsed time must not be presented as total CLI elapsed time');
  assert.equal(result.cliPhaseTiming.measuredElapsedBeforeFinalSerializationMs >= 0, true);
  assert.equal(result.cliPhaseTiming.phases.inputPreparationMs >= 0, true);
  assert.equal(result.cliPhaseTiming.phases.operationExecutionMs >= 0, true);
  assert.equal(result.cliPhaseTiming.phases.outputMaterializationMs >= 0, true);
  assert.equal(result.cliPhaseTiming.measurementBoundary, 'immediately-before-final-json-serialization');
  assert.deepEqual(result.cliPhaseTiming.unmeasured, { finalJsonSerialization: true, finalEmission: true });
  assert.match(result.cliPhaseTiming.boundary, /final JSON serialization and emission are explicitly unmeasured/);
  assert.match(result.cliPhaseTiming.boundary, /excludes host review\/queue latency/);
}
console.log('✓ CLI opt-in in-process phase timing passed');


{
  const lines = [];
  const io = { log: (value) => lines.push(value), error: (value) => lines.push(value) };
  const code = await runPortableCli(['describe-cold-start-ingress', 'routed-handoff-package'], io);
  assert.equal(code, 0);
  const expected = await runPortableOperation('describe-cold-start-ingress', { ingressKind: 'routed-handoff-package' }, {});
  assert.equal(lines.at(-1), JSON.stringify(expected, null, 2), 'default CLI output must remain byte-equivalent to ordinary pretty JSON operation output');
}
console.log('✓ CLI default output byte-equivalence without phase timing passed');

{
  const lines = [];
  const io = { log: (value) => lines.push(value), error: (value) => lines.push(value) };
  const code = await runPortableCli(['discover-tooling', '--phase-timing'], io);
  assert.equal(code, 0);
  const serialized = lines.at(-1);
  assert.equal(Buffer.byteLength(serialized, 'utf8') > 4096, true, 'focused timing regression must exercise a non-trivial JSON serialization/output path');
  const result = JSON.parse(serialized);
  assert.equal('totalElapsedMs' in result.cliPhaseTiming, false);
  assert.equal(result.cliPhaseTiming.measurementBoundary, 'immediately-before-final-json-serialization');
  assert.equal(result.cliPhaseTiming.unmeasured.finalJsonSerialization, true);
  assert.equal(result.cliPhaseTiming.unmeasured.finalEmission, true);
}
console.log('✓ CLI phase timing truthfully bounds non-trivial final serialization/output passed');


{
  const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-cli-ground-host-result-'));
  try {
    const firstPath = path.join(root, 'first.md');
    const secondPath = path.join(root, 'second.md');
    await writeFile(firstPath, '# First recovered Parent\n', 'utf8');
    await writeFile(secondPath, '# Second recovered Parent\n', 'utf8');
    const host = hostToolProfile({}, 'GitHub.fetch_file');
    const recoveryResult = (repoPath) => Object.freeze({
      continuity: Object.freeze({
        recovery: Object.freeze({
          state: 'host-action-available',
          hostAction: Object.freeze({
            action: 'repository-read',
            request: Object.freeze({
              repository: 'Tiinex/site',
              ref: '56ba75025b7a8fd44b5318d2560d2ec63eb0106f',
              path: repoPath,
              purpose: 'recover exact declared Parent for cold-start continuity proof',
              nextOperation: 'ground'
            }),
            selectedTool: Object.freeze({ id: 'GitHub.fetch_file', name: 'GitHub.fetch_file' })
          })
        })
      })
    });
    const first = await acceptGroundHostResult(recoveryResult('.topics/tooling/first.trace.md'), { host, recoveryAcceptance: {} }, { 'host-result': firstPath });
    assert.equal(first.acceptance.status, 'accepted');
    assert.equal(first.acceptance.cumulativeRecovery.repositoryFiles, 1);
    const second = await acceptGroundHostResult(recoveryResult('.topics/tooling/second.trace.md'), { host, recoveryAcceptance: first.acceptance }, { 'host-result': secondPath });
    assert.equal(second.acceptance.status, 'accepted');
    assert.equal(second.acceptance.cumulativeRecovery.priorAccepted, true);
    assert.equal(second.acceptance.cumulativeRecovery.repositoryFiles, 2);
    assert.deepEqual(second.acceptance.providerResponses[0].files.map((file) => file.source.path), [
      '.topics/tooling/first.trace.md',
      '.topics/tooling/second.trace.md'
    ]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}
console.log('✓ common ground host-result façade owns receipt normalization and cumulative prior recovery without protocol files passed');


{
  const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-cli-common-author-'));
  try {
    const parentRelativePath = '.topics/tooling/006-1-1-1-1-1-1-1-1-1-1-1-anchor-to-loom-authoring-return-common-path-ergonomics-handoff.trace.md';
    const evidenceSource = path.resolve('.topics/tooling/006-1-1-1-1-1-1-loom-post-ground-common-path-ergonomics-correction-evidence.trace.md');
    const parentSource = path.resolve(parentRelativePath);
    const parentTarget = path.join(root, parentRelativePath);
    await mkdir(path.dirname(parentTarget), { recursive: true });
    await copyFile(parentSource, parentTarget);
    const evidenceMarkdown = await readFile(evidenceSource, 'utf8');
    const evidenceBody = evidenceMarkdown.split('\n---\n')[1].trim();
    const bodyPath = path.join(root, 'body.md');
    await writeFile(bodyPath, `${evidenceBody}\n`, 'utf8');
    await mkdir(path.join(root, '.tiinex'), { recursive: true });
    await writeFile(path.join(root, '.tiinex/continuation.json'), `${JSON.stringify({
      schema: 'tiinex.portable.ground-continuation-state.v1',
      version: 1,
      selectedHandoffPath: parentRelativePath,
      roleLabel: 'Loom'
    }, null, 2)}\n`, 'utf8');
    const artifactRelativePath = '.topics/tooling/common-author-regression-evidence.trace.md';
    const lines = [];
    const io = { log: (value) => lines.push(value), error: (value) => lines.push(value) };
    const code = await runPortableCli([
      'author', root,
      '--schema', 'tiinex.evidence.v1',
      '--path', artifactRelativePath,
      '--body', bodyPath,
      '--title', 'Common Author Regression Evidence',
      '--summary', 'Regression coverage for the ordinary post-ground author surface.',
      '--why', 'Prove continuity inference, c14n-v2 sealing, runtime audit, staging, and continuation-state carry-forward.',
      '--compact'
    ], io, portableCanonicalBootstrapRuntime);
    assert.equal(code, 0);
    const result = JSON.parse(lines.at(-1));
    assert.equal(result.status, 'qualified');
    assert.equal(result.artifact.parentPath, parentRelativePath);
    assert.equal(result.artifact.selfIntegrity, 'verified');
    assert.equal(result.qualification.stage, 'staged');
    assert.equal(result.findingSummary.counts.error, 0);
    const state = JSON.parse(await readFile(path.join(root, '.tiinex/continuation.json'), 'utf8'));
    assert.equal(state.lastAuthoredPath, artifactRelativePath);
    assert.equal(state.lastAuthoredSchemaId, 'tiinex.evidence.v1');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}
console.log('✓ common author façade infers Parent and owns sealing, audit, staging, and continuation carry-forward passed');

{
  const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-cli-invalid-author-repair-'));
  try {
    const parentRelativePath = '.topics/tooling/006-1-1-1-1-1-1-1-1-1-1-1-anchor-to-loom-authoring-return-common-path-ergonomics-handoff.trace.md';
    const parentSource = path.resolve(parentRelativePath);
    const parentTarget = path.join(root, parentRelativePath);
    await mkdir(path.dirname(parentTarget), { recursive: true });
    await copyFile(parentSource, parentTarget);
    await mkdir(path.join(root, '.tiinex'), { recursive: true });
    await writeFile(path.join(root, '.tiinex/continuation.json'), `${JSON.stringify({
      schema: 'tiinex.portable.ground-continuation-state.v1',
      version: 1,
      selectedHandoffPath: parentRelativePath,
      roleLabel: 'Loom'
    }, null, 2)}\n`, 'utf8');

    const evidenceBodyPath = path.join(root, 'invalid-evidence-body.md');
    await writeFile(evidenceBodyPath, '# Invalid Evidence\n\n## Supported Claim Or Question\n\n- Supported Claim Or Question: compact author repair should be actionable.\n', 'utf8');
    const evidenceRelativePath = '.topics/tooling/invalid-evidence.trace.md';
    const evidenceArgs = ['author', root, '--schema', 'tiinex.evidence.v1', '--path', evidenceRelativePath, '--body', evidenceBodyPath];
    const evidenceLines = [];
    const evidenceIo = { log: (value) => evidenceLines.push(value), error: (value) => evidenceLines.push(value) };
    assert.equal(await runPortableCli(evidenceArgs, evidenceIo, portableCanonicalBootstrapRuntime), 2);
    const evidence = JSON.parse(evidenceLines.at(-1));
    assert.equal(evidence.projection, 'common-default');
    assert.equal(evidence.status, 'blocked');
    assert.equal(evidence.artifact.written, false);
    assert.equal('audit' in evidence, false);
    assert.equal('stage' in evidence, false);
    assert.equal(evidence.repair.missingHeadings.some((entry) => entry.heading === '## Evidence Material'), true);
    assert.equal(evidence.repair.missingFields.some((entry) => entry.heading === '## Supported Claim Or Question' && entry.fields.some((field) => field.field === 'Evidence Role')), true);
    assert.match(evidence.repair.schemaContractHelp, /author --help --schema tiinex\.evidence\.v1$/);
    assert.match(evidence.repair.retryCommand, /author .* --schema tiinex\.evidence\.v1 .* --body /);
    await assert.rejects(access(path.join(root, evidenceRelativePath)), /ENOENT/, 'invalid Evidence must not be retained');

    const fullLines = [];
    const fullIo = { log: (value) => fullLines.push(value), error: (value) => fullLines.push(value) };
    assert.equal(await runPortableCli([...evidenceArgs, '--full'], fullIo, portableCanonicalBootstrapRuntime), 2);
    const fullEvidence = JSON.parse(fullLines.at(-1));
    assert.equal('projection' in fullEvidence, false);
    assert.equal(Boolean(fullEvidence.audit), true);
    assert.equal(Boolean(fullEvidence.stage), true);
    assert.equal(fullEvidence.artifact.written, false);

    const handoffBodyPath = path.join(root, 'invalid-handoff-body.md');
    await writeFile(handoffBodyPath, `# Invalid Handoff

## Handoff Parties

- Purpose: return bounded work.
- From: Loom
- From Kind: role
- To: Anchor

## Transfers

- bounded-return
  - Transfer Kind: work

## Required Context

- none

## Reference Context

- none

## Retained Responsibilities

- none

## Exclusions And Dependencies

- none

## Completion Expectation

- Signal Kind: result

## Interpretation Limits

- Does Not Mean: this invalid body is qualified.
`, 'utf8');
    const handoffRelativePath = '.topics/tooling/invalid-handoff.trace.md';
    const handoffLines = [];
    const handoffIo = { log: (value) => handoffLines.push(value), error: (value) => handoffLines.push(value) };
    assert.equal(await runPortableCli(['author', root, '--schema', 'tiinex.handoff.v1', '--path', handoffRelativePath, '--body', handoffBodyPath], handoffIo, portableCanonicalBootstrapRuntime), 2);
    const handoff = JSON.parse(handoffLines.at(-1));
    assert.equal(handoff.repair.missingFields.some((entry) => entry.heading === '## Handoff Parties' && entry.fields.some((field) => field.field === 'To Kind')), true);
    assert.equal(handoff.repair.missingDeclarationFields.some((entry) => entry.group === 'Transfers' && entry.entry === 'bounded-return' && entry.fields.some((field) => field.field === 'Description')), true);
    assert.match(handoff.repair.schemaContractHelp, /author --help --schema tiinex\.handoff\.v1$/);
    await assert.rejects(access(path.join(root, handoffRelativePath)), /ENOENT/, 'invalid Handoff must not be retained');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}
console.log('✓ schema-invalid author default repair is compact/actionable for Evidence and Handoff while --full and fail-closed non-retention remain intact passed');


{
  const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-cli-low-level-handoff-'));
  try {
    await mkdir(path.join(root, '.tiinex'), { recursive: true });
    await writeFile(path.join(root, '.tiinex/continuation.json'), `${JSON.stringify({
      schema: 'tiinex.portable.ground-continuation-state.v1',
      packageParentPath: path.join(root, 'missing-parent.handoff-package.zip')
    }, null, 2)}\n`, 'utf8');
    await assert.rejects(
      () => prepareHandoffManufactureCliCommand({
        surfaceCommand: 'manufacture-handoff-package',
        positionals: [root],
        flags: { 'package-major': true }
      }),
      /portable\.cli\.handoff-carrier\.package-major\.parent-required/,
      'advanced manufacture must not silently consume common-path continuation state'
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}
console.log('✓ advanced manufacture remains explicit even when common-path continuation state is present passed');


{
  const output = await materializeHandoffManufactureCliOutput({
    schema: 'tiinex.portable.operation.result.v1',
    operation: 'manufacture-handoff-package',
    status: 'blocked',
    transportExecutable: false,
    carrierProjection: { status: 'ready', mode: 'single', routes: [], workspace: {}, workspaces: [], selection: {} },
    findings: [{ severity: 'error', code: 'portable.handoff-material.required.unresolved', message: 'Exact required material is not currently resolvable or materialized.' }],
    findingSummary: { status: 'invalid', counts: { error: 1, warning: 0, info: 0, total: 1 } }
  }, { 'output-dir': '/tmp' });
  assert.equal(output.status, 'blocked');
  assert.equal(output.primaryOutput, null);
  assert.equal(output.findingSummary.counts.error, 1);
  assert.equal(output.findings[0].code, 'portable.handoff-material.required.unresolved');
}
console.log('✓ blocked manufacture façade preserves actionable findings instead of attempting an invalid carrier write passed');
