import binding from './tiinex.handoff.v1.schema.json' with { type: 'json' };
import { schemaSource } from './tiinex.handoff.v1.schema.source.js';
import { defineGenericArtifactSchemaModule } from '../../generic.artifact.module.js';

export const handoffSchemaModule = defineGenericArtifactSchemaModule({
  id: 'tiinex.handoff.v1',
  label: 'Handoff',
  parentSchemaId: 'tiinex.root.v1',
  kind: 'concrete',
  role: 'workflow-handoff-artifact',
  summary: 'Maintained declarative bounded work/responsibility transfer artifact.',
  binding,
  schemaSource
});
