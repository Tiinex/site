import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { buildArtifactCreationContract, createArtifactDraftMarkdown, validateArtifactCreationResult } from '../schemas/creation.contracts.js';
import { firstMissingSchemaFactoryAuthoringInput, isSchemaFactoryViewerCreateAction, normalizeSchemaFactoryAuthoringValues, projectSchemaFactoryViewerCreateAction } from '../schemas/schema.factory.viewerProjection.js';
import { allocateRootArtifactPath } from '../transitions/record.transitions.js';
import { durableLocalMutationDecision, DurableLocalMutationOperation } from './durableLocalMutationPolicy.js';
import { explicitPlacementPath } from './workspacePlacementOptions.js';

export const SCHEMA_FACTORY_LOCAL_CREATE_COMMAND_SCHEMA_ID = 'tiinex.site.schema-factory-local-create-command.v1';

export function executeSchemaFactoryLocalCreate(input = {}) {
  const state = input.state || {};
  const workspace = (state.workspaces || []).find((item) => String(item?.id || '') === String(input.workspaceId || ''));
  if (!workspace) return refusal('workspace-not-found', state, 'Artifact cannot be created because the target workspace is unavailable.');
  if (input.currentRecordId) return refusal('schema-factory-root-create-source-unexpected', state, 'Standalone factory creation cannot bind a selected source artifact.');

  const suppliedAction = input.action || {};
  if (!isSchemaFactoryViewerCreateAction(suppliedAction)) return refusal('schema-factory-action-required', state, 'Artifact cannot be created because the selected action is not a shared schema-factory create projection.');
  const schemaId = String(suppliedAction?.authoring?.schemaId || '').trim();
  const action = projectSchemaFactoryViewerCreateAction(schemaId);
  if (!action.productCapable || action.definitionKey !== suppliedAction.definitionKey) return refusal('schema-factory-action-unqualified', state, `${action.authoring?.schemaLabel || 'Artifact'} cannot be created because its shared factory projection is not qualified.`);

  const values = normalizeSchemaFactoryAuthoringValues(action, input.values || {});
  const missing = firstMissingSchemaFactoryAuthoringInput(action, values);
  if (missing) return refusal('schema-factory-input-incomplete', state, `Complete ${missing} before creating the local ${String(action.authoring?.schemaLabel || 'artifact').toLowerCase()}.`);

  const contract = buildArtifactCreationContract({ schemaId, transitionType: 'create-artifact' });
  if (contract.status !== 'ready' || contract.id !== action.authoring.creationContractId) return refusal('schema-factory-contract-unqualified', state, `${action.authoring?.schemaLabel || 'Artifact'} cannot be created because its exact Artifact Creation Contract is not ready.`);

  const titleBinding = (contract.creation?.inputBindings || []).find((binding) => binding?.kind === 'root-current-summary-body-title');
  const outputTitle = String(titleBinding ? values?.[titleBinding.input] : `${contract.target?.label || 'Artifact'} Draft`).trim() || `${contract.target?.label || 'Artifact'} Draft`;
  const automaticAllocation = allocateRootArtifactPath({ targetId: schemaId, targetLabel: contract.target?.label || schemaId, title: outputTitle }, { workspaceRecords: workspace.records || [] });
  const placementFolder = String(input.placementFolder || '').trim();
  const requestedPath = placementFolder ? explicitPlacementPath(automaticAllocation.path, placementFolder) : '';
  const allocation = requestedPath
    ? allocateRootArtifactPath({ targetId: schemaId, targetLabel: contract.target?.label || schemaId, title: outputTitle }, { workspaceRecords: workspace.records || [], path: requestedPath })
    : automaticAllocation;
  const concretePath = allocation.path || '';
  if (!concretePath) return refusal('schema-factory-path-allocation-unavailable', state, `${contract.target?.label || 'Artifact'} cannot be created because its browser-local path could not be allocated.`);

  const createdAt = input.createdAt !== undefined ? input.createdAt : (typeof input.clock === 'function' ? input.clock() : new Date());
  let markdown = '';
  try {
    markdown = createArtifactDraftMarkdown(contract, { values, childPath: concretePath, createdAt });
  } catch (error) {
    return refusal('schema-factory-render-failed', state, `${contract.target?.label || 'Artifact'} could not be rendered from its qualified creation contract.`, { exception: String(error?.message || error || '') });
  }
  if (!markdown) return refusal('schema-factory-render-unqualified', state, `${contract.target?.label || 'Artifact'} could not be rendered and validated from its qualified creation contract.`);

  const artifactValidation = validateArtifactCreationResult({ schemaId, status: 'local', sourceMode: 'local-schema-factory-create', path: concretePath, markdown }, {}, { contract, childPath: concretePath });
  if (!artifactValidation.ok) return refusal('schema-factory-validation-failed', state, `${contract.target?.label || 'Artifact'} was not committed because shared schema validation did not qualify the rendered result.`, { artifactValidation });

  const authority = durableLocalMutationDecision(input.persistenceOwnership, DurableLocalMutationOperation.localDraftCreate);
  if (!authority.ok) return refusal(authority.error || 'local-mutation-not-authorized', state, authority.notice || `Local ${contract.target?.label || 'artifact'} creation is not available in this session.`, { authority, artifactValidation });
  if (!input.lifecycle?.addWorkspaceRecord) return refusal('workspace-lifecycle-unavailable', state, `${contract.target?.label || 'Artifact'} cannot be created because the local workspace lifecycle is unavailable.`, { artifactValidation });

  const parsedRecord = createRecordFromMarkdown(markdown, { path: concretePath, sourceMode: 'local-schema-factory-create' });
  const candidate = Object.freeze({
    ...parsedRecord,
    sourceMode: 'local-schema-factory-create',
    path: concretePath,
    factoryMaterialization: Object.freeze({
      schema: SCHEMA_FACTORY_LOCAL_CREATE_COMMAND_SCHEMA_ID,
      descriptorSchema: action.authoring.factoryDescriptorSchema,
      creationContractId: contract.id,
      schemaId,
      transitionAuthority: 'not-invoked',
      remoteWrite: false,
      sourceMutation: false,
      placement: Object.freeze({ mode: placementFolder ? 'explicit-same-workspace-folder' : 'automatic', folder: placementFolder, path: concretePath })
    })
  });
  const committed = input.lifecycle.addWorkspaceRecord(state, workspace.id, candidate, { clock: input.clock });
  if (!committed?.ok) return refusal(committed?.error || 'workspace-mutation-failed', state, `${contract.target?.label || 'Artifact'} could not be added to the browser-local workspace.`, { artifactValidation });

  const createdSource = committed.record?.source || {};
  if (createdSource.adapterId === 'github' || createdSource.repository || createdSource.repo || createdSource.ref || committed.record?.sourceTarget) {
    return refusal('post-mutation-source-boundary-violation', state, `${contract.target?.label || 'Artifact'} creation was refused because the browser-local artifact inherited source provenance.`, { artifactValidation });
  }

  return Object.freeze({
    ok: true,
    schema: SCHEMA_FACTORY_LOCAL_CREATE_COMMAND_SCHEMA_ID,
    state: committed.state,
    workspace: committed.workspace,
    record: committed.record,
    artifactValidation,
    factoryDescriptor: action.authoring.builderDescriptor,
    creationContract: contract,
    remoteWrite: false,
    sourceMutation: false,
    transitionAuthority: 'not-invoked',
    concretePath,
    continuityMode: 'root',
    placement: Object.freeze({ mode: placementFolder ? 'explicit-same-workspace-folder' : 'automatic', folder: placementFolder, path: concretePath }),
    notice: `Created and schema-validated standalone local ${contract.target?.label || 'artifact'} in ${workspace.name || workspace.title || 'workspace'}.`
  });
}

function refusal(error, state, notice, extra = {}) {
  return Object.freeze({ ok: false, schema: SCHEMA_FACTORY_LOCAL_CREATE_COMMAND_SCHEMA_ID, error, state, notice, ...extra, remoteWrite: false, sourceMutation: false, transitionAuthority: 'not-invoked', concretePath: null });
}
