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
  const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-cli-common-author-chain-'));
  try {
    const bundledDecisionSchemaPath = 'src/schemas/core/decision/tiinex.decision.v1.schema.md';
    const decisionSchemaTarget = path.join(root, bundledDecisionSchemaPath);
    await mkdir(path.dirname(decisionSchemaTarget), { recursive: true });
    await copyFile(path.resolve(bundledDecisionSchemaPath), decisionSchemaTarget);
    await mkdir(path.join(root, '.tiinex'), { recursive: true });
    await writeFile(path.join(root, '.tiinex/continuation.json'), `${JSON.stringify({
      schema: 'tiinex.portable.ground-continuation-state.v1',
      version: 1,
      roleLabel: 'Loom'
    }, null, 2)}\n`, 'utf8');

    const bodyFromArtifact = async (sourcePath, targetName) => {
      const markdown = await readFile(path.resolve(sourcePath), 'utf8');
      const body = markdown.split('\n---\n')[1].trim();
      const target = path.join(root, targetName);
      await writeFile(target, `${body}\n`, 'utf8');
      return target;
    };
    const runAuthor = async (args) => {
      const lines = [];
      const io = { log: (value) => lines.push(value), error: (value) => lines.push(value) };
      const code = await runPortableCli(['author', root, ...args, '--compact'], io, portableCanonicalBootstrapRuntime);
      return { code, result: JSON.parse(lines.at(-1)) };
    };

    const decisionBody = await bodyFromArtifact('.topics/tooling/017-1-sigma-foundation-major-plan-approval-decision.trace.md', 'decision-body.md');
    const handoffBody = await bodyFromArtifact('.topics/tooling/016-3-anchor-to-loom-common-author-continuation-repair-handoff.trace.md', 'handoff-body.md');
    const taskBody = await bodyFromArtifact('.topics/tooling/016-common-author-continuation-schema-authority-repair.task.trace.md', 'task-body.md');
    const evidenceBody = await bodyFromArtifact('.topics/tooling/016-1-anchor-fresh-common-author-continuation-failure-evidence.trace.md', 'evidence-body.md');

    const decisionPath = '.topics/tooling/common-author-chain-decision.trace.md';
    const decision = await runAuthor([
      '--schema', 'tiinex.decision.v1', '--path', decisionPath, '--body', decisionBody,
      '--title', 'Common Author Chain Decision', '--summary', 'Common Author Chain Decision', '--why', 'Exercise bare-ID Decision continuation.', '--no-parent'
    ]);
    assert.equal(decision.code, 0);
    assert.equal(decision.result.status, 'qualified');
    const decisionMarkdown = await readFile(path.join(root, decisionPath), 'utf8');
    assert.match(decisionMarkdown, /Current Schema: tiinex\.decision\.v1\n/, 'accepted-local unpublished Decision remains a bare semantic schema id');

    const handoffPath = '.topics/tooling/common-author-chain-handoff.trace.md';
    const handoff = await runAuthor([
      '--schema', 'tiinex.handoff.v1', '--path', handoffPath, '--body', handoffBody,
      '--title', 'Common Author Chain Handoff', '--summary', 'Common Author Chain Handoff', '--why', 'Prove Decision to Handoff continuation.', '--parent', decisionPath
    ]);
    assert.equal(handoff.code, 0);
    assert.equal(handoff.result.status, 'qualified');
    assert.equal(handoff.result.artifact.parentPath, decisionPath);
    assert.equal(handoff.result.artifact.selfIntegrity, 'verified');
    const handoffMarkdown = await readFile(path.join(root, handoffPath), 'utf8');
    assert.match(handoffMarkdown, /Parent Schema: \[tiinex\.decision\.v1\]\(\.\.\/\.\.\/src\/schemas\/core\/decision\/tiinex\.decision\.v1\.schema\.md\)/, 'bare parent schema id must recover an exact child-relative bundled schema locator');

    const taskPath = '.topics/tooling/common-author-chain-task.trace.md';
    const task = await runAuthor([
      '--schema', 'tiinex.task.v1', '--path', taskPath, '--body', taskBody,
      '--title', 'Common Author Chain Task', '--summary', 'Common Author Chain Task', '--why', 'Exercise an additional ordinary schema pair.', '--no-parent'
    ]);
    assert.equal(task.code, 0);
    assert.equal(task.result.status, 'qualified');

    const evidencePath = '.topics/tooling/common-author-chain-evidence.trace.md';
    const evidence = await runAuthor([
      '--schema', 'tiinex.evidence.v1', '--path', evidencePath, '--body', evidenceBody,
      '--title', 'Common Author Chain Evidence', '--summary', 'Common Author Chain Evidence', '--why', 'Prove Task to Evidence continuation is schema-generic.', '--parent', taskPath
    ]);
    assert.equal(evidence.code, 0);
    assert.equal(evidence.result.status, 'qualified');
    assert.equal(evidence.result.artifact.parentPath, taskPath);
    assert.equal(evidence.result.artifact.selfIntegrity, 'verified');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}
console.log('✓ common author chains Decision→Handoff and Task→Evidence without manual schema-authority repair passed');


{
  const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-cli-common-author-schema-authority-fail-closed-'));
  try {
    const bundledDecisionSchemaPath = 'src/schemas/core/decision/tiinex.decision.v1.schema.md';
    const decisionSchemaTarget = path.join(root, bundledDecisionSchemaPath);
    await mkdir(path.dirname(decisionSchemaTarget), { recursive: true });
    await writeFile(decisionSchemaTarget, '# tampered local schema material\n', 'utf8');
    await mkdir(path.join(root, '.tiinex'), { recursive: true });
    await writeFile(path.join(root, '.tiinex/continuation.json'), `${JSON.stringify({ schema: 'tiinex.portable.ground-continuation-state.v1', version: 1, roleLabel: 'Loom' }, null, 2)}\n`, 'utf8');
    const bodyFromArtifact = async (sourcePath, targetName) => {
      const markdown = await readFile(path.resolve(sourcePath), 'utf8');
      const target = path.join(root, targetName);
      await writeFile(target, `${markdown.split('\n---\n')[1].trim()}\n`, 'utf8');
      return target;
    };
    const decisionBody = await bodyFromArtifact('.topics/tooling/017-1-sigma-foundation-major-plan-approval-decision.trace.md', 'decision-body.md');
    const handoffBody = await bodyFromArtifact('.topics/tooling/016-3-anchor-to-loom-common-author-continuation-repair-handoff.trace.md', 'handoff-body.md');
    const decisionPath = '.topics/tooling/common-author-unresolved-decision.trace.md';
    const firstLines = [];
    assert.equal(await runPortableCli([
      'author', root, '--schema', 'tiinex.decision.v1', '--path', decisionPath, '--body', decisionBody,
      '--title', 'Unresolved Decision', '--summary', 'Unresolved Decision', '--why', 'Set up fail-closed Parent authority regression.', '--no-parent', '--compact'
    ], { log: (value) => firstLines.push(value), error: (value) => firstLines.push(value) }, portableCanonicalBootstrapRuntime), 0);

    const childPath = '.topics/tooling/common-author-unresolved-handoff.trace.md';
    const lines = [];
    const code = await runPortableCli([
      'author', root, '--schema', 'tiinex.handoff.v1', '--path', childPath, '--body', handoffBody,
      '--title', 'Unresolved Handoff', '--summary', 'Unresolved Handoff', '--why', 'Must fail closed without exact local schema bytes.', '--parent', decisionPath, '--compact'
    ], { log: (value) => lines.push(value), error: (value) => lines.push(value) }, portableCanonicalBootstrapRuntime);
    assert.equal(code, 1);
    assert.equal(JSON.parse(lines.at(-1)).error, 'portable.cli.author.parent.schema-authority.required');
    await assert.rejects(access(path.join(root, childPath)), /ENOENT/, 'failed Parent schema-authority recovery must not retain a child artifact');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}
console.log('✓ common author Parent schema-authority recovery fails closed on mismatched bundled schema bytes passed');


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
