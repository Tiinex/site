const COMMON_DEFAULT_PROJECTION = 'common-default';

export function projectCommonCliDefaultOutput(result = {}, parsed = {}) {
  if (parsed?.flags?.full === true) return result;
  if (parsed?.command === 'orient-handoff-package') return projectOrientDefault(result, parsed);
  if (parsed?.command === 'project-grounding-readiness') return projectGroundDefault(result, parsed);
  if (parsed?.command === 'manufacture-handoff-package' && parsed?.surfaceCommand === 'handoff') return projectHandoffDefault(result, parsed);
  return result;
}

function projectOrientDefault(result = {}, parsed = {}) {
  const projection = result?.entrypoint?.projection || {};
  const routes = (result.routes || projection.routes || []).map(projectOrientRoute);
  const workspaces = (result.workspaces || projection.workspaces || []).map((workspace) => Object.freeze({
    id: String(workspace?.id || ''),
    title: String(workspace?.title || ''),
    qualification: String(workspace?.qualification || '')
  }));
  const actionableFindings = actionable(result);
  const selected = routes.find((route) => route.pointerPath) || routes[0] || {};
  return Object.freeze({
    schema: result.schema,
    operation: result.operation || 'orient-handoff-package',
    resultSchema: result.resultSchema,
    projection: COMMON_DEFAULT_PROJECTION,
    status: result.status,
    workspaces: Object.freeze(workspaces),
    routes: Object.freeze(routes),
    selection: result.selection || projection.selection || null,
    authority: projection.authority ? Object.freeze({ ...projection.authority }) : null,
    carrierLineage: compactCarrierLineage(result.carrierLineage),
    nextAction: selected.pointerPath ? Object.freeze({
      command: 'ground',
      package: sourceArgument(parsed),
      route: selected.pointerPath
    }) : null,
    findingSummary: result.findingSummary || null,
    actionableFindings: Object.freeze(actionableFindings.slice(0, 20)),
    actionableFindingsOmitted: Math.max(0, actionableFindings.length - 20),
    detail: detailReceipt(parsed),
    boundary: 'Common default orientation projection. It preserves route/workspace qualification, selection, non-authority, actionable findings, and the exact grounding route while moving package topology, endpoint-role, and closure receipts behind --full.'
  });
}

function projectGroundDefault(result = {}, parsed = {}) {
  const required = result?.coverage?.requiredContext || {};
  const currentWork = result?.currentWork || {};
  const continuity = result?.continuity || {};
  const actionableFindings = actionable(result);
  const continuing = typeof parsed?.flags?.continue === 'string' && parsed.flags.continue.length > 0;
  const explicitRequiredBodies = typeof parsed?.flags?.['include-required-context'] === 'string' && parsed.flags['include-required-context'].length > 0;
  return Object.freeze({
    schema: result.schema,
    operation: result.operation || 'project-grounding-readiness',
    resultSchema: result.resultSchema,
    projection: COMMON_DEFAULT_PROJECTION,
    status: result.status,
    readiness: compactReadiness(result.readiness),
    authority: compactGroundAuthority(result.authority),
    requiredContext: Object.freeze({
      declared: Number(required.declared || 0),
      matchedInWorkspaceSnapshots: Number(required.matchedInWorkspaceSnapshots || 0),
      missingFromWorkspaceSnapshots: Number(required.missingFromWorkspaceSnapshots || 0),
      items: Object.freeze((continuing && !explicitRequiredBodies ? [] : (required.items || [])).map(projectRequiredContextItem)),
      itemsOmitted: Number(required.itemsOmitted || 0) + (continuing && !explicitRequiredBodies ? (required.items || []).length : 0),
      bodiesProjected: Number(required.bodiesProjected || 0),
      bodiesAvailable: Number(required.bodiesAvailable || 0)
    }),
    capsule: result.capsule ? Object.freeze({ ...result.capsule }) : null,
    currentWork: Object.freeze({
      state: String(currentWork.state || ''),
      frontier: Object.freeze((currentWork.frontier || []).map(projectCurrentWorkItem)),
      frontierOmitted: Number(currentWork.frontierOmitted || 0),
      blockers: Object.freeze((currentWork.blockers || []).slice(0, 20).map((item) => Object.freeze({ ...item }))),
      blockersOmitted: Number(currentWork.blockersOmitted || 0) + Math.max(0, (currentWork.blockers || []).length - 20)
    }),
    continuity: compactContinuity(continuity, { continuing }),
    ...(result.continuationMaterialization ? { continuationMaterialization: Object.freeze({ ...result.continuationMaterialization }) } : {}),
    findingSummary: result.findingSummary || null,
    actionableFindings: Object.freeze(actionableFindings.slice(0, 20)),
    actionableFindingsOmitted: Math.max(0, actionableFindings.length - 20),
    detail: detailReceipt(parsed),
    boundary: result.boundary || 'Decision-oriented common default grounding projection. Full qualified receipt remains available with --full.'
  });
}

function projectHandoffDefault(result = {}, parsed = {}) {
  const human = result.humanOutput || {};
  const primary = result.primaryOutput || null;
  const plan = result.planSummary || {};
  const carrier = result.carrierProjection || {};
  const route = (carrier.routes || [])[0] || {};
  const actionableFindings = actionable(result);
  return Object.freeze({
    schema: result.schema,
    operation: result.operation || 'manufacture-handoff-package',
    resultSchema: result.resultSchema,
    projection: COMMON_DEFAULT_PROJECTION,
    status: result.status,
    verification: result.verification ? Object.freeze({ ...result.verification }) : null,
    closure: Object.freeze({
      status: String(plan.status || ''),
      requiredClosureReady: Boolean(plan.requiredClosureReady),
      semanticHandoffStatus: String(plan.semanticHandoffStatus || ''),
      requiredCount: Array.isArray(plan.required) ? plan.required.length : 0,
      referenceCount: Array.isArray(plan.reference) ? plan.reference.length : 0,
      workspaces: Object.freeze((plan.workspaces || []).map((workspace) => Object.freeze({
        id: String(workspace.id || ''),
        materialization: String(workspace.materialization || ''),
        qualification: String(workspace.qualification || ''),
        entryCount: Number(workspace.entryCount || 0),
        completenessState: String(workspace.completenessState || '')
      })))
    }),
    carrier: Object.freeze({
      status: String(carrier.status || ''),
      mode: String(carrier.mode || ''),
      lineage: carrier.lineage ? compactCarrierLineage(carrier.lineage) : null,
      route: Object.freeze({
        id: String(route.id || ''),
        state: String(route.state || ''),
        workspaceId: String(route.workspaceId || ''),
        workspaceRelativePath: String(route.workspaceRelativePath || ''),
        from: String(route.from || ''),
        to: String(route.to || ''),
        projectedFilename: String(route.projectedFilename || '')
      })
    }),
    transport: Object.freeze({
      primary: primary ? Object.freeze({ ...primary }) : null,
      routing: human.normalInlineRouting ? Object.freeze({ ...human.normalInlineRouting }) : null,
      sharedRouting: human.sharedRouting ? Object.freeze({ ...human.sharedRouting, routes: Object.freeze((human.sharedRouting.routes || []).map((item) => Object.freeze({ ...item }))) }) : null,
      presentation: compactHandoffPresentation(human.presentation),
      normalEmission: compactHandoffNormalEmission(human.normalEmissionBoundary)
    }),
    roundtripSummary: result.roundtripSummary ? Object.freeze({ ...result.roundtripSummary }) : null,
    toolingBootstrapInspection: result.toolingBootstrapInspection ? Object.freeze({
      status: String(result.toolingBootstrapInspection.status || ''),
      delivery: String(result.toolingBootstrapInspection.delivery || ''),
      counts: Object.freeze({ ...(result.toolingBootstrapInspection.counts || {}) })
    }) : null,
    operationBoundary: result.operationBoundary ? Object.freeze({ ...result.operationBoundary }) : null,
    findingSummary: result.findingSummary || null,
    actionableFindings: Object.freeze(actionableFindings.slice(0, 20)),
    actionableFindingsOmitted: Math.max(0, actionableFindings.length - 20),
    detail: detailReceipt(parsed),
    boundary: 'Common default Handoff manufacture projection. Normal operator completion is one canonical Handoff package plus the exact adjacent routing content; markdown-capable hosts must render that routing in a fenced code block. Canonical Workspace Evidence/Handoff artifacts remain inside the carrier and are not additional loose transport payloads. Full manufacturing evidence remains available behind --full.'
  });
}


function compactHandoffPresentation(presentation = {}) {
  if (!presentation || typeof presentation !== 'object') return null;
  return Object.freeze({
    copyableSurfaceRequired: Boolean(presentation.copyableSurfaceRequired),
    exactContentRequired: Boolean(presentation.exactContentRequired),
    fencedCodeBlockWhenSupported: String(presentation.fencedCodeBlockWhenSupported || ''),
    markdownCapableHostRendering: String(presentation.markdownCapableHostRendering || ''),
    wrapperAuthority: String(presentation.wrapperAuthority || '')
  });
}

function compactHandoffNormalEmission(boundary = {}) {
  if (!boundary || typeof boundary !== 'object') return null;
  return Object.freeze({
    allowed: Object.freeze([...(boundary.allowed || [])]),
    canonicalFilePayloadCount: Number(boundary.canonicalFilePayloadCount || 0),
    workspaceArtifactsAsLooseTransportFiles: Boolean(boundary.workspaceArtifactsAsLooseTransportFiles),
    semanticWorkSummaryProse: Boolean(boundary.semanticWorkSummaryProse),
    helperArtifacts: Boolean(boundary.helperArtifacts),
    manuallyReconstructedRouting: Boolean(boundary.manuallyReconstructedRouting),
    duplicateNormalFileChoices: Boolean(boundary.duplicateNormalFileChoices)
  });
}

function projectOrientRoute(route = {}) {
  return Object.freeze({
    id: String(route.id || ''),
    state: String(route.state || ''),
    workspaceId: String(route.workspaceId || ''),
    workspaceRelativeHandoffPath: String(route.workspaceRelativeHandoffPath || ''),
    from: String(route.from || ''),
    to: String(route.to || ''),
    pointerPath: String(route.pointerPath || '')
  });
}

function compactReadiness(readiness = {}) {
  return Object.freeze({
    state: String(readiness.state || ''),
    reasons: Object.freeze((readiness.reasons || []).map((item) => Object.freeze({
      code: String(item?.code || ''),
      message: String(item?.message || '')
    }))),
    missingEvidence: Object.freeze([...(readiness.missingEvidence || [])]),
    nextAction: readiness.nextAction ? Object.freeze({ ...readiness.nextAction }) : null
  });
}

function compactGroundAuthority(authority = {}) {
  const route = authority.route || {};
  const handoff = authority.handoff || {};
  const role = authority.role || {};
  const holderBinding = authority.holderBinding || {};
  const operationBoundary = authority.operationBoundary || {};
  return Object.freeze({
    state: String(authority.state || ''),
    route: Object.freeze({
      id: String(route.id || ''),
      pointerPath: String(route.pointerPath || ''),
      workspaceId: String(route.workspaceId || '')
    }),
    handoff: Object.freeze({
      purpose: String(handoff.purpose || ''),
      from: String(handoff.from || ''),
      to: String(handoff.to || ''),
      completionExpectation: handoff.completionExpectation || null
    }),
    role: Object.freeze({
      state: String(role.state || ''),
      label: String(role.label || ''),
      kind: String(role.kind || '')
    }),
    holderBinding: Object.freeze({
      state: String(holderBinding.state || ''),
      holderId: String(holderBinding.holderId || ''),
      roleLabel: String(holderBinding.roleLabel || ''),
      recipientRoleLabel: String(holderBinding.recipientRoleLabel || ''),
      recipientCompatibility: String(holderBinding.recipientCompatibility || ''),
      source: String(holderBinding.source || ''),
      explicit: Boolean(holderBinding.explicit),
      inferredFromTransport: Boolean(holderBinding.inferredFromTransport)
    }),
    operationBoundary: Object.freeze({
      sourceMutation: Boolean(operationBoundary.sourceMutation),
      remoteWrite: Boolean(operationBoundary.remoteWrite),
      semanticAuthority: String(operationBoundary.semanticAuthority || ''),
      boundary: String(operationBoundary.boundary || '')
    })
  });
}

function projectRequiredContextItem(item = {}) {
  const contentProjected = Boolean(item.contentProjected && typeof item.content === 'string');
  return Object.freeze({
    requirementId: String(item.requirementId || ''),
    name: String(item.name || ''),
    state: String(item.state || ''),
    workspaceId: String(item.workspaceId || ''),
    innerPath: String(item.innerPath || ''),
    contentProjected,
    ...(contentProjected ? { content: item.content } : {})
  });
}

function projectCurrentWorkItem(item = {}) {
  const contentProjected = Boolean(item.contentProjected && typeof item.content === 'string');
  return Object.freeze({
    id: String(item.id || ''),
    path: String(item.path || ''),
    title: String(item.title || ''),
    declaredStatus: String(item.declaredStatus || ''),
    ...(contentProjected ? { contentProjected: true, content: item.content } : { contentProjected: false })
  });
}

function compactContinuity(continuity = {}, options = {}) {
  const proof = continuity.proof || {};
  const roots = proof.roots || [];
  const continuing = Boolean(options.continuing);
  return Object.freeze({
    state: String(continuity.state || ''),
    roots: Object.freeze((continuing ? [] : roots).map((root) => Object.freeze({
      id: String(root.id || ''),
      path: String(root.path || ''),
      title: String(root.title || ''),
      schemaId: String(root.schemaId || ''),
      declaresParent: Boolean(root.declaresParent),
      hasContinuityContext: Boolean(root.hasContinuityContext),
      hasIntegrity: Boolean(root.hasIntegrity)
    }))),
    ...(continuing ? { rootsOmitted: roots.length } : {}),
    blockingIssues: Object.freeze([...(continuity.blockingIssues || [])]),
    blockingIssuesOmitted: Number(continuity.blockingIssuesOmitted || 0),
    recovery: continuity.recovery ? Object.freeze({ ...continuity.recovery }) : null,
    losses: continuity.losses ? Object.freeze({
      state: String(continuity.losses.state || ''),
      blocking: Boolean(continuity.losses.blocking),
      items: Object.freeze([...(continuity.losses.items || [])]),
      itemsOmitted: Number(continuity.losses.itemsOmitted || 0)
    }) : null
  });
}

function compactCarrierLineage(lineage = {}) {
  if (!lineage || typeof lineage !== 'object') return null;
  return Object.freeze({
    mode: String(lineage.mode || ''),
    dimension: String(lineage.dimension || ''),
    parentDimension: String(lineage.parentDimension || ''),
    checkpointKind: String(lineage.checkpointKind || ''),
    authority: String(lineage.authority || '')
  });
}

function actionable(result = {}) {
  const explicit = Array.isArray(result.actionableFindings) ? result.actionableFindings : [];
  if (explicit.length) return explicit.map((item) => Object.freeze({ ...item }));
  return (result.findings || [])
    .filter((item) => item?.severity === 'error' || item?.severity === 'warning')
    .map((item) => Object.freeze({ ...item }));
}

function detailReceipt(parsed = {}) {
  const flags = parsed.flags || {};
  return Object.freeze({
    fullReceipt: Object.freeze({
      command: String(parsed.surfaceCommand || parsed.command || ''),
      package: sourceArgument(parsed),
      workspace: parsed?.surfaceCommand === 'handoff' ? sourceArgument(parsed) : '',
      route: typeof flags.route === 'string' ? flags.route : '',
      continue: typeof flags.continue === 'string' ? flags.continue : '',
      flag: '--full'
    })
  });
}

function sourceArgument(parsed = {}) {
  return String(parsed.positionals?.[0] || '');
}
