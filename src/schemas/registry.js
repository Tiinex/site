import { rootSchemaModule } from './tiinex.root.v1.schema.js';
import { topicSchemaModule } from './core/topic/tiinex.topic.v1.schema.js';
import { preservationSchemaModule } from './core/preservation/tiinex.preservation.v1.schema.js';
import { evidenceSchemaModule } from './core/evidence/tiinex.evidence.v1.schema.js';
import { taskSchemaModule } from './core/task/tiinex.task.v1.schema.js';
import { moduleSchemaModule } from './schema/module/tiinex.schema.module.v1.schema.js';
import { surfaceSchemaModule } from './presentation/surface/tiinex.presentation.surface.v1.schema.js';
import { workspaceSchemaModule } from './workspace/tiinex.workspace.v1.schema.js';

const modules = [rootSchemaModule, workspaceSchemaModule, topicSchemaModule, taskSchemaModule, preservationSchemaModule, evidenceSchemaModule, moduleSchemaModule, surfaceSchemaModule];
const byId = new Map(modules.map((module) => [module.id, module]));
const byChecksum = new Map(modules.map((module) => [module.binding.checksum.value, module]));

export const schemaRegistry = Object.freeze({ modules, byId, byChecksum, fallback: rootSchemaModule });

export function resolveSchemaModule({ schemaId, checksum } = {}) {
  if (checksum && byChecksum.has(checksum)) return byChecksum.get(checksum);
  if (schemaId && byId.has(schemaId)) return byId.get(schemaId);
  return rootSchemaModule;
}
