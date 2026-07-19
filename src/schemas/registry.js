import { rootSchemaModule } from './root.schema.js';
import { topicSchemaModule } from './core/topic/topic.schema.js';
import { preservationSchemaModule } from './core/preservation/preservation.schema.js';
import { evidenceSchemaModule } from './core/evidence/evidence.schema.js';
import { moduleSchemaModule } from './schema/module/module.schema.js';
import { surfaceSchemaModule } from './presentation/surface/surface.schema.js';

const modules = [rootSchemaModule, topicSchemaModule, preservationSchemaModule, evidenceSchemaModule, moduleSchemaModule, surfaceSchemaModule];
const byId = new Map(modules.map((module) => [module.id, module]));
const byChecksum = new Map(modules.map((module) => [module.binding.checksum.value, module]));

export const schemaRegistry = Object.freeze({ modules, byId, byChecksum, fallback: rootSchemaModule });

export function resolveSchemaModule({ schemaId, checksum } = {}) {
  if (checksum && byChecksum.has(checksum)) return byChecksum.get(checksum);
  if (schemaId && byId.has(schemaId)) return byId.get(schemaId);
  return rootSchemaModule;
}
