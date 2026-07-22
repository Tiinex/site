import { defineSchemaModule } from '../../contracts.js';
import binding from './preservation.schema.json' with { type: 'json' };
import { preservationCapabilities } from './preservation.capabilities.js';
import { preservationValidate } from './preservation.validate.js';
import { preservationPresent } from './preservation.presenter.js';
import { preservationTransitions } from './preservation.transitions.js';
import { preservationI18n } from './preservation.i18n.js';
import { preservationFindings } from './preservation.findings.js';

export const preservationSchemaModule = defineSchemaModule({
  id: 'tiinex.preservation.v1',
  label: 'Preservation',
  kind: 'concrete',
  role: 'core-artifact',
  parentSchemaId: "tiinex.root.v1",
  summary: 'Captured or preserved material made available for later judgment.',
  binding,
  capabilities: preservationCapabilities,
  validate: preservationValidate,
  present: preservationPresent,
  read: Object.freeze({ label: 'Preservation', sections: Object.freeze(['Preserved Material', 'Preservation Act', 'Provenance', 'Fidelity And Loss', 'Custody Or Storage Boundary', 'Interpretation Limits']) }),
  viewActions: Object.freeze({ lineage: Object.freeze(['record.open', 'record.markdown', 'record.continue', 'record.reference', 'record.source']) }),
  transitions: preservationTransitions,
  i18n: preservationI18n,
  findings: preservationFindings
});
