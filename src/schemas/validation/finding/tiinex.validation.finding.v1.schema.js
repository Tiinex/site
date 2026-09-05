import binding from './tiinex.validation.finding.v1.schema.json' with { type: 'json' };
import { schemaSource } from './tiinex.validation.finding.v1.schema.source.js';
import { defineGenericArtifactSchemaModule } from '../../generic.artifact.module.js';

export const validationFindingSchemaModule = defineGenericArtifactSchemaModule({
  id: 'tiinex.validation.finding.v1',
  label: 'Validation Finding',
  parentSchemaId: 'tiinex.root.v1',
  kind: 'concrete',
  role: 'validation-finding-artifact',
  summary: 'One concrete validation observation against a bounded target using a declared method or check boundary.',
  binding,
  schemaSource
});
