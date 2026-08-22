import binding from './tiinex.discovery.v1.schema.json' with { type: 'json' };
import { schemaSource } from './tiinex.discovery.v1.schema.source.js';
import { defineGenericArtifactSchemaModule } from '../generic.artifact.module.js';

export const discoverySchemaModule = defineGenericArtifactSchemaModule({
  id: 'tiinex.discovery.v1',
  label: 'Discovery',
  parentSchemaId: 'tiinex.root.v1',
  kind: 'concrete',
  role: 'workflow-discovery-artifact',
  summary: 'Maintained bounded discovery provenance artifact.',
  binding,
  schemaSource
});
