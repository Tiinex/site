import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { runAudit } from '../../../audit/audit.run.js';
import { createRecordFromMarkdown } from '../../../artifacts/artifact.record.js';
import { portableFinding, normalizePortableFinding, summarizePortableFindings } from '../findings.js';
import { selectPortableLoadedSchemaMaterial } from '../providers/schema.providers.js';
import { buildPortableSchemaGuide } from '../schema/schema.guide.js';
import { compilePortableSchemaContract } from '../schema/contract.compile.js';
import { validatePortableContractInstance } from '../schema/contract.validate.js';

export function validatePortableDraft(input = {}, options = {}) {
  const markdown = String(input.markdown || input.draft?.markdown || '');
  const path = String(input.path || input.draft?.path || 'draft.md');
  const requestedSchema = String(input.schemaId || options.schemaId || '').trim();
  const findings = [];
  if (!markdown) findings.push(portableFinding('error', 'portable.draft.markdown.required', 'Draft validation requires Markdown content.', { ref: path }));
  const record = createRecordFromMarkdown(markdown, { path, name: path, sourceMode: 'portable-local-draft', lifecycleStatus: 'draft' });
  const audit = runAudit({ record, markdown, schemaReferenceAuthorities: input.schemaReferenceAuthorities || null });
  const parsed = safeParse(markdown);
  const declaredSchema = String(parsed.envelope?.current?.schema?.id || record.schemaId || '').trim();
  if (requestedSchema && declaredSchema !== requestedSchema) findings.push(portableFinding('error', 'portable.draft.schema.mismatch', 'Draft Current Schema does not match the requested schema.', { requestedSchema, declaredSchema, ref: path }));
  const sharedParserQuirks = detectSharedParserQuirks(markdown, parsed, audit, path);
  const suppressedAuditCodes = new Set(sharedParserQuirks.flatMap((quirk) => quirk.suppressedCodes || []));
  findings.push(...(audit.findings || [])
    .filter((finding) => !suppressedAuditCodes.has(finding.code))
    .map((finding) => normalizePortableFinding(finding, { ref: path })));
  for (const quirk of sharedParserQuirks) findings.push(portableFinding('info', quirk.code, quirk.message, { ref: path, suppressedCodes: quirk.suppressedCodes, owner: quirk.owner }));
  const schemaSelection = selectPortableLoadedSchemaMaterial(input.materials || input, { schemaId: requestedSchema || declaredSchema });
  findings.push(...schemaSelection.findings);
  const schemaMaterial = schemaSelection.material || null;
  let structural = null;
  if (audit.contractValidation?.available) {
    structural = sharedContractValidationReceipt(audit.contractValidation, path);
  } else if (schemaMaterial?.markdown) {
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
  const exactCreationValidation = input.exactCreationValidation || null;
  const exactRuntimeValidation = Boolean(
    exactCreationValidation?.ok === true
    && !audit.resolution?.fallbackUsed
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
    sharedParserQuirks: Object.freeze(sharedParserQuirks),
    structural,
    qualification: Object.freeze({
      exactRuntimeValidation,
      contractDrivenStructuralValidation: Boolean(structural),
      readableSchemaAvailable: Boolean(schemaMaterial),
      fallbackUsed: Boolean(audit.resolution?.fallbackUsed),
      limitations: Object.freeze([
        ...(audit.resolution?.fallbackUsed ? ['Runtime audit used Root fallback and does not prove child-schema validity.'] : []),
        ...(sharedParserQuirks.length ? ['The shared parser currently leaks Current.CreatedAt into Parent when no Parent block exists; raw audit findings are preserved, but parser-induced parent repair findings are excluded from portable repair guidance.'] : []),
        ...(audit.contractValidation?.available ? ['Semantic contract validity was evaluated from the qualified current Root/descendant compiled machine-contract projection.'] : structural ? ['Only supplied readable-schema structural checks were available; complete current Root/descendant compiled contract authority was unavailable.'] : ['Readable schema contract was unavailable.']),
        ...(!exactCreationValidation ? ['Exact canonical creation/reference/integrity validation evidence was not supplied; exactRuntimeValidation remains false.'] : [])
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

function detectSharedParserQuirks(markdown, parsed, audit, path) {
  const quirks = [];
  const parentBlockDeclared = /^-\s+Parent\s*$/m.test(String(markdown || ''));
  const parent = parsed.envelope?.parent || {};
  const current = parsed.envelope?.current || {};
  const leakedCurrentCreatedAt = !parentBlockDeclared
    && !parent.schema?.id
    && !parent.trace
    && !parent.origin
    && Boolean(parent.createdAt)
    && parent.createdAt === current.createdAt;
  const parentWarningCodes = ['root.parent.schema.missing', 'root.parent.trace.missing', 'root.parent.origin.missing'];
  const auditCodes = new Set((audit.findings || []).map((finding) => finding.code));
  if (leakedCurrentCreatedAt && parentWarningCodes.some((code) => auditCodes.has(code))) {
    quirks.push(Object.freeze({
      code: 'portable.draft.shared-parser.parent-block-fallback',
      message: 'The shared artifact parser treated Current.CreatedAt as Parent.CreatedAt because no Parent block was present. Portable repair guidance excludes the resulting parent warnings so an LLM is not encouraged to invent lineage.',
      owner: 'src/artifacts/artifact.parse.js:blockAfterTopLevelList',
      ref: path,
      suppressedCodes: Object.freeze(parentWarningCodes.filter((code) => auditCodes.has(code)))
    }));
  }
  return Object.freeze(quirks);
}

function validateContractStructure(draftMarkdown, schemaMarkdown, schemaId, path) {
  const compiled = compilePortableSchemaContract(schemaMarkdown);
  const validation = validatePortableContractInstance({ markdown: draftMarkdown, compiledContract: compiled });
  const missingSections = validation.findings.filter((finding) => finding.code === 'portable.contract.section.required.missing').map((finding) => finding.section);
  const missingFields = validation.findings.filter((finding) => finding.code === 'portable.contract.field.required.missing' || finding.code === 'portable.contract.declaration.field.required.missing').map((finding) => finding.field);
  return Object.freeze({
    schema: 'tiinex.portable.contract-structure-validation.v2',
    schemaId,
    status: validation.status,
    requiredSections: compiled.validation.requiredSections,
    requiredFields: compiled.validation.requiredFields,
    missingSections: Object.freeze(missingSections),
    missingFields: Object.freeze(missingFields),
    conditionalRequirements: compiled.validation.conditionalRequirements,
    compiledContractSchema: compiled.schema,
    findings: Object.freeze(validation.findings.map((finding) => normalizePortableFinding(finding, { ref: path })))
  });
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
    validation: audit.validation || null,
    findings: Object.freeze((audit.findings || []).map((finding) => normalizePortableFinding(finding)))
  });
}

function sharedContractValidationReceipt(contractValidation = {}, path = '') {
  const result = contractValidation.result || {};
  return Object.freeze({
    schema: 'tiinex.portable.contract-structure-validation.v3',
    schemaId: contractValidation.schemaId || '',
    status: result.status || contractValidation.state || 'unresolved',
    authority: 'qualified-current-root-descendant-compiled-contract',
    lineage: Object.freeze([...(contractValidation.lineage || [])]),
    missingSections: Object.freeze((result.findings || []).filter((finding) => finding.code === 'portable.contract.section.required.missing').map((finding) => finding.section || '')),
    missingFields: Object.freeze((result.findings || []).filter((finding) => String(finding.code || '').includes('field.required.missing')).map((finding) => finding.field || '')),
    conditionalRequirements: Object.freeze([...(contractValidation.conditionalRequirements || [])].map((entry) => Object.freeze({ ...entry, name: entry.name || entry.group || '' }))),
    findings: Object.freeze((result.findings || []).map((finding) => normalizePortableFinding(finding, { ref: path })))
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
