import assert from 'node:assert/strict';
import { runConformanceFixtureSet } from './conformance.run.js';

const result = runConformanceFixtureSet();

assert.equal(result.schema, 'tiinex.conformance.result.v1');
assert.equal(result.workspace.records.length, 6);
assert.equal(result.workspace.assets.length, 1);
assert.equal(result.workspace.workspaceMergeCandidates.length, 1);

assert.equal(result.invariants.localBoundaryClean, true, 'fixture records must remain local/session');
assert.ok(result.invariants.loadedParentEdges >= 1, 'declared loaded parent should resolve');
assert.ok(result.invariants.missingParentFindings >= 1, 'missing declared parent should become a finding');
assert.equal(result.invariants.lineageTraversalPresent, true, 'loaded lineage traversal must be part of conformance spine');
assert.equal(result.invariants.lineageTraversalLoadedOnly, true, 'lineage traversal must remain loaded-only/no fetch');
assert.equal(result.invariants.lineageTraversalVisitsAncestors, true, 'lineage traversal must visit declared loaded ancestors');
assert.equal(result.invariants.auditTraversalScopePresent, true, 'audit traversal scope must be part of conformance spine');
assert.equal(result.invariants.auditTraversalScopeLoadedOnly, true, 'audit traversal must remain loaded-only/no fetch');
assert.equal(result.invariants.auditTraversalScopeAuditsVisited, true, 'audit traversal must audit all loaded visited nodes');
assert.ok(result.invariants.rootFallbackItems >= 1, 'unknown schema should use root fallback');
assert.ok(result.invariants.invalidItems >= 1, 'invalid fixture should be reported invalid');
assert.equal(result.invariants.continuationEnvelope, true, 'continuation draft should include root-like envelope and integrity');
assert.equal(result.invariants.referenceEnvelope, true, 'reference draft should include root-like envelope and integrity');
assert.equal(result.invariants.continuationValidationClean, true, 'continuation draft must pass transition validation');
assert.equal(result.invariants.referenceValidationClean, true, 'reference draft must pass transition validation');
assert.equal(result.invariants.transitionSourceBoundaryClean, true, 'transition drafts must stay local and not inherit source objects');
assert.equal(result.invariants.sourceBoundaryClean, true, 'conformance source boundary report must remain clean for local fixtures');
assert.equal(result.invariants.sourceTransportPresent, true, 'source transport report must be part of conformance spine');
assert.equal(result.invariants.sourceTransportObservationOnly, true, 'source transport diagnostics must remain observation-only');
assert.equal(result.invariants.sourceTransportCleanForLocalFixture, true, 'local conformance fixture should have clean transport diagnostics');
assert.equal(result.invariants.sourceTransportPolicyPresent, true, 'source transport policy authorization must be part of conformance spine');
assert.equal(result.invariants.sourceTransportPolicyDoesNotFetchLocalFixture, true, 'local conformance fixture must not request source transport');
assert.equal(result.invariants.sourceTransportPolicySummaryClean, true, 'source transport policy summary should be clean for local fixture');
assert.equal(result.invariants.storagePolicyPresent, true, 'storage policy must be part of conformance spine');
assert.equal(result.invariants.storagePolicyCountsMaterial, true, 'storage policy must classify fixture records/assets');
assert.equal(result.invariants.schemaCapabilityRegistryPresent, true, 'schema capability registry must be part of conformance spine');
assert.equal(result.invariants.schemaCapabilityRegistryClean, true, 'schema capability registry must remain clean');
assert.equal(result.invariants.schemaCapabilityRegistryCoversModules, true, 'schema capability registry must cover registered modules');
assert.equal(result.invariants.schemaCapabilityUnknownUsesRootFallback, true, 'unknown schema capabilities must resolve through root fallback');
assert.equal(result.invariants.artifactCreationContractsPresent, true, 'artifact creation contracts must be part of conformance spine');
assert.equal(result.invariants.artifactCreationContractReady, true, 'topic creation contract must validate as ready');
assert.equal(result.invariants.artifactCreationUnknownBlocked, true, 'unknown schema creation must be blocked instead of created through fallback');
assert.equal(result.invariants.artifactCreationResultValidates, true, 'contract-created continuation draft must validate');
assert.equal(result.invariants.artifactCreationResultLocalOnly, true, 'artifact creation result must stay local and source-free');
assert.equal(result.invariants.publicationPreflightPresent, true, 'publication preflight must be part of conformance spine');
assert.equal(result.invariants.publicationPreflightProtectsNonDrafts, true, 'publication preflight must block non-envelope local material');
assert.equal(result.invariants.reingestPlanPresent, true, 're-ingest plan must be part of conformance spine');
assert.equal(result.invariants.reingestPlanProtectsLocalMaterial, true, 're-ingest plan must not treat blocked local material as source-backed');
assert.equal(result.invariants.exportPackagePreflightPresent, true, 'export package preflight must be part of conformance spine');
assert.equal(result.invariants.exportPackageProtectsLocalMaterial, true, 'export package preflight must block non-envelope local material');
assert.equal(result.invariants.exportPackageKeepsAssetsAsAssets, true, 'export package preflight must keep assets as assets, not fake leaves');
assert.equal(result.invariants.exportPackageManifestPresent, true, 'export package manifest must be part of conformance spine');
assert.equal(result.invariants.exportPackageManifestMatchesPreflight, true, 'export manifest entries must follow preflight classification');
assert.equal(result.invariants.exportPackageManifestKeepsAssetsAsAssets, true, 'export manifest must keep assets as assets, not fake leaves');
assert.equal(result.invariants.exportPackageReceiptPresent, true, 'export package receipt must be part of conformance spine');
assert.equal(result.invariants.exportPackageContractPresent, true, 'export package contract must join preflight/manifest/receipt');
assert.equal(result.invariants.exportPackageContractNoMutation, true, 'export package contract must remain no-mutation');
assert.equal(result.invariants.exportPackageBundlePresent, true, 'export package bundle must be part of conformance spine');
assert.equal(result.invariants.exportPackageBundleNoMutation, true, 'export package bundle must remain in-memory/no-mutation');
assert.equal(result.invariants.exportPackageBundleHasControlFiles, true, 'export package bundle must include package control files');
assert.equal(result.invariants.exportPackageBundleInspectionValid, true, 'export package bundle inspection must pass');
assert.equal(result.invariants.exportPackageBundleKeepsAssetsOutOfArtifacts, true, 'export package bundle must keep assets out of artifacts');
assert.equal(result.invariants.exportPackageBundleKeepsSourceRefsOutOfArtifacts, true, 'export package bundle must keep source references out of artifacts');
assert.equal(result.invariants.exportPackageImportPlanPresent, true, 'export package import plan must be part of conformance spine');
assert.equal(result.invariants.exportPackageImportPlanNoGithubGuess, true, 'package import must not infer GitHub provenance for local materialized records');
assert.equal(result.invariants.exportPackageImportPlanKeepsSourceRefsSeparate, true, 'package import must keep source references separate from records');
assert.equal(result.invariants.exportPackageImportPlanKeepsAssetsAsAssets, true, 'package import must keep assets as assets');
assert.equal(result.invariants.exportPackageApplyResultPresent, true, 'export package apply result must be part of conformance spine');
assert.equal(result.invariants.exportPackageApplyResultNoRemoteMutation, true, 'package apply result must remain no remote/no mutation');
assert.equal(result.invariants.exportPackageApplyKeepsSourceRefsOutOfRecords, true, 'package apply must not turn source references into records');

const parentEdge = result.lineage.edges.find((edge) => edge.from === 'topic-parent' && edge.to === 'topic-child-trace');
assert.ok(parentEdge, 'child Trace should resolve to parent record');
assert.equal(parentEdge.method, 'record-trace');

const originEdge = result.lineage.edges.find((edge) => edge.from === 'topic-parent' && edge.to === 'evidence-origin-only');
assert.ok(originEdge, 'origin URL should resolve by loaded path suffix');
assert.equal(originEdge.kind, 'origin');

const missingEdge = result.lineage.edges.find((edge) => edge.to === 'missing-parent' && edge.status === 'missing');
assert.ok(missingEdge, 'missing Trace must be represented as missing edge');

const unknownAudit = result.auditView.items.find((item) => item.id === 'unknown-schema');
assert.equal(unknownAudit.fallbackUsed, true);
assert.equal(unknownAudit.status, 'degraded');

const invalidAudit = result.auditView.items.find((item) => item.id === 'invalid-markdown');
assert.equal(invalidAudit.status, 'invalid-or-incomplete');

assert.ok(result.pathTree.counts.records >= 6);
assert.ok(result.pathTree.counts.assets >= 1);
assert.ok(result.summary.counts.records >= 6);

console.log('conformance.run: ok');
