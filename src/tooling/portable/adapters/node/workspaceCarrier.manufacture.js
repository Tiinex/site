import path from 'node:path';
import { enumerateNodeWorkspace } from './handoff.manufacture.enumeration.js';
import { buildToolingBootstrapTransportFiles } from './handoff.manufacture.bootstrap.js';
import { inferWorkspaceTitle, normalizeAdditionalWorkspaceDescriptors, safeWorkspaceToken } from './handoff.manufacture.multiRoot.js';
import { normalizeWorkspaceTargetBindings } from './handoff.manufacture.scope.js';
import { normalizeHandoffCarrierLineage } from '../../handoff/carrierLineage.js';
import { normalizeHandoffCarrierProfile } from '../../handoff/carrierProfile.js';

export async function prepareNodeWorkspaceCarrierManufacturingInput(input = {}, options = {}) {
  const workspaceRoot = path.resolve(String(input.workspaceRoot || input.workspace || '.'));
  const workspaceId = safeWorkspaceToken(input.workspaceId || path.basename(workspaceRoot) || 'workspace');
  const requestedWorkspaceTitle = String(input.workspaceTitle || input.title || '').trim();
  const additionalWorkspaceDescriptors = normalizeAdditionalWorkspaceDescriptors(input.additionalWorkspaces || input.workspaceRoots || input.workspaceDescriptors || []);
  const seen = new Set([workspaceId]);
  const descriptors = [{ id: workspaceId, root: workspaceRoot, title: requestedWorkspaceTitle, primary: true }, ...additionalWorkspaceDescriptors.map((descriptor) => {
    const id = safeWorkspaceToken(descriptor.id || descriptor.workspaceId || '');
    if (!descriptor.id && !descriptor.workspaceId) throw new Error('portable.workspace-carrier.additional-workspace.id.required');
    if (seen.has(id)) throw new Error(`portable.workspace-carrier.workspace-id.duplicate:${id}`);
    seen.add(id);
    const rootValue = descriptor.root || descriptor.workspaceRoot || descriptor.path;
    if (!rootValue) throw new Error(`portable.workspace-carrier.additional-workspace.root.required:${id}`);
    return { ...descriptor, id, root: path.resolve(String(rootValue)), title: String(descriptor.title || descriptor.name || descriptor.workspaceTitle || '').trim(), primary: false };
  })];

  const enumerations = await Promise.all(descriptors.map(async (descriptor) => {
    const enumeration = await enumerateNodeWorkspace(descriptor.root, {
      workspaceId: descriptor.id,
      workspaceTitle: descriptor.title,
      sourceMetadata: descriptor.source || descriptor.sourceMetadata || {},
      excludeDirectories: descriptor.excludeDirectories || input.excludeDirectories || options.excludeDirectories,
      maxFiles: descriptor.maxFiles || input.maxFiles || options.maxFiles
    });
    if (enumeration.status !== 'qualified-complete') throw new Error(`portable.workspace-carrier.workspace-enumeration.${descriptor.id}.${enumeration.status}`);
    const title = descriptor.title || inferWorkspaceTitle(enumeration) || descriptor.id;
    return Object.freeze({ descriptor, root: descriptor.root, materialization: Object.freeze({ ...enumeration.materialization, title }), evidence: enumeration.evidence });
  }));

  const workspaceTargets = normalizeWorkspaceTargetBindings({
    primaryWorkspaceId: workspaceId,
    primaryTargetPath: input.workspaceTargetPath || input.workspaceArtifactPath || '',
    explicitBindings: input.workspaceTargets || input.workspaceTargetBindings || [],
    additionalWorkspaceDescriptors
  });
  const toolingBootstrap = await buildToolingBootstrapTransportFiles({
    delivery: input.toolingBootstrap || input.bootstrapDelivery || 'embedded',
    runtimeRoot: input.runtimeRoot || options.runtimeRoot,
    expected: input.expectedToolingBootstrap || null,
    maxFiles: input.bootstrapMaxFiles || options.bootstrapMaxFiles
  });
  return Object.freeze({
    carrierMode: 'workspace',
    createdAt: String(input.createdAt || ''),
    workspaceMaterializations: Object.freeze(enumerations.map((item) => item.materialization)),
    workspaceTargets,
    additionalTransportFiles: toolingBootstrap.files,
    carrierLineage: normalizeHandoffCarrierLineage(input.carrierLineage || null),
    carrierProfile: normalizeHandoffCarrierProfile(input.carrierProfile || null),
    toolingBootstrap: toolingBootstrap.summary,
    manufacturingEvidence: Object.freeze({ workspaceEnumerations: Object.freeze(enumerations.map((item) => Object.freeze({ id: item.materialization.id, root: item.root, evidence: item.evidence }))), toolingBootstrap: toolingBootstrap.summary }),
    verifyRoundtrip: input.verifyRoundtrip !== false
  });
}
