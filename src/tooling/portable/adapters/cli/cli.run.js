import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { listPortableOperations, runPortableOperation } from '../../operation.catalog.js';
import { writePortableRuntimePackageZip } from '../../output/node.zip.js';
import { materializeCliArtifactSetResult, materializeCliLocalDraftResult } from './cli.local-output.js';
import { portableCliHelpText } from './cli.help.js';
import { materializeHandoffManufactureCliOutput } from './cli.handoff-manufacture.js';
import { commandInput } from './cli.command-input.js';
import { continueGroundWithHostResult } from './cli.ground-recovery.js';
import { groundContinuationOperationInput, materializeGroundWorkspaceCliOutput } from './cli.ground-materialize.js';
import { runCommonAuthorCli } from './cli.common-author.js';

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
    if (parsed.command === 'author') {
      const result = await runCommonAuthorCli(parsed, runtime);
      writeJson(io, result, parsed.flags.compact !== true);
      return result?.findingSummary?.counts?.error ? 2 : 0;
    }
    const timingEnabled = Boolean(parsed.flags['phase-timing']);
    const totalStartedAt = timingEnabled ? monotonicNowMs() : 0;

    const inputStartedAt = timingEnabled ? monotonicNowMs() : 0;
    const { input, options } = await commandInput(parsed, runtime);
    const operationInput = parsed.command === 'project-grounding-readiness'
      ? groundContinuationOperationInput(input, parsed.flags)
      : input;
    const inputPreparationMs = timingEnabled ? elapsedMs(inputStartedAt) : 0;

    const operationStartedAt = timingEnabled ? monotonicNowMs() : 0;
    let result = await runPortableOperation(parsed.command, operationInput, options);
    let commonPathOutput = null;
    if (parsed.command === 'project-grounding-readiness' && parsed.flags['host-result']) {
      const continued = await continueGroundWithHostResult(result, operationInput, options, parsed.flags);
      result = continued.result;
      commonPathOutput = continued.output;
    }
    const operationExecutionMs = timingEnabled ? elapsedMs(operationStartedAt) : 0;

    const materializationStartedAt = timingEnabled ? monotonicNowMs() : 0;
    let output = commonPathOutput || result;
    if (parsed.command === 'manufacture-handoff-package' && (parsed.flags.output || parsed.flags['output-dir'])) {
      output = await materializeHandoffManufactureCliOutput(result, parsed.flags);
    } else if (parsed.command === 'project-grounding-readiness' && (parsed.flags.continue || parsed.flags['materialize-workspace'] || parsed.flags['workspace-output'])) {
      output = await materializeGroundWorkspaceCliOutput(output, operationInput, parsed.flags);
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


function parseArgs(argv=[]) {
  const args=[...argv],first=args.shift()||'';
  if(first==='--help'||first==='-h') return {command:'help',flags:{help:true},positionals:[]};
  const command=({orient:'orient-handoff-package',ground:'project-grounding-readiness',receive:'qualify-cold-start',validate:'audit-handoff-package-context',handoff:'manufacture-handoff-package',author:'author'})[first]||first;
  const flags={},positionals=[];
  while(args.length){const token=args.shift();if(!token.startsWith('--')){positionals.push(token);continue;}const key=token.slice(2);flags[key]=!args.length||args[0].startsWith('--')?true:args.shift();}
  return {command,flags,positionals,surfaceCommand:first};
}

function writeJson(io, value, pretty = true) { io.log(JSON.stringify(value, null, pretty ? 2 : 0)); }
