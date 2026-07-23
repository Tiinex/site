import { defineSchemaModule } from './contracts.js';
import binding from './root.schema.json' with { type: 'json' };
import { rootCapabilities } from './root.capabilities.js';
import { rootValidate } from './root.validate.js';
import { rootPresent } from './root.presenter.js';
import { rootTransitions } from './root.transitions.js';
import { rootI18n } from './root.i18n.js';
import { rootFindings } from './root.findings.js';

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
  i18n: rootI18n,
  findings: rootFindings
});
