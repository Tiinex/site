const COMMON_DEFAULT_PROJECTION = 'common-default';

export function projectAuthorDefault(result = {}, parsed = {}) {
  if (result?.status !== 'blocked') return result;
  const findings = authorActionableFindings(result);
  const missingHeadings = authorMissingHeadings(findings);
  const missingFields = authorMissingOrdinaryFields(findings);
  const missingDeclarationFields = authorMissingDeclarationFields(findings);
  const represented = new Set([
    ...missingHeadings.flatMap((entry) => entry.findingKeys),
    ...missingFields.flatMap((entry) => entry.findingKeys),
    ...missingDeclarationFields.flatMap((entry) => entry.findingKeys)
  ]);
  const redundantSections = new Set(missingHeadings.map((entry) => entry.heading.replace(/^##\s+/, '')));
  const otherActionableFindings = findings
    .filter((finding) => !represented.has(authorFindingKey(finding)))
    .filter((finding) => !redundantSchemaSectionFinding(finding, redundantSections))
    .map(compactAuthorFinding);
  const retryCommand = authorCommandLine(parsed);
  const schemaId = String(result?.artifact?.schemaId || parsed?.flags?.schema || '').trim();
  const commandPrefix = String(parsed?.commandPrefix || 'node tools/tiinex-portable.mjs').trim();
  const schemaContractHelp = `${commandPrefix} author --help --schema ${shellQuote(schemaId)}`;
  return Object.freeze({
    schema: result.schema,
    operation: result.operation || 'author',
    projection: COMMON_DEFAULT_PROJECTION,
    status: result.status,
    artifact: Object.freeze({
      path: String(result?.artifact?.path || ''),
      schemaId,
      written: Boolean(result?.artifact?.written)
    }),
    findingSummary: result.findingSummary || null,
    repair: Object.freeze({
      missingHeadings: Object.freeze(missingHeadings.map(({ findingKeys, ...entry }) => Object.freeze(entry))),
      missingFields: Object.freeze(missingFields.map(({ findingKeys, ...entry }) => Object.freeze(entry))),
      missingDeclarationFields: Object.freeze(missingDeclarationFields.map(({ findingKeys, ...entry }) => Object.freeze(entry))),
      otherActionableFindings: Object.freeze(otherActionableFindings),
      schemaContractHelp,
      retryCommand,
      instruction: 'Repair only the reported body contract failures, then rerun the same author command. Tooling will reseal integrity and re-run audit/staging; no invalid durable artifact was retained.'
    }),
    nextAction: result.nextAction || 'Resolve the reported schema/continuity finding, then rerun the same author command. No invalid durable artifact was retained.',
    detail: Object.freeze({
      fullReceipt: Object.freeze({ command: `${retryCommand} --full`, flag: '--full' })
    }),
    boundary: result.boundary || 'Common-path authoring remains fail-closed; compact repair guidance is a projection of exact validation findings and does not replace schema validation.'
  });
}

function authorActionableFindings(result = {}) {
  const structural = Array.isArray(result?.stage?.validation?.structural?.findings) ? result.stage.validation.structural.findings : [];
  const validation = Array.isArray(result?.stage?.validation?.findings) ? result.stage.validation.findings : [];
  const stage = Array.isArray(result?.stage?.findings) ? result.stage.findings : [];
  const preferred = [...structural, ...validation, ...stage];
  const candidates = preferred.length ? preferred : collectNestedAuthorFindings([result.audit, result.stage]);
  const seen = new Set();
  const out = [];
  for (const finding of candidates) {
    if (!finding || (finding.severity !== 'error' && finding.severity !== 'warning')) continue;
    const key = authorFindingKey(finding);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(finding);
  }
  return out;
}

function authorMissingHeadings(findings = []) {
  const out = [];
  const byHeading = new Map();
  for (const finding of findings) {
    if (finding.code !== 'portable.contract.heading.required.missing') continue;
    const heading = String(finding.heading || (finding.section ? `## ${finding.section}` : headingFromMessage(finding.message)) || '').trim();
    if (!heading) continue;
    const key = authorFindingKey(finding);
    if (!byHeading.has(heading)) {
      const entry = { heading, code: String(finding.code || ''), message: String(finding.message || ''), findingKeys: [key] };
      byHeading.set(heading, entry);
      out.push(entry);
    } else byHeading.get(heading).findingKeys.push(key);
  }
  return out;
}

function authorMissingOrdinaryFields(findings = []) {
  const byHeading = new Map();
  for (const finding of findings) {
    if (finding.code !== 'portable.contract.ordinary.field.required.missing' && finding.code !== 'portable.contract.field.required.missing' && finding.code !== 'portable.contract.conditional.field.required.missing') continue;
    const heading = String(finding.heading || finding.group || '').trim();
    const field = String(finding.field || fieldFromMessage(finding.message) || '').trim();
    const groupKey = heading || '(artifact body)';
    if (!field) continue;
    if (!byHeading.has(groupKey)) byHeading.set(groupKey, { heading: groupKey, fields: [], findingKeys: [] });
    const group = byHeading.get(groupKey);
    if (!group.fields.some((entry) => entry.field === field)) group.fields.push(Object.freeze({ field, code: String(finding.code || ''), message: String(finding.message || '') }));
    group.findingKeys.push(authorFindingKey(finding));
  }
  return [...byHeading.values()];
}

function authorMissingDeclarationFields(findings = []) {
  const byEntry = new Map();
  for (const finding of findings) {
    if (finding.code !== 'portable.contract.declaration.field.required.missing') continue;
    const group = String(finding.group || '').trim();
    const entry = String(finding.entry || '').trim();
    const field = String(finding.field || fieldFromMessage(finding.message) || '').trim();
    if (!field) continue;
    const key = `${group}\0${entry}`;
    if (!byEntry.has(key)) byEntry.set(key, { group, entry, fields: [], findingKeys: [] });
    const target = byEntry.get(key);
    if (!target.fields.some((item) => item.field === field)) target.fields.push(Object.freeze({ field, code: String(finding.code || ''), message: String(finding.message || '') }));
    target.findingKeys.push(authorFindingKey(finding));
  }
  return [...byEntry.values()];
}

function compactAuthorFinding(finding = {}) {
  return Object.freeze({
    severity: String(finding.severity || ''),
    code: String(finding.code || ''),
    message: String(finding.message || ''),
    ...(finding.group ? { group: String(finding.group) } : {}),
    ...(finding.entry ? { entry: String(finding.entry) } : {}),
    ...(finding.field ? { field: String(finding.field) } : {}),
    ...(finding.heading ? { heading: String(finding.heading) } : {})
  });
}

function collectNestedAuthorFindings(values = []) {
  const out = [];
  const visit = (value) => {
    if (Array.isArray(value)) { for (const item of value) visit(item); return; }
    if (!value || typeof value !== 'object') return;
    if ((value.severity === 'error' || value.severity === 'warning') && value.code && value.message) out.push(value);
    for (const item of Object.values(value)) visit(item);
  };
  visit(values);
  return out;
}

function authorFindingKey(finding = {}) {
  return [finding.severity, finding.code, finding.message]
    .map((value) => String(value || ''))
    .join('\0');
}

function redundantSchemaSectionFinding(finding = {}, sections = new Set()) {
  const code = String(finding.code || '');
  if (code === 'portable.contract.section.required.missing') return true;
  const match = String(finding.message || '').match(/Missing required (?:evidence|handoff) section:\s*(.+?)\.?$/i);
  return Boolean(match && sections.has(match[1].replace(/\.$/, '').trim()));
}

function headingFromMessage(message = '') {
  const match = String(message || '').match(/:\s*(##\s+.+?)\.?$/);
  return match ? match[1].replace(/\.$/, '').trim() : '';
}

function fieldFromMessage(message = '') {
  const match = String(message || '').match(/:\s*([^:.]+?)\.?$/);
  return match ? match[1].replace(/\.$/, '').trim() : '';
}

function authorCommandLine(parsed = {}) {
  const commandPrefix = String(parsed.commandPrefix || 'node tools/tiinex-portable.mjs').trim();
  const args = [String(parsed.surfaceCommand || 'author')];
  for (const positional of parsed.positionals || []) args.push(String(positional));
  for (const [key, value] of Object.entries(parsed.flags || {})) {
    if (key === 'help' || key === 'full') continue;
    args.push(`--${key}`);
    if (value !== true) args.push(String(value));
  }
  return `${commandPrefix} ${args.map(shellQuote).join(' ')}`;
}

function shellQuote(value = '') {
  const text = String(value || '');
  if (/^[A-Za-z0-9_./:@%+=,-]+$/.test(text)) return text;
  return `'${text.replace(/'/g, `'"'"'`)}'`;
}
