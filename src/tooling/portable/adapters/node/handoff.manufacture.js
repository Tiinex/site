import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { inferWorkspaceTitle, normalizeAdditionalWorkspaceDescriptors, normalizeTransportRoute, safeWorkspaceToken } from './handoff.manufacture.multiRoot.js';
import { buildToolingBootstrapTransportFiles, PORTABLE_TOOLING_BOOTSTRAP_MANIFEST_SCHEMA_ID } from './handoff.manufacture.bootstrap.js';
import { normalizeHandoffCarrierLineage } from '../../handoff/carrierLineage.js';
import { enumerateNodeWorkspace, PORTABLE_NODE_WORKSPACE_ENUMERATION_SCHEMA_ID } from './handoff.manufacture.enumeration.js';
import { preparePackageParentWorkspaceReuse } from './handoff.manufacture.packageParent.js';
import {
  assertInside,
  expandPointerDependencyClosure,
  normalizeRelativePath,
  projectManufacturingRequirements,
  resolveWorkspaceRequirementMaterials
} from './handoff.manufacture.requirements.js';
import {
  expandBoundedParentBoundaryClosure,
  normalizeWorkspaceScopes,
  normalizeWorkspaceTargetBindings,
  projectBoundedWorkspaceMaterialization
} from './handoff.manufacture.scope.js';

export { buildToolingBootstrapTransportFiles, PORTABLE_TOOLING_BOOTSTRAP_MANIFEST_SCHEMA_ID };
export { enumerateNodeWorkspace, PORTABLE_NODE_WORKSPACE_ENUMERATION_SCHEMA_ID } from './handoff.manufacture.enumeration.js';

export async function prepareNodeHandoffManufacturingInput(input = {}, options = {}) {
  const workspaceRoot = path.resolve(String(input.workspaceRoot || input.workspace || '.'));
  const workspaceId = safeWorkspaceToken(input.workspaceId || path.basename(workspaceRoot) || 'workspace');
  const requestedWorkspaceTitle = String(input.workspaceTitle || input.title || '').trim();
  const handoffPath = normalizeRelativePath(input.handoffPath || input.handoff || '');
  if (!handoffPath) throw new Error('portable.handoff-manufacture.handoff-path.required');
  const absoluteHandoff = path.resolve(workspaceRoot, handoffPath);
  assertInside(workspaceRoot, absoluteHandoff, 'portable.handoff-manufacture.handoff-path.outside-workspace');
  const handoffMarkdownPromise = readFile(absoluteHandoff, 'utf8');
  const toolingBootstrapPromise = buildToolingBootstrapTransportFiles({
    delivery: input.toolingBootstrap || input.bootstrapDelivery || 'embedded',
    runtimeRoot: input.runtimeRoot || options.runtimeRoot,
    expected: input.expectedToolingBootstrap || null,
    maxFiles: input.bootstrapMaxFiles || options.bootstrapMaxFiles
  }).then(
    (value) => Object.freeze({ value, error: null }),
    (error) => Object.freeze({ value: null, error })
  );
  const enumerationPromise = enumerateNodeWorkspace(workspaceRoot, {
    workspaceId,
    workspaceTitle: requestedWorkspaceTitle,
    sourceMetadata: input.workspaceSource || input.sourceMetadata || {},
    excludeDirectories: input.excludeDirectories || options.excludeDirectories,
    maxFiles: input.maxFiles || options.maxFiles
  });
  const additionalWorkspaceDescriptors = normalizeAdditionalWorkspaceDescriptors(input.additionalWorkspaces || input.workspaceRoots || input.workspaceDescriptors || []);
  const seenWorkspaceIds = new Set([workspaceId]);
  const additionalWorkspaceInputs = additionalWorkspaceDescriptors.map((descriptor) => {
    const id = safeWorkspaceToken(descriptor.id || descriptor.workspaceId || '');
    if (!descriptor.id && !descriptor.workspaceId) throw new Error('portable.handoff-manufacture.additional-workspace.id.required');
    if (seenWorkspaceIds.has(id)) throw new Error(`portable.handoff-manufacture.workspace-id.duplicate:${id}`);
    seenWorkspaceIds.add(id);
    if (!descriptor.root && !descriptor.workspaceRoot && !descriptor.path) throw new Error(`portable.handoff-manufacture.additional-workspace.root.required:${id}`);
    return Object.freeze({
      descriptor,
      id,
      root: path.resolve(String(descriptor.root || descriptor.workspaceRoot || descriptor.path || '')),
      requestedTitle: String(descriptor.title || descriptor.name || descriptor.workspaceTitle || '').trim()
    });
  });
  const packageParentReuse = preparePackageParentWorkspaceReuse({
    bundle: input.packageParentBundle || null,
    currentWorkspaceIds: [...seenWorkspaceIds],
    parentPackagePath: input.packageParentPath || '',
    parentPackageSha256: input.packageParentSha256 || ''
  });
  const additionalEnumerationsPromise = Promise.all(additionalWorkspaceInputs.map(async ({ descriptor, id, root, requestedTitle }) => {
    const enumerated = await enumerateNodeWorkspace(root, {
      workspaceId: id,
      workspaceTitle: requestedTitle,
      sourceMetadata: descriptor.source || descriptor.sourceMetadata || {},
      excludeDirectories: descriptor.excludeDirectories || input.excludeDirectories || options.excludeDirectories,
      maxFiles: descriptor.maxFiles || input.maxFiles || options.maxFiles
    });
    if (enumerated.status !== 'qualified-complete') throw new Error(`portable.handoff-manufacture.workspace-enumeration.${id}.${enumerated.status}`);
    return Object.freeze({ descriptor, id, root, requestedTitle, enumerated });
  }));

  const [handoffMarkdown, enumeration, additionalEnumerations] = await Promise.all([
    handoffMarkdownPromise,
    enumerationPromise,
    additionalEnumerationsPromise
  ]);
  const handoff = Object.freeze({
    id: handoffPath,
    path: handoffPath,
    semanticStatus: String(input.handoffSemanticStatus || 'unknown'),
    markdown: handoffMarkdown
  });

  if (enumeration.status !== 'qualified-complete') throw new Error(`portable.handoff-manufacture.workspace-enumeration.${enumeration.status}`);
  const workspaceTitle = requestedWorkspaceTitle || inferWorkspaceTitle(enumeration) || workspaceId;
  const primaryMaterialization = Object.freeze({ ...enumeration.materialization, title: workspaceTitle });
  const workspaceMaterializations = [primaryMaterialization];
  const workspaceEnumerations = [Object.freeze({ id: workspaceId, root: workspaceRoot, evidence: enumeration.evidence })];
  const workspaceRuntimeById = new Map([[workspaceId, Object.freeze({ id: workspaceId, root: workspaceRoot, enumeration })]]);
  for (const { id, root, requestedTitle, enumerated } of additionalEnumerations) {
    const title = requestedTitle || inferWorkspaceTitle(enumerated) || id;
    workspaceMaterializations.push(Object.freeze({ ...enumerated.materialization, title }));
    workspaceEnumerations.push(Object.freeze({ id, root, evidence: enumerated.evidence }));
    workspaceRuntimeById.set(id, Object.freeze({ id, root, enumeration: enumerated }));
  }
  for (const inherited of packageParentReuse.inherited || []) {
    const id = safeWorkspaceToken(inherited.id || inherited.enumeration?.materialization?.id || '');
    if (!id || workspaceRuntimeById.has(id)) throw new Error(`portable.handoff-manufacture.package-parent.workspace-precedence.invalid:${id || 'unresolved'}`);
    const inheritedEnumeration = inherited.enumeration;
    workspaceMaterializations.push(inheritedEnumeration.materialization);
    workspaceEnumerations.push(Object.freeze({ id, root: '', evidence: inheritedEnumeration.evidence, provider: 'qualified-package-parent-workspace' }));
    workspaceRuntimeById.set(id, Object.freeze({ id, root: '', enumeration: inheritedEnumeration, provider: 'qualified-package-parent-workspace' }));
  }
  const transportRoutes = Object.freeze([...(input.transportRoutes || input.handoffRoutes || [])].map((route) => normalizeTransportRoute(route, workspaceId)).filter(Boolean));
  const workspaceTargets = mergeWorkspaceTargetBindings(normalizeWorkspaceTargetBindings({
    primaryWorkspaceId: workspaceId,
    primaryTargetPath: input.workspaceTargetPath || input.workspaceArtifactPath || '',
    explicitBindings: input.workspaceTargets || input.workspaceTargetBindings || [],
    additionalWorkspaceDescriptors
  }), packageParentReuse.workspaceTargets || []);
  const workspaceScopes = normalizeWorkspaceScopes(input.workspaceScopes || input.workspaceScopeBindings || []);
  for (let index = 0; index < workspaceMaterializations.length; index += 1) {
    const materialization = workspaceMaterializations[index];
    const scope = workspaceScopes.get(String(materialization.id || '')) || null;
    if (!scope || scope.coverage !== 'bounded') continue;
    const targets = workspaceTargets.filter((item) => String(item.workspaceId || '') === String(materialization.id || ''));
    if (targets.length !== 1) throw new Error(`portable.handoff-manufacture.workspace-scope.target-${targets.length ? 'ambiguous' : 'required'}:${materialization.id}`);
    workspaceMaterializations[index] = projectBoundedWorkspaceMaterialization(materialization, scope, targets[0].path);
  }

  const routeSpecs = transportRoutes.length ? transportRoutes : Object.freeze([{ workspaceId, path: handoffPath }]);
  let requirements = await projectManufacturingRequirements({ handoff, workspaceId, handoffPath, routeSpecs, workspaceRuntimeById });
  let materials = await resolveWorkspaceRequirementMaterials(requirements, workspaceRuntimeById, input.materialBindings || {});
  const dependencyClosure = await expandPointerDependencyClosure({ requirements, materials, workspaceRuntimeById, bindings: input.materialBindings || {} });
  requirements = dependencyClosure.requirements;
  materials = dependencyClosure.materials;
  const parentBoundaryClosure = expandBoundedParentBoundaryClosure({ requirements, materials, workspaceMaterializations, workspaceRuntimeById });
  requirements = parentBoundaryClosure.requirements;
  materials = parentBoundaryClosure.materials;
  const toolingBootstrapResult = await toolingBootstrapPromise;
  if (toolingBootstrapResult.error) throw toolingBootstrapResult.error;
  const toolingBootstrap = toolingBootstrapResult.value;
  const orientationBootstrap = input.transportBootstrapContent
    ? Object.freeze({ present: true, path: String(input.transportBootstrapPath || 'tiinex.package/bootstrap.md'), content: String(input.transportBootstrapContent), mediaType: 'text/markdown' })
    : Object.freeze({ present: false });

  return Object.freeze({
    handoff,
    requirements,
    workspace: Object.freeze({ id: workspaceId, name: workspaceTitle, title: workspaceTitle, records: Object.freeze([]), assets: Object.freeze([]) }),
    workspaceMaterializations: Object.freeze(workspaceMaterializations),
    materials: Object.freeze(materials),
    recipient: Object.freeze({ referenceTargets: Object.freeze([...(input.referenceTargets || [])].map(String)) }),
    bootstrap: orientationBootstrap,
    additionalTransportFiles: toolingBootstrap.files,
    transportRoutes,
    workspaceTargets,
    carrierLineage: normalizeHandoffCarrierLineage(input.carrierLineage || null),
    toolingBootstrap: toolingBootstrap.summary,
    manufacturingEvidence: Object.freeze({
      enumeration: enumeration.evidence,
      workspaceEnumerations: Object.freeze(workspaceEnumerations),
      toolingBootstrap: toolingBootstrap.summary,
      packageParentWorkspaceReuse: Object.freeze({
        state: String(packageParentReuse.state || ''),
        inspectionStatus: String(packageParentReuse.inspectionStatus || ''),
        inheritedWorkspaceIds: Object.freeze((packageParentReuse.inherited || []).map((item) => String(item.id || ''))),
        boundary: String(packageParentReuse.boundary || '')
      }),
      carrierProjection: Object.freeze({ requestedRoutes: transportRoutes.length || 1, carrierLineage: normalizeHandoffCarrierLineage(input.carrierLineage || null), boundary: 'Routes are qualified later against packaged workspace bytes; adapter text is not authority.' })
    }),
    verifyRoundtrip: input.verifyRoundtrip !== false
  });
}


function mergeWorkspaceTargetBindings(explicit = [], inherited = []) {
  const out = [];
  const seen = new Set();
  for (const item of [...explicit, ...inherited]) {
    const workspaceId = String(item?.workspaceId || '').trim();
    const targetPath = String(item?.path || '').trim();
    if (!workspaceId || !targetPath) continue;
    const key = `${workspaceId}\u0000${targetPath}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(Object.freeze({ ...item, workspaceId, path: targetPath }));
  }
  return Object.freeze(out);
}
