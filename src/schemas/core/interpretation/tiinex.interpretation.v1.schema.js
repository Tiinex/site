import { defineSchemaModule } from '../../contracts.js';
import binding from './tiinex.interpretation.v1.schema.json' with { type: 'json' };
import { interpretationCapabilities } from './tiinex.interpretation.v1.capabilities.js';
import { interpretationValidate } from './tiinex.interpretation.v1.validate.js';
import { interpretationPresent } from './tiinex.interpretation.v1.presenter.js';
import { interpretationTransitions } from './tiinex.interpretation.v1.transitions.js';
import interpretationI18nEn from './tiinex.interpretation.v1.en.i18n.json' with { type: 'json' };
import interpretationI18nSv from './tiinex.interpretation.v1.sv.i18n.json' with { type: 'json' };
import { interpretationFindings } from './tiinex.interpretation.v1.findings.js';
import { INTERPRETATION_REQUIRED_SECTIONS } from './tiinex.interpretation.v1.contract.js';

export const interpretationSchemaModule = defineSchemaModule({
  id: 'tiinex.interpretation.v1',
  label: 'Interpretation',
  kind: 'concrete',
  role: 'core-artifact',
  parentSchemaId: 'tiinex.root.v1',
  summary: 'Explicit bounded interpretation of another artifact or target without mutating the original.',
  binding,
  capabilities: interpretationCapabilities,
  validate: interpretationValidate,
  present: interpretationPresent,
  read: Object.freeze({ label: 'Interpretation', sections: INTERPRETATION_REQUIRED_SECTIONS }),
  viewActions: Object.freeze({ lineage: Object.freeze(['record.open', 'record.markdown', 'record.source']) }),
  transitions: interpretationTransitions,
  i18n: Object.freeze({ en: interpretationI18nEn, sv: interpretationI18nSv }),
  findings: interpretationFindings
});
