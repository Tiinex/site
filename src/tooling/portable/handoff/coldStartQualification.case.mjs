import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { buildRecipientRelativeHandoffTransportPackage } from './materialClosure.package.js';
import { qualifiedHandoffFixture } from './qualifiedHandoffFixture.js';
import {
  COLD_START_INGRESS_KINDS,
  describePortableColdStartIngress,
  groundPortableColdConsumer,
  projectPortableColdStartHostGuidance,
  qualifyPortableColdStart
} from './coldStartQualification.js';
import { runPortableOperation } from '../operation.catalog.js';

const fixturePath = fileURLToPath(new URL('./fixtures/cold-start-qualification.v1.examples.json', import.meta.url));
const fixtures = JSON.parse(await readFile(fixturePath, 'utf8'));
assert.equal(fixtures.schema, 'tiinex.portable.cold-start-qualification.examples.v1');
assert.equal(fixtures.examples.length, 4);

for (const example of fixtures.examples) {
  const result = qualifyPortableColdStart(example);
  assert.equal(result.status, example.expect.status, example.id);
  assert.equal(result.qualification.preferredPathPassed, example.expect.preferredPathPassed, example.id);
  for (const [key, expected] of Object.entries(example.expect)) {
    if (key === 'status' || key === 'preferredPathPassed') continue;
    if (Object.prototype.hasOwnProperty.call(result.metrics, key)) assert.equal(result.metrics[key], expected, `${example.id}:${key}`);
    else if (Object.prototype.hasOwnProperty.call(result.qualification, key)) assert.equal(result.qualification[key], expected, `${example.id}:${key}`);
  }
}

const archaeology = qualifyPortableColdStart(fixtures.examples.find((entry) => entry.id === 'axiom-style-native-archaeology-recovery'));
assert.equal(archaeology.qualification.recoveryState, 'recovered');
assert.equal(archaeology.qualification.recoveryIsPreferredPathEvidence, false);
assert(archaeology.findings.some((finding) => finding.code === 'portable.cold-start.native-archaeology.pre-takeover'));
assert(archaeology.findings.some((finding) => finding.code === 'portable.cold-start.arbitrary-read.pre-orientation'));

const degradedQualification = qualifyPortableColdStart(fixtures.examples.find((entry) => entry.id === 'voice-stt-degraded-capture'));
assert.equal(degradedQualification.status, 'degraded-fallback');
assert.equal(degradedQualification.findingSummary.counts.error, 0);
assert.equal(degradedQualification.metrics.unexpectedNativeActionsBeforeTiinexTakeover, 0);
assert.equal(degradedQualification.metrics.arbitraryFilesReadBeforeOrientation, 0);

const mislabeledBootstrapRead = qualifyPortableColdStart({
  ingressKind: 'routed-handoff-package',
  toolingAvailable: true,
  events: [
    { mechanism: 'native-host', action: 'list-zip-entries', semanticClass: 'minimal-bootstrap', path: 'package.zip', candidateArtifacts: 6 },
    { mechanism: 'tiinex', operation: 'orient-handoff-package', status: 'ready' },
    { mechanism: 'tiinex', operation: 'ground-cold-consumer', status: 'ready' },
    { mechanism: 'native-host', action: 'substantive-reasoning', semanticClass: 'substantive-work' }
  ],
  outcome: { correct: true }
});
assert.equal(mislabeledBootstrapRead.status, 'recovered-not-preferred');
assert.equal(mislabeledBootstrapRead.qualification.preferredPathPassed, false);
assert.equal(mislabeledBootstrapRead.metrics.arbitraryFilesReadBeforeOrientation, 1);
assert(mislabeledBootstrapRead.findings.some((finding) => finding.code === 'portable.cold-start.arbitrary-read.pre-orientation'));

const handoffMarkdown = qualifiedHandoffFixture({
  title: 'Cold consumer fixture',
  from: 'Anchor',
  to: 'Loom',
  purpose: 'continue a design discussion about preferred-path qualification',
  createdAt: '2026-08-24 13:41:00'
});

const roleMarkdown = `# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: tiinex.party.role.v1
  - Created At: 2026-08-23 10:00:00
  - Trace: predecessor-loom-role.trace.md
- Current
  - Current Schema: tiinex.party.role.v1
  - Created At: 2026-08-24 10:00:00

---

# Loom

## Role Identity

- Role Label: Loom
- Role Kind: implementation role

## Role Boundary

- In Scope: portable implementation and deterministic qualification fixtures
- Out Of Scope: independent acceptance and remote publication
- Context: Tooling 026

## Authority And Responsibility Boundary

- May Do: implement local portable source and tests
- Does Not Authorize: remote writes, credentials, self-acceptance
- Review Boundary: return implementation for independent acceptance

## Holder Relationship

- Holder State: unproven

## Interpretation Limits

- Does Not Prove: that one chat account equals the Role holder
- Must Not Be Treated As: remote repository authority

# Continuity Integrity
`;

const packageBuilt = buildRecipientRelativeHandoffTransportPackage({
  workspace: { id: 'tiinex-site', title: 'tiinex-site', name: 'tiinex-site', records: [], assets: [] },
  handoff: { id: '.topics/development/handoff/loom/026-cold-start-qualification.trace.md', path: '.topics/development/handoff/loom/026-cold-start-qualification.trace.md', semanticStatus: 'unknown', markdown: handoffMarkdown },
  workspaceMaterializations: [{
    id: 'tiinex-site',
    title: 'tiinex-site',
    state: 'complete',
    source: { kind: 'fixture', workspaceId: 'tiinex-site' },
    completenessEvidence: { state: 'qualified', proof: 'cold-start-grounding-fixture', boundary: '.' },
    entries: [
      { path: '.topics/development/handoff/loom/026-cold-start-qualification.trace.md', data: new TextEncoder().encode(handoffMarkdown), mediaType: 'text/markdown' },
      { path: '.topics/roles/loom-role.trace.md', data: new TextEncoder().encode(roleMarkdown), mediaType: 'text/markdown' }
    ]
  }],
  materials: [],
  recipient: { referenceTargets: [] },
  transportRoutes: [{ workspaceId: 'tiinex-site', path: '.topics/development/handoff/loom/026-cold-start-qualification.trace.md' }],
  verifyRoundtrip: false
}, { packageInput: { builtAt: '2026-08-24T19:15:00.000Z' } });
assert.equal(packageBuilt.status, 'ready');

const oneShotPreferred = qualifyPortableColdStart({ bundle: packageBuilt.bundle, preTakeover: 'minimal-bootstrap-only' });
assert.equal(oneShotPreferred.status, 'preferred-pass');
assert.equal(oneShotPreferred.qualification.preferredPathPassed, true);
assert.equal(oneShotPreferred.oneShot.toolingEvidence, 'generated-by-qualify-cold-start-run');
assert.equal(oneShotPreferred.oneShot.hostEvidence.independentlyObservedByTooling, false);
assert.equal(oneShotPreferred.oneShot.evidenceAttribution.tooling.independentlyObserved, true);
assert.deepEqual(oneShotPreferred.oneShot.evidenceAttribution.tooling.covers, ['orientation', 'route-resolution', 'recipient-grounding']);
assert.equal(oneShotPreferred.oneShot.evidenceAttribution.preTakeoverHost.independentlyObservedByTooling, false);
assert.equal(oneShotPreferred.grounding.handoff.to, 'Loom');
assert.equal(oneShotPreferred.qualification.hostEvidence.source, 'caller-declared');
assert.equal(oneShotPreferred.qualification.hostEvidence.independentlyObservedByTooling, false);
assert.equal(oneShotPreferred.grounding.next.qualification.mode, 'one-shot-package');
assert.equal(oneShotPreferred.grounding.next.qualification.externalQualificationSchemaRequired, false);
assert.equal(oneShotPreferred.grounding.next.qualification.separateGroundingCallRequired, false);
assert.equal(oneShotPreferred.grounding.next.qualification.eligible, true);
assert.equal(oneShotPreferred.grounding.next.qualification.degradedGroundingBlocksPreferredPath, false);
assert.equal(oneShotPreferred.continuation.state, 'ready');
assert.equal(oneShotPreferred.continuation.substantiveWorkMayBegin, true);
assert.equal(oneShotPreferred.continuation.transfer[0].id, 'fixture-transfer');
assert.equal(oneShotPreferred.continuation.transfer[0].description, 'bounded fixture work');
assert.equal(oneShotPreferred.continuation.requiredContext.length, 0);
assert.equal(oneShotPreferred.continuation.completionExpectation.returnTo, 'Anchor');
assert.match(oneShotPreferred.continuation.next, /No Tooling API discovery is required/);

const oneShotUnverified = qualifyPortableColdStart({ bundle: packageBuilt.bundle });
assert.equal(oneShotUnverified.status, 'incomplete');
assert.equal(oneShotUnverified.qualification.preferredPathPassed, false);
assert(oneShotUnverified.findings.some((finding) => finding.code === 'portable.cold-start.host-evidence.unverified'));

const oneShotArchaeology = qualifyPortableColdStart({ bundle: packageBuilt.bundle, preTakeover: 'native-archaeology' });
assert.equal(oneShotArchaeology.status, 'recovered-not-preferred');
assert.equal(oneShotArchaeology.qualification.preferredPathPassed, false);
assert(oneShotArchaeology.findings.some((finding) => finding.code === 'portable.cold-start.native-archaeology.pre-takeover'));

const tools = [
  { id: 'local.runtime', name: 'local.runtime', description: 'Read files and zip archives and execute JavaScript processes.', capabilities: ['filesystemRead', 'archiveRead', 'javascript'] },
  { id: 'host.presentation', name: 'host.presentation', description: 'Return artifacts, request human confirmation, request authentication, and present copyable text.', capabilities: ['artifactReturn', 'humanConfirmation', 'authenticationRequest', 'copyableTextPresentation'] }
];
const grounding = groundPortableColdConsumer({
  bundle: packageBuilt.bundle,
  ingressKind: COLD_START_INGRESS_KINDS.HANDOFF,
  tools,
  provider: { id: 'provider-a', name: 'Provider A' },
  hostIdentity: { id: 'host-a', name: 'Host A' },
  session: { id: 'session-a', name: 'Current Session' },
  holderBinding: { holderId: 'session-a', roleLabel: 'Loom' },
  participants: [
    { id: 'p1', label: 'Operator contribution stream', identities: ['operator-declared'], roles: ['operator', 'reviewer'], verification: 'declared', transportChannel: 'chat-thread' },
    { id: 'p2', label: 'Implementation consumer', identities: ['consumer-session'], roles: ['Loom'], verification: 'unverified', transportChannel: 'chat-thread' }
  ],
  contributions: [
    { id: 'c1', participantId: 'p1', speaker: 'Operator contribution stream', attribution: 'declared', kind: 'message' },
    { id: 'c2', participantId: 'p2', speaker: 'Implementation consumer', attribution: 'unverified', kind: 'message' }
  ],
  currentContributionId: 'c1',
  interaction: { mode: 'design-discussion', purpose: 'review and refine preferred-path qualification', continuingDialogue: true }
});
assert.equal(grounding.status, 'ready');
assert.equal(grounding.handoff.to, 'Loom');
assert.equal(grounding.role.state, 'qualified');
assert.equal(grounding.role.material.artifact.roleLabel, 'Loom');
assert.equal(grounding.role.exactBoundaryLoaded.inScope, 'portable implementation and deterministic qualification fixtures');
assert.equal(grounding.role.predecessor.state, 'declared');
assert.equal(grounding.holderBinding.state, 'qualified');
assert.equal(grounding.holderBinding.roleLabel, 'Loom');
assert.equal(grounding.holderBinding.holderId, 'session-a');
assert.equal(grounding.holderBinding.inferredFromTransport, false);
assert.equal(grounding.interaction.nonExecutionMode, true);
assert.equal(grounding.interaction.executionExpected, false);
assert.equal(grounding.interaction.oneShotAssumed, false);
assert.equal(grounding.participation.cardinality.participants, 2);
assert.equal(grounding.participation.transportIdentityAssumption, false);
assert.equal(grounding.capabilities.instance.provider.id, 'provider-a');
assert.equal(grounding.capabilities.instance.host.id, 'host-a');
assert.equal(grounding.capabilities.instance.session.id, 'session-a');
assert.equal(grounding.capabilities.instance.authority.providerNameGrantsCapability, false);
assert.equal(grounding.capabilities.discovery.profile.capabilities.interaction.artifactReturn, true);
assert.equal(grounding.capabilities.discovery.profile.capabilities.interaction.humanConfirmation, true);
assert.equal(grounding.capabilities.discovery.profile.capabilities.interaction.authenticationRequest, true);
assert.equal(grounding.capabilities.discovery.profile.capabilities.interaction.copyableTextPresentation, true);

const unresolvedHolderGrounding = groundPortableColdConsumer({
  bundle: packageBuilt.bundle,
  participants: [{ id: 'p', roles: ['Loom'] }],
  interaction: { mode: 'execution' }
});
assert.equal(unresolvedHolderGrounding.role.state, 'qualified');
assert.equal(unresolvedHolderGrounding.holderBinding.state, 'unresolved');
assert.equal(unresolvedHolderGrounding.holderBinding.inferredFromTransport, false);
assert.equal(unresolvedHolderGrounding.status, 'degraded');

const mismatchedHolderGrounding = groundPortableColdConsumer({
  bundle: packageBuilt.bundle,
  holderBinding: { holderId: 'session-b', roleLabel: 'Axiom' },
  participants: [{ id: 'p', roles: ['Loom'] }],
  interaction: { mode: 'execution' }
});
assert.equal(mismatchedHolderGrounding.holderBinding.state, 'blocked');
assert.equal(mismatchedHolderGrounding.status, 'blocked');
assert(mismatchedHolderGrounding.findings.some((finding) => finding.code === 'portable.cold-start.holder-binding.role-mismatch'));

const roleMissingPackage = buildRecipientRelativeHandoffTransportPackage({
  workspace: { id: 'tiinex-site', title: 'tiinex-site', name: 'tiinex-site', records: [], assets: [] },
  handoff: { id: '.topics/development/handoff/loom/026-cold-start-qualification.trace.md', path: '.topics/development/handoff/loom/026-cold-start-qualification.trace.md', semanticStatus: 'unknown', markdown: handoffMarkdown },
  workspaceMaterializations: [{ id: 'tiinex-site', title: 'tiinex-site', state: 'complete', source: { kind: 'fixture' }, completenessEvidence: { state: 'qualified', proof: 'missing-role-fixture', boundary: '.' }, entries: [{ path: '.topics/development/handoff/loom/026-cold-start-qualification.trace.md', data: new TextEncoder().encode(handoffMarkdown), mediaType: 'text/markdown' }] }],
  materials: [], recipient: { referenceTargets: [] }, transportRoutes: [{ workspaceId: 'tiinex-site', path: '.topics/development/handoff/loom/026-cold-start-qualification.trace.md' }], verifyRoundtrip: false
}, { packageInput: { builtAt: '2026-08-24T19:16:00.000Z' } });
const missingRole = groundPortableColdConsumer({ bundle: roleMissingPackage.bundle, participants: [{ id: 'p', roles: ['Loom'] }], interaction: { mode: 'execution' } });
assert.equal(missingRole.status, 'degraded');
assert.equal(missingRole.role.state, 'degraded');
assert.equal(missingRole.role.compatibility, 'degraded-missing-material');
assert(missingRole.findings.some((finding) => finding.code === 'portable.cold-start.role.material.missing'));

const degradedCapture = groundPortableColdConsumer({
  ingressKind: 'degraded-capture',
  toolingAvailable: false,
  capture: { toolingState: 'unavailable', reason: 'voice host has no Tooling surface' },
  participants: [{ id: 'speaker-a', label: 'Speaker A', verification: 'unverified' }],
  contributions: [{ id: 'voice-1', speakerId: 'speaker-a', attribution: 'unverified', kind: 'voice-transcript' }],
  currentContributionId: 'voice-1',
  interaction: { mode: 'collaborative-dialogue', purpose: 'capture provisional design discussion' }
});
assert.equal(degradedCapture.status, 'degraded');
assert.equal(degradedCapture.degradedCapture.active, true);
assert.equal(degradedCapture.degradedCapture.toolingDependentMutationAllowed, false);
assert.equal(degradedCapture.degradedCapture.laterToolingCapableCondensationRequired, true);
assert.equal(degradedCapture.participation.currentContribution.state, 'declared-unverified');

const hostProjection = projectPortableColdStartHostGuidance({ ingressKind: 'routed-handoff-package', tools, provider: { id: 'provider-a' }, hostIdentity: { id: 'host-a' }, session: { id: 'session-a' } });
assert.equal(hostProjection.status, 'ready');
assert.deepEqual(hostProjection.steps.map((step) => step.operation), ['orient-handoff-package', 'ground-cold-consumer']);
assert.equal(hostProjection.authority.semanticAuthority, 'none');
assert.equal(hostProjection.authority.providerSpecificSemanticAuthority, false);

const nestedHostProjection = projectPortableColdStartHostGuidance({
  ingressKind: 'routed-handoff-package',
  host: {
    id: 'nested-host',
    name: 'Nested Host',
    tools,
    provider: { id: 'nested-provider' },
    session: { id: 'nested-session' }
  }
});
assert.equal(nestedHostProjection.capabilityInstance.provider.id, 'nested-provider');
assert.equal(nestedHostProjection.capabilityInstance.host.id, 'nested-host');
assert.equal(nestedHostProjection.capabilityInstance.host.name, 'Nested Host');
assert.equal(nestedHostProjection.capabilityInstance.session.id, 'nested-session');

const contract = describePortableColdStartIngress({ ingressKind: 'workspace-bootstrap' });
assert.equal(contract.profile.firstSemanticOperation, 'discover-tooling');
assert.equal(contract.profile.orientationOperation, 'search-lineage');
assert.equal(contract.qualification.recoveryIsNotPreferredPath, true);
assert.equal(contract.semanticSeparations.lineageLeafIsWorkflowFrontier, false);
assert.equal(contract.semanticSeparations.workflowFrontierIsTaskState, false);

const catalogResult = await runPortableOperation('qualify-cold-start', fixtures.examples[0]);
assert.equal(catalogResult.operation, 'qualify-cold-start');
assert.equal(catalogResult.resultSchema, 'tiinex.portable.cold-start-qualification.v1');
assert.equal(catalogResult.status, 'preferred-pass');

console.log('✓ Tooling 026 cold-start ingress, grounding, provider/session capability projection, degraded capture, and recovery-vs-preferred qualification passed');
