import { TASK_CANONICAL_REQUIRED_INPUTS } from './tiinex.task.v1.contract.js';

export function readCanonicalTaskAuthoringValues(markdown = '') {
  const text = normalize(markdown);
  const sections = rawArtifactSections(text);
  const summary = currentSummary(sections.envelope);
  const values = { Summary: summary };
  for (const name of TASK_CANONICAL_REQUIRED_INPUTS.slice(1)) values[name] = sectionBody(sections.body, name);
  const qualified = TASK_CANONICAL_REQUIRED_INPUTS.every((name) => values[name] !== undefined && String(values[name]).trim() !== '');
  return Object.freeze({ qualified, values: Object.freeze(values), requiredInputs: TASK_CANONICAL_REQUIRED_INPUTS });
}

export function renderCanonicalTaskEditMarkdown(originalMarkdown = '', inputValues = {}) {
  const parsed = readCanonicalTaskAuthoringValues(originalMarkdown);
  if (!parsed.qualified) return Object.freeze({ state: 'unqualified', reason: 'canonical-task-authoring-shape-unavailable', markdown: '' });
  const values = Object.fromEntries(TASK_CANONICAL_REQUIRED_INPUTS.map((name) => [name, String(inputValues[name] ?? '')]));
  if (TASK_CANONICAL_REQUIRED_INPUTS.some((name) => !values[name].trim())) return Object.freeze({ state: 'unqualified', reason: 'canonical-task-authoring-input-missing', markdown: '' });
  const raw = rawArtifactSections(normalize(originalMarkdown));
  const envelope = replaceCurrentSummary(raw.envelope, values.Summary);
  const body = `# ${values.Summary}\n\n${TASK_CANONICAL_REQUIRED_INPUTS.slice(1).map((name) => `## ${name}\n\n${values[name]}`).join('\n\n')}`;
  const integrity = raw.integrity ? `\n\n${raw.integrity}` : '';
  return Object.freeze({ state: 'rendered', markdown: `${envelope}\n\n---\n\n${body}${integrity}\n`, values: Object.freeze(values) });
}

function rawArtifactSections(markdown = '') {
  const text = normalize(markdown).trim();
  const boundary = /^---\s*$/m.exec(text);
  if (!boundary) return { envelope: text, body: '', integrity: '' };
  const envelope = text.slice(0, boundary.index).trimEnd();
  const remainder = text.slice(boundary.index + boundary[0].length).replace(/^\n/, '');
  const integrityIndex = remainder.search(/^# Continuity Integrity\s*$/m);
  return {
    envelope,
    body: (integrityIndex === -1 ? remainder : remainder.slice(0, integrityIndex)).trim(),
    integrity: integrityIndex === -1 ? '' : remainder.slice(integrityIndex).trim()
  };
}
function currentSummary(envelope = '') {
  const lines = normalize(envelope).split('\n');
  const start = lines.findIndex((line) => /^-\s+Current\s*$/.test(line));
  if (start === -1) return '';
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^-\s+\S/.test(lines[i])) break;
    const match = lines[i].match(/^\s+-\s*Summary:\s*(.*)$/);
    if (match) return match[1].trim();
  }
  return '';
}
function replaceCurrentSummary(envelope = '', summary = '') {
  const lines = normalize(envelope).split('\n');
  const start = lines.findIndex((line) => /^-\s+Current\s*$/.test(line));
  if (start === -1) return envelope;
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^-\s+\S/.test(lines[i])) break;
    const match = lines[i].match(/^(\s+)-\s*Summary:\s*(.*)$/);
    if (match) { lines[i] = `${match[1]}- Summary: ${summary}`; break; }
  }
  return lines.join('\n');
}
function sectionBody(body = '', name = '') {
  const escaped = String(name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = normalize(body).match(new RegExp(`^## ${escaped}\\n\\n([\\s\\S]*?)(?=\\n\\n## |$)`, 'm'));
  return match ? match[1].trimEnd() : undefined;
}
function normalize(value = '') { return String(value || '').replace(/\r\n?/g, '\n'); }
