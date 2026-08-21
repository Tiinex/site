import { buildCanonicalTransitionInvocationBindingPlan } from '../transitions/transition.invocationBindingPlanner.js';
import { buildCanonicalTransitionOutputMaterializationPlan } from '../transitions/transition.outputMaterializationPlanner.js';
import { prepareCanonicalTransitionProductActions } from '../transitions/transition.productPreparation.js';
import { allocateRootArtifactPath } from '../transitions/record.transitions.js';
import { localArtifactMaterializerForSchema } from '../transitions/transition.localArtifactMaterializers.js';
import { qualifyDurableReferenceParticipant } from '../transitions/transition.referenceTarget.js';
import { canonicalReferenceTargetOptions, annotatedLoadedRecords } from './canonicalReferenceTargets.js';
import { durableLocalMutationDecision, DurableLocalMutationOperation } from './durableLocalMutationPolicy.js';

export const CANONICAL_REFERENCE_LOCAL_CREATE_COMMAND_SCHEMA_ID = 'tiinex.site.canonical-reference-local-create-command.v1';

export function executeCanonicalReferenceLocalCreate(input = {}) {
  const state = input.state || {};
  const subjectWorkspace = findWorkspace(state, input.workspaceId);
  if (!subjectWorkspace) return refusal('workspace-not-found', state, 'Reference cannot be created because the subject workspace is unavailable.');
  const subjectRecord = findRecord(subjectWorkspace, input.currentRecordId);
  if (!subjectRecord) return refusal('reference-subject-not-found', state, 'Reference cannot be created because the selected subject artifact is unavailable.');
  const targetWorkspace = findWorkspace(state, input.targetWorkspaceId);
  const targetRecord = findRecord(targetWorkspace, input.targetRecordId);
  if (!targetWorkspace || !targetRecord) return refusal('reference-target-not-found', state, 'Reference cannot be created because the selected target artifact is unavailable.');
  if (subjectWorkspace.id === targetWorkspace.id && subjectRecord.id === targetRecord.id) return refusal('reference-target-not-distinct', state, 'Reference requires a distinct target artifact.');

  const loaded = annotatedLoadedRecords(state);
  const referenceRecords = loaded.map((item) => item.record);
  const preparation = prepareCanonicalTransitionProductActions({
    currentRecord: subjectRecord,
    workspaceRecords: subjectWorkspace.records || [],
    referenceRecords,
    workspaceId: subjectWorkspace.id,
    schemaCache: input.schemaCache,
    bundledDefinitions: input.bundledDefinitions
  });
  const matches = (preparation.actions || []).filter((candidate) => candidate.definitionKey === input.definitionKey);
  if (matches.length !== 1) return refusal('canonical-reference-definition-key-not-unique', state, 'Reference cannot be created because the canonical Transition key does not identify exactly one definition.');
  const action = matches[0];
  if (!action?.productCapable || action.referenceCapability?.state !== 'qualified') return refusal('canonical-reference-capability-unavailable', state, 'Reference is not qualified for the selected subject artifact.');

  const targets = canonicalReferenceTargetOptions({ state, subjectWorkspaceId: subjectWorkspace.id, subjectRecord, targetSchemaId: action.referenceCapability.targetSchemaId });
  const targetOption = targets.options.find((option) => option.workspaceId === targetWorkspace.id && option.id === targetRecord.id) || null;
  if (!targetOption?.enabled) return refusal(targetOption?.qualification?.reason || 'reference-target-identity-unqualified', state, 'Reference target does not have durable enough identity for this bounded product capability.', { targetQualification: targetOption?.qualification || null });
  if (!(action.referenceCapability.targetCandidateParticipantIds || []).includes(targetOption.participantId)) return refusal('reference-target-not-applicable', state, 'Reference target does not satisfy the exact Transition target role.');

  const subjectParticipant = targets.subjectParticipant;
  const subjectQualification = qualifyDurableReferenceParticipant(subjectRecord, subjectParticipant, {
    subjectWorkspaceId: subjectWorkspace.id,
    participantWorkspaceId: subjectWorkspace.id,
    workspaceRecords: subjectWorkspace.records || []
  });
  if (subjectQualification.state !== 'qualified') return refusal(subjectQualification.reason || 'reference-subject-identity-unqualified', state, 'Reference subject does not have durable enough identity for this bounded product capability.', { subjectQualification });

  const result = action.resultSemantics || {};
  const output = result.outputRoles?.[0];
  const outputSchemaId = token(output?.schemaConstraint);
  const materializer = localArtifactMaterializerForSchema(outputSchemaId);
  if (!materializer || outputSchemaId !== 'tiinex.relation.v1') return refusal('canonical-reference-materializer-unavailable', state, 'Reference Relation materializer is unavailable for the exact qualified output schema.');
  const relation = action.referenceCapability.relationEffect || {};
  const placement = result.outputPlacements?.[0] || {};
  const destination = result.destinationBindings?.[0] || {};
  const explicit = action.explicitGenerationQualification || null;
  const outputRole = token(action.referenceCapability.outputRole || output?.name);
  if (token(explicit?.qualification) !== 'qualified') return refusal('explicit-generation-authority-unqualified', state, 'Reference Relation generation authority is not exactly qualified.');

  const relationTitle = `Reference ${subjectRecord.title || 'Topic'} to ${targetRecord.title || 'Task'}`;
  const packet = {
    inputRoles: [
      { role: action.referenceCapability.subjectRole, members: [{ bindingId: 'reference-subject-1', participantId: subjectParticipant.identity.id }] },
      { role: action.referenceCapability.targetRole, members: [{ bindingId: 'reference-target-1', participantId: targetOption.participantId }] }
    ],
    destinations: [{ name: destination.name || '', value: subjectWorkspace.id }],
    naming: [{ placement: placement.name || '', value: relationTitle }],
    memberAssociations: []
  };
  const bindingPlan = buildCanonicalTransitionInvocationBindingPlan({
    definition: action.definition,
    participantIndex: targets.participantIndex,
    currentArtifact: subjectParticipant,
    bindingPacket: packet
  });

  const values = referenceGenerationValues({ action, subjectQualification, targetQualification: targetOption.qualification });
  const requiredInputNames = (explicit.authority?.requiredInputs || []).map((item) => token(item?.name)).filter(Boolean);
  if (!requiredInputNames.length || requiredInputNames.some((name) => !token(values[name]))) return refusal('reference-generation-values-incomplete', state, 'Reference Relation generation values are incomplete for the exact generation authority.', { values });
  const generationInputs = requiredInputNames.map((name) => ({ outputRole, name, value: values[name] }));
  const v423 = buildCanonicalTransitionOutputMaterializationPlan({
    definition: action.definition,
    participantIndex: targets.participantIndex,
    currentArtifact: subjectParticipant,
    bindingPacket: packet,
    generationInputs,
    explicitGenerationAuthorities: [{ outputRole, qualification: explicit }]
  });
  if (bindingPlan.qualification !== 'qualified' || v423.qualification !== 'qualified') return refusal('canonical-reference-plan-not-qualified', state, 'Reference cannot be created because canonical binding/materialization planning did not qualify.', { bindingPlan, v423 });

  const capability = referenceExecutionCapability({ action, v423, subjectWorkspace, targetOption, materializer });
  if (!capability.ok) return refusal(capability.error, state, capability.notice, { bindingPlan, v423, capability });

  const allocation = allocateRootArtifactPath({ targetId: outputSchemaId, targetLabel: materializer.label, title: relationTitle }, { workspaceRecords: subjectWorkspace.records || [] });
  const concretePath = token(allocation.path);
  if (!concretePath) return refusal('reference-local-path-allocation-unavailable', state, 'Reference Relation cannot be created because a browser-local path could not be allocated.', { bindingPlan, v423 });
  const cacheById = Object.fromEntries((preparation.cacheQualification?.entries || []).map((item) => [item.schemaId, item]));
  const relationSchemaMaterials = [cacheById['tiinex.root.v1']?.markdown || '', cacheById[outputSchemaId]?.markdown || ''];
  const rendered = materializer.render({ values, parent: null, continuityMode: 'root', now: input.now });
  if (rendered.state !== 'rendered') return refusal(rendered.reason, state, 'Reference Relation could not be rendered from its qualified generation values.', { bindingPlan, v423 });
  const artifactQualification = materializer.qualify({ markdown: rendered.markdown, schemaMaterials: relationSchemaMaterials, values, parent: null, continuityMode: 'root', path: concretePath });
  if (artifactQualification.state !== 'qualified') return refusal(artifactQualification.reason, state, 'Reference Relation did not satisfy the exact Relation contract.', { bindingPlan, v423, artifactQualification });

  const authority = durableLocalMutationDecision(input.persistenceOwnership, DurableLocalMutationOperation.localDraftCreate);
  if (!authority.ok) return refusal(authority.error || 'local-mutation-not-authorized', state, authority.notice || 'Local Reference creation is not available in this session.', { bindingPlan, v423, artifactQualification });
  if (!input.lifecycle?.addWorkspaceRecord) return refusal('workspace-lifecycle-unavailable', state, 'Reference Relation cannot be created because the local workspace lifecycle is unavailable.');
  const beforeSubject = stableJson(subjectRecord), beforeTarget = stableJson(targetRecord);
  const candidate = Object.assign({}, artifactQualification.record, {
    sourceMode: 'local-transition-canonical',
    path: concretePath,
    transitionMaterialization: {
      schema: CANONICAL_REFERENCE_LOCAL_CREATE_COMMAND_SCHEMA_ID,
      canonicalIdentifier: action.canonicalIdentifier,
      remoteWrite: false,
      sourceMutation: false,
      targetMutation: false,
      concretePath,
      continuityMode: 'root',
      relationMaterialization: true
    }
  });
  delete candidate.source;
  delete candidate.sourceTarget;
  const committed = input.lifecycle.addWorkspaceRecord(state, subjectWorkspace.id, candidate, { clock: input.clock });
  if (!committed?.ok) return refusal(committed?.error || 'workspace-mutation-failed', state, 'Reference Relation could not be added to the browser-local workspace.', { bindingPlan, v423, artifactQualification });

  const afterSubject = findRecord(findWorkspace(committed.state, subjectWorkspace.id), subjectRecord.id);
  const afterTarget = findRecord(findWorkspace(committed.state, targetWorkspace.id), targetRecord.id);
  if (stableJson(afterSubject) !== beforeSubject || stableJson(afterTarget) !== beforeTarget) return refusal('post-mutation-participant-boundary-violation', state, 'Reference creation was refused because a participant artifact changed.', { bindingPlan, v423, artifactQualification });
  const createdSource = committed.record?.source || {};
  if (createdSource.adapterId === 'github' || createdSource.repository || createdSource.repo || createdSource.ref || committed.record?.sourceTarget) return refusal('post-mutation-source-boundary-violation', state, 'Reference Relation inherited source provenance and was refused.', { bindingPlan, v423, artifactQualification });

  return Object.freeze({
    ok: true,
    schema: CANONICAL_REFERENCE_LOCAL_CREATE_COMMAND_SCHEMA_ID,
    state: committed.state,
    workspace: committed.workspace,
    record: committed.record,
    subjectRecord,
    targetRecord,
    subjectQualification,
    targetQualification: targetOption.qualification,
    bindingPlan,
    v423,
    artifactQualification,
    concretePath,
    relationMaterialization: true,
    remoteWrite: false,
    sourceMutation: false,
    targetMutation: false,
    notice: `Created local Reference Relation from ${subjectRecord.title || 'subject'} to ${targetRecord.title || 'target'}.`
  });
}

function referenceGenerationValues({ action = {}, subjectQualification = {}, targetQualification = {} } = {}) {
  const effect = action.referenceCapability?.relationEffect || {};
  const transitionPath = token(action.definition?.artifact?.path || action.definition?.artifact?.source?.sourceArtifactPath);
  const generationTarget = token(action.explicitGenerationQualification?.resolution?.target);
  const exact = action.explicitGenerationQualification?.exactAuthorityRepresentations || {};
  return Object.freeze({
    'Relation Type': 'topic reference to task',
    'Relation Direction': 'Topic subject -> referenced Task',
    'Relation Scope': 'artifact-level',
    'Relation Target': token(targetQualification.durableTarget),
    'Predicate Identifier': token(effect.predicateIdentifier),
    'Predicate Meaning': token(effect.predicateMeaning),
    'Subject Binding': token(subjectQualification.durableTarget),
    'Object Binding': token(targetQualification.durableTarget),
    Directionality: token(effect.directionality),
    'Transition Authority': transitionPath ? `site-local:${transitionPath}` : '',
    'Transition Authority Representation Method': token(exact.transition?.method),
    'Transition Authority Representation Value': token(exact.transition?.value),
    'Generation Authority': generationTarget,
    'Generation Authority Representation Method': token(exact.generation?.method),
    'Generation Authority Representation Value': token(exact.generation?.value)
  });
}
function referenceExecutionCapability({ action = {}, v423 = {}, subjectWorkspace = {}, targetOption = {}, materializer = null } = {}) {
  const output = v423.outputRolePlans?.[0] || {};
  const placement = output.placements?.[0] || {};
  const effect = action.referenceCapability?.relationEffect || {};
  const supported = v423.outputRolePlans?.length === 1
    && output.outputCount?.exactCount === 1
    && output.effectiveParticipantKind === 'artifact'
    && output.schemaConstraint === 'tiinex.relation.v1'
    && output.generation?.authority === 'explicit-reference'
    && output.generation?.state === 'resolved'
    && output.lifecycle?.requestedOperation === 'create'
    && placement.placementIntent === 'new-materialization'
    && placement.destinationValue === subjectWorkspace.id
    && placement.naming?.authority === 'explicit-binding'
    && placement.naming?.state === 'resolved'
    && placement.concretePath === null
    && action.resultSemantics?.parentEffects?.length === 0
    && action.resultSemantics?.relationEffects?.length === 1
    && effect.semanticQualification?.state === 'qualified'
    && effect.predicateScope === 'local-transition-definition'
    && effect.portablePredicateIdentityClaimed === false
    && targetOption.enabled === true
    && materializer?.schemaId === 'tiinex.relation.v1';
  return Object.freeze({ ok: Boolean(supported), error: supported ? '' : 'canonical-reference-pattern-unsupported', notice: supported ? '' : 'Reference is outside the bounded durable browser-local capability.' });
}
function findWorkspace(state = {}, id = '') { const key = token(id); return (state.workspaces || []).find((item) => token(item?.id) === key) || null; }
function findRecord(workspace = null, id = '') { const key = token(id); return (workspace?.records || []).find((item) => token(item?.id) === key) || null; }
function refusal(error, state, notice, extra = {}) { return Object.freeze({ ok: false, schema: CANONICAL_REFERENCE_LOCAL_CREATE_COMMAND_SCHEMA_ID, error, state, notice, ...extra, remoteWrite: false, sourceMutation: false, targetMutation: false, relationMaterialization: false, concretePath: null }); }
function stableJson(value) { return JSON.stringify(value ?? null); }
function token(value = '') { return String(value || '').trim(); }
