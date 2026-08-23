import assert from 'node:assert/strict';
import fs from 'node:fs';
import { exportPackageZipUint8Array } from '../../../export/package.zip.js';
import { prepareRecipientRelativeWorkspaceHandoffExport } from '../../../export/handoff.plan.js';
import { validateArtifact } from '../../../validation/validateArtifact.js';
import { schemaRegistry } from '../../../schemas/registry.js';
import { rehydratePortableRuntimePackage } from '../package/runtime.package.js';
import { inspectHandoffClosureDescriptor, HANDOFF_CLOSURE_DESCRIPTOR_PATH } from './materialClosure.descriptor.js';
import { planRecipientRelativeHandoffMaterialClosure } from './materialClosure.plan.js';
import { projectHandoffMaterialRequirements } from './materialClosure.requirements.js';
import { buildRecipientRelativeHandoffTransportPackage, roundTripRecipientRelativeHandoffTransportPackage } from './materialClosure.package.js';


const currentRoot = schemaRegistry.byId.get('tiinex.root.v1');
const currentHandoff = schemaRegistry.byId.get('tiinex.handoff.v1');
assert.equal(currentRoot.binding.sourceCommit, '3988951208eb9a8926e84ab42625d4b42fa00c2d');
assert.equal(currentRoot.binding.sourceBlobSha, '1398960010b919d266a7451f59bbfc9c211c0e4b');
assert.equal(currentRoot.schemaSource.qualify().state, 'qualified');
assert.equal(currentHandoff.binding.sourceCommit, '3988951208eb9a8926e84ab42625d4b42fa00c2d');
assert.equal(currentHandoff.binding.sourceBlobSha, '2332023aecf690279805d34c7e512a9f9799c20d');
assert.equal(currentHandoff.schemaSource.qualify().state, 'qualified');
const dogfoodHandoffPath = '.topics/development/handoff/tooling/002-v481-tooling-recipient-relative-handoff-material-closure-planner-foundation-handoff.trace.md';
const dogfoodHandoffMarkdown = fs.readFileSync(dogfoodHandoffPath, 'utf8');
const dogfoodValidation = validateArtifact({ markdown: dogfoodHandoffMarkdown });
assert.equal(dogfoodValidation.validation.semanticContract.state, 'valid');
assert.equal(dogfoodValidation.validation.integrity.state, 'verified');
assert.equal(dogfoodValidation.findings.some((finding) => finding.severity === 'error'), false);
const dogfoodProjection = planRecipientRelativeHandoffMaterialClosure({ handoff: { id: dogfoodHandoffPath, path: dogfoodHandoffPath, semanticStatus: 'valid', markdown: dogfoodHandoffMarkdown } });
assert.equal(dogfoodProjection.requirements.required.length, 5);
assert.equal(dogfoodProjection.requirements.reference.length, 2);
assert(dogfoodProjection.requirements.required.some((entry) => entry.requirementId === 'required:current-site-workspace'));
assert(dogfoodProjection.requirements.reference.some((entry) => entry.requirementId === 'reference:v480-tooling-result'));

const A = 'https://authority.example/material/A';
const B = 'https://authority.example/material/B';
const handoffMarkdown = `# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.handoff.v1
  - Created At: 2026-08-22 13:00:00

---

# Handoff fixture

## Required Context

- required-A
  - Material: exact A
  - Purpose: required
  - Availability: available
  - Material Reference: [A](${A})

## Reference Context

- reference-B
  - Material: optional B
  - Purpose: useful
  - Availability: unresolved
  - Material Reference: [B](${B})

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: fixture
`;
const handoff = { id: 'handoff:fixture', path: '.topics/handoff.trace.md', reference: 'tiinex://handoff/fixture', semanticStatus: 'valid', markdown: handoffMarkdown };
const workspace = { id: 'w', title: 'Recipient package', records: [], assets: [] };
const bytesA = new TextEncoder().encode('exact-A-bytes');

const local = planRecipientRelativeHandoffMaterialClosure({ handoff, materials: [{ id: 'A', referenceTarget: A, data: bytesA, providerId: 'loaded-workspace' }] });
assert.equal(local.status, 'ready');
assert.equal(local.requirements.required[0].disposition, 'materialized');
assert.equal(local.requirements.reference[0].disposition, 'omitted-by-plan');

const referenceSufficient = planRecipientRelativeHandoffMaterialClosure({ handoff, recipient: { referenceTargets: [A] } });
assert.equal(referenceSufficient.status, 'ready');
assert.equal(referenceSufficient.requirements.required[0].disposition, 'reference-sufficient');

const hostMirror = planRecipientRelativeHandoffMaterialClosure({ handoff, providerResults: [{ providerId: 'host-connector-1', providerKind: 'host-connector', requirementId: 'required:required-a', candidates: [{ referenceTarget: A, data: bytesA }] }] });
assert.equal(hostMirror.requirements.required[0].disposition, 'materialized');
assert.equal(hostMirror.requirements.required[0].selectedMaterial.provider.kind, 'host-connector');

const unresolved = planRecipientRelativeHandoffMaterialClosure({ handoff });
assert.equal(unresolved.status, 'blocked');
assert.equal(unresolved.requirements.required[0].disposition, 'unresolved');

const conflicting = planRecipientRelativeHandoffMaterialClosure({ handoff, providerResults: [
  { providerId: 'p1', requirementId: 'required:required-a', candidates: [{ referenceTarget: A, content: 'one' }] },
  { providerId: 'p2', requirementId: 'required:required-a', candidates: [{ referenceTarget: A, content: 'two' }] }
] });
assert.equal(conflicting.status, 'blocked');
assert.equal(conflicting.requirements.required[0].disposition, 'ambiguous');

const identicalProviderBytes = planRecipientRelativeHandoffMaterialClosure({ handoff, providerResults: [
  { providerId: 'p1', providerKind: 'host-connector', requirementId: 'required:required-a', candidates: [{ referenceTarget: A, data: bytesA }] },
  { providerId: 'p2', providerKind: 'host-connector', requirementId: 'required:required-a', candidates: [{ referenceTarget: A, data: bytesA }] }
] });
assert.equal(identicalProviderBytes.status, 'blocked', 'byte-identical distinct providers must remain ambiguous without provider-selection authority');
assert.equal(identicalProviderBytes.requirements.required[0].disposition, 'ambiguous');
assert.equal(identicalProviderBytes.requirements.required[0].selectedMaterial, null, 'array order must not choose provider provenance');
assert.deepEqual(identicalProviderBytes.requirements.required[0].candidates.map((candidate) => candidate.provider.id), ['p1', 'p2']);

const integrityConflict = planRecipientRelativeHandoffMaterialClosure({ handoff, materials: [{ requirementId: 'required:required-a', referenceTarget: A, content: 'one', expectedSha256: '0'.repeat(64) }] });
assert.equal(integrityConflict.requirements.required[0].disposition, 'integrity-conflict');

const priorReuse = planRecipientRelativeHandoffMaterialClosure({ handoff, priorPackages: [{ id: 'prior-1', materials: [{ requirementId: 'required:required-a', referenceTarget: A, data: bytesA }] }] });
assert.equal(priorReuse.status, 'ready');
assert.equal(priorReuse.requirements.required[0].selectedMaterial.provider.kind, 'prior-package');
assert.equal(priorReuse.requirements.required[0].selectedMaterial.authority?.canonicalAuthority, undefined, 'prior package provider must not become canonical authority');

const partial = planRecipientRelativeHandoffMaterialClosure({ handoff, recipient: { referenceTargets: [A] }, workspaceMaterializations: [{ id: 'docs', state: 'partial', includedEntries: [{ path: 'a.md', sha256: 'abc', bytes: 3 }] }] });
assert.equal(partial.workspaceMaterializations[0].materialization, 'partial');
assert.equal(partial.status, 'ready');
const complete = planRecipientRelativeHandoffMaterialClosure({ handoff, recipient: { referenceTargets: [A] }, workspaceMaterializations: [{ id: 'docs', state: 'complete', completenessEvidence: { state: 'qualified', boundary: '.topics', proof: 'enumerated-set' } }] });
assert.equal(complete.workspaceMaterializations[0].materialization, 'complete');
assert.equal(complete.status, 'ready');
const fakeComplete = planRecipientRelativeHandoffMaterialClosure({ handoff, recipient: { referenceTargets: [A] }, workspaceMaterializations: [{ id: 'docs', state: 'complete' }] });
assert.equal(fakeComplete.status, 'blocked');
assert.equal(fakeComplete.workspaceMaterializations[0].materialization, 'partial');

const fakeCompletePackaged = buildRecipientRelativeHandoffTransportPackage({
  handoff,
  workspace,
  recipient: { referenceTargets: [A] },
  workspaceMaterializations: [{ id: 'docs', state: 'complete', entries: [{ path: 'subset/a.txt', content: 'workspace-byte' }], includedEntries: [{ path: 'subset/a.txt', sha256: 'descriptor-evidence', bytes: 14 }] }],
  localRunId: 'fake-complete-package'
}, { packageInput: { builtAt: '2026-08-22T13:00:30.000Z' } });
assert.equal(fakeCompletePackaged.plan.workspaceMaterializations[0].materialization, 'partial');
assert.equal(fakeCompletePackaged.plan.workspaceMaterializations[0].qualification, 'invalid-completeness-claim');
const fakeCompleteWorkspaceFile = fakeCompletePackaged.bundle.files.find((file) => file.kind === 'handoff-workspace-material');
assert(fakeCompleteWorkspaceFile);
assert.equal(fakeCompleteWorkspaceFile.boundary.includes('complete-evidence-backed'), false, 'package byte-carrier metadata must consume qualified planner truth, not the raw caller complete claim');
assert(fakeCompleteWorkspaceFile.boundary.includes('partial/invalid-completeness-claim'));
const fakeCompleteFileMapEntry = fakeCompletePackaged.bundle.fileMap.entries.find((entry) => entry.path === fakeCompleteWorkspaceFile.path);
assert(fakeCompleteFileMapEntry);
assert.equal(fakeCompleteFileMapEntry.boundary, fakeCompleteWorkspaceFile.boundary, 'file-map must serialize the same planner-qualified workspace truth as the packaged byte carrier');
assert.equal(fakeCompletePackaged.descriptor.workspaceMaterializations[0].materialization, 'partial');
assert.equal(fakeCompletePackaged.descriptor.workspaceMaterializations[0].qualification, 'invalid-completeness-claim');

const externallySuppliedReadinessBypassPlan = Object.freeze({ ...fakeCompletePackaged.plan, requiredClosureReady: true });
assert.equal(externallySuppliedReadinessBypassPlan.status, 'blocked');
assert.equal(externallySuppliedReadinessBypassPlan.workspaceMaterializations[0].qualification, 'invalid-completeness-claim');
const externallySuppliedReadinessBypassPackage = buildRecipientRelativeHandoffTransportPackage({
  handoff,
  workspace,
  recipient: { referenceTargets: [A] },
  plan: externallySuppliedReadinessBypassPlan,
  workspaceMaterializations: [{ id: 'docs', state: 'complete', entries: [{ path: 'subset/a.txt', content: 'workspace-byte' }], includedEntries: [{ path: 'subset/a.txt', sha256: 'descriptor-evidence', bytes: 14 }] }],
  localRunId: 'externally-supplied-readiness-bypass-package'
}, { packageInput: { builtAt: '2026-08-22T13:00:35.000Z' } });
assert.equal(externallySuppliedReadinessBypassPackage.planReadiness.state, 'invalid', 'externally supplied readiness summary must be requalified against blocking plan-owned workspace truth');
assert.equal(externallySuppliedReadinessBypassPackage.planReadiness.expectedRequiredClosureReady, false);
assert.equal(externallySuppliedReadinessBypassPackage.status, 'blocked', 'caller readiness boolean must not self-authorize package readiness');
assert.equal(externallySuppliedReadinessBypassPackage.closureInspection.status, 'invalid', 'descriptor inspection must reject contradictory readiness summary truth');
assert(externallySuppliedReadinessBypassPackage.closureInspection.findings.some((finding) => finding.code === 'portable.handoff-closure.readiness.inconsistent'));
assert.equal(externallySuppliedReadinessBypassPackage.descriptor.plan.status, 'blocked');
assert.equal(externallySuppliedReadinessBypassPackage.descriptor.plan.requiredClosureReady, true, 'descriptor preserves supplied summary truth so the contradiction remains auditable rather than silently rewritten');
assert.equal(externallySuppliedReadinessBypassPackage.descriptor.workspaceMaterializations[0].qualification, 'invalid-completeness-claim');

const anonymousCompletePackaged = buildRecipientRelativeHandoffTransportPackage({
  handoff,
  workspace,
  recipient: { referenceTargets: [A] },
  workspaceMaterializations: [{ state: 'complete', completenessEvidence: { state: 'qualified', proof: 'enumerated-set' }, entries: [{ path: 'anonymous/a.txt', content: 'anonymous-byte' }], includedEntries: [{ path: 'anonymous/a.txt', sha256: 'anonymous-descriptor', bytes: 14 }] }],
  localRunId: 'anonymous-complete-package'
}, { packageInput: { builtAt: '2026-08-22T13:00:40.000Z' } });
assert.equal(anonymousCompletePackaged.status, 'ready');
assert.equal(anonymousCompletePackaged.plan.workspaceMaterializations[0].id, 'workspace-0');
assert.equal(anonymousCompletePackaged.plan.workspaceMaterializations[0].materialization, 'complete');
assert.equal(anonymousCompletePackaged.plan.workspaceMaterializations[0].qualification, 'qualified');
const anonymousWorkspaceFile = anonymousCompletePackaged.bundle.files.find((file) => file.kind === 'handoff-workspace-material');
assert(anonymousWorkspaceFile);
assert(anonymousWorkspaceFile.path.includes('handoff.workspaces/workspace-0/'), 'anonymous carrier path must use the planner-qualified transport-local workspace projection, not a different fallback token');
assert(anonymousWorkspaceFile.boundary.includes('complete-evidence-backed'), 'anonymous qualified complete truth must survive carrier serialization');
assert.equal(anonymousCompletePackaged.bundle.fileMap.entries.find((entry) => entry.path === anonymousWorkspaceFile.path)?.boundary, anonymousWorkspaceFile.boundary);
assert.equal(anonymousCompletePackaged.descriptor.workspaceMaterializations[0].materialization, 'complete');
assert.equal(anonymousCompletePackaged.descriptor.workspaceMaterializations[0].qualification, 'qualified');
assert.equal(anonymousCompletePackaged.descriptor.workspaceMaterializations[0].includedEntries[0].packagePath, anonymousWorkspaceFile.path);

const duplicateIdPackaged = buildRecipientRelativeHandoffTransportPackage({
  handoff,
  workspace,
  recipient: { referenceTargets: [A] },
  workspaceMaterializations: [
    { id: 'docs', state: 'complete', entries: [{ path: 'first.txt', content: 'first' }], includedEntries: [{ path: 'first.txt', sha256: 'first-descriptor', bytes: 5 }] },
    { id: 'docs', state: 'complete', completenessEvidence: { state: 'qualified', proof: 'enumerated-set' }, entries: [{ path: 'second.txt', content: 'second' }], includedEntries: [{ path: 'second.txt', sha256: 'second-descriptor', bytes: 6 }] }
  ],
  localRunId: 'duplicate-id-package'
}, { packageInput: { builtAt: '2026-08-22T13:00:50.000Z' } });
assert.equal(duplicateIdPackaged.status, 'blocked', 'invalid completeness remains a blocking planner truth even when a later duplicate id is qualified');
assert.deepEqual(duplicateIdPackaged.plan.workspaceMaterializations.map((entry) => [entry.materialization, entry.qualification]), [['partial', 'invalid-completeness-claim'], ['complete', 'qualified']]);
const duplicateWorkspaceFiles = duplicateIdPackaged.bundle.files.filter((file) => file.kind === 'handoff-workspace-material');
assert.equal(duplicateWorkspaceFiles.length, 2);
const firstDuplicateCarrier = duplicateWorkspaceFiles.find((file) => file.path.endsWith('/first.txt'));
const secondDuplicateCarrier = duplicateWorkspaceFiles.find((file) => file.path.endsWith('/second.txt'));
assert(firstDuplicateCarrier?.boundary.includes('partial/invalid-completeness-claim'), 'first duplicate id carrier must keep its own invalid planner truth');
assert.equal(firstDuplicateCarrier?.boundary.includes('complete-evidence-backed'), false);
assert(secondDuplicateCarrier?.boundary.includes('complete-evidence-backed'), 'second duplicate id carrier must keep its own qualified complete planner truth');
assert.deepEqual(duplicateIdPackaged.descriptor.workspaceMaterializations.map((entry) => [entry.materialization, entry.qualification, entry.includedEntries[0]?.packagePath]), [
  ['partial', 'invalid-completeness-claim', firstDuplicateCarrier.path],
  ['complete', 'qualified', secondDuplicateCarrier.path]
]);
assert.equal(duplicateIdPackaged.bundle.fileMap.entries.find((entry) => entry.path === firstDuplicateCarrier.path)?.boundary, firstDuplicateCarrier.boundary);
assert.equal(duplicateIdPackaged.bundle.fileMap.entries.find((entry) => entry.path === secondDuplicateCarrier.path)?.boundary, secondDuplicateCarrier.boundary);


const collisionWorkspaces = [
  { id: 'docs', state: 'complete', completenessEvidence: { state: 'qualified', proof: 'enumerated-set' }, source: { label: 'SOURCE-A' }, entries: [{ path: 'same.txt', packagePath: 'handoff.workspaces/carrier-A/same.txt', content: 'AAAA' }] },
  { id: 'docs', state: 'complete', completenessEvidence: { state: 'qualified', proof: 'enumerated-set' }, source: { label: 'SOURCE-B' }, entries: [{ path: 'same.txt', packagePath: 'handoff.workspaces/carrier-B/same.txt', content: 'BBBB' }] }
];
const collisionPlan = planRecipientRelativeHandoffMaterialClosure({ handoff, recipient: { referenceTargets: [A] }, workspaceMaterializations: collisionWorkspaces });
assert.notEqual(collisionPlan.workspaceMaterializations[0].transportCorrelationKey, collisionPlan.workspaceMaterializations[1].transportCorrelationKey, 'transport correlation must include exact carrier/source/package-path truth rather than only declared workspace fields');
const reorderedCollisionPlan = Object.freeze({ ...collisionPlan, workspaceMaterializations: Object.freeze([...collisionPlan.workspaceMaterializations].reverse()) });
const reorderedCollisionPackage = buildRecipientRelativeHandoffTransportPackage({ handoff, workspace, recipient: { referenceTargets: [A] }, plan: reorderedCollisionPlan, workspaceMaterializations: collisionWorkspaces, localRunId: 'collision-reordered-package' }, { packageInput: { builtAt: '2026-08-22T13:00:52.000Z' } });
assert.equal(reorderedCollisionPackage.status, 'ready', 'planner array order must not affect a uniquely proven carrier correlation');
assert.equal(reorderedCollisionPackage.closureInspection.status, 'valid');
const collisionDescriptorBySource = new Map(reorderedCollisionPackage.descriptor.workspaceMaterializations.map((entry) => [entry.source?.label, entry]));
assert.equal(collisionDescriptorBySource.get('SOURCE-A')?.correlationStatus, 'qualified');
assert.equal(collisionDescriptorBySource.get('SOURCE-A')?.includedEntries[0]?.packagePath, 'handoff.workspaces/carrier-A/same.txt');
assert.equal(collisionDescriptorBySource.get('SOURCE-B')?.correlationStatus, 'qualified');
assert.equal(collisionDescriptorBySource.get('SOURCE-B')?.includedEntries[0]?.packagePath, 'handoff.workspaces/carrier-B/same.txt');

const staleCorrelationPlan = Object.freeze({
  ...collisionPlan,
  workspaceMaterializations: Object.freeze([
    Object.freeze({ ...collisionPlan.workspaceMaterializations[0], source: Object.freeze({ label: 'SOURCE-TAMPERED' }) }),
    collisionPlan.workspaceMaterializations[1]
  ])
});
const staleCorrelationPackage = buildRecipientRelativeHandoffTransportPackage({ handoff, workspace, recipient: { referenceTargets: [A] }, plan: staleCorrelationPlan, workspaceMaterializations: collisionWorkspaces, localRunId: 'collision-stale-package' }, { packageInput: { builtAt: '2026-08-22T13:00:53.000Z' } });
assert.equal(staleCorrelationPackage.status, 'blocked', 'stale externally supplied planner correlation evidence must fail closed');
assert.equal(staleCorrelationPackage.closureInspection.status, 'invalid');
assert(staleCorrelationPackage.descriptor.workspaceMaterializations.some((entry) => entry.correlationStatus === 'unresolved'));

const rawEvidenceSourceWorkspace = {
  id: 'docs',
  state: 'complete',
  completenessEvidence: { state: 'qualified', proof: 'enumerated-set' },
  source: { label: 'RAW-EVIDENCE-SOURCE' },
  entries: [{ path: 'a.txt', packagePath: 'handoff.workspaces/raw-evidence/a.txt', content: 'AAA' }]
};
const rawEvidenceSourcePlan = planRecipientRelativeHandoffMaterialClosure({ handoff, recipient: { referenceTargets: [A] }, workspaceMaterializations: [rawEvidenceSourceWorkspace] });
const staleRawCorrelationEvidence = rawEvidenceSourcePlan.workspaceMaterializations[0].transportCorrelationEvidence;
const staleRawEvidenceWorkspace = {
  ...rawEvidenceSourceWorkspace,
  entries: [{ path: 'a.txt', packagePath: 'handoff.workspaces/raw-evidence/a.txt', content: 'BBB' }],
  transportCorrelationEvidence: staleRawCorrelationEvidence
};
const staleRawEvidencePackage = buildRecipientRelativeHandoffTransportPackage({
  handoff,
  workspace,
  recipient: { referenceTargets: [A] },
  workspaceMaterializations: [staleRawEvidenceWorkspace],
  localRunId: 'raw-correlation-evidence-staleness-package'
}, { packageInput: { builtAt: '2026-08-22T13:00:53.500Z' } });
const staleRawEvidenceCarrier = staleRawEvidencePackage.bundle.files.find((file) => file.kind === 'handoff-workspace-material');
assert(staleRawEvidenceCarrier);
assert.equal(staleRawEvidencePackage.status, 'ready', 'raw caller correlation evidence may be ignored and recomputed from the current carrier rather than becoming authority');
assert.equal(staleRawEvidencePackage.closureInspection.status, 'valid');
assert.equal(staleRawEvidencePackage.descriptor.workspaceMaterializations[0].correlationStatus, 'qualified');
assert.notEqual(staleRawCorrelationEvidence.carrierEntries[0].sha256, staleRawEvidenceCarrier.sha256, 'fixture must actually carry stale evidence from different bytes');
assert.equal(staleRawEvidencePackage.plan.workspaceMaterializations[0].transportCorrelationEvidence.carrierEntries[0].sha256, staleRawEvidenceCarrier.sha256, 'planner correlation evidence must be recomputed from the current raw carrier bytes');
assert.notDeepEqual(staleRawEvidencePackage.plan.workspaceMaterializations[0].transportCorrelationEvidence, staleRawCorrelationEvidence, 'caller-supplied raw transport correlation evidence must not self-authorize the current carrier');

const trulyCollidingWorkspaces = [
  { id: 'docs', state: 'complete', completenessEvidence: { state: 'qualified', proof: 'enumerated-set' }, source: { label: 'SAME-SOURCE' }, entries: [{ path: 'same.txt', packagePath: 'handoff.workspaces/collision/same.txt', content: 'same-bytes' }] },
  { id: 'docs', state: 'complete', completenessEvidence: { state: 'qualified', proof: 'enumerated-set' }, source: { label: 'SAME-SOURCE' }, entries: [{ path: 'same.txt', packagePath: 'handoff.workspaces/collision/same.txt', content: 'same-bytes' }] }
];
const trulyCollidingPlan = planRecipientRelativeHandoffMaterialClosure({ handoff, recipient: { referenceTargets: [A] }, workspaceMaterializations: trulyCollidingWorkspaces });
assert.equal(trulyCollidingPlan.workspaceMaterializations[0].transportCorrelationKey, trulyCollidingPlan.workspaceMaterializations[1].transportCorrelationKey);
const trulyCollidingPackage = buildRecipientRelativeHandoffTransportPackage({ handoff, workspace, recipient: { referenceTargets: [A] }, plan: trulyCollidingPlan, workspaceMaterializations: trulyCollidingWorkspaces, localRunId: 'collision-ambiguous-package' }, { packageInput: { builtAt: '2026-08-22T13:00:54.000Z' } });
assert.equal(trulyCollidingPackage.status, 'blocked', 'non-unique full carrier correlation must fail closed rather than consume queue order');
assert.equal(trulyCollidingPackage.closureInspection.status, 'invalid');
assert(trulyCollidingPackage.descriptor.workspaceMaterializations.every((entry) => entry.correlationStatus === 'ambiguous'));

const externallySuppliedUncorrelatedPlan = Object.freeze({ ...anonymousCompletePackaged.plan, workspaceMaterializations: Object.freeze(anonymousCompletePackaged.plan.workspaceMaterializations.map(({ transportCorrelationKey, ...entry }) => Object.freeze(entry))) });
const uncorrelatedPackaged = buildRecipientRelativeHandoffTransportPackage({
  handoff,
  workspace,
  recipient: { referenceTargets: [A] },
  plan: externallySuppliedUncorrelatedPlan,
  workspaceMaterializations: [{ state: 'complete', completenessEvidence: { state: 'qualified', proof: 'enumerated-set' }, entries: [{ path: 'anonymous/a.txt', content: 'anonymous-byte' }], includedEntries: [{ path: 'anonymous/a.txt', sha256: 'anonymous-descriptor', bytes: 14 }] }],
  localRunId: 'uncorrelated-plan-package'
}, { packageInput: { builtAt: '2026-08-22T13:00:55.000Z' } });
assert.equal(uncorrelatedPackaged.status, 'blocked', 'externally supplied planner truth without transport correlation proof must fail closed');
const uncorrelatedCarrier = uncorrelatedPackaged.bundle.files.find((file) => file.kind === 'handoff-workspace-material');
assert(uncorrelatedCarrier);
assert.equal(uncorrelatedCarrier.boundary.includes('complete-evidence-backed'), false);

const handoffBMarkdown = handoffMarkdown
  .replace('# Handoff fixture', '# Handoff B fixture')
  .replace('- required-A', '- required-B')
  .replace('Material: exact A', 'Material: exact B')
  .replace('Material Reference: [A](' + A + ')', 'Material Reference: [B](' + B + ')');
const handoffB = { id: 'handoff:fixture-b', path: '.topics/handoff-b.trace.md', reference: 'tiinex://handoff/fixture-b', semanticStatus: 'valid', markdown: handoffBMarkdown };
const externallySuppliedPlanA = planRecipientRelativeHandoffMaterialClosure({ handoff, recipient: { referenceTargets: [A] } });
const externalPlanSameInputs = buildRecipientRelativeHandoffTransportPackage({
  handoff,
  workspace,
  recipient: { referenceTargets: [A] },
  plan: externallySuppliedPlanA,
  localRunId: 'external-plan-same-inputs'
}, { packageInput: { builtAt: '2026-08-22T13:00:56.000Z' } });
assert.equal(externalPlanSameInputs.status, 'ready');
assert.equal(externalPlanSameInputs.planInputBinding.state, 'qualified');
assert.equal(externalPlanSameInputs.planInputBinding.mode, 'parallel-current-inputs');
assert.equal(externalPlanSameInputs.closureInspection.status, 'valid');

const explicitRequirementsB = projectHandoffMaterialRequirements(handoffB);
const freshExplicitRequirementsB = planRecipientRelativeHandoffMaterialClosure({ requirements: explicitRequirementsB, recipient: { referenceTargets: [A] } });
assert.equal(freshExplicitRequirementsB.status, 'blocked');
const staleExternalRequirementsPackage = buildRecipientRelativeHandoffTransportPackage({
  workspace,
  plan: externallySuppliedPlanA,
  requirements: explicitRequirementsB,
  localRunId: 'external-plan-explicit-requirements-mismatch'
}, { packageInput: { builtAt: '2026-08-22T13:00:56.050Z' } });
assert.equal(staleExternalRequirementsPackage.status, 'blocked', 'supported current explicit requirements projection must not be silently shadowed by stale external plan truth');
assert.equal(staleExternalRequirementsPackage.planInputBinding.state, 'invalid');
assert(staleExternalRequirementsPackage.planInputBinding.findings.includes('current-requirements-input-mismatch'));
assert.equal(staleExternalRequirementsPackage.closureInspection.status, 'invalid');
assert.equal(staleExternalRequirementsPackage.descriptor.requirements.required[0].referenceTarget, A, 'stale plan requirement truth may remain visible for audit but cannot qualify current closure');

const referencePolicyPlan = planRecipientRelativeHandoffMaterialClosure({
  handoff,
  recipient: { referenceTargets: [A] },
  materials: [{ referenceTarget: B, data: new TextEncoder().encode('BBB') }],
  includeReferenceMaterial: false
});
assert.equal(referencePolicyPlan.requirements.reference[0].disposition, 'omitted-by-plan');
const freshReferencePolicyPlan = planRecipientRelativeHandoffMaterialClosure({
  handoff,
  recipient: { referenceTargets: [A] },
  materials: [{ referenceTarget: B, data: new TextEncoder().encode('BBB') }],
  includeReferenceMaterial: true
});
assert.equal(freshReferencePolicyPlan.requirements.reference[0].disposition, 'materialized');
const staleExternalReferencePolicyPackage = buildRecipientRelativeHandoffTransportPackage({
  handoff,
  workspace,
  recipient: { referenceTargets: [A] },
  materials: [{ referenceTarget: B, data: new TextEncoder().encode('BBB') }],
  plan: referencePolicyPlan,
  includeReferenceMaterial: true,
  localRunId: 'external-plan-include-reference-policy-mismatch'
}, { packageInput: { builtAt: '2026-08-22T13:00:56.100Z' } });
assert.equal(staleExternalReferencePolicyPackage.status, 'blocked');
assert.equal(staleExternalReferencePolicyPackage.planInputBinding.state, 'invalid');
assert(staleExternalReferencePolicyPackage.planInputBinding.findings.includes('current-include-reference-material-input-mismatch'));
assert(staleExternalReferencePolicyPackage.planInputBinding.findings.includes('current-material-resolution-input-mismatch'));
assert.equal(staleExternalReferencePolicyPackage.closureInspection.status, 'invalid');

const preferencePolicyPlan = planRecipientRelativeHandoffMaterialClosure({
  handoff,
  recipient: { referenceTargets: [A] },
  materials: [{ referenceTarget: A, data: new TextEncoder().encode('AAA') }]
});
assert.equal(preferencePolicyPlan.requirements.required[0].disposition, 'reference-sufficient');
const freshPreferencePolicyPlan = planRecipientRelativeHandoffMaterialClosure({
  handoff,
  recipient: { referenceTargets: [A] },
  materials: [{ referenceTarget: A, data: new TextEncoder().encode('AAA') }],
  preferReferenceWhenResolvable: false
});
assert.equal(freshPreferencePolicyPlan.requirements.required[0].disposition, 'materialized');
const staleExternalPreferencePolicyPackage = buildRecipientRelativeHandoffTransportPackage({
  handoff,
  workspace,
  recipient: { referenceTargets: [A] },
  materials: [{ referenceTarget: A, data: new TextEncoder().encode('AAA') }],
  plan: preferencePolicyPlan,
  preferReferenceWhenResolvable: false,
  localRunId: 'external-plan-reference-preference-policy-mismatch'
}, { packageInput: { builtAt: '2026-08-22T13:00:56.150Z' } });
assert.equal(staleExternalPreferencePolicyPackage.status, 'blocked');
assert.equal(staleExternalPreferencePolicyPackage.planInputBinding.state, 'invalid');
assert(staleExternalPreferencePolicyPackage.planInputBinding.findings.includes('current-prefer-reference-when-resolvable-input-mismatch'));
assert(staleExternalPreferencePolicyPackage.planInputBinding.findings.includes('current-material-resolution-input-mismatch'));
assert.equal(staleExternalPreferencePolicyPackage.closureInspection.status, 'invalid');

const bootstrapAbsentPlan = planRecipientRelativeHandoffMaterialClosure({ handoff, recipient: { referenceTargets: [A] }, bootstrap: { present: false } });
const staleExternalBootstrapPresentPackage = buildRecipientRelativeHandoffTransportPackage({
  workspace,
  plan: bootstrapAbsentPlan,
  bootstrap: { present: true, path: 'tiinex.package/bootstrap.md', content: '# Current bootstrap\n' },
  localRunId: 'external-plan-bootstrap-absent-to-present-mismatch'
}, { packageInput: { builtAt: '2026-08-22T13:00:56.200Z' } });
assert.equal(staleExternalBootstrapPresentPackage.status, 'blocked');
assert.equal(staleExternalBootstrapPresentPackage.planInputBinding.state, 'invalid');
assert(staleExternalBootstrapPresentPackage.planInputBinding.findings.includes('current-bootstrap-input-mismatch'));
assert.equal(staleExternalBootstrapPresentPackage.bundle.files.some((file) => file.kind === 'handoff-bootstrap'), false, 'stale absent plan must not emit a current bootstrap carrier');

const bootstrapPresentPlan = planRecipientRelativeHandoffMaterialClosure({
  handoff,
  recipient: { referenceTargets: [A] },
  bootstrap: { present: true, path: 'tiinex.package/bootstrap.md', content: '# Planned bootstrap\n' }
});
const externalBootstrapSameInputPackage = buildRecipientRelativeHandoffTransportPackage({
  handoff,
  workspace,
  recipient: { referenceTargets: [A] },
  plan: bootstrapPresentPlan,
  bootstrap: { present: true, path: 'tiinex.package/bootstrap.md', content: '# Planned bootstrap\n' },
  localRunId: 'external-plan-bootstrap-same-input'
}, { packageInput: { builtAt: '2026-08-22T13:00:56.225Z' } });
assert.equal(externalBootstrapSameInputPackage.status, 'ready');
assert.equal(externalBootstrapSameInputPackage.planInputBinding.state, 'qualified');
assert.equal(externalBootstrapSameInputPackage.closureInspection.status, 'valid');
assert(externalBootstrapSameInputPackage.bundle.files.some((file) => file.kind === 'handoff-bootstrap' && file.bytes > 0));

const externalBootstrapMissingCarrierPackage = buildRecipientRelativeHandoffTransportPackage({
  workspace,
  plan: bootstrapPresentPlan,
  localRunId: 'external-plan-bootstrap-missing-current-carrier'
}, { packageInput: { builtAt: '2026-08-22T13:00:56.250Z' } });
assert.equal(externalBootstrapMissingCarrierPackage.status, 'blocked', 'plan-only external reuse may remain input-binding-qualified, but a planned present bootstrap cannot materialize without current carrier bytes');
assert.equal(externalBootstrapMissingCarrierPackage.planInputBinding.state, 'qualified');
assert.equal(externalBootstrapMissingCarrierPackage.planInputBinding.mode, 'plan-sole-current-authority');
assert.equal(externalBootstrapMissingCarrierPackage.bundle.files.some((file) => file.kind === 'handoff-bootstrap'), false);
assert.equal(externalBootstrapMissingCarrierPackage.closureInspection.status, 'invalid');
assert(externalBootstrapMissingCarrierPackage.closureInspection.findings.some((finding) => finding.code === 'portable.handoff-closure.bootstrap.missing'));

const externalMaterialPlanA = planRecipientRelativeHandoffMaterialClosure({
  handoff,
  recipient: { referenceTargets: [] },
  materials: [{ id: 'material-a', referenceTarget: A, data: new TextEncoder().encode('AAA') }]
});
assert.equal(externalMaterialPlanA.status, 'ready');
assert.equal(externalMaterialPlanA.requirements.required[0].disposition, 'materialized');
assert(externalMaterialPlanA.inputBinding.materialResolution.required[0].selectedMaterial);

const externalMaterialSameInputs = buildRecipientRelativeHandoffTransportPackage({
  handoff,
  workspace,
  recipient: { referenceTargets: [] },
  plan: externalMaterialPlanA,
  materials: [{ id: 'material-a', referenceTarget: A, data: new TextEncoder().encode('AAA') }],
  localRunId: 'external-plan-material-same-inputs'
}, { packageInput: { builtAt: '2026-08-22T13:00:56.250Z' } });
assert.equal(externalMaterialSameInputs.status, 'ready', 'externally supplied materialized plan reuse remains allowed when current material-resolution inputs exactly match');
assert.equal(externalMaterialSameInputs.planInputBinding.state, 'qualified');
assert.equal(externalMaterialSameInputs.closureInspection.status, 'valid');
assert.equal(externalMaterialSameInputs.materializedOutputQualification.state, 'qualified');

const externalMaterialOmittedProjection = Object.freeze({ ...externalMaterialPlanA, materialized: Object.freeze([]) });
const externalMaterialOmittedPackage = buildRecipientRelativeHandoffTransportPackage({
  handoff, workspace, recipient: { referenceTargets: [] }, plan: externalMaterialOmittedProjection,
  materials: [{ id: 'material-a', referenceTarget: A, data: new TextEncoder().encode('AAA') }],
  localRunId: 'external-plan-materialized-output-omitted'
}, { packageInput: { builtAt: '2026-08-22T13:00:56.260Z' } });
assert.equal(externalMaterialOmittedPackage.status, 'blocked', 'external plan must not remain ready when a materialized required carrier is omitted from its derived output projection');
assert.equal(externalMaterialOmittedPackage.planInputBinding.state, 'qualified', 'input binding remains independently qualified; the failure is derived-output coherence');
assert.equal(externalMaterialOmittedPackage.materializedOutputQualification.state, 'invalid');
assert(externalMaterialOmittedPackage.materializedOutputQualification.findings.includes('materialized-output-required-carrier-missing'));
assert.equal(externalMaterialOmittedPackage.bundle.files.some((file) => file.kind === 'handoff-material'), false, 'unqualified derived output bytes must not be emitted');
assert.equal(externalMaterialOmittedPackage.closureInspection.status, 'invalid');
assert(externalMaterialOmittedPackage.closureInspection.findings.some((finding) => finding.code === 'portable.handoff-closure.materialized-output.unqualified'));
assert(externalMaterialOmittedPackage.closureInspection.findings.some((finding) => finding.code === 'portable.handoff-closure.materialized-output.required-carrier-missing'));

const substitutedCarrier = Object.freeze({ ...externalMaterialPlanA.materialized[0], data: new TextEncoder().encode('BBB') });
const externalMaterialSubstitutedProjection = Object.freeze({ ...externalMaterialPlanA, materialized: Object.freeze([substitutedCarrier]) });
const externalMaterialSubstitutedPackage = buildRecipientRelativeHandoffTransportPackage({
  handoff, workspace, recipient: { referenceTargets: [] }, plan: externalMaterialSubstitutedProjection,
  materials: [{ id: 'material-a', referenceTarget: A, data: new TextEncoder().encode('AAA') }],
  localRunId: 'external-plan-materialized-output-substituted'
}, { packageInput: { builtAt: '2026-08-22T13:00:56.270Z' } });
assert.equal(externalMaterialSubstitutedPackage.status, 'blocked', 'external plan must not remain ready when materialized carrier bytes diverge from selected-material truth');
assert.equal(externalMaterialSubstitutedPackage.planInputBinding.state, 'qualified');
assert.equal(externalMaterialSubstitutedPackage.materializedOutputQualification.state, 'invalid');
assert(externalMaterialSubstitutedPackage.materializedOutputQualification.findings.includes('materialized-output-supplied-carrier-sha256-mismatch'));
assert(externalMaterialSubstitutedPackage.materializedOutputQualification.findings.includes('materialized-output-carrier-mismatch'));
assert.equal(externalMaterialSubstitutedPackage.bundle.files.some((file) => file.kind === 'handoff-material'), false, 'substituted unqualified bytes must not be emitted');
assert.equal(externalMaterialSubstitutedPackage.closureInspection.status, 'invalid');
assert(externalMaterialSubstitutedPackage.closureInspection.findings.some((finding) => finding.code === 'portable.handoff-closure.materialized-output.unqualified'));
assert(externalMaterialSubstitutedPackage.closureInspection.findings.some((finding) => finding.code === 'portable.handoff-closure.materialized-output.required-carrier-missing'));

const extraCarrier = Object.freeze({ ...externalMaterialPlanA.materialized[0], requirementId: 'required:unbound-extra' });
const externalMaterialExtraProjection = Object.freeze({ ...externalMaterialPlanA, materialized: Object.freeze([...externalMaterialPlanA.materialized, extraCarrier]) });
const externalMaterialExtraPackage = buildRecipientRelativeHandoffTransportPackage({ handoff, workspace, plan: externalMaterialExtraProjection, localRunId: 'external-plan-materialized-output-extra' }, { packageInput: { builtAt: '2026-08-22T13:00:56.280Z' } });
assert.equal(externalMaterialExtraPackage.status, 'blocked');
assert.equal(externalMaterialExtraPackage.materializedOutputQualification.state, 'invalid');
assert(externalMaterialExtraPackage.materializedOutputQualification.findings.includes('materialized-output-unbound-carrier'));
assert.equal(externalMaterialExtraPackage.closureInspection.status, 'invalid');

for (const [caseName, materialInputs] of Object.entries({
  direct: {
    materials: [
      { id: 'material-a', referenceTarget: A, data: new TextEncoder().encode('AAA') },
      { id: 'material-b', referenceTarget: A, data: new TextEncoder().encode('BBB') }
    ]
  },
  providers: {
    providerResults: [
      { providerId: 'provider-a', candidates: [{ referenceTarget: A, data: new TextEncoder().encode('AAA') }] },
      { providerId: 'provider-b', candidates: [{ referenceTarget: A, data: new TextEncoder().encode('BBB') }] }
    ]
  },
  priorPackages: {
    priorPackages: [
      { id: 'prior-a', materials: [{ referenceTarget: A, data: new TextEncoder().encode('AAA') }] },
      { id: 'prior-b', materials: [{ referenceTarget: A, data: new TextEncoder().encode('BBB') }] }
    ]
  }
})) {
  const freshCurrentPlan = planRecipientRelativeHandoffMaterialClosure({
    handoff,
    recipient: { referenceTargets: [] },
    ...materialInputs
  });
  assert.equal(freshCurrentPlan.status, 'blocked');
  assert.equal(freshCurrentPlan.requirements.required[0].disposition, 'ambiguous');

  const staleExternalMaterialPlanPackage = buildRecipientRelativeHandoffTransportPackage({
    handoff,
    workspace,
    recipient: { referenceTargets: [] },
    plan: externalMaterialPlanA,
    ...materialInputs,
    localRunId: `external-plan-material-mismatch-${caseName}`
  }, { packageInput: { builtAt: '2026-08-22T13:00:56.500Z' } });
  assert.equal(staleExternalMaterialPlanPackage.status, 'blocked', `${caseName}: stale external plan must not ignore contradictory current material-resolution inputs`);
  assert.equal(staleExternalMaterialPlanPackage.planInputBinding.state, 'invalid');
  assert(staleExternalMaterialPlanPackage.planInputBinding.findings.includes('current-material-resolution-input-mismatch'));
  assert.equal(staleExternalMaterialPlanPackage.closureInspection.status, 'invalid');
  assert(staleExternalMaterialPlanPackage.closureInspection.findings.some((finding) => finding.code === 'portable.handoff-closure.plan-input-binding.unqualified'));
  assert.equal(staleExternalMaterialPlanPackage.descriptor.requirements.required[0].disposition, 'materialized', 'stale plan truth remains visible for audit but cannot qualify current closure');
}

const externalPlanHandoffMismatch = buildRecipientRelativeHandoffTransportPackage({
  handoff: handoffB,
  workspace,
  recipient: { referenceTargets: [B] },
  plan: externallySuppliedPlanA,
  localRunId: 'external-plan-handoff-mismatch'
}, { packageInput: { builtAt: '2026-08-22T13:00:57.000Z' } });
assert.equal(externalPlanHandoffMismatch.status, 'blocked', 'externally supplied plan must not remain current closure authority when the parallel current Handoff materially differs');
assert.equal(externalPlanHandoffMismatch.planInputBinding.state, 'invalid');
assert(externalPlanHandoffMismatch.planInputBinding.findings.includes('current-handoff-input-mismatch'));
assert.equal(externalPlanHandoffMismatch.closureInspection.status, 'invalid');
assert(externalPlanHandoffMismatch.closureInspection.findings.some((finding) => finding.code === 'portable.handoff-closure.plan-input-binding.unqualified'));
assert.equal(externalPlanHandoffMismatch.descriptor.handoff.id, handoff.id, 'stale plan Handoff truth remains visible for audit but cannot produce ready/valid current closure');

const externalPlanRecipientMismatch = buildRecipientRelativeHandoffTransportPackage({
  handoff,
  workspace,
  recipient: { referenceTargets: [] },
  plan: externallySuppliedPlanA,
  localRunId: 'external-plan-recipient-mismatch'
}, { packageInput: { builtAt: '2026-08-22T13:00:58.000Z' } });
assert.equal(externalPlanRecipientMismatch.status, 'blocked', 'recipient-relative resolution truth must be requalified against the current parallel recipient capability input');
assert.equal(externalPlanRecipientMismatch.planInputBinding.state, 'invalid');
assert(externalPlanRecipientMismatch.planInputBinding.findings.includes('current-recipient-resolution-input-mismatch'));
assert.equal(externalPlanRecipientMismatch.closureInspection.status, 'invalid');

const externalPlanSoleAuthority = buildRecipientRelativeHandoffTransportPackage({
  workspace,
  plan: externallySuppliedPlanA,
  localRunId: 'external-plan-sole-authority'
}, { packageInput: { builtAt: '2026-08-22T13:00:59.000Z' } });
assert.equal(externalPlanSoleAuthority.status, 'ready', 'an externally supplied plan may remain the sole current planning authority when no contradictory parallel Handoff/recipient inputs are presented');
assert.equal(externalPlanSoleAuthority.planInputBinding.state, 'qualified');
assert.equal(externalPlanSoleAuthority.planInputBinding.mode, 'plan-sole-current-authority');
assert.equal(externalPlanSoleAuthority.closureInspection.status, 'valid');

const selfBindingGenuinePlan = planRecipientRelativeHandoffMaterialClosure({
  handoff,
  recipient: { referenceTargets: [] },
  materials: [{ id: 'self-binding-a', referenceTarget: A, data: new TextEncoder().encode('AAA') }]
});
assert.equal(selfBindingGenuinePlan.status, 'ready');
assert.equal(selfBindingGenuinePlan.requirements.required[0].recipientReferenceCapability, false);
assert.equal(selfBindingGenuinePlan.requirements.required[0].disposition, 'materialized');
assert.equal(selfBindingGenuinePlan.inputBinding.materialResolution.required[0].disposition, 'materialized');
const selfContradictoryRequirement = Object.freeze({
  ...selfBindingGenuinePlan.requirements.required[0],
  disposition: 'reference-sufficient',
  selectedMaterial: null,
  reason: 'adversarial plan-owned projection contradicts preserved self-binding evidence'
});
const selfContradictoryPlan = Object.freeze({
  ...selfBindingGenuinePlan,
  requirements: Object.freeze({
    ...selfBindingGenuinePlan.requirements,
    required: Object.freeze([selfContradictoryRequirement])
  }),
  materialized: Object.freeze([])
});
const selfContradictoryPlanPackage = buildRecipientRelativeHandoffTransportPackage({
  workspace,
  plan: selfContradictoryPlan,
  localRunId: 'external-plan-self-binding-contradiction'
}, { packageInput: { builtAt: '2026-08-22T13:00:59.250Z' } });
assert.equal(selfContradictoryPlanPackage.status, 'blocked', 'plan-only reuse must self-qualify the external plan against its own preserved input-binding evidence');
assert.equal(selfContradictoryPlanPackage.planInputBinding.state, 'invalid');
assert.equal(selfContradictoryPlanPackage.planInputBinding.mode, 'plan-sole-current-authority');
assert(selfContradictoryPlanPackage.planInputBinding.findings.includes('plan-input-binding-material-resolution-self-mismatch'));
assert.equal(selfContradictoryPlanPackage.materializedOutputQualification.state, 'qualified', 'derived-output qualification remains independently correct for the contradictory plan projection');
assert.equal(selfContradictoryPlanPackage.closureInspection.status, 'invalid');
assert(selfContradictoryPlanPackage.closureInspection.findings.some((finding) => finding.code === 'portable.handoff-closure.plan-input-binding.unqualified'));
assert.equal(selfContradictoryPlanPackage.descriptor.requirements.required[0].recipientReferenceCapability, false);
assert.equal(selfContradictoryPlanPackage.descriptor.requirements.required[0].disposition, 'reference-sufficient');

const externalPlanMissingBinding = Object.freeze(({ inputBinding, ...rest }) => rest)(externallySuppliedPlanA);
const externalPlanMissingBindingPackage = buildRecipientRelativeHandoffTransportPackage({
  handoff,
  workspace,
  recipient: { referenceTargets: [A] },
  plan: externalPlanMissingBinding,
  localRunId: 'external-plan-missing-binding'
}, { packageInput: { builtAt: '2026-08-22T13:00:59.500Z' } });
assert.equal(externalPlanMissingBindingPackage.status, 'blocked');
assert.equal(externalPlanMissingBindingPackage.planInputBinding.state, 'invalid');
assert(externalPlanMissingBindingPackage.planInputBinding.findings.includes('plan-input-binding-missing'));
assert.equal(externalPlanMissingBindingPackage.closureInspection.status, 'invalid');
const externalPlanMissingBindingSolePackage = buildRecipientRelativeHandoffTransportPackage({
  workspace,
  plan: externalPlanMissingBinding,
  localRunId: 'external-plan-missing-binding-plan-sole'
}, { packageInput: { builtAt: '2026-08-22T13:00:59.750Z' } });
assert.equal(externalPlanMissingBindingSolePackage.status, 'blocked', 'plan-only external reuse still requires the plan-owned self-binding evidence it is supposed to self-qualify against');
assert.equal(externalPlanMissingBindingSolePackage.planInputBinding.state, 'invalid');
assert.equal(externalPlanMissingBindingSolePackage.planInputBinding.mode, 'plan-sole-current-authority');
assert(externalPlanMissingBindingSolePackage.planInputBinding.findings.includes('plan-input-binding-missing'));
assert.equal(externalPlanMissingBindingSolePackage.closureInspection.status, 'invalid');

const builtAbsent = buildRecipientRelativeHandoffTransportPackage({ handoff, workspace, materials: [{ requirementId: 'required:required-a', referenceTarget: A, data: bytesA }], bootstrap: { include: false }, localRunId: 'run-absent' }, { packageInput: { builtAt: '2026-08-22T13:00:00.000Z' } });
assert.equal(builtAbsent.status, 'ready');
assert.equal(builtAbsent.descriptor.bootstrap.status, 'absent');
assert.equal(builtAbsent.closureInspection.status, 'valid');
assert(builtAbsent.bundle.files.some((file) => file.path === HANDOFF_CLOSURE_DESCRIPTOR_PATH));

const builtPresent = buildRecipientRelativeHandoffTransportPackage({ handoff, workspace, materials: [{ requirementId: 'required:required-a', referenceTarget: A, data: bytesA }], bootstrap: { include: true, path: 'tiinex.package/bootstrap.md', content: '# Bootstrap\ntransport orientation only\n' }, workspaceMaterializations: [{ id: 'external', state: 'partial', entries: [{ path: 'subset/a.txt', content: 'workspace-byte' }], includedEntries: [{ path: 'subset/a.txt', sha256: 'descriptor-evidence', bytes: 14 }] }], localRunId: 'run-present' }, { packageInput: { builtAt: '2026-08-22T13:01:00.000Z' } });
assert.equal(builtPresent.descriptor.bootstrap.status, 'present');
assert(builtPresent.bundle.files.some((file) => file.kind === 'handoff-bootstrap'));
assert(builtPresent.bundle.files.some((file) => file.kind === 'handoff-workspace-material'));
const logicalRoundtrip = roundTripRecipientRelativeHandoffTransportPackage(builtPresent);
assert.equal(logicalRoundtrip.status, 'passed');
assert.equal(logicalRoundtrip.runtime.importPlan.records.some((record) => String(record.path || '').includes('handoff-closure')), false, 'package-local control metadata must not enter workspace/artifact lineage truth');

const zipBytes = exportPackageZipUint8Array(builtPresent.bundle);
const extracted = extractStoredZip(zipBytes);
const rehydrated = rehydratePortableRuntimePackage({ files: extracted });
assert.equal(rehydrated.status, 'rehydrated');
const closureAfterArchive = inspectHandoffClosureDescriptor(rehydrated.bundle);
assert.equal(closureAfterArchive.status, 'valid');
const originalDescriptor = builtPresent.bundle.files.find((file) => file.path === HANDOFF_CLOSURE_DESCRIPTOR_PATH);
const extractedDescriptor = extracted.find((file) => file.path === HANDOFF_CLOSURE_DESCRIPTOR_PATH);
assert.deepEqual([...extractedDescriptor.data], [...new TextEncoder().encode(originalDescriptor.content)], 'closure descriptor bytes survive independent archive serialization/extraction exactly');


const delegated = prepareRecipientRelativeWorkspaceHandoffExport({ handoff, workspace, materials: [{ requirementId: 'required:required-a', referenceTarget: A, data: bytesA }], localRunId: 'delegated' }, { packageInput: { builtAt: '2026-08-22T13:02:00.000Z' } });
assert.equal(delegated.status, 'ready');
assert.equal(delegated.executable, true);
assert.equal(delegated.roundtrip.status, 'passed');
assert.equal(delegated.companionInspection.status, 'valid');
assert.equal(delegated.transportCompanion.schema, 'tiinex.portable.handoff-transport-companion-projection.v1');
assert.equal(delegated.transportExecutable, false, 'package/material execution remains separate from minimal transport routing readiness when the fixture carries no qualified workspace/artifact tuple');
assert.equal(delegated.boundary.includes('delegation'), true);

console.log('✓ v481 recipient-relative Handoff material closure planner/package pressure passed');

function extractStoredZip(bytes) {
  const files = [];
  let offset = 0;
  const decoder = new TextDecoder();
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  while (offset + 30 <= bytes.byteLength && view.getUint32(offset, true) === 0x04034b50) {
    const method = view.getUint16(offset + 8, true);
    assert.equal(method, 0, 'test archive must remain stored for independent byte extraction');
    const size = view.getUint32(offset + 18, true);
    const nameLength = view.getUint16(offset + 26, true);
    const extraLength = view.getUint16(offset + 28, true);
    const nameStart = offset + 30;
    const dataStart = nameStart + nameLength + extraLength;
    const path = decoder.decode(bytes.slice(nameStart, nameStart + nameLength));
    files.push({ path, data: bytes.slice(dataStart, dataStart + size) });
    offset = dataStart + size;
  }
  return files;
}
