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
  transitions: moduleTransitions,
  i18n: moduleI18n,
  findings: moduleFindings
});
