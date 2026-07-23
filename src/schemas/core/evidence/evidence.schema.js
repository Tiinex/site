import { defineSchemaModule } from '../../contracts.js';
import binding from './evidence.schema.json' with { type: 'json' };
import { evidenceCapabilities } from './evidence.capabilities.js';
import { evidenceValidate } from './evidence.validate.js';
import { evidencePresent } from './evidence.presenter.js';
import { evidenceTransitions } from './evidence.transitions.js';
import { evidenceI18n } from './evidence.i18n.js';
import { evidenceFindings } from './evidence.findings.js';

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
  i18n: evidenceI18n,
  findings: evidenceFindings
});
