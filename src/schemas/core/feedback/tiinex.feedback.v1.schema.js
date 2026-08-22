import binding from './tiinex.feedback.v1.schema.json' with { type: 'json' };
import { schemaSource } from './tiinex.feedback.v1.schema.source.js';
import { defineGenericArtifactSchemaModule } from '../../generic.artifact.module.js';

export const feedbackSchemaModule = defineGenericArtifactSchemaModule({
  id: 'tiinex.feedback.v1',
  label: 'Feedback',
  parentSchemaId: 'tiinex.signal.v1',
  kind: 'concrete',
  role: 'workflow-feedback-artifact',
  summary: 'Maintained directed feedback artifact.',
  binding,
  schemaSource
});
