import { defineSchemaModule } from '../../contracts.js';
import binding from './module.schema.json' with { type: 'json' };
import { moduleCapabilities } from './module.capabilities.js';
import { moduleValidate } from './module.validate.js';
import { modulePresent } from './module.presenter.js';
import { moduleTransitions } from './module.transitions.js';
import { moduleI18n } from './module.i18n.js';
import { moduleFindings } from './module.findings.js';

export const moduleSchemaModule = defineSchemaModule({
  id: 'tiinex.schema.module.v1',
  label: 'Schema Module',
  kind: 'concrete',
  role: 'schema-governance',
  parentSchemaId: "tiinex.root.v1",
  summary: 'Capability bundle around schema interpretation, viewing, validation, forms, and fallback behavior.',
  binding,
  capabilities: moduleCapabilities,
  validate: moduleValidate,
  present: modulePresent,
  read: Object.freeze({ label: 'Schema Module', sections: Object.freeze(['Schema Module', 'Module Contract', 'Companion Contract', 'Usage', 'Interpretation Limits']) }),
  viewActions: Object.freeze({ lineage: Object.freeze(['record.open', 'record.markdown', 'record.continue', 'record.reference', 'record.source']) }),
  transitions: moduleTransitions,
  i18n: moduleI18n,
  findings: moduleFindings
});
