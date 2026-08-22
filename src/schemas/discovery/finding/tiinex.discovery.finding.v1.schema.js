import binding from './tiinex.discovery.finding.v1.schema.json' with { type: 'json' };
import { schemaSource } from './tiinex.discovery.finding.v1.schema.source.js';
import { defineGenericArtifactSchemaModule } from '../../generic.artifact.module.js';

export const discoveryFindingSchemaModule = defineGenericArtifactSchemaModule({
  id: 'tiinex.discovery.finding.v1',
  label: 'Discovery Finding',
  parentSchemaId: 'tiinex.discovery.v1',
  kind: 'concrete',
  role: 'workflow-discovery-finding-artifact',
  summary: 'Maintained discovered finding/triage artifact.',
  binding,
  schemaSource
});
