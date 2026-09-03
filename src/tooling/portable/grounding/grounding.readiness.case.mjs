import assert from 'node:assert/strict';
import { createRecordFromMarkdown } from '../../../artifacts/artifact.record.js';
import { sealC14nV2Self } from '../../../integrity/integrity.c14nV2.js';
import { C14N_V2_VALIDATOR_TARGET } from '../../../integrity/integrity.methodReference.js';
import { composeGroundingReadiness } from './grounding.readiness.js';
import { acceptPortableHostActionReceipt } from '../host/tool.bindings.js';

const ROUTE_PATH = 'site/.topics/tooling/current-handoff.trace.md';
const TASK_PATH = 'site/.topics/tooling/current-task.trace.md';

const qualifiedAuthority = Object.freeze({
  status: 'ready',
  selectedRoute: Object.freeze({
    id: 'handoff-route:site:.topics/tooling/current-handoff.trace.md',
    workspaceId: 'site',
    workspaceRelativeHandoffPath: '.topics/tooling/current-handoff.trace.md',
    pointerPath: '001-pointer.trace.md'
  }),
  role: Object.freeze({ state: 'qualified', endpoint: Object.freeze({ label: 'Loom', kind: 'role' }) }),
  handoff: Object.freeze({ purpose: 'bounded current work', from: 'Anchor', to: 'Loom' }),
  mutationBoundary: Object.freeze({ sourceMutation: false, remoteWrite: false })
});

const readyContextAudit = Object.freeze({
  status: 'ready',
  coverage: Object.freeze({ state: 'qualified' }),
  workspaceMaterializations: Object.freeze([{ workspaceId: 'site' }])
});

function qualifiedTaskRecord({ path = TASK_PATH, status = 'draft/local', trace = '' } = {}) {
  const parent = trace
    ? `- Parent\n  - Parent Schema: tiinex.task.v1\n  - Created At: 2026-09-02 00:00:00\n  - Trace: [Parent](${trace})\n  - Origin:\n    - [relative](${trace})\n`
    : '';
  const unsigned = `# Continuity Context

- Envelope Schema: tiinex.root.v1
${parent}- Current
  - Current Schema: tiinex.task.v1
  - Created At: 2026-09-02 00:01:00
  - Summary: Synthetic current grounding task
  - Status: ${status}

---

# Synthetic Current Grounding Task

## Objective

Exercise one bounded grounding-readiness invariant.

## Done Criteria

- the expected readiness state is preserved

## Scope

- synthetic permanent component regression only

## Dependencies

- none

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})
  - Towards: self
  - Value: pending
`;
  const sealed = sealC14nV2Self(unsigned);
  assert.equal(sealed.state, 'sealed');
  return Object.freeze({
    ...createRecordFromMarkdown(sealed.markdown, { path }),
    id: path,
    path
  });
}

function routeRecord(trace = 'current-task.trace.md') {
  return Object.freeze({
    id: ROUTE_PATH,
    path: ROUTE_PATH,
    title: 'Current Handoff',
    schemaId: 'tiinex.handoff.v1',
    trace,
    origin: '',
    lifecycleStatus: 'ready/local',
    markdown: ''
  });
}

function composeCase({ authority = qualifiedAuthority, continuation = Object.freeze({ state: 'ready' }), contextAudit = readyContextAudit, requiredContext = Object.freeze([]), records = Object.freeze([qualifiedTaskRecord(), routeRecord()]), assets = Object.freeze([]) } = {}) {
  return composeGroundingReadiness({
    mode: 'routed-handoff-package',
    authority,
    continuation,
    contextAudit,
    requiredContext,
    material: Object.freeze({ records, assets, findings: Object.freeze([]) })
  });
}

{
  const result = composeCase();
  assert.equal('mutationBoundary' in result.authority, false, 'operation safety must not be presented as a semantic authority mutation boundary');
  assert.equal(result.authority.operationBoundary.sourceMutation, false);
  assert.equal(result.authority.operationBoundary.remoteWrite, false);
  assert.equal(result.authority.operationBoundary.scope, 'current-grounding-operation-only');
  assert.match(result.authority.operationBoundary.semanticAuthority, /Handoff\/Task\/Role artifacts govern downstream work authority/);
  assert.match(result.authority.operationBoundary.boundary, /must not be interpreted as a prohibition on separately authorized downstream Workspace work/);
}
console.log('✓ grounding authority projection distinguishes operation safety from downstream semantic work authority passed');

{
  const result = composeGroundingReadiness({
    mode: 'routed-handoff-package',
    authority: qualifiedAuthority,
    continuation: Object.freeze({ state: 'ready' }),
    contextAudit: readyContextAudit,
    requiredContext: Object.freeze([]),
    material: Object.freeze({
      records: Object.freeze([{
        id: ROUTE_PATH,
        path: ROUTE_PATH,
        title: 'Current Handoff',
        schemaId: 'tiinex.handoff.v1',
        trace: '',
        origin: '',
        lifecycleStatus: 'ready/local',
        hasContinuityContext: true,
        hasIntegrity: true
      }]),
      findings: Object.freeze([])
    })
  });

  assert.equal(result.authority.state, 'ready', 'high-level Handoff authority should remain recovered');
  assert.equal(result.lineage.state, 'resolved', 'the selected route itself should be a resolved loaded Parent leaf');
  assert.equal(result.currentWork.state, 'unresolved', 'missing declared current Task evidence must remain visible');
  assert.equal(result.readiness.state, 'grounded-to-discuss', 'authority + route leaf alone must never become act-ready without current-work frontier evidence');
  assert.equal(result.readiness.reasons.some((item) => item.code === 'current-frontier-not-resolved'), true);
}
console.log('✓ grounding readiness refuses false-green act readiness when current frontier evidence is absent passed');

{
  const cases = [
    {
      name: 'missing selected-route Parent',
      expected: 'insufficient-grounding',
      input: { records: Object.freeze([qualifiedTaskRecord(), routeRecord('missing-parent.trace.md')]) },
      missingCode: 'selected-route-lineage-unresolved'
    },
    {
      name: 'ambiguous selected-route Parent',
      expected: 'insufficient-grounding',
      input: { records: Object.freeze([
        qualifiedTaskRecord({ path: 'site/a/shared-parent.trace.md' }),
        qualifiedTaskRecord({ path: 'site/b/shared-parent.trace.md' }),
        routeRecord('shared-parent.trace.md')
      ]) },
      missingCode: 'selected-route-lineage-unresolved'
    },
    {
      name: 'incomplete carried Workspace coverage',
      expected: 'insufficient-grounding',
      input: { contextAudit: Object.freeze({ status: 'blocked', coverage: Object.freeze({ state: 'partial' }), workspaceMaterializations: Object.freeze([]) }) },
      missingCode: 'workspace-snapshot-coverage-unqualified'
    },
    {
      name: 'unqualified Required Context',
      expected: 'insufficient-grounding',
      input: { requiredContext: Object.freeze([{ requirementId: 'required:x', name: 'x', state: 'missing' }]) },
      missingCode: 'required-context-unqualified'
    },
    {
      name: 'qualified Required Context absent from carried snapshots',
      expected: 'insufficient-grounding',
      input: { requiredContext: Object.freeze([{ requirementId: 'required:x', name: 'x', state: 'qualified', workspaceId: 'site', innerPath: '.topics/tooling/not-loaded.trace.md' }]) },
      missingCode: 'required-context-not-in-snapshot'
    },
    {
      name: 'blocked authority',
      expected: 'insufficient-grounding',
      input: { authority: Object.freeze({ ...qualifiedAuthority, status: 'blocked' }) },
      missingCode: 'authority-route-unqualified'
    },
    {
      name: 'blocked recipient Role',
      expected: 'insufficient-grounding',
      input: { authority: Object.freeze({ ...qualifiedAuthority, role: Object.freeze({ state: 'blocked', endpoint: Object.freeze({ label: 'Loom', kind: 'role' }) }) }) },
      missingCode: 'recipient-role-blocked'
    },
    {
      name: 'unresolved recipient Role',
      expected: 'insufficient-grounding',
      input: { authority: Object.freeze({ ...qualifiedAuthority, role: Object.freeze({ state: 'unresolved', endpoint: Object.freeze({ label: 'Loom', kind: 'role' }) }) }) },
      missingCode: 'recipient-role-unresolved'
    },
    {
      name: 'stale terminal Task only',
      expected: 'grounded-to-discuss',
      input: { records: Object.freeze([qualifiedTaskRecord({ status: 'completed/local' }), routeRecord()]) },
      reasonCode: 'current-frontier-not-resolved'
    }
  ];

  for (const testCase of cases) {
    const result = composeCase(testCase.input);
    assert.equal(result.readiness.state, testCase.expected, testCase.name);
    if (testCase.missingCode) assert.equal(result.readiness.missingEvidence.some((item) => item.code === testCase.missingCode), true, `${testCase.name}: expected blocking evidence`);
    if (testCase.reasonCode) assert.equal(result.readiness.reasons.some((item) => item.code === testCase.reasonCode), true, `${testCase.name}: expected readiness reason`);
    assert.notEqual(result.readiness.state, 'grounded-to-act', `${testCase.name}: adversarial incomplete evidence must not false-green`);
  }
}
console.log('✓ grounding adversarial authority/context/Parent/staleness matrix has no false grounded-to-act outcomes passed');

{
  const result = composeCase();
  assert.equal(result.readiness.state, 'grounded-to-act');
  assert.equal(result.continuity.state, 'qualified');
  assert.equal(result.continuity.proof.compactReceiptOnly, true);
  assert.equal(result.continuity.proof.bodiesProjected, 0);
}
console.log('✓ qualified current branch remains cold-start act-ready with a compact root-continuity receipt passed');

{
  const result = composeCase({
    records: Object.freeze([
      qualifiedTaskRecord({ trace: 'https://github.com/Tiinex/site/blob/56ba75025b7a8fd44b5318d2560d2ec63eb0106f/.topics/tooling/historic-parent-not-loaded.trace.md' }),
      routeRecord()
    ])
  });
  assert.equal(result.readiness.state, 'insufficient-grounding', 'a cold-started recipient must not act when the loaded apparent root still declares an unavailable Parent');
  assert.equal(result.lineage.state, 'resolved-with-upstream-degradation');
  assert.equal(result.continuity.state, 'unproven');
  assert.equal(result.readiness.missingEvidence.some((item) => item.code === 'cold-start-root-continuity-unproven'), true);
  assert.equal(result.evidence.unresolved.some((item) => item.code === 'upstream-lineage-diagnostics' && item.state === 'blocking-for-cold-start-continuity'), true);
  assert.equal(result.continuity.recovery.state, 'operator-required');
  assert.match(result.continuity.recovery.allowedScope, /exact declared target|exact declared Parent/i);
}
console.log('✓ cold-start grounding blocks the real-carrier-shaped upstream Parent false-green and projects exact operator recovery passed');

{
  const rootRecord = qualifiedTaskRecord({ path: 'site/.topics/tooling/qualified-root.trace.md' });
  const childTask = qualifiedTaskRecord({ trace: 'qualified-root.trace.md' });
  const result = composeCase({ records: Object.freeze([rootRecord, childTask, routeRecord()]) });
  assert.equal(result.readiness.state, 'grounded-to-act');
  assert.equal(result.continuity.state, 'qualified');
  assert.equal(result.continuity.proof.qualifiedRoots.length, 1);
  assert.equal(result.continuity.proof.bodiesProjected, 0);
}
console.log('✓ compact cold-start continuity proof qualifies a fully resolved Parent chain without ancestor body projection passed');

{
  const hostAuthority = Object.freeze({
    ...qualifiedAuthority,
    capabilities: Object.freeze({
      discovery: Object.freeze({
        profile: Object.freeze({
          toolBindings: Object.freeze({
            repositoryRead: Object.freeze({
              selected: Object.freeze({ tool: Object.freeze({ id: 'github-fetch-file', name: 'GitHub fetch file' }) })
            })
          })
        })
      })
    })
  });
  const target = 'https://github.com/Tiinex/site/blob/56ba75025b7a8fd44b5318d2560d2ec63eb0106f/.topics/tooling/historic-parent-not-loaded.trace.md';
  const result = composeCase({
    authority: hostAuthority,
    records: Object.freeze([qualifiedTaskRecord({ trace: target }), routeRecord()])
  });
  assert.equal(result.readiness.state, 'insufficient-grounding');
  assert.equal(result.continuity.recovery.state, 'host-action-available');
  assert.equal(result.continuity.recovery.hostAction.action, 'repository-read');
  assert.equal(result.continuity.recovery.hostAction.request.repository, 'Tiinex/site');
  assert.equal(result.continuity.recovery.hostAction.request.ref, '56ba75025b7a8fd44b5318d2560d2ec63eb0106f');
  assert.equal(result.continuity.recovery.hostAction.request.path, '.topics/tooling/historic-parent-not-loaded.trace.md');
  assert.match(result.continuity.recovery.resume.recoveryOption, /--recovery/);
}
console.log('✓ exact host-recoverable missing Parent projects one bounded repository-read route and resumable ground command passed');

{
  const hostAuthority = Object.freeze({
    ...qualifiedAuthority,
    capabilities: Object.freeze({
      discovery: Object.freeze({
        profile: Object.freeze({
          toolBindings: Object.freeze({
            repositoryRead: Object.freeze({
              selected: Object.freeze({ tool: Object.freeze({ id: 'github-fetch-file', name: 'GitHub fetch file' }) })
            })
          })
        })
      })
    })
  });
  const recovered = qualifiedTaskRecord({
    path: 'site/.topics/tooling/recovered-parent.trace.md',
    trace: 'next-relative-parent.trace.md'
  });
  const acceptedPinnedRecovered = Object.freeze({
    ...recovered,
    sourceMode: 'portable-host-repository',
    source: Object.freeze({
      repository: 'Tiinex/site',
      ref: '56ba75025b7a8fd44b5318d2560d2ec63eb0106f',
      commit: '56ba75025b7a8fd44b5318d2560d2ec63eb0106f',
      path: '.topics/tooling/recovered-parent.trace.md',
      receiptQualification: 'accepted-host-repository-read',
      provenanceQualification: 'accepted-host-repository-pinned'
    })
  });
  const result = composeCase({
    authority: hostAuthority,
    records: Object.freeze([acceptedPinnedRecovered, routeRecord('recovered-parent.trace.md')])
  });
  assert.equal(result.readiness.state, 'insufficient-grounding');
  assert.equal(result.continuity.recovery.state, 'host-action-available');
  assert.equal(result.continuity.recovery.resolutionBasis, 'accepted-pinned-parent-source-relative-resolution');
  assert.equal(result.continuity.recovery.hostAction.request.repository, 'Tiinex/site');
  assert.equal(result.continuity.recovery.hostAction.request.ref, '56ba75025b7a8fd44b5318d2560d2ec63eb0106f');
  assert.equal(result.continuity.recovery.hostAction.request.path, '.topics/tooling/next-relative-parent.trace.md');
}
console.log('✓ accepted pinned repository Parent deterministically resolves its relative Parent without operator escalation passed');

{
  const plan = (actionId) => Object.freeze({
    actionId,
    action: 'repository-read',
    steps: Object.freeze([Object.freeze({
      stepId: `${actionId}:1`,
      capability: 'repositoryRead',
      tool: Object.freeze({ id: 'github-fetch-file' })
    })])
  });
  const receipt = (actionId, path) => Object.freeze({
    schema: 'tiinex.portable.host-action-receipt.v1',
    actionId,
    action: 'repository-read',
    steps: Object.freeze([Object.freeze({
      stepId: `${actionId}:1`,
      toolId: 'github-fetch-file',
      status: 'completed',
      normalized: Object.freeze({
        files: Object.freeze([Object.freeze({
          path,
          content: `# ${path}\n`,
          source: Object.freeze({
            repository: 'Tiinex/site',
            ref: '56ba75025b7a8fd44b5318d2560d2ec63eb0106f',
            commit: '56ba75025b7a8fd44b5318d2560d2ec63eb0106f',
            path,
            authority: 'remote-repository-unverified'
          })
        })])
      })
    })])
  });
  const first = acceptPortableHostActionReceipt({
    plan: plan('host-action:first'),
    receipt: receipt('host-action:first', '.topics/tooling/first.trace.md')
  });
  const second = acceptPortableHostActionReceipt({
    plan: plan('host-action:second'),
    receipt: receipt('host-action:second', '.topics/tooling/second.trace.md'),
    priorAcceptance: first
  });
  assert.equal(first.status, 'accepted');
  assert.equal(second.status, 'accepted');
  assert.equal(second.cumulativeRecovery.priorAccepted, true);
  assert.equal(second.providerResponses.length, 1);
  assert.deepEqual(
    second.providerResponses[0].files.map((file) => file.path),
    ['.topics/tooling/first.trace.md', '.topics/tooling/second.trace.md']
  );
}
console.log('✓ accept-host-receipt explicitly carries prior accepted recovery material forward without hidden state passed');

{
  const commit = '56ba75025b7a8fd44b5318d2560d2ec63eb0106f';
  const plan = Object.freeze({
    actionId: 'host-action:exact-parent',
    action: 'repository-read',
    steps: Object.freeze([Object.freeze({
      stepId: 'host-action:exact-parent:1',
      capability: 'repositoryRead',
      tool: Object.freeze({ id: 'github-fetch-file' }),
      argumentsTemplate: Object.freeze({ repository: 'Tiinex/site', ref: commit, path: '.topics/tooling/exact-parent.trace.md' })
    })])
  });
  const receipt = Object.freeze({
    schema: 'tiinex.portable.host-action-receipt.v1',
    actionId: plan.actionId,
    action: plan.action,
    steps: Object.freeze([Object.freeze({
      stepId: 'host-action:exact-parent:1',
      toolId: 'github-fetch-file',
      status: 'completed',
      normalized: Object.freeze({ files: Object.freeze([Object.freeze({
        path: '.topics/tooling/decoy-parent.trace.md',
        content: '# decoy\n',
        source: Object.freeze({
          repository: 'Tiinex/other',
          ref: 'main',
          commit: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
          path: '.topics/tooling/decoy-parent.trace.md',
          authority: 'remote-repository-unverified'
        })
      })]) })
    })])
  });
  const result = acceptPortableHostActionReceipt({ plan, receipt });
  assert.equal(result.status, 'rejected');
  assert.equal(result.providerResponses.length, 0, 'identity-mismatched repository bytes must not enter accepted recovery material');
  assert.equal(result.findings.some((finding) => finding.code === 'portable.host-receipt.repository-identity.mismatch'), true);
  assert.equal(result.findings.some((finding) => finding.code === 'portable.host-receipt.repository-path.mismatch'), true);
  assert.equal(result.findings.some((finding) => finding.code === 'portable.host-receipt.repository-ref.mismatch'), true);
}
console.log('✓ accept-host-receipt rejects repository bytes that do not match the exact planned repository/ref/path identity passed');

{
  const result = composeCase({
    assets: Object.freeze([Object.freeze({ path: 'site/assets/unavailable.png', kind: 'asset', previewState: 'metadata-only', contentAvailable: false })])
  });
  assert.equal(result.readiness.state, 'grounded-to-act');
  assert.equal(result.continuity.losses.state, 'degraded');
  assert.equal(result.continuity.losses.blocking, false);
  assert.equal(result.evidence.unresolved.some((item) => item.code === 'non-critical-material-loss'), true);
}
console.log('✓ unavailable non-critical asset remains visible degradation without blocking unrelated cold-start work passed');

{
  const noise = Object.freeze(Array.from({ length: 2000 }, (_, index) => Object.freeze({
    id: `site/noise/noise-${index}.trace.md`,
    path: `site/noise/noise-${index}.trace.md`,
    title: `Noise ${index}`,
    schemaId: 'tiinex.topic.v1',
    trace: '',
    origin: '',
    lifecycleStatus: '',
    markdown: ''
  })));
  const result = composeCase({ records: Object.freeze([qualifiedTaskRecord(), routeRecord(), ...noise]) });
  const serializedBytes = Buffer.byteLength(JSON.stringify(result), 'utf8');
  assert.equal(result.readiness.state, 'grounded-to-act');
  assert.equal(result.coverage.loadedRecords, 2002);
  assert.equal(result.coverage.relevantRecords, 2, 'irrelevant loaded material must not expand the decision-relevant Parent cone');
  assert.equal(result.coverage.requiredContext.bodiesProjected, 0, 'scale alone must never trigger body projection');
  assert.equal(result.currentWork.frontier[0].path, TASK_PATH, 'exact current pointer must survive a large irrelevant-artifact field');
  assert(serializedBytes < 10_000, `bounded decision receipt should remain compact under irrelevant scale; got ${serializedBytes} bytes`);
}
console.log('✓ grounding decision receipt remains bounded and exact with 2,000 irrelevant loaded artifacts passed');

{
  const result = composeGroundingReadiness({
    mode: 'loaded-material',
    material: Object.freeze({
      records: Object.freeze([
        {
          id: 'parent-by-declaration',
          path: 'site/999-child-looking.trace.md',
          title: 'Declared Parent Despite Filename',
          schemaId: 'tiinex.topic.v1',
          trace: '',
          origin: ''
        },
        {
          id: 'child-by-declaration',
          path: 'site/001-root-looking.trace.md',
          title: 'Declared Child Despite Filename',
          schemaId: 'tiinex.topic.v1',
          trace: '999-child-looking.trace.md',
          origin: ''
        }
      ]),
      findings: Object.freeze([])
    })
  });

  assert.equal(result.lineage.roots[0].id, 'parent-by-declaration', 'root identity must follow declared Parent topology rather than filename dimensions');
  assert.equal(result.lineage.leaves[0].id, 'child-by-declaration', 'leaf identity must follow declared Parent topology rather than filename dimensions');
  assert.equal(result.lineage.filenameDimensionsUsed, false);
  assert.equal(result.lineage.carrierDimensionsUsed, false);
  assert.match(result.lineage.boundary, /Filename numbering, carrier dimensions/);
}
console.log('✓ grounding readiness never substitutes filename or carrier dimensions for declared Parent lineage passed');
