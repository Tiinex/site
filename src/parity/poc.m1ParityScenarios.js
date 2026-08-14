export const m1PoCParityScenarioDefinitions = Object.freeze([
  {
    id: 'local-archive-intake',
    status: 'partial',
    legacyBehavior: 'Drop/select local files, folders, zip/source-zip material, password-protected stored ZipCrypto archives, and pasted trace Markdown; classify workspace artifacts/leaves/assets and resolve path or trace-slot conflicts explicitly.',
    semanticOwner: 'adapter result + workspace import/conflict contract',
    runtimeOwner: 'src/adapters/archive, src/adapters/local, src/workspaces/workspace.import, src/workspaces/workspace.importConflicts, src/app/localMaterialCommand',
    automatedChecks: ['src/parity/poc.localArchiveParity.test.mjs', 'src/adapters/archive/archive.adapter.test.mjs', 'src/adapters/local/local.adapter.test.mjs', 'src/workspaces/workspace.importConflicts.test.mjs', 'src/app/localMaterialCommand.test.mjs', 'src/schemas/workspace/workspace.addParity.test.mjs'],
    manualChecks: ['drop PoC-compatible source zip', 'password-protected zip intake', 'repeat import conflict choice', 'paste trace Markdown', 'refresh recovery'],
    failureResult: 'partial/degraded adapter result or explicit conflict/password request; no silent overwrite and no fake GitHub provenance'
  },
  {
    id: 'bootstrap-config-ownership',
    status: 'partial',
    legacyBehavior: 'Local PoC startup automatically applies explicit runtime/query workspace config when supplied and otherwise falls back to the embedded/default workspace. All Workspace Entrypoints with Open On Apply become the initial workspace set in declared order; bootstrap ownership sits beneath the UI instead of reducing startup to one selected source or requiring a technical start button.',
    semanticOwner: 'workspace config/bootstrap transition',
    runtimeOwner: 'src/app/initialWorkspaceBootstrapOperation + src/app/tiinexAppStartupSource + src/app/startupWorkspaceCommand + src/app/defaultWorkspaceStartCommand + src/workspaces/workspace.persistenceRecovery',
    automatedChecks: ['src/app/defaultWorkspaceStart.test.mjs', 'src/app/startupWorkspaceCommand.test.mjs', 'src/app/initialWorkspaceBootstrapOperation.test.mjs', 'src/app/emptyStageProductHierarchy.test.mjs', 'src/app/tiinexAppConfigSource.test.mjs', 'src/workspaces/workspace.entrypointLifecycle.test.mjs', 'src/workspaces/workspace.persistence.test.mjs'],
    manualChecks: ['open clean local client and compare first useful workspace state with .old', 'verify explicit runtime config overrides embedded default'],
    failureResult: 'clean UI remains calm; bootstrap errors are explicit and local deltas are not lost or converted into source authority'
  },
  {
    id: 'workspace-artifact-canonical-spine',
    status: 'partial',
    legacyBehavior: 'Workspace Markdown travels through the normal artifact/file spine. Workspace-ness adds one Open/Merge capability model to the artifact rather than creating a second primary workspace-candidate object. Open replaces prior non-draft/source-only workspaces while preserving durable unpublished local work; Merge intentionally retains the current workspace context.',
    semanticOwner: 'canonical artifact identity + workspace role/capability projection',
    runtimeOwner: 'src/workspaces/workspace.import + src/workspaces/workspace.sourceRecords + src/export/tree.bundle + src/actions/record.actions + workspace views',
    automatedChecks: ['src/workspaces/workspace.import.test.mjs', 'src/workspaces/workspace.openSemantics.test.mjs', 'src/workspaces/workspace.entrypointCapability.test.mjs', 'src/workspaces/workspace.entrypointLifecycle.test.mjs', 'src/app/githubSourceMaterializationCommand.test.mjs', 'src/app/workspaceRecordActions.test.mjs', 'src/app/localMaterialCommand.test.mjs', 'src/app/workspaceEntrypointIntakeCommand.test.mjs', 'src/app/workspaceEntrypointProductRouting.test.mjs', 'src/acceptance/recoveryAcceptance.test.mjs'],
    manualChecks: ['compare Documentation/Start workspace artifacts against .old: one artifact class, one Open/Merge model'],
    failureResult: 'legacy candidate-bearing inputs may remain compatibility-readable only at I/O boundaries; persisted candidates normalize once to canonical workspace records/roles and runtime must not recreate a second primary candidate model'
  },
  {
    id: 'source-over-import-canonical-takeover',
    status: 'partial',
    legacyBehavior: 'When verified source material is equivalent to a local import, source becomes canonical and the redundant local payload is pruned. Divergent/newer local work remains explicit; closing source never resurrects a previously deduplicated copy.',
    semanticOwner: 'artifact identity + material reconciliation/source boundary',
    runtimeOwner: 'src/workspaces/workspace.materialReconciliation + src/workspaces/workspace.sourceOverImport + source-close lifecycle',
    automatedChecks: ['src/workspaces/workspace.materialReconciliation.test.mjs', 'src/workspaces/workspace.sourceOverImport.test.mjs', 'src/workspaces/workspace.importLifecycle.test.mjs', 'src/acceptance/recoveryAcceptance.test.mjs'],
    manualChecks: ['import local material then load verified source and compare visible artifacts with .old', 'close source after exact dedupe', 'repeat with divergent local edit'],
    failureResult: 'unverified/divergent material remains explicit; exact verified duplicates do not create hidden resurrection snapshots'
  }
]);
