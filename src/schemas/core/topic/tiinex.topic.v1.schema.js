import { defineSchemaModule } from '../../contracts.js';
import binding from './tiinex.topic.v1.schema.json' with { type: 'json' };
import { topicCapabilities } from './tiinex.topic.v1.capabilities.js';
import { topicValidate } from './tiinex.topic.v1.validate.js';
import { topicPresent } from './tiinex.topic.v1.presenter.js';
import { topicTransitions } from './tiinex.topic.v1.transitions.js';
import topicI18nEn from './tiinex.topic.v1.en.i18n.json' with { type: 'json' };
import topicI18nSv from './tiinex.topic.v1.sv.i18n.json' with { type: 'json' };
import { topicFindings } from './tiinex.topic.v1.findings.js';

export const topicSchemaModule = defineSchemaModule({
  id: 'tiinex.topic.v1',
  label: 'Topic',
  kind: 'concrete',
  role: 'core-artifact',
  parentSchemaId: "tiinex.root.v1",
  summary: 'Bounded topic-oriented lineage artifacts for live design and implementation threads.',
  binding,
  capabilities: topicCapabilities,
  validate: topicValidate,
  present: topicPresent,
  read: Object.freeze({ label: 'Topic', sections: Object.freeze(['Content', 'Current Read', 'Design Direction', 'Next Artifacts', 'Good Child Candidates', 'Transition Boundary']) }),
  viewActions: Object.freeze({ lineage: Object.freeze(['record.open', 'record.markdown', 'record.source']) }),
  transitions: topicTransitions,
  i18n: Object.freeze({ en: topicI18nEn, sv: topicI18nSv }),
  findings: topicFindings
});
