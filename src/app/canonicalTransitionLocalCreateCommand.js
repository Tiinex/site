import { buildCanonicalTransitionInvocationBindingPlan } from '../transitions/transition.invocationBindingPlanner.js';
import { buildCanonicalTransitionOutputMaterializationPlan } from '../transitions/transition.outputMaterializationPlanner.js';
import { finalizeCanonicalParentReference, prepareCanonicalTransitionProductActions, prepareCanonicalTransitionWorkspaceActions } from '../transitions/transition.productPreparation.js';
import { allocateContinuationPath, allocateRootArtifactPath } from '../transitions/record.transitions.js';
import { localArtifactMaterializerForSchema } from '../transitions/transition.localArtifactMaterializers.js';
import { durableLocalMutationDecision, DurableLocalMutationOperation } from './durableLocalMutationPolicy.js';

export const CANONICAL_TRANSITION_LOCAL_CREATE_COMMAND_SCHEMA_ID = 'tiinex.site.canonical-transition-local-create-command.v1';

export function executeCanonicalTransitionLocalCreate(input = {}) {
  const state = input.state || {};
  const workspace = (state.workspaces || []).find((item) => item.id === input.workspaceId);
  if (!workspace) return refusal('workspace-not-found', state, 'Artifact cannot be created because the target workspace is unavailable.');

  const requestedRecordId = String(input.currentRecordId || '').trim();
  const currentRecord = requestedRecordId ? (workspace.records || []).find((item) => item.id === requestedRecordId) : null;
  if (requestedRecordId && !currentRecord) return refusal('source-record-not-found', state, 'Artifact cannot be created because the selected source artifact is unavailable.');
  const beforeSource = currentRecord ? stableJson(currentRecord) : '';

  const preparation = currentRecord
    ? prepareCanonicalTransitionProductActions({
      currentRecord,
      workspaceRecords: workspace.records || [],
      workspaceId: workspace.id,
      schemaCache: input.schemaCache,
      bundledDefinitions: input.bundledDefinitions
    })
    : prepareCanonicalTransitionWorkspaceActions({
      workspaceId: workspace.id,
      schemaCache: input.schemaCache,
      bundledDefinitions: input.bundledDefinitions
    });
  const actionMatches = (preparation.actions || []).filter((candidate) => candidate.definitionKey === input.definitionKey);
  if (actionMatches.length !== 1) return refusal('canonical-definition-key-not-unique', state, 'Artifact cannot be created because the canonical Transition execution key does not identify exactly one definition.');
  const action = actionMatches[0];
  if (!action?.productCapable) return refusal('canonical-create-capability-unavailable', state, productFailureNotice(action));

  const continuityMode = action.continuityMode === 'root' ? 'root' : 'parent';
  if (continuityMode === 'root' && currentRecord) return refusal('canonical-root-create-source-unexpected', state, 'Standalone artifact creation cannot bind a selected source artifact.');
  if (continuityMode === 'parent' && !currentRecord) return refusal('canonical-parent-create-source-required', state, 'Continuation artifact creation requires the selected source artifact.');

  const definition = action.definition;
  const result = action.resultSemantics;
  const output = result.outputRoles?.[0];
  const outputSchemaId = String(output?.schemaConstraint || '').trim();
  const materializer = localArtifactMaterializerForSchema(outputSchemaId);
  if (!materializer) return refusal('canonical-local-materializer-unavailable', state, `No qualified browser-local materializer is available for ${outputSchemaId || 'this output schema'}.`);
  const parentEffect = result.parentEffects?.[0] || null;
  const placement = result.outputPlacements?.[0];
  const destination = result.destinationBindings?.[0];
  const sourceRole = parentEffect?.parentBinding?.resolvedName || '';
  const fixedInputs = action.authoring?.fixedInputs || {};
  const values = Object.freeze({ ...(input.values || {}), ...fixedInputs });
  const outputTitle = canonicalOutputTitle(action, values, materializer.label);
  const packet = {
    inputRoles: continuityMode === 'parent'
      ? [{ role: sourceRole, members: [{ bindingId: 'current-artifact-1', participantId: action.currentParticipant?.identity?.id || '' }] }]
      : [],
    destinations: [{ name: destination?.name || '', value: workspace.id }],
    naming: [{ placement: placement?.name || '', value: outputTitle }],
    memberAssociations: []
  };
  const bindingPlan = buildCanonicalTransitionInvocationBindingPlan({
    definition,
    participantIndex: preparation.participantIndex,
    currentArtifact: action.currentParticipant,
    bindingPacket: packet
  });
  const generationInputs = (action.authoring?.requiredInputs || []).map((name) => ({ outputRole: output?.name || '', name, value: values[name] }));
  const schemaById = Object.fromEntries((preparation.cacheQualification?.entries || []).map((item) => [item.schemaId, item]));
  const targetSchemaMaterials = [schemaById['tiinex.root.v1']?.markdown || '', schemaById[outputSchemaId]?.markdown || ''];
  const targetSchemaAuthorities = [{ outputRole: output?.name || '', materials: targetSchemaMaterials }];
  const v423 = buildCanonicalTransitionOutputMaterializationPlan({
    definition,
    participantIndex: preparation.participantIndex,
    currentArtifact: action.currentParticipant,
    bindingPacket: packet,
    generationInputs,
    targetSchemaAuthorities
  });
  if (bindingPlan.qualification !== 'qualified' || v423.qualification !== 'qualified') {
    return refusal(
      v423.qualification === 'incomplete' ? 'canonical-create-input-incomplete' : 'canonical-create-plan-not-qualified',
      state,
      v423.qualification === 'incomplete' ? `Complete every required ${materializer.label} field before creating the local artifact.` : `${materializer.label} cannot be created because its canonical Transition plan is not fully qualified.`,
      { bindingPlan, v423 }
    );
  }

  const capability = executionCapability({ action, v423, workspace, outputSchemaId, materializer, continuityMode });
  if (!capability.ok) return refusal(capability.error, state, capability.notice, { bindingPlan, v423, capability });

  const allocation = continuityMode === 'root'
    ? allocateRootArtifactPath({ targetId: outputSchemaId, targetLabel: materializer.label, title: outputTitle }, { workspaceRecords: workspace.records || [] })
    : allocateContinuationPath({ parentRecord: currentRecord, targetId: outputSchemaId, targetLabel: materializer.label, title: outputTitle }, { workspaceRecords: workspace.records || [] });
  const concretePath = allocation.path || '';
  if (!concretePath) return refusal('canonical-local-path-allocation-unavailable', state, `${materializer.label} cannot be created because its browser-local path could not be allocated.`, { bindingPlan, v423 });

  const parent = continuityMode === 'root' ? null : finalizeCanonicalParentReference(action.parentRecovery, concretePath);
  if (continuityMode === 'parent' && (parent?.state !== 'qualified' || parent?.finalized !== true)) {
    return refusal(parent?.reason || 'canonical-parent-finalization-unavailable', state, `${materializer.label} cannot be created because its Parent reference could not be finalized truthfully.`, { bindingPlan, v423 });
  }
  const rendered = materializer.render({ values, parent, continuityMode, now: input.now });
  if (rendered.state !== 'rendered') return refusal(rendered.reason, state, `${materializer.label} could not be rendered from the qualified canonical creation values.`, { bindingPlan, v423 });
  const artifactQualification = materializer.qualify({ markdown: rendered.markdown, schemaMaterials: targetSchemaMaterials, values, parent, continuityMode, path: concretePath });
  if (artifactQualification.state !== 'qualified') return refusal(artifactQualification.reason, state, `${materializer.label} could not be created because the rendered Artifact did not satisfy its canonical schema contract.`, { bindingPlan, v423, artifactQualification, taskQualification: artifactQualification });

  const authority = durableLocalMutationDecision(input.persistenceOwnership, DurableLocalMutationOperation.localDraftCreate);
  if (!authority.ok) return refusal(authority.error || 'local-mutation-not-authorized', state, authority.notice || `Local ${materializer.label} creation is not available in this session.`, { bindingPlan, v423, artifactQualification, taskQualification: artifactQualification, authority });
  if (!input.lifecycle?.addWorkspaceRecord) return refusal('workspace-lifecycle-unavailable', state, `${materializer.label} cannot be created because the local workspace lifecycle is unavailable.`);
  const candidate = Object.assign({}, artifactQualification.record, {
    sourceMode: 'local-transition-canonical',
    path: concretePath,
    transitionMaterialization: {
      schema: CANONICAL_TRANSITION_LOCAL_CREATE_COMMAND_SCHEMA_ID,
      canonicalIdentifier: action.canonicalIdentifier,
      remoteWrite: false,
      sourceMutation: false,
      concretePath,
      continuityMode,
      relationMaterialization: false
    }
  });
  delete candidate.source;
  delete candidate.sourceTarget;
  const committed = input.lifecycle.addWorkspaceRecord(state, workspace.id, candidate, { clock: input.clock });
  if (!committed?.ok) return refusal(committed?.error || 'workspace-mutation-failed', state, `${materializer.label} could not be added to the browser-local workspace.`, { bindingPlan, v423, artifactQualification, taskQualification: artifactQualification });

  if (currentRecord) {
    const afterSource = (committed.workspace?.records || []).find((item) => item.id === currentRecord.id);
    if (stableJson(afterSource) !== beforeSource) {
      return refusal('post-mutation-source-boundary-violation', state, `${materializer.label} creation was refused because the selected source artifact boundary did not remain isolated.`, { bindingPlan, v423, artifactQualification, taskQualification: artifactQualification });
    }
  }
  const createdSource = committed.record?.source || {};
  if (createdSource.adapterId === 'github' || createdSource.repository || createdSource.repo || createdSource.ref || committed.record?.sourceTarget) {
    return refusal('post-mutation-source-boundary-violation', state, `${materializer.label} creation was refused because the browser-local artifact inherited source provenance.`, { bindingPlan, v423, artifactQualification, taskQualification: artifactQualification });
  }

  return Object.freeze({
    ok: true,
    schema: CANONICAL_TRANSITION_LOCAL_CREATE_COMMAND_SCHEMA_ID,
    state: committed.state,
    workspace: committed.workspace,
    record: committed.record,
    bindingPlan,
    v423,
    artifactQualification,
    taskQualification: artifactQualification,
    remoteWrite: false,
    sourceMutation: false,
    concretePath,
    continuityMode,
    relationMaterialization: false,
    notice: continuityMode === 'root'
      ? `Created standalone local ${materializer.label} in ${workspace.name || workspace.title || 'workspace'}.`
      : `Created local ${materializer.label} from ${currentRecord.title || 'selected artifact'}.`
  });
}

function executionCapability({ action, v423, workspace, outputSchemaId, materializer, continuityMode = 'parent' }) {
  const output = v423.outputRolePlans?.[0];
  const lifecycle = output?.lifecycle || {};
  const placement = output?.placements?.[0] || {};
  const parent = action.resultSemantics?.parentEffects?.[0] || null;
  const inputRole = (action.availability?.inputRoles || []).find((role) => role.name === parent?.parentBinding?.resolvedName);
  const inputSchemaId = String(inputRole?.schemaConstraint || '').trim();
  const common = v423.outputRolePlans?.length === 1
    && output?.outputCount?.exactCount === 1
    && output?.effectiveParticipantKind === 'artifact'
    && output?.schemaConstraint === outputSchemaId
    && materializer?.schemaId === outputSchemaId
    && materializer?.continuityModes?.includes?.(continuityMode)
    && output?.generation?.authority === 'target-schema'
    && output?.generation?.state === 'resolved'
    && lifecycle.requestedOperation === 'create'
    && placement.placementIntent === 'new-materialization'
    && placement.destinationValue === workspace.id
    && placement.naming?.authority === 'explicit-binding'
    && placement.naming?.state === 'resolved'
    && placement.concretePath === null
    && action.resultSemantics?.relationEffects?.length === 0;
  const continuity = continuityMode === 'root'
    ? action.resultSemantics?.parentEffects?.length === 0 && (action.availability?.inputRoles || []).length === 0 && !action.currentParticipant
    : parent?.effect === 'set'
      && parent?.parentBinding?.qualification === 'resolved'
      && Boolean(inputSchemaId)
      && action.parentRecovery?.state === 'qualified'
      && action.parentRecovery?.schemaId === inputSchemaId;
  const supported = Boolean(common && continuity);
  return Object.freeze({ ok: supported, error: supported ? '' : 'canonical-local-create-pattern-unsupported', notice: supported ? '' : `${materializer?.label || 'Artifact'} cannot be created because this canonical Transition is outside the supported browser-local create capability.` });
}

function canonicalOutputTitle(action = {}, values = {}, fallback = 'Artifact') {
  const summary = String(values.Summary || '').trim();
  if (summary) return summary;
  const targetRole = String(values['Target Role'] || '').trim();
  const interpretationAction = String(values['Interpretation Action'] || '').trim();
  if (targetRole || interpretationAction) return `${interpretationAction || action.label || 'Use as'} ${targetRole || fallback}`.trim();
  return String(action.label || fallback || 'Artifact').trim() || 'Artifact';
}
function productFailureNotice(action) {
  const label = action?.authoring?.schemaLabel || 'Artifact';
  if (action?.continuityMode !== 'root' && action?.parentRecovery?.state !== 'qualified') return `${label} cannot be created because the selected source artifact cannot be referenced safely.`;
  return `${label} cannot be created because the canonical Transition is not currently product-capable.`;
}
function refusal(error, state, notice, extra = {}) { return Object.freeze({ ok: false, schema: CANONICAL_TRANSITION_LOCAL_CREATE_COMMAND_SCHEMA_ID, error, state, notice, ...extra, remoteWrite: false, sourceMutation: false, concretePath: null, relationMaterialization: false }); }
function stableJson(value) { return JSON.stringify(value ?? null); }
