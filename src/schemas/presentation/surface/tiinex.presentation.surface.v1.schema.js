import { defineSchemaModule } from '../../contracts.js';
import binding from './tiinex.presentation.surface.v1.schema.json' with { type: 'json' };
import { schemaSource } from './tiinex.presentation.surface.v1.schema.source.js';
import { surfaceCapabilities } from './tiinex.presentation.surface.v1.capabilities.js';
import { surfaceValidate } from './tiinex.presentation.surface.v1.validate.js';
import { surfacePresent } from './tiinex.presentation.surface.v1.presenter.js';
import { surfaceTransitions } from './tiinex.presentation.surface.v1.transitions.js';
import surfaceI18nEn from './tiinex.presentation.surface.v1.en.i18n.json' with { type: 'json' };
import surfaceI18nSv from './tiinex.presentation.surface.v1.sv.i18n.json' with { type: 'json' };
import { surfaceFindings } from './tiinex.presentation.surface.v1.findings.js';

export const surfaceSchemaModule = defineSchemaModule({
  id: 'tiinex.presentation.surface.v1',
  label: 'Presentation Surface',
  kind: 'concrete',
  role: 'presentation',
  parentSchemaId: "tiinex.root.v1",
  summary: 'Bounded implementation-neutral presentation or interaction surface.',
  binding,
  schemaSource,
  capabilities: surfaceCapabilities,
  validate: surfaceValidate,
  present: surfacePresent,
  read: Object.freeze({ label: 'Presentation Surface', sections: Object.freeze(['Surface', 'Presentation Surface', 'Contract', 'Usage', 'Interpretation Limits']) }),
  viewActions: Object.freeze({ lineage: Object.freeze(['record.open', 'record.markdown', 'record.source']) }),
  transitions: surfaceTransitions,
  i18n: Object.freeze({ en: surfaceI18nEn, sv: surfaceI18nSv }),
  findings: surfaceFindings
});
