import { schemaRegistry } from './registry.js';

export function resolveSchemaModule({ schemaId, checksum, registry = schemaRegistry } = {}) {
  if (checksum && registry.byChecksum?.has(checksum)) {
    const module = registry.byChecksum.get(checksum);
    return { module, status: 'checksum-match', fallbackUsed: false };
  }
  if (schemaId && registry.byId?.has(schemaId)) {
    const module = registry.byId.get(schemaId);
    return { module, status: 'schema-id-match', fallbackUsed: false };
  }
  return { module: registry.fallback || null, status: 'root-fallback', fallbackUsed: true, unresolvedSchemaId: schemaId || 'missing' };
}
