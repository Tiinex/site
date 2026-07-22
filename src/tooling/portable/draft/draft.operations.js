import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { runAudit } from '../../../audit/audit.run.js';
import { createRecordFromMarkdown } from '../../../artifacts/artifact.record.js';
import { portableFinding, normalizePortableFinding, summarizePortableFindings } from '../findings.js';
import { findSchemaMaterial } from '../input/portable.input.js';
import { buildPortableSchemaGuide } from '../schema/schema.guide.js';
import { conditionalContractGroups, parsePortableSchemaDocument, requiredSchemaFields, requiredSchemaSections } from '../schema/schema.contract.js';

export function validatePortableDraft(input = {}, options = {}) {
  const markdown = String(input.markdown || input.draft?.markdown || '');
  const path = String(input.path || input.draft?.path || 'draft.md');
  const requestedSchema = String(input.schemaId || options.schemaId || '').trim();
  const findings = [];
  if (!markdown) findings.push(portableFinding('error', 'portable.draft.markdown.required', 'Draft validation requires Markdown content.', { ref: path }));
  const record = createRecordFromMarkdown(markdown, { path, name: path, sourceMode: 'portable-local-draft', lifecycleStatus: 'draft' });
  const audit = runAudit({ record, markdown });
  const parsed = safeParse(markdown);
  const declaredSchema = String(parsed.envelope?.current?.schema?.id || record.schemaId || '').trim();
  if (requestedSchema && declaredSchema !== requestedSchema) findings.push(portableFinding('error', 'portable.draft.schema.mismatch', 'Draft Current Schema does not match the requested schema.', { requestedSchema, declaredSchema, ref: path }));
  findings.push(...(audit.findings || []).map((finding) => normalizePortableFinding(finding, { ref: path })));
  const schemaMaterial = findSchemaMaterial(requestedSchema || declaredSchema, input.materials || input);
  let structural = null;
  if (schemaMaterial?.markdown) {
    structural = validateContractStructure(markdown, schemaMaterial.markdown, requestedSchema || declaredSchema, path);
    findings.push(...structural.findings);
    if (structural.conditionalRequirements.length) findings.push(portableFinding('info', 'portable.draft.conditional-review.required', 'The readable schema contains conditional requirements that require trigger-aware review; they were not treated as unconditional failures.', {
      schemaId: requestedSchema || declaredSchema,
      groups: structural.conditionalRequirements.map((entry) => entry.name),
      ref: path
    }));
  } else {
    findings.push(portableFinding('info', 'portable.draft.contract-structure.unavailable', 'Readable child schema material was not supplied, so contract-driven structural validation was not run.', { schemaId: requestedSchema || declaredSchema, ref: path }));
  }
  const exactRuntimeValidation = Boolean(
    !audit.resolution?.fallbackUsed
    && typeof audit.resolution?.module?.validate === 'function'
    && audit.status === 'readable'
    && !findings.some((finding) => finding.code === 'audit.validator.unavailable')
  );
  const summary = summarizePortableFindings(findings);
  return Object.freeze({
    schema: 'tiinex.portable.draft-validation.v1',
    path,
    requestedSchema,
    declaredSchema,
    status: summary.counts.error ? 'invalid' : summary.counts.warning ? 'degraded' : 'clean',
    audit: sanitizeAudit(audit),
    structural,
    qualification: Object.freeze({
      exactRuntimeValidation,
      contractDrivenStructuralValidation: Boolean(structural),
      readableSchemaAvailable: Boolean(schemaMaterial),
      fallbackUsed: Boolean(audit.resolution?.fallbackUsed),
      limitations: Object.freeze([
        ...(audit.resolution?.fallbackUsed ? ['Runtime audit used Root fallback and does not prove child-schema validity.'] : []),
        ...(structural ? ['Contract-driven checks cover explicit required sections/fields, not all prose semantics.'] : ['Readable schema contract was unavailable.'])
      ])
    }),
    findings: Object.freeze(findings),
    findingSummary: summary
  });
}

export function explainPortableFindings(input = {}) {
  const findings = extractFindings(input).map((finding) => normalizePortableFinding(finding));
  const explanations = findings.map((finding) => Object.freeze({
    severity: finding.severity,
    code: finding.code,
    message: finding.message,
    blocking: finding.severity === 'error',
    category: findingCategory(finding),
    likelyOwner: findingOwner(finding),
    recommendedAction: recommendedAction(finding),
    preserveBoundary: boundaryWarning(finding)
  }));
  return Object.freeze({
    schema: 'tiinex.portable.finding-explanation.v1',
    explanations: Object.freeze(explanations),
    findingSummary: summarizePortableFindings(findings)
  });
}

export function buildPortableRepairPlan(input = {}) {
  const explanation = explainPortableFindings(input);
  const steps = [];
  const seen = new Set();
  for (const item of explanation.explanations) {
    const key = `${item.category}:${item.recommendedAction}`;
    if (seen.has(key)) continue;
    seen.add(key);
    steps.push(Object.freeze({
      order: steps.length + 1,
      priority: item.blocking ? 'blocking' : item.severity === 'warning' ? 'important' : 'optional',
      category: item.category,
      action: item.recommendedAction,
      codes: Object.freeze(explanation.explanations.filter((entry) => entry.category === item.category && entry.recommendedAction === item.recommendedAction).map((entry) => entry.code)),
      constraint: item.preserveBoundary
    }));
  }
  steps.sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority) || a.order - b.order);
  return Object.freeze({
    schema: 'tiinex.portable.repair-plan.v1',
    status: explanation.findingSummary.status,
    steps: Object.freeze(steps.map((step, index) => Object.freeze({ ...step, order: index + 1 }))),
    boundary: Object.freeze({
      automaticRewrite: false,
      preserveUnknownSections: true,
      preserveSourceAndContinuity: true,
      claimExactQualificationAfterRepair: false
    }),
    findingSummary: explanation.findingSummary
  });
}

function validateContractStructure(draftMarkdown, schemaMarkdown, schemaId, path) {
  const document = parsePortableSchemaDocument(schemaMarkdown);
  const requiredSections = requiredSchemaSections(document);
  const requiredFields = requiredSchemaFields(document);
  const conditionalRequirements = conditionalContractGroups(document.validation);
  const headings = markdownHeadings(draftMarkdown);
  const fields = markdownFields(draftMarkdown);
  const missingSections = requiredSections.filter((section) => !headings.has(normalizeKey(section)));
  const missingFields = requiredFields.filter((field) => !fields.has(normalizeKey(field)));
  const findings = [
    ...missingSections.map((section) => portableFinding('error', 'portable.draft.section.required.missing', `Required section is missing: ${section}.`, { schemaId, section, ref: path })),
    ...missingFields.map((field) => portableFinding('error', 'portable.draft.field.required.missing', `Required field is missing: ${field}.`, { schemaId, field, ref: path }))
  ];
  return Object.freeze({
    schema: 'tiinex.portable.contract-structure-validation.v1',
    schemaId,
    requiredSections: Object.freeze(requiredSections),
    requiredFields: Object.freeze(requiredFields),
    missingSections: Object.freeze(missingSections),
    missingFields: Object.freeze(missingFields),
    conditionalRequirements,
    findings: Object.freeze(findings)
  });
}

function markdownHeadings(markdown = '') {
  const values = new Set();
  let fenced = false;
  for (const line of String(markdown || '').split(/\r?\n/)) {
    if (/^\s*```/.test(line)) { fenced = !fenced; continue; }
    if (fenced) continue;
    const match = line.match(/^#{1,6}\s+(.+?)\s*$/);
    if (match) values.add(normalizeKey(match[1]));
  }
  return values;
}

function markdownFields(markdown = '') {
  const values = new Set();
  let fenced = false;
  for (const line of String(markdown || '').split(/\r?\n/)) {
    if (/^\s*```/.test(line)) { fenced = !fenced; continue; }
    if (fenced) continue;
    const match = line.match(/^\s*-\s+([^:]+):/);
    if (match) values.add(normalizeKey(match[1]));
  }
  return values;
}

function sanitizeAudit(audit = {}) {
  return Object.freeze({
    status: audit.status || '',
    resolution: Object.freeze({
      status: audit.resolution?.status || '',
      moduleId: audit.resolution?.module?.id || audit.artifact?.moduleId || '',
      fallbackUsed: Boolean(audit.resolution?.fallbackUsed || audit.artifact?.fallbackUsed),
      unresolvedSchemaId: audit.resolution?.unresolvedSchemaId || ''
    }),
    summary: audit.summary || null,
    findings: Object.freeze((audit.findings || []).map((finding) => normalizePortableFinding(finding)))
  });
}

function extractFindings(input = {}) {
  if (Array.isArray(input)) return input;
  if (Array.isArray(input.findings)) return input.findings;
  if (Array.isArray(input.audit?.findings)) return input.audit.findings;
  if (Array.isArray(input.validation?.findings)) return input.validation.findings;
  return [];
}

function findingCategory(finding = {}) {
  const code = String(finding.code || '').toLowerCase();
  if (code.includes('schema')) return 'schema';
  if (code.includes('parent') || code.includes('trace') || code.includes('lineage')) return 'continuity';
  if (code.includes('origin') || code.includes('source') || code.includes('boundary')) return 'provenance';
  if (code.includes('integrity') || code.includes('checksum')) return 'integrity';
  if (code.includes('section') || code.includes('field') || code.includes('shape')) return 'structure';
  return 'content-or-policy';
}

function findingOwner(finding = {}) {
  const category = findingCategory(finding);
  if (category === 'schema') return 'schema selection or schema companion';
  if (category === 'continuity') return 'artifact continuity envelope';
  if (category === 'provenance') return 'artifact origin/source boundary';
  if (category === 'integrity') return 'integrity generation/verification tooling';
  if (category === 'structure') return 'artifact body writer';
  return 'human or LLM writer with schema guidance';
}

function recommendedAction(finding = {}) {
  const category = findingCategory(finding);
  if (category === 'schema') return 'Confirm the intended schema and obtain its readable canonical contract before rewriting the body.';
  if (category === 'continuity') return 'Repair only the declared Parent/Trace/continuity fields using known loaded material; do not invent a parent.';
  if (category === 'provenance') return 'State the known origin/source boundary explicitly and preserve unknown or local status.';
  if (category === 'integrity') return 'Regenerate integrity only with the maintained integrity tool after content is final.';
  if (category === 'structure') return 'Add or correct the named required section/field without removing unknown supplied content.';
  return 'Review the relevant schema rule and make the smallest local change that resolves the finding.';
}

function boundaryWarning(finding = {}) {
  const category = findingCategory(finding);
  if (category === 'continuity') return 'Never guess a parent or convert Origin into Parent.';
  if (category === 'provenance') return 'Never infer GitHub/source-backed status for local material.';
  if (category === 'integrity') return 'Do not hand-edit integrity values.';
  return 'Preserve unknown sections and unrelated content.';
}

function priorityRank(value = '') {
  return value === 'blocking' ? 0 : value === 'important' ? 1 : 2;
}

function normalizeKey(value = '') {
  return String(value || '').toLowerCase().replace(/[`*_#]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

function safeParse(markdown = '') {
  try { return parseArtifactMarkdown(markdown); }
  catch { return { envelope: {} }; }
}
