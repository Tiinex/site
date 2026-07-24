import { defineSchemaModule } from './contracts.js';
import binding from './tiinex.root.v1.schema.json' with { type: 'json' };
import { rootCapabilities } from './tiinex.root.v1.capabilities.js';
import { rootValidate } from './tiinex.root.v1.validate.js';
import { rootPresent } from './tiinex.root.v1.presenter.js';
import { rootTransitions } from './tiinex.root.v1.transitions.js';
import rootI18nEn from './tiinex.root.v1.en.i18n.json' with { type: 'json' };
import rootI18nSv from './tiinex.root.v1.sv.i18n.json' with { type: 'json' };
import { rootFindings } from './tiinex.root.v1.findings.js';

export const rootSchemaModule = defineSchemaModule({
  id: 'tiinex.root.v1',
  label: 'Root',
  kind: 'abstract',
  role: 'envelope',
  parentSchemaId: null,
  summary: 'Minimum shared contract for Tiinex lineage artifacts; abstract envelope and fallback.',
  binding,
  capabilities: rootCapabilities,
  validate: rootValidate,
  present: rootPresent,
  read: Object.freeze({ label: 'Root', sections: Object.freeze(['Summary', 'Root Semantics', 'Contract Reading Model']) }),
  viewActions: Object.freeze({ lineage: Object.freeze(['record.open', 'record.markdown', 'record.source']) }),
  transitions: rootTransitions,
  i18n: Object.freeze({ en: rootI18nEn, sv: rootI18nSv }),
  findings: rootFindings
});
