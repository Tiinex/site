import assert from 'node:assert/strict';
import { projectGroundingCapsule } from './grounding.capsule.js';

const handoffPath = 'delta/.topics/handoff.trace.md';
const capsule = projectGroundingCapsule({
  authority: {
    selectedRoute: { workspaceId: 'delta', workspaceRelativeHandoffPath: '.topics/handoff.trace.md' },
    role: { state: 'qualified', endpoint: { label: 'Relay' } },
    holderBinding: { state: 'qualified', roleLabel: 'Relay', recipientCompatibility: 'matched' }
  },
  continuation: { packageSourcePath: '/carrier/shared.zip' },
  contextAudit: {
    status: 'ready', coverage: { state: 'qualified' },
    workspaceMaterializations: [
      { workspaceId: 'delta', qualification: 'qualified', reason: 'complete-workspace-archive-representation', sourceWorkspaceTargetInnerPath: '.topics/.workspaces/delta.workspace.md', sourceWorkspaceTargetSha256: 'delta-sha' },
      { workspaceId: 'harbor', qualification: 'qualified', reason: 'complete-workspace-archive-representation', sourceWorkspaceTargetInnerPath: '.topics/.workspaces/harbor.workspace.md', sourceWorkspaceTargetSha256: 'harbor-sha' }
    ]
  },
  requiredContext: [{
    requirementId: 'required:plan', state: 'qualified', workspaceId: 'delta', innerPath: '.topics/plan.trace.md',
    content: `# Neutral Plan\n\n## Objective\n\nProve generic grounding without project-name semantics.\n\n## Planning Context\n\n- Segment: Bounded grounding trust\n- Purpose: Recover cold-start meaning from qualified material.\n- End Condition: Exact source and current-work projections are trustworthy.\n- Expected Remaining Turns Or Handoffs: 2-3\n- Confidence: medium-high\n- After This Segment: Lifecycle semantics remain separate.\n\n## Scope\n\n- bounded mechanics only\n`
  }],
  records: [{
    id: handoffPath, path: handoffPath, schemaId: 'neutral.handoff.v1', markdown: `# Neutral Handoff\n\n## Exclusions And Dependencies\n\n- no-invented-membership\n  - Kind: excluded-scope\n  - Description: Do not infer Initiative membership from Parent.\n`
  }, sourceRecord('delta/.topics/.workspaces/delta.workspace.md', `# Delta Workspace\n\n## Workspace Entrypoints\n\n### Delta source\n\n- Source Kind: github-tree\n- Repository: Acme/neutral\n- Ref: stable\n- Root Path: .\n`),
  sourceRecord('harbor/.topics/.workspaces/harbor.workspace.md', `# Harbor Workspace\n\n## Workspace Entrypoints\n\n### Harbor local source\n\n- Source Kind: local-directory\n- Root Path: .\n`),
  sourceRecord('delta/.topics/.schemas/schema-companion.workspace.md', `# Schema Companion\n\n## Schema Origins\n\n- Repository: Wrong/specs\n- Ref: master\n- Root Path: schemas\n`)],
  topology: { currentFrontier: [{ path: 'delta/.topics/current.task.md', declaredStatus: 'draft/local', objective: 'Complete bounded genericity mechanics.' }] },
  blockers: []
});

assert.equal(capsule.semanticReductions[0].title, 'Neutral Plan');
assert.equal(capsule.semanticReductions[0].basis, 'exact-qualified-body-reduction');
assert.equal(capsule.semanticReductions[0].signals[0].heading, 'Objective');
assert.match(capsule.semanticReductions[0].signals[0].text, /generic grounding/);
assert.equal(capsule.exclusions[0].id, 'no-invented-membership');
assert.equal(capsule.exclusions[0].kind, 'excluded-scope');
assert.equal(capsule.sourceEvidence.workspaces.length, 2, 'source evidence must be one row per qualified materialized workspace, not every carried workspace-schema companion');
assert.equal(capsule.sourceEvidence.workspaces[0].repository, 'Acme/neutral');
assert.equal(capsule.sourceEvidence.workspaces[0].ref, 'stable');
assert.equal(capsule.sourceEvidence.workspaces[0].remoteState, 'not-checked');
assert.equal(capsule.sourceEvidence.workspaces[0].sourceArtifactPath, 'delta/.topics/.workspaces/delta.workspace.md');
assert.equal(capsule.sourceEvidence.workspaces[1].repository, '', 'local source without explicit repository must remain blank');
assert.equal(capsule.sourceEvidence.workspaces[1].ref, '', 'local source without explicit ref must remain blank');
assert.equal(JSON.stringify(capsule.sourceEvidence).includes('Wrong/specs'), false, 'schema companion source metadata must not be misprojected as workspace source evidence');
assert.equal(capsule.planningContext.state, 'qualified');
assert.equal(capsule.planningContext.items[0].segment, 'Bounded grounding trust');
assert.match(capsule.planningContext.items[0].purpose, /cold-start meaning/);
assert.equal(capsule.planningContext.items[0].forecast, '2-3');
assert.equal(capsule.planningContext.items[0].confidence, 'medium-high');
assert.match(capsule.planningContext.items[0].afterBoundary, /Lifecycle semantics/);
assert.equal(capsule.roleState.recipient, 'Relay');
assert.equal(capsule.roleState.holder, 'Relay');
assert.equal(capsule.frontier.state, 'resolved');
assert.match(capsule.frontier.rationale, /declared Parent distance/);
assert.equal(capsule.unresolved[0].slot, 'organizational-work-provenance');
assert.equal(capsule.unresolved[0].state, 'unresolved');
assert.match(capsule.boundary, /Full Required Context bodies remain selector-gated/);
assert.equal('content' in capsule.semanticReductions[0], false, 'compact semantic reduction must not leak full Required Context bodies');

console.log('✓ grounding capsule genericity regression: exact workspace source evidence, durable plan context, reductions, and explicit unknowns stay bounded and non-authoritative');

function sourceRecord(path, markdown) {
  return { id: path, path, schemaId: 'tiinex.workspace.v1', markdown, title: path, hasContinuityContext: true, hasIntegrity: true };
}
