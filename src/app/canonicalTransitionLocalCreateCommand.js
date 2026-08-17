import { buildCanonicalTransitionInvocationBindingPlan } from '../transitions/transition.invocationBindingPlanner.js';
import { buildCanonicalTransitionOutputMaterializationPlan } from '../transitions/transition.outputMaterializationPlanner.js';
import { prepareCanonicalTransitionProductActions } from '../transitions/transition.productPreparation.js';
import { qualifyCanonicalTaskLocalArtifact, renderCanonicalTaskLocalArtifact } from '../transitions/transition.taskMaterializer.js';
import { durableLocalMutationDecision, DurableLocalMutationOperation } from './durableLocalMutationPolicy.js';

export const CANONICAL_TRANSITION_LOCAL_CREATE_COMMAND_SCHEMA_ID = 'tiinex.site.canonical-transition-local-create-command.v1';

export function executeCanonicalTransitionLocalCreate(input = {}) {
  const state = input.state || {};
  const workspace = (state.workspaces || []).find((item) => item.id === input.workspaceId);
  if (!workspace) return refusal('workspace-not-found', state, 'Task cannot be created because the target workspace is unavailable.');
  const currentRecord = (workspace.records || []).find((item) => item.id === input.currentRecordId);
  if (!currentRecord) return refusal('source-record-not-found', state, 'Task cannot be created because the source Topic is unavailable.');
  const beforeSource = stableJson(currentRecord);
  const preparation = prepareCanonicalTransitionProductActions({ currentRecord, workspaceRecords: workspace.records || [], workspaceId: workspace.id, schemaCache: input.schemaCache, bundledDefinitions: input.bundledDefinitions });
  const actionMatches = (preparation.actions || []).filter((candidate) => candidate.definitionKey === input.definitionKey);
  if (actionMatches.length !== 1) return refusal('canonical-definition-key-not-unique', state, 'Task cannot be created because the canonical Transition execution key does not identify exactly one definition.');
  const action = actionMatches[0];
  if (!action?.productCapable) return refusal('canonical-create-capability-unavailable', state, productFailureNotice(action));

  const definition = action.definition;
  const result = action.resultSemantics;
  const output = result.outputRoles?.[0];
  const parentEffect = result.parentEffects?.[0];
  const placement = result.outputPlacements?.[0];
  const destination = result.destinationBindings?.[0];
  const sourceRole = parentEffect?.parentBinding?.resolvedName || '';
  const packet = {
    inputRoles: [{ role: sourceRole, members: [{ bindingId: 'source-topic-1', participantId: action.currentParticipant?.identity?.id || '' }] }],
    destinations: [{ name: destination?.name || '', value: workspace.id }],
    naming: [{ placement: placement?.name || '', value: input.values?.Summary }],
    memberAssociations: []
  };
  const bindingPlan = buildCanonicalTransitionInvocationBindingPlan({ definition, participantIndex: preparation.participantIndex, currentArtifact: action.currentParticipant, bindingPacket: packet });
  const generationInputs = (action.authoring?.requiredInputs || []).map((name) => ({ outputRole: output?.name || '', name, value: input.values?.[name] }));
  const schemaById = Object.fromEntries((preparation.cacheQualification?.entries || []).map((item) => [item.schemaId, item]));
  const targetSchemaAuthorities = [{ outputRole: output?.name || '', materials: [schemaById['tiinex.root.v1']?.markdown || '', schemaById['tiinex.task.v1']?.markdown || ''] }];
  const v423 = buildCanonicalTransitionOutputMaterializationPlan({ definition, participantIndex: preparation.participantIndex, currentArtifact: action.currentParticipant, bindingPacket: packet, generationInputs, targetSchemaAuthorities });
  if (bindingPlan.qualification !== 'qualified' || v423.qualification !== 'qualified') return refusal(v423.qualification === 'incomplete' ? 'canonical-create-input-incomplete' : 'canonical-create-plan-not-qualified', state, v423.qualification === 'incomplete' ? 'Complete every required Task field before creating the local task.' : 'Task cannot be created because its canonical transition plan is not fully qualified.', { bindingPlan, v423 });

  const capability = executionCapability({ action, v423, workspace });
  if (!capability.ok) return refusal(capability.error, state, capability.notice, { bindingPlan, v423, capability });
  const rendered = renderCanonicalTaskLocalArtifact({ values: input.values, parent: action.parentRecovery, now: input.now });
  if (rendered.state !== 'rendered') return refusal(rendered.reason, state, 'Task could not be rendered from the qualified canonical creation values.', { bindingPlan, v423 });
  const taskQualification = qualifyCanonicalTaskLocalArtifact({ markdown: rendered.markdown, schemaMaterials: targetSchemaAuthorities[0].materials, values: input.values, parent: action.parentRecovery });
  if (taskQualification.state !== 'qualified') return refusal(taskQualification.reason, state, 'Task could not be created because the rendered Artifact did not satisfy the canonical Task contract.', { bindingPlan, v423, taskQualification });

  const authority = durableLocalMutationDecision(input.persistenceOwnership, DurableLocalMutationOperation.localDraftCreate);
  if (!authority.ok) return refusal(authority.error || 'local-mutation-not-authorized', state, authority.notice || 'Local Task creation is not available in this session.', { bindingPlan, v423, taskQualification, authority });
  if (!input.lifecycle?.addWorkspaceRecord) return refusal('workspace-lifecycle-unavailable', state, 'Task cannot be created because the local workspace lifecycle is unavailable.');
  const candidate = Object.assign({}, taskQualification.record, { sourceMode: 'local-transition-canonical', path: '', transitionMaterialization: { schema: CANONICAL_TRANSITION_LOCAL_CREATE_COMMAND_SCHEMA_ID, canonicalIdentifier: action.canonicalIdentifier, remoteWrite: false, sourceMutation: false, concretePath: null, relationMaterialization: false } });
  delete candidate.source;
  const committed = input.lifecycle.addWorkspaceRecord(state, workspace.id, candidate, { clock: input.clock });
  if (!committed?.ok) return refusal(committed?.error || 'workspace-mutation-failed', state, 'Task could not be added to the browser-local workspace.', { bindingPlan, v423, taskQualification });
  const afterSource = (committed.workspace?.records || []).find((item) => item.id === currentRecord.id);
  const createdSource = committed.record?.source || {};
  if (stableJson(afterSource) !== beforeSource || createdSource.adapterId === 'github' || createdSource.repository || createdSource.repo || createdSource.ref) {
    return refusal('post-mutation-source-boundary-violation', state, 'Task creation was refused because the source Topic boundary did not remain isolated.', { bindingPlan, v423, taskQualification });
  }
  return Object.freeze({ ok: true, schema: CANONICAL_TRANSITION_LOCAL_CREATE_COMMAND_SCHEMA_ID, state: committed.state, workspace: committed.workspace, record: committed.record, bindingPlan, v423, taskQualification, remoteWrite: false, sourceMutation: false, concretePath: null, relationMaterialization: false, notice: `Created local Task from ${currentRecord.title || 'Topic'}.` });
}

function executionCapability({ action, v423, workspace }) {
  const output = v423.outputRolePlans?.[0];
  const lifecycle = output?.lifecycle || {};
  const placement = output?.placements?.[0] || {};
  const parent = action.resultSemantics?.parentEffects?.[0];
  const supported = v423.outputRolePlans?.length === 1 && output?.outputCount?.exactCount === 1 && output?.effectiveParticipantKind === 'artifact' && output?.schemaConstraint === 'tiinex.task.v1'
    && output?.generation?.authority === 'target-schema' && output?.generation?.state === 'resolved'
    && lifecycle.requestedOperation === 'create' && placement.placementIntent === 'new-materialization' && placement.destinationValue === workspace.id
    && placement.naming?.authority === 'explicit-binding' && placement.naming?.state === 'resolved' && placement.concretePath === null
    && action.resultSemantics?.relationEffects?.length === 0 && parent?.effect === 'set' && parent?.parentBinding?.qualification === 'resolved' && action.parentRecovery?.state === 'qualified' && action.parentRecovery?.schemaId === 'tiinex.topic.v1';
  return Object.freeze({ ok: Boolean(supported), error: supported ? '' : 'canonical-local-create-pattern-unsupported', notice: supported ? '' : 'Task cannot be created because this canonical Transition is outside the supported browser-local create capability.' });
}
function productFailureNotice(action) {
  if (action?.parentRecovery?.state !== 'qualified') return 'Task cannot be created because the source Topic cannot be referenced safely.';
  return 'Task cannot be created because the canonical Transition is not currently product-capable.';
}
function refusal(error, state, notice, extra = {}) { return Object.freeze({ ok: false, schema: CANONICAL_TRANSITION_LOCAL_CREATE_COMMAND_SCHEMA_ID, error, state, notice, ...extra, remoteWrite: false, sourceMutation: false, concretePath: null, relationMaterialization: false }); }
function stableJson(value) { return JSON.stringify(value ?? null); }
