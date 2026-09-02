import { schemaRegistry } from '../../../schemas/registry.js';
import { rootPlaythingsPresentationCompanion } from './playthings.presentation.root.js';
import { taskPlaythingsPresentationCompanion } from './playthings.presentation.task.js';
import { projectPlaythingsPresentationCompanion } from './playthings.presentation.project.js';
import { organizationPlaythingsPresentationCompanion } from './playthings.presentation.organization.js';
import { handoffPlaythingsPresentationCompanion } from './playthings.presentation.handoff.js';
import { discoveryPlaythingsPresentationCompanion } from './playthings.presentation.discovery.js';
import { evidencePlaythingsPresentationCompanion } from './playthings.presentation.evidence.js';
import { decisionPlaythingsPresentationCompanion } from './playthings.presentation.decision.js';
import { workspacePlaythingsPresentationCompanion } from './playthings.presentation.workspace.js';
import { relationPlaythingsPresentationCompanion } from './playthings.presentation.relation.js';
import { topicPlaythingsPresentationCompanion } from './playthings.presentation.topic.js';
import { preservationPlaythingsPresentationCompanion } from './playthings.presentation.preservation.js';
import { signalPlaythingsPresentationCompanion } from './playthings.presentation.signal.js';
import { feedbackPlaythingsPresentationCompanion } from './playthings.presentation.feedback.js';
import { interpretationPlaythingsPresentationCompanion } from './playthings.presentation.interpretation.js';
import { schemaModulePlaythingsPresentationCompanion } from './playthings.presentation.schemaModule.js';
import { findingPlaythingsPresentationCompanion } from './playthings.presentation.finding.js';
import { surfacePlaythingsPresentationCompanion } from './playthings.presentation.surface.js';
import { workspaceRepresentationPlaythingsPresentationCompanion } from './playthings.presentation.workspaceRepresentation.js';

const companions = Object.freeze([
  rootPlaythingsPresentationCompanion,
  taskPlaythingsPresentationCompanion,
  projectPlaythingsPresentationCompanion,
  organizationPlaythingsPresentationCompanion,
  handoffPlaythingsPresentationCompanion,
  discoveryPlaythingsPresentationCompanion,
  evidencePlaythingsPresentationCompanion,
  decisionPlaythingsPresentationCompanion,
  workspacePlaythingsPresentationCompanion,
  relationPlaythingsPresentationCompanion,
  topicPlaythingsPresentationCompanion,
  preservationPlaythingsPresentationCompanion,
  signalPlaythingsPresentationCompanion,
  feedbackPlaythingsPresentationCompanion,
  interpretationPlaythingsPresentationCompanion,
  schemaModulePlaythingsPresentationCompanion,
  findingPlaythingsPresentationCompanion,
  surfacePlaythingsPresentationCompanion,
  workspaceRepresentationPlaythingsPresentationCompanion
]);

const bySchemaId = new Map(companions.map((companion) => [companion.targetSchemaId, companion]));

export function resolvePlaythingsPresentationCompanion(schemaId = '') {
  const requestedSchemaId = String(schemaId || '').trim() || 'tiinex.root.v1';
  let cursor = requestedSchemaId;
  const visited = new Set();
  let depth = 0;
  while (cursor && !visited.has(cursor)) {
    visited.add(cursor);
    const exact = bySchemaId.get(cursor);
    if (exact) return Object.freeze({
      companion: exact,
      requestedSchemaId,
      resolvedSchemaId: cursor,
      resolution: depth === 0 ? 'exact' : 'ancestor',
      inheritedDepth: depth,
      semanticAuthority: 'none'
    });
    const module = schemaRegistry.byId?.get(cursor) || null;
    cursor = String(module?.parentSchemaId || '').trim();
    depth += 1;
  }
  return Object.freeze({
    companion: rootPlaythingsPresentationCompanion,
    requestedSchemaId,
    resolvedSchemaId: rootPlaythingsPresentationCompanion.targetSchemaId,
    resolution: 'root-fallback',
    inheritedDepth: Math.max(1, depth),
    semanticAuthority: 'none'
  });
}

export function playthingsPresentationCompanions() { return companions; }
