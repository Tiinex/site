import { defineSchemaModule } from '../../contracts.js';
import binding from './tiinex.evidence.v1.schema.json' with { type: 'json' };
import { evidenceCapabilities } from './tiinex.evidence.v1.capabilities.js';
import { evidenceValidate } from './tiinex.evidence.v1.validate.js';
import { evidencePresent } from './tiinex.evidence.v1.presenter.js';
import { evidenceTransitions } from './tiinex.evidence.v1.transitions.js';
import evidenceI18nEn from './tiinex.evidence.v1.en.i18n.json' with { type: 'json' };
import evidenceI18nSv from './tiinex.evidence.v1.sv.i18n.json' with { type: 'json' };
import { evidenceFindings } from './tiinex.evidence.v1.findings.js';

export const evidenceSchemaModule = defineSchemaModule({
  id: 'tiinex.evidence.v1',
  label: 'Evidence',
  kind: 'concrete',
  role: 'core-artifact',
  parentSchemaId: "tiinex.preservation.v1",
  summary: 'Preserved material used to support, illuminate, test, or challenge a claim or question.',
  binding,
  capabilities: evidenceCapabilities,
  validate: evidenceValidate,
  present: evidencePresent,
  read: Object.freeze({ label: 'Evidence', sections: Object.freeze(['Supported Claim', 'Supports', 'Evidence Material', 'Unavailable Material', 'Provenance', 'Interpretation Limits', 'Interpretation Notes and Limits']) }),
  viewActions: Object.freeze({ lineage: Object.freeze(['record.open', 'record.markdown', 'record.source']) }),
  transitions: evidenceTransitions,
  i18n: Object.freeze({ en: evidenceI18nEn, sv: evidenceI18nSv }),
  findings: evidenceFindings
});
