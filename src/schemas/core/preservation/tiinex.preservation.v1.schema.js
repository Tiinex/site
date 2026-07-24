import { defineSchemaModule } from '../../contracts.js';
import binding from './tiinex.preservation.v1.schema.json' with { type: 'json' };
import { preservationCapabilities } from './tiinex.preservation.v1.capabilities.js';
import { preservationValidate } from './tiinex.preservation.v1.validate.js';
import { preservationPresent } from './tiinex.preservation.v1.presenter.js';
import { preservationTransitions } from './tiinex.preservation.v1.transitions.js';
import preservationI18nEn from './tiinex.preservation.v1.en.i18n.json' with { type: 'json' };
import preservationI18nSv from './tiinex.preservation.v1.sv.i18n.json' with { type: 'json' };
import { preservationFindings } from './tiinex.preservation.v1.findings.js';

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
  viewActions: Object.freeze({ lineage: Object.freeze(['record.open', 'record.markdown', 'record.source']) }),
  transitions: preservationTransitions,
  i18n: Object.freeze({ en: preservationI18nEn, sv: preservationI18nSv }),
  findings: preservationFindings
});
