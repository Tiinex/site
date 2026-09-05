import assert from 'node:assert/strict';
import { projectCommonCliDefaultOutput } from './cli.common-output.js';
import { groundContinuationOperationInput } from './cli.ground-materialize.js';

{
  const full = {
    schema: 'tiinex.portable.operation.result.v1',
    operation: 'orient-handoff-package',
    resultSchema: 'tiinex.portable.handoff-cold-consumer-orientation.v1',
    status: 'ready',
    workspaces: [{ id: 'site', title: 'site', qualification: 'qualified' }],
    routes: [{ id: 'route:site', state: 'qualified', workspaceId: 'site', workspaceRelativeHandoffPath: '.topics/handoff.trace.md', from: 'Anchor', to: 'Loom', pointerPath: '001-pointer.trace.md', requiredClosure: { requirements: [{ body: 'large' }] } }],
    selection: { qualifiedRouteCount: 1, implicitRouteId: 'route:site' },
    carrierLineage: { mode: 'continue', dimension: '007-1', parentDimension: '007', checkpointKind: 'progression', authority: 'human-progress-projection-only', boundary: 'large' },
    endpointRoles: [{ body: 'large endpoint receipt' }],
    entrypoint: { projection: { authority: { semanticAuthority: 'none', packageTruthRequired: true } } },
    findings: [],
    findingSummary: { counts: { error: 0, warning: 0, total: 0 } }
  };
  const parsed = { command: 'orient-handoff-package', surfaceCommand: 'orient', positionals: ['/tmp/carrier.zip'], flags: {} };
  const compact = projectCommonCliDefaultOutput(full, parsed);
  assert.equal(compact.projection, 'common-default');
  assert.equal(compact.routes[0].pointerPath, '001-pointer.trace.md');
  assert.deepEqual(compact.nextAction, { command: 'ground', package: '/tmp/carrier.zip', route: '001-pointer.trace.md' });
  assert.equal('endpointRoles' in compact, false);
  assert.equal('requiredClosure' in compact.routes[0], false);
  assert.equal(compact.authority.semanticAuthority, 'none');
  assert.equal(projectCommonCliDefaultOutput(full, { ...parsed, flags: { full: true } }), full, '--full must preserve the complete qualified receipt');
}

{
  const full = {
    schema: 'tiinex.portable.operation.result.v1',
    operation: 'project-grounding-readiness',
    resultSchema: 'tiinex.portable.grounding-readiness.v1',
    status: 'ready',
    readiness: { state: 'grounded-to-act', reasons: [{ code: 'bounded-act-ready', message: 'Ready.' }], missingEvidence: [], nextAction: { kind: 'continue-bounded-handoff-work', target: 'site/.topics/task.trace.md' } },
    authority: {
      state: 'degraded',
      route: { id: 'route:site', pointerPath: '001-pointer.trace.md', workspaceId: 'site' },
      handoff: { purpose: 'Do bounded work.', from: 'Anchor', to: 'Loom', completionExpectation: { returnTo: 'Anchor' } },
      role: { state: 'qualified', label: 'Loom', kind: 'role' },
      operationBoundary: { sourceMutation: false, remoteWrite: false, semanticAuthority: 'Handoff/Task/Role govern.', boundary: 'Grounding only.' }
    },
    coverage: { requiredContext: { declared: 2, matchedInWorkspaceSnapshots: 2, missingFromWorkspaceSnapshots: 0, items: [
      { requirementId: 'required:a', name: 'a', state: 'qualified', workspaceId: 'site', innerPath: '.topics/a.md', contentProjected: false },
      { requirementId: 'required:b', name: 'b', state: 'qualified', workspaceId: 'site', innerPath: '.topics/b.md', contentProjected: true, content: '# Exact requested body' }
    ], bodiesProjected: 1, bodiesAvailable: 2 } },
    capsule: { schema: 'tiinex.portable.grounding-capsule.v1', semanticReductions: [{ id: 'required:a', title: 'Context A', signals: [] }], frontier: { state: 'resolved' }, exclusions: [], sourceEvidence: { carrier: { state: 'qualified' }, workspaces: [] }, roleState: { recipient: 'Loom', holder: 'Loom' }, unresolved: [{ slot: 'organizational-work-provenance', state: 'unresolved' }], boundary: 'bounded' },
    currentWork: { state: 'current-frontier-resolved', frontier: [{ id: 'site/.topics/task.trace.md', path: 'site/.topics/task.trace.md', title: 'Task', declaredStatus: 'ready/local', contentProjected: true, content: '# Current task body' }], blockers: [] },
    continuity: { state: 'qualified', proof: { roots: [{ id: 'root', path: 'site/.topics/root.md', title: 'Root', schemaId: 'tiinex.decision.v1', declaresParent: false, hasContinuityContext: true, hasIntegrity: true }] }, blockingIssues: [], recovery: { state: 'not-required' }, losses: { state: 'none', blocking: false, items: [] } },
    lineage: { large: 'receipt' },
    evidence: { large: 'receipt' },
    findings: [],
    actionableFindings: [],
    findingSummary: { counts: { error: 0, warning: 0, total: 0 } },
    continuationMaterialization: { state: 'materialized', workspaceId: 'site', outputDir: '/tmp/site', fileCount: 10 }
  };
  const compact = projectCommonCliDefaultOutput(full, { command: 'project-grounding-readiness', surfaceCommand: 'ground', positionals: ['/tmp/carrier.zip'], flags: { route: '001-pointer.trace.md', continue: '/tmp/site' } });
  assert.equal(compact.readiness.state, 'grounded-to-act');
  assert.equal(compact.authority.role.label, 'Loom');
  assert.equal(compact.requiredContext.missingFromWorkspaceSnapshots, 0);
  assert.equal(compact.requiredContext.items.length, 0, 'ordinary continuation must not repeat qualified Required Context item paths by default');
  assert.equal(compact.requiredContext.itemsOmitted, 2);
  assert.equal(compact.capsule.semanticReductions[0].title, 'Context A');
  assert.equal(compact.capsule.unresolved[0].slot, 'organizational-work-provenance');
  assert.equal(compact.currentWork.frontier[0].content, '# Current task body');
  assert.equal(compact.continuity.state, 'qualified');
  assert.equal(compact.continuity.roots.length, 0, 'ordinary continuation must not repeat already-qualified root-detail receipts');
  assert.equal(compact.continuity.rootsOmitted, 1);
  assert.equal(compact.continuationMaterialization.state, 'materialized');
  assert.equal('lineage' in compact, false);
  assert.equal('evidence' in compact, false);

  const explicit = projectCommonCliDefaultOutput(full, { command: 'project-grounding-readiness', surfaceCommand: 'ground', positionals: ['/tmp/carrier.zip'], flags: { route: '001-pointer.trace.md', continue: '/tmp/site', 'include-required-context': 'required:b' } });
  assert.equal(explicit.requiredContext.items.length, 2, 'explicit Required Context projection must retain item metadata/body in continuation output');
  assert.equal(explicit.requiredContext.items[1].content, '# Exact requested body');
}

{
  const ordinary = groundContinuationOperationInput({ includeRequiredContext: '' }, { continue: '/tmp/site' });
  assert.equal(ordinary.includeRequiredContext, '', 'ordinary ground --continue must not auto-project every Required Context body');
  assert.equal(ordinary.includeCurrentWork, true, 'ordinary ground --continue must still project bounded current work');
  const full = groundContinuationOperationInput({ includeRequiredContext: '' }, { continue: '/tmp/site', full: true });
  assert.equal(full.includeRequiredContext, 'all', '--full ground --continue must retain the legacy full body-scale receipt path');
  const selected = groundContinuationOperationInput({ includeRequiredContext: '' }, { continue: '/tmp/site', 'include-required-context': 'required:a' });
  assert.equal(selected.includeRequiredContext, 'required:a', 'explicit Required Context selection must override compact default behavior');
}

{
  const full = {
    schema: 'tiinex.portable.operation.result.v1',
    operation: 'manufacture-handoff-package',
    resultSchema: 'tiinex.portable.handoff-manufacturing.v2',
    status: 'ready',
    verification: { roundtrip: 'passed', toolingBootstrap: 'valid' },
    planSummary: { status: 'ready', requiredClosureReady: true, semanticHandoffStatus: 'unknown', required: [{ id: 'a' }], reference: [], workspaces: [{ id: 'site', materialization: 'complete', qualification: 'qualified', entryCount: 10, completenessState: 'qualified', noisy: 'large' }] },
    carrierProjection: { status: 'ready', mode: 'single', lineage: { mode: 'continue', dimension: '007-2', parentDimension: '007-1', checkpointKind: 'progression', authority: 'human-progress-projection-only' }, routes: [{ id: 'route:return', state: 'qualified', workspaceId: 'site', workspaceRelativePath: '.topics/return.trace.md', from: 'Loom', to: 'Anchor', projectedFilename: 'return.handoff-package.zip', large: 'receipt' }] },
    primaryOutput: { status: 'written', path: '/tmp/return.handoff-package.zip', bytes: 1000, projectedFilename: 'return.handoff-package.zip', selectedRoute: '.topics/return.trace.md' },
    humanOutput: {
      normalInlineRouting: { kind: 'transport-text', content: 'Handoff package attached.\n', normalEmission: true, authority: 'none' },
      sharedRouting: { mode: 'one-shared-package-many-exact-route-texts', primary: { filename: 'return.handoff-package.zip' }, routes: [{ routeId: 'route:return', transportText: 'route text', authority: 'none' }], selectionAuthority: 'exact-qualified-route-only', siblingInference: false, readOnly: true },
      presentation: { copyableSurfaceRequired: true, exactContentRequired: true, fencedCodeBlockWhenSupported: 'required', markdownCapableHostRendering: 'fenced-code-block', wrapperAuthority: 'none' },
      normalEmissionBoundary: { allowed: ['primary', 'normalInlineRouting'], canonicalFilePayloadCount: 1, workspaceArtifactsAsLooseTransportFiles: false, semanticWorkSummaryProse: false, helperArtifacts: false, manuallyReconstructedRouting: false, duplicateNormalFileChoices: false },
      internal: { large: 'receipt' }
    },
    roundtripSummary: { status: 'passed' },
    toolingBootstrapInspection: { status: 'valid', delivery: 'embedded', counts: { errors: 0 }, qualification: { large: 'receipt' } },
    operationBoundary: { sourceMutation: false, remoteMutation: false },
    manufacturingEvidence: { huge: 'receipt' },
    findingSummary: { counts: { error: 0, warning: 0, total: 0 } },
    findings: []
  };
  const parsed = { command: 'manufacture-handoff-package', surfaceCommand: 'handoff', positionals: ['/tmp/site'], flags: {} };
  const compact = projectCommonCliDefaultOutput(full, parsed);
  assert.equal(compact.projection, 'common-default');
  assert.equal(compact.transport.primary.path, '/tmp/return.handoff-package.zip');
  assert.equal(compact.transport.routing.content, 'Handoff package attached.\n');
  assert.equal(compact.transport.sharedRouting.selectionAuthority, 'exact-qualified-route-only');
  assert.equal(compact.transport.sharedRouting.siblingInference, false);
  assert.equal(compact.transport.presentation.markdownCapableHostRendering, 'fenced-code-block');
  assert.equal(compact.transport.normalEmission.canonicalFilePayloadCount, 1);
  assert.equal(compact.transport.normalEmission.workspaceArtifactsAsLooseTransportFiles, false);
  assert.equal(compact.closure.requiredClosureReady, true);
  assert.equal(compact.carrier.route.to, 'Anchor');
  assert.equal('manufacturingEvidence' in compact, false);
  assert.equal(compact.detail.fullReceipt.workspace, '/tmp/site');
  assert.equal(projectCommonCliDefaultOutput(full, { ...parsed, flags: { full: true } }), full, 'public handoff --full must preserve the complete manufacture receipt');
  assert.equal(projectCommonCliDefaultOutput(full, { ...parsed, surfaceCommand: 'manufacture-handoff-package' }), full, 'advanced manufacture operation must retain its existing default receipt contract');
}

{
  const blocked = projectCommonCliDefaultOutput({
    schema: 'tiinex.portable.operation.result.v1',
    operation: 'project-grounding-readiness',
    resultSchema: 'tiinex.portable.grounding-readiness.v1',
    status: 'blocked',
    readiness: { state: 'grounded-to-discuss', reasons: [{ code: 'required-context-missing', message: 'Required material is missing.' }], missingEvidence: ['required:missing'], nextAction: { kind: 'recover-required-context', target: 'required:missing' } },
    authority: { route: {}, handoff: {}, role: {}, operationBoundary: {} },
    coverage: { requiredContext: { declared: 1, matchedInWorkspaceSnapshots: 0, missingFromWorkspaceSnapshots: 1, items: [{ requirementId: 'required:missing', name: 'missing', state: 'missing' }] } },
    currentWork: { state: 'blocked', frontier: [], blockers: [{ kind: 'required-context', text: 'Recover missing material.' }] },
    continuity: { state: 'blocked', proof: { roots: [] }, blockingIssues: [{ code: 'parent-unresolved' }], recovery: { state: 'host-action-available', hostAction: { action: 'repository-read', request: { path: '.topics/missing.trace.md' } } }, losses: { state: 'none', blocking: false, items: [] } },
    findings: [{ severity: 'error', code: 'required-context.missing', message: 'Recover the exact required context before acting.' }],
    findingSummary: { status: 'invalid', counts: { error: 1, warning: 0, total: 1 } }
  }, { command: 'project-grounding-readiness', surfaceCommand: 'ground', positionals: ['/tmp/carrier.zip'], flags: { route: '001-pointer.trace.md' } });
  assert.equal(blocked.readiness.state, 'grounded-to-discuss');
  assert.equal(blocked.requiredContext.missingFromWorkspaceSnapshots, 1);
  assert.equal(blocked.continuity.recovery.state, 'host-action-available');
  assert.equal(blocked.actionableFindings[0].code, 'required-context.missing');
  assert.equal(blocked.actionableFindings[0].message, 'Recover the exact required context before acting.');
}

console.log('✓ common CLI decision-first default projection and explicit --full detail path passed');
