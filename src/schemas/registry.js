import { rootSchemaModule } from './tiinex.root.v1.schema.js';
import { topicSchemaModule } from './core/topic/tiinex.topic.v1.schema.js';
import { preservationSchemaModule } from './core/preservation/tiinex.preservation.v1.schema.js';
import { evidenceSchemaModule } from './core/evidence/tiinex.evidence.v1.schema.js';
import { taskSchemaModule } from './core/task/tiinex.task.v1.schema.js';
import { interpretationSchemaModule } from './core/interpretation/tiinex.interpretation.v1.schema.js';
import { relationSchemaModule } from './core/relation/tiinex.relation.v1.schema.js';
import { workspaceRepresentationSchemaModule } from './core/relation/workspace/representation/tiinex.workspace.representation.v1.schema.js';
import { moduleSchemaModule } from './schema/module/tiinex.schema.module.v1.schema.js';
import { surfaceSchemaModule } from './presentation/surface/tiinex.presentation.surface.v1.schema.js';
import { workspaceSchemaModule } from './workspace/tiinex.workspace.v1.schema.js';
import { handoffSchemaModule } from './coordination/handoff/tiinex.handoff.v1.schema.js';
import { decisionSchemaModule } from './core/decision/tiinex.decision.v1.schema.js';
import { feedbackSchemaModule } from './core/feedback/tiinex.feedback.v1.schema.js';
import { signalSchemaModule } from './core/signal/tiinex.signal.v1.schema.js';
import { discoverySchemaModule } from './discovery/tiinex.discovery.v1.schema.js';
import { discoveryFindingSchemaModule } from './discovery/finding/tiinex.discovery.finding.v1.schema.js';

const modules = [rootSchemaModule, workspaceSchemaModule, topicSchemaModule, taskSchemaModule, interpretationSchemaModule, relationSchemaModule, workspaceRepresentationSchemaModule, preservationSchemaModule, evidenceSchemaModule, signalSchemaModule, feedbackSchemaModule, decisionSchemaModule, discoverySchemaModule, discoveryFindingSchemaModule, handoffSchemaModule, moduleSchemaModule, surfaceSchemaModule];
const byId = new Map(modules.map((module) => [module.id, module]));
const byChecksum = new Map(modules.map((module) => [module.binding.checksum.value, module]));

export const schemaRegistry = Object.freeze({ modules, byId, byChecksum, fallback: rootSchemaModule });

export function resolveSchemaModule({ schemaId, checksum } = {}) {
  if (checksum && byChecksum.has(checksum)) return byChecksum.get(checksum);
  if (schemaId && byId.has(schemaId)) return byId.get(schemaId);
  return rootSchemaModule;
}
