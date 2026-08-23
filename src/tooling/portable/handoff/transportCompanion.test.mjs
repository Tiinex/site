import assert from 'node:assert/strict';
import { packageFileBytes } from '../../../export/package.bytes.js';
import { buildRecipientRelativeHandoffTransportPackage, roundTripRecipientRelativeHandoffTransportPackage } from './materialClosure.package.js';
import { buildHandoffTransportCompanionProjection, HANDOFF_TRANSPORT_COMPANION_PATH, inspectHandoffTransportCompanion } from './transportCompanion.js';
import { prepareRecipientRelativeWorkspaceHandoffExport } from '../../../export/handoff.plan.js';

const handoffPath = '.topics/development/handoff/loom/001-handoff-package-companion-projection-successor-handoff.trace.md';
const handoffMarkdown = `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.handoff.v1\n  - Created At: 2026-08-23 08:56:00\n\n---\n\n# Handoff fixture\n\n## Required Context\n\n## Reference Context\n\n# Continuity Integrity\n\n- sha256-base64url-c14n-v2\n  - Towards: self\n  - Value: fixture\n`;
const handoff = { id: handoffPath, path: handoffPath, reference: `tiinex://${handoffPath}`, semanticStatus: 'valid', markdown: handoffMarkdown };
const workspace = { id: 'current-site', title: 'current Tiinex/site workspace', records: [], assets: [] };
const workspaceMaterializations = [{
  id: 'current-site',
  state: 'complete',
  completenessEvidence: { state: 'qualified', proof: 'enumerated-current-workspace' },
  entries: [{ path: handoffPath, content: handoffMarkdown }]
}];

const built = buildRecipientRelativeHandoffTransportPackage({ handoff, workspace, workspaceMaterializations, localRunId: 'loom-companion-default' }, { packageInput: { builtAt: '2026-08-23T10:15:00.000Z' } });
assert.equal(built.status, 'ready');
assert.equal(built.transportCompanion.status, 'ready');
assert.equal(built.companionInspection.status, 'valid');
assert.equal(built.transportCompanion.routing.state, 'qualified');
assert.equal(built.transportCompanion.routing.workspace.id, 'current-site');
assert.equal(built.transportCompanion.routing.controllingArtifact.workspaceRelativePath, handoffPath);
assert.equal(built.transportCompanion.participation.transportPosture.id, 'transport-only');
assert.equal(built.transportCompanion.participation.actingRole.state, 'none');
assert.equal(built.transportCompanion.participation.carrierAuthority, 'none');
assert.equal(built.transportCompanion.participation.endpointPromotion, false);
assert.equal(built.transportCompanion.authority.semanticAuthority, 'none');
assert.equal(built.transportCompanion.authority.carrierEndpointPromotion, false);
assert.equal(built.transportCompanion.authority.acceptanceAuthority, false);
assert.deepEqual(built.transportCompanion.progressiveDisclosure.expertActionIds, [
  'tiinex.handoff.transport.action.provide-package',
  'tiinex.handoff.transport.action.invoke-recipient',
  'tiinex.handoff.transport.action.carry-result'
]);
assert.equal(built.transportCompanion.progressiveDisclosure.details.length, 3);
assert(built.transportCompanion.actions.every((item) => item.localizationKey.startsWith('handoff.transport.')));
assert.equal(built.transportCompanion.recipientEntrypoint.parameters.workspaceId, 'current-site');
assert.equal(built.transportCompanion.recipientEntrypoint.parameters.controllingArtifactPath, handoffPath);
assert.equal(JSON.stringify(built.transportCompanion).includes('handoff.workspaces/'), false, 'host projection must not leak disposable carrier-relative workspace topology');
assert.equal(JSON.stringify(built.transportCompanion).includes('package://handoff.workspaces/'), false);
assert.equal(Object.prototype.hasOwnProperty.call(built.transportCompanion, 'from'), false);
assert.equal(Object.prototype.hasOwnProperty.call(built.transportCompanion, 'to'), false);
assert(built.bundle.files.some((file) => file.path === HANDOFF_TRANSPORT_COMPANION_PATH && file.kind === 'handoff-transport-companion'));

const delegated = prepareRecipientRelativeWorkspaceHandoffExport({ handoff, workspace, workspaceMaterializations, localRunId: 'loom-companion-delegated' }, { packageInput: { builtAt: '2026-08-23T10:15:30.000Z' } });
assert.equal(delegated.executable, true);
assert.equal(delegated.transportExecutable, true, 'Site-facing preparation exposes safe minimal transport readiness when workspace/artifact routing is qualified');
assert.equal(delegated.transportCompanion.routing.controllingArtifact.workspaceRelativePath, handoffPath);
assert.equal(delegated.companionInspection.status, 'valid');

const roundtrip = roundTripRecipientRelativeHandoffTransportPackage(built);
assert.equal(roundtrip.status, 'passed');
assert.equal(roundtrip.companionInspection.status, 'valid');
assert.equal(roundtrip.verification.companionVerified, true);
const originalCompanion = built.bundle.files.find((file) => file.path === HANDOFF_TRANSPORT_COMPANION_PATH);
const rehydratedCompanion = roundtrip.runtime.bundle.files.find((file) => file.path === HANDOFF_TRANSPORT_COMPANION_PATH);
assert.deepEqual([...packageFileBytes(rehydratedCompanion)], [...packageFileBytes(originalCompanion)], 'companion projection bytes survive package roundtrip exactly');

const roleBuilt = buildRecipientRelativeHandoffTransportPackage({
  handoff, workspace, workspaceMaterializations, localRunId: 'loom-companion-role',
  transportParticipation: { actingRole: { qualification: 'qualified', schemaId: 'tiinex.party.role.v1', reference: '.topics/development/tooling/continuity/001-tooling-role.trace.md', label: 'Loom' } }
}, { packageInput: { builtAt: '2026-08-23T10:16:00.000Z' } });
assert.equal(roleBuilt.transportCompanion.status, 'ready');
assert.equal(roleBuilt.transportCompanion.participation.actingRole.state, 'qualified');
assert.equal(roleBuilt.transportCompanion.participation.actingRole.reference, '.topics/development/tooling/continuity/001-tooling-role.trace.md');
assert.equal(roleBuilt.transportCompanion.participation.endpointPromotion, false, 'acting Role transport orientation must not promote the carrier into Handoff endpoints');

const ambiguousRole = buildRecipientRelativeHandoffTransportPackage({
  handoff, workspace, workspaceMaterializations, localRunId: 'loom-companion-role-ambiguous',
  transportParticipation: { actingRole: { qualification: 'ambiguous', schemaId: 'tiinex.party.role.v1' } }
}, { packageInput: { builtAt: '2026-08-23T10:17:00.000Z' } });
assert.equal(ambiguousRole.status, 'ready', 'transport participation projection remains independent from semantic package/material closure readiness');
assert.equal(ambiguousRole.transportCompanion.status, 'ambiguous');
assert(ambiguousRole.transportCompanion.blockers.some((item) => item.id === 'tiinex.handoff.transport.blocker.acting-role-ambiguous'));
assert.equal(ambiguousRole.companionInspection.status, 'valid', 'truthfully ambiguous projection is coherent, not an invalid package');

const blockedHandoff = { ...handoff, markdown: handoffMarkdown.replace('## Required Context\n', `## Required Context\n\n- required-X\n  - Material: exact X\n  - Purpose: required\n  - Availability: unresolved\n  - Material Reference: [X](https://authority.example/X)\n`) };
const blocked = buildRecipientRelativeHandoffTransportPackage({ handoff: blockedHandoff, workspace, workspaceMaterializations, localRunId: 'loom-companion-package-blocked' }, { packageInput: { builtAt: '2026-08-23T10:18:00.000Z' } });
assert.equal(blocked.status, 'blocked');
assert.equal(blocked.transportCompanion.status, 'blocked');
assert(blocked.transportCompanion.blockers.some((item) => item.id === 'tiinex.handoff.transport.blocker.package-blocked'));

const routingAmbiguous = buildHandoffTransportCompanionProjection({
  bundle: { status: 'ready', manifest: { workspaceId: 'site-a', packageScope: { workspaceId: 'site-b', workspaceTitle: 'Conflicting current workspace' } } },
  descriptor: { schema: 'tiinex.transport.handoff-material-closure-descriptor.v1', handoff: { id: handoffPath }, plan: { status: 'ready' }, workspaceMaterializations: [] },
  packageStatus: 'ready'
});
assert.equal(routingAmbiguous.status, 'ambiguous');
assert.equal(routingAmbiguous.routing.state, 'ambiguous');
assert(routingAmbiguous.blockers.some((item) => item.id === 'tiinex.handoff.transport.blocker.routing-ambiguous'));

const carrierOnlyRouting = buildHandoffTransportCompanionProjection({
  bundle: { status: 'ready', manifest: { workspaceId: 'current-site', packageScope: { workspaceId: 'current-site' } } },
  descriptor: { schema: 'tiinex.transport.handoff-material-closure-descriptor.v1', handoff: { id: 'handoff.workspaces/current-site/.topics/handoff.trace.md', path: 'handoff.workspaces/current-site/.topics/handoff.trace.md' }, plan: { status: 'ready' }, workspaceMaterializations: [] },
  packageStatus: 'ready'
});
assert.equal(carrierOnlyRouting.status, 'blocked');
assert.equal(carrierOnlyRouting.routing.state, 'unresolved');
assert.equal(JSON.stringify(carrierOnlyRouting).includes('handoff.workspaces/'), false, 'rejected carrier-relative input must not be reflected into host projection data');

const tamperedCompanion = { ...built.transportCompanion, routing: { ...built.transportCompanion.routing, controllingArtifact: { workspaceRelativePath: 'handoff.workspaces/current-site/.topics/handoff.trace.md' } } };
const tamperedBundle = { ...built.bundle, files: built.bundle.files.map((file) => file.path === HANDOFF_TRANSPORT_COMPANION_PATH ? { ...file, content: `${JSON.stringify(tamperedCompanion)}\n`, data: undefined } : file) };
const tamperedInspection = inspectHandoffTransportCompanion(tamperedBundle);
assert.equal(tamperedInspection.status, 'invalid');
assert(tamperedInspection.findings.some((item) => item.code === 'portable.handoff-companion.routing.carrier-topology-leak'));

console.log('✓ Loom Handoff transport companion/projection pressure passed');
