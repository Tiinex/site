import { defineSchemaModule } from '../../contracts.js';
import binding from './surface.schema.json' with { type: 'json' };
import { surfaceCapabilities } from './surface.capabilities.js';
import { surfaceValidate } from './surface.validate.js';
import { surfacePresent } from './surface.presenter.js';
import { surfaceTransitions } from './surface.transitions.js';
import { surfaceI18n } from './surface.i18n.js';
import { surfaceFindings } from './surface.findings.js';

export const surfaceSchemaModule = defineSchemaModule({
  id: 'tiinex.presentation.surface.v1',
  label: 'Presentation Surface',
  kind: 'concrete',
  role: 'presentation',
  parentSchemaId: "tiinex.root.v1",
  summary: 'Bounded implementation-neutral presentation or interaction surface.',
  binding,
  capabilities: surfaceCapabilities,
  validate: surfaceValidate,
  present: surfacePresent,
  transitions: surfaceTransitions,
  i18n: surfaceI18n,
  findings: surfaceFindings
});
