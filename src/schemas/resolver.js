import { schemaRegistry } from './registry.js';

export function resolveSchemaModule({ schemaId, checksum } = {}) {
  if (checksum && schemaRegistry.byChecksum.has(checksum)) {
    const module = schemaRegistry.byChecksum.get(checksum);
    return { module, status: 'checksum-match', fallbackUsed: false };
  }
  if (schemaId && schemaRegistry.byId.has(schemaId)) {
    const module = schemaRegistry.byId.get(schemaId);
    return { module, status: 'schema-id-match', fallbackUsed: false };
  }
  return { module: schemaRegistry.fallback, status: 'root-fallback', fallbackUsed: true, unresolvedSchemaId: schemaId || 'missing' };
}
