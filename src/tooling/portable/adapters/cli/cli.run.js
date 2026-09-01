import { markPortableBootstrapCanonicalSource } from '../../providers/schema.bootstrap.provenance.js';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { loadNodePortableInput } from '../../input/node.input.js';
import { listPortableOperations, runPortableOperation } from '../../operation.catalog.js';
import { writePortableRuntimePackageZip } from '../../output/node.zip.js';
import { materializeCliArtifactSetResult, materializeCliLocalDraftResult } from './cli.local-output.js';
import { portableCliHelpText } from './cli.help.js';
import { materializeHandoffManufactureCliOutput, prepareHandoffManufactureCliCommand } from './cli.handoff-manufacture.js';

export async function runPortableCli(argv = process.argv.slice(2), io = console, runtime = {}) {
  const parsed = parseArgs(argv);
  if (!parsed.command || parsed.command === 'help' || parsed.flags.help) {
    io.log(portableCliHelpText(runtime.commandPrefix));
    return 0;
  }
  if (parsed.command === 'operations') {
    writeJson(io, listPortableOperations(), parsed.flags.compact !== true);
    return 0;
  }
  try {
    const timingEnabled = Boolean(parsed.flags['phase-timing']);
    const totalStartedAt = timingEnabled ? monotonicNowMs() : 0;

    const inputStartedAt = timingEnabled ? monotonicNowMs() : 0;
    const { input, options } = await commandInput(parsed, runtime);
    const inputPreparationMs = timingEnabled ? elapsedMs(inputStartedAt) : 0;

    const operationStartedAt = timingEnabled ? monotonicNowMs() : 0;
    const result = await runPortableOperation(parsed.command, input, options);
    const operationExecutionMs = timingEnabled ? elapsedMs(operationStartedAt) : 0;

    const materializationStartedAt = timingEnabled ? monotonicNowMs() : 0;
    let output = result;
    if (parsed.command === 'manufacture-handoff-package' && (parsed.flags.output || parsed.flags['output-dir'])) {
      output = await materializeHandoffManufactureCliOutput(result, parsed.flags);
    } else if (parsed.command === 'build-runtime-package' && parsed.flags.output) {
      const receipt = await writePortableRuntimePackageZip(result.bundle, parsed.flags.output);
      output = Object.freeze({ ...result, bundle: undefined, writeReceipt: receipt });
    } else if (parsed.command === 'create-local-draft' && (parsed.flags.output || parsed.flags['qualified-package'] || parsed.flags['result-package'])) {
      output = await materializeCliLocalDraftResult(result, input, parsed.flags);
    } else if ((parsed.command === 'create-local-artifact-set' || parsed.command === 'export-live-lineage') && (parsed.flags['output-dir'] || parsed.flags.bundle)) {
      output = await materializeCliArtifactSetResult(result, parsed.flags, { bundlePrimary: parsed.command === 'export-live-lineage' });
    } else if (parsed.command === 'process-live-turn' && parsed.flags.output && result.status !== 'blocked') {
      const outputPath = path.resolve(String(parsed.flags.output));
      const stateBytes = `${JSON.stringify(result.state, null, 2)}\n`;
      await mkdir(path.dirname(outputPath), { recursive: true });
      await writeFile(outputPath, stateBytes, 'utf8');
      output = Object.freeze({ ...result, liveStateOutput: Object.freeze({ path: outputPath, bytes: Buffer.byteLength(stateBytes), artifacts: result.state?.artifacts?.length || 0 }) });
    }
    const outputMaterializationMs = timingEnabled ? elapsedMs(materializationStartedAt) : 0;
    if (timingEnabled) output = withCliPhaseTiming(output, {
      command: parsed.command,
      inputPreparationMs,
      operationExecutionMs,
      outputMaterializationMs,
      measuredElapsedBeforeFinalSerializationMs: elapsedMs(totalStartedAt)
    });
    if (parsed.flags.summary) output = withCliSummaryProjection(output, parsed.command, parsed.flags);
    writeJson(io, output, parsed.flags.compact !== true);
    return result?.findingSummary?.counts?.error ? 2 : 0;
  } catch (error) {
    io.error(JSON.stringify({
      schema: 'tiinex.portable.cli.error.v1',
      error: String(error?.message || error),
      command: parsed.command
    }, null, 2));
    return 1;
  }
}

export function withCliSummaryProjection(result = {}, command = '', flags = {}) {
  const operation = String(command || result.operation || '');
  if (!['inspect', 'audit', 'search-lineage', 'resolve-lineage', 'qualify-cold-start'].includes(operation)) return result;
  if (operation === 'qualify-cold-start') return cliColdStartQualificationSummary(result, flags);
  const findings = Array.isArray(result.findings) ? result.findings : [];
  const actionableFindings = findings.filter((finding) => finding?.severity === 'error' || finding?.severity === 'warning');
  const counts = cliSummaryCounts(result, operation, findings);
  return Object.freeze({
    schema: result.schema,
    operation: result.operation || operation,
    projection: 'bounded-summary',
    status: result.status || (result.findingSummary?.counts?.error ? 'blocked' : 'ready'),
    boundary: result.boundary,
    counts,
    ...(operation === 'search-lineage' ? {
      query: result.query,
      scope: result.scope,
      page: result.page,
      facets: result.facets
    } : {}),
    ...(operation === 'resolve-lineage' ? {
      traversal: cliLineageTraversalSummary(result.traversal),
      lineage: cliLineageGraphSummary(result.lineage)
    } : {}),
    findingSummary: result.findingSummary,
    actionableFindings: Object.freeze(actionableFindings.slice(0, 20)),
    actionableFindingsOmitted: Math.max(0, actionableFindings.length - 20),
    ...(result.cliPhaseTiming ? { cliPhaseTiming: result.cliPhaseTiming } : {})
  });
}


function cliColdStartQualificationSummary(result = {}, flags = {}) {
  const findings = Array.isArray(result.findings) ? result.findings : [];
  const actionableFindings = findings.filter((finding) => finding?.severity === 'error' || finding?.severity === 'warning');
  const requiredContext = Array.isArray(result.continuation?.requiredContext) ? result.continuation.requiredContext : [];
  const requestedRequiredContextSelectors = coldStartRequiredContextSelectors(flags['include-required-context']);
  const selectedRequiredContext = requiredContext.filter((item) => coldStartRequiredContextSelected(item, requestedRequiredContextSelectors));
  const selectedSet = new Set(selectedRequiredContext);
  const orderedRequiredContext = [...selectedRequiredContext, ...requiredContext.filter((item) => !selectedSet.has(item))];
  const requiredContextSummary = orderedRequiredContext.slice(0, 20).map((item) => {
    const contentProjected = selectedSet.has(item) && typeof item?.content === 'string';
    return Object.freeze({
      requirementId: item.requirementId,
      name: item.name,
      state: item.state,
      referenceTarget: item.referenceTarget,
      kind: item.kind,
      workspaceId: item.workspaceId,
      archivePackagePath: item.archivePackagePath,
      innerPath: item.innerPath,
      packagePath: item.packagePath,
      providerMode: item.providerMode,
      bytes: item.bytes,
      sha256: item.sha256,
      actualBytes: item.actualBytes,
      actualSha256: item.actualSha256,
      contentState: item.contentState,
      contentProjected,
      ...(contentProjected ? { content: item.content } : {})
    });
  });
  const projectedRequiredContextBodies = requiredContextSummary.filter((item) => item.contentProjected).length;
  const availableRequiredContextBodies = requiredContext.filter((item) => typeof item?.content === 'string' && item.content.length > 0).length;
  const unmatchedRequiredContextSelectors = requestedRequiredContextSelectors.filter((selector) => selector !== 'all' && !requiredContext.some((item) => coldStartRequiredContextMatches(item, selector)));
  const qualification = result.qualification || {};
  const grounding = result.grounding || {};
  const continuation = result.continuation || {};
  return Object.freeze({
    schema: result.schema,
    operation: result.operation || 'qualify-cold-start',
    resultSchema: result.resultSchema,
    projection: 'bounded-summary',
    status: result.status,
    ingressKind: result.ingressKind,
    qualification: Object.freeze({
      state: qualification.state,
      preferredPathPassed: qualification.preferredPathPassed,
      recoveryState: qualification.recoveryState,
      recoveryIsPreferredPathEvidence: qualification.recoveryIsPreferredPathEvidence,
      toolingAvailability: qualification.toolingAvailability,
      firstSemanticOperation: qualification.firstSemanticOperation,
      expectedFirstSemanticOperation: qualification.expectedFirstSemanticOperation,
      orientationOperation: qualification.orientationOperation,
      groundingState: qualification.groundingState,
      hostEvidence: qualification.hostEvidence,
      fallback: qualification.fallback
    }),
    metrics: result.metrics,
    grounding: Object.freeze({
      status: grounding.status,
      ingressKind: grounding.ingressKind,
      selectedRoute: cliColdStartRouteSummary(grounding.selectedRoute),
      handoff: cliColdStartHandoffSummary(grounding.handoff),
      role: cliColdStartRoleSummary(grounding.role),
      participation: cliColdStartParticipationSummary(grounding.participation),
      interaction: cliColdStartInteractionSummary(grounding.interaction),
      capabilities: cliColdStartCapabilitiesSummary(grounding.capabilities),
      degradedCapture: grounding.degradedCapture,
      mutationBoundary: grounding.mutationBoundary,
      next: grounding.next,
      findingSummary: grounding.findingSummary
    }),
    continuation: Object.freeze({
      state: continuation.state,
      substantiveWorkMayBegin: continuation.substantiveWorkMayBegin,
      qualificationState: continuation.qualificationState,
      selectedRoute: continuation.selectedRoute,
      transfer: Object.freeze([...(continuation.transfer || [])].slice(0, 20)),
      transferOmitted: Math.max(0, (continuation.transfer || []).length - 20),
      requiredContext: Object.freeze(requiredContextSummary),
      requiredContextOmitted: Math.max(0, requiredContext.length - requiredContextSummary.length),
      requiredContextContentBodiesProjected: projectedRequiredContextBodies,
      requiredContextContentBodiesOmitted: Math.max(0, availableRequiredContextBodies - projectedRequiredContextBodies),
      requestedRequiredContextSelectors: Object.freeze(requestedRequiredContextSelectors),
      unmatchedRequiredContextSelectors: Object.freeze(unmatchedRequiredContextSelectors),
      completionExpectation: continuation.completionExpectation,
      returnPackage: continuation.returnPackage,
      next: continuation.next,
      boundary: continuation.boundary
    }),
    oneShot: result.oneShot,
    findingSummary: result.findingSummary,
    actionableFindings: Object.freeze(actionableFindings.slice(0, 20)),
    actionableFindingsOmitted: Math.max(0, actionableFindings.length - 20),
    projectionBoundary: Object.freeze({
      requiredContextBodiesProjected: projectedRequiredContextBodies > 0,
      fullProjectionAvailable: true,
      interpretation: 'This receipt preserves cold-start qualification state, route/task transfer, required-context identity metadata, completion expectation, and actionable findings while omitting body-scale grounding/context material. Request the full qualification projection or explicitly read the qualified required-context material before relying on omitted body text for substantive reasoning.'
    }),
    ...(result.cliPhaseTiming ? { cliPhaseTiming: result.cliPhaseTiming } : {})
  });
}


function coldStartRequiredContextSelectors(value) {
  if (!value) return Object.freeze([]);
  if (value === true) return Object.freeze(['all']);
  return Object.freeze(String(value).split(',').map((item) => item.trim()).filter(Boolean).map((item) => item.toLowerCase()));
}

function coldStartRequiredContextSelected(item = {}, selectors = []) {
  if (!selectors.length) return false;
  if (selectors.includes('all')) return true;
  return selectors.some((selector) => coldStartRequiredContextMatches(item, selector));
}

function coldStartRequiredContextMatches(item = {}, selector = '') {
  const normalized = String(selector || '').trim().toLowerCase();
  if (!normalized) return false;
  return [item.requirementId, item.name, item.referenceTarget].some((value) => String(value || '').trim().toLowerCase() === normalized);
}

function cliColdStartRouteSummary(route = {}) {
  if (!route || typeof route !== 'object') return route;
  const required = route.requiredClosure || {};
  return Object.freeze({
    id: route.id,
    state: route.state,
    workspaceId: route.workspaceId,
    workspaceRelativeHandoffPath: route.workspaceRelativeHandoffPath,
    packagePath: route.packagePath,
    from: route.from,
    to: route.to,
    pointerPath: route.pointerPath,
    requiredClosure: Object.freeze({
      state: required.state,
      requiredCount: required.requiredCount,
      qualifiedCount: required.qualifiedCount,
      requirementsProjected: false
    })
  });
}

function cliColdStartHandoffSummary(handoff = {}) {
  if (!handoff || typeof handoff !== 'object') return handoff;
  return Object.freeze({
    schemaId: handoff.schemaId,
    purpose: handoff.purpose,
    from: handoff.from,
    fromKind: handoff.fromKind,
    to: handoff.to,
    toKind: handoff.toKind,
    transferCount: (handoff.transfers || []).length,
    transfersProjected: false,
    completionExpectation: handoff.completionExpectation,
    routeId: handoff.routeId,
    workspaceId: handoff.workspaceId,
    workspaceRelativePath: handoff.workspaceRelativePath,
    packagePath: handoff.packagePath
  });
}

function cliColdStartRoleSummary(role = {}) {
  if (!role || typeof role !== 'object') return role;
  return Object.freeze({
    state: role.state,
    endpoint: role.endpoint,
    material: role.material,
    transition: role.transition,
    predecessor: role.predecessor,
    compatibility: role.compatibility,
    exactBoundaryProjected: false,
    authorityBoundaryProjected: false,
    interpretationLimitsProjected: false
  });
}

function cliColdStartParticipationSummary(participation = {}) {
  if (!participation || typeof participation !== 'object') return participation;
  return Object.freeze({
    participantState: participation.participantState,
    currentContribution: participation.currentContribution,
    handoffCapacities: participation.handoffCapacities,
    transportIdentityAssumption: participation.transportIdentityAssumption,
    cardinality: participation.cardinality
  });
}

function cliColdStartInteractionSummary(interaction = {}) {
  if (!interaction || typeof interaction !== 'object') return interaction;
  return Object.freeze({
    handoffPurpose: interaction.handoffPurpose,
    currentPurpose: interaction.currentPurpose,
    purposeState: interaction.purposeState,
    mode: interaction.mode,
    modeState: interaction.modeState,
    executionExpected: interaction.executionExpected,
    nonExecutionMode: interaction.nonExecutionMode,
    continuingDialoguePermitted: interaction.continuingDialoguePermitted,
    oneShotAssumed: interaction.oneShotAssumed
  });
}

function cliColdStartCapabilitiesSummary(capabilities = {}) {
  if (!capabilities || typeof capabilities !== 'object') return capabilities;
  const discovery = capabilities.discovery || {};
  const profile = discovery.profile || {};
  const instance = profile.capabilityInstance || capabilities.instance || {};
  const advertised = profile.capabilities || {};
  return Object.freeze({
    discovery: Object.freeze({
      schema: discovery.schema,
      status: discovery.status,
      tools: Array.isArray(profile.tools) ? profile.tools.length : 0,
      provider: instance.provider,
      host: instance.host,
      session: instance.session,
      materialAccess: advertised.materialAccess,
      execution: advertised.execution,
      mutation: advertised.mutation,
      interaction: advertised.interaction
    }),
    providerNameGrantsCapability: capabilities.providerNameGrantsCapability,
    advertisementIsExerciseEvidence: capabilities.advertisementIsExerciseEvidence
  });
}

function cliSummaryCounts(result = {}, operation = '', findings = []) {
  if (operation === 'inspect') return Object.freeze({
    files: Array.isArray(result.files) ? result.files.length : 0,
    records: Array.isArray(result.records) ? result.records.length : 0,
    assets: Array.isArray(result.assets) ? result.assets.length : 0,
    workspaceEntries: Array.isArray(result.workspaceEntries) ? result.workspaceEntries.length : 0,
    findings: findings.length
  });
  if (operation === 'audit') return Object.freeze({
    audits: Array.isArray(result.audits) ? result.audits.length : 0,
    findings: findings.length
  });
  if (operation === 'search-lineage') return Object.freeze({
    returnedMatches: Array.isArray(result.matches) ? result.matches.length : Number(result.page?.returned || 0),
    totalMatches: Number(result.page?.total || 0),
    eligibleRecords: Number(result.scope?.eligibleRecords || 0),
    findings: findings.length
  });
  return Object.freeze({
    loadedNodes: Number(result.traversal?.stats?.loadedNodes || result.lineage?.stats?.loadedNodes || result.lineage?.stats?.nodes || 0),
    visitedNodes: Number(result.traversal?.stats?.visitedNodes || result.lineage?.stats?.visitedNodes || 0),
    traversedEdges: Number(result.traversal?.stats?.traversedEdges || result.lineage?.stats?.traversedEdges || 0),
    missingEdges: Number(result.traversal?.stats?.missingEdges || result.lineage?.stats?.missingEdges || 0),
    findings: findings.length
  });
}

function cliLineageTraversalSummary(traversal = {}) {
  return Object.freeze({
    boundary: traversal.boundary,
    direction: traversal.direction,
    maxDepth: traversal.maxDepth,
    startIds: Object.freeze([...(traversal.startIds || [])]),
    stats: traversal.stats
  });
}

function cliLineageGraphSummary(lineage = {}) {
  return Object.freeze({
    stats: lineage.stats,
    options: lineage.options
  });
}

function monotonicNowMs() {
  return Number(process.hrtime.bigint()) / 1_000_000;
}

function elapsedMs(startedAt = 0) {
  return Math.max(0, Math.round((monotonicNowMs() - Number(startedAt || 0)) * 1000) / 1000);
}

function withCliPhaseTiming(result = {}, timing = {}) {
  return Object.freeze({
    ...result,
    cliPhaseTiming: Object.freeze({
      schema: 'tiinex.portable.cli.phase-timing.v1',
      command: String(timing.command || ''),
      measuredElapsedBeforeFinalSerializationMs: Number(timing.measuredElapsedBeforeFinalSerializationMs || 0),
      phases: Object.freeze({
        inputPreparationMs: Number(timing.inputPreparationMs || 0),
        operationExecutionMs: Number(timing.operationExecutionMs || 0),
        outputMaterializationMs: Number(timing.outputMaterializationMs || 0)
      }),
      measurementBoundary: 'immediately-before-final-json-serialization',
      unmeasured: Object.freeze({
        finalJsonSerialization: true,
        finalEmission: true
      }),
      boundary: 'Monotonic in-process CLI phase timing through result/output materialization only. The receipt is frozen immediately before final JSON serialization, so final JSON serialization and emission are explicitly unmeasured. It also excludes host review/queue latency, client streaming latency, model compute outside this process, and any work performed before this CLI process starts or after it exits.'
    })
  });
}


async function commandInput(parsed, runtime = {}) {
  const flags = parsed.flags;
  if (parsed.command === 'resolve-capabilities') return {
    input: {
      schemaId: flags.schema || parsed.positionals[0] || '',
      capability: flags.capability || parsed.positionals[1] || '',
      checksum: flags.checksum || ''
    },
    options: {}
  };
  if (parsed.command === 'inspect-creation-contract') return {
    input: { schemaId: flags.schema || parsed.positionals[0] || '', transitionType: flags.transition || 'create-artifact' },
    options: {}
  };
  if (parsed.command === 'restore-session') {
    const file = parsed.positionals[0] || flags.input;
    if (!file) throw new Error('portable.cli.session-file.required');
    return { input: JSON.parse(await readFile(file, 'utf8')), options: {} };
  }
  if (parsed.command === 'create-checkpoint') {
    const file = flags.session || parsed.positionals[0] || flags.input;
    if (!file) throw new Error('portable.cli.session-file.required');
    return {
      input: { session: JSON.parse(await readFile(file, 'utf8')), createdAt: flags['created-at'] || '' },
      options: {}
    };
  }
  if (parsed.command === 'restore-checkpoint') {
    const file = parsed.positionals[0] || flags.input;
    if (!file) throw new Error('portable.cli.checkpoint-file.required');
    return { input: JSON.parse(await readFile(file, 'utf8')), options: {} };
  }
  if (parsed.command === 'inspect-runtime-package') {
    const file = flags.bundle || parsed.positionals[0] || flags.input;
    if (!file) throw new Error('portable.cli.package-bundle.required');
    const value = JSON.parse(await readFile(file, 'utf8'));
    return { input: value.bundle || value, options: {} };
  }
  if (parsed.command === 'roundtrip-runtime-package' && (flags.bundle || (parsed.positionals[0] || '').toLowerCase().endsWith('.json'))) {
    const file = flags.bundle || parsed.positionals[0];
    const value = JSON.parse(await readFile(file, 'utf8'));
    return { input: { bundle: value.bundle || value }, options: {} };
  }
  if (parsed.command === 'process-live-turn' || parsed.command === 'read-live-lineage' || parsed.command === 'export-live-lineage') {
    const stateValue = await readOptionalJson(flags.state || parsed.positionals[0]);
    const updateValue = parsed.command === 'process-live-turn' ? await readOptionalJson(flags.turn || flags.update || parsed.positionals[1]) : {};
    const materialTargets = splitFlag(flags.material || flags.workspace);
    const material = await loadCliMaterial(materialTargets, runtime, flags);
    return {
      input: {
        ...material,
        ...updateValue,
        state: stateValue.state || stateValue.liveLineage || stateValue,
        artifactIds: splitFlag(flags.artifacts),
        ...(flags.assets ? { assets: await readOptionalJson(flags.assets) } : {}),
        requireInterleaved: Boolean(flags['require-interleaved'])
      },
      options: {}
    };
  }
  if (parsed.command === 'plan-durable-materialization') {
    const session = await readOptionalJson(flags.session || parsed.positionals[0]);
    const specsValue = await readOptionalJson(flags.specs || parsed.positionals[1]);
    return {
      input: {
        session: session.session || session,
        materializations: specsValue.materializations || specsValue.specs || (Array.isArray(specsValue) ? specsValue : [])
      },
      options: {}
    };
  }
  if (parsed.command === 'explain-findings' || parsed.command === 'repair-plan') {
    const file = parsed.positionals[0] || flags.input;
    if (!file) throw new Error('portable.cli.findings-file.required');
    return { input: JSON.parse(await readFile(file, 'utf8')), options: {} };
  }

  if (parsed.command === 'discover-tooling') {
    const host = await readOptionalJson(flags.host || flags.tools);
    return { input: host, options: {} };
  }

  if (parsed.command === 'describe-cold-start-ingress') return { input: { ingressKind: flags.ingress || flags.kind || parsed.positionals[0] || 'routed-handoff-package' }, options: {} };

  if (parsed.command === 'project-cold-start-host') {
    const host = await readOptionalJson(flags.host || flags.tools);
    return { input: { ...host, host, ingressKind: flags.ingress || flags.kind || parsed.positionals[0] || 'routed-handoff-package', toolingInvocationAvailable: Boolean(flags['tooling-invocation']) }, options: {} };
  }

  if (parsed.command === 'qualify-cold-start') {
    const evidenceFile = flags.evidence || flags.trace || flags.input || '';
    if (evidenceFile) {
      const evidence = JSON.parse(await readFile(evidenceFile, 'utf8'));
      return { input: { ...evidence, ingressKind: flags.ingress || evidence.ingressKind || evidence.kind || 'routed-handoff-package' }, options: {} };
    }
    const packagePath = String(flags.package || parsed.positionals[0] || '').trim();
    if (!packagePath) throw new Error('portable.cli.cold-start-package-or-evidence.required');
    const material = await loadNodePortableInput([packagePath], { maxFiles: flags['max-files'], maxTextBytes: flags['max-text-bytes'] });
    const interaction = await readOptionalJson(flags.interaction);
    return {
      input: {
        ...material,
        bundle: material,
        ingressKind: flags.ingress || flags.kind || 'routed-handoff-package',
        route: flags.route || '',
        packageSourcePath: packagePath,
        preTakeover: flags['pre-takeover'] || 'unverified',
        hostEvidenceSource: flags['evidence-source'] || '',
        interaction: interaction.interaction || interaction,
        toolingAvailable: flags['tooling-unavailable'] ? false : true
      },
      options: {}
    };
  }

  if (parsed.command === 'plan-host-action') {
    const host = await readOptionalJson(flags.host || flags.tools);
    const request = await readOptionalJson(flags.request);
    return {
      input: { ...host, host, action: flags.action || flags.capability || parsed.positionals[0] || '', request },
      options: { allowRemoteWrite: Boolean(flags['allow-remote-write']) }
    };
  }
  if (parsed.command === 'accept-host-receipt') {
    const plan = await readOptionalJson(flags.plan || parsed.positionals[0]);
    const receipt = await readOptionalJson(flags.receipt || parsed.positionals[1]);
    return { input: { plan: plan.result || plan, receipt: receipt.result || receipt }, options: {} };
  }

  if (parsed.command === 'manufacture-handoff-package') {
    return prepareHandoffManufactureCliCommand(parsed, runtime);
  }
  if (parsed.command === 'describe-checkpoint-gate') return { input: { profile: flags.profile || parsed.positionals[0] || 'source-clean' }, options: {} };
  if (parsed.command === 'qualify-checkpoint') {
    const file = flags.receipt || flags.report || parsed.positionals[0] || flags.input;
    if (!file) throw new Error('portable.cli.checkpoint-qualification-file.required');
    const value = JSON.parse(await readFile(file, 'utf8'));
    return { input: value.qualificationInput || value.input || value, options: {} };
  }

  const explicitTargets = parsed.positionals.length ? parsed.positionals : flags.input ? [flags.input] : [];
  const schemaAwareOperations = new Set(['resolve-schema-material', 'resolve-schema-chain-material', 'describe-schema-chain', 'make-writer-brief', 'schema-guide', 'read-schema-section', 'plan-artifact', 'prepare-materialization', 'create-local-artifact-set', 'create-local-draft', 'update-local-draft', 'validate-draft', 'stage-draft', 'materialize-durable-findings', 'process-live-turn', 'export-live-lineage']);
  const defaultSchemaTargets = schemaAwareOperations.has(parsed.command) ? normalizeRuntimePaths(runtime.defaultSchemaMaterialPaths) : [];
  const schemaTargets = defaultSchemaTargets.filter((target) => !explicitTargets.includes(target));
  const operationsWithoutMaterial = new Set(['prepare-task', 'prepare-materialization', 'create-local-artifact-set', 'create-local-draft', 'plan-host-action', 'accept-host-receipt', 'describe-checkpoint-gate', 'qualify-checkpoint', 'describe-schema-chain', 'schema-guide', 'plan-artifact', 'list-material-providers', 'resolve-schema-material', 'resolve-schema-chain-material', 'materialize-durable-findings', 'build-runtime-package', 'roundtrip-runtime-package', 'describe-cold-start-ingress', 'project-cold-start-host', 'qualify-cold-start', 'ground-cold-consumer']);
  if (!explicitTargets.length && !schemaTargets.length && !operationsWithoutMaterial.has(parsed.command)) throw new Error('portable.cli.input.required');
  const loadOptions = { maxFiles: flags['max-files'], maxTextBytes: flags['max-text-bytes'] };
  const explicitMaterial = explicitTargets.length ? await loadCliExplicitMaterial(explicitTargets, parsed.command, flags, loadOptions) : emptyMaterial();
  const defaultSchemaMaterial = schemaTargets.length ? decorateDefaultSchemaMaterial(await loadNodePortableInput(schemaTargets, loadOptions), runtime.defaultSchemaSource) : emptyMaterial();
  const material = mergeLoadedMaterial(explicitMaterial, defaultSchemaMaterial);
  if (parsed.command === 'project-handoff-carrier-output') return {
    input: { ...material, route: flags.route || '', collisionInstance: flags['collision-instance'] || 1 },
    options: {}
  };
  const options = {
    startId: flags.start || '',
    direction: flags.direction || 'ancestors',
    maxDepth: flags.depth || 3,
    includeMarkdown: Boolean(flags['include-markdown']),
    includeSchemaMarkdown: flags['no-schema-markdown'] ? false : true
  };
  const host = await readOptionalJson(flags.host);
  const schemaCache = await readOptionalJson(flags.cache);
  if (parsed.command === 'ground-cold-consumer') {
    const interaction = await readOptionalJson(flags.interaction);
    const participantsValue = await readOptionalJson(flags.participants);
    const contributionsValue = await readOptionalJson(flags.contributions);
    const roleMaterialPath = String(flags['role-material'] || '').trim();
    const roleMaterials = roleMaterialPath ? [{ path: roleMaterialPath, markdown: await readFile(roleMaterialPath, 'utf8') }] : [];
    return {
      input: {
        ...material,
        bundle: material,
        host,
        ingressKind: flags.ingress || flags.kind || 'routed-handoff-package',
        route: flags.route || '',
        interaction: interaction.interaction || interaction,
        participants: participantsValue.participants || (Array.isArray(participantsValue) ? participantsValue : []),
        contributions: contributionsValue.contributions || (Array.isArray(contributionsValue) ? contributionsValue : []),
        currentContributionId: flags['current-contribution'] || '',
        roleMaterials,
        toolingAvailable: flags['tooling-unavailable'] ? false : true
      },
      options
    };
  }
  if (parsed.command === 'prepare-task') return {
    input: {
      ...material,
      host,
      schemaCache,
      task: flags.task || flags.intent || 'inspect',
      schemaId: flags.schema || '',
      query: flags.query || '',
      assetPath: flags.asset || '',
      path: flags.path || '',
      markdown: flags.draft ? (draftFromMaterial(material, flags.draft).markdown) : '',
      values: await readOptionalJson(flags.values),
      inputs: await readOptionalJson(flags.values)
    },
    options
  };
  if (parsed.command === 'materialize-durable-findings') {
    const session = await readOptionalJson(flags.session);
    const specsValue = await readOptionalJson(flags.specs);
    return {
      input: {
        ...material,
        session: session.session || session,
        materializations: specsValue.materializations || specsValue.specs || (Array.isArray(specsValue) ? specsValue : [])
      },
      options
    };
  }
  if (parsed.command === 'build-runtime-package' || parsed.command === 'roundtrip-runtime-package') {
    const session = await readOptionalJson(flags.session);
    const stagedValue = await readOptionalJson(flags.staged);
    return {
      input: {
        ...material,
        session: session.session || session,
        stagedArtifacts: stagedValue.stagedArtifacts || (Array.isArray(stagedValue) ? stagedValue : []),
        title: flags.title || '',
        workspaceId: flags['workspace-id'] || '',
        allowBlocked: Boolean(flags['allow-blocked']),
        includeDegraded: flags['exclude-degraded'] ? false : true
      },
      options
    };
  }
  if (parsed.command === 'list-material-providers') return {
    input: { ...material, host, schemaCache },
    options
  };
  if (parsed.command === 'resolve-schema-material') return {
    input: { ...material, host, schemaCache, schemaId: flags.schema || parsed.positionals[0] || '', repository: flags.repository || 'Tiinex/docs', ref: flags.ref || 'master' },
    options
  };
  if (parsed.command === 'resolve-schema-chain-material') return {
    input: { ...material, host, schemaCache, schemaId: flags.schema || parsed.positionals[0] || '', repository: flags.repository || 'Tiinex/docs', ref: flags.ref || 'master', maxDepth: flags.depth || 16 },
    options
  };
  if (parsed.command === 'make-writer-brief') return {
    input: { ...material, schemaId: flags.schema || '', transitionType: flags.transition || 'create-artifact' },
    options
  };
  if (parsed.command === 'describe-schema-chain') return {
    input: { ...material, schemaId: flags.schema || parsed.positionals[0] || '' },
    options
  };
  if (parsed.command === 'schema-guide') return {
    input: { ...material, schemaId: flags.schema || '', task: flags.task || 'read', detail: flags.detail || 'compact' },
    options
  };
  if (parsed.command === 'read-schema-section') return {
    input: { ...material, schemaId: flags.schema || '', sections: splitFlag(flags.section || flags.sections) },
    options: { ...options, maxChars: flags['max-chars'] || 12000 }
  };
  if (parsed.command === 'plan-artifact') return {
    input: { ...material, schemaId: flags.schema || '', task: flags.task || 'create', detail: flags.detail || 'compact', inputs: await readOptionalJson(flags.values) },
    options
  };
  if (parsed.command === 'prepare-materialization' || parsed.command === 'create-local-artifact-set') {
    const proposalDocument = await readOptionalJson(flags.proposals || flags.plan);
    const proposals = proposalDocument.proposals || proposalDocument.proposal || (Array.isArray(proposalDocument) ? proposalDocument : []);
    return { input: { ...material, proposals }, options };
  }
  if (parsed.command === 'create-local-draft') return {
    input: {
      ...material,
      schemaId: flags.schema || '',
      transitionType: flags.transition || 'create-artifact',
      path: flags.path || '',
      ...(Object.prototype.hasOwnProperty.call(flags, 'title') ? { title: flags.title } : {}),
      ...(Object.prototype.hasOwnProperty.call(flags, 'summary') ? { summary: flags.summary } : {}),
      ...(Object.prototype.hasOwnProperty.call(flags, 'why') ? { why: flags.why } : {}),
      ...(Object.prototype.hasOwnProperty.call(flags, 'authors') ? { authors: flags.authors } : {}),
      ...(Object.prototype.hasOwnProperty.call(flags, 'created-at') ? { createdAt: flags['created-at'] } : {}),
      schemaReferences: await readOptionalJson(flags.references || flags['schema-references']),
      values: await readOptionalJson(flags.values),
      sections: await readOptionalJson(flags.sections),
      parent: await readOptionalJson(flags.parent),
      allowIncomplete: Boolean(flags['allow-incomplete'])
    },
    options
  };
  if (parsed.command === 'update-local-draft') {
    const draft = draftFromMaterial(material, flags.draft || '');
    const replacementPath = String(flags.replacement || '').trim();
    if (!replacementPath) throw new Error('portable.cli.replacement-file.required');
    return {
      input: {
        ...material,
        draft: { ...draft, schemaId: flags.schema || draft.schemaId || '', sourceMode: 'local-portable-draft', source: null },
        replacementMarkdown: await readFile(replacementPath, 'utf8'),
        allowInvalid: Boolean(flags['allow-invalid']),
        allowSchemaChange: Boolean(flags['allow-schema-change']),
        allowContinuityChange: Boolean(flags['allow-continuity-change'])
      },
      options
    };
  }
  if (parsed.command === 'delete-local-draft') {
    const draft = draftFromMaterial(material, flags.draft || '');
    return {
      input: {
        draft: { ...draft, schemaId: flags.schema || draft.schemaId || '', sourceMode: 'local-portable-draft', source: null },
        confirmId: flags.confirm || '',
        reason: flags.reason || ''
      },
      options
    };
  }
  if (parsed.command === 'stage-draft') {
    const draft = draftFromMaterial(material, flags.draft || '');
    return { input: { ...material, draft: { ...draft, schemaId: flags.schema || draft.schemaId || '', sourceMode: 'local-portable-draft', source: null }, allowInvalid: Boolean(flags['allow-invalid']) }, options };
  }
  if (parsed.command === 'inspect-assets') return { input: material, options };
  if (parsed.command === 'prepare-asset-analysis') return {
    input: { ...material, assetPath: flags.asset || flags.path || '', host },
    options
  };
  if (parsed.command === 'validate-draft') {
    const draft = draftFromMaterial(material, flags.draft || '');
    return { input: { ...material, ...draft, schemaId: flags.schema || draft.schemaId || '' }, options };
  }
  if (parsed.command === 'search-lineage') return {
    input: {
      ...material,
      query: flags.query || '',
      scope: flags.scope || '',
      startId: flags.start || '',
      maxDepth: flags.depth || 16,
      filters: {
        schemaIds: splitFlag(flags.schema),
        parentSchemaIds: splitFlag(flags['parent-schema']),
        sourceModes: splitFlag(flags.source),
        paths: splitFlag(flags.path),
        relation: flags.relation || '',
        hasIntegrity: flags.integrity,
        hasContinuityContext: flags.continuity,
        findingSeverities: splitFlag(flags.finding),
        qualification: splitFlag(flags.qualification),
        searchFields: splitFlag(flags.fields),
        limit: flags.limit,
        offset: flags.offset,
        snippetChars: flags['snippet-chars']
      }
    },
    options
  };
  return { input: material, options };
}



const LEGACY_TOPICS_GROUNDING_COMMANDS = new Set(['inspect', 'audit', 'project-operating-overview', 'resolve-lineage', 'search-lineage', 'prepare-task']);

async function loadCliExplicitMaterial(targets = [], command = '', flags = {}, loadOptions = {}) {
  const loaded = [];
  for (const target of targets) {
    loaded.push(await loadNodePortableInput([target], cliGroundingLoadOptions(target, command, flags, loadOptions)));
  }
  return loaded.reduce((material, next) => mergeLoadedMaterial(material, next), emptyMaterial());
}

function cliGroundingLoadOptions(target = '', command = '', flags = {}, loadOptions = {}) {
  if (!LEGACY_TOPICS_GROUNDING_COMMANDS.has(String(command || ''))) return loadOptions;
  if (Boolean(flags['include-legacy-topics'])) return loadOptions;
  const normalized = path.resolve(String(target || '')).replace(/\\/g, '/');
  if (/\.zip$/i.test(normalized)) return loadOptions;
  if (/(?:^|\/)\.topics\/development(?:\/|$)/.test(normalized)) return loadOptions;
  const prefix = normalized.endsWith('/.topics') ? 'development' : '.topics/development';
  return { ...loadOptions, excludePathPrefixes: [prefix] };
}

async function loadCliMaterial(targets = [], runtime = {}, flags = {}) {
  const explicitTargets = normalizeRuntimePaths(targets);
  const schemaTargets = normalizeRuntimePaths(runtime.defaultSchemaMaterialPaths).filter((target) => !explicitTargets.includes(target));
  const loadOptions = { maxFiles: flags['max-files'], maxTextBytes: flags['max-text-bytes'] };
  const explicitMaterial = explicitTargets.length ? await loadNodePortableInput(explicitTargets, loadOptions) : emptyMaterial();
  const defaultSchemaMaterial = schemaTargets.length ? decorateDefaultSchemaMaterial(await loadNodePortableInput(schemaTargets, loadOptions), runtime.defaultSchemaSource) : emptyMaterial();
  return mergeLoadedMaterial(explicitMaterial, defaultSchemaMaterial);
}

async function readOptionalJson(file = '') {
  if (!file) return {};
  return JSON.parse(await readFile(file, 'utf8'));
}

function draftFromMaterial(material = {}, preferredPath = '') {
  const files = Array.isArray(material.files) ? material.files : [];
  const preferred = preferredPath ? files.find((file) => file.path === preferredPath || file.path.endsWith(preferredPath)) : null;
  const candidate = preferred || files.find((file) => !String(file.path || '').toLowerCase().endsWith('.schema.md') && typeof file.content === 'string') || files.find((file) => typeof file.content === 'string');
  if (!candidate) throw new Error('portable.cli.draft.required');
  return { path: candidate.path || 'draft.md', markdown: candidate.content || candidate.markdown || '', schemaId: '' };
}

function emptyMaterial() {
  return { files: [], findings: [], sourceMode: 'portable-node-local' };
}

function decorateDefaultSchemaMaterial(material = {}, source = {}) {
  const repository = String(source.repository || 'Tiinex/docs');
  const commit = String(source.commit || source.ref || '');
  const sourcePathPrefix = String(source.sourcePathPrefix || '.topics/.schemas').replace(/\/$/, '');
  return {
    ...material,
    files: (material.files || []).map((file) => ({
      ...file,
      sourceMode: 'portable-bootstrap-canonical-schema',
      source: markPortableBootstrapCanonicalSource({
        providerId: 'bootstrap-canonical-schema-pack',
        repository,
        ref: commit,
        commit,
        path: `${sourcePathPrefix}/${file.path}`,
        authority: 'canonical-core',
        qualification: 'bundled-byte-bound-canonical-snapshot',
        remoteFetch: false,
        cached: false
      })
    }))
  };
}

function mergeLoadedMaterial(primary = {}, secondary = {}) {
  return {
    files: [...(primary.files || []), ...(secondary.files || [])],
    findings: [...(primary.findings || []), ...(secondary.findings || [])],
    sourceMode: primary.files?.length ? primary.sourceMode : secondary.sourceMode || 'portable-node-local'
  };
}

function normalizeRuntimePaths(value) { const paths = Array.isArray(value) ? value : value ? [value] : []; return paths.map((entry) => String(entry || '').trim()).filter(Boolean); }
function splitFlag(value) { return !value || value === true ? [] : String(value).split(',').map((item) => item.trim()).filter(Boolean); }

function parseArgs(argv=[]) {
  const args=[...argv],first=args.shift()||'';
  if(first==='--help'||first==='-h') return {command:'help',flags:{help:true},positionals:[]};
  const command=({orient:'orient-handoff-package',receive:'qualify-cold-start',validate:'audit-handoff-package-context',handoff:'manufacture-handoff-package'})[first]||first;
  const flags={},positionals=[];
  while(args.length){const token=args.shift();if(!token.startsWith('--')){positionals.push(token);continue;}const key=token.slice(2);flags[key]=!args.length||args[0].startsWith('--')?true:args.shift();}
  return {command,flags,positionals};
}

function writeJson(io, value, pretty = true) { io.log(JSON.stringify(value, null, pretty ? 2 : 0)); }
