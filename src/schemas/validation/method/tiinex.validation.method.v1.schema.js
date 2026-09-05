import binding from './tiinex.validation.method.v1.schema.json' with { type: 'json' };
import { schemaSource } from './tiinex.validation.method.v1.schema.source.js';
import { defineGenericArtifactSchemaModule } from '../../generic.artifact.module.js';

export const validationMethodSchemaModule = defineGenericArtifactSchemaModule({
  id: 'tiinex.validation.method.v1',
  label: 'Validation Method',
  parentSchemaId: 'tiinex.root.v1',
  kind: 'concrete',
  role: 'validation-method-artifact',
  summary: 'Reusable bounded validation-method semantics describing verification scope, trust boundary, failure modes, and recommended use.',
  binding,
  schemaSource
});
