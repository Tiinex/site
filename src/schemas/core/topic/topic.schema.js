import { defineSchemaModule } from '../../contracts.js';
import binding from './topic.schema.json' with { type: 'json' };
import { topicCapabilities } from './topic.capabilities.js';
import { topicValidate } from './topic.validate.js';
import { topicPresent } from './topic.presenter.js';
import { topicTransitions } from './topic.transitions.js';
import { topicI18n } from './topic.i18n.js';
import { topicFindings } from './topic.findings.js';

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
  transitions: topicTransitions,
  i18n: topicI18n,
  findings: topicFindings
});
