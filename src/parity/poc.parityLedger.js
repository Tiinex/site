import { TIINEX_SITE_CHECKPOINT } from '../build.identity.js';
import { m1PoCParityScenarioDefinitions } from './poc.m1ParityScenarios.js';

export const POC_PARITY_LEDGER_SCHEMA_ID = 'tiinex.poc.parity.ledger.v1';

export const PoCParityStatus = Object.freeze({
  parity: 'parity',
  partial: 'partial',
  scaffold: 'scaffold',
  missing: 'missing',
  intentionallyChanged: 'intentionally-changed',
  wrongPortSuspected: 'wrong-port-suspected',
  unknownPendingEvidence: 'unknown-pending-evidence'
});

export const pocParityLedger = Object.freeze({
  schema: POC_PARITY_LEDGER_SCHEMA_ID,
  checkpoint: TIINEX_SITE_CHECKPOINT,
  principle: 'Recover one observed PoC loop at a time under explicit semantic/runtime owners before claiming parity.',
  scenarios: Object.freeze([
    ...m1PoCParityScenarioDefinitions.map(scenario),
    scenario({
      id: 'path-tree-material-lineage',
      status: PoCParityStatus.partial,
      legacyBehavior: 'Imported repository/material reads as grouped folders with visible branch affordance and counts.',
      semanticOwner: 'workspace path tree view model',
      runtimeOwner: 'src/workspaces/workspace.pathTree + workspace views',
      automatedChecks: ['src/workspaces/workspace.pathTree.test.mjs'],
      manualChecks: ['tree folder expansion', 'search opens matching branches'],
      failureResult: 'material remains available in feed/detail even if tree projection degrades'
    }),
    scenario({
      id: 'root-fallback-readable-artifacts',
      status: PoCParityStatus.partial,
      legacyBehavior: 'Unknown schemas remain readable through Root/envelope semantics instead of becoming broken plain text.',
      semanticOwner: 'tiinex.root.v1 fallback',
      runtimeOwner: 'src/schemas/root.* + src/artifacts/*',
      automatedChecks: ['src/schemas/tiinex.root.v1.fallback.test.mjs'],
      manualChecks: ['open unknown-schema markdown detail'],
      failureResult: 'root fallback finding; preserve unknown child schema fields'
    }),
    scenario({
      id: 'loaded-lineage-resolution',
      status: PoCParityStatus.partial,
      legacyBehavior: 'Loaded artifacts with declared Parent Trace/Origin can be traversed without guessing unloaded material.',
      semanticOwner: 'Parent/Trace/Origin resolution',
      runtimeOwner: 'src/lineage/lineage.resolve + src/lineage/lineage.traverse + src/audit/lineage + src/workspaces/workspace.lineageView',
      automatedChecks: ['src/lineage/lineage.resolve.test.mjs', 'src/lineage/lineage.traverse.test.mjs', 'src/workspaces/workspace.lineageView.test.mjs'],
      manualChecks: ['open Lineage view and inspect parent/origin edges'],
      failureResult: 'missing parent/origin findings, not guessed edges'
    }),
    scenario({
      id: 'continue-reference-conformance',
      status: PoCParityStatus.partial,
      legacyBehavior: 'Continue creates canonical local drafts; one bounded old Reference product value is now restored as a separate durable typed non-parent Relation from Topic to a qualified distinct Task. Preserve evidence remains a different Evidence operation, and broader old Reference relation breadth is not claimed.',
      semanticOwner: 'transition + schema creation contracts',
      runtimeOwner: 'src/transitions canonical product preparation/planners + src/app/canonicalReferenceLocalCreateCommand + Relation materializer',
      automatedChecks: ['src/transitions/record.transitions.test.mjs', 'src/acceptance/postV423CanonicalTransitionProductVerticalSlice.test.mjs', 'src/acceptance/postV434M0DDurableReferenceIntegrationClosure.test.mjs', 'src/acceptance/postV435M0DExactAuthorityDurabilityCorrection.test.mjs'],
      manualChecks: ['create Continue/Reference/Preserve evidence and inspect generated markdown', 'compare bounded current Reference against old Reference relation before final parity'],
      failureResult: 'Reference fails closed when explicit generation, exact defining/generation authority representation, or durable participant identity is unqualified; broader old Reference relation parity remains a final product/manual claim'
    }),
    scenario({
      id: 'github-source-discovery',
      status: PoCParityStatus.partial,
      legacyBehavior: 'GitHub source registration keeps broad discovery independent from exact explicit targets; broad + explicit issue intake is additive/unioned, explicit-only survives refresh, and degraded transport remains truthful.',
      semanticOwner: 'github adapter result + source boundary',
      runtimeOwner: 'src/adapters/github + src/sources/github',
      automatedChecks: ['src/adapters/github/github.issueSnapshot.test.mjs', 'src/adapters/github/github.adapter.test.mjs', 'src/sources/github/github.loader.test.mjs', 'src/acceptance/m2QProductContractCorrection.test.mjs'],
      manualChecks: ['broad discovery off + exact issue targets', 'broad discovery on + exact targets union/dedupe', 'explicit raw/blob/file refs', '403 degraded notice'],
      failureResult: 'source registered with warning/diagnostics; issue snapshots require explicit targets/fixtures; no fake progress'
    }),
    scenario({
      id: 'declared-lineage-tree',
      status: PoCParityStatus.partial,
      legacyBehavior: 'Lineage mode arranges selected leaf and parent context by declared Parent/Trace edges.',
      semanticOwner: 'lineage view model + lineage Verse/surface',
      runtimeOwner: 'src/lineage + src/workspaces/workspace.lineageView + workspace views',
      automatedChecks: ['src/workspaces/workspace.lineageView.test.mjs'],
      manualChecks: ['lineage view selected leaf traversal'],
      failureResult: 'tree/feed must not claim lineage parity until declared edges drive the arrangement'
    }),
    scenario({
      id: 'reload-safe-material-cache',
      status: PoCParityStatus.partial,
      legacyBehavior: 'Refreshing an explicit workspace route restores durable local deltas/assets around a metadata-only route/source shell while cold public/clean targets stay isolated from stale unrelated local state.',
      semanticOwner: 'route shell + durable local delta + source-cache boundary',
      runtimeOwner: 'src/workspaces/workspace.persistence + src/workspaces/workspace.persistenceRecovery + src/workspaces/workspace.route',
      automatedChecks: ['src/workspaces/workspace.persistence.test.mjs', 'src/workspaces/workspace.route.test.mjs', 'src/workspaces/workspace.importLifecycle.test.mjs'],
      manualChecks: ['import local/source material, refresh explicit route, verify local deltas restore without source Markdown authority', 'lose route/hash and verify durable local-only work remains recoverable through the local recovery index', 'open cold public/share target and confirm unrelated local state does not bootstrap'],
      failureResult: 'route/source cache stays metadata-only; durable local deltas remain recoverable; cold targets do not hydrate stale unrelated local workspace state'
    }),
    scenario({
      id: 'lineage-audit-traversal',
      status: PoCParityStatus.partial,
      legacyBehavior: 'Audit can explicitly traverse loaded lineage, report missing targets, and validate what is actually read.',
      semanticOwner: 'audit plan + lineage resolver + schema validators + recoverability summary',
      runtimeOwner: 'src/audit/** + src/audit/audit.traverse + src/workspaces/workspace.auditView + src/workspaces/workspace.recoverabilityView',
      automatedChecks: ['src/workspaces/workspace.auditView.test.mjs', 'src/workspaces/workspace.recoverabilityView.test.mjs', 'src/lineage/lineage.resolve.test.mjs', 'src/lineage/lineage.traverse.test.mjs', 'src/audit/audit.traverse.test.mjs'],
      manualChecks: ['audit selected leaf lineage', 'inspect recoverability summary after import'],
      failureResult: 'loaded-only audit findings and recoverability/degraded summary; no network guesses'
    }),
    scenario({
      id: 'publication-reingest-preflight',
      status: PoCParityStatus.partial,
      legacyBehavior: 'Owned-local GitHub issue/comment publication is Copy → Open → exact-target human confirm → Verify; source-backed input stays reference-only.',
      semanticOwner: 'publication preflight + shared plan/result + GitHub social target contract',
      runtimeOwner: 'src/publication/** + src/app/workspaceGithubPublication + GitHub publication read owner+receipt persistence',
      automatedChecks: ['src/publication/publication.githubSocialTargetRepresentationClosure.test.mjs', 'src/app/workspaceGithubPublication.test.mjs', 'src/workspaces/workspace.publicationReceipts.test.mjs', 'src/acceptance/postV449M0FExactMutationTargetAttestationClosure.test.mjs'],
      manualChecks: ['Copy, Open GitHub, mutate, confirm exact plan+target, Verify, inspect durable receipt'],
      failureResult: 'unattested or mismatched Verify creates no binding/receipt; matching remote bytes alone do not prove this operation wrote them'
    }),
    scenario({
      id: 'export-package-manifest-receipt',
      status: PoCParityStatus.partial,
      legacyBehavior: 'Explicit non-default Handoff export now builds and downloads the shared operational package while preserving local-owned Markdown/assets, source-backed references, package controls, and workspace context; ordinary Tree ZIP remains a separate envelope-free product path.',
      semanticOwner: 'export package preflight + manifest + receipt + source boundary + re-ingest plan',
      runtimeOwner: 'src/export/package.preflight + src/export/package.manifest + src/export/package.builder + src/export/package.zip + src/export/handoff.plan + src/app/workspaceHandoffExport + recoverability view',
      automatedChecks: ['src/export/package.preflight.test.mjs', 'src/export/package.manifest.test.mjs', 'src/export/package.builder.test.mjs', 'src/export/package.zip.test.mjs', 'src/app/workspaceHandoffExport.test.mjs', 'src/app/handoffPackageImportCommand.test.mjs', 'src/acceptance/postV441M0FProductExecutionIntegration.test.mjs', 'src/acceptance/postV442M0FHandoffFreshnessArchiveScalingCorrection.test.mjs', 'src/workspaces/workspace.recoverabilityView.test.mjs', 'src/conformance/conformance.run.test.mjs'],
      manualChecks: ['select Handoff package explicitly, inspect truthful package summary, download one package ZIP, re-ingest it, and verify local assets stay assets while source-backed members remain references'],
      failureResult: 'execution-time blocked/degraded Handoff qualification prevents download; stale render plans never own export bytes; invalid claimed package fails closed; no provenance conversion or generic archive fallback'
    }),
    scenario({
      id: 'export-package-file-map',
      status: PoCParityStatus.partial,
      legacyBehavior: 'The Handoff product path serializes the bounded shared package file map to one ZIP from latest execution-time workspace truth, while local single-ZIP intake decodes once and then rehydrates/imports/applies an operational package or preserves ordinary archive semantics without turning source references into local leaves.',
      semanticOwner: 'export package builder + manifest/receipt contract',
      runtimeOwner: 'src/export/package.builder + src/export/package.apply + src/export/package.zip + src/tooling/portable/package/runtime.package + src/app/handoffPackageImportCommand + canonical workspace lifecycle',
      automatedChecks: ['src/export/package.builder.test.mjs', 'src/export/package.apply.test.mjs', 'src/export/package.zip.test.mjs', 'src/tooling/portable/package/runtime.package.test.mjs', 'src/app/handoffPackageImportCommand.test.mjs', 'src/acceptance/postV441M0FProductExecutionIntegration.test.mjs', 'src/acceptance/postV442M0FHandoffFreshnessArchiveScalingCorrection.test.mjs', 'src/workspaces/workspace.recoverabilityView.test.mjs', 'src/conformance/conformance.run.test.mjs'],
      manualChecks: ['download and re-ingest one qualified Handoff package; confirm package controls/context, local bytes, source-reference descriptors, and ordinary Tree ZIP separation'],
      failureResult: 'blocked/invalid operational package remains non-executable or fails closed; no remote mutation, no fake source leaves, and ordinary Tree ZIP is not reinterpreted as a package'
    }),
    scenario({
      id: 'schema-capability-registry',
      status: PoCParityStatus.partial,
      legacyBehavior: 'Schema-specific capabilities are declared and queryable as portable contracts rather than being implied by React components or folder names.',
      semanticOwner: 'schema module capability registry + root fallback resolution',
      runtimeOwner: 'src/schemas/capability.registry + src/schemas/registry + conformance spine',
      automatedChecks: ['src/schemas/capability.registry.test.mjs', 'src/conformance/conformance.run.test.mjs'],
      manualChecks: ['none required for core registry; UI projection checks happen when surfaces consume it'],
      failureResult: 'unknown schema resolves through root fallback; unavailable capabilities are explicit, not hidden no-ops'
    }),

    scenario({
      id: 'artifact-creation-contracts',
      status: PoCParityStatus.partial,
      legacyBehavior: 'Continue, bounded Reference, Use-as, and standalone Create now exercise the canonical schema/Transition authoring spine without ad-hoc per-action Markdown in the UI; broader schema/action breadth remains non-final.' ,
      semanticOwner: 'artifact creation contract + schema capability registry + root envelope',
      runtimeOwner: 'src/schemas/creation.contracts + canonical Transition product preparation/planners + bounded schema materializers + conformance spine',
      automatedChecks: ['src/schemas/creation.contracts.test.mjs', 'src/acceptance/postV431M0DCanonicalAuthoringParityClosure.test.mjs', 'src/acceptance/postV432M0DStandaloneCreateClosure.test.mjs', 'src/acceptance/postV434M0DDurableReferenceIntegrationClosure.test.mjs', 'src/conformance/conformance.run.test.mjs'],
      manualChecks: ['create Continue/Reference/Use-as/root Create and inspect generated artifacts'],
      failureResult: 'creation is blocked for unknown schemas; local draft remains source-free and reports validation findings'
    }),

    scenario({
      id: 'storage-session-cache-policy',
      status: PoCParityStatus.partial,
      legacyBehavior: 'Local/draft/upload/generated deltas are durable local workspace state, while source material is transport/cache-owned and route/view shells are disposable. Quota pressure must prioritize preserving local work over cache convenience.',
      semanticOwner: 'storage policy + split route/source-cache/local-delta authority',
      runtimeOwner: 'src/storage/storage.policy + src/workspaces/workspace.persistence',
      automatedChecks: ['src/storage/storage.policy.test.mjs', 'src/workspaces/workspace.persistence.test.mjs', 'src/workspaces/workspace.importLifecycle.test.mjs', 'src/conformance/conformance.run.test.mjs'],
      manualChecks: ['refresh explicit #state route after local/archive and GitHub imports', 'simulate localStorage quota pressure and verify local-work failure is surfaced'],
      failureResult: 'source-backed Markdown is metadata-only outside source transport; route cache may be discarded first; local-delta write failure emits explicit localMaterialAtRisk receipt'
    }),
    scenario({
      id: 'source-transport-diagnostics',
      status: PoCParityStatus.partial,
      legacyBehavior: 'GitHub/API/cache/rate-limit transport states should be reported as explicit degraded diagnostics without becoming source truth or hidden retry behavior.',
      semanticOwner: 'source transport diagnostics + transport policy + adapter diagnostics + recoverability view',
      runtimeOwner: 'src/diagnostics/sourceTransport.report + src/sources/transport.policy + src/adapters/github + src/sources/github + recoverability view',
      automatedChecks: ['src/diagnostics/sourceTransport.report.test.mjs', 'src/sources/transport.policy.test.mjs', 'src/sources/github/github.loader.test.mjs', 'src/adapters/github/github.adapter.test.mjs', 'src/conformance/conformance.run.test.mjs'],
      manualChecks: ['register GitHub source under 403/rate-limit or bad file ref and inspect degraded diagnostics'],
      failureResult: 'transport report/policy classifies rate-limit/not-found/unpinned/cache/budget states; no provenance inference and no hidden fetch/retry'
    }),
    scenario({
      id: 'time-portal-source-snapshot',
      status: PoCParityStatus.partial,
      legacyBehavior: 'Display options preserves explicit Begin/End review intent, requires an explicit GitHub snapshot target, resolves named refs once to an immutable commit, and reviews that historical source separately from live/latest workspace truth.',
      semanticOwner: 'workspace view temporal intent + exact source representation identity + read-only historical source projection',
      runtimeOwner: 'src/workspaces/workspace.timePortal + src/app/timePortalSnapshotResolution + src/app/timePortalHistoricalRead + workspace Time Portal views',
      automatedChecks: ['src/workspaces/workspace.timePortal.test.mjs', 'src/adapters/github/github.snapshotTarget.test.mjs', 'src/app/timePortalSnapshotResolution.test.mjs', 'src/app/timePortalHistoricalRead.test.mjs', 'src/app/timePortalRouteShare.test.mjs', 'src/acceptance/postV437M0ETimePortalProductParityClosure.test.mjs'],
      manualChecks: ['Display options → Time Portal Begin/End → Resolve source snapshot', 'historical banner shows exact commit and Return to latest', 'Back/Forward and shared exact state restore selected historical snapshot without silently fetching on cold restore'],
      failureResult: 'unresolved intent remains unresolved; invalid/unavailable snapshot remains explicit; live source/local drafts stay unchanged and no date is converted into a commit'
    }),
    scenario({
      id: 'route-shell-material-boundaries',
      status: PoCParityStatus.partial,
      legacyBehavior: 'Share/session route should preserve workspace material boundaries and metadata without inventing unavailable content.',
      semanticOwner: 'route shell + session cache boundary',
      runtimeOwner: 'src/workspaces/workspace.route + src/workspaces/workspace.persistence',
      automatedChecks: ['src/workspaces/workspace.route.test.mjs', 'src/workspaces/workspace.persistence.test.mjs'],
      manualChecks: ['share/hash route in a fresh browser', 'refresh with cache', 'clean URL reset'],
      failureResult: 'route-only material becomes material-unavailable shell; no false local/session content'
    }),
    scenario({
      id: 'surface-registry-truth',
      status: PoCParityStatus.partial,
      legacyBehavior: 'PoC surfaces feel available only when their behavior is actually present; implemented current paths must not be mislabeled scaffold, while partial must still not be counted as final parity.',
      semanticOwner: 'surface registry + explicit implementation status',
      runtimeOwner: 'src/surfaces/registry + src/surfaces/contracts',
      automatedChecks: ['src/surfaces/registry.test.mjs', 'src/conformance/conformance.run.test.mjs', 'src/acceptance/postV436M0EFIntegratedProductParityDiscovery.test.mjs'],
      manualChecks: ['browser review of all eleven registered surface affordances across desktop/mobile'],
      failureResult: 'implemented surface remains partial until final product proof; absent paths remain scaffold/unavailable rather than being promoted by label alone'
    }),
    scenario({
      id: 'discovery-presentation-parity',
      status: PoCParityStatus.partial,
      legacyBehavior: 'Discovery should prioritize valuable Tiinex leaves, distinguish Display option ordering from filtering, preserve Feed/Tree return context when opening selected Lineage, project qualified schema identity in the Schema filter, keep Tree expansion stable, show source registration/materialization as distinct observable transitions, and keep selected Lineage separate from workspace-wide diagnostics.',
      semanticOwner: 'workspace presentation read model + Display options contract + source/material boundary + selected lineage scope',
      runtimeOwner: 'src/app/workspaceScopedInteraction + src/workspaces/workspace.displayFilters + src/workspaces/workspace.discoveryView + workspace views',
      automatedChecks: ['tools/check-ui-shape.mjs', 'tools/check-uc001.mjs', 'src/app/workspaceScopedInteraction.test.mjs', 'src/workspaces/workspace.displayFilters.test.mjs', 'src/acceptance/postV427DiscoveryReturnContextSchemaFilterParityClosure.test.mjs'],
      manualChecks: ['Feed shows leaves/work artifacts first', 'Tree → selected Lineage → Back restores Tree', 'Feed → selected Lineage → Back restores Feed', 'Schema filter lists only qualified schema identities, not markdown/supporting kind labels', 'Display options has Leaves only, Mismatches only, schema/artifact filters without clipping', 'Tree branches persist across view changes', 'GitHub register-only clearly says no loading is running', 'GitHub import shows accepted/loading/done receipt', 'Source Continue opens prefilled source context', 'Selected Lineage appears before collapsed workspace overview'],
      failureResult: 'supporting docs remain preserved but do not dominate Discovery; source registration and source materialization are not confused; workspace diagnostics stay secondary to selected artifact status'
    }),
    scenario({
      id: 'semantic-action-label-truth',
      status: PoCParityStatus.partial,
      legacyBehavior: 'Artifact labels and actions should not claim stronger evidence or different relations than the runtime can prove; Open/read, Lineage focus, byte/digest status, and Reference/Preserve relations remain distinct.',
      semanticOwner: 'record actions + audit labels + lineage selected scope + parity ledger classifications',
      runtimeOwner: 'src/actions/record.actions + workspace views + audit view + parity ledger',
      automatedChecks: ['src/actions/record.actions.test.mjs', 'tools/check-ui-shape.mjs', 'tools/validate-static.mjs'],
      manualChecks: ['Open reads artifact detail', 'Lineage focuses selected artifact', 'no byte ok label without digest evidence', 'Preserve evidence is not mistaken for old Reference'],
      failureResult: 'status remains partial/wrong-port-suspected; UI uses evidence-honest wording rather than relabeling current behavior as PoC parity'
    }),
    scenario({
      id: 'conformance-fixture-spine',
      status: PoCParityStatus.partial,
      legacyBehavior: 'A small normative corpus exercises parser, root fallback, lineage, audit, path tree, source boundary, and transitions consistently.',
      semanticOwner: 'artifact/source/lineage/audit/transition conformance contract',
      runtimeOwner: 'src/conformance/** plus current runtime modules',
      automatedChecks: ['src/conformance/conformance.run.test.mjs'],
      manualChecks: ['none required for fixture spine; it guards future visible loops'],
      failureResult: 'fixture regression fails validation before a visual parity claim is made'
    })
  ])
});

export function summarizePoCParity(ledger = pocParityLedger) {
  const counts = {};
  for (const item of ledger.scenarios || []) counts[item.status] = (counts[item.status] || 0) + 1;
  return {
    schema: 'tiinex.poc.parity.summary.v1',
    checkpoint: ledger.checkpoint,
    total: (ledger.scenarios || []).length,
    counts,
    parity: counts[PoCParityStatus.parity] || 0,
    notParity: (ledger.scenarios || []).filter((item) => item.status !== PoCParityStatus.parity).map((item) => item.id)
  };
}

function scenario(input) {
  return Object.freeze({
    id: input.id,
    status: input.status,
    legacyBehavior: input.legacyBehavior,
    semanticOwner: input.semanticOwner,
    runtimeOwner: input.runtimeOwner,
    automatedChecks: Object.freeze(input.automatedChecks || []),
    manualChecks: Object.freeze(input.manualChecks || []),
    failureResult: input.failureResult || ''
  });
}
