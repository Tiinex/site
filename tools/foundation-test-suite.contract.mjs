// Foundation permanent test-suite contract.
// Standalone historical regressions are intentionally not enumerated here.
// Cases are durable members of component/use-case suites and execute in
// isolated Node processes because some retained current-contract cases own
// process-level setup/teardown.
export const FOUNDATION_TEST_SUITE_SCHEMA = 'tiinex.site.foundation-test-suite.v1';

export const FOUNDATION_TEST_GROUPS = Object.freeze({
  "smoke": Object.freeze([
  "src/acceptance/recoveryAcceptance.case.mjs",
  "src/acceptance/postV450M0ProductAcceptanceHardening.case.mjs",
  "src/tooling/portable/handoff/coldStartQualification.case.mjs",
  "src/tooling/portable/handoff/handoff.manufacture.case.mjs",
  "tools/validation-profile.contract.case.mjs"
]),
  "focused/tooling": Object.freeze([
  "src/tooling/portable/handoff/materialClosure.case.mjs",
  "src/tooling/portable/handoff/boundedWorkspaceRepresentation.case.mjs",
  "src/tooling/portable/handoff/multiRootManufacture.case.mjs",
  "src/tooling/portable/grounding/grounding.readiness.case.mjs",
  "src/tooling/portable/adapters/cli/cli.run.case.mjs",
  "src/tooling/portable/input/node.input.case.mjs",
  "tools/run-checkpointed-plan.case.mjs"
]),
  "workspace/source": Object.freeze([
  "src/workspaces/workspace.lifecycle.case.mjs",
  "src/artifacts/artifact.parse.case.mjs",
  "src/workspaces/workspace.importLifecycle.case.mjs",
  "src/workspaces/workspace.persistence.case.mjs",
  "src/workspaces/workspace.materialReconciliation.case.mjs",
  "src/workspaces/workspace.publicationReceipts.case.mjs",
  "src/sources/source.model.case.mjs",
  "src/sources/transport.policy.case.mjs",
  "src/sources/github/github.transport.case.mjs",
  "src/adapters/github/github.adapter.case.mjs",
  "src/adapters/archive/archive.adapter.case.mjs",
  "src/adapters/local/local.adapter.case.mjs"
]),
  "schema/transition": Object.freeze([
  "src/transitions/transition.validate.case.mjs",
  "src/transitions/record.transitions.case.mjs",
  "src/transitions/canonicalTransition.schemaCache.case.mjs",
  "src/schemas/schema.companionContract.case.mjs",
  "src/validation/validateArtifact.case.mjs",
  "src/acceptance/postV423CanonicalTransitionProductVerticalSlice.case.mjs",
  "src/acceptance/postV470SchemaReadingContractMaterializationIdentitySourceCoalescingAuthorityCorrection.case.mjs"
]),
  "product": Object.freeze([
  "src/app/startupPresentation.case.mjs",
  "src/app/defaultWorkspaceStart.case.mjs",
  "src/app/workspaceEntrypointProductRouting.case.mjs",
  "src/app/workspaceSpineProductRouting.case.mjs",
  "src/app/canonicalCreationProductSettlement.case.mjs",
  "src/acceptance/postV437M0ETimePortalProductParityClosure.case.mjs",
  "src/acceptance/knownScenarios.case.mjs"
]),
  "package/publication": Object.freeze([
  "src/publication/publication.preflight.case.mjs",
  "src/publication/publication.githubSocialContract.case.mjs",
  "src/export/package.builder.case.mjs",
  "src/export/package.controlTopology.case.mjs",
  "src/export/package.zip.case.mjs",
  "src/reingest/reingest.plan.case.mjs",
  "src/acceptance/postV447M0FGithubSocialPublicationProductIntegration.case.mjs"
]),
  "tooling/detail": Object.freeze([
  "src/tooling/portable/handoff/carrierLineage.fixedWidth.case.mjs",
  "src/tooling/portable/bootstrap/bootstrap.case.mjs",
  "src/tooling/portable/adapters/cli/cli.summaryProjection.case.mjs",
  "tools/validate-static-regression-aware.case.mjs",
  "tools/measure-tooling-workset.case.mjs",
  "tools/search-tooling-context.case.mjs",
  "tools/measure-portable-input-workset.case.mjs",
  "tools/run-checkpointed-command.case.mjs",
  "tools/profile-validation-chain.case.mjs",
  "tools/foundation-test-suite.contract.case.mjs"
]),
});

export const FOUNDATION_TEST_SUITES = Object.freeze({
  smoke: Object.freeze([...FOUNDATION_TEST_GROUPS['smoke']]),
  'focused/tooling': Object.freeze([...FOUNDATION_TEST_GROUPS['focused/tooling']]),
  integration: Object.freeze([
    ...FOUNDATION_TEST_GROUPS['workspace/source'],
    ...FOUNDATION_TEST_GROUPS['schema/transition'],
    ...FOUNDATION_TEST_GROUPS.product,
    ...FOUNDATION_TEST_GROUPS['package/publication'],
    ...FOUNDATION_TEST_GROUPS['tooling/detail']
  ]),
  all: Object.freeze(Object.values(FOUNDATION_TEST_GROUPS).flat())
});

export function foundationSuite(name) {
  const key = String(name || '').trim();
  const suite = FOUNDATION_TEST_SUITES[key];
  if (!suite) throw new Error(`foundation-test-suite.unknown:${key || '(empty)'}`);
  return suite;
}

export function foundationSuiteSummary() {
  return Object.freeze({
    schema: FOUNDATION_TEST_SUITE_SCHEMA,
    groups: Object.freeze(Object.fromEntries(Object.entries(FOUNDATION_TEST_GROUPS).map(([name, cases]) => [name, cases.length]))),
    suites: Object.freeze(Object.fromEntries(Object.entries(FOUNDATION_TEST_SUITES).map(([name, cases]) => [name, cases.length]))),
    permanentCases: FOUNDATION_TEST_SUITES.all.length,
    standaloneTestEntrypoints: 1,
    boundary: 'Cases are current component/use-case contract members, not permanent standalone regression entrypoints. A new permanent case requires a distinct current invariant and suite ownership.'
  });
}
