import { defineSchemaModule } from '../../contracts.js';
import binding from './tiinex.schema.module.v1.schema.json' with { type: 'json' };
import { schemaSource } from './tiinex.schema.module.v1.schema.source.js';
import { moduleCapabilities } from './tiinex.schema.module.v1.capabilities.js';
import { moduleValidate } from './tiinex.schema.module.v1.validate.js';
import { modulePresent } from './tiinex.schema.module.v1.presenter.js';
import { moduleTransitions } from './tiinex.schema.module.v1.transitions.js';
import moduleI18nEn from './tiinex.schema.module.v1.en.i18n.json' with { type: 'json' };
import moduleI18nSv from './tiinex.schema.module.v1.sv.i18n.json' with { type: 'json' };
import { moduleFindings } from './tiinex.schema.module.v1.findings.js';

export const moduleSchemaModule = defineSchemaModule({
  id: 'tiinex.schema.module.v1',
  label: 'Schema Module',
  kind: 'concrete',
  role: 'schema-governance',
  parentSchemaId: "tiinex.root.v1",
  summary: 'Capability bundle around schema interpretation, viewing, validation, forms, and fallback behavior.',
  binding,
  schemaSource,
  capabilities: moduleCapabilities,
  validate: moduleValidate,
  present: modulePresent,
  read: Object.freeze({ label: 'Schema Module', sections: Object.freeze(['Schema Module', 'Module Contract', 'Companion Contract', 'Usage', 'Interpretation Limits']) }),
  viewActions: Object.freeze({ lineage: Object.freeze(['record.open', 'record.markdown', 'record.source']) }),
  transitions: moduleTransitions,
  i18n: Object.freeze({ en: moduleI18nEn, sv: moduleI18nSv }),
  findings: moduleFindings
});
