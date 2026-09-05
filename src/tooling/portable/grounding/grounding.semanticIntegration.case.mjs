import assert from 'node:assert/strict';
import { projectGroundingCapsule } from './grounding.capsule.js';
import { projectParticipantAuthority } from './grounding.participantAuthority.js';
import { projectWorkProvenance } from './grounding.workProvenance.js';

const sourcePath = 'orchard/.work/current.task.trace.md';
const childPath = 'orchard/.work/current-child.task.trace.md';
const targetA = 'charter/.plans/outcome-a.task.trace.md';
const targetB = 'charter/.plans/outcome-b.task.trace.md';
const projectA = 'charter/.plans/project-a.trace.md';
const projectB = 'charter/.plans/project-b.trace.md';
const records = [
  record(sourcePath, 'neutral.task.v1', 'Current execution work', '# Current execution work'),
  contextChild(targetA, 'Outcome A', './project-a.trace.md'),
  contextChild(targetB, 'Outcome B', './project-b.trace.md'),
  contextOwner(projectA, 'Project A', 'Organization Alpha'),
  contextOwner(projectB, 'Project B', 'Organization Beta'),
  relation('orchard/.work/edge-a.relation.trace.md', 'advances', './current.task.trace.md', 'charter::.plans/outcome-a.task.trace.md'),
  relation('orchard/.work/edge-b.relation.trace.md', 'commissioned by', './current.task.trace.md', 'charter::.plans/outcome-b.task.trace.md'),
  record('orchard/.work/prose-only.trace.md', 'neutral.note.v1', 'Prose only', '# Note\n\n- Parent: charter::.plans/outcome-a.task.trace.md\n- Summary: work-provenance maybe\n')
];

const projection = projectWorkProvenance({ records, topology: { currentFrontier: [{ path: sourcePath }], relevantPaths: [sourcePath] } });
assert.equal(projection.state, 'qualified');
assert.equal(projection.current.edges.length, 2, 'multiple qualified upstream edges must be preserved without electing one controller');
assert.deepEqual(projection.current.edges.map((edge) => edge.relationType).sort(), ['advances', 'commissioned by']);
assert.equal(projection.current.edges[0].relationFamily, 'work-provenance');
assert.equal(projection.current.edges[0].source.resolvedPath, sourcePath);
assert.equal(projection.current.edges[0].target.state, 'qualified-carried');
assert.equal(projection.current.edges[0].context.project.state, 'qualified-carried');
assert.equal(projection.current.edges[0].context.organization.state, 'qualified-carried');
assert.equal(projection.current.edges[0].context.project.membershipClaim, false);
assert.equal(projection.reverseDiscovery.length, 2, 'reverse discovery must project the same edges without inverse artifacts');
assert.equal(projection.edges.length, 2, 'prose/Parent adjacency must not synthesize work provenance');
assert.equal(projection.unresolved.length, 0);

const lineageRelevant = projectWorkProvenance({
  records: [...records, record(childPath, 'neutral.task.v1', 'Current descendant', '# Current descendant')],
  topology: { currentFrontier: [{ path: childPath }], relevantPaths: [sourcePath, childPath] }
});
assert.equal(lineageRelevant.state, 'qualified-relevant');
assert.equal(lineageRelevant.current.state, 'qualified-via-selected-lineage');
assert.equal(lineageRelevant.current.edges.length, 2);
assert.equal(lineageRelevant.current.edges[0].source.resolvedPath, sourcePath, 'selected Parent lineage may make an existing relation relevant but must never rewrite its declared source to the descendant frontier');
assert.equal(lineageRelevant.reverseDiscovery.length, 2, 'lineage relevance must still use the same reverse-projected edges');

const unresolvedTarget = projectWorkProvenance({
  records: [record(sourcePath, 'neutral.task.v1', 'Current execution work', '# Current execution work'), relation('orchard/.work/edge-missing.relation.trace.md', 'implements', './current.task.trace.md', 'charter::.plans/not-carried.task.trace.md')],
  topology: { currentFrontier: [{ path: sourcePath }], relevantPaths: [sourcePath] }
});
assert.equal(unresolvedTarget.state, 'unresolved');
assert.equal(unresolvedTarget.edges[0].state, 'unresolved');
assert.equal(unresolvedTarget.edges[0].target.state, 'not-carried');
assert.equal(unresolvedTarget.unresolved[0].slot, 'organizational-work-provenance');


const contextUnresolvedTargetPath = 'charter/.plans/context-unresolved.task.trace.md';
const contextUnresolved = projectWorkProvenance({
  records: [
    record(sourcePath, 'neutral.task.v1', 'Current execution work', '# Current execution work'),
    record(contextUnresolvedTargetPath, 'neutral.outcome.v1', 'Context-unresolved outcome', '# Context-unresolved outcome'),
    relation('orchard/.work/edge-context-unresolved.relation.trace.md', 'advances', './current.task.trace.md', 'charter::.plans/context-unresolved.task.trace.md')
  ],
  topology: { currentFrontier: [{ path: sourcePath }], relevantPaths: [sourcePath] }
});
assert.equal(contextUnresolved.state, 'qualified', 'qualified typed provenance must remain qualified even when project/organization context is explicitly unresolved');
assert.equal(contextUnresolved.context.state, 'unresolved');
assert.equal(contextUnresolved.unresolved.some((item) => item.slot === 'project-context'), true);
assert.equal(contextUnresolved.unresolved.some((item) => item.slot === 'organization-context'), true);

const authority = projectParticipantAuthority({
  handoff: { to: 'Courier' },
  role: {
    state: 'qualified', endpoint: { label: 'Courier', kind: 'role' },
    material: { artifact: { path: 'charter/.roles/courier.role.trace.md', schemaId: 'tiinex.party.role.v1', roleLabel: 'Courier' } },
    authorityBoundaryLoaded: { mayDo: 'Carry and review bounded work.', doesNotAuthorize: 'Does not approve release by identity alone.', reviewBoundary: 'Explicit project instrument required for acceptance.' },
    interpretationLimitsLoaded: { doesNotProve: 'Holder identity or consent.', mustNotBeTreatedAs: 'Automatic acceptance.' }
  },
  holderBinding: { state: 'qualified', roleLabel: 'Courier', source: 'explicit-input', explicit: true, inferredFromTransport: false }
});
assert.equal(authority.state, 'qualified-declared-basis');
assert.match(authority.authorityBoundary.mayDo, /Carry and review/);
assert.equal(authority.participantIdentityCreatesAuthority, false);
assert.equal(authority.conversationPositionCreatesAuthority, false);
assert.equal(authority.universalHumanFeedbackRule, false, 'generic Tooling must not impose a universal human-input-as-feedback rule');
assert.equal(projectParticipantAuthority({ role: { state: 'qualified', endpoint: { label: 'Courier' } } }).state, 'unresolved');
for (const label of ['Coordinator', 'Specialist', 'Human Carrier']) {
  const blank = projectParticipantAuthority({ handoff: { to: label }, role: { state: 'qualified', endpoint: { label } } });
  assert.equal(blank.state, 'unresolved', `${label} label/identity must not create generic authority without explicit qualified Role material`);
  assert.equal(blank.universalHumanFeedbackRule, false);
}

const capsule = projectGroundingCapsule({
  authority: {
    selectedRoute: { workspaceId: 'orchard', workspaceRelativeHandoffPath: '.work/handoff.trace.md' },
    handoff: { to: 'Courier' }, role: {
      state: 'qualified', endpoint: { label: 'Courier', kind: 'role' },
      material: { artifact: { path: 'charter/.roles/courier.role.trace.md', schemaId: 'tiinex.party.role.v1', roleLabel: 'Courier' } },
      authorityBoundaryLoaded: { mayDo: 'Carry and review bounded work.', doesNotAuthorize: 'Does not approve release by identity alone.', reviewBoundary: 'Explicit project instrument required.' }
    },
    holderBinding: { state: 'qualified', roleLabel: 'Courier', recipientCompatibility: 'matched', source: 'explicit-input', explicit: true }
  },
  records: [...records, { id: 'orchard/.work/handoff.trace.md', path: 'orchard/.work/handoff.trace.md', schemaId: 'neutral.handoff.v1', markdown: '# Handoff' }],
  topology: { currentFrontier: [{ path: sourcePath, declaredStatus: 'ready/local', objective: 'Advance both declared outcomes.' }], relevantPaths: [sourcePath] }
});
assert.equal(capsule.workProvenance.state, 'qualified');
assert.equal(capsule.workProvenance.current.edges.length, 2);
assert.equal(capsule.workProvenance.context.state, 'qualified');
assert.equal(capsule.participantAuthority.state, 'qualified-declared-basis');
assert.equal(capsule.unresolved.some((item) => item.slot === 'organizational-work-provenance'), false, 'qualified current provenance must replace the old unconditional unresolved slot');

console.log('✓ grounding semantic integration: typed work provenance, selected-lineage relevance, explicit target context, reverse discovery, unresolved targets, and declared participant authority remain generic and fail-visible');

function contextChild(path, title, parentTrace) {
  const markdown = `# Continuity Context\n\n- Envelope Schema: neutral.root.v1\n- Parent\n  - Parent Schema: neutral.project.v1\n  - Created At: 2026-09-05 00:00:00\n  - Trace: [Parent](${parentTrace})\n- Current\n  - Current Schema: neutral.outcome.v1\n  - Created At: 2026-09-05 00:01:00\n  - Summary: ${title}\n\n---\n\n# ${title}\n\n## Objective\n\nRemain a neutral relation target.\n\n---\n\n# Continuity Integrity\n\n- fixture\n`;
  return record(path, 'neutral.outcome.v1', title, markdown);
}

function contextOwner(path, project, organization) {
  const markdown = `# Continuity Context\n\n- Envelope Schema: neutral.root.v1\n- Current\n  - Current Schema: neutral.project.v1\n  - Created At: 2026-09-05 00:00:00\n  - Summary: ${project}\n\n---\n\n# ${project}\n\n## Project Identity\n\n- Name: ${project}\n- Description: Explicit project context for neutral fixture work.\n- Boundary: Does not imply organization membership by Parent alone.\n\n## Organization Context\n\n- Name: ${organization}\n- Description: Explicit organization context carried by the qualified target context.\n- Boundary: This declaration, not naming or folder placement, is the qualification basis.\n\n---\n\n# Continuity Integrity\n\n- fixture\n`;
  return record(path, 'neutral.project.v1', project, markdown);
}

function relation(path, type, source, target) {
  const markdown = `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.relation.v1\n  - Created At: 2026-09-05 00:00:00\n  - Summary: Neutral typed relation.\n\n---\n\n# Neutral Work Relation\n\n## Relation Declaration\n\n- Relation Type: ${type}\n- Relation Direction: execution work -> controlling work\n- Relation Scope: work-level provenance\n- Relation Family: work-provenance\n\n## Relation Source\n\n- Source: [Execution work](${source})\n\n## Relation Target\n\n- Target: [Controlling work](${target})\n\n## Relation Boundary\n\n- The relation target is not Parent.\n\n---\n\n# Continuity Integrity\n\n- sha256-base64url-c14n-v2\n  - Towards: self\n  - Value: fixture\n`;
  return record(path, 'tiinex.relation.v1', 'Neutral Work Relation', markdown);
}

function record(path, schemaId, title, markdown) {
  return { id: path, path, schemaId, title, summary: `${title} summary`, markdown, hasContinuityContext: true, hasIntegrity: true };
}
