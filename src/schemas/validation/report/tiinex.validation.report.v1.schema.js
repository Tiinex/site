import binding from './tiinex.validation.report.v1.schema.json' with { type: 'json' };
import { schemaSource } from './tiinex.validation.report.v1.schema.source.js';
import { defineGenericArtifactSchemaModule } from '../../generic.artifact.module.js';

export const validationReportSchemaModule = defineGenericArtifactSchemaModule({
  id: 'tiinex.validation.report.v1',
  label: 'Validation Report',
  parentSchemaId: 'tiinex.root.v1',
  kind: 'concrete',
  role: 'validation-report-artifact',
  summary: 'Bounded validation report semantics aggregating scope, methods, findings, run boundary, and interpretation limits.',
  binding,
  schemaSource
});
