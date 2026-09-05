import { schemaRegistry } from '../../schemas/registry.js';
import { listCreatableArtifactSchemas } from '../../schemas/creation.contracts.js';

export const PLAYTHINGS_TECH_TREE_SCHEMA = 'tiinex.playthings.tech-tree-projection.experimental.v1';

export function buildPlaythingsTechTree(model = {}) {
  const registryModules = Array.isArray(schemaRegistry.modules) ? schemaRegistry.modules : [];
  const moduleById = new Map(registryModules.map((module) => [module.id, module]));
  const creatable = new Set(listCreatableArtifactSchemas(schemaRegistry).map((contract) => contract.target?.schemaId).filter(Boolean));
  const schemaArtifacts = (model.artifacts || []).filter((artifact) => artifact.isSchemaArtifact || /\.schema\.md$/i.test(String(artifact.path || '')));
  const artifactBySchema = new Map();
  for (const artifact of schemaArtifacts) if (!artifactBySchema.has(artifact.schemaId)) artifactBySchema.set(artifact.schemaId, artifact);

  const schemaArtifactKeys = new Set(schemaArtifacts.map((artifact) => artifact.key));
  const parentArtifactByChild = new Map((model.edges || []).filter((edge) => edge.kind === 'parent' && schemaArtifactKeys.has(edge.from) && schemaArtifactKeys.has(edge.to)).map((edge) => [edge.to, edge.from]));
  const artifactByKey = new Map(schemaArtifacts.map((artifact) => [artifact.key, artifact]));
  const ids = new Set([...moduleById.keys(), ...artifactBySchema.keys()]);

  const nodes = Array.from(ids).map((schemaId) => {
    const module = moduleById.get(schemaId) || null;
    const artifact = artifactBySchema.get(schemaId) || null;
    const lineageParentArtifact = artifact ? artifactByKey.get(parentArtifactByChild.get(artifact.key) || '') || null : null;
    const parentSchemaId = String(module?.parentSchemaId || lineageParentArtifact?.schemaId || '').trim();
    const implemented = Boolean(module);
    const abstract = module?.kind === 'abstract';
    return Object.freeze({
      schemaId,
      label: module?.label || schemaLabel(schemaId),
      summary: module?.summary || artifact?.summary || 'Resolved schema blueprint from observed material.',
      parentSchemaId,
      implemented,
      locked: !implemented,
      abstract,
      creatable: implemented && !abstract && creatable.has(schemaId),
      artifactKey: artifact?.key || '',
      recordId: artifact?.recordId || '',
      workspaceId: artifact?.workspaceId || '',
      path: artifact?.path || '',
      openAvailable: Boolean(artifact?.recordId)
    });
  }).sort((a, b) => a.label.localeCompare(b.label));

  const byId = new Map(nodes.map((node) => [node.schemaId, node]));
  const roots = nodes.filter((node) => !node.parentSchemaId || !byId.has(node.parentSchemaId)).map((node) => node.schemaId);
  return Object.freeze({ schema: PLAYTHINGS_TECH_TREE_SCHEMA, nodes: Object.freeze(nodes), roots: Object.freeze(roots), byId, semanticAuthority: 'none' });
}


export function filterPlaythingsTechTreeNodes(tree = {}, options = {}) {
  const nodes = Array.isArray(tree?.nodes) ? tree.nodes : [];
  return Object.freeze((options.implementedOnly !== false ? nodes.filter((node) => node.implemented) : nodes).slice());
}

function schemaLabel(schemaId) {
  const parts = String(schemaId || '').replace(/^tiinex\./, '').replace(/\.v\d+$/, '').split('.').filter(Boolean);
  return parts.map((part) => part.slice(0, 1).toUpperCase() + part.slice(1)).join(' ') || 'Schema';
}
