import { schemaRegistry } from '../schemas/registry.js';
import { resolveSchemaModule } from '../schemas/resolver.js';

export function localArtifactMaterializerForSchema(schemaId = '', options = {}) {
  const id = String(schemaId || '').trim();
  if (!id) return null;
  const module = options.module || resolveSchemaModule({ schemaId: id, registry: options.registry || schemaRegistry })?.module || null;
  if (!module || String(module.id || '') !== id) return null;
  const adapter = module.localMaterialization || null;
  if (!adapter || adapter.schemaId !== id || typeof adapter.render !== 'function' || typeof adapter.qualify !== 'function') return null;
  return adapter;
}

export function supportedLocalArtifactMaterializerSchemaIds(registry = schemaRegistry) {
  return Object.freeze((registry?.modules || []).filter((module) => localArtifactMaterializerForSchema(module?.id, { module })).map((module) => module.id));
}
