import binding from './tiinex.signal.v1.schema.json' with { type: 'json' };
import { schemaSource } from './tiinex.signal.v1.schema.source.js';
import { defineGenericArtifactSchemaModule } from '../../generic.artifact.module.js';

export const signalSchemaModule = defineGenericArtifactSchemaModule({
  id: 'tiinex.signal.v1',
  label: 'Signal',
  parentSchemaId: 'tiinex.root.v1',
  kind: 'concrete',
  role: 'core-signal-artifact',
  summary: 'Maintained bounded signal artifact.',
  binding,
  schemaSource
});
