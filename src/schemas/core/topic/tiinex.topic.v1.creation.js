import { genericArtifactCreationImplementation } from '../../creation.renderer.js';
import { sealC14nV2Self } from '../../../integrity/integrity.c14nV2.js';

const ORIENTING_SHAPE_TEXT = 'summary sentence placeholder below the title';

export const topicArtifactCreationImplementation = Object.freeze({
  ...genericArtifactCreationImplementation,
  renderer: Object.freeze({ id: 'tiinex.site.topic-artifact-creation-renderer.v1', scope: 'schema-owned-topic-create-representation' }),
  execute(contract, input) {
    const base = genericArtifactCreationImplementation.execute(contract, input);
    if (String(contract?.transitionType || 'create-artifact') !== 'create-artifact') return base;
    const markdown = typeof base === 'string' ? base : String(base?.markdown || '');
    const summaryBinding = (contract?.creation?.inputBindings || []).find((item) => item?.kind === 'root-current-summary-body-title');
    const values = { ...((input?.inputs && typeof input.inputs === 'object') ? input.inputs : {}), ...((input?.values && typeof input.values === 'object') ? input.values : {}) };
    const summary = summaryBinding && Object.prototype.hasOwnProperty.call(values, summaryBinding.input) ? String(values[summaryBinding.input]) : '';
    if (!markdown || !summary) return '';
    const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
    const boundary = lines.findIndex((line) => line === '---');
    let titleIndex = -1;
    for (let i = Math.max(0, boundary + 1); i < lines.length; i += 1) { if (/^#\s+/.test(lines[i]) && lines[i] !== '# Continuity Integrity') { titleIndex = i; break; } }
    if (titleIndex < 0) return '';
    lines.splice(titleIndex + 1, 0, '', `This topic captures the current direction for ${summary}.`);
    const sealed = sealC14nV2Self(lines.join('\n'));
    return sealed.state === 'sealed' ? sealed.markdown : '';
  },
  qualifyRequiredShape({ markdown = '', residualItems = [], input = {} } = {}) {
    const unknown = residualItems.filter((item) => String(item?.sourceText || '') !== ORIENTING_SHAPE_TEXT);
    if (unknown.length) return Object.freeze({ state: 'unavailable', coveredItemIds: Object.freeze([]), findings: Object.freeze(unknown.map((item) => `Topic creation owner does not qualify residual Required Shape item ${item?.id || 'unknown'}.`)) });
    const values = { ...((input?.inputs && typeof input.inputs === 'object') ? input.inputs : {}), ...((input?.values && typeof input.values === 'object') ? input.values : {}) };
    const summary = Object.prototype.hasOwnProperty.call(values, 'Summary') ? String(values.Summary) : '';
    const expected = `This topic captures the current direction for ${summary}.`;
    const observed = bodyLeadLines(markdown);
    const ok = residualItems.length === 1 && observed.length === 1 && observed[0] === expected;
    return Object.freeze({ state: ok ? 'qualified' : 'unavailable', coveredItemIds: Object.freeze(ok ? residualItems.map((item) => item.id) : []), findings: Object.freeze(ok ? [] : [`Topic orienting sentence does not satisfy exact schema-owned Required Shape representation.`]) });
  }
});

function bodyLeadLines(markdown = '') {
  const lines = String(markdown || '').replace(/\r\n?/g, '\n').split('\n');
  const boundary = lines.findIndex((line) => line === '---');
  let title = -1; for (let i = boundary + 1; i < lines.length; i += 1) { if (/^#\s+/.test(lines[i]) && lines[i] !== '# Continuity Integrity') { title = i; break; } }
  if (title < 0) return [];
  const out = [];
  for (let i = title + 1; i < lines.length; i += 1) { if (/^##\s+/.test(lines[i]) || lines[i] === '# Continuity Integrity') break; if (lines[i] !== '') out.push(lines[i]); }
  return out;
}
