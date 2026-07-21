export const POC_PARITY_LEDGER_SCHEMA_ID = 'tiinex.poc.parity.ledger.v1';

export const PoCParityStatus = Object.freeze({
  parity: 'parity',
  partial: 'partial',
  scaffold: 'scaffold',
  missing: 'missing',
  intentionallyChanged: 'intentionally-changed'
});

export const pocParityLedger = Object.freeze({
  schema: POC_PARITY_LEDGER_SCHEMA_ID,
  checkpoint: 'v171',
  principle: 'Recover one observed PoC loop at a time under explicit semantic/runtime owners before claiming parity.',
  scenarios: Object.freeze([
    scenario({
      id: 'local-archive-intake',
      status: PoCParityStatus.parity,
      legacyBehavior: 'Drop/select local file, folder, zip, and source zip; classify workspace entries, markdown leaves, and assets without navigation loss.',
      semanticOwner: 'adapter result + workspace import contract',
      runtimeOwner: 'src/adapters/archive, src/adapters/local, src/workspaces/workspace.import',
      automatedChecks: ['src/parity/poc.localArchiveParity.test.mjs', 'src/adapters/archive/archive.adapter.test.mjs', 'src/adapters/local/local.adapter.test.mjs'],
      manualChecks: ['drop source zip on empty stage', 'repeat import', 'refresh recovery'],
      failureResult: 'partial/degraded adapter result with warnings/errors; no fake GitHub provenance'
    }),
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
      automatedChecks: ['src/schemas/root.fallback.test.mjs'],
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
      legacyBehavior: 'Continue/Reference create local drafts that preserve parent boundary and can be validated as Tiinex leaves.',
      semanticOwner: 'transition + schema creation contracts',
      runtimeOwner: 'src/transitions/record.transitions',
      automatedChecks: ['src/transitions/record.transitions.test.mjs'],
      manualChecks: ['create continuation/reference, open generated markdown'],
      failureResult: 'draft remains local/provisional and reports missing validation if schema body contract is unavailable'
    }),
    scenario({
      id: 'github-source-discovery',
      status: PoCParityStatus.partial,
      legacyBehavior: 'GitHub source registration, explicit file materialization, degraded repo discovery under rate limits, and explicit issue/discussion snapshot targets.',
      semanticOwner: 'github adapter result + source boundary',
      runtimeOwner: 'src/adapters/github + src/sources/github',
      automatedChecks: ['src/adapters/github/github.issueSnapshot.test.mjs', 'src/adapters/github/github.adapter.test.mjs', 'src/sources/github/github.loader.test.mjs'],
      manualChecks: ['register source without discovery', 'explicit raw/blob/file refs', '403 degraded notice'],
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
      legacyBehavior: 'Refreshing an explicit workspace route restores loaded local/archive material, assets, and workspace candidates without clean-url stale bootstrap.',
      semanticOwner: 'workspace persistence/session cache boundary',
      runtimeOwner: 'src/workspaces/workspace.persistence + src/workspaces/workspace.route',
      automatedChecks: ['src/workspaces/workspace.persistence.test.mjs', 'src/workspaces/workspace.route.test.mjs'],
      manualChecks: ['import zip, switch Tree/Lineage, refresh same URL'],
      failureResult: 'clean URL ignores stale cache; explicit hash may hydrate cached session material only for matching workspaces'
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
      legacyBehavior: 'Before publication/re-ingest, the app distinguishes publishable local drafts, source-backed references, unpinned source boundaries, and local asset availability without performing hidden writes.',
      semanticOwner: 'publication preflight + source-boundary diagnostics',
      runtimeOwner: 'src/publication/publication.preflight + src/diagnostics/sourceBoundary.report + recoverability view',
      automatedChecks: ['src/publication/publication.preflight.test.mjs', 'src/diagnostics/sourceBoundary.report.test.mjs', 'src/export/package.preflight.test.mjs', 'src/conformance/conformance.run.test.mjs'],
      manualChecks: ['inspect Audit recoverability preflight after import', 'verify unpinned GitHub source does not expose guessed source link'],
      failureResult: 'blocked/degraded preflight with explicit findings; no remote mutation and no guessed GitHub provenance'
    }),
    scenario({
      id: 'export-package-manifest-receipt',
      status: PoCParityStatus.partial,
      legacyBehavior: 'Package/export manifest and receipt planning preserves the distinction between local draft Markdown, source-backed references, assets, metadata-only assets, and workspace context before any package zip is created.',
      semanticOwner: 'export package preflight + manifest + receipt + source boundary + re-ingest plan',
      runtimeOwner: 'src/export/package.preflight + src/export/package.manifest + src/adapters/export + recoverability view',
      automatedChecks: ['src/export/package.preflight.test.mjs', 'src/export/package.manifest.test.mjs', 'src/workspaces/workspace.recoverabilityView.test.mjs', 'src/conformance/conformance.run.test.mjs'],
      manualChecks: ['inspect Audit export package manifest row after local/archive import', 'verify assets stay assets and source-backed records stay references'],
      failureResult: 'blocked/degraded export package manifest/receipt with explicit findings; no package zip and no provenance conversion'
    }),
    scenario({
      id: 'export-package-file-map',
      status: PoCParityStatus.partial,
      legacyBehavior: 'Package/export can build a bounded package file map from manifest data while preserving artifact/source/asset/workspace boundaries.',
      semanticOwner: 'export package builder + manifest/receipt contract',
      runtimeOwner: 'src/export/package.builder + src/adapters/export + recoverability view',
      automatedChecks: ['src/export/package.builder.test.mjs', 'src/workspaces/workspace.recoverabilityView.test.mjs', 'src/conformance/conformance.run.test.mjs'],
      manualChecks: ['inspect Audit package bundle row after local/archive import when surfaced'],
      failureResult: 'blocked/degraded package bundle with control files only or metadata descriptors; no zip creation, no remote mutation, no fake local leaves'
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
      legacyBehavior: 'Continue/Reference and future Use-as creation flow should generate schema-bound local draft leaves through creation contracts rather than ad-hoc UI Markdown.',
      semanticOwner: 'artifact creation contract + schema capability registry + root envelope',
      runtimeOwner: 'src/schemas/creation.contracts + src/transitions/record.transitions + conformance spine',
      automatedChecks: ['src/schemas/creation.contracts.test.mjs', 'src/transitions/record.transitions.test.mjs', 'src/conformance/conformance.run.test.mjs'],
      manualChecks: ['create Continue/Reference and inspect generated markdown when surfaced'],
      failureResult: 'creation is blocked for unknown schemas; local draft remains source-free and reports validation findings'
    }),

    scenario({
      id: 'storage-session-cache-policy',
      status: PoCParityStatus.partial,
      legacyBehavior: 'Reload/cache recovery should preserve local/session work while avoiding silent source-backed content authority or oversized localStorage payloads.',
      semanticOwner: 'storage policy + workspace persistence/session cache boundary',
      runtimeOwner: 'src/storage/storage.policy + src/workspaces/workspace.persistence',
      automatedChecks: ['src/storage/storage.policy.test.mjs', 'src/workspaces/workspace.persistence.test.mjs', 'src/conformance/conformance.run.test.mjs'],
      manualChecks: ['refresh explicit #state route after local/archive and GitHub imports'],
      failureResult: 'source-backed material is metadata-only in session cache; large previews are truncated with cacheState disclosure'
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
      legacyBehavior: 'PoC surfaces feel available only when their behavior is actually present; scaffolded commands should not be counted as parity-ready.',
      semanticOwner: 'surface registry + explicit implementation status',
      runtimeOwner: 'src/surfaces/registry + src/surfaces/contracts',
      automatedChecks: ['src/surfaces/registry.test.mjs', 'src/conformance/conformance.run.test.mjs'],
      manualChecks: ['browser review of Feed/Tree/Lineage/Audit surface affordances'],
      failureResult: 'surface remains scaffold/partial with finding; no false parity claim'
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
