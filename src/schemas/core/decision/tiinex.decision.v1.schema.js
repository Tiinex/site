import binding from './tiinex.decision.v1.schema.json' with { type: 'json' };
import { schemaSource } from './tiinex.decision.v1.schema.source.js';
import { defineGenericArtifactSchemaModule } from '../../generic.artifact.module.js';

export const decisionSchemaModule = defineGenericArtifactSchemaModule({
  id: 'tiinex.decision.v1',
  label: 'Decision',
  parentSchemaId: 'tiinex.root.v1',
  kind: 'concrete',
  role: 'workflow-decision-artifact',
  summary: 'Maintained landed decision artifact.',
  binding,
  schemaSource
});
